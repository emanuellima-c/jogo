import { CONFIG } from './configuracoes.js';

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

export { criarSessao, sessao, exporEstadoGlobal, reiniciarSessao, pontuar };
