// Gerado por npm run preparar a partir do modelo e dos arquivos do jogo.
const VERSAO_CACHE = "7.0.0-0b4f948e2acc59d8";
const ROTAS = [
  "./arte/cinzas/bento.png",
  "./arte/cinzas/capa.webp",
  "./arte/cinzas/criaturas.png",
  "./arte/cinzas/f01.webp",
  "./arte/cinzas/f02.webp",
  "./arte/cinzas/f03.webp",
  "./arte/cinzas/f04.webp",
  "./arte/cinzas/f05.webp",
  "./arte/cinzas/f06.webp",
  "./arte/cinzas/f07.webp",
  "./arte/cinzas/f08.webp",
  "./arte/cinzas/f09.webp",
  "./arte/cinzas/f10.webp",
  "./arte/cinzas/f11.webp",
  "./arte/cinzas/f12.webp",
  "./arte/cinzas/f13.webp",
  "./arte/cinzas/f14.webp",
  "./arte/cinzas/f15.webp",
  "./arte/cinzas/heroi.png",
  "./arte/cinzas/mesa.webp",
  "./arte/cinzas/oficina.webp",
  "./arte/cinzas/retrato.png",
  "./arte/cinzas/santuario.webp",
  "./arte/cinzas/sigilo.png",
  "./arte/cinzas/sinais.png",
  "./arte/fontes/barlow-semibold.woff2",
  "./arte/fontes/silkscreen-bold.ttf",
  "./css/santuarios.css",
  "./css/sinais.css",
  "./",
  "./iniciar.js",
  "./manifest.webmanifest",
  "./pwa/icone-192.png",
  "./pwa/icone-512.png",
  "./pwa/icone-maskable-512.png",
  "./src/audio/motorAudio.js",
  "./src/audio/trilhas.js",
  "./src/cinzas/ajustes.js",
  "./src/cinzas/ambiente.js",
  "./src/cinzas/aplicacao.js",
  "./src/cinzas/atores-pixel.js",
  "./src/cinzas/cenografia.js",
  "./src/cinzas/combate.js",
  "./src/cinzas/controles-ui.js",
  "./src/cinzas/criaturas-pixel.js",
  "./src/cinzas/entrada.js",
  "./src/cinzas/fases.js",
  "./src/cinzas/fisica.js",
  "./src/cinzas/formas.js",
  "./src/cinzas/inimigos.js",
  "./src/cinzas/jogo.js",
  "./src/cinzas/modos.js",
  "./src/cinzas/niveis-ui.js",
  "./src/cinzas/objetivos.js",
  "./src/cinzas/perfil.js",
  "./src/cinzas/pintura.js",
  "./src/cinzas/poder.js",
  "./src/cinzas/progresso.js",
  "./src/cinzas/som.js",
  "./src/cinzas/telas.js",
  "./src/cinzas/terreno-pixel.js",
  "./src/cinzas/trilhas.js",
  "./src/cinzas/trilhas/deserto.js",
  "./src/cinzas/trilhas/neve.js",
  "./src/cinzas/trilhas/ruinas.js",
  "./src/cinzas/trilhas/selva.js",
  "./src/cinzas/trilhas/vulcao.js",
  "./src/core/aleatorio.js",
  "./src/core/configuracoes.js",
  "./src/core/loopPrincipal.js",
  "./src/core/pwa.js",
  "./src/core/save.js",
  "./src/dados/poderes.js",
  "./src/main.js",
  "./src/meta/progressao.js"
];

const raiz = new URL(self.registration.scope);
const indice = new URL('index.html', raiz);
const prefixoCache = 'aventura-selva:' + raiz.href + ':';
const nomeCache = prefixoCache + VERSAO_CACHE;
const recursos = new Set(ROTAS.map(rota => new URL(rota, raiz).href));

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(nomeCache).then(cache => cache.addAll(
    Array.from(recursos, url => new Request(url, { cache: 'reload', redirect: 'error' }))
  )));
});

self.addEventListener('activate', evento => {
  evento.waitUntil(caches.keys().then(chaves => Promise.all(
    chaves.filter(chave => chave.startsWith(prefixoCache) && chave !== nomeCache).map(chave => caches.delete(chave))
  )).then(() => self.clients.claim()));
});

self.addEventListener('message', evento => {
  if (evento.data === 'ATUALIZAR') evento.waitUntil(self.skipWaiting());
});

async function responderDoCache(pedido, chave) {
  const cache = await caches.open(nomeCache);
  return await cache.match(chave) ?? fetch(pedido);
}

self.addEventListener('fetch', evento => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== raiz.origin) return;
  if (pedido.mode === 'navigate' && (url.pathname === raiz.pathname || url.pathname === indice.pathname)) {
    evento.respondWith(responderDoCache(pedido, raiz.href));
  } else if (recursos.has(url.href)) {
    evento.respondWith(responderDoCache(pedido, url.href));
  }
});
