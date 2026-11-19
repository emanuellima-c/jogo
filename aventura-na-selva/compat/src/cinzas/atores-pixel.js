// Gerado a partir de src/cinzas/atores-pixel.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/atores-pixel.js", function (exports, usar) {
"use strict";
const { tinta, linha, fios, pol, disco, diamante, luz } = usar("src/cinzas/formas.js");
const ALTURAS={vigia:34,lanceiro:37,voador:25,escudo:33,elite:43,chefe:48,boneco:34};
const LINHA_INIMIGO={vigia:0,lanceiro:1,voador:2,escudo:3,elite:4,boneco:10};
const CHEFE={4:5,7:6,10:7,12:8,15:9};
const LINHA_HEROI={livre:0,corrida:1,salto:2,queda:3,leve:4,pesado:5,esquiva:6,cura:7,dano:8,retorno:9,quebra:10,aparo:11,estocada:12,pisada:13,eco:14,morto:15,descanso:16};
const TOTAL_HEROI=[4,6,2,2,6,6,6,5,3,6,6,5,5,5,5,5,4];
function sprite(c,img,x,y,dir,largura,altura,ancoraX,ancoraY,coluna,fileira){
  if(!img)return;
  x=Math.round(x);y=Math.round(y);
  c.save();c.translate(x,y);if(dir<0)c.scale(-1,1);
  c.drawImage(img,coluna*largura,fileira*altura,largura,altura,-ancoraX,-ancoraY,largura,altura);c.restore();
}
function faseGolpe(h,n){
  const progresso=Math.min(.999,Math.max(0,h.progressoEtapa||0));
  if(h.etapa==='preparo')return Math.min(1,Math.floor(progresso*2));
  if(h.etapa==='impacto')return 2+Math.min(1,Math.floor(progresso*2));
  return 4+Math.floor(progresso*(n-4));
}
function quadroHeroi(h,tempo,parado){
  let acao=h.acao||'livre';
  if(acao==='livre'){
    if(!h.noChao)acao=h.vy<0?'salto':'queda';
    else if(Math.abs(h.vx)>9)acao='corrida';
  }
  const r=LINHA_HEROI[acao]??0,n=TOTAL_HEROI[r];
  let q;
  if(r===0||r===16)q=parado?0:Math.floor(tempo*2)%n;
  else if(r===1)q=Math.floor(tempo*11)%n;
  else if(r===2||r===3)q=Math.floor(tempo*4)%n;
  else if(r===6||r===8||r===15)q=Math.floor(Math.min(.999,h.tempoAcao/(h.duracaoAcao||.35))*n);
  else q=faseGolpe(h,n);
  return [r,Math.max(0,Math.min(n-1,q))];
}
function arcoGolpe(c,x,y,dir,t,cor,largo,preparo){
  c.save();c.translate(Math.round(x),Math.round(y));if(dir<0)c.scale(-1,1);
  const a=(preparo?-.8:-1.4)+t,l=preparo?.45:1.32,r=largo?27:21;
  let ultimo;
  for(let i=0;i<=8;i++){
    const f=a+i*l/8,px=Math.round(Math.cos(f)*r),py=Math.round(Math.sin(f)*r*.8);
    if(ultimo)linha(c,cor,ultimo[0],ultimo[1],px,py,i>2&&i<6&&largo?2:1);
    ultimo=[px,py];
  }
  c.restore();
}
function desenharHeroi(c,h,img,t,parado,brilhos){
  const x=Math.round(h.x+h.w/2),y=Math.round(h.y+h.h),[r,q]=quadroHeroi(h,t,parado);
  if(h.noChao)disco(c,'#11162260',x,y-1,9,2);
  if(h.acao==='eco' && h.etapa==='impacto'){
    c.globalAlpha=.24;sprite(c,img,x-h.dir*12,y,h.dir,84,54,36,48,q,r);c.globalAlpha=1;
  }
  if(h.invul>0&&h.acao!=='esquiva'&&!parado)c.globalAlpha=.68+Math.abs(Math.sin(t*15))*.32;
  sprite(c,img,x,y,h.dir,84,54,36,48,q,r);
  c.globalAlpha=1;
  if(h.etapa==='impacto'&&['leve','pesado','retorno','quebra'].includes(h.acao)){
    arcoGolpe(c,x,y-17,h.dir,(h.progressoEtapa||0)*.95,h.acao==='retorno'?'#a7f1d5':'#e4d9b2',h.acao!=='leve',false);
  }else if(h.acao==='estocada'&&h.etapa==='impacto'){
    const dx=h.dir;linha(c,'#b8e3ce',x+dx*17,y-19,x+dx*39,y-19);
    linha(c,'#74a99d',x-dx*4,y-16,x+dx*14,y-16);
  }else if(h.acao==='quebra'&&h.etapa==='preparo'&&h.tempoAcao>.25){
    luz(c,x-4*h.dir,y-24,9,brilhos.ouro,.45);
    tinta(c,'#fae2a1',x-5*h.dir,y-24,2);
  }else if(h.acao==='cura'&&h.etapa!=='recuperacao'){
    luz(c,x+h.dir*5,y-26,9,brilhos.ouro,.48);
  }else if(h.acao==='aparo'&&h.etapa==='impacto'){
    fios(c,'#bce7da',[x+h.dir*6,y-34,x+h.dir*13,y-31,x+h.dir*16,y-22,x+h.dir*12,y-14]);
  }else if(h.acao==='pisada'&&h.etapa==='impacto'&&!h.noChao){
    linha(c,'#edc887',x-4,y-3,x-4,y-15);linha(c,'#dbaa73',x+5,y-6,x+5,y-13);
  }
  if(h.retorno>0 && h.acao==='livre'){
    const altura=y-38;
    fios(c,'#a5e5cd',[x-4,altura,x-2,altura-2,x+2,altura-2,x+4,altura]);
  }
}
function sinalAtaque(c,i,x,y,t,brilhos,parado){
  const k=Math.min(1,i.avisoProgresso||0),ponto=y-3;
  const fatal=i.imparavel,cor=fatal?'#f69b88':'#efc97b';
  const halo=fatal?brilhos.rubro:brilhos.ouro,r=5+Math.floor(k*2);
  luz(c,x,ponto,r+3,halo,.22+k*.25);
  if(i.transicao){
    diamante(c,'#342a37',x,ponto,7);diamante(c,'#ffc38d',x,ponto,5);diamante(c,'#805e64',x,ponto,3);
    tinta(c,'#ffdd9e',x-1,ponto-2,1,4);tinta(c,'#ffdd9e',x+1,ponto-2,1,4);return;
  }
  diamante(c,'#282631',x,ponto,r+1);diamante(c,cor,x,ponto,r);diamante(c,'#4d3939',x,ponto,r-1);
  if(fatal){
    linha(c,'#ffd4b8',x-2,ponto-2,x+2,ponto+2);
    linha(c,'#ffd4b8',x+2,ponto-2,x-2,ponto+2);
  }else{
    tinta(c,'#ffe4a5',x,ponto-3,1,3);tinta(c,'#ffe4a5',x,ponto+1);
  }
  tinta(c,'#272630',x-7,ponto+r+2,14,2);tinta(c,cor,x-7,ponto+r+2,Math.max(1,Math.round(14*k)),1);
  if(k>.74&&!parado){
    const corpo=i.x+i.w/2;
    tinta(c,cor,corpo+(i.dir||1)*(i.w/2+2),i.y+i.h*.44,2,2);
  }
}
function desenharInimigo(c,i,jogo,img,flash,t,parado,brilhos) {
  if(i.estado==='morto')return;
  const r=i.tipo==='chefe'?CHEFE[jogo.fase.id]??9:LINHA_INIMIGO[i.tipo]??0;
  let q=Math.floor((t+i.x*.002)*5)%4;
  if(i.estado==='aviso')q=4+(i.avisoProgresso>.53?1:0);
  else if(i.estado==='impacto')q=6+(i.tempo>(i.duracao||.2)*.5?1:0);
  else if(i.estado==='recuperacao')q=8+(i.tempo>(i.duracao||.5)*.5?1:0);
  else if(i.estado==='aberto')q=10;
  const x=Math.round(i.x+i.w/2),piso=Math.round(i.y+i.h),yIcone=piso-(ALTURAS[i.tipo]||32);
  if(i.tipo!=='voador')disco(c,'#11162266',x,piso-1,Math.ceil(i.w*.6),2);
  sprite(c,i.flash>.035&&flash?flash:img,x,piso,i.dir||1,108,72,49,65,q,r);
  if(i.estado==='aviso')sinalAtaque(c,i,x,yIcone,t,brilhos,parado);
  else if(i.estado==='aberto'){
    fios(c,'#a5d2bc',[x-5,yIcone-4,x-4,yIcone,x-1,yIcone+2,x,yIcone-2]);
    fios(c,'#e6c98f',[x+2,yIcone-2,x+4,yIcone-4,x+5,yIcone-2,x+3,yIcone]);
  }else if(i.vida<i.vidaMax&&i.tipo!=='chefe'&&i.tipo!=='boneco'){
    tinta(c,'#22232c',x-9,yIcone-1,18,3);tinta(c,'#d79a83',x-8,yIcone,Math.max(1,Math.round(16*i.vida/i.vidaMax)),1);
  }
  if(i.estado==='impacto' && i.tipo!=='voador' && i.ataqueId!=='onda' && i.ataqueId!=='teia'){
    const av=Math.min(1,i.tempo/(i.duracao||.3));
    if(i.ataqueId==='estocada'||i.ataqueId==='investida'){
      linha(c,'#c79b88',x+i.dir*i.w*.4,piso-i.h*.55,x+i.dir*(i.w*.5+23),piso-i.h*.55);
    }else arcoGolpe(c,x,piso-i.h*.5,i.dir,av*.9,i.imparavel?'#e79a85':'#ccad8e',i.tipo==='chefe',false);
  }
}
function projetil(c,p,t){
  const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w),h=Math.round(p.h);
  if(p.tipo==='teia'){
    fios(c,'#d9bad1',[x,y+h/2,x+w*.3,y,x+w*.7,y+h*.7,x+w,y+h*.25]);
    tinta(c,'#f0dedd',x+w*.45,y+h*.4,2,2);return;
  }
  c.save();c.translate(x+(p.dir<0?w:0),y);if(p.dir<0)c.scale(-1,1);
  pol(c,'#994f52',[0,h,w*.3,h*.5,w*.55,h*.65,w*.72,0,w,h*.42,w,h]);
  pol(c,'#e19975',[w*.27,h-1,w*.61,h*.65,w*.74,2,w*.9,h*.45,w*.84,h-1]);
  tinta(c,'#ffdc9b',w*.72,2,2,3);c.restore();
}
Object.defineProperty(exports, "desenharHeroi", { enumerable: true, get: () => desenharHeroi });
Object.defineProperty(exports, "desenharInimigo", { enumerable: true, get: () => desenharInimigo });
Object.defineProperty(exports, "projetil", { enumerable: true, get: () => projetil });
});
