import { CONFIG as C } from '../core/configuracoes.js';
import { elipse, poligono, ruido, nuvem, arvore, pinheiro } from './arte.js';
// Quatro planos pintados uma vez. A animação apenas desloca os canvases em cache.
const PALETAS=[
 ['#143c55','#6dbeb0','#f7d8a0','#7aa99b','#438d7e','#225c58'],
 ['#353452','#be8b9d','#ffdda8','#9a839d','#726985','#444966'],
 ['#7c5580','#dfaa99','#ffe5ac','#b68c9c','#b47e75','#875d67'],
 ['#172d56','#769fbd','#e1e8d8','#7c9eba','#4c7497','#2c526f'],
 ['#201d38','#723d4b','#e29a73','#774d62','#543d55','#302d45']
];
class Parallax{
 constructor(){this.camadas=[];this.fatores=[0,.1,.25,.46];this.mundo=-1;}
 preparar(numero){
  if(this.mundo===numero)return;this.mundo=numero;this.camadas.length=0;const p=PALETAS[numero];
  for(let camada=0;camada<4;camada++){
   const canvas=document.createElement('canvas');canvas.width=C.largura;canvas.height=C.altura;const c=canvas.getContext('2d');
   if(camada===0){
    const g=c.createLinearGradient(0,0,0,540);g.addColorStop(0,p[0]);g.addColorStop(.6,p[1]);g.addColorStop(1,p[2]);c.fillStyle=g;c.fillRect(0,0,960,540);
    const halo=c.createRadialGradient(710,145,5,710,145,250);halo.addColorStop(0,numero===4?'#f5a27988':'#fff3c399');halo.addColorStop(1,'#ffe9b000');c.fillStyle=halo;c.fillRect(440,0,520,420);
    elipse(c,710,145,numero===3?28:39,numero===3?28:39,numero===4?'#ffb381':'#fff0bf');
    if(numero===3){elipse(c,700,139,7,9,'#b8cbd1');elipse(c,718,156,5,4,'#b8cbd1');}
    for(let i=0;i<18;i++){c.fillStyle='#fff4cc';c.globalAlpha=numero===3?.6:.2;c.fillRect(ruido(i+120)*960,ruido(i+150)*180,2,2);}c.globalAlpha=1;
    for(let i=0;i<9;i++)nuvem(c,i*143-70,70+ruido(i+90)*135,.7+ruido(i)*.6,numero===4?'#ba7b7e35':'#ffebd52d');
    if(numero===3){c.globalAlpha=.18;c.strokeStyle='#83e1c3';c.lineWidth=24;c.beginPath();c.moveTo(-40,75);c.bezierCurveTo(220,190,450,-45,1020,80);c.stroke();c.globalAlpha=1;}
   }else if(camada===1){
    for(let i=-1;i<6;i++){
     const x=i*235,alto=numero===0?200:135,pico=alto+ruido(i+20)*80;
     poligono(c,p[3],[x-140,540,x-60,330,x+75,pico,x+145,300,x+300,540]);poligono(c,p[4]+'55',[x+75,pico,x+145,300,x+300,540,x+155,540]);
     if(numero===3)poligono(c,'#e8f3ed',[x+75,pico,x+27,alto+95,x+66,alto+75,x+94,alto+100,x+125,alto+112]);
     if(numero===4){
      poligono(c,'#f3a072',[x+55,pico+8,x+75,pico,x+93,pico+11,x+88,pico+17]);
      c.strokeStyle='#eb966d';c.lineWidth=3;c.beginPath();c.moveTo(x+75,pico+15);c.lineTo(x+55,pico+75);c.lineTo(x+80,pico+120);c.stroke();
      for(let j=0;j<4;j++)nuvem(c,x+80+j*9,pico-18-j*25,1+j*.1,'#8a6b7944');
     }
    }
    if(numero===0){c.fillStyle='#c0e8cf99';c.fillRect(352,290,22,190);c.fillStyle='#e4f7d588';c.fillRect(357,290,5,190);nuvem(c,363,452,1,'#ddedd650');}
    if(numero===2)for(let i=-1;i<5;i++){c.fillStyle='#e8b98c';c.beginPath();c.ellipse(i*310,510,390,155+i%2*20,-.08,Math.PI,Math.PI*2);c.fill();}
   }else if(camada===2){
    // Torres e cúpulas deixam a cidade distante legível entre as árvores.
    for(let i=-1;i<17;i++){
     const x=i*66,h=35+ruido(i+6)*105,y=430-h;c.fillStyle=p[4];c.fillRect(x,y,41,h+110);poligono(c,p[5],[x-4,y,x+20,y-17-ruido(i)*12,x+46,y]);
     if(i%4===0){c.fillStyle=p[4];c.fillRect(x+14,y-32,13,35);elipse(c,x+20,y-33,9,6,p[4]);}
     c.fillStyle='#ffdfa777';for(let a=0;a<2;a++)for(let b=0;b<3;b++)c.fillRect(x+10+a*16,y+15+b*18,4,7);
     if(i%3===0){c.strokeStyle=p[4];c.lineWidth=3;c.beginPath();c.moveTo(x+40,y+30);c.quadraticCurveTo(x+58,y+45,x+70,y+25);c.stroke();}
    }
    if(numero===0)for(let i=0;i<9;i++)arvore(c,i*135-30,555,185+ruido(i+6)*120,p[4],p[3],i*33);
    if(numero===1)for(let i=0;i<5;i++){const x=i*250+22;c.fillStyle='#696984';c.fillRect(x,315,18,225);c.fillRect(x+100,315,18,225);c.lineWidth=17;c.strokeStyle='#696984';c.beginPath();c.arc(x+59,315,50,Math.PI,0);c.stroke();c.fillStyle='#b8a1a4';c.fillRect(x-4,307,26,10);c.fillRect(x+96,307,26,10);}
    if(numero===3)for(let i=0;i<12;i++)pinheiro(c,i*95,540,100+ruido(i+40)*160,p[4],'#b8d1d7');
   }else{
    for(let i=-1;i<7;i++){
     const x=i*190+40,h=140+ruido(i+21)*100;
     if(numero===0){arvore(c,x,555,h,p[5],'#498a70',i*90);c.strokeStyle='#76ae8188';c.lineWidth=2;c.beginPath();c.moveTo(x+25,365);c.quadraticCurveTo(x-25,412,x+10,468);c.stroke();}
     else if(numero===1){const y=540-h;c.fillStyle=p[5];c.fillRect(x,y,24,h);c.fillRect(x-7,y-7,38,15);c.fillRect(x+70,y+35,24,h);c.fillRect(x-5,y+25,102,12);c.fillStyle='#7f8198';c.fillRect(x+4,y+13,4,h-13);c.fillStyle='#9aab88';c.fillRect(x-7,y-8,38,4);c.strokeStyle='#709588';c.lineWidth=3;c.beginPath();c.moveTo(x+11,y);c.bezierCurveTo(x+43,y+60,x-8,y+80,x+16,y+130);c.stroke();}
     else if(numero===2){c.fillStyle=p[5];c.fillRect(x,540-h*.6,12,h*.6);c.fillRect(x-27,540-h*.47,30,10);c.fillRect(x-29,540-h*.67,10,h*.23);c.fillRect(x+10,540-h*.29,29,10);c.fillRect(x+30,540-h*.52,10,h*.24);poligono(c,p[4],[x+70,540,x+85,540-h*.48,x+113,540-h*.55,x+138,540]);}
     else if(numero===3)pinheiro(c,x,565,h,p[5],'#c7e4e5');
     else{poligono(c,p[5],[x-20,540,x,390,x+20,350,x+55,378,x+73,500,x+100,540]);c.strokeStyle='#bf766755';c.lineWidth=3;c.beginPath();c.moveTo(x+24,368);c.lineTo(x+17,417);c.lineTo(x+41,467);c.stroke();}
    }
    if(numero===0){arvore(c,-28,560,530,'#17474c','#377762',752);arvore(c,1006,560,565,'#17474c','#377762',952);}
    const g=c.createLinearGradient(0,395,0,540);g.addColorStop(0,'#bdd3bb00');g.addColorStop(1,numero===4?'#b7745744':'#b8dbc933');c.fillStyle=g;c.fillRect(0,390,960,150);
   }
   this.camadas.push(canvas);
  }
 }
 desenhar(ctx,cameraX){for(let i=0;i<4;i++){const x=-((Math.round(cameraX*this.fatores[i])%960+960)%960);ctx.drawImage(this.camadas[i],x,0);if(x)ctx.drawImage(this.camadas[i],x+960,0);}}
}
export { Parallax };
