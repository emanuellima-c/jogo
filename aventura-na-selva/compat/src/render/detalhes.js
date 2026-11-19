// Gerado a partir de src/render/detalhes.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/detalhes.js", function (exports, usar) {
"use strict";
const { elipse, poligono, ruido } = usar("src/render/arte.js");
// Cores de superfície e subsolo. O chão sólido permanece perfeitamente legível.
const SOLOS=[
 ['#242637','#384347','#4e5d57','#447753','#76a862','#c4df8b'],
 ['#29273e','#473e59','#655973','#726181','#a89ba5','#dfc3b0'],
 ['#563343','#854b4d','#a9634e','#bf794c','#e1a364','#ffe09a'],
 ['#23324b','#37516b','#52748b','#78a3b1','#a4d6d6','#ecfff1'],
 ['#272334','#443444','#654654','#8e5759','#c0755b','#ffbc78']
];
function pintarTerreno(c,m){
 const tipo=m.fase.mundo??0,p=SOLOS[tipo];
 for(let y=0;y<m.linhas;y++)for(let x=0;x<m.colunas;x++){
  if(!m.tiles[y*m.colunas+x])continue;
  const px=x*32,py=y*32,n=x*31+y*101;
  c.fillStyle=p[0];c.fillRect(px,py,32,32);
  // Faces escalonadas e cortes de luz. As juntas alternam entre as linhas.
  for(let fila=0;fila<2;fila++){
   const yy=py+fila*16,recorte=Math.floor(ruido(n+fila)*3)*2;
   const inicio=(x+y+fila)%2?2:0;
   poligono(c,p[1],[px+inicio,yy+4,px+6+recorte,yy+1,px+27,yy+1,px+31,yy+4,px+29,yy+12,px+22,yy+15,px+3,yy+14]);
   c.fillStyle=p[2];c.fillRect(px+6+recorte,yy+1,13-recorte,2);
   c.fillStyle=p[0];c.fillRect(px+21-recorte,yy+10,8,2);
   if(tipo===4&&ruido(n+fila)>.77){c.fillStyle='#d47c59';c.fillRect(px+5,yy+13,7,2);c.fillRect(px+11,yy+11,4,2);}
  }
  if(!m.solido(x-1,y)){c.fillStyle=p[2];c.fillRect(px,py+2,3,27);}
  if(!m.solido(x+1,y)){c.fillStyle=p[0];c.fillRect(px+28,py,4,32);}
  if(m.solido(x,y-1))continue;
  // A linha contínua e clara corresponde exatamente ao topo da colisão.
  c.fillStyle=p[0];c.fillRect(px,py,32,11);c.fillStyle=p[3];c.fillRect(px,py+1,32,7);
  c.fillStyle=p[4];c.fillRect(px,py,32,4);c.fillStyle=p[5];c.fillRect(px,py,32,2);
  for(let k=0;k<3;k++){
   const ex=px+k*10+2,cauda=4+Math.floor(ruido(n+k)*6)*2;
   if(tipo===0||tipo===3){
    poligono(c,p[3],[ex,py+5,ex+8,py+5,ex+5,py+cauda+5,ex+2,py+cauda+3]);
    c.fillStyle=p[4];c.fillRect(ex+2,py+5,2,cauda/2);
   }
  }
  if(tipo===0&&ruido(n+27)>.61){
   const h=6+Math.round(ruido(n)*4)*2;
   poligono(c,p[3],[px+14,py,px+7,py-h,px+13,py-h+4,px+17,py]);
   poligono(c,p[4],[px+14,py,px+17,py-h-1,px+20,py-h+1,px+18,py]);
   if(ruido(n+8)>.64){c.fillStyle='#ed998b';c.fillRect(px+15,py-h-4,6,4);c.fillStyle='#ffdb98';c.fillRect(px+17,py-h-4,2,2);}
  }
 }
}
function desenharPlataforma(c,p,x,y,tipo){
 const solo=SOLOS[tipo??0],fragil=p.tipo==='fragil',movel=p.tipo==='horizontal'||p.tipo==='vertical';
 const topo=fragil?'#ffd38e':movel?'#97e1cf':solo[5],cor=fragil?'#986950':movel?'#396b70':solo[2];
 x=Math.round(x);y=Math.round(y);
 c.fillStyle='#292638';c.fillRect(x-1,y,p.largura+2,p.altura+2);
 c.fillStyle=cor;c.fillRect(x+1,y+2,p.largura-2,p.altura-3);
 for(let i=2;i<p.largura-4;i+=18){
  const w=Math.min(15,p.largura-i-2);c.fillStyle=fragil?'#b58257':movel?'#51878a':solo[3];
  c.fillRect(x+i,y+4,w,5);c.fillStyle='#232839';c.fillRect(x+i+w-1,y+7,2,4);
 }
 c.fillStyle=topo;c.fillRect(x,y,p.largura,3);c.fillStyle=fragil?'#805349':movel?'#8ab6ab':solo[3];
 c.fillRect(x+9,y+p.altura,12,4);c.fillRect(x+p.largura-21,y+p.altura,12,4);
 if(fragil){c.strokeStyle=p.acionada?'#ffe4a3':'#49394b';c.lineWidth=p.acionada?3:2;c.beginPath();c.moveTo(x+p.largura/2,y);c.lineTo(x+p.largura/2-6,y+5);c.lineTo(x+p.largura/2+1,y+9);c.lineTo(x+p.largura/2-2,y+13);c.stroke();}
 if(movel){c.fillStyle=topo;for(const lado of [-1,1])poligono(c,topo,[x+p.largura/2+lado*10,y+8,x+p.largura/2+lado*4,y+5,x+p.largura/2+lado*4,y+11]);}
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
 const ouro=p.tipo==='ouro',r=Math.round(4+Math.abs(Math.sin(tempo*3+i))*4);
 x=Math.round(x);y=Math.round(y);
 const esc=ouro?'#643854':'#624038',meio=ouro?'#dc8951':'#dd9b47',luz=ouro?'#ffe683':'#ffd17d';
 poligono(c,esc,[x-r+2,y-10,x+r-2,y-10,x+r+1,y-6,x+r+1,y+5,x+r-2,y+10,x-r+2,y+10,x-r-1,y+6,x-r-1,y-6]);
 c.fillStyle=meio;c.fillRect(x-r+1,y-7,2*r-1,14);c.fillStyle=luz;c.fillRect(x-r+2,y-8,Math.max(2,2*r-4),3);c.fillRect(x-r+1,y-5,2,9);
 c.fillStyle=ouro?'#fff2b5':'#fbd991';c.fillRect(x-1,y-5,3,9);
 if(ouro){estrelaMoeda(c,x+8,y-9,tempo+i);}

}
function estrelaMoeda(c,x,y,tempo){if(tempo%1.7>.55)return;c.fillStyle='#ffedb0';c.fillRect(x-3,y,7,2);c.fillRect(x,y-3,2,7);}
function desenharProjetil(c,p,x,y){
 const w=p.largura,h=p.altura;
 if(p.tipo==='tremor'||p.tipo==='onda'){
  const onda=p.tipo==='onda';
  poligono(c,onda?'#2b5369':'#5b3542',[x-2,y+h,x+2,y+h*.32,x+w*.38,y+h*.55,x+w*.65,y-3,x+w,y+h]);
  poligono(c,onda?'#b2f5e2':'#f7bd80',[x+2,y+h-1,x+w*.38,y+h*.68,x+w*.63,y+1,x+w*.76,y+h-1]);
 }else if(p.tipo==='teia'){
  const cx=x+w/2,cy=y+h/2;
  elipse(c,cx,cy,w*.65,h*.65,'#513d68');c.strokeStyle='#efcefd';c.lineWidth=2;
  c.strokeRect(x+1,y+1,w-2,h-2);c.beginPath();c.moveTo(cx,y-1);c.lineTo(cx,y+h+1);
  c.moveTo(x-1,cy);c.lineTo(x+w+1,cy);c.stroke();
 }else{
  const pedra=p.tipo==='pedra';
  poligono(c,'#342b41',[x+2,y,x+w-3,y,x+w,y+4,x+w,y+h-3,x+w-5,y+h,x+1,y+h-2,x-1,y+4]);
  poligono(c,pedra?'#a2878f':'#c28b64',[x+3,y+2,x+w-4,y+1,x+w-2,y+5,x+w-4,y+h-3,x+2,y+h-4]);
  c.fillStyle=pedra?'#efd0b1':'#f3c88b';c.fillRect(x+2,y+2,Math.max(2,w*.4),2);
 }
}
Object.defineProperty(exports, "pintarTerreno", { enumerable: true, get: () => pintarTerreno });
Object.defineProperty(exports, "desenharPlataforma", { enumerable: true, get: () => desenharPlataforma });
Object.defineProperty(exports, "desenharPortal", { enumerable: true, get: () => desenharPortal });
Object.defineProperty(exports, "desenharMoeda", { enumerable: true, get: () => desenharMoeda });
Object.defineProperty(exports, "desenharProjetil", { enumerable: true, get: () => desenharProjetil });
});
