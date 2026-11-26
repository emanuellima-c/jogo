import { CONFIG as C } from '../../core/configuracoes.js';

/** O if impede que uma colisão repetida retire várias vidas. */
function aplicarDano(jogador, estado, eventos) {
  if (jogador.animacao.invulneravel > 0 || estado.vidas <= 0) return false;
  estado.vidas = Math.max(0, estado.vidas - 1);
  jogador.animacao.invulneravel = C.invulnerabilidade;
  jogador.animacao.flash = 0.12;
  eventos.emitir('dano', jogador);
  return true;
}
function atualizarDano(jogador, dt) {
  jogador.animacao.invulneravel = Math.max(0, jogador.animacao.invulneravel - dt);
  jogador.animacao.flash = Math.max(0, jogador.animacao.flash - dt);
}

export { aplicarDano, atualizarDano };
