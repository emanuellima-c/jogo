// Gerado a partir de src/ecs/sistemas/animacao.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/sistemas/animacao.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
function atualizarAnimacao(jogador, dt) {
  const a = jogador.animacao, corpo = jogador.corpo;
  a.tempo += dt;
  a.escalaY += (1 - a.escalaY) * Math.min(1, C.animacaoRetorno * dt);
  if (a.invulneravel > 0) a.estado = 'dano';
  else if (!corpo.noChao) a.estado = corpo.vy < 0 ? 'pulando' : 'caindo';
  else a.estado = Math.abs(corpo.vx) > 8 ? 'andando' : 'parado';
}

Object.defineProperty(exports, "atualizarAnimacao", { enumerable: true, get: () => atualizarAnimacao });
});
