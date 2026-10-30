// Gerado a partir de src/ecs/sistemas/ia.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/sistemas/ia.js", function (exports, usar) {
"use strict";
const { CONFIG: C, CAMPANHA: B } = usar("src/core/configuracoes.js");
const { resolverX, resolverY } = usar("src/ecs/sistemas/colisao.js");
function linhaDeVisao(mundo, x0, y0, x1, y1) {
  const distancia = Math.hypot(x1 - x0, y1 - y0), passos = Math.ceil(distancia / 16);
  for (let i = 1; i < passos; i++) {
    const f = i / passos;
    if (mundo.solido(Math.floor((x0 + (x1 - x0) * f) / C.tile), Math.floor((y0 + (y1 - y0) * f) / C.tile))) return false;
  }
  return true;
}
function veJogador(e, engine) {
  const t = e.transformacao, p = engine.mundo.jogador.transformacao;
  const dx = p.x - t.x, dy = p.y - t.y;
  if (Math.abs(dx) > B.alcanceVisao || Math.abs(dy) > Math.abs(dx) * .7 + 45) return false;
  if (Math.abs(dx) > 95 && Math.sign(dx) !== e.controle.direcao) return false;
  return linhaDeVisao(engine.mundo, t.x + t.largura / 2, t.y + t.altura / 2, p.x + p.largura / 2, p.y + p.altura / 2);
}
function patrulhar(e, engine, velocidade = e.dados.velocidade) {
  const t = e.transformacao, direcao = e.controle.direcao, m = engine.mundo;
  const borda = direcao > 0 ? t.x + t.largura + 7 : t.x - 7;
  if (e.corpo.noChao && (!m.solido(Math.floor(borda / C.tile), Math.floor((t.y + t.altura + 10) / C.tile)) ||
    m.solido(Math.floor(borda / C.tile), Math.floor((t.y + t.altura / 2) / C.tile)))) e.controle.direcao *= -1;
  e.corpo.vx = e.controle.direcao * velocidade * engine.atributos.ritmoInimigo;
}
function atacarPerto(e, engine, velocidade, alcance) {
  const dx = engine.mundo.jogador.transformacao.x - e.transformacao.x;
  if (e.estado === 'aviso') {
    e.corpo.vx = 0;
    if (e.espera <= 0) { e.estado = 'ataque'; e.espera = .38; e.corpo.vx = e.direcaoAtaque * velocidade; }
  } else if (e.estado === 'ataque') {
    e.corpo.vx = e.direcaoAtaque * velocidade;
    if (e.espera <= 0) { e.estado = 'recuo'; e.espera = 1.1; }
  } else if (e.estado === 'recuo') {
    e.corpo.vx = -e.direcaoAtaque * 30;
    if (e.espera <= 0) e.estado = 'patrulha';
  } else if (Math.abs(dx) < alcance && veJogador(e, engine)) {
    e.estado = 'aviso'; e.espera = B.avisoInimigo; e.direcaoAtaque = Math.sign(dx) || 1; e.controle.direcao = e.direcaoAtaque;
  } else { e.corpo.vx = 0; if (Math.abs(dx) < 70) e.controle.direcao = Math.sign(dx) || 1; }
}
const COMPORTAMENTOS = {
  macaco(e, engine) { patrulhar(e, engine); },
  cobra(e, engine) { atacarPerto(e, engine, 310 * engine.atributos.ritmoInimigo, 190); },
  tatu(e, engine) {
    if (e.estado === 'patrulha') patrulhar(e, engine);
    if (veJogador(e, engine) && Math.abs(engine.mundo.jogador.transformacao.x - e.transformacao.x) < 200 || e.estado !== 'patrulha') atacarPerto(e, engine, 220, 200);
  },
  onca(e, engine, dt) {
    const p = engine.mundo.jogador.transformacao, dx = p.x - e.transformacao.x;
    if (e.estado === 'aviso' || e.estado === 'ataque' || e.estado === 'recuo') { atacarPerto(e, engine, 360 * engine.atributos.ritmoInimigo, 105); return; }
    if (veJogador(e, engine)) { e.alerta = 1.4; e.estado = 'perseguindo'; }
    else e.alerta = Math.max(0, e.alerta - dt);
    if (e.alerta > 0) {
      e.controle.direcao = Math.sign(dx) || 1;
      if (Math.abs(dx) < 105) { e.estado = 'aviso'; e.espera = .45; e.direcaoAtaque = e.controle.direcao; e.corpo.vx = 0; }
      else patrulhar(e, engine, 165);
    } else { e.estado = 'patrulha'; patrulhar(e, engine); }
  },
  xama(e, engine) {
    const dx = engine.mundo.jogador.transformacao.x - e.transformacao.x;
    if (e.estado === 'aviso') {
      e.corpo.vx = 0;
      if (e.espera <= 0) { engine.tiroMirado(e.transformacao.x + 14, e.transformacao.y + 10, 'teia', 245); e.estado = 'recuo'; e.espera = 1.4; }
    } else if (e.estado === 'recuo') {
      e.corpo.vx = Math.abs(dx) < 160 ? -(Math.sign(dx) || 1) * 65 : 0;
      if (e.espera <= 0) e.estado = 'patrulha';
    } else if (veJogador(e, engine)) { e.estado = 'aviso'; e.espera = .8; e.controle.direcao = Math.sign(dx) || 1; }
    else patrulhar(e, engine);
  },
  aranha(e, engine) {
    e.transformacao.x = e.ancoraX + Math.sin(e.idade * .7) * 22;
    e.transformacao.y = Math.min(422, e.ancoraY + 125 + Math.sin(e.idade * 1.35) * 100);
    if (e.recarga <= 0 && engine.mundo.fase.numero >= 5 && veJogador(e, engine)) {
      e.estado = 'aviso'; e.espera = .6; e.recarga = 3.4;
    }
    if (e.estado === 'aviso' && e.espera <= 0) { engine.tiroMirado(e.transformacao.x, e.transformacao.y, 'teia', 220); e.estado = 'patrulha'; }
  },
  besouro(e, engine, dt) {
    const t = e.transformacao, p = engine.mundo.jogador.transformacao;
    if (e.estado === 'aviso') {
      if (e.espera <= 0) { e.estado = 'ataque'; e.espera = .6; e.direcaoAtaque = Math.sign(p.x - t.x) || 1; }
    } else if (e.estado === 'ataque') {
      t.x += e.direcaoAtaque * 230 * dt; t.y += 170 * dt;
      if (e.espera <= 0) { e.estado = 'recuo'; e.espera = 1.1; e.recarga = 2.8; }
    } else if (e.estado === 'recuo') {
      t.y += (e.ancoraY - t.y) * Math.min(1, dt * 4);
      if (e.espera <= 0) { e.estado = 'patrulha'; e.ancoraX = t.x; }
    } else {
      t.x = e.ancoraX + Math.sin(e.idade * .9) * 70; t.y = e.ancoraY + Math.sin(e.idade * 2.1) * 36;
      if (Math.abs(p.x - t.x) < 180 && e.recarga <= 0) { e.estado = 'aviso'; e.espera = .55; }
    }
    e.controle.direcao = p.x > t.x ? 1 : -1;
  },
  piranha(e, engine) {
    const ciclo = (e.idade % 3.1) / 3.1;
    e.transformacao.y = e.ancoraY - Math.max(0, Math.sin(ciclo * Math.PI * 2)) * 220;
    e.transformacao.x = e.ancoraX + Math.sin(ciclo * Math.PI * 2) * 20;
    e.estado = e.transformacao.y < 446 ? 'ataque' : 'submerso';
  }
};
/** Cada tipo tem um comportamento substituível. O for atualiza entidades sem criar listas. */
function atualizarIA(engine, dt) {
  const mundo = engine.mundo, jogadorX = mundo.jogador.transformacao.x;
  for (let i = 0; i < engine.inimigos.pool.itens.length; i++) {
    const e = engine.inimigos.pool.itens[i];
    if (!e.ativo || Math.abs(e.transformacao.x - jogadorX) > 1250) continue;
    const t = e.transformacao; t.anteriorX = t.x; t.anteriorY = t.y;
    e.idade += dt * engine.atributos.ritmoInimigo; e.espera -= dt; e.recarga -= dt; e.invulneravel = Math.max(0, e.invulneravel - dt);
    if (e.estado === 'atordoado') { e.corpo.vx *= .85; if (e.espera <= 0) e.estado = 'patrulha'; }
    else COMPORTAMENTOS[e.tipo](e, engine, dt);
    if (e.tipo !== 'aranha' && e.tipo !== 'besouro' && e.tipo !== 'piranha') {
      e.corpo.vy = Math.min(C.quedaMaxima, e.corpo.vy + C.gravidade * dt);
      const vx = e.corpo.vx; t.x += vx * dt; resolverX(e, mundo);
      if (vx !== 0 && e.corpo.vx === 0) { e.controle.direcao *= -1; if (e.tipo === 'tatu' && e.estado === 'ataque') { e.estado = 'atordoado'; e.espera = 1.5; } }
      e.corpo.noChao = false; t.y += e.corpo.vy * dt; resolverY(e, mundo);
      if (t.y > mundo.altura + 100) engine.eliminar(e);
    }
  }
}

Object.defineProperty(exports, "linhaDeVisao", { enumerable: true, get: () => linhaDeVisao });
Object.defineProperty(exports, "veJogador", { enumerable: true, get: () => veJogador });
Object.defineProperty(exports, "atualizarIA", { enumerable: true, get: () => atualizarIA });
});
