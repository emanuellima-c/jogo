import { CONFIG as C, ACOES as A } from '../../core/configuracoes.js';

/** Coyote e buffer usam o tempo da simulação, portanto ficam congelados na pausa. */
function atualizarMovimento(jogador, entrada, dt, eventos) {
  const corpo = jogador.corpo, controle = jogador.controle;
  const direcao = Number(entrada.ativa(A.direita)) - Number(entrada.ativa(A.esquerda));
  const atributos = jogador.estatisticas;
  const alvo = direcao * (atributos?.velocidade ?? C.velocidade);
  const passo = (direcao ? C.aceleracao : C.atrito) * dt;
  corpo.vx += Math.max(-passo, Math.min(passo, alvo - corpo.vx));
  if (direcao) controle.direcao = direcao;
  if (corpo.noChao) controle.saltosRestantes = atributos?.saltosExtras ?? 0;
  controle.coyote = corpo.noChao ? C.coyote : Math.max(0, controle.coyote - dt);
  controle.buffer = Math.max(0, controle.buffer - dt);
  if (entrada.consumir(A.pular)) controle.buffer = C.buffer;
  if (controle.buffer > 0 && (controle.coyote > 0 || controle.saltosRestantes > 0)) {
    if (controle.coyote <= 0) controle.saltosRestantes--;
    corpo.vy = -(atributos?.impulso ?? C.impulso); corpo.noChao = false;
    controle.buffer = 0; controle.coyote = 0; controle.cortouPulo = false;
    jogador.animacao.escalaY = 1.16;
    eventos.emitir('pulou', jogador);
  }
  if (!entrada.ativa(A.pular) && !controle.cortouPulo && corpo.vy < 0) {
    corpo.vy *= C.cortePulo;
    controle.cortouPulo = true;
  }
}

export { atualizarMovimento };
