import { elipse } from './arte.js';
function estrela(ctx,x,y,tamanho,cor){ctx.fillStyle=cor;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?tamanho*.45:tamanho,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();}
function olho(c,x,y,cor='#fff1c5'){elipse(c,x,y,3.5,4,cor);elipse(c,x+1,y,1.7,2.6,'#173641');c.fillStyle='#ffffff';c.fillRect(x+1,y-2,1,1);}
function desenharInimigo(c,e,cameraX,alpha){
 const t=e.transformacao,x=Math.round(t.anteriorX+(t.x-t.anteriorX)*alpha-cameraX),y=Math.round(t.anteriorY+(t.y-t.anteriorY)*alpha),w=t.largura,h=t.altura,cor=e.invulneravel>0?'#fff1cd':e.cor||e.dados.cor;
 const movimento=Math.sin(e.idade*12)*2,voando=e.tipo==='besouro'||e.tipo==='aranha'||e.tipo==='piranha';
 if(!voando)elipse(c,x+w/2,y+h+2,w*.5,3,'#122b3a33');
 c.save();c.translate(x+w/2,y);c.scale(e.controle.direcao,1);c.strokeStyle='#1d3643';c.lineWidth=2;
 if(e.tipo==='cobra'){
  elipse(c,-3,h-6,w*.48,7,'#1b3845');elipse(c,-3,h-7,w*.44,5,cor);
  c.strokeStyle='#1b3845';c.lineWidth=14;c.beginPath();c.moveTo(2,h-8);c.quadraticCurveTo(w/2-2,h-12,w/2-9,10);c.stroke();
  c.strokeStyle=cor;c.lineWidth=10;c.stroke();elipse(c,w/2-7,9,10,8,cor);elipse(c,w/2-4,13,7,4,'#d4c998');
  c.fillStyle='#204948';for(let i=0;i<3;i++)c.fillRect(w/2-11,16+i*5,5,2);olho(c,w/2-4,7);
  if(e.estado==='ataque'){c.strokeStyle='#ec9d8e';c.lineWidth=1;c.beginPath();c.moveTo(w/2+1,12);c.lineTo(w/2+10,12);c.lineTo(w/2+13,10);c.moveTo(w/2+10,12);c.lineTo(w/2+13,14);c.stroke();}
 }else if(e.tipo==='aranha'){
  for(let i=0;i<4;i++){const ly=7+i*5,b=Math.sin(e.idade*4+i)*3;c.strokeStyle='#273e51';c.lineWidth=3;c.beginPath();c.moveTo(-7,ly);c.lineTo(-17-i%2*3,ly-6+b);c.lineTo(-22,ly+5);c.moveTo(7,ly);c.lineTo(17+i%2*3,ly-6-b);c.lineTo(22,ly+5);c.stroke();}
  elipse(c,0,h*.45,12,h*.46,'#1c3446');elipse(c,0,h*.4,10,h*.38,cor);elipse(c,-2,7,5,3,'#ffffff33');elipse(c,1,h-5,10,7,'#34405b');olho(c,5,h-6);olho(c,-3,h-6);
 }else if(e.tipo==='besouro'){
  const asa=Math.sin(e.idade*26)*5;c.globalAlpha=.7;elipse(c,-12,4,13,5+asa*.4,'#ccece8');elipse(c,12,4,13,5-asa*.4,'#eaf5d7');c.globalAlpha=1;
  elipse(c,0,h*.55,w*.43,h*.51,'#243b4b');elipse(c,0,h*.5,w*.36,h*.43,cor);elipse(c,-3,h*.4,4,5,'#ecdc9a66');
  c.strokeStyle='#243b4b';c.lineWidth=1;c.beginPath();c.moveTo(0,5);c.lineTo(0,h-2);c.stroke();elipse(c,w*.3,h*.55,7,8,'#354a53');olho(c,w*.35,h*.43);
 }else if(e.tipo==='onca'||e.tipo==='tatu'){
  c.strokeStyle='#263b48';c.lineWidth=5;c.beginPath();c.moveTo(-w/2+7,12);c.quadraticCurveTo(-w/2-10,8,-w/2-5,-3+movimento);c.stroke();
  c.fillStyle='#283b48';c.fillRect(-w/2+6,h-12+movimento,7,12-movimento);c.fillRect(w/2-13,h-12-movimento,7,12+movimento);
  elipse(c,-4,15,w*.45,12,'#263b48');elipse(c,-4,13,w*.41,10,cor);
  if(e.tipo==='tatu'){elipse(c,-6,10,w*.37,11,'#657d86');c.strokeStyle='#bad0bc';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-w/2+10+i*5,4);c.lineTo(-w/2+8+i*5,18);c.stroke();}}
  else{c.fillStyle='#4b4648';for(let i=0;i<6;i++)c.fillRect(-w/2+9+i*4,8+(i%2)*7,3,3);}
  elipse(c,w/2-8,10,11,11,cor);elipse(c,w/2-14,1,4,5,'#33414c');elipse(c,w/2-2,1,4,5,'#33414c');elipse(c,w/2-3,15,7,5,'#eccea0');olho(c,w/2-5,8);c.fillStyle='#263f48';c.fillRect(w/2+1,12,3,3);
 }else if(e.tipo==='piranha'){
  c.fillStyle='#456679';c.beginPath();c.moveTo(-w/2,1);c.lineTo(-w/2+13,h/2);c.lineTo(-w/2,h-1);c.fill();
  elipse(c,3,h/2,w*.42,h*.49,'#233e50');elipse(c,4,h/2-1,w*.36,h*.4,cor);elipse(c,6,h*.68,9,4,'#d5d4ad');olho(c,w/2-6,h*.36);c.fillStyle='#fff2c7';for(let i=0;i<3;i++)c.fillRect(w/2-9+i*3,h*.65,2,4);
 }else{
  // Macaco e xamã: cauda, orelhas, focinho e braços com balanço.
  c.strokeStyle='#263a48';c.lineWidth=5;c.beginPath();c.moveTo(-w/2+8,h-12);c.bezierCurveTo(-w/2-12,h-10,-w/2-14,4,-w/2-3,12);c.stroke();
  elipse(c,0,h*.61,w*.35,h*.35,'#263a48');elipse(c,0,h*.57,w*.3,h*.3,cor);elipse(c,2,h*.64,6,8,'#d6aa7d');
  c.fillStyle=cor;c.fillRect(-w/2+3,h*.4+movimento,6,h*.36);c.fillRect(w/2-9,h*.4-movimento,6,h*.36);
  c.fillStyle='#263a48';c.fillRect(-10,h-7,8,7);c.fillRect(5,h-7,8,7);
  elipse(c,-11,9,5,6,cor);elipse(c,11,9,5,6,cor);elipse(c,0,9,12,12,'#263a48');elipse(c,0,8,10,10,cor);elipse(c,3,12,8,7,'#e8bb89');olho(c,6,6);olho(c,-3,6);c.fillStyle='#624b48';c.fillRect(2,13,5,2);
  if(e.tipo==='xama'){c.fillStyle='#a8cf9c';c.fillRect(-15,-3,30,5);c.fillStyle='#edc78b';c.fillRect(17,5,3,h);estrela(c,18,4,7,'#b7e5c9');}
 }
 c.restore();
 if(e.estado==='aviso'){elipse(c,x+w/2,y-16,10,11,'#fff0bf');c.fillStyle='#8d5544';c.font='bold 16px system-ui';c.fillText('!',x+w/2-3,y-11);}
 if(e.estado==='perseguindo'){c.fillStyle='#efa78e';c.fillRect(x+w/2,y-12,4,4);}
 if(e.vida<e.vidaMaxima){c.fillStyle='#142d31';c.fillRect(x-2,y-7,w+4,4);c.fillStyle='#f0b46b';c.fillRect(x-1,y-6,(w+2)*Math.max(0,e.vida/e.vidaMaxima),2);}
}
function desenharChefe(c,b,cameraX,alpha){
 const t=b.transformacao,x=Math.round(t.anteriorX+(t.x-t.anteriorX)*alpha-cameraX),y=Math.round(t.anteriorY+(t.y-t.anteriorY)*alpha),cor=b.invulneravel>0?'#fff4d0':b.dados.cor;
 elipse(c,x+46,y+86,52,6,'#132b3a44');c.save();c.translate(x+46,y);c.scale(b.controle.direcao,1);
 if(b.dados.tipo==='aranha'){
  for(let i=0;i<4;i++){c.strokeStyle='#233448';c.lineWidth=9;c.beginPath();c.moveTo(-20,25+i*12);c.lineTo(-48-i%2*8,10+i*15);c.lineTo(-64+i*3,70+i*5);c.moveTo(20,25+i*12);c.lineTo(48+i%2*8,10+i*15);c.lineTo(64-i*3,70+i*5);c.stroke();}
  elipse(c,0,38,33,39,'#203449');elipse(c,0,32,28,32,cor);elipse(c,-5,21,9,14,'#b4d0c155');elipse(c,0,61,29,20,'#35465c');
  for(let i=0;i<4;i++)olho(c,-18+i*12,54+i%2*5,b.estado==='aviso'?'#ffaf9a':'#ecdfaa');
 }else if(b.dados.tipo==='peixe'){
  c.fillStyle='#e6c08e';c.beginPath();c.moveTo(-32,35);c.lineTo(-63,14);c.lineTo(-60,72);c.lineTo(-32,54);c.fill();
  elipse(c,0,43,43,37,'#243d50');elipse(c,2,39,37,32,cor);elipse(c,12,56,25,16,'#c9d8bc');
  c.fillStyle='#6e9b9c';c.beginPath();c.moveTo(-14,8);c.lineTo(1,-12);c.lineTo(18,11);c.fill();olho(c,22,29);c.fillStyle='#294353';c.fillRect(15,53,26,9);c.fillStyle='#fff0c5';for(let i=0;i<4;i++)c.fillRect(17+i*6,53,4,5);
 }else{
  c.fillStyle='#223444';c.fillRect(-34,23,68,52);c.fillRect(-27,1,55,37);c.fillRect(-47,30,20,48);c.fillRect(27,30,20,48);c.fillRect(-30,70,23,16);c.fillRect(8,70,24,16);
  c.fillStyle=cor;c.fillRect(-30,23,60,49);c.fillRect(-23,4,47,32);c.fillRect(-43,32,15,40);c.fillRect(28,32,15,40);
  c.fillStyle='#e3c59d44';c.fillRect(-26,25,7,36);c.fillRect(-41,34,4,29);c.fillRect(-20,5,8,7);
  elipse(c,0,51,22,23,b.dados.tipo==='pedra'?'#4f6974':'#706765');elipse(c,2,22,23,15,'#47525b');
  if(b.dados.tipo==='pedra'){
   c.fillStyle='#b1c9be';c.fillRect(-30,-3,59,9);c.fillStyle='#95d8cc';c.fillRect(-2,36,5,29);c.fillRect(-12,46,25,4);c.fillRect(-7,40,15,3);c.fillStyle='#dae4c4';c.fillRect(-21,5,9,2);
  }else if(b.dados.tipo==='onca'){
   elipse(c,-17,1,10,12,cor);elipse(c,17,1,10,12,cor);c.fillStyle='#3e4149';for(let i=0;i<6;i++)c.fillRect(-24+i*9,32+(i%2)*8,5,5);
  }else{
   c.fillStyle='#34404c';c.fillRect(-12,-3,25,8);c.fillStyle='#ead8b0';c.fillRect(-20,76,4,5);c.fillRect(-10,76,4,5);c.fillRect(17,76,4,5);c.fillStyle='#a6cfa5';c.fillRect(-7,37,15,7);c.fillStyle='#e2bf7e';c.fillRect(-3,41,7,8);
  }
  olho(c,-9,19,b.estado==='aviso'?'#ffac8d':'#ffdfa3');olho(c,14,19,b.estado==='aviso'?'#ffac8d':'#ffdfa3');elipse(c,4,26,8,5,'#293f49');c.fillStyle='#fff0c8';c.fillRect(-5,31,23,4);c.fillRect(-5,31,4,8);c.fillRect(14,31,4,8);
 }
 c.restore();
 if(b.estado==='aviso'){
  c.strokeStyle='#ffb08b';c.lineWidth=3;c.setLineDash([7,6]);c.beginPath();c.ellipse(b.alvoX-cameraX+20,443,b.ataqueAtual==='investida'?140:55,10,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
  c.fillStyle='#ffe2b2';c.font='bold 12px system-ui';const nomes={tiros:'PROJÉTEIS',chuva:'PEDRAS!',salto:'SALTO!',tremor:'TREMOR!',investida:'INVESTIDA!',invocar:'REFORÇOS!'};c.fillText(nomes[b.ataqueAtual],x-2,y-18);
 }
}
export { estrela, desenharInimigo, desenharChefe };
