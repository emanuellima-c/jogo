// Gerado a partir de src/core/estado.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/estado.js", function (exports, usar) {
"use strict";
const { CONFIG } = usar("src/core/configuracoes.js");
function criarSessao() {
  return { pontos: 0, vidas: CONFIG.vidasIniciais, faseAtual: 1, recorde: 0 };
}
// Fonte única de pontos e vidas. Os quatro nomes também ficam disponíveis globalmente.
const sessao = criarSessao();
function exporEstadoGlobal() {
  for (const chave of ['pontos', 'vidas', 'faseAtual', 'recorde']) {
    Object.defineProperty(globalThis, chave, { configurable: true, get: () => sessao[chave] });
  }
}
function reiniciarSessao(estado) {
  estado.pontos = 0;
  estado.vidas = CONFIG.vidasIniciais;
  estado.faseAtual = 1;
}
function pontuar(estado, valor) {
  if (Number.isFinite(valor) && valor > 0) estado.pontos += Math.floor(valor);
  estado.recorde = Math.max(estado.recorde, estado.pontos);
}

Object.defineProperty(exports, "criarSessao", { enumerable: true, get: () => criarSessao });
Object.defineProperty(exports, "sessao", { enumerable: true, get: () => sessao });
Object.defineProperty(exports, "exporEstadoGlobal", { enumerable: true, get: () => exporEstadoGlobal });
Object.defineProperty(exports, "reiniciarSessao", { enumerable: true, get: () => reiniciarSessao });
Object.defineProperty(exports, "pontuar", { enumerable: true, get: () => pontuar });
});
