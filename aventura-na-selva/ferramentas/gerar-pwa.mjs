import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';

import { modulosEmUso } from './modulos-em-uso.mjs';

const raiz = new URL('../', import.meta.url);
const verificar = process.argv.includes('--verificar');
async function listar(pasta, extensao) {
  const arquivos = [];
  for (const entrada of await readdir(new URL(pasta, raiz), { withFileTypes: true })) {
    const nome = pasta + entrada.name;
    if (entrada.isDirectory()) arquivos.push(...await listar(nome + '/', extensao));
    else if (nome.endsWith(extensao)) arquivos.push(nome);
  }
  return arquivos;
}

const manifesto = JSON.parse(await readFile(new URL('manifest.webmanifest', raiz), 'utf8'));
const arquivos = [
  'index.html', 'iniciar.js', 'manifest.webmanifest',
  ...manifesto.icons.map(icone => icone.src),
  'css/santuarios.css', 'css/sinais.css',
  ...await listar('arte/cinzas/', '.webp'), ...await listar('arte/cinzas/', '.png'),
  ...await listar('arte/fontes/', '.ttf'), ...await listar('arte/fontes/', '.woff2'),
  ...await modulosEmUso()
].sort();
const modelo = await readFile(new URL('ferramentas/service-worker.modelo.js', raiz), 'utf8');
const hash = createHash('sha256').update(modelo);
for (const nome of arquivos) {
  hash.update(nome).update('\0').update(await readFile(new URL(nome, raiz))).update('\0');
}
const rotas = arquivos.map(nome => nome === 'index.html' ? './' : './' + nome);
const codigo = '// Gerado por npm run preparar a partir do modelo e dos arquivos do jogo.\n' +
  'const VERSAO_CACHE = ' + JSON.stringify(hash.digest('hex').slice(0, 16)) + ';\n' +
  'const ROTAS = ' + JSON.stringify(rotas, null, 2) + ';\n\n' + modelo;
const saida = new URL('service-worker.js', raiz);
if (verificar) {
  if (await readFile(saida, 'utf8') !== codigo) throw new Error('Cache desatualizado. Execute npm run preparar.');
} else await writeFile(saida, codigo);
console.log(rotas.length + ' recursos da PWA ' + (verificar ? 'verificados.' : 'preparados.'));
