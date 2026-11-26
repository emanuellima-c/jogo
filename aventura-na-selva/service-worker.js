// Gerado por npm run preparar a partir do modelo e dos arquivos do jogo.
const VERSAO_CACHE = "7.0.0-59049c74108d526e";
const ROTAS = [
  "./",
  "./manifest.webmanifest",
  "./pwa/icone-192.png",
  "./pwa/icone-512.png",
  "./pwa/icone-maskable-512.png"
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
