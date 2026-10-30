// Gerado a partir de src/render/extras.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/extras.js", function (exports, usar) {
"use strict";
const { MERCADOR } = usar("src/meta/mercador.js");
const { elipse, poligono, ruido } = usar("src/render/arte.js");
// A barraca é um único desenho em cache; as luzes e Bento são animados à parte.
function criarBarraca(){
 const a=document.createElement('canvas');a.width=360;a.height=225;const c=a.getContext('2d');
 elipse(c,184,207,155,12,'#102b3e44');
 c.fillStyle='#9b6247';c.fillRect(42,65,9,139);c.fillRect(321,65,9,139);c.fillStyle='#e3b477';c.fillRect(44,66,2,135);c.fillRect(323,66,2,135);
 c.fillStyle='#b97b54';c.fillRect(28,44,316,9);c.fillStyle='#efc57f';c.fillRect(27,42,319,3);
 poligono(c,'#174b51',[28,44,60,14,311,14,345,44]);
 for(let i=0;i<10;i++){poligono(c,i%2?'#dcac73':'#478c80',[60+i*25,15,85+i*25,15,344-(9-i)*31.6,45,28+i*31.6,45]);}
 c.fillStyle='#143c47';c.fillRect(28,44,316,7);
 for(let i=0;i<10;i++){c.fillStyle=i%2?'#edcc92':'#58a292';c.fillRect(28+i*31.6,48,31.6,12);elipse(c,44+i*31.6,60,15.8,7,c.fillStyle);}
 // Placa de madeira suspensa, acabamento em latão e motivo de folha.
 c.fillStyle='#152f3b';c.fillRect(125,67,144,32);c.fillStyle='#caa86b';c.fillRect(128,69,138,28);c.fillStyle='#29565a';c.fillRect(131,72,132,22);
 c.textAlign='center';c.font='bold 11px system-ui';c.fillStyle='#ffe1a0';c.fillText('BENTO DO CIPÓ',197,87);c.textAlign='left';
 // Bancada, tábuas, estoque e tapete.
 c.fillStyle='#173a40';c.fillRect(188,154,142,52);c.fillStyle='#9b674b';c.fillRect(191,157,136,46);
 for(let i=0;i<6;i++){c.fillStyle=i%2?'#ac7952':'#996047';c.fillRect(192+i*22,158,20,44);c.fillStyle='#d8ad73';c.fillRect(195+i*22,162,2,33);}
 c.fillStyle='#e1b984';c.fillRect(182,148,153,9);c.fillStyle='#f6d799';c.fillRect(182,148,153,2);
 c.fillStyle='#264c56';c.fillRect(118,202,193,8);c.fillStyle='#b77d61';for(let i=0;i<12;i++)c.fillRect(124+i*15,203,8,4);
 for(let i=0;i<5;i++){
  const x=205+i*22,h=17+i%3*5;c.fillStyle='#183e4c';c.fillRect(x,147-h,13,h);c.fillStyle=i%2?'#78c4aa':'#8ba9d0';c.fillRect(x+2,149-h,9,h-5);c.fillStyle='#f3d39b';c.fillRect(x+4,143-h,5,5);c.fillStyle='#e5f1d0';c.fillRect(x+3,150-h,2,6);
 }
 // Saco de viagem e caixa de frutas.
 c.fillStyle='#4d6857';c.fillRect(17,169,33,33);c.fillStyle='#a8b58a';c.fillRect(22,173,22,24);c.fillStyle='#f2d297';c.fillRect(27,167,12,7);
 c.fillStyle='#98684b';c.fillRect(308,178,39,29);c.fillStyle='#d5ac78';c.fillRect(308,183,39,3);c.fillRect(308,197,39,3);
 for(let i=0;i<5;i++)elipse(c,314+i*6,177-(i%2)*4,5,5,i%2?'#d9b969':'#e6a179');
 // Ervas penduradas, fora da área de leitura dos itens.
 for(let i=0;i<3;i++){const x=71+i*19;c.strokeStyle='#d9b281';c.lineWidth=1;c.beginPath();c.moveTo(x,63);c.lineTo(x,98);c.stroke();for(let k=0;k<5;k++)elipse(c,x+(k%2?4:-3),91+k*4,4,7,k%2?'#5d9176':'#9eb681');}
 return a;
}
function desenharBento(c,x,y,tempo){
 const bob=Math.sin(tempo*2)*1.2,mao=Math.sin(tempo*2.5)*2;
 c.save();c.translate(Math.round(x),Math.round(y+bob));
 c.fillStyle='#172f3c';c.fillRect(-16,-24,12,24);c.fillRect(4,-24,12,24);c.fillStyle='#ae7753';c.fillRect(-19,-6,16,6);c.fillRect(4,-6,17,6);c.fillStyle='#e3b882';c.fillRect(-16,-6,10,2);c.fillRect(6,-6,10,2);
 c.fillStyle='#1e3e46';c.fillRect(-25,-53,49,33);c.fillStyle='#4a7969';c.fillRect(-23,-52,45,30);c.fillStyle='#87a084';c.fillRect(-20,-51,7,26);c.fillStyle='#c89c68';c.fillRect(-7,-53,18,30);c.fillStyle='#f0c58c';c.fillRect(-5,-51,6,25);
 c.fillStyle='#caa96b';for(let i=0;i<3;i++)c.fillRect(6,-46+i*8,3,3);
 c.fillStyle='#193b47';c.fillRect(-29,-48,9,25);c.fillRect(21,-49+mao,9,24);c.fillStyle='#efb98c';c.fillRect(-28,-26,8,7);c.fillRect(22,-28+mao,9,8);
 c.fillStyle='#f1c398';c.fillRect(-16,-76,33,28);c.fillStyle='#d69c79';c.fillRect(-16,-70,6,18);c.fillStyle='#ffe0ad';c.fillRect(-9,-75,22,16);
 c.fillStyle='#e8dcc4';c.fillRect(-19,-68,5,18);c.fillRect(15,-68,5,18);c.fillRect(-14,-54,28,12);c.fillRect(-8,-43,15,5);
 c.strokeStyle='#4b6264';c.lineWidth=1.5;c.strokeRect(-12,-66,12,9);c.strokeRect(4,-66,12,9);c.beginPath();c.moveTo(0,-62);c.lineTo(4,-62);c.stroke();
 c.fillStyle='#294650';c.fillRect(-7,-63,3,tempo%5>4.8?1:3);c.fillRect(9,-63,3,tempo%5>4.8?1:3);
 elipse(c,2,-56,5,4,'#efb58b');c.fillStyle='#fff0d0';c.fillRect(-10,-52,13,5);c.fillRect(4,-52,12,5);
 c.fillStyle='#183a44';c.fillRect(-25,-79,51,7);c.fillRect(-16,-94,35,16);c.fillStyle='#807358';c.fillRect(-24,-78,49,4);c.fillRect(-15,-93,33,13);c.fillStyle='#bba979';c.fillRect(-12,-92,22,5);c.fillStyle='#5a9381';c.fillRect(-15,-82,33,4);c.fillStyle='#f3d394';c.fillRect(11,-83,5,6);
 c.restore();
}
function desenharMercador(ctx,mercador,cameraX,tempo,perto,barraca,brilho){
 const x=mercador.x-cameraX,y=mercador.y;if(x<-400||x>1260)return;
 if(barraca)ctx.drawImage(barraca,x-140,y-207);
 // Lanternas oscilam e iluminam a praça; a luz é uma textura reutilizada.
 for(let i=0;i<2;i++){
  const lx=x-92+i*276+Math.sin(tempo*1.5+i)*2,ly=y-107;
  if(brilho){ctx.globalAlpha=.5+Math.sin(tempo*3+i)*.08;ctx.drawImage(brilho,lx-44,ly-44,88,88);ctx.globalAlpha=1;}
  ctx.strokeStyle='#d7b47c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(lx,y-145);ctx.lineTo(lx,ly-10);ctx.stroke();ctx.fillStyle='#183945';ctx.fillRect(lx-7,ly-11,14,22);ctx.fillStyle='#ffe4a0';ctx.fillRect(lx-4,ly-7,8,13);ctx.fillStyle='#a57554';ctx.fillRect(lx-8,ly+7,16,3);
 }
 elipse(ctx,x,y+2,27,5,'#102b3c44');desenharBento(ctx,x,y,tempo);
 if(perto){
  ctx.fillStyle='#153747f0';ctx.fillRect(x-153,y-204,310,34);ctx.strokeStyle='#cda76f';ctx.lineWidth=1;ctx.strokeRect(x-153,y-204,310,34);
  ctx.fillStyle='#ffedc7';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText(MERCADOR.falas[Math.floor(tempo/7)%MERCADOR.falas.length],x+2,y-183);
  ctx.fillStyle='#173d4c';ctx.fillRect(x-52,y+6,105,20);ctx.fillStyle='#ffe1a0';ctx.font='bold 10px system-ui';ctx.fillText('[ E ] CONVERSAR',x,y+20);ctx.textAlign='left';
 }
}
function desenharAmbiente(ctx,m,cameraX,tempo,reduzir,brilho){
 const tipo=m.fase.mundo,quantidade=reduzir?7:27;
 for(let i=0;i<quantidade;i++){
  const x=((i*113+tempo*(tipo===3?12:24)-cameraX*.35)%1000+1000)%1000-20,y=(i*79+tempo*(tipo===4?-22:18)+6000)%570;
  ctx.globalAlpha=tipo===3?.65:.35;ctx.fillStyle=tipo===4?'#ffcb86':tipo===3?'#f4ffff':tipo===2?'#ffdaa3':tipo===1?'#f8dbad':'#d3ed9b';
  if(tipo===3||tipo===4)elipse(ctx,x,y,1+i%2,1+i%2,ctx.fillStyle);
  else{ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(tempo+i)*.7);ctx.beginPath();ctx.ellipse(0,0,4,1.5,0,0,Math.PI*2);ctx.fill();ctx.restore();}
 }
 if(tipo===0&&brilho)for(let i=0;i<8;i++){const x=((i*149-cameraX*.62)%1000+1000)%1000,y=300+Math.sin(tempo*.7+i*2)*60;ctx.globalAlpha=.16+Math.sin(tempo*1.8+i)*.12;ctx.drawImage(brilho,x-20,y-20,40,40);}
 ctx.globalAlpha=1;
}
function pintarPredios(c,m){
 for(const p of m.fase.predios||[]){
  const x=p.x,y=p.y,w=p.largura,h=p.altura;
  c.fillStyle='#304858';c.fillRect(x,y,w,h);c.fillStyle=p.cor;c.fillRect(x+3,y+3,w-6,h-3);
  c.fillStyle='#273f55';c.fillRect(x+10,y+18,w-20,h-18);c.fillStyle='#4d6976';c.fillRect(x+12,y+20,w-24,h-20);
  for(let py=y+25;py<430;py+=31)for(let px=x+20;px<x+w-16;px+=29){c.fillStyle='#233c50';c.fillRect(px-3,py-3,17,23);c.fillStyle='#e9ce91';c.fillRect(px,py,11,16);c.fillStyle='#fff0bd';c.fillRect(px,py,4,14);c.fillStyle='#57717b';c.fillRect(px+4,py,2,17);c.fillRect(px,py+6,12,2);c.fillStyle='#bdd0bc';c.fillRect(px-4,py+17,20,3);}
  c.fillStyle='#1d3645';c.fillRect(x-5,y-6,w+10,10);c.fillStyle='#e5c795';c.fillRect(x-5,y-6,w+10,3);c.fillStyle='#90b3a2';c.fillRect(x+7,y-13,24,7);c.fillStyle='#cad6ac';c.fillRect(x+11,y-16,17,4);
  c.fillStyle='#c6a67b';c.fillRect(x+8,435,w-16,13);c.fillStyle='#244551';c.fillRect(x+w*.5-12,420,24,28);c.fillStyle='#dbb984';c.fillRect(x+w*.5+6,435,3,3);
 }
 if(m.fase.cidade){
  // A rua acompanha apenas o chão sólido: poços e rios continuam visíveis.
  c.save();c.beginPath();for(let col=0;col<m.colunas;col++)if(m.solido(col,14))c.rect(col*32,448,32,96);c.clip();
  c.fillStyle='#3a495b';c.fillRect(0,454,m.largura,90);c.fillStyle='#9ba6ab';c.fillRect(0,449,m.largura,5);c.fillStyle='#e9d5a3';c.fillRect(0,449,m.largura,1);
  for(let x=0;x<m.largura;x+=40){c.fillStyle='#263e4d';c.fillRect(x,454,1,7);c.fillStyle='#768a92';c.fillRect(x+5,460,28,1);}
  c.fillStyle='#c7b58b';for(let x=0;x<m.largura;x+=80)c.fillRect(x,483,36,2);c.restore();
 }
}
Object.defineProperty(exports, "criarBarraca", { enumerable: true, get: () => criarBarraca });
Object.defineProperty(exports, "desenharBento", { enumerable: true, get: () => desenharBento });
Object.defineProperty(exports, "desenharMercador", { enumerable: true, get: () => desenharMercador });
Object.defineProperty(exports, "desenharAmbiente", { enumerable: true, get: () => desenharAmbiente });
Object.defineProperty(exports, "pintarPredios", { enumerable: true, get: () => pintarPredios });
});
