import { Pool } from '../../core/pool.js';
import { CONFIG as C, CAMPANHA as B } from '../../core/configuracoes.js';
import { sobrepoe } from './colisao.js';

class SistemaProjeteis {
  constructor() {
    this.pool = new Pool(B.projeteisMaximos, () => ({ ativo: false, x: 0, y: 0, anteriorX: 0, anteriorY: 0,
      vx: 0, vy: 0, largura: 12, altura: 12, tipo: 'coco', hostil: true, dano: 1,
      vida: 0, gravidade: 0, aviso: 0, perfuracao: 0, atingidos: new Uint8Array(B.inimigosMaximos), chefeAtingido: false }));
  }
  atirar(x, y, vx, vy, tipo = 'coco', hostil = true, dano = 1, gravidade = 0, aviso = 0, perfuracao = 0) {
    const p = this.pool.obter(); if (!p) return null;
    p.largura = tipo === 'onda' || tipo === 'tremor' ? 32 : tipo === 'pedra' ? 24 : 12;
    p.altura = tipo === 'pedra' ? 24 : 14;
    p.x = p.anteriorX = x - p.largura / 2; p.y = p.anteriorY = y - p.altura / 2;
    p.vx = vx; p.vy = vy; p.tipo = tipo; p.hostil = hostil; p.dano = dano; p.gravidade = gravidade;
    p.vida = B.vidaProjetil + aviso; p.aviso = aviso; p.perfuracao = perfuracao; p.atingidos.fill(0); p.chefeAtingido = false;
    return p;
  }
  atualizar(engine, dt) {
    const m = engine.mundo, j = m.jogador;
    for (let i = 0; i < this.pool.itens.length; i++) {
      const p = this.pool.itens[i]; if (!p.ativo) continue;
      p.anteriorX = p.x; p.anteriorY = p.y; p.vida -= dt;
      if (p.vida <= 0 || p.x < -100 || p.x > m.largura + 100 || p.y > m.altura + 100) { p.ativo = false; continue; }
      if (p.aviso > 0) { p.aviso = Math.max(0, p.aviso - dt); continue; }
      p.vy += p.gravidade * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.hostil) {
        if (sobrepoe(p, j.transformacao)) { engine.ferirJogador('projetil'); p.ativo = false; continue; }
      } else {
        engine.hash.consultar(p.x, p.y, p.largura, p.altura);
        for (let k = 0; k < engine.hash.quantidade; k++) {
          const id = engine.hash.resultados[k], e = engine.inimigos.pool.itens[id];
          if (!e.ativo || p.atingidos[id] || !sobrepoe(p, e.transformacao)) continue;
          p.atingidos[id] = 1; engine.ferirInimigo(e, p.dano, p.x, false);
          if (p.perfuracao-- <= 0) { p.ativo = false; break; }
        }
        if (engine.chefe?.ativo && !p.chefeAtingido && sobrepoe(p, engine.chefe.transformacao)) {
          p.chefeAtingido = true; engine.ferirChefe(p.dano);
          if (p.perfuracao-- <= 0) p.ativo = false;
        }
      }
      if (p.tipo !== 'tremor' && m.solido(Math.floor((p.x + p.largura / 2) / C.tile), Math.floor((p.y + p.altura / 2) / C.tile))) p.ativo = false;
    }
  }
}

export { SistemaProjeteis };
