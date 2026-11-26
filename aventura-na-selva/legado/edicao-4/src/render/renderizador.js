import { CONFIG as C, CAMPANHA as B } from '../core/configuracoes.js';
import { QUADROS, quadroDoHeroi, desenharSpriteHeroi } from './gerarSprites.js';
import { Parallax } from './parallax.js';
import { desenharInimigo, desenharChefe, estrela } from './atores.js';
import { pintarPredios, criarBarraca, desenharMercador, desenharAmbiente } from './extras.js';

import { criarBrilho } from './arte.js';
import { pintarTerreno, desenharPlataforma, desenharPortal, desenharMoeda, desenharProjetil } from './detalhes.js';

function desenharGolpe(ctx, jogador, x, y, alcance, reduzirMovimento) {
  const c = jogador.combate, direcao = jogador.controle.direcao;
  let centro = direcao > 0 ? 0 : Math.PI, altura = y - 21, raio = alcance + 5;
  let duracao = B.duracaoAtaqueRapido;
  ctx.strokeStyle = '#fff3bb'; ctx.lineWidth = 5;
  if (c.tipoAtaque === 'pogo') {
    centro = Math.PI / 2; altura = y; raio = B.alcancePogo;
    duracao = B.duracaoAtaque; ctx.strokeStyle = '#a4edff';
  } else {
    if (c.tipoAtaque === 'aereo') centro += .35 * direcao;
    if (c.golpeCombo === B.golpesCombo) {
      duracao = B.duracaoAtaque; ctx.strokeStyle = '#ffce70'; ctx.lineWidth = 8;
    }
  }
  const avanco = reduzirMovimento ? .5 : 1 - c.ataque / duracao;
  ctx.beginPath();
  ctx.arc(x, altura, raio, centro - .9 + avanco, centro + .3 + avanco);
  ctx.stroke();
}

class Renderizador {
  constructor(canvas, arte) {
    this.canvas = canvas; this.quadro=document.getElementById('quadroJogo'); this.palco=document.getElementById('palco'); this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D indisponível.');
    this.atlas=arte.atlas;this.criaturas=arte.criaturas;
    this.atlasDano=document.createElement('canvas');this.atlasDano.width=arte.criaturas.width;this.atlasDano.height=arte.criaturas.height;
    const flash=this.atlasDano.getContext('2d');flash.drawImage(arte.criaturas,0,0);flash.globalCompositeOperation='source-atop';flash.fillStyle='#fff1c9cc';flash.fillRect(0,0,this.atlasDano.width,this.atlasDano.height);
    this.barraca=criarBarraca(); this.brilho=criarBrilho('#f5da93'); this.parallax = new Parallax(arte.paisagens); this.tiles = document.createElement('canvas');
    this.vinheta=document.createElement('canvas');this.vinheta.width=C.largura/2;this.vinheta.height=C.altura/2;
    const v=this.vinheta.getContext('2d'),g=v.createRadialGradient(240,120,65,240,120,290);
    g.addColorStop(0,'#0b263200');g.addColorStop(1,'#0b182357');v.fillStyle=g;v.fillRect(0,0,this.vinheta.width,this.vinheta.height);
    this.redimensionar = this.redimensionar.bind(this);
    this.observador = new ResizeObserver(this.redimensionar); this.observador.observe(this.palco||canvas);
    window.addEventListener('resize', this.redimensionar); this.redimensionar();
  }
  redimensionar() {
    const espaco=this.palco?.getBoundingClientRect();
    const w=espaco?.width||960,h=espaco?.height||540;
    this.visao=w<h && w<=740 ? 544 : C.largura;
    const largura=Math.min(w,h*this.visao/C.altura);
    if(this.quadro){this.quadro.style.width=largura+'px';this.quadro.style.height=largura*C.altura/this.visao+'px';}
    this.canvas.width=this.visao/2;this.canvas.height=C.altura/2;
    this.tamanhoMudou=true;
    this.ctx.imageSmoothingEnabled = false;
  }
  preparar(mundo) {
    this.parallax.preparar(mundo.fase.mundo ?? 0,mundo.fase.descanso);
    const tipo=mundo.fase.mundo??0;
    this.atlasLocal=document.createElement('canvas');this.atlasLocal.width=this.criaturas.width;this.atlasLocal.height=this.criaturas.height;
    const local=this.atlasLocal.getContext('2d');local.drawImage(this.criaturas,0,0);local.globalCompositeOperation='source-atop';
    local.fillStyle=['#ffffff00','#a996d730','#e7a26430','#80dbfd3d','#f36e6338'][tipo];local.fillRect(0,0,this.atlasLocal.width,this.atlasLocal.height);
    this.tiles.width = mundo.largura/2; this.tiles.height = mundo.altura/2;
    const t = this.tiles.getContext('2d');t.scale(.5,.5);
    pintarTerreno(t,mundo);
    pintarPredios(t,mundo);
  }
  desenhar(m, camera, particulas, alpha, engine) {
    const ctx=this.ctx,tempo=m.tempo;
    if(camera.largura!==this.visao){camera.enquadrar(this.visao);camera.focar(m.jogador);}
    this.tamanhoMudou=false;
    const cameraX=camera.anteriorX+(camera.x-camera.anteriorX)*alpha;
    ctx.setTransform(.5,0,0,.5,0,0); ctx.globalAlpha = 1;
    this.parallax.desenhar(ctx,cameraX,this.visao,camera.limite);
    ctx.save(); ctx.translate(Math.round(camera.tremorX()), Math.round(camera.tremorY()));
    ctx.drawImage(this.tiles, Math.round(cameraX/2), 0, this.visao/2, C.altura/2, 0, 0, this.visao, C.altura);
    for (let i = 0; i < (m.fase.buracos?.length || 0); i++) {
      const p = m.fase.buracos[i], x = p.x - cameraX;
      if (x < -p.largura || x > this.visao) continue;
      if (m.fase.mundo === 1 || m.fase.mundo === 2 || m.fase.mundo === 4) {
        ctx.fillStyle=m.fase.mundo===4?'#e99b6bcc':m.fase.mundo===2?'#cdb88899':'#4598a1bb'; ctx.fillRect(x, 474, p.largura, 70); ctx.fillStyle = '#b7ead4';
        for (let j = 0; j < p.largura; j += 25) ctx.fillRect(x + j, 475 + Math.sin(tempo * 3 + j) * 2, 17, 2);
      }
    }
    for (let i = 0; i < m.plataformas.length; i++) {
      const p = m.plataformas[i], x = p.anteriorX + (p.x - p.anteriorX) * alpha - cameraX;
      if (x < -p.largura || x > this.visao) continue;
      const y = p.anteriorY + (p.y - p.anteriorY) * alpha;
      desenharPlataforma(ctx,p,x,y,m.fase.mundo);
    }
    for (let i = 0; i < m.checkpoints.length; i++) {
      const p = m.checkpoints[i], x = p.x - cameraX;
      if (x < -40 || x > this.visao + 40) continue;
      const cor=p.aceso?'#a9f9bc':'#e8b772';
      ctx.fillStyle='#252239';ctx.fillRect(x-4,p.y-55,12,55);ctx.fillRect(x-10,p.y-6,22,6);
      ctx.fillStyle='#a57b66';ctx.fillRect(x-1,p.y-51,4,45);ctx.fillStyle='#edd2a1';ctx.fillRect(x-1,p.y-49,2,28);
      ctx.fillStyle='#332c46';ctx.fillRect(x-7,p.y-63,18,18);ctx.fillStyle=cor;ctx.fillRect(x-4,p.y-60,12,12);
      ctx.fillStyle='#423a46';ctx.fillRect(x+1,p.y-58,2,8);ctx.fillRect(x-2,p.y-55,8,2);
      ctx.fillStyle=p.aceso?'#75c7a9':'#c88776';ctx.beginPath();ctx.moveTo(x+5,p.y-47);ctx.lineTo(x+28,p.y-43);ctx.lineTo(x+21,p.y-35);ctx.lineTo(x+29,p.y-30);ctx.lineTo(x+5,p.y-31);ctx.fill();
    }
    for (let i = 0; i < m.perigos.length; i++) {
      const p = m.perigos[i]; if (p.tipo !== 'espinhos' || p.x+p.largura < cameraX || p.x > cameraX+this.visao) continue;
      ctx.fillStyle=m.fase.mundo===3?'#c9eefa':m.fase.mundo===4?'#e4a18c':'#f3cfac';
      for (let dx = 0; dx < p.largura; dx += 12) { ctx.beginPath(); ctx.moveTo(p.x + dx - cameraX, p.y + 14); ctx.lineTo(p.x + dx + 6 - cameraX, p.y); ctx.lineTo(p.x + dx + 12 - cameraX, p.y + 14); ctx.fill(); }
    }
    for (let i = 0; i < m.itens.length; i++) {
      const p = m.itens[i], x = p.x - cameraX;
      if (!p.ativo || x < -25 || x > this.visao + 25) continue;
      const y = p.y + Math.sin(tempo * 3 + i) * 3;
      if (p.tipo === 'estrela') {
        estrela(ctx,x,y,15,'#433147');estrela(ctx,x,y-1,12,'#ffcf65');estrela(ctx,x-1,y-2,6,'#fff4bd');
        ctx.fillStyle='#fff7cf';ctx.fillRect(x+10,y-12,3,3);
      } else if(p.tipo==='coracao'){
        ctx.save();ctx.translate(Math.round(x),Math.round(y));
        for(const [cor,k] of [['#40273a',1],['#ed7485',.8]]){
          ctx.save();ctx.scale(k,k);ctx.fillStyle=cor;ctx.beginPath();ctx.moveTo(-11,-4);ctx.lineTo(-8,-9);ctx.lineTo(-3,-9);ctx.lineTo(0,-6);ctx.lineTo(3,-9);ctx.lineTo(8,-9);ctx.lineTo(11,-4);ctx.lineTo(10,0);ctx.lineTo(0,10);ctx.lineTo(-10,0);ctx.fill();ctx.restore();
        }
        ctx.fillStyle='#ffcfb5';ctx.fillRect(-6,-5,4,2);ctx.restore();
      }
      else {
        desenharMoeda(ctx,p,x,y,tempo,i,this.brilho);
      }
    }
    if(engine?.descanso)desenharMercador(ctx,engine.mercador,cameraX,tempo,engine.mercadorPerto,this.barraca,this.brilho);
    const portalX = m.portalX - cameraX, aberto = !engine || engine.corrida.chefeVencido;
    if (portalX > -90 && portalX < this.visao + 80) {
      desenharPortal(ctx,portalX,m.portalY,tempo,aberto,!!engine?.descanso,this.brilho);
    }
    if (engine) {
      for (let i = 0; i < engine.inimigos.pool.itens.length; i++) {
        const e = engine.inimigos.pool.itens[i];
        if (!e.ativo || e.estado === 'submerso' || e.transformacao.x < cameraX - 100 || e.transformacao.x > cameraX + this.visao + 100) continue;
        if (e.tipo === 'aranha') { ctx.strokeStyle = '#e3e8cacc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(e.ancoraX + 15 - cameraX, 80); ctx.lineTo(e.transformacao.x + 15 - cameraX, e.transformacao.y); ctx.stroke(); }
        desenharInimigo(ctx,e,cameraX,alpha,this.atlasLocal,this.atlasDano);
      }
      if (engine.chefe?.ativo) desenharChefe(ctx, engine.chefe, cameraX, alpha);
      for (let i = 0; i < engine.projeteis.pool.itens.length; i++) {
        const p = engine.projeteis.pool.itens[i]; if (!p.ativo) continue;
        const x = p.anteriorX + (p.x - p.anteriorX) * alpha - cameraX, y = p.anteriorY + (p.y - p.anteriorY) * alpha;
        if (x < -80 || x > this.visao + 80) continue;
        if (p.aviso > 0) {
          ctx.fillStyle = '#ec8d6e99'; ctx.beginPath(); ctx.ellipse(x + 12, 444, 22 + (1 - Math.min(1, p.aviso)) * 9, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffe2ad'; ctx.font = 'bold 17px system-ui'; ctx.fillText('!', x + 8, 415); continue;
        }
        desenharProjetil(ctx,p,Math.round(x),Math.round(y));
      }
    }
    ctx.fillStyle = '#e6e0ae';
    for (let i = 0; i < particulas.pool.itens.length; i++) {
      const p = particulas.pool.itens[i]; if (!p.ativo || p.x < cameraX - 16 || p.x > cameraX + this.visao + 16) continue;
      ctx.globalAlpha = Math.max(0, p.vida / p.duracao);
      const x = p.anteriorX + (p.x - p.anteriorX) * alpha - cameraX, y = p.anteriorY + (p.y - p.anteriorY) * alpha;
      if (p.tipo === 1) {
        if (camera.reduzirMovimento) continue;
        ctx.globalAlpha *= .16; ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(p.direcao, 1);
        desenharSpriteHeroi(ctx, this.atlas, QUADROS.parado); ctx.restore();
      } else if (p.tipo === 2) {
        if (!camera.reduzirMovimento) estrela(ctx, x, y, p.tamanho, p.cor);
        ctx.fillStyle = '#e6e0ae';
      } else ctx.fillRect(Math.round(x), Math.round(y), p.tamanho, p.tamanho);
    }
    ctx.globalAlpha = 1;
    const j = m.jogador, t = j.transformacao, a = j.animacao;
    const x = t.anteriorX + (t.x - t.anteriorX) * alpha + t.largura / 2 - cameraX, y = t.anteriorY + (t.y - t.anteriorY) * alpha + t.altura;
    ctx.fillStyle='#102c3438';ctx.beginPath();ctx.ellipse(x,t.y+t.altura+3,17,4,0,0,Math.PI*2);ctx.fill();
    const piscaDano = !camera.reduzirMovimento && a.flash === 0 && a.invulneravel > 0 && Math.floor(a.tempo * 15) % 2 === 0;
    if (!piscaDano) {
      const balanco = !camera.reduzirMovimento && a.estado === 'andando' ? Math.sin(a.tempo * 24) * 1.2 : 0;
      ctx.save(); ctx.translate(Math.round(x), Math.round(y + balanco));
      const escala = camera.reduzirMovimento ? 1 : a.escalaY; ctx.scale(j.controle.direcao / escala, escala);
      desenharSpriteHeroi(ctx, this.atlas, quadroDoHeroi(j, engine?.estados.atual)); ctx.restore();
    }
    if (j.combate.escudo) { ctx.strokeStyle = '#9ae6f5aa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 24, 24, 31, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (j.combate.ataque > 0) desenharGolpe(ctx, j, x, y, engine?.atributos.alcance ?? 54, camera.reduzirMovimento);
    if (engine) for (let i = 0; i < engine.textos.itens.length; i++) {
      const p = engine.textos.itens[i]; if (!p.ativo) continue;
      ctx.globalAlpha = Math.min(1, p.tempo * 3); ctx.fillStyle = p.cor; ctx.font = 'bold 14px system-ui'; ctx.fillText(p.texto, p.x - cameraX, p.y);
    }
    ctx.globalAlpha = 1;
    desenharAmbiente(ctx,m,cameraX,tempo,camera.reduzirMovimento,this.brilho);
    ctx.drawImage(this.vinheta,0,0,this.visao,C.altura);
    ctx.restore();
  }
  destruir() { this.observador.disconnect(); window.removeEventListener('resize', this.redimensionar); }
}

export { Renderizador };
