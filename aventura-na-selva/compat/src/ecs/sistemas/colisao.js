// Gerado a partir de src/ecs/sistemas/colisao.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/sistemas/colisao.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
function sobrepoe(a, b) {
  return a.x < b.x + b.largura && a.x + a.largura > b.x &&
    a.y < b.y + b.altura && a.y + a.altura > b.y;
}
function caixaLivre(t, mundo, x) {
  for (let y = Math.floor(t.y / C.tile); y <= Math.floor((t.y + t.altura - C.epsilon) / C.tile); y++) {
    for (let coluna = Math.floor(x / C.tile); coluna <= Math.floor((x + t.largura - C.epsilon) / C.tile); coluna++) {
      if (mundo.solido(coluna, y)) return false;
    }
  }
  return true;
}
function corrigirQuina(jogador, mundo) {
  const t = jogador.transformacao, direcao = jogador.controle.direcao;
  // Pequena assistência no teto: só desloca se a caixa inteira couber no destino.
  for (let ajuste = 1; ajuste <= C.correcaoQuina; ajuste++) {
    if (caixaLivre(t, mundo, t.x + ajuste * direcao)) { t.x += ajuste * direcao; return true; }
    if (caixaLivre(t, mundo, t.x - ajuste * direcao)) { t.x -= ajuste * direcao; return true; }
  }
  return false;
}
// AABB separada por eixo. As velocidades máximas avançam menos de um tile por passo.
function resolverX(jogador, mundo) {
  const t = jogador.transformacao, corpo = jogador.corpo;
  if (corpo.vx === 0) return;
  const coluna = Math.floor((corpo.vx > 0 ? t.x + t.largura - C.epsilon : t.x) / C.tile);
  const inicio = Math.floor(t.y / C.tile), fim = Math.floor((t.y + t.altura - C.epsilon) / C.tile);
  for (let linha = inicio; linha <= fim; linha++) {
    if (mundo.solido(coluna, linha)) {
      t.x = corpo.vx > 0 ? coluna * C.tile - t.largura : (coluna + 1) * C.tile;
      corpo.vx = 0;
      return;
    }
  }
}
function resolverY(jogador, mundo) {
  const t = jogador.transformacao, corpo = jogador.corpo;
  if (corpo.vy === 0) return;
  const descendo = corpo.vy > 0;
  const linha = Math.floor((descendo ? t.y + t.altura - C.epsilon : t.y) / C.tile);
  const inicio = Math.floor(t.x / C.tile), fim = Math.floor((t.x + t.largura - C.epsilon) / C.tile);
  for (let coluna = inicio; coluna <= fim; coluna++) {
    if (mundo.solido(coluna, linha)) {
      if (!descendo && corrigirQuina(jogador, mundo)) return;
      t.y = descendo ? linha * C.tile - t.altura : (linha + 1) * C.tile;
      corpo.vy = 0;
      corpo.noChao = descendo;
      return;
    }
  }
}

Object.defineProperty(exports, "sobrepoe", { enumerable: true, get: () => sobrepoe });
Object.defineProperty(exports, "resolverX", { enumerable: true, get: () => resolverX });
Object.defineProperty(exports, "resolverY", { enumerable: true, get: () => resolverY });
});
