import { elipse, poligono, ruido } from './arte.js';
// Cores de superfície e subsolo. O chão sólido permanece perfeitamente legível.
const SOLOS=[['#273f40','#42614b','#91bb72','#d4dda0'],['#3c4357','#646579','#b2b79c','#e8d4a6'],['#855745','#b68059','#e1b97d','#ffe0a4'],['#3b5872','#7693a8','#c3e2e5','#f3ffff'],['#282b3e','#4e3d4b','#a76c59','#efb07e']];
function pintarTerreno(c,m){
 const tipo=m.fase.mundo??0,p=SOLOS[tipo];
 for(let y=0;y<m.linhas;y++)for(let x=0;x<m.colunas;x++){
  if(!m.tiles[y*m.colunas+x])continue;const px=x*32,py=y*32,s=x+y*73,topo=!m.solido(x,y-1);
  c.fillStyle=p[0];c.fillRect(px,py,32,32);c.fillStyle=p[1];c.fillRect(px+(tipo===1?1:0),py+(tipo===1?1:0),tipo===1?30:32,tipo===1?30:32);
  if(tipo===1){c.fillStyle='#353c5055';c.fillRect(px,py+27,32,3);c.fillRect(px+(y%2?8:21),py,2,28);c.fillStyle='#bbb3ae33';c.fillRect(px+3,py+3,18,1);}
  else if(tipo===2){c.fillStyle='#e8b37f66';c.fillRect(px,py+10,32,2);c.fillRect(px,py+24,32,1);c.fillStyle='#804b4266';c.fillRect(px+3,py+15,23,2);}
  else{
   for(let k=0;k<3;k++){const dx=Math.floor(ruido(s+k*4)*25),dy=Math.floor(ruido(s+k*4+1)*25);c.fillStyle=k%2?'#081f3433':'#d2c2a41a';c.fillRect(px+dx,py+dy,4+ruido(s+k+8)*7,3);}
  }
  if(tipo===4&&ruido(s)>.6){c.strokeStyle='#d7855d77';c.lineWidth=1;c.beginPath();c.moveTo(px+3,py+9);c.lineTo(px+16,py+14);c.lineTo(px+12,py+24);c.stroke();}
  if(!m.solido(x-1,y)){c.fillStyle='#0d23344d';c.fillRect(px,py,4,32);}if(!m.solido(x+1,y)){c.fillStyle='#081a3166';c.fillRect(px+28,py,4,32);}
  if(topo){
   c.fillStyle='#172e3b';c.fillRect(px,py,32,9);c.fillStyle=p[2];c.fillRect(px,py,32,5);c.fillStyle=p[3];c.fillRect(px,py,32,2);
   if(tipo===0){c.strokeStyle='#263d3b';c.lineWidth=2;c.beginPath();c.moveTo(px+11,py+8);c.lineTo(px+15,py+18);c.lineTo(px+9,py+27);c.moveTo(px+15,py+18);c.lineTo(px+24,py+21);c.stroke();for(let k=0;k<6;k++){const dx=k*6,h=3+ruido(s+k)*5;poligono(c,k%2?p[2]:'#799c62',[px+dx,py+2,px+dx-2,py-h,px+dx+5,py+2]);}c.fillStyle='#78995f';c.fillRect(px+5,py+5,7,5);}
   if(tipo===3){for(let k=0;k<3;k++){const dx=4+k*10;poligono(c,'#a9d5df',[px+dx,py+5,px+dx+3,py+15+ruido(s+k)*7,px+dx+6,py+5]);}}
   if(tipo===4){c.fillStyle='#db986f';c.fillRect(px+4,py+3,8,1);}
   if(ruido(s+220)>.7&&tipo!==4){
    const dx=px+12;c.fillStyle=tipo===3?'#6a91aa':'#4d8264';c.fillRect(dx,py-11,2,11);
    elipse(c,dx-3,py-6,5,2,tipo===3?'#c1dbe1':'#739b74');elipse(c,dx+4,py-9,5,2,tipo===3?'#d3e7e6':'#8bb983');
    if(tipo===0||tipo===2)elipse(c,dx+1,py-13,3,3,tipo===0?'#e1b490':'#f5d59d');
   }
  }
 }
}
function desenharPlataforma(c,p,x,y,tipo){
 c.fillStyle='#183846';c.fillRect(x-1,y,p.largura+2,p.altura+2);
 c.fillStyle=p.tipo==='fragil'?(p.acionada?'#bb7762':'#a17c58'):tipo===3?'#749bad':'#537f70';c.fillRect(x,y+2,p.largura,p.altura-1);
 c.fillStyle=tipo===3?'#e0f5f0':'#b6cc91';c.fillRect(x,y,p.largura,3);
 c.fillStyle='#e4c28c';for(let dx=7;dx<p.largura-3;dx+=18)c.fillRect(x+dx,y+6,2,3);
 if(p.tipo==='fragil'){c.strokeStyle='#4a4b4b';c.lineWidth=1;c.beginPath();c.moveTo(x+20,y+3);c.lineTo(x+15,y+8);c.lineTo(x+25,y+12);c.stroke();}
}
function desenharPortal(c,x,y,tempo,aberto,descanso,brilho){
 if(brilho){c.globalAlpha=aberto?.3:.1;c.drawImage(brilho,x-45,y-140,150,150);c.globalAlpha=1;}
 c.fillStyle='#1e3549';c.fillRect(x-10,y-82,18,82);c.fillRect(x+48,y-82,18,82);c.fillRect(x-6,y-96,67,17);
 c.fillStyle='#647d7d';c.fillRect(x-7,y-81,12,80);c.fillRect(x+51,y-81,12,80);c.fillRect(x-3,y-94,61,12);
 c.fillStyle='#a7b89c';c.fillRect(x-7,y-81,3,79);c.fillRect(x+51,y-81,3,79);c.fillStyle='#e6ce98';c.fillRect(x-11,y-85,21,5);c.fillRect(x+47,y-85,21,5);c.fillRect(x-4,y-96,64,3);
 c.fillStyle=aberto?'#539e91aa':'#864d66aa';c.fillRect(x+9,y-78,38,78);
 c.globalAlpha=.36;for(let i=0;i<6;i++){c.fillStyle=aberto?'#b6f9d6':'#ec939a';c.fillRect(x+12+Math.sin(tempo*1.5+i)*9+12,y-74+i*11,3,6);}c.globalAlpha=1;
 c.strokeStyle=aberto?'#b5ebc4':'#d3a6a5';c.lineWidth=1;c.strokeRect(x+11,y-76,34,73);
 c.fillStyle='#233e4b';c.fillRect(x+14,y-111,27,22);c.fillStyle='#f5dda0';c.beginPath();c.moveTo(x+28,y-108);c.lineTo(x+35,y-100);c.lineTo(x+28,y-92);c.lineTo(x+21,y-100);c.fill();
 c.font='bold 9px system-ui';c.textAlign='center';c.fillStyle='#fff1c5';c.fillText(descanso?'CONTINUE A JORNADA':aberto?'PORTAL DE AURORA':'DERROTE O GUARDIÃO',x+28,y-122);c.textAlign='left';
}
function desenharMoeda(c,p,x,y,tempo,i,brilho){
 const ouro=p.tipo==='ouro',r=5+Math.abs(Math.sin(tempo*3+i))*3;
 if(brilho&&ouro){c.globalAlpha=.3;c.drawImage(brilho,x-23,y-23,46,46);c.globalAlpha=1;}
 elipse(c,x,y,r+1,10,'#624d3e');elipse(c,x,y,r,9,ouro?'#edb45d':'#afd6ba');elipse(c,x,y-1,Math.max(1,r-2),6,ouro?'#ffdf8a':'#d7ebc0');
 c.fillStyle=ouro?'#b9864e':'#668f7e';c.fillRect(x-1,y-4,2,8);c.fillStyle='#fff4ca';c.fillRect(x-r+2,y-5,1,4);
 if((tempo+i)%3<.4){c.fillStyle='#ffefbb';c.fillRect(x+9,y-12,5,1);c.fillRect(x+11,y-14,1,5);}
}
export { pintarTerreno, desenharPlataforma, desenharPortal, desenharMoeda };
