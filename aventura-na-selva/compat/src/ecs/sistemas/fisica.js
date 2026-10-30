// Gerado a partir de src/ecs/sistemas/fisica.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/sistemas/fisica.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
const { resolverX, resolverY } = usar("src/ecs/sistemas/colisao.js");
const { pousarEmPlataformas } = usar("src/ecs/sistemas/plataformas.js");
function atualizarFisica(jogador, mundo, dt, eventos) {
  const t = jogador.transformacao, corpo = jogador.corpo;
  t.anteriorX = t.x; t.anteriorY = t.y;
  const estavaNoChao = corpo.noChao;
  corpo.vy = Math.min(jogador.planando ? 130 : C.quedaMaxima, corpo.vy + C.gravidade * (jogador.planando ? .14 : 1) * dt);
  t.x += corpo.vx * dt;
  resolverX(jogador, mundo);
  corpo.noChao = false;
  t.y += corpo.vy * dt;
  resolverY(jogador, mundo);
  pousarEmPlataformas(jogador, mundo);
  if (!estavaNoChao && corpo.noChao) {
    jogador.animacao.escalaY = 0.77;
    eventos.emitir('pousou', jogador);
  }
}

Object.defineProperty(exports, "atualizarFisica", { enumerable: true, get: () => atualizarFisica });
});
