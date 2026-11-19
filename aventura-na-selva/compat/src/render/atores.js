// Gerado a partir de src/render/atores.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/atores.js", function (exports, usar) {
"use strict";
const { CAMPANHA: B } = usar("src/core/configuracoes.js");
const { elipse } = usar("src/render/arte.js");
function estrela(ctx,x,y,tamanho,cor){ctx.fillStyle=cor;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?tamanho*.45:tamanho,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();}
function olho(c,x,y,cor='#fff1c5'){elipse(c,x,y,3.5,4,cor);elipse(c,x+1,y,1.7,2.6,'#173641');c.fillStyle='#ffffff';c.fillRect(x+1,y-2,1,1);}
const LINHAS = {macaco:0,cobra:1,besouro:2,aranha:3,onca:4,tatu:5,xama:6,piranha:7};
const AVISO = {cobra:B.avisoBote,onca:B.avisoOnca,tatu:B.avisoBote,besouro:B.avisoBesouro,aranha:B.avisoTeia,xama:.8};
function desenharInimigo(c,e,cameraX,alpha,atlas,flash) {
  const t=e.transformacao, x=Math.round(t.anteriorX+(t.x-t.anteriorX)*alpha-cameraX), y=Math.round(t.anteriorY+(t.y-t.anteriorY)*alpha);
  const cx=x+t.largura/2, base=y+t.altura;
  const aviso=e.estado==='aviso',ataque=e.estado==='ataque',passo=Math.floor(e.idade*5)%2;
  const quadro=aviso?2:ataque?3:passo, largura=t.largura+10, altura=t.altura+7;
  const sentido=(aviso||ataque)&&['cobra','tatu','onca','besouro'].includes(e.tipo)?e.direcaoAtaque:e.controle.direcao;
  c.save();c.translate(Math.round(cx),Math.round(base));c.scale(sentido*(aviso?1.1:1),aviso?.91:1);
  c.drawImage(e.invulneravel>0?flash:atlas,quadro*32,LINHAS[e.tipo]*30,32,30,-largura/2,-altura+3,largura,altura);
  c.restore();
  if(aviso){
    const ax=Math.round(cx),ay=y-17;
    c.fillStyle='#3e263f';c.beginPath();c.moveTo(ax,ay-11);c.lineTo(ax+11,ay);c.lineTo(ax,ay+11);c.lineTo(ax-11,ay);c.fill();
    c.fillStyle='#ffad78';c.beginPath();c.moveTo(ax,ay-9);c.lineTo(ax+9,ay);c.lineTo(ax,ay+9);c.lineTo(ax-9,ay);c.fill();
    c.fillStyle='#462438';c.fillRect(ax-1,ay-5,3,6);c.fillRect(ax-1,ay+3,3,2);
    const carga=1-Math.max(0,Math.min(1,e.espera/(AVISO[e.tipo]||.8)));
    c.fillStyle='#38283b';c.fillRect(ax-11,ay+12,22,3);c.fillStyle='#ffcb87';c.fillRect(ax-11,ay+12,Math.round(22*carga),3);
  } else if(e.vida<e.vidaMaxima){
    c.fillStyle='#241e30';c.fillRect(x-1,y-6,t.largura+2,4);c.fillStyle='#ffd38e';c.fillRect(x,y-5,t.largura*e.vida/e.vidaMaxima,2);
  }
}
function desenharChefe(c,b,cameraX,alpha){
 const t=b.transformacao,x=Math.round(t.anteriorX+(t.x-t.anteriorX)*alpha-cameraX),y=Math.round(t.anteriorY+(t.y-t.anteriorY)*alpha),cor=b.invulneravel>0?'#fff4d0':b.dados.cor;
 elipse(c,x+46,y+86,52,6,'#132b3a44');c.save();c.translate(x+46,y+86);
 const prepara=b.estado==='aviso',avanca=b.estado==='investida';
 c.scale(b.controle.direcao*(prepara?1.07:avanca?1.14:1),prepara?.92:avanca?.88:1);c.translate(0,-86);
 if(b.dados.tipo==='aranha'){
  for(let i=0;i<4;i++){c.strokeStyle='#233448';c.lineWidth=9;c.beginPath();c.moveTo(-20,25+i*12);c.lineTo(-48-i%2*8,10+i*15);c.lineTo(-64+i*3,70+i*5);c.moveTo(20,25+i*12);c.lineTo(48+i%2*8,10+i*15);c.lineTo(64-i*3,70+i*5);c.stroke();}
  elipse(c,0,38,33,39,'#203449');elipse(c,0,32,28,32,cor);elipse(c,-5,21,9,14,'#b4d0c155');elipse(c,0,61,29,20,'#35465c');
  for(let i=0;i<4;i++)olho(c,-18+i*12,54+i%2*5,b.estado==='aviso'?'#ffaf9a':'#ecdfaa');
 }else if(b.dados.tipo==='peixe'){
  c.fillStyle='#e6c08e';c.beginPath();c.moveTo(-32,35);c.lineTo(-63,14);c.lineTo(-60,72);c.lineTo(-32,54);c.fill();
  elipse(c,0,43,43,37,'#243d50');elipse(c,2,39,37,32,cor);elipse(c,12,56,25,16,'#c9d8bc');
  c.fillStyle='#6e9b9c';c.beginPath();c.moveTo(-14,8);c.lineTo(1,-12);c.lineTo(18,11);c.fill();olho(c,22,29);c.fillStyle='#294353';c.fillRect(15,53,26,9);c.fillStyle='#fff0c5';for(let i=0;i<4;i++)c.fillRect(17+i*6,53,4,5);
 }else if(b.dados.tipo==='onca'){
  // Felino em quatro patas. A cauda, a juba e as presas aparecem antes da corrida.
  c.strokeStyle='#282139';c.lineWidth=9;c.beginPath();c.moveTo(-28,54);c.quadraticCurveTo(-68,59,-55,28);c.stroke();
  c.strokeStyle='#d39255';c.lineWidth=5;c.stroke();
  elipse(c,-4,54,41,24,'#282139');elipse(c,-5,51,38,21,cor);
  for(const px of [-31,-17,15,29]){c.fillStyle='#322338';c.fillRect(px,58,13,28);c.fillStyle='#cd8c50';c.fillRect(px+2,57,8,22);c.fillStyle='#ffe0a2';c.fillRect(px+4,81,9,3);}
  for(const [dx,dy] of [[-27,42],[-16,52],[-8,36],[2,46],[10,54]]){c.fillStyle='#6e4945';c.fillRect(dx,dy,7,4);c.fillRect(dx-2,dy+4,3,3);}
  elipse(c,24,36,24,26,'#38273b');elipse(c,24,34,21,23,'#de9852');elipse(c,11,16,8,10,'#3a293b');elipse(c,12,17,4,6,'#e4a079');elipse(c,34,13,7,9,'#3a293b');
  c.fillStyle='#f4c279';c.fillRect(17,24,22,10);olho(c,32,32,prepara?'#ff9a7c':'#fbe7a1');elipse(c,37,44,15,9,'#ffe3a7');c.fillStyle='#36283c';c.fillRect(43,37,8,6);c.fillRect(31,47,15,4);
  c.fillStyle='#fff5cd';c.fillRect(34,50,4,10);c.fillRect(43,49,4,8);
  c.fillStyle='#f5be67';c.fillRect(15,10,16,5);c.fillRect(16,6,3,5);c.fillRect(22,3,3,7);c.fillRect(28,6,3,5);
 }else{
  c.fillStyle='#223444';c.fillRect(-34,23,68,52);c.fillRect(-27,1,55,37);c.fillRect(-47,30,20,48);c.fillRect(27,30,20,48);c.fillRect(-30,70,23,16);c.fillRect(8,70,24,16);
  c.fillStyle=cor;c.fillRect(-30,23,60,49);c.fillRect(-23,4,47,32);c.fillRect(-43,32,15,40);c.fillRect(28,32,15,40);
  c.fillStyle='#e3c59d44';c.fillRect(-26,25,7,36);c.fillRect(-41,34,4,29);c.fillRect(-20,5,8,7);
  elipse(c,0,51,22,23,b.dados.tipo==='pedra'?'#4f6974':'#706765');elipse(c,2,22,23,15,'#47525b');
  if(b.dados.tipo==='pedra'){
   c.fillStyle='#b1c9be';c.fillRect(-30,-3,59,9);c.fillStyle='#95d8cc';c.fillRect(-2,36,5,29);c.fillRect(-12,46,25,4);c.fillRect(-7,40,15,3);c.fillStyle='#dae4c4';c.fillRect(-21,5,9,2);

  }else{
   c.fillStyle='#34404c';c.fillRect(-12,-3,25,8);c.fillStyle='#ead8b0';c.fillRect(-20,76,4,5);c.fillRect(-10,76,4,5);c.fillRect(17,76,4,5);c.fillStyle='#a6cfa5';c.fillRect(-7,37,15,7);c.fillStyle='#e2bf7e';c.fillRect(-3,41,7,8);
  }
  olho(c,-9,19,b.estado==='aviso'?'#ffac8d':'#ffdfa3');olho(c,14,19,b.estado==='aviso'?'#ffac8d':'#ffdfa3');elipse(c,4,26,8,5,'#293f49');c.fillStyle='#fff0c8';c.fillRect(-5,31,23,4);c.fillRect(-5,31,4,8);c.fillRect(14,31,4,8);
 }
 c.restore();
 if(b.aereosSeguidos>=B.aereosParaGuarda){
  c.fillStyle='#36263c';c.fillRect(x+10,y-43,75,13);c.fillStyle='#ffd275';c.font='bold 10px sans-serif';c.fillText('GUARDA ALTA',x+15,y-33);
  c.strokeStyle='#efbd70';c.lineWidth=3;c.beginPath();c.arc(x+46,y+6,22,Math.PI*1.08,Math.PI*1.92);c.stroke();
 }
 if(b.estado==='recuperando'){
  estrela(c,x+46,y-11,7,'#b4f2bb');c.fillStyle='#273442';c.fillRect(x+9,y-29,76,14);
  c.font='bold 10px sans-serif';c.fillStyle='#c3f3b0';c.fillText('VULNERÁVEL',x+14,y-18);
 }
 if(b.estado==='aviso'){
  c.strokeStyle='#ffb08b';c.lineWidth=3;c.setLineDash([7,6]);c.beginPath();c.ellipse(b.alvoX-cameraX+20,443,b.ataqueAtual==='investida'?140:55,10,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
  c.fillStyle='#ffe2b2';c.font='bold 12px system-ui';const nomes={tiros:'PROJÉTEIS',chuva:'PEDRAS!',salto:'SALTO!',tremor:'TREMOR!',investida:'INVESTIDA!',invocar:'REFORÇOS!'};c.fillText(nomes[b.ataqueAtual],x-2,y-18);
 }
}
Object.defineProperty(exports, "estrela", { enumerable: true, get: () => estrela });
Object.defineProperty(exports, "desenharInimigo", { enumerable: true, get: () => desenharInimigo });
Object.defineProperty(exports, "desenharChefe", { enumerable: true, get: () => desenharChefe });
});
