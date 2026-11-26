import { tinta, linha, fios, pol, disco, diamante } from './formas.js';

const CONTORNO = '#25202c';
const ALTO_CONTRASTE = ['#6b6673','#bbb7be','#fff3d2'];
const CLARAO = ['#8c7d82','#e5ca9c','#ffeed6'];
const POSES = {patrulha:0,aviso:1,impacto:2,recuperacao:3,aberto:3};

// Cada criatura ocupa pixels inteiros. Os desenhos compartilham a âncora nos pés,
// com poses em patrulha, aviso, impacto e recuperação, voltadas para a direita.
function artista(desenho, paleta){
  return (tela, inimigo, x, pe, pisca, altoContraste)=>{
    tela.save();
    tela.translate(Math.round(x),Math.round(pe));
    if(inimigo.dir<0)tela.scale(-1,1);
    desenho(tela,POSES[inimigo.estado]??0,altoContraste?ALTO_CONTRASTE:pisca?CLARAO:paleta,inimigo);
    tela.restore();
  };
}

function escavador(c, pose, [sombra,casca,luz], inimigo){
  if(inimigo.intangivel){
    pol(c,CONTORNO,[-14,0,-11,-4,-6,-4,-3,-7,4,-7,9,-4,13,-3,16,0]);
    fios(c,casca,[-11,-1,-6,-3,-3,-2,3,-5,7,-4,12,-1],2);
    tinta(c,luz,-3,-4,2);tinta(c,luz,5,-3,2);
    return;
  }
  const alto=pose===2?-24:pose===1?-10:pose===3?-14:-19;
  const x=pose===2?8:pose===3?7:3;
  pol(c,CONTORNO,[-16,-3,-13,-10,-10,alto+3,-6,alto-3,-2,alto,3,alto-4,8,alto+2,x+10,alto+8,x+13,-5,x+8,0,-11,0]);
  pol(c,sombra,[-14,-3,-9,-10,-6,alto,-2,alto+3,3,alto-1,8,alto+4,x+9,alto+10,x+11,-4,x+8,-2,-11,-2]);
  pol(c,casca,[-11,-9,-7,alto+2,-5,alto-1,-2,alto+3,3,alto-2,8,alto+4,3,-7,-5,-6]);
  disco(c,casca,x+3,alto+8,7,5);
  tinta(c,CONTORNO,x+4,alto+5,2,2);
  const mao=pose===2?x+11:x+7;
  fios(c,luz,[mao-4,alto+11,mao,-4,mao+3,-3],2);
  linha(c,luz,mao-2,-3,mao+2,-2);
  if(pose===2)fios(c,casca,[-14,-1,-18,-4,-20,-11]);
}

function cuspidor(c, pose, [sombra,folha,luz]){
  const altura=pose===1?-22:pose===2?-18:pose===3?-14:-19;
  const boca=pose===1?8:pose===2?17:pose===3?9:11;
  pol(c,CONTORNO,[-12,0,-8,-6,-7,-10,-4,-11,-1,-8,0,altura+3,5,altura+3,4,-8,11,-7,12,-4,8,0]);
  pol(c,folha,[-10,-2,-7,-8,-4,-9,-1,-5,2,altura+3,3,altura+3,2,-4,5,-7,10,-6,7,-2]);
  const bochecha=pose===1?8:pose===2?4:6;
  disco(c,CONTORNO,boca-8,altura,bochecha+1,7);
  disco(c,folha,boca-8,altura,bochecha,6);
  pol(c,CONTORNO,[boca-7,altura-6,boca+2,altura-4,boca+4,altura-1,boca+3,altura+4,boca-7,altura+5]);
  pol(c,sombra,[boca-5,altura-4,boca+2,altura-2,boca+3,altura+1,boca+1,altura+3,boca-5,altura+3]);
  tinta(c,CONTORNO,boca+1,altura-1,3,2);
  tinta(c,luz,boca-10,altura-4,2,2);
  if(pose===1)diamante(c,luz,boca+1,altura+1,2);
  if(pose===3)linha(c,sombra,-6,-4,2,-2,2);
}

function ressonante(c, pose, [sombra,pedra,luz]){
  const nucleo=pose===1?-20:pose===2?-17:pose===3?-12:-18;
  const haste=pose===1?-35:pose===2?-29:pose===3?-25:-31;
  const frente=pose===2?12:pose===3?4:7;
  const costas=pose===1?-11:-8;
  pol(c,CONTORNO,[costas-2,haste,costas+3,haste,costas+5,nucleo-10,frente-5,nucleo-10,frente-5,haste,frente,haste,frente+1,nucleo-9,frente-2,nucleo-6,frente+1,nucleo-2,frente-3,-7,6,-1,0,-1,-2,-5,-6,-1,-11,-1,costas-3,-7,costas-4,nucleo-4]);
  fios(c,pedra,[costas,haste+2,costas+3,nucleo-8,frente-5,nucleo-8,frente-2,nucleo-10,frente-2,haste+2],2);
  pol(c,sombra,[costas-1,nucleo-3,frente-2,nucleo-6,frente-2,-9,3,-4,-3,-7,-9,-3]);
  diamante(c,pedra,0,nucleo+1,8);
  diamante(c,luz,1,nucleo+1,4);
  tinta(c,CONTORNO,1,nucleo,3,2);
  if(pose===2)fios(c,luz,[frente+2,nucleo-10,frente+6,nucleo-5,frente+3,nucleo+1],2);
}

function sineiro(c, pose, [sombra,bronze,luz]){
  const topo=pose===1?-35:pose===2?-28:pose===3?-25:-32;
  const giro=pose===1?-6:pose===2?6:pose===3?2:0;
  const boca=pose===2?-5:pose===3?-6:-9;
  tinta(c,CONTORNO,giro-4,topo,8,9);
  tinta(c,luz,giro-2,topo+1,4,6);
  pol(c,CONTORNO,[giro-5,topo+5,giro+5,topo+5,giro+9,topo+9,giro+12,boca-7,16+giro,boca-3,18+giro,boca+1,-17+giro,boca+1,-16+giro,boca-3,-12+giro,boca-7,-9+giro,topo+9]);
  pol(c,bronze,[giro-4,topo+7,giro+4,topo+7,giro+7,topo+10,giro+10,boca-6,16+giro,boca-2,-15+giro,boca-2,-10+giro,boca-7,-7+giro,topo+10]);
  pol(c,sombra,[giro+3,topo+8,giro+7,topo+11,giro+10,boca-6,15+giro,boca-2,giro+5,boca-2]);
  linha(c,luz,giro-7,topo+13,giro-10,boca-6,2);
  tinta(c,CONTORNO,giro-3,boca,6,6);
  tinta(c,luz,giro-1,boca+1,2,3);
  if(pose===2)fios(c,luz,[giro+11,-21,giro+17,-17,giro+16,-13]);
}

function miragem(c, pose, [sombra,tecido,luz]){
  const nuca=pose===1?-33:pose===2?-27:pose===3?-25:-30;
  const centro=pose===1?-4:pose===2?6:pose===3?2:0;
  const ponta=pose===2?20:pose===1?6:11;
  pol(c,CONTORNO,[centro-5,nuca-1,centro+1,nuca-4,centro+7,nuca,centro+9,nuca+8,ponta,nuca+10,ponta,nuca+13,centro+5,nuca+16,centro+4,-9,centro-2,-2,-15,-1,-20,-5,-11,-6,-6,-12,-8,-18,centro-7,nuca+7]);
  pol(c,tecido,[centro-4,nuca,centro+1,nuca-2,centro+5,nuca+1,centro+7,nuca+8,centro+4,nuca+12,centro+1,-9,centro-3,-4,-15,-3,-17,-4,-10,-6,-3,-13,centro-6,nuca+8]);
  pol(c,sombra,[centro-3,nuca+8,centro+6,nuca+9,ponta-1,nuca+11,ponta-1,nuca+12,centro+3,nuca+15,centro-3,nuca+14,-8,-12]);
  linha(c,luz,centro+1,nuca+5,centro+6,nuca+5,2);
  if(pose===1||pose===2){
    const esteira=pose===1?-14:-18;
    fios(c,tecido,[esteira,nuca+4,esteira-3,nuca+10,esteira-1,nuca+15]);
    linha(c,sombra,esteira-2,nuca+18,esteira+1,nuca+21,2);
  }
}

function areeiro(c, pose, [sombra,argila,luz]){
  const topo=pose===1?-32:pose===2?-22:pose===3?-20:-28;
  const bordo=pose===2?8:pose===1?-3:1;
  const onda=pose===2?20:pose===3?15:11;
  pol(c,CONTORNO,[bordo-13,topo,bordo+11,topo,bordo+11,topo+5,bordo+7,topo+11,bordo+3,topo+13,8,-7,onda,-4,onda+3,-1,-15,0,-17,-4,-10,-7,-3,topo+13,bordo-8,topo+10,bordo-12,topo+5]);
  pol(c,argila,[bordo-10,topo+3,bordo+9,topo+3,bordo+8,topo+7,bordo+3,topo+11,bordo-3,topo+12,bordo-8,topo+9]);
  pol(c,sombra,[bordo-2,topo+11,bordo+2,topo+11,5,-8,onda,-3,onda+1,-2,-14,-2,-12,-5,-5,-9]);
  tinta(c,luz,bordo-10,topo+1,19,2);
  tinta(c,CONTORNO,bordo+1,topo+6,5,2);
  if(pose===2||pose===3){
    fios(c,luz,[-11,-3,-5,-6,2,-4,12,-5,onda,-2]);
    tinta(c,argila,onda+3,-6,3);tinta(c,luz,onda,-8,2);
  }else linha(c,luz,bordo,topo+13,bordo,-9);
}

function cristalino(c, pose, [sombra,gelo,luz]){
  const topo=pose===1?-37:pose===2?-32:pose===3?-29:-34;
  const ponta=pose===2?21:pose===1?10:14;
  pol(c,CONTORNO,[-10,-1,-16,-12,-11,-23,-13,topo+2,-6,topo+5,-3,topo-3,3,topo+7,9,topo+3,ponta,topo+9,12,-19,13,-7,8,-2,1,-1,-2,-6,-6,-1]);
  pol(c,gelo,[-10,-4,-13,-12,-8,-20,-10,topo+5,-5,topo+9,-3,topo+1,2,topo+10,9,topo+6,ponta-3,topo+10,10,-19,11,-8,6,-4,1,-3,-2,-9,-7,-4]);
  pol(c,sombra,[-8,-18,-3,topo+2,-1,-20,9,topo+6,6,-17,9,-8,4,-5,-1,-12,-6,-9]);
  fios(c,luz,[-4,topo+2,-1,-22,-5,-14]);
  linha(c,luz,10,topo+9,ponta-5,topo+11,2);
  tinta(c,CONTORNO,6,-19,3,2);
  if(pose===1){
    diamante(c,luz,9,topo-2,2);tinta(c,luz,-12,topo-1,2,3);
  }
}

function patinador(c, pose, [sombra,tecido,luz]){
  const cabecaX=pose===1?0:pose===2?12:pose===3?5:3;
  const alto=pose===1?-22:pose===2?-17:pose===3?-28:-25;
  const skateFrente=pose===2?15:pose===3?8:11;
  const skateTras=pose===2?-15:pose===1?-10:-8;
  const joelho=pose===2?6:pose===1?2:0;
  fios(c,CONTORNO,[cabecaX-6,alto+8,-6,-9,joelho,-8,skateFrente,-2],5);
  fios(c,CONTORNO,[-5,-10,-9,-6,skateTras,-3],4);
  fios(c,tecido,[cabecaX-5,alto+8,-5,-9,joelho+1,-8,skateFrente,-3],2);
  linha(c,sombra,-6,-7,skateTras,-3,2);
  disco(c,CONTORNO,cabecaX,alto+1,7,6);
  disco(c,tecido,cabecaX,alto,6,5);
  pol(c,sombra,[cabecaX-3,alto+1,cabecaX+7,alto+1,cabecaX+3,alto+6,cabecaX-4,alto+5]);
  tinta(c,luz,cabecaX+2,alto,4,2);
  fios(c,luz,[cabecaX-5,alto+3,-7,alto+4,-15,alto+(pose===2?1:7)],2);
  fios(c,luz,[skateFrente-5,0,skateFrente+3,0,skateFrente+5,-2]);
  fios(c,luz,[skateTras-5,-1,skateTras+2,-1,skateTras+4,-3]);
}

function fornalha(c, pose, [sombra,ferro,luz]){
  const topo=pose===1?-24:pose===2?-32:pose===3?-25:-32;
  const boca=pose===1?-13:pose===2?-22:pose===3?-14:-19;
  const punho=pose===1?10:pose===2?18:pose===3?13:11;
  tinta(c,CONTORNO,-14,-10,7,10);tinta(c,CONTORNO,7,-10,8,10);
  tinta(c,ferro,-12,-7,3,6);tinta(c,ferro,9,-7,3,6);
  tinta(c,CONTORNO,-10,topo-8,7,12);tinta(c,ferro,-8,topo-6,4,9);
  tinta(c,CONTORNO,-12,topo-9,11,3);tinta(c,luz,-10,topo-8,6);
  pol(c,CONTORNO,[-16,topo+7,-12,topo,-4,topo-1,11,topo,15,topo+5,16,-8,11,-5,-12,-5,-16,-10]);
  pol(c,ferro,[-13,topo+7,-10,topo+2,9,topo+2,13,topo+6,13,-9,10,-7,-11,-7,-14,-11]);
  tinta(c,sombra,-9,boca-1,19,9);
  tinta(c,CONTORNO,-7,boca,15,6);
  for(let x=-5;x<7;x+=4)tinta(c,luz,x,boca+1,2,4);
  pol(c,CONTORNO,[10,topo+6,punho+5,topo+10,punho+6,-8,punho,-7,10,-12]);
  linha(c,ferro,punho+1,topo+11,punho+2,-10,4);
  if(pose===2||pose===3)fios(c,luz,[-8,topo-12,-11,topo-15,-6,topo-18]);
}

function fagulheiro(c, pose, [sombra,brasa,luz], inimigo){
  const mergulho=inimigo.ataqueId==='mergulho';
  const frente=pose===2&&!mergulho?10:4;
  const topo=pose===1?-28:pose===2?-18:pose===3?-20:-23;
  const cauda=pose===2&&mergulho?3:-6;
  const ponta=pose===2?17:pose===3?9:13;
  pol(c,CONTORNO,[-2,-7,-12,-9,-17,topo+3,-12,topo+5,-9,-17,-6,topo,1,topo+6,frente+2,-17,ponta,topo+4,ponta+3,-7,frente+5,-6,cauda+2,-3,cauda,1,cauda-4,-3]);
  pol(c,sombra,[-3,-9,-11,-10,-15,topo+6,-11,topo+7,-6,-15,-4,-11]);
  pol(c,brasa,[frente,-15,ponta,topo+7,ponta+1,-9,frente+4,-8]);
  pol(c,brasa,[-7,-15,-5,topo+2,1,topo+8,frente+1,-15,frente+4,-10,cauda+1,-4,cauda,-1,cauda-2,-5]);
  fios(c,luz,[-5,-15,-4,topo+9,0,-15,frente,-12],2);
  tinta(c,CONTORNO,frente,-12,2,2);
  if(pose===2&&!mergulho)diamante(c,luz,frente+6,-11,2);
}

const DESENHOS_CRIATURAS = Object.freeze({
  escavador:artista(escavador,['#476251','#83a866','#c3da94']),
  cuspidor:artista(cuspidor,['#596147','#abb66b','#f5e5a0']),
  ressonante:artista(ressonante,['#685777','#9d82bd','#eed1f5']),
  sineiro:artista(sineiro,['#825c58','#b88755','#f5d29c']),
  miragem:artista(miragem,['#8a6a68','#cfac83','#fff0bd']),
  areeiro:artista(areeiro,['#865e52','#c9905c','#f9da97']),
  cristalino:artista(cristalino,['#497480','#89bacb','#e9fcff']),
  patinador:artista(patinador,['#4c6a7a','#7db1aa','#d6fff1']),
  fornalha:artista(fornalha,['#553a48','#a36957','#ffcb83']),
  fagulheiro:artista(fagulheiro,['#965357','#e19163','#ffe1a3'])
});

export { DESENHOS_CRIATURAS };
