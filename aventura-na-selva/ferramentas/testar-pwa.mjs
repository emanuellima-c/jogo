import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { iniciarPwa } from '../src/core/pwa.js';

const raiz = new URL('../', import.meta.url);
const {version:versaoJogo} = JSON.parse(await readFile(new URL('package.json', raiz), 'utf8'));
const manifesto = JSON.parse(await readFile(new URL('manifest.webmanifest', raiz), 'utf8'));
const indice = await readFile(new URL('index.html', raiz), 'utf8');
const readme = await readFile(new URL('README.md', raiz), 'utf8');
assert(indice.match(/<title>[^<]+<\/title>/)?.[0].includes('Edição ' + versaoJogo));
assert(manifesto.description.startsWith('Edição ' + versaoJogo + '.'));
assert(readme.includes('edição ' + versaoJogo + '.'));
assert.equal(manifesto.display, 'standalone');
assert.equal(manifesto.scope, './');
assert.equal(manifesto.start_url, './');
for (const tamanho of [192, 512]) {
  assert(manifesto.icons.some(icone => icone.purpose === 'any' && icone.sizes === tamanho + 'x' + tamanho));
}
assert(manifesto.icons.some(icone => icone.purpose === 'maskable'));
for (const icone of manifesto.icons) {
  const png = await readFile(new URL(icone.src, raiz));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(icone.sizes, png.readUInt32BE(16) + 'x' + png.readUInt32BE(20));
}

const escopo = 'https://exemplo.test/jogo/';
const prefixo = 'aventura-selva:' + escopo + ':';
const ouvintes = new Map(), depositos = new Map();
let online = true, assumirClientes = 0, atualizar = 0;
async function rede(pedido) {
  assert(online, 'Rede indisponível');
  const url = new URL(pedido.url);
  assert(url.href.startsWith(escopo));
  const arquivo = url.pathname.slice(new URL(escopo).pathname.length) || 'index.html';
  return new Response(await readFile(new URL(arquivo, raiz)));
}
const caches = {
  async open(nome) {
    if (!depositos.has(nome)) depositos.set(nome, new Map());
    const deposito = depositos.get(nome);
    return {
      async addAll(pedidos) {
        const respostas = await Promise.all(pedidos.map(rede));
        for (let i = 0; i < pedidos.length; i++) deposito.set(pedidos[i].url, respostas[i]);
      },
      async match(url) { return deposito.get(url)?.clone(); }
    };
  },
  async keys() { return [...depositos.keys()]; },
  async delete(nome) { return depositos.delete(nome); }
};
const self = {
  registration: { scope: escopo },
  addEventListener(tipo, ouvinte) { ouvintes.set(tipo, ouvinte); },
  clients: { async claim() { assumirClientes++; } },
  async skipWaiting() { atualizar++; }
};
const worker = await readFile(new URL('service-worker.js', raiz), 'utf8');
runInNewContext(worker, { self, caches, URL, Request, fetch: rede });
function disparar(tipo, propriedades = {}) {
  let retorno;
  const esperar = promessa => { retorno = promessa; };
  ouvintes.get(tipo)({ ...propriedades, waitUntil: esperar, respondWith: esperar });
  return retorno;
}
const cacheV5 = prefixo + '0123456789abcdef';
const cacheAnterior = prefixo + '6.0.0-fedcba9876543210';
const cacheVizinho = 'aventura-selva:https://exemplo.test/outro-jogo/:0123456789abcdef';
await caches.open(cacheV5);
await caches.open(cacheAnterior);
await caches.open(cacheVizinho);
await caches.open('outro-app');
depositos.get(cacheV5).set(escopo, new Response('Tela da edição anterior'));
await disparar('install');
const prefixoAtual = prefixo + versaoJogo + '-';
const nomeAtual = (await caches.keys()).find(nome => nome.startsWith(prefixoAtual));
assert(nomeAtual && /^[a-f0-9]{16}$/.test(nomeAtual.slice(prefixoAtual.length)));
assert((await caches.keys()).includes(cacheV5), 'O cache anterior ainda atende a aba antes da ativação');
for(const arquivo of depositos.get(nomeAtual).keys()){
  assert(!/^(?:compat\/|ferramentas\/|legado\/|src\/debug\/)/.test(arquivo.slice(escopo.length)));
}
for (const icone of manifesto.icons) assert(depositos.get(nomeAtual).has(escopo + icone.src));
await disparar('activate');
assert.equal(assumirClientes, 1);
assert.deepEqual((await caches.keys()).sort(), [nomeAtual, cacheVizinho, 'outro-app'].sort());

online = false;
const pedido = (nome, mode = 'same-origin', method = 'GET') => ({ url: new URL(nome, escopo).href, mode, method });
const telaOffline = await disparar('fetch', { request: pedido('index.html?test=1', 'navigate') });
assert.equal(await telaOffline.text(), indice);
// As imagens e os módulos viajam na mesma resposta da navegação offline.
assert(indice.includes('"heroi.png":"data:image/png;base64,'));
for (let fase = 1; fase <= 15; fase++) {
  const nome = 'f' + String(fase).padStart(2, '0') + '.webp';
  assert(indice.includes(JSON.stringify(nome) + ':"data:image/webp;base64,'));
}
assert.equal(disparar('fetch', { request: pedido('/fora-do-escopo', 'navigate') }), undefined);
assert.equal(disparar('fetch', { request: pedido('https://fora.test/externo.js') }), undefined);
assert.equal(disparar('fetch', { request: pedido('ferramentas/galeria.html', 'navigate') }), undefined);
assert.equal(disparar('fetch', { request: pedido('ferramentas/testar-pwa.mjs') }), undefined);
assert.equal(disparar('fetch', { request: pedido('./', 'navigate', 'POST') }), undefined);
assert.equal(disparar('message', { data: 'outro' }), undefined);
await disparar('message', { data: 'ATUALIZAR' });
assert.equal(atualizar, 1);

const janela = new EventTarget(), servico = new EventTarget(), registro = new EventTarget();
const elementos = new Map(['painelPwa', 'estadoPwa', 'instalarJogo', 'ajudaPwa', 'atualizarJogo']
  .map(id => [id, Object.assign(new EventTarget(), { hidden: true })]));
const documento = { querySelector: () => ({}), getElementById: id => elementos.get(id) };
let pedidosDeInstalacao = 0, recargas = 0, mensagem = '';
Object.assign(registro, { waiting: { postMessage(valor) { mensagem = valor; } } });
Object.assign(servico, {
  controller: {}, ready: Promise.resolve(registro),
  async register(url, opcoes) { assert.equal(url, './service-worker.js'); assert.equal(opcoes.updateViaCache, 'none'); return registro; }
});
Object.assign(janela, {
  isSecureContext: true, location: { protocol: 'file:', reload() { recargas++; } },
  navigator: { serviceWorker: servico }, matchMedia: () => ({ matches: false })
});
assert.equal(iniciarPwa(janela, documento), undefined);
assert.equal(elementos.get('painelPwa').hidden, true);
janela.location.protocol = 'https:';
await iniciarPwa(janela, documento);
assert.equal(elementos.get('estadoPwa').textContent, 'Pronto para jogar offline');
const instalar = elementos.get('instalarJogo');
instalar.dispatchEvent(new Event('click'));
assert.equal(elementos.get('ajudaPwa').hidden, false);
const antesDeInstalar = new Event('beforeinstallprompt', { cancelable: true });
antesDeInstalar.prompt = async () => { pedidosDeInstalacao++; };
janela.dispatchEvent(antesDeInstalar);
assert.equal(antesDeInstalar.defaultPrevented, true);
instalar.dispatchEvent(new Event('click'));
assert.equal(pedidosDeInstalacao, 1);
janela.dispatchEvent(new Event('appinstalled'));
assert.equal(instalar.hidden, true);
elementos.get('atualizarJogo').dispatchEvent(new Event('click'));
assert.equal(mensagem, 'ATUALIZAR');
servico.dispatchEvent(new Event('controllerchange'));
assert.equal(recargas, 1);

console.log('PWA verificada: manifesto e ícones, precache, navegação offline, instalação, atualização e limpeza de versões.');
