// Gerado a partir de src/cinzas/pintura.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/pintura.js", function (exports, usar) {
"use strict";
const { tela, tinta, linha, fios, pol, disco, diamante, luz, halo } = usar("src/cinzas/formas.js");
const { PALETAS, novaSuperficie, trilho, rachadura, perigo } = usar("src/cinzas/terreno-pixel.js");
const { franja, oficinaEstatica, oficina, santuario, atalho, portao } = usar("src/cinzas/cenografia.js");
const { desenharHeroi, desenharInimigo, projetil } = usar("src/cinzas/atores-pixel.js");
const { desenharAmbiente } = usar("src/cinzas/ambiente.js");
const { posicaoFantasma } = usar("src/cinzas/modos.js");
const CORES_FX={
  impacto:'#fbe6b6',dano:'#f09e8e',esquiva:'#a4babe',perfeito:'#b1f3d6',cura:'#9ee8bb',
  retorno:'#a5e7cd',quebra:'#efbc7c',aparo:'#c9f3dc',estocada:'#a3e5c9',pisada:'#e2b486',
  eco:'#85d1c7',aviso:'#eac481',ruptura:'#c99f84',guarda:'#e0ae77',estrela:'#ffe3a2',
  moeda:'#a9e8d4',descanso:'#f6c982',atalho:'#bad5ae',morte:'#9a9caa',recuperar:'#a4edde',
  chefe:'#f6b685',pulo:'#c1b497',pouso:'#d9c4a1',leve:'#e0d8be',pesado:'#edc58d',
  corrida:'#a99c80','impacto-metal':'#d1dfeb','aparo-perfeito':'#d9ffe8','janela-ouro':'#ffe5a0',
  'bloqueio-classe':'#cfdcec','contra-guarda':'#fce1ac','barreira-impacto':'#d7e9ff',barreira:'#98c9ff',
  chama:'#ffab75',queimadura:'#ff975f',arcano:'#a2caff',prece:'#ffe3a6',furia:'#ffaf77',critico:'#dcc0ff','eco-extra':'#a9e8d4'
};
const POEIRA=new Set(['pulo','pouso','esquiva','pisada','ruptura','morte','corrida']);
const FAISCA=new Set(['impacto','impacto-metal','aparo','aparo-perfeito','perfeito','guarda','quebra','estrela','recuperar','janela-ouro',
  'bloqueio-classe','contra-guarda','barreira-impacto','barreira','chama','queimadura','arcano','prece','furia','critico','eco-extra']);
const DURACOES={pulo:.22,pouso:.21,corrida:.19,moeda:.25,impacto:.19,dano:.22,eco:.24,chefe:.55,morte:.62,estrela:.6,pisada:.34,ruptura:.45};
const TONS_POEIRA=['#a99c80','#c7adb4','#d1af79','#cfdfdf','#9c7770'];
function limite(n,a,b){return Math.max(a,Math.min(n,b));}
function acesa(v,id) {return v?.includes(id)===true;}
function brilhoCriaturas(img){
  if(!img)return null;
  const v=tela(img.naturalWidth||img.width,img.naturalHeight||img.height),c=v.getContext('2d');
  c.drawImage(img,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='#e5ca9c8c';c.fillRect(0,0,v.width,v.height);
  return v;
}
function estrela(c,x,y,tempo,brilhos,parado){
  const oy=parado?0:Math.round(Math.sin(tempo*2.6+x)*1.4);y+=oy;
  luz(c,x,y,12,brilhos.ouro,.63);
  const pontos=[x,y-8,x+2,y-3,x+7,y-3,x+4,y+1,x+5,y+6,x,y+3,x-5,y+6,x-4,y+1,x-7,y-3,x-2,y-3];
  pol(c,'#5d4749',pontos);
  pol(c,'#e4b972',[x,y-6,x+2,y-2,x+6,y-2,x+3,y+1,x+4,y+4,x,y+2,x-4,y+4,x-3,y+1,x-5,y-2,x-1,y-2]);
  pol(c,'#fff0b6',[x,y-6,x+1,y-1,x,y+2,x-3,y+3,x-2,y,x-4,y-2,x-1,y-2]);
  if(!parado&&Math.floor((tempo+x)*3)%4===0){tinta(c,'#ffeec6',x+7,y-7,3);tinta(c,'#ffeec6',x+8,y-8,1,3);}
}
function eco(c,x,y,valor,tempo,brilhos,parado){
  y+=parado?0:Math.round(Math.sin(tempo*3+x)*1.25);
  const r=valor>1?5:4;
  luz(c,x,y,7,brilhos.verde,.35);diamante(c,'#254646',x,y,r+1);diamante(c,'#8acab4',x,y,r);
  pol(c,'#497f7b',[x,y-r+1,x+r-1,y,x,y+r-1,x+1,y]);
  tinta(c,'#def3cf',x-1,y-2,1,3);if(valor>1)tinta(c,'#d6ecc4',x+5,y-4);
}
function mancha(c,m,t,brilhos,parado){
  const x=Math.round(m.x),y=Math.round(m.y)-2;
  disco(c,'#233a3b',x,y+1,9,2);luz(c,x,y-6,17,brilhos.verde,.57);
  for(let i=0;i<3;i++){
    const k=parado?2:Math.round(Math.sin(t*3+i)*2);
    const px=x-5+i*4;
    pol(c,i===1?'#87bfb3':'#528e8d',[px-3,y,px-1,y-5,px+1,y-11-(i%2)*3+k,px+3,y-3,px+2,y]);
  }
  diamante(c,'#c1e8c8',x,y-9,2);
  fios(c,'#b4dbc1',[x-7,y+2,x-3,y+4,x+3,y+4,x+7,y+2]);
}
function luzAmbiente(c,w,h,tempo,camX,camY,regiao,parado){
  if(parado)return;
  const cor=['#b9cba0','#c4add0','#c7a17b','#bfdae1','#e8a37d'][regiao],quant=Math.ceil(w/33);
  for(let i=0;i<quant;i++){
    const px=((i*91+tempo*(regiao===3?8:2)-camX*.42)%(w+15)+w+15)%(w+15)-7;
    const py=((i*63+tempo*(regiao===4?-4:3)-camY*.2)%(h+10)+h+10)%(h+10)-5;
    if((i%5===0||regiao===3)&&i%2===0)tinta(c,cor,px,py,1,2);
    else tinta(c,cor+'8c',px,py);
  }
}
class Pintura {
  constructor(canvas,arte){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});if(!this.c)throw new Error('Canvas 2D indisponível.');
    this.arte=arte;this.feras=arte.criaturas||arte.ferase;this.ferasClaras=brilhoCriaturas(this.feras);
    this.brilhos={ouro:halo('225,167,88'),verde:halo('96,193,159'),rubro:halo('221,111,103')};
    this.oficina=oficinaEstatica();this.superficies=new Map();this.faseAtual=null;this.cameraX=0;this.cameraY=0;
    this.look=0;this.ultimoHeroi=0;
    this.efeitos=Array.from({length:32},()=>({idade:1,dur:0}));
    this.proximoEfeito=0;this.tremor=0;this.flash=0;this.deformacao=0;this.fantasma={};
  }
  preparar(jogo){
    const f=jogo.fase;this.faseAtual=f;this.superficies.clear();this.porId=new Map();
    for(const bloco of f.pisos){
      this.superficies.set(bloco.id,novaSuperficie(bloco,f.regiao));
      this.porId.set(bloco.id,bloco);
    }
    this.margem=franja(f.id);this.centrar(jogo);
  }
  centrar(jogo){
    const h=jogo.heroi,w=this.canvas.width,alt=this.canvas.height;
    this.look=(h.dir||1)*w*.125;
    this.cameraX=limite(h.x+h.w/2-w*.5+this.look,0,Math.max(0,jogo.fase.largura-w));
    this.ancoraY=h.y+h.h;
    this.cameraY=limite(this.ancoraY-alt*.76,-94,76);
    this.ultimoHeroi=h.x;
    for(const efeito of this.efeitos)efeito.dur=0;
    this.tremor=0;this.flash=0;this.deformacao=0;
  }
  enquadrar(j,dt,parado){
    const h=j.heroi,w=this.canvas.width,alt=this.canvas.height;
    if(Math.abs(this.ultimoHeroi-h.x)>w*.6){this.centrar(j);return;}
    const alvoLook=parado?0:(h.dir||1)*w*(.075+.09*Math.min(1,Math.abs(h.vx)/128));
    this.look+=(alvoLook-this.look)*Math.min(1,dt*3.2);
    const metaX=limite(h.x+h.w/2-w*.5+this.look,0,Math.max(0,j.fase.largura-w));
    this.cameraX+=(metaX-this.cameraX)*Math.min(1,dt*(parado?9:8));
    const pe=h.y+h.h;
    if(h.noChao||pe<this.ancoraY-38||pe>this.ancoraY+36)this.ancoraY+=(pe-this.ancoraY)*Math.min(1,dt*8);
    const alvoY=limite(this.ancoraY-alt*.76,-94,76);
    this.cameraY+=(alvoY-this.cameraY)*Math.min(1,dt*4.8);
    this.ultimoHeroi=h.x;
  }
  efeito(d){
    if(!d||!Number.isFinite(d.x)||!Number.isFinite(d.y)||!CORES_FX[d.tipo])return;
    const efeito=this.efeitos[this.proximoEfeito];
    this.proximoEfeito=(this.proximoEfeito+1)%this.efeitos.length;
    efeito.x=d.x;efeito.y=d.y;efeito.tipo=d.tipo;efeito.dir=d.dir||1;
    efeito.idade=0;efeito.dur=DURACOES[d.tipo]||.29;
    const intensidade=limite(d.intensidade||1,.15,2);
    if(d.tipo==='dano')this.tremor=Math.max(this.tremor,intensidade);
    if(d.tipo==='impacto-metal'||d.tipo==='impacto')this.tremor=Math.max(this.tremor,intensidade*.55);
    if(d.tipo==='aparo-perfeito'||d.tipo==='perfeito')this.flash=.15;
    if(d.tipo==='pouso')this.deformacao=-.17;
    if(d.tipo==='pulo')this.deformacao=.14;
  }
  fundo(j,xCam,yCam,w,h){
    const c=this.c,reg=j.fase.regiao,p=PALETAS[reg],img=this.arte.fundos?.[j.fase.id-1];
    tinta(c,p.nevoa,0,0,w,h);
    if(img){
      const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
      // Uma unidade da imagem vale uma unidade no palco; o recorte menor acompanha a visão em retrato.
      const sobraX=Math.max(0,iw-w),sobraY=Math.max(0,ih-h);
      const centro=j.fase.largura>0?xCam/Math.max(1,j.fase.largura-w):0;
      const x=Math.round(sobraX*(.12+.76*limite(centro,0,1))),y=Math.round(limite(sobraY*.48+yCam*.16,0,sobraY));
      c.drawImage(img,-x,-y);
    }
    tinta(c,'#16202e33',0,0,w,h);
    // Os contornos de terreno distante ficam abaixo da ação. A espessura do solo verdadeiro é opaca.
    const desloc=-Math.round(xCam*.22)%640,dy=Math.round(-yCam*.35+8);
    c.drawImage(this.margem,desloc,dy);if(desloc+640<w)c.drawImage(this.margem,desloc+640,dy);
    if(dy+this.margem.height<h)tinta(c,p.nevoa,0,dy+this.margem.height,w,h-dy-this.margem.height);
  }
  particulas(c,saltou,parado,regiao){
    for(const p of this.efeitos){
      if(p.idade>=p.dur)continue;
      p.idade+=saltou;
      if(p.idade>=p.dur)continue;
      const a=p.idade/p.dur,x=Math.round(p.x),y=Math.round(p.y);
      const cor=POEIRA.has(p.tipo)?TONS_POEIRA[regiao]:CORES_FX[p.tipo];
      if(parado){if(FAISCA.has(p.tipo)&&a<.45)diamante(c,cor,x,y,2);continue;}
      c.globalAlpha=Math.min(1,(1-a)*2);
      if(FAISCA.has(p.tipo)){
        const alcance=3+a*(p.tipo==='estrela'?15:10);
        for(let i=0;i<5;i++){
          const ang=i*Math.PI*2/5+.4;
          linha(c,i===0?'#fff3d0':cor,x+Math.cos(ang)*alcance*.5,y+Math.sin(ang)*alcance*.5,
            x+Math.cos(ang)*alcance,y+Math.sin(ang)*alcance);
        }
      }else if(POEIRA.has(p.tipo)){
        const nP=p.tipo==='pisada'?9:5;
        for(let i=0;i<nP;i++){
          const dx=(i-(nP-1)/2)*(2+a*(p.tipo==='pisada'?8:3)),dy=Math.sin(Math.PI*a)*(3+i%3*2);
          tinta(c,cor,x+dx,y-dy-(i%2),a<.5?2:1,1);
        }
      }else{
        for(let i=0;i<4;i++)tinta(c,cor,x+(i-1.5)*(2+a*2),y-a*(5+3*(i%3)),1,i%2+1);
      }
      c.globalAlpha=1;
    }
  }
  exibir(j,dt=1/60,opcoes={}){
    if(!j?.fase||!j.heroi)return;
    if(this.faseAtual!==j.fase)this.preparar(j);
    const c=this.c,w=this.canvas.width,h=this.canvas.height,parado=opcoes?.movimento===false||opcoes?.reduzido===true;
    const passo=limite(Number.isFinite(dt)&&dt>0&&dt<1?dt:1/60,0,.1);
    this.enquadrar(j,passo,parado);
    const tremor=parado?0:this.tremor*(opcoes.tremor??.65);
    const balanço=Math.sin(this.tremor*46)*tremor;
    const cx=Math.round(limite(this.cameraX+balanço*5,0,Math.max(0,j.fase.largura-w)));
    const cy=Math.round(limite(this.cameraY+balanço*2,-94,76)),t=j.tempo||0;
    this.tremor=Math.max(0,this.tremor-passo*8);
    this.flash=Math.max(0,this.flash-passo);
    this.deformacao*=Math.max(0,1-passo*15);
    c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.globalAlpha=1;
    this.fundo(j,cx,cy,w,h);
    const f=j.fase,perfil=j.perfil,br=this.brilhos;
    const vis=(x,margem=25)=>x>=cx-margem&&x<=cx+w+margem;
    const portaAberta=g=>j.portaAberta(g);
    c.save();c.translate(-cx,-cy);
    if(f.bento&&vis(f.bento.x,55)){
      oficina(c,f.bento.x,f.bento.y,t,this.oficina,br,parado);
      const distancia=Math.abs(j.heroi.x+j.heroi.w/2-f.bento.x);
      const gravando=j.emTreino||opcoes?.oficina===true,saudando=!gravando&&distancia<32;
      const fileira=gravando?2:saudando?1:0,col=parado?0:Math.floor(t*(gravando?4:2.4))%4;
      if(this.arte.bento)c.drawImage(this.arte.bento,col*60,fileira*56,60,56,Math.round(f.bento.x)-29,Math.round(f.bento.y)-52,60,56);
    }
    if(f.treino&&vis(f.treino.x)&&!j.emTreino){
      const x=f.treino.x,y=f.treino.y;
      if(this.feras)c.drawImage(this.feras,0,10*72,108,72,Math.round(x)-49,Math.round(y)-65,108,72);
    }
    for(const s of f.santuarios)if(vis(s.x))santuario(c,s.x,s.y,perfil.santuario?.fase===f.id&&perfil.santuario?.id===s.id,t,br,parado);
    for(const a of f.atalhos){
      const ativo=acesa(perfil.atalhos?.[f.id],a.id);
      if(vis(a.x))atalho(c,a.x,a.y,ativo,true,t,br);
      if(vis(a.paraX))atalho(c,a.paraX,a.paraY,ativo,false,t,br);
    }
    if(f.saida&&vis(f.saida.x,30))portao(c,f.saida.x,f.saida.y,f.inimigos.every(i=>!i.obrigatorio||j.venceuEncontro(i.id)),parado?0:t,br,true);
    for(const g of f.portas)if(vis(g.x))portao(c,g.x,g.y,portaAberta(g),t,br);
    for(const p of j.pisos){
      if(p.x+p.w<cx-8||p.x>cx+w+8||p.y+p.h<cy-4||p.y>cy+h+8)continue;
      const orig=this.porId.get(p.id);
      trilho(c,p,orig,t,parado);
      if(p.estado==='ausente')continue;
      const desenha=this.superficies.get(p.id);
      if(desenha)c.drawImage(desenha,Math.round(p.x),Math.round(p.y));
      rachadura(c,p,t,parado);
    }
    for(const p of f.espinhos)if(p.x+p.w>=cx-4&&p.x<cx+w+4)perigo(c,p,t,parado);
    desenharAmbiente(c,j,opcoes.altoContraste,cx-16,cx+w+16,parado);
    for(const item of f.moedas)if(vis(item.x)&&!acesa(perfil.coletas?.[f.id],item.id))eco(c,item.x,item.y,item.valor,t,br,parado);
    for(const s of f.estrelas)if(vis(s.x)&&!acesa(perfil.estrelas?.[f.id],s.id))estrela(c,s.x,s.y,t,br,parado);
    if(perfil.mancha?.fase===f.id&&vis(perfil.mancha.x))mancha(c,perfil.mancha,t,br,parado);
    for(const i of j.inimigos)if(vis(i.x,65))desenharInimigo(c,i,j,this.feras,this.ferasClaras,t,parado,br,opcoes.altoContraste);
    for(const p of j.projeteis||[])if(vis(p.x))projetil(c,p,t);
    const fantasma=posicaoFantasma(opcoes.fantasma,t*1000,this.fantasma);
    if(fantasma&&vis(fantasma.x)){
      const x=Math.round(fantasma.x),y=Math.round(fantasma.y);
      c.globalAlpha=.58;diamante(c,'#c8e9f9',x,y-23,4);
      tinta(c,'#86d4ea',x-3,y-16,6,12);tinta(c,'#d6f2f4',x-5,y-6,10,2);
      c.globalAlpha=1;
    }
    if(!parado&&Math.abs(this.deformacao)>.01){
      const h=j.heroi,x=h.x+h.w/2,y=h.y+h.h;
      c.save();c.translate(x,y);c.scale(1-this.deformacao*.7,1+this.deformacao);c.translate(-x,-y);
      desenharHeroi(c,h,this.arte.hero,t,parado,br);c.restore();
    }else desenharHeroi(c,j.heroi,this.arte.hero,t,parado,br);
    this.particulas(c,passo,parado,f.regiao);
    c.restore();luzAmbiente(c,w,h,t,cx,cy,f.regiao,parado);
    if(!parado&&this.flash>0&&(opcoes.flash??.65)>0){
      c.globalAlpha=this.flash*(opcoes.flash??.65);
      tinta(c,'#c8ffe7',0,0,w,h);
    }
    c.globalAlpha=1;
  }
}
Object.defineProperty(exports, "Pintura", { enumerable: true, get: () => Pintura });
});
