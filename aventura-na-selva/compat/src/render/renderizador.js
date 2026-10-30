// Gerado a partir de src/render/renderizador.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/renderizador.js", function (exports, usar) {
"use strict";
const { CONFIG: C, CAMPANHA: B } = usar("src/core/configuracoes.js");
const { gerarSprites, ATLAS } = usar("src/render/gerarSprites.js");
const { Parallax } = usar("src/render/parallax.js");
const { desenharInimigo, desenharChefe, estrela } = usar("src/render/atores.js");
const { MUNDOS } = usar("src/fases/campanha.js");
const { pintarPredios, criarBarraca, desenharMercador, desenharAmbiente } = usar("src/render/extras.js");
const { criarBrilho } = usar("src/render/arte.js");
const { pintarTerreno, desenharPlataforma, desenharPortal, desenharMoeda } = usar("src/render/detalhes.js");
class Renderizador {
  constructor(canvas) {
    this.canvas = canvas; this.quadro=document.getElementById('quadroJogo'); this.palco=document.getElementById('palco'); this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D indisponível.');
    this.atlas = gerarSprites(); this.barraca=criarBarraca(); this.brilho=criarBrilho('#f5da93'); this.parallax = new Parallax(); this.tiles = document.createElement('canvas');
    this.redimensionar = this.redimensionar.bind(this);
    this.observador = new ResizeObserver(this.redimensionar); this.observador.observe(this.palco||canvas);
    window.addEventListener('resize', this.redimensionar); this.redimensionar();
  }
  redimensionar() {
    const espaco=this.palco?.getBoundingClientRect();
    const largura=Math.max(1,Math.min(espaco?.width||this.canvas.clientWidth,(espaco?.height||540)*C.largura/C.altura));
    if(this.quadro){this.quadro.style.width=largura+'px';this.quadro.style.height=largura*C.altura/C.largura+'px';}
    const dpr=Math.min(C.dprMaximo,window.devicePixelRatio||1);
    this.canvas.width=Math.round(largura*dpr);this.canvas.height=Math.round(largura*C.altura/C.largura*dpr);
    this.ctx.imageSmoothingEnabled = false;
  }
  preparar(mundo) {
    this.parallax.preparar(mundo.fase.mundo ?? 0);
    this.tema = MUNDOS[mundo.fase.mundo ?? 0];
    this.tiles.width = mundo.largura; this.tiles.height = mundo.altura;
    const t = this.tiles.getContext('2d');
    pintarTerreno(t,mundo);
    pintarPredios(t,mundo);
    this.vinheta=document.createElement('canvas');this.vinheta.width=960;this.vinheta.height=540;
    const v=this.vinheta.getContext('2d'),g=v.createRadialGradient(480,240,130,480,240,580);g.addColorStop(0,'#0b263200');g.addColorStop(1,'#0b182357');v.fillStyle=g;v.fillRect(0,0,960,540);
  }
  desenhar(m, camera, particulas, alpha, engine) {
    const ctx=this.ctx,titulo=engine?.estados.atual==='MENU',tempo=m.tempo+(titulo?engine.tempoTitulo:0);
    const cameraX=camera.anteriorX+(camera.x-camera.anteriorX)*alpha;
    ctx.setTransform(this.canvas.width / C.largura, 0, 0, this.canvas.height / C.altura, 0, 0); ctx.globalAlpha = 1;
    this.parallax.desenhar(ctx,titulo?engine.tempoTitulo*40:cameraX);
    ctx.save(); ctx.translate(Math.round(camera.tremorX()), Math.round(camera.tremorY()));
    ctx.drawImage(this.tiles, Math.round(cameraX), 0, C.largura, C.altura, 0, 0, C.largura, C.altura);
    for (let i = 0; i < (m.fase.buracos?.length || 0); i++) {
      const p = m.fase.buracos[i], x = p.x - cameraX;
      if (m.fase.mundo === 1 || m.fase.mundo === 2 || m.fase.mundo === 4) {
        ctx.fillStyle=m.fase.mundo===4?'#e99b6bcc':m.fase.mundo===2?'#cdb88899':'#4598a1bb'; ctx.fillRect(x, 474, p.largura, 70); ctx.fillStyle = '#b7ead4';
        for (let j = 0; j < p.largura; j += 25) ctx.fillRect(x + j, 475 + Math.sin(tempo * 3 + j) * 2, 17, 2);
      }
    }
    for (let i = 0; i < m.plataformas.length; i++) {
      const p = m.plataformas[i], x = p.anteriorX + (p.x - p.anteriorX) * alpha - cameraX;
      if (x < -p.largura || x > C.largura) continue;
      const y = p.anteriorY + (p.y - p.anteriorY) * alpha;
      desenharPlataforma(ctx,p,x,y,m.fase.mundo);
    }
    for (let i = 0; i < m.checkpoints.length; i++) {
      const p = m.checkpoints[i], x = p.x - cameraX;
      if (x < -40 || x > C.largura + 40) continue;
      ctx.fillStyle = '#496553'; ctx.fillRect(x, p.y - 56, 16, 56); ctx.fillRect(x - 5, p.y - 61, 26, 12);
      ctx.fillStyle = p.aceso ? '#c7f49a' : '#7f9982'; ctx.fillRect(x + 4, p.y - 46, 8, 21);
      if (p.aceso) { ctx.fillStyle = '#c7f49a33'; ctx.fillRect(x - 12, p.y - 70, 40, 75); }
    }
    for (let i = 0; i < m.perigos.length; i++) {
      const p = m.perigos[i]; if (p.tipo !== 'espinhos') continue;
      ctx.fillStyle=m.fase.mundo===3?'#c9eefa':m.fase.mundo===4?'#e4a18c':'#f3cfac';
      for (let dx = 0; dx < p.largura; dx += 12) { ctx.beginPath(); ctx.moveTo(p.x + dx - cameraX, p.y + 14); ctx.lineTo(p.x + dx + 6 - cameraX, p.y); ctx.lineTo(p.x + dx + 12 - cameraX, p.y + 14); ctx.fill(); }
    }
    for (let i = 0; i < m.itens.length; i++) {
      const p = m.itens[i], x = p.x - cameraX, y = p.y + Math.sin(tempo * 3 + i) * 3;
      if (!p.ativo || x < -25 || x > C.largura + 25) continue;
      if (p.tipo === 'estrela') { estrela(ctx, x, y, 12, '#fff2a0'); estrela(ctx, x, y, 6, '#eeb95c'); }
      else if (p.tipo === 'coracao') { ctx.fillStyle = '#fa9b93'; ctx.fillRect(x - 9, y - 5, 8, 10); ctx.fillRect(x + 1, y - 5, 8, 10); ctx.fillRect(x - 5, y + 1, 10, 9); }
      else {
        desenharMoeda(ctx,p,x,y,tempo,i,this.brilho);
      }
    }
    if(engine?.descanso)desenharMercador(ctx,engine.mercador,cameraX,tempo,engine.mercadorPerto,this.barraca,this.brilho);
    const portalX = m.portalX - cameraX, aberto = !engine || engine.corrida.chefeVencido;
    if (portalX > -90 && portalX < C.largura + 80) {
      desenharPortal(ctx,portalX,m.portalY,tempo,aberto,!!engine?.descanso,this.brilho);
    }
    if (engine) {
      for (let i = 0; i < engine.inimigos.pool.itens.length; i++) {
        const e = engine.inimigos.pool.itens[i];
        if (!e.ativo || e.estado === 'submerso' || e.transformacao.x < cameraX - 100 || e.transformacao.x > cameraX + C.largura + 100) continue;
        if (e.tipo === 'aranha') { ctx.strokeStyle = '#e3e8cacc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(e.ancoraX + 15 - cameraX, 80); ctx.lineTo(e.transformacao.x + 15 - cameraX, e.transformacao.y); ctx.stroke(); }
        desenharInimigo(ctx, e, cameraX, alpha);
      }
      if (engine.chefe?.ativo) desenharChefe(ctx, engine.chefe, cameraX, alpha);
      for (let i = 0; i < engine.projeteis.pool.itens.length; i++) {
        const p = engine.projeteis.pool.itens[i]; if (!p.ativo) continue;
        const x = p.anteriorX + (p.x - p.anteriorX) * alpha - cameraX, y = p.anteriorY + (p.y - p.anteriorY) * alpha;
        if (p.aviso > 0) {
          ctx.fillStyle = '#ec8d6e99'; ctx.beginPath(); ctx.ellipse(x + 12, 444, 22 + (1 - Math.min(1, p.aviso)) * 9, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffe2ad'; ctx.font = 'bold 17px system-ui'; ctx.fillText('!', x + 8, 415); continue;
        }
        if (x < -80 || x > C.largura + 80) continue;
        ctx.fillStyle = p.tipo === 'onda' ? '#befff0' : p.tipo === 'tremor' ? '#dfb37c' : p.tipo === 'teia' ? '#d8b1ed' : p.tipo === 'pedra' ? m.fase.mundo===3?'#bce3f0':m.fase.mundo===4?'#df947c':m.fase.mundo===2?'#ba8b65':'#999c9a' : '#c19964';
        ctx.fillRect(Math.round(x), Math.round(y), p.largura, p.altura);
      }
    }
    ctx.fillStyle = '#e6e0ae';
    for (let i = 0; i < particulas.pool.itens.length; i++) {
      const p = particulas.pool.itens[i]; if (!p.ativo || p.x < cameraX - 16 || p.x > cameraX + C.largura + 16) continue;
      ctx.globalAlpha = Math.max(0, p.vida / p.duracao);
      const x = p.anteriorX + (p.x - p.anteriorX) * alpha - cameraX, y = p.anteriorY + (p.y - p.anteriorY) * alpha;
      if (p.tipo === 1) {
        if (camera.reduzirMovimento) continue;
        ctx.globalAlpha *= .16; ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(p.direcao, 1);
        ctx.drawImage(this.atlas, 0, 0, ATLAS.largura, ATLAS.altura, -16, -48, 32, 48); ctx.restore();
      } else if(p.tipo===2){ctx.fillStyle=p.cor;estrela(ctx,x,y,p.tamanho,'#ffe99b');ctx.fillStyle='#e6e0ae';}else ctx.fillRect(Math.round(x),Math.round(y),p.tamanho,p.tamanho);
    }
    ctx.globalAlpha = 1;
    const j = m.jogador, t = j.transformacao, a = j.animacao;
    const x = t.anteriorX + (t.x - t.anteriorX) * alpha + t.largura / 2 - cameraX, y = t.anteriorY + (t.y - t.anteriorY) * alpha + t.altura;
    ctx.fillStyle='#102c3438';ctx.beginPath();ctx.ellipse(x,t.y+t.altura+3,17,4,0,0,Math.PI*2);ctx.fill();
    if (!titulo&&!(a.invulneravel > 0 && Math.floor(a.tempo * 15) % 2 === 0)) {
      let quadro = a.estado === 'andando' ? 7 + Math.floor(a.tempo * C.animacaoFrequencia) % 4 : a.estado === 'pulando' ? 3 : a.estado === 'caindo' ? 4 : 0;
      if(a.estado==='parado'&&a.tempo%5.5>5.32)quadro=6;
      if(j.planando)quadro=11;
      if (a.flash > 0) quadro = 5;
      ctx.save(); ctx.translate(Math.round(x), Math.round(y+(a.estado==='andando'?Math.sin(a.tempo*24)*1.2:0)));
      const escala = camera.reduzirMovimento ? 1 : a.escalaY; ctx.scale(j.controle.direcao / escala, escala);
      ctx.drawImage(this.atlas, quadro * ATLAS.largura, 0, ATLAS.largura, ATLAS.altura, -16, -48, 32, 48); ctx.restore();
    }
    if (j.combate.escudo) { ctx.strokeStyle = '#9ae6f5aa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 24, 24, 31, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (j.combate.ataque > 0) {
      ctx.strokeStyle = '#fff3bb'; ctx.lineWidth = 5; ctx.beginPath();
      const f = 1 - j.combate.ataque / B.duracaoAtaque;
      const centro = j.controle.direcao > 0 ? 0 : Math.PI;
      ctx.arc(x, y - 21, (engine?.atributos.alcance || 54) + 5, centro - .9 + f, centro + .3 + f); ctx.stroke();
    }
    if (engine) for (let i = 0; i < engine.textos.itens.length; i++) {
      const p = engine.textos.itens[i]; if (!p.ativo) continue;
      ctx.globalAlpha = Math.min(1, p.tempo * 3); ctx.fillStyle = p.cor; ctx.font = 'bold 14px system-ui'; ctx.fillText(p.texto, p.x - cameraX, p.y);
    }
    ctx.globalAlpha = 1;
    desenharAmbiente(ctx,m,cameraX,tempo,camera.reduzirMovimento,this.brilho);
    ctx.drawImage(this.vinheta,0,0);
    if(titulo){
      const t=engine.tempoTitulo,correndo=t%9>5.5,quadro=correndo?7+Math.floor(t*12)%4:t%4>3.8?6:0;
      const px=740+Math.sin(t*.65)*12,py=430+Math.sin(t*(correndo?22:2))*(correndo?3:2);
      ctx.fillStyle='#12374940';ctx.beginPath();ctx.ellipse(px,446,64,10,0,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(t*.8)*.035);ctx.drawImage(this.atlas,quadro*ATLAS.largura,0,ATLAS.largura,ATLAS.altura,-64,-192,128,192);ctx.restore();
      estrela(ctx,px-65,py-145,9,'#ffdf91');estrela(ctx,px+75,py-85,6,'#e5f7c0');
    }
    ctx.restore();
  }
  destruir() { this.observador.disconnect(); window.removeEventListener('resize', this.redimensionar); }
}

Object.defineProperty(exports, "Renderizador", { enumerable: true, get: () => Renderizador });
});
