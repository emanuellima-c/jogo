// Gerado a partir de src/entidades/jogador.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/entidades/jogador.js", function (exports, usar) {
"use strict";
const { transformacao, corpo, controle, animacao } = usar("src/ecs/componentes.js");
// Composição: sistemas operam nos componentes, sem herança de uma classe monolítica.
function criarJogador(x, y) {
  return { tipo: 'jogador', transformacao: transformacao(x, y), corpo: corpo(), controle: controle(), animacao: animacao(),
    estatisticas: null, combate: { esperaAtaque: 0, ataque: 0, esperaDash: 0, dash: 0, numeroGolpe: 0,
      escudo: false, esperaEscudo: 0, fenix: 0, acertos: 0, seiva: 0 } };
}
function posicionarJogador(jogador, x, y) {
  const t = jogador.transformacao, c = jogador.corpo, entrada = jogador.controle;
  t.x = t.anteriorX = x; t.y = t.anteriorY = y;
  c.vx = 0; c.vy = 0; c.noChao = false;
  entrada.coyote = 0; entrada.buffer = 0; entrada.cortouPulo = true; entrada.direcao = 1;
  entrada.saltosRestantes = 0;
  jogador.animacao.escalaY = 1;
}

Object.defineProperty(exports, "criarJogador", { enumerable: true, get: () => criarJogador });
Object.defineProperty(exports, "posicionarJogador", { enumerable: true, get: () => posicionarJogador });
});
