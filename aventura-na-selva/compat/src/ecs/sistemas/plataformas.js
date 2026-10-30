// Gerado a partir de src/ecs/sistemas/plataformas.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/sistemas/plataformas.js", function (exports, usar) {
"use strict";
/** Plataformas de mão única. O delta de movimento carrega o jogador que está apoiado. */
function atualizarPlataformas(mundo, dt) {
  const j = mundo.jogador, t = j.transformacao;
  for (let i = 0; i < mundo.plataformas.length; i++) {
    const p = mundo.plataformas[i]; p.anteriorX = p.x; p.anteriorY = p.y;
    if (p.tipo === 'fragil' && p.acionada) {
      p.espera += dt;
      if (p.espera > .6) { p.vy += 1200 * dt; p.y += p.vy * dt; }
      if (p.y > mundo.altura + 100 && p.espera > 4) { p.x = p.origemX; p.y = p.origemY; p.acionada = false; p.espera = 0; p.vy = 0; }
    } else if (p.tipo === 'horizontal' || p.tipo === 'vertical') {
      const eixo = p.tipo === 'horizontal' ? 'x' : 'y';
      p[eixo] += p.direcao * p.velocidade * dt;
      if (p[eixo] >= p.max) { p[eixo] = p.max; p.direcao = -1; }
      else if (p[eixo] <= p.min) { p[eixo] = p.min; p.direcao = 1; }
    }
    if (j.corpo.noChao && Math.abs(t.y + t.altura - p.anteriorY) < 2 &&
      t.x + t.largura > p.anteriorX && t.x < p.anteriorX + p.largura && (p.tipo !== 'fragil' || p.y < p.origemY + 24)) {
      t.x += p.x - p.anteriorX; t.y += p.y - p.anteriorY;
    }
  }
}
function pousarEmPlataformas(jogador, mundo) {
  const t = jogador.transformacao;
  if (jogador.corpo.vy < 0 || !mundo.plataformas) return;
  const baseAnterior = t.anteriorY + t.altura, base = t.y + t.altura;
  let maisAlta = null;
  for (let i = 0; i < mundo.plataformas.length; i++) {
    const p = mundo.plataformas[i];
    if (p.y > p.origemY + 24 && p.tipo === 'fragil') continue;
    if (t.x + t.largura > p.x && t.x < p.x + p.largura && baseAnterior <= p.anteriorY + 2 && base >= p.y && (!maisAlta || p.y < maisAlta.y)) maisAlta = p;
  }
  if (maisAlta) {
    t.y = maisAlta.y - t.altura; jogador.corpo.vy = 0; jogador.corpo.noChao = true;
    if (maisAlta.tipo === 'fragil') maisAlta.acionada = true;
  }
}

Object.defineProperty(exports, "atualizarPlataformas", { enumerable: true, get: () => atualizarPlataformas });
Object.defineProperty(exports, "pousarEmPlataformas", { enumerable: true, get: () => pousarEmPlataformas });
});
