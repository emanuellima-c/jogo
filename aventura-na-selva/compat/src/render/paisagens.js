// Gerado a partir de src/render/paisagens.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/paisagens.js", function (exports, usar) {
"use strict";
// Pintura em uma grade de 480 × 270. Os três planos são preparados uma vez por mundo.
const CORES = [
  {sombra:'#1f4148',copa:'#2c6357'},{sombra:'#3b324f',rocha:'#655776'},
  {sombra:'#784352'},{sombra:'#284057',copa:'#54868f'},{sombra:'#3b273c'}
];
function acaso(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
function ret(c,x,y,w,h,cor) { c.fillStyle=cor;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
// Preenchimento por linhas inteiras evita bordas suavizadas em obras de pixel art.
function poli(c,cor,pts) {
  c.fillStyle=cor;
  const ys=pts.map(p=>p[1]), baixo=Math.min(c.canvas.height,Math.ceil(Math.max(...ys)));
  for(let y=Math.max(0,Math.floor(Math.min(...ys)));y<baixo;y++) {
    const cortes=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++) {
      const [x1,y1]=pts[j],[x2,y2]=pts[i];
      if((y1<=y+.5 && y2>y+.5)||(y2<=y+.5 && y1>y+.5)) cortes.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1));
    }
    cortes.sort((a,b)=>a-b);
    for(let i=0;i+1<cortes.length;i+=2){const esq=Math.round(cortes[i]);c.fillRect(esq,y,Math.max(1,Math.round(cortes[i+1])-esq),1);}
  }
}
function oval(c,x,y,rx,ry,cor) {
  c.fillStyle=cor;
  for(let j=-Math.floor(ry);j<=ry;j++){const d=Math.round(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));c.fillRect(Math.round(x)-d,Math.round(y+j),d*2+1,1);}
}
function palma(c,x,y,h,cor,clara,inclinacao=1) {
  const cx=x+h*.16*inclinacao,cy=y-h;
  poli(c,cor,[[x-3,y],[x+2,y],[cx+1,cy],[cx-1,cy+2],[x+h*.08*inclinacao-2,y-h*.58]]);
  for(let k=0;k<8;k++){
    const lado=k%2?1:-1,ord=k>>1,larg=h*(.26+ord*.11),alto=h*(.35-ord*.12);
    for(let j=0;j<9;j++){
      const t=j/8,px=cx+lado*larg*t,py=cy-Math.sin(t*2.5)*alto+t*t*h*.13;
      const l=h*(.16*(1-t)+.035);
      poli(c,k%3?cor:clara,[[px,py],[px+lado*(larg/7+2),py+ord*.5],[px+lado*l*.7,py+l],[px+lado*l*.22,py+l*.47]]);
    }
  }
}
function conifera(c,x,y,h,cor,luz) {
  ret(c,x-1,y-h*.65,3,h*.65,cor);
  for(let i=0;i<5;i++){
    const cy=y-h+i*h*.15,r=h*(.10+i*.026);
    poli(c,cor,[[x,cy],[x-r,cy+h*.34],[x-r*.42,cy+h*.30],[x-r*.37,cy+h*.34],[x+r,cy+h*.33]]);
    if(luz)poli(c,luz,[[x,cy],[x-r*.68,cy+h*.24],[x-r*.22,cy+h*.20],[x,cy+h*.21],[x+r*.35,cy+h*.22]]);
  }
}
function folhagem(c,x,y,w,h,escuro,luz,rng){
  for(let i=0;i<8;i++){const px=x+(rng()-.5)*w,py=y+(rng()-.5)*h,raio=2+rng()*w*.22;oval(c,px,py,raio,raio*.58,escuro);ret(c,px-raio*.65,py-raio*.47,raio*.7,1,luz);}
}
function superficie(){
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=270;return canvas;
}
function pintarPrimeiroPlano(numero){
  const tela=superficie(),c=tela.getContext('2d'),p=CORES[numero],rng=acaso(55+numero);
  const contorno=[];
  for(let x=0;x<=480;x+=4)contorno.push([x,224+Math.sin(x/480*Math.PI*4)*10+Math.sin(x/480*Math.PI*8)*5]);
  poli(c,p.sombra,[...contorno,[480,270],[0,270]]);
  for(let i=0;i<28;i++){const x=9+i*17,y=225+Math.sin(x/480*Math.PI*4)*10+Math.sin(x/480*Math.PI*8)*5,h=8+rng()*26;
    if(numero===0){folhagem(c,x,y,32,11,p.sombra,p.copa,rng);if(i%8===3)palma(c,x,y+4,h+9,p.sombra,p.copa,i%2?1:-1);}
    if(numero===1&&i%4===2){ret(c,x,y-h,8,h+1,p.sombra);ret(c,x-1,y-h,10,2,p.rocha);}
    if(numero===2&&i%6===2){ret(c,x,y-h,4,h,p.sombra);ret(c,x-5,y-h*.65,6,3,p.sombra);ret(c,x-5,y-h*.8,2,h*.15,p.sombra);}
    if(numero===3)conifera(c,x,y+3,h+4,p.sombra,i%3===0?p.copa:null);
    if(numero===4&&i%3===1)poli(c,p.sombra,[[x-6,y+2],[x-1,y-h],[x+6,y-h*.65],[x+8,y+2]]);
  }
  return tela;
}
Object.defineProperty(exports, "pintarPrimeiroPlano", { enumerable: true, get: () => pintarPrimeiroPlano });
});
