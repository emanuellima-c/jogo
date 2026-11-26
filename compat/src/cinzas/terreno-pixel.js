// Gerado a partir de src/cinzas/terreno-pixel.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/terreno-pixel.js", function (exports, usar) {
"use strict";
const { tela, tinta, linha, fios, pol, diamante, acaso, hash } = usar("src/cinzas/formas.js");
// A borda em dois valores é o código visual comum a todas as superfícies pisáveis.
const PALETAS=[
  {fundo:'#19282c',esc:'#253737',meio:'#384c45',rocha:'#4b594c',luz:'#617259',musgo:'#789665',limite:'#c2cc91',veio:'#4f6954',prof:'#293e3c',nevoa:'#19383e',folha:'#31574f'},
  {fundo:'#222333',esc:'#312e42',meio:'#484351',rocha:'#5c5260',luz:'#766877',musgo:'#8e9380',limite:'#d2c9a8',veio:'#68506d',prof:'#3b344a',nevoa:'#2e304a',folha:'#454256'},
  {fundo:'#2e2830',esc:'#43343a',meio:'#5a4141',rocha:'#78534b',luz:'#956c52',musgo:'#b58a65',limite:'#ebc18a',veio:'#9a6f4e',prof:'#4c3338',nevoa:'#483541',folha:'#604c4b'},
  {fundo:'#1d2936',esc:'#2b3b49',meio:'#384c5c',rocha:'#4c606e',luz:'#647f88',musgo:'#9ebbbb',limite:'#e0dfc0',veio:'#66959a',prof:'#34465b',nevoa:'#233c50',folha:'#3a5666'},
  {fundo:'#28232d',esc:'#3a2c38',meio:'#4c3943',rocha:'#624550',luz:'#83585d',musgo:'#a77f6a',limite:'#efbe92',veio:'#a45d50',prof:'#49343f',nevoa:'#472d3b',folha:'#543a44'}
];
const CONTORNO='#151a26';
const MADEIRA={esc:'#3e3240',meio:'#705447',luz:'#9c7656',ponta:'#cda675'};
const METAL={esc:'#2a3946',meio:'#485961',luz:'#79877d',ponta:'#b5bd9b'};

function estrato(c,w,h,p,rand,terra) {
  c.fillStyle=p.meio;c.fillRect(0,2,w,h-2);
  let altura=5;
  while(altura<h){
    const banda=7+Math.floor(rand()*11),tom=altura>55?p.esc:p.rocha;
    let x=-Math.round(rand()*15);
    while(x<w){
      const larg=11+Math.floor(rand()*24),dobr=3+Math.floor(rand()*4),onda=Math.round(rand()*3);
      const y=altura+onda;
      pol(c,tom,[x+2,y,x+larg-dobr,y-1,x+larg,y+2,x+larg-1,y+banda-3,x+larg-5,y+banda,x+3,y+banda-1,x,y+banda-4]);
      if(rand()>.18){
        fios(c,altura<32?p.luz:p.meio,[x+2,y+1,x+5,y,x+Math.min(larg-4,11),y]);
        if(rand()>.52)tinta(c,p.meio,x+larg-6,y+2,3);
      }
      if(rand()>.60)fios(c,p.esc,[x+larg-5,y+3,x+larg-7,y+5,x+larg-7,y+8]);
      x+=larg+1;
    }
    altura+=banda+1;
  }
  if(terra){
    for(let x=0;x<w;x+=9+Math.floor(rand()*19)){
      const long=4+Math.floor(rand()*13);
      fios(c,p.esc,[x,3,x+1,9,x-3,12,x-2,long+8],2);
      fios(c,p.veio,[x+1,4,x+1,8,x-2,12]);
      if(rand()>.5)linha(c,p.veio,x,9,x+4,12);
    }
  }
  if(h>14){
    tinta(c,'#141b2580',0,h-3,w,3);
    for(let x=2;x<w;x+=4+Math.floor(rand()*11)){
      const y=5+Math.floor(rand()*(h-8));
      tinta(c,rand()>.6?p.luz:p.esc,x,y,1+Math.floor(rand()*3),1);
    }
  }
}
function capa(c,w,p,rand,terra,regiao) {
  tinta(c,CONTORNO,0,0,w,5);tinta(c,p.musgo,1,0,w-2,3);tinta(c,p.limite,1,0,w-2,1);
  for(let x=1;x<w-1;){
    const larg=Math.min(w-1-x,3+Math.floor(rand()*10)),y=1+Math.floor(rand()*2);
    tinta(c,p.luz,x,y,larg,2);
    if(terra && rand()>.3)pol(c,p.musgo,[x,y,x+larg,y,x+larg-1,y+2,x+3,y+3,x+1,y+5,x,y+3]);
    if(!terra && larg>=6 && rand()>.46)tinta(c,p.fundo,x+1,1,1,2);
    x+=larg;
  }
  if(regiao===4){
    for(let x=13;x<w-6;x+=22+Math.round(rand()*26)){
      fios(c,'#8b5244',[x,8,x+3,12,x+1,15,x+4,18]);tinta(c,'#df9a6e',x+2,11,2,1);
    }
  }
}
function faceExposta(c,w,h,p,rand,regiao) {
  // A camada de rocha absorve luz em profundidade. Arestas, inclusões e nervuras variam por lugar.
  for(let y=12;y<h;y+=6){
    const alpha=Math.min(.38,(y-8)*.004);
    tinta(c,'rgba(12,17,26,'+alpha+')',0,y,w,6);
  }
  for(let x=4;x<w-4;x+=15+Math.floor(rand()*24)){
    const y=7+Math.floor(rand()*Math.min(h-9,30));
    if(regiao===0){
      const d=7+Math.floor(rand()*11);
      fios(c,'#263f39',[x,3,x+3,7,x+2,11,x+5,d+2],2);
      fios(c,'#709067',[x,3,x+2,6,x+2,9]);
      pol(c,'#63815b',[x+2,8,x+7,6,x+6,9,x+3,11]);
      tinta(c,'#9ba477',x+5,7,2);
    }else if(regiao===1){
      fios(c,p.esc,[x,y,x+8,y-1,x+9,y-3,x+14,y-3]);
      tinta(c,p.luz,x+2,y+1,4);
      if(rand()>.55){tinta(c,'#856c83',x+9,y-1,2,2);tinta(c,'#b096a4',x+9,y-1);}
    }else if(regiao===2){
      fios(c,p.luz,[x,y,x+3,y,x+6,y-2,x+12,y-2]);
      fios(c,p.esc,[x+1,y+2,x+5,y+2,x+8,y,x+14,y]);
    }else if(regiao===3){
      const d=4+Math.floor(rand()*7);
      pol(c,'#7a949a',[x,2,x+4,3,x+2,4+d,x+1,7]);
      linha(c,'#b4c9bd',x+1,3,x+2,4+d/2);
    }else{
      fios(c,'#4b333d',[x,y,x+4,y+3,x+3,y+6,x+8,y+9],2);
      tinta(c,'#9b655b',x+3,y+3,2);
    }
  }
  for(let y=12;y<h-4;y+=8+Math.floor(rand()*12)){
    const r=2+Math.floor(rand()*4),alto=3+Math.floor(rand()*5);
    pol(c,p.fundo,[0,y,2,y+1,r,y+alto,2,y+alto+5,0,y+alto+7]);
    linha(c,p.luz,1,y+1,r-1,y+alto);
    pol(c,p.esc,[w,y-3,w-r,y+2,w-2,y+alto+1,w,y+alto+2]);
  }
}
function plataformaMadeira(c,w,h,p,rand,fragil) {
  tinta(c,CONTORNO,0,0,w,Math.min(h,9));
  tinta(c,MADEIRA.esc,1,2,w-2,Math.min(6,h-2));
  for(let x=0;x<w;x+=8){
    const larg=Math.min(7,w-x),y=fragil?Math.floor(rand()*2):0;
    tinta(c,fragil?'#986455':MADEIRA.meio,x,y+1,larg,5);
    tinta(c,fragil?'#e7a879':MADEIRA.ponta,x,y,larg,1);
    tinta(c,fragil?'#b67e60':MADEIRA.luz,x+1,y+2,Math.max(1,larg-3),1);
    if(larg>4)tinta(c,'#342e39',x+larg-2,y+3);
  }
  for(let x=4;x<w-2;x+=22){
    tinta(c,fragil?'#ab7860':'#aa916e',x,4,2,5);
    linha(c,MADEIRA.esc,x,7,Math.min(w-1,x+8),Math.min(h-1,13),2);
    linha(c,'#84624d',x,8,Math.min(w-1,x+7),Math.min(h-1,13));
  }
  if(fragil){
    for(let x=8;x<w;x+=17)fios(c,'#382937',[x,0,x-2,2,x+2,3,x-1,6],2);
    for(let x=7;x<w-3;x+=18)fios(c,'#f8cda0',[x,3,x+2,6,x+4,3]);
  }else if(h>14){
    for(let x=4;x<w;x+=28){
      tinta(c,MADEIRA.esc,x,8,4,h-8);tinta(c,MADEIRA.meio,x,8,1,h-8);
      linha(c,MADEIRA.esc,x,26,Math.min(w-1,x+20),9,3);
    }
  }
}
function plataformaMetal(c,w,h,rand,movel){
  tinta(c,CONTORNO,0,0,w,h);
  tinta(c,METAL.esc,1,1,w-2,h-2);tinta(c,METAL.meio,1,2,w-2,Math.min(6,h-3));
  if(h>13){
    for(let y=10;y<h-1;y+=13)for(let x=(y%2)*8-12;x<w;x+=21){
      tinta(c,'#303e49',x+2,y,18,10);tinta(c,'#4f5b5a',x+3,y,15,1);
      if(rand()>.6)tinta(c,METAL.luz,x+6,y+2,1,1);
    }
  }
  tinta(c,movel?'#b9ddcd':METAL.ponta,1,0,w-2,1);tinta(c,METAL.luz,2,2,w-4,1);
  for(let x=4;x<w-2;x+=12){
    tinta(c,'#202e3b',x-1,4,3,3);tinta(c,movel?'#8edbc4':METAL.ponta,x,4);
  }
  if(movel){
    const centro=Math.floor(w/2);
    for(const x of [4,w-9]){tinta(c,'#40565b',x,7,5,3);tinta(c,'#7bc4b0',x+1,8,3);}
    fios(c,'#72a69f',[centro-5,6,centro-3,8,centro,5,centro+3,8,centro+5,6]);
  }
}
function novaSuperficie(piso,regiao){
  const w=Math.max(2,Math.ceil(piso.w)),h=Math.max(3,Math.ceil(piso.h)),v=tela(w,h),c=v.getContext('2d');
  const p=PALETAS[regiao],rand=acaso(hash(piso.id)+regiao*3211+Math.round(piso.x));
  if(piso.tipo==='fragil'||piso.tipo==='madeira')plataformaMadeira(c,w,h,p,rand,piso.tipo==='fragil');
  else if(piso.tipo==='metal'||piso.tipo==='movel')plataformaMetal(c,w,h,rand,piso.tipo==='movel');
  else{
    estrato(c,w,h,p,rand,piso.tipo==='terra');
    if(h>20)faceExposta(c,w,h,p,rand,regiao);
    capa(c,w,p,rand,piso.tipo==='terra',regiao);
    tinta(c,p.fundo,0,3,1,h-3);tinta(c,p.esc,w-1,3,1,h-3);
    if(piso.tipo==='selado'){
      const m=w>>1;diamante(c,'#302534',m,5,4);
      fios(c,'#f6c56e',[m-4,3,m,6,m+4,3]);fios(c,'#e0ac63',[m-4,6,m,9,m+4,6]);
      fios(c,'#b68554',[m-5,4,m-11,5,m-13,2,m-18,4]);
    }
  }
  return v;
}
function trilho(c,p,origem,tempo,parado) {
  if(!origem || p.tipo!=='movel')return;
  const cx=Math.round(origem.x+p.w/2),cy=Math.round(origem.y+5);
  const dx=origem.dx||0,dy=origem.dy||0,n=Math.max(1,Math.ceil(Math.hypot(2*dx,2*dy)/7));
  for(let i=0;i<=n;i++){
    const a=2*i/n-1;
    tinta(c,i===0||i===n?'#a5c5ad':'#6e8f89',cx+dx*a,cy+dy*a,i===0||i===n?2:1,1);
  }
  if(!parado){const x=Math.round(p.x+p.w/2),y=Math.round(p.y+p.h+2),v=Math.floor(tempo*6)%2; tinta(c,'#93c4b6',x-3,y,2+v,1);}
}
function rachadura(c,p,tempo,parado) {
  if(p.estado!=='racha')return;
  const a=Math.min(1,Math.max(0,p.aviso||0)),x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w);
  const brilho=parado||Math.floor(tempo*(5+a*8))%2===0?'#ffd2a0':'#f28c75';
  for(let i=6;i<w-3;i+=9){
    fios(c,'#392638',[x+i,y,x+i-2,y+3,x+i+1,y+5,x+i-2,y+7],2);
    fios(c,brilho,[x+i-1,y,x+i-3,y+3,x+i,y+5]);
    if(a>.45 && !parado)tinta(c,'#e5a378',x+i+1,y+10+(i+Math.floor(tempo*17))%10,2);
  }
}
function perigo(c,p,tempo,parado){
  const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w),h=Math.round(p.h||9);
  tinta(c,'#301f2d',x,y+h-1,w,3);
  for(let j=0;j<w;j+=7){
    const larg=Math.min(7,w-j),alto=h-Math.floor(j/7)%2;
    pol(c,'#3b2637',[x+j,y+h,x+j+larg/2,y+h-alto-2,x+j+larg+1,y+h]);
    pol(c,'#c57d75',[x+j+1,y+h,x+j+larg/2,y+h-alto,x+j+larg,y+h]);
    linha(c,'#ffddba',x+j+1,y+h-2,x+j+Math.floor(larg/2),y+h-alto);
    if(!parado && (Math.floor(tempo*3)+j)%11===0)tinta(c,'#fff2d5',x+j+Math.floor(larg/2),y+h-alto-1,2,1);
  }
  tinta(c,'#9a5956',x,y+h,w,1);
}
Object.defineProperty(exports, "PALETAS", { enumerable: true, get: () => PALETAS });
Object.defineProperty(exports, "novaSuperficie", { enumerable: true, get: () => novaSuperficie });
Object.defineProperty(exports, "trilho", { enumerable: true, get: () => trilho });
Object.defineProperty(exports, "rachadura", { enumerable: true, get: () => rachadura });
Object.defineProperty(exports, "perigo", { enumerable: true, get: () => perigo });
});
