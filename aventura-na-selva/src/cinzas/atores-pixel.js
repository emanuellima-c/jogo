import { tinta,linha,fios,pol,disco,diamante,luz } from './formas.js';
import { GOLPES_INIMIGOS } from './ajustes.js';
import { janelaOuro } from './inimigos.js';
import { DESENHOS_CRIATURAS } from './criaturas-pixel.js';

const ALTURAS={
  vigia:34,lanceiro:37,voador:25,escudo:33,elite:43,chefe:48,boneco:34,
  escavador:36,cuspidor:35,ressonante:41,sineiro:41,miragem:43,
  areeiro:39,cristalino:47,patinador:38,fornalha:44,fagulheiro:34
};
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
  if(acao==='guarda')return [LINHA_HEROI.aparo,2];
  if(acao==='talento')acao=h.golpeAcao?.dano?'pesado':'cura';
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
  const g=h.golpeAcao,corClasse=h.classe?.id==='herdeiro'?null:h.classe?.cor;
  if(h.acao==='guarda'){
    const d=h.dir;
    pol(c,'#343947',[x+d*7,y-32,x+d*18,y-28,x+d*17,y-17,x+d*11,y-11,x+d*7,y-18]);
    fios(c,'#e7eef3',[x+d*8,y-31,x+d*16,y-28,x+d*15,y-18,x+d*11,y-13]);
    tinta(c,'#e7eef3',x+d*12,y-24,2,3);
  }else if(g?.projetil&&h.etapa==='preparo'){
    const px=x+h.dir*14,py=y-20;
    diamante(c,'#6c9cf8',px,py,h.acao==='pesado'?5:3);
    tinta(c,'#f0f8ff',px,py);
  }else if(h.etapa==='impacto'&&(g?.radial||['leve','pesado','retorno','quebra'].includes(h.acao)&&!g?.projetil)){
    const cor=h.acao==='retorno'?'#a7f1d5':corClasse??'#e4d9b2';
    const progresso=(h.progressoEtapa||0)*.95;
    arcoGolpe(c,x,y-17,h.dir,progresso,cor,h.acao!=='leve',false);
    if(g?.radial)arcoGolpe(c,x,y-17,-h.dir,progresso,cor,h.acao!=='leve',false);
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
  if(h.barreiraClasse>0){
    const cor=corClasse??'#a9d6ff';
    fios(c,cor,[x-14,y-8,x-18,y-18,x-15,y-29,x-8,y-35]);
    fios(c,cor,[x+14,y-8,x+18,y-18,x+15,y-29,x+8,y-35]);
    diamante(c,cor,x,y-38,3);
  }else if(h.contraClasse>0){
    diamante(c,'#fce1ac',x+h.dir*8,y-37,3);
  }else if(h.classe?.recurso?.tipo==='furia'&&h.recursoClasse>0){
    for(let ponto=0;ponto<h.recursoClasse;ponto++)diamante(c,corClasse,x-7+ponto*7,y-37,2);
  }
  if(h.retorno>0 && h.acao==='livre'){
    const altura=y-38;
    fios(c,'#a5e5cd',[x-4,altura,x-2,altura-2,x+2,altura-2,x+4,altura]);
  }
}
function formaDoAviso(id,golpe){
  if(golpe.movimento==='salto')return 'salto';
  if(golpe.campo)return 'campo';
  if(id==='mergulho')return 'mergulho';
  if(golpe.onda)return 'linha';
  if(golpe.janelas)return 'repique';
  if(golpe.sinal==='trilho')return 'trilho';
  return 'alcance';
}

function prepararAvisos(altoContraste){
  const avisos=Object.create(null);
  for(const [id,golpe] of Object.entries(GOLPES_INIMIGOS)){
    const imparavel=Boolean(golpe.imparavel);
    avisos[id]=Object.freeze({
      forma:formaDoAviso(id,golpe),marca:imparavel?'serrilha':'diamante',imparavel,
      cor:imparavel?(altoContraste?'#ff5959':'#f69b88'):(altoContraste?'#fff4a8':'#efc97b'),
      contorno:'#282631',espessura:altoContraste?2:1,
      aviso:golpe.aviso,alcance:golpe.alcance,altura:golpe.altura,
      avanco:(golpe.avanco||0)*golpe.impacto,janelas:golpe.janelas?.length||1,
      trechoProjetil:(golpe.onda||0)*(golpe.projetil?1.1:1.8)
    });
  }
  return Object.freeze(avisos);
}

const AVISOS_GOLPES = [prepararAvisos(false),prepararAvisos(true)];

function avisoDoGolpe(id, altoContraste=false){
  return AVISOS_GOLPES[Number(Boolean(altoContraste))][id]??null;
}

function sinalAtaque(c,i,x,y,brilhos,parado,altoContraste){
  const k=Math.min(1,i.avisoProgresso||0),ponto=y-3;
  if(i.transicao){
    luz(c,x,ponto,10,brilhos.ouro,.35);
    diamante(c,'#342a37',x,ponto,7);diamante(c,'#ffc38d',x,ponto,5);diamante(c,'#805e64',x,ponto,3);
    tinta(c,'#ffdd9e',x-1,ponto-2,1,4);tinta(c,'#ffdd9e',x+1,ponto-2,1,4);return;
  }
  const aviso=avisoDoGolpe(i.ataqueId,altoContraste);
  if(!aviso)return;
  const {cor,contorno}=aviso;
  const r=5+2*(aviso.espessura-1)+Math.floor(k*2);
  luz(c,x,ponto,r+3,aviso.imparavel?brilhos.rubro:brilhos.ouro,.22+k*.25);
  if(aviso.marca==='serrilha'){
    const dentes=[x-r-2,ponto+2,x-r-2,ponto-5,x-4,ponto-3,x-3,ponto-r-2,
      x-1,ponto-4,x+1,ponto-4,x+3,ponto-r-2,x+4,ponto-3,x+r+2,ponto-5,x+r+2,ponto+2];
    diamante(c,contorno,x,ponto,r+1);
    fios(c,contorno,dentes,aviso.espessura+2);
    fios(c,cor,dentes,aviso.espessura);
    linha(c,'#ffd4b8',x-2,ponto-2,x+2,ponto+2);
    linha(c,'#ffd4b8',x+2,ponto-2,x-2,ponto+2);
  }else{
    diamante(c,contorno,x,ponto,r+1);diamante(c,cor,x,ponto,r);diamante(c,'#4d3939',x,ponto,r-1);
    tinta(c,'#ffe4a5',x,ponto-3,1,3);tinta(c,'#ffe4a5',x,ponto+1);
  }
  tinta(c,contorno,x-7,ponto+r+2,14,aviso.espessura+1);
  tinta(c,cor,x-7,ponto+r+2,Math.max(1,Math.round(14*k)),aviso.espessura);
  if(aviso.janelas>1){
    tinta(c,cor,x-4,ponto+r+5,3,2);
    tinta(c,cor,x+2,ponto+r+5,3,2);
  }
  if(k>.74&&!parado){
    const corpo=i.x+i.w/2;
    tinta(c,cor,corpo+(i.dir||1)*(i.w/2+2),i.y+i.h*.44,2,2);
  }
}

function tracoDeAviso(c, aviso, x1, y1, x2, y2){
  linha(c,aviso.contorno,x1-1,y1-1,x2-1,y2-1,aviso.espessura+2);
  linha(c,aviso.cor,x1,y1,x2,y2,aviso.espessura);
}

function faixaDeAviso(c, aviso, x, y, dx, dy, arco=0, queda=0){
  const comprimento=Math.max(Math.abs(dx),Math.abs(dy),arco,queda);
  if(comprimento<2)return;
  const partes=Math.ceil(comprimento/12);
  const altura=passo=>y+dy*passo-arco*Math.sin(Math.PI*passo)+queda*passo*passo;
  for(let segmento=0;segmento<partes;segmento++){
    const inicio=segmento/partes;
    const fim=(segmento+.57)/partes;
    tracoDeAviso(c,aviso,x+dx*inicio,altura(inicio),x+dx*fim,altura(fim));
    if(aviso.forma==='trilho')tracoDeAviso(c,aviso,x+dx*inicio,altura(inicio)-3,x+dx*fim,altura(fim)-3);
  }
  const fimX=x+dx,fimY=altura(1);
  const antes=Math.max(0,1-6/comprimento);
  const meioX=x+dx*antes,meioY=altura(antes);
  const vx=fimX-meioX,vy=fimY-meioY;
  const norma=Math.max(1,Math.hypot(vx,vy));
  const asaX=vy*3/norma,asaY=vx*3/norma;
  tracoDeAviso(c,aviso,meioX+asaX,meioY-asaY,fimX,fimY);
  tracoDeAviso(c,aviso,meioX-asaX,meioY+asaY,fimX,fimY);
}

function desenharAvisoTrajetoria(c,inimigo,altoContraste=false){
  const golpe=GOLPES_INIMIGOS[inimigo.ataqueId];
  const aviso=avisoDoGolpe(inimigo.ataqueId,altoContraste);
  if(!aviso||aviso.forma==='campo')return; // O terreno pinta a área exata.
  const direcao=inimigo.dir||1;
  const centro=inimigo.x+inimigo.w/2;
  const solo=inimigo.y+inimigo.h;
  const frente=centro+direcao*inimigo.w/2;
  if(aviso.forma==='salto'){
    faixaDeAviso(c,aviso,centro,solo-4,(inimigo.alvoX??centro)-centro,0,31);
    return;
  }
  if(aviso.forma==='mergulho'){
    const y=inimigo.y+inimigo.h/2;
    faixaDeAviso(c,aviso,centro,y,(inimigo.alvoX??centro)-centro,(inimigo.alvoY??inimigo.y)-inimigo.y);
    return;
  }
  if(aviso.forma==='linha'){
    const y=golpe.projetil||inimigo.ataqueId==='teia'?inimigo.y+inimigo.h*.53+2:solo-5;
    const vida=aviso.trechoProjetil/golpe.onda;
    faixaDeAviso(c,aviso,frente,y,direcao*aviso.trechoProjetil,golpe.queda?-12*vida:0,0,(golpe.queda||0)*vida*vida/2);
    if(aviso.alcance===0)return;
  }
  const limite=direcao>0?inimigo.max:inimigo.min;
  const avanco=Math.min(aviso.avanco,Math.max(0,((limite??centro+direcao*aviso.avanco)-centro)*direcao));
  const y=aviso.forma==='trilho'?solo-5:inimigo.y+inimigo.h*.6;
  faixaDeAviso(c,aviso,frente,y,direcao*(aviso.alcance+avanco),0);
}

function desenharInimigo(c,i,jogo,img,flash,t,parado,brilhos,altoContraste=false) {
  if(i.estado==='morto')return;
  const arquetipo=i.arquetipo||i.tipo;
  const r=i.tipo==='chefe'?CHEFE[jogo.fase.id]??9:LINHA_INIMIGO[arquetipo]??0;
  let q=Math.floor((t+i.x*.002)*5)%4;
  if(i.estado==='aviso')q=4+(i.avisoProgresso>.53?1:0);
  else if(i.estado==='impacto')q=6+(i.tempo>(i.duracao||.2)*.5?1:0);
  else if(i.estado==='recuperacao')q=8+(i.tempo>(i.duracao||.5)*.5?1:0);
  else if(i.estado==='aberto')q=10;
  const x=Math.round(i.x+i.w/2),piso=Math.round(i.y+i.h),yIcone=piso-(ALTURAS[i.tipo]||ALTURAS[arquetipo]||32);
  const desenho=DESENHOS_CRIATURAS[i.tipo];
  if(arquetipo!=='voador')disco(c,'#11162266',x,piso-1,Math.ceil(i.w*.6),2);
  if(desenho){
    desenho(c,i,x,piso,i.flash>.035,altoContraste);
  }else{
    sprite(c,i.flash>.035&&flash?flash:img,x,piso,i.dir||1,108,72,49,65,q,r);
    if(i.cor){
      diamante(c,'#282630',x-i.dir*3,piso-i.h*.66,i.tipo==='mini'?5:4);
      diamante(c,i.cor,x-i.dir*3,piso-i.h*.66,i.tipo==='mini'?3:2);
    }
  }
  if(i.estado==='aviso'){
    if(!i.transicao)desenharAvisoTrajetoria(c,i,altoContraste);
    sinalAtaque(c,i,x,yIcone,brilhos,parado,altoContraste);
  }
  else if(i.estado==='aberto'){
    fios(c,'#a5d2bc',[x-5,yIcone-4,x-4,yIcone,x-1,yIcone+2,x,yIcone-2]);
    fios(c,'#e6c98f',[x+2,yIcone-2,x+4,yIcone-4,x+5,yIcone-2,x+3,yIcone]);
  }else if(i.vida<i.vidaMax&&i.tipo!=='chefe'&&i.tipo!=='boneco'){
    tinta(c,'#22232c',x-9,yIcone-1,18,3);tinta(c,'#d79a83',x-8,yIcone,Math.max(1,Math.round(16*i.vida/i.vidaMax)),1);
  }
  const golpe=GOLPES_INIMIGOS[i.ataqueId];
  if(i.estado==='impacto'&&!desenho&&arquetipo!=='voador'&&!golpe?.onda&&!golpe?.campo){
    const av=Math.min(1,i.tempo/(i.duracao||.3));
    if(i.ataqueId==='estocada'||i.ataqueId==='investida'){
      linha(c,'#c79b88',x+i.dir*i.w*.4,piso-i.h*.55,x+i.dir*(i.w*.5+23),piso-i.h*.55);
    }else arcoGolpe(c,x,piso-i.h*.5,i.dir,av*.9,i.imparavel?'#e79a85':'#ccad8e',i.tipo==='chefe',false);
  }
  if(janelaOuro(i,true)){
    const lado=x-(i.dir||1)*16, cor=altoContraste?'#fff6c0':'#f9d077';
    diamante(c,'#302630',lado,yIcone,6);
    diamante(c,cor,lado,yIcone,4);
    diamante(c,'#302630',lado,yIcone,2);
  }
  if(i.queimadura){
    tinta(c,'#ff9d66',x-2,piso-9,4,4);
    tinta(c,'#ffe1a7',x,piso-12,2,5);
  }
}
function projetil(c,p,t){
  const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w),h=Math.round(p.h);
  if(p.tipo==='arcano'||p.tipo==='arcano-forte'){
    const px=x+w/2+p.dir*2,py=y+h/2,r=p.tipo==='arcano-forte'?5:3;
    linha(c,'#597cd0',px-p.dir*(w-2),py,px,py,r-1);
    diamante(c,'#9cc9ff',px,py,r);
    diamante(c,'#f0f8ff',px,py,r-2);
    return;
  }
  if(p.tipo==='semente'||p.tipo==='brasa'){
    const cor=p.tipo==='semente'?'#d6e6a1':'#ffbf84';
    linha(c,p.tipo==='semente'?'#7a875b':'#ce7863',x+w/2-p.dir*w/2,y+h/2,x+w/2,y+h/2,2);
    diamante(c,cor,x+w/2+p.dir*2,y+h/2,3);
    return;
  }
  if(p.tipo==='teia'){
    fios(c,'#d9bad1',[x,y+h/2,x+w*.3,y,x+w*.7,y+h*.7,x+w,y+h*.25]);
    tinta(c,'#f0dedd',x+w*.45,y+h*.4,2,2);return;
  }
  c.save();c.translate(x+(p.dir<0?w:0),y);if(p.dir<0)c.scale(-1,1);
  pol(c,'#994f52',[0,h,w*.3,h*.5,w*.55,h*.65,w*.72,0,w,h*.42,w,h]);
  pol(c,'#e19975',[w*.27,h-1,w*.61,h*.65,w*.74,2,w*.9,h*.45,w*.84,h-1]);
  tinta(c,'#ffdc9b',w*.72,2,2,3);c.restore();
}
export { desenharHeroi,desenharInimigo,projetil,DESENHOS_CRIATURAS,avisoDoGolpe,desenharAvisoTrajetoria };
