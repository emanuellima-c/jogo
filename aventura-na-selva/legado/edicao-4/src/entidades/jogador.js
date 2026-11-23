import { transformacao, corpo, controle, animacao } from '../ecs/componentes.js';

// Composição: sistemas operam nos componentes, sem herança de uma classe monolítica.
function criarJogador(x, y) {
  return { tipo: 'jogador', transformacao: transformacao(x, y), corpo: corpo(), controle: controle(), animacao: animacao(),
    estatisticas: null, combate: { esperaAtaque: 0, esperaRepeticao: 0, ataque: 0, tipoAtaque: '', numeroGolpe: 0,
      golpeCombo: 0, janelaCombo: 0, bufferAtaque: 0, pedidoPogo: false,
      esperaDash: 0, dash: 0,
      escudo: false, esperaEscudo: 0, fenix: 0, acertos: 0, seiva: 0 } };
}
function cancelarAtaque(combate) {
  combate.ataque = 0; combate.tipoAtaque = '';
  combate.golpeCombo = 0; combate.janelaCombo = 0; combate.bufferAtaque = 0;
}
function posicionarJogador(jogador, x, y) {
  const t = jogador.transformacao, c = jogador.corpo, entrada = jogador.controle;
  t.x = t.anteriorX = x; t.y = t.anteriorY = y;
  c.vx = 0; c.vy = 0; c.noChao = false;
  entrada.coyote = 0; entrada.buffer = 0; entrada.cortouPulo = true; entrada.direcao = 1;
  entrada.saltosRestantes = 0;
  jogador.animacao.escalaY = 1;
  jogador.planando = false;
  cancelarAtaque(jogador.combate);
  jogador.combate.dash = 0;
}

export { criarJogador, posicionarJogador, cancelarAtaque };
