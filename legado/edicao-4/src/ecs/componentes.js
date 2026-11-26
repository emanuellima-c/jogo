import { CONFIG as C } from '../core/configuracoes.js';
function transformacao(x, y) {
  return { x, y, anteriorX: x, anteriorY: y, largura: C.larguraJogador, altura: C.alturaJogador };
}
function corpo() { return { vx: 0, vy: 0, noChao: false }; }
function controle() { return { coyote: 0, buffer: 0, cortouPulo: true, direcao: 1, saltosRestantes: 0 }; }
function animacao() { return { estado: 'parado', tempo: 0, escalaY: 1, invulneravel: 0, flash: 0 }; }

export { transformacao, corpo, controle, animacao };
