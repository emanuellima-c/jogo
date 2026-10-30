// Gerado a partir de src/render/arte.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/arte.js", function (exports, usar) {
"use strict";
// Primitivas originais e compartilhadas. O cenário é gerado uma vez por ambiente.
function elipse(c,x,y,rx,ry,cor){c.fillStyle=cor;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function poligono(c,cor,p){c.fillStyle=cor;c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();c.fill();}
function ruido(n){let x=(n+1)*374761393;x=Math.imul(x^(x>>>13),1274126177);return((x^(x>>>16))>>>0)/4294967296;}
function nuvem(c,x,y,s,cor){elipse(c,x,y,53*s,12*s,cor);elipse(c,x-23*s,y-7*s,24*s,14*s,cor);elipse(c,x+9*s,y-13*s,30*s,22*s,cor);elipse(c,x+39*s,y-3*s,26*s,12*s,cor);}
function folhagem(c,x,y,r,escura,clara,seed){
 elipse(c,x,y,r,r*.55,escura);
 for(let i=0;i<19;i++)elipse(c,x+(ruido(seed+i*3)-.5)*r*1.8,y+(ruido(seed+i*3+1)-.5)*r*.8,8+ruido(seed+i+80)*18,5+ruido(seed+i+90)*12,i%3?escura:clara);
}
function arvore(c,x,y,h,cor,folha,seed){
 const w=h*.075;c.fillStyle=cor;c.fillRect(x-w*.5,y-h,w,h);poligono(c,cor,[x-w*1.8,y,x-4,y-h*.6,x+w*.5,y-h*.6,x+w*2,y]);
 c.strokeStyle=cor;c.lineWidth=w*.65;c.beginPath();c.moveTo(x,y-h*.6);c.lineTo(x-h*.19,y-h*.91);c.moveTo(x,y-h*.55);c.lineTo(x+h*.22,y-h*.85);c.stroke();
 folhagem(c,x,y-h*.92,h*.3,cor,folha,seed);folhagem(c,x-h*.2,y-h*.78,h*.22,cor,folha,seed+80);folhagem(c,x+h*.2,y-h*.76,h*.24,cor,folha,seed+180);
}
function pinheiro(c,x,y,h,cor,neve){
 c.fillStyle='#394e67';c.fillRect(x-4,y-h*.65,8,h*.65);
 for(let j=0;j<5;j++){const py=y-h+j*h*.15,w=h*(.16+j*.045);poligono(c,cor,[x,py,x-w,py+h*.32,x+w,py+h*.32]);if(neve)poligono(c,neve,[x,py,x-w*.74,py+h*.24,x-2,py+h*.19,x+w*.65,py+h*.24]);}
}
function criarBrilho(cor){const a=document.createElement('canvas');a.width=a.height=128;const c=a.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,cor);g.addColorStop(.28,cor+'88');g.addColorStop(1,cor+'00');c.fillStyle=g;c.fillRect(0,0,128,128);return a;}
Object.defineProperty(exports, "elipse", { enumerable: true, get: () => elipse });
Object.defineProperty(exports, "poligono", { enumerable: true, get: () => poligono });
Object.defineProperty(exports, "ruido", { enumerable: true, get: () => ruido });
Object.defineProperty(exports, "nuvem", { enumerable: true, get: () => nuvem });
Object.defineProperty(exports, "folhagem", { enumerable: true, get: () => folhagem });
Object.defineProperty(exports, "arvore", { enumerable: true, get: () => arvore });
Object.defineProperty(exports, "pinheiro", { enumerable: true, get: () => pinheiro });
Object.defineProperty(exports, "criarBrilho", { enumerable: true, get: () => criarBrilho });
});
