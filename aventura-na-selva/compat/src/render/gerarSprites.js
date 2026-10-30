// Gerado a partir de src/render/gerarSprites.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/gerarSprites.js", function (exports, usar) {
"use strict";
const { elipse } = usar("src/render/arte.js");
const ATLAS = { largura:32, altura:48, quadros:12 };
// Atlas original de 32×48: contorno, luz lateral, mochila, lenço e 12 poses.
function gerarSprites(){
 const atlas=document.createElement('canvas');atlas.width=ATLAS.largura*ATLAS.quadros;atlas.height=ATLAS.altura;const c=atlas.getContext('2d');
 for(let q=0;q<12;q++){
  c.save();c.translate(q*32,0);
  const andando=q>=7&&q<=10,passo=andando?q-7:0,abertura=andando?[-3,0,3,0][passo]:q===3?-3:q===4?3:0;
  const mao=andando?[2,-2,-2,2][passo]:q===3?-5:q===4?-3:0;
  // Mochila e alça visíveis na silhueta, atrás do corpo.
  c.fillStyle='#172f3b';c.fillRect(4,20,10,17);c.fillStyle='#8c6345';c.fillRect(5,21,8,13);c.fillStyle='#cf9c5c';c.fillRect(6,21,6,5);c.fillStyle='#edc879';c.fillRect(7,27,2,3);
  c.fillStyle='#162e3e';c.fillRect(10+abertura,35,7,10);c.fillRect(19-abertura,35,6,10);
  c.fillStyle='#395565';c.fillRect(11+abertura,35,4,8);c.fillRect(20-abertura,35,3,8);
  c.fillStyle='#172d3a';c.fillRect(8+abertura,43,9,5);c.fillRect(18-abertura,43,10,5);
  c.fillStyle='#a86a48';c.fillRect(9+abertura,43,7,3);c.fillRect(19-abertura,43,7,3);c.fillStyle='#e9b579';c.fillRect(10+abertura,43,4,1);c.fillRect(21-abertura,43,4,1);
  // Poncho de explorador com sombra azul e borda clara.
  c.fillStyle='#163848';c.fillRect(9,21,17,15);c.fillRect(7,25,22,8);
  c.fillStyle='#297c7d';c.fillRect(10,22,14,13);c.fillStyle='#4bb09d';c.fillRect(11,22,5,11);c.fillStyle='#1d5668';c.fillRect(21,24,4,10);
  c.fillStyle='#cae2b1';c.fillRect(10,33,15,2);c.fillStyle='#e9bb79';c.fillRect(16,34,3,2);
  c.fillStyle='#173746';c.fillRect(7,25-mao,5,9);c.fillRect(24,25+mao,5,9);
  c.fillStyle='#e3a271';c.fillRect(8,29-mao,4,5);c.fillRect(25,29+mao,4,5);c.fillStyle='#ffd1a0';c.fillRect(9,29-mao,2,3);c.fillRect(26,29+mao,2,3);
  // Lenço vermelho se move com a pose.
  c.fillStyle='#883c43';c.fillRect(10,20,15,4);c.fillRect(8,21,6,6);c.fillStyle='#ed8d68';c.fillRect(11,20,13,2);c.fillRect(9,23,3,4);
  c.fillStyle='#2b3541';c.fillRect(10,10,15,12);c.fillStyle='#d48b64';c.fillRect(12,11,14,10);c.fillStyle='#ffc797';c.fillRect(13,11,12,8);c.fillRect(25,14,3,4);
  c.fillStyle='#e6a47d';c.fillRect(13,18,10,3);c.fillStyle='#f8d9a5';c.fillRect(15,18,7,2);
  c.fillStyle='#263a45';c.fillRect(11,10,4,6);c.fillRect(13,10,11,2);
  if(q===6){c.fillRect(20,14,5,1);}else{c.fillRect(21,13,4,4);c.fillStyle='#fff9dd';c.fillRect(22,13,2,2);}
  c.fillStyle='#b97462';c.fillRect(24,17,2,1);
  // Chapéu de tecido e medalhão, iluminados pela esquerda.
  c.fillStyle='#263848';c.fillRect(5,7,26,5);c.fillRect(10,1,17,8);
  c.fillStyle='#c48a4f';c.fillRect(6,8,24,3);c.fillRect(11,2,15,7);c.fillStyle='#f3cf80';c.fillRect(12,2,10,4);c.fillRect(7,8,20,1);
  c.fillStyle='#84624c';c.fillRect(11,6,15,2);c.fillStyle='#9bd3ad';c.fillRect(23,5,3,3);
  if(q===11){c.fillStyle='#27677b';c.fillRect(1,23,30,4);c.fillStyle='#cae2b1';c.fillRect(2,23,28,1);c.fillStyle='#ffc797';c.fillRect(0,23,3,4);c.fillRect(29,23,3,4);}
  if(q===5){c.globalCompositeOperation='source-atop';c.fillStyle='#fff0c7cc';c.fillRect(0,0,32,48);}
  c.restore();
 }
 return atlas;
}
Object.defineProperty(exports, "gerarSprites", { enumerable: true, get: () => gerarSprites });
Object.defineProperty(exports, "ATLAS", { enumerable: true, get: () => ATLAS });
});
