import { tela,tinta,linha,fios,pol,disco,diamante,acaso,hash,luz } from './formas.js';
import { PALETAS } from './terreno-pixel.js';

const FERRO='#414650', BRONZE='#b5885f', CREME='#edcb89', FUNDO='#1c202b';
function coluna(c,x,y,h,cor,clara) {
  tinta(c,cor,x,y-h,7,h);tinta(c,clara,x+1,y-h+4,1,h-6);
  tinta(c,cor,x-2,y-h-2,11,3);tinta(c,clara,x-1,y-h-3,9,1);
  tinta(c,cor,x-2,y-4,11,4);
}
function copa(c,x,y,r,cor,luzFolha,rng) {
  for(let i=0;i<8;i++){
    const px=x+(rng()-.5)*r*2,py=y+(rng()-.5)*r*.6,raio=3+rng()*r*.45;
    disco(c,cor,px,py,raio,raio*.60);
    if(i%2===0)tinta(c,luzFolha,px-raio*.4,py-raio*.5,Math.max(2,raio*.5));
  }
}
function palmeira(c,x,y,h,cor,clara,signo){
  const topo=x+signo*h*.17;
  pol(c,cor,[x-2,y,x+2,y,topo+1,y-h,topo-1,y-h+2]);
  for(let i=0;i<6;i++){
    const lado=i%2?1:-1,t=Math.floor(i/2),lon=h*(.24+t*.13),curva=h*(.24-t*.065);
    for(let n=0;n<7;n++){
      const a=n/6,px=topo+lon*a*lado,py=y-h-Math.sin(a*2.6)*curva+a*a*h*.08;
      const k=h*.13*(1-a)+1;
      pol(c,i%3?cor:clara,[px,py,px+lado*(lon/6+2),py+t*.6,px+lado*k*.5,py+k,px+lado,py+2]);
    }
  }
}
function pinheiro(c,x,y,h,cor,clara) {
  tinta(c,cor,x-1,y-h*.65,3,h*.65);
  for(let j=0;j<5;j++){
    const py=y-h+j*h*.17,r=h*(.1+j*.03);
    pol(c,cor,[x,py,x-r,py+h*.31,x-r*.3,py+h*.27,x-r*.32,py+h*.32,x+r,py+h*.31]);
    if(j%2===0)pol(c,clara,[x,py,x-r*.7,py+h*.25,x-r*.3,py+h*.22,x-1,py+h*.18]);
  }
}
function cristal(c,x,y,h,w,cor,clara){
  pol(c,cor,[x-w,y,x-w,y-h*.7,x-1,y-h,x+w,y-h*.78,x+w,y-3,x+1,y+1]);
  pol(c,clara,[x-w+1,y-2,x-w+1,y-h*.7,x-1,y-h+2,x,y-h*.66,x-1,y-2]);
}
function arco(c,x,y,r,prof,clara) {
  columnaArco(c,x-r,y,r,prof,clara);columnaArco(c,x+r-5,y,r,prof,clara);
  const py=y-r;
  for(let dx=-r;dx<=r;dx++){
    const dy=Math.sqrt(Math.max(0,r*r-dx*dx));
    const menor=Math.sqrt(Math.max(0,(r-5)*(r-5)-dx*dx));
    tinta(c,prof,x+dx,py-dy,1,Math.max(2,dy-menor+1));
    if(dx%14<5)tinta(c,clara,x+dx,py-dy+1,1,2);
  }
}
function columnaArco(c,x,y,r,cor,clara){tinta(c,cor,x,y-r-1,6,r+2);tinta(c,clara,x+1,y-r+4,1,r-4);}
function franja(numero) {
  // Ciclo com bordas iguais. O primeiro plano tem densidade baixa e nunca ganha a borda do terreno.
  const regiao=Math.floor((numero-1)/3),p=PALETAS[regiao],w=640,h=280,imagem=tela(w,h),c=imagem.getContext('2d');
  const rng=acaso(19+numero*7307),coords=[];
  function altura(x){return 218+Math.sin(x/w*Math.PI*4)*6+Math.sin(x/w*Math.PI*6)*3;}
  for(let x=0;x<=w;x+=4)coords.push(x,altura(x));
  pol(c,p.nevoa,[...coords,w,h,0,h]);
  for(let x=12;x<w-12;x+=13+Math.floor(rng()*12)){
    const y=altura(x),tam=8+rng()*23;
    if(regiao===0){copa(c,x,y,9+rng()*12,p.nevoa,p.folha,rng);if(rng()>.75)palmeira(c,x,y+1,tam+11,p.nevoa,p.folha,rng()>.5?1:-1);}
    if(regiao===1){if(rng()>.55)coluna(c,x,y,tam,p.nevoa,p.folha);else if(rng()>.52)cristal(c,x,y,tam*.6,3,p.nevoa,p.folha);}
    if(regiao===2){
      if(rng()>.62){pol(c,p.nevoa,[x-5,y,x-4,y-tam*.7,x-1,y-tam,x+3,y-tam*.8,x+5,y]);tinta(c,p.folha,x-1,y-tam*.73,3);}
      else if(rng()>.80)palmeira(c,x,y+2,tam+9,p.nevoa,p.folha,1);
    }
    if(regiao===3)pinheiro(c,x,y+3,tam+7,p.nevoa,p.folha);
    if(regiao===4)cristal(c,x,y+1,tam,3+rng()*4,p.nevoa,p.folha);
  }
  if(numero===4||numero===5||numero===6){
    const x=numero===5?355:numero===4?175:480,topo=altura(x)+2;
    arco(c,x,topo,numero===5?26:19,p.nevoa,p.folha);
  }
  return imagem;
}
function oficinaEstatica(){
  const v=tela(96,73),c=v.getContext('2d');
  // Barraca itinerante: cumeeira de cobre, toldo de linho petrolado e banco de gravação.
  tinta(c,'#282b35',8,59,78,11);
  tinta(c,'#55494a',11,21,3,48);tinta(c,'#967c61',11,22,1,43);
  tinta(c,'#55444a',78,20,3,49);tinta(c,'#c29a70',78,23,1,45);
  linha(c,'#6f5e51',12,56,31,34,2);linha(c,'#5b5050',79,58,61,34,2);
  pol(c,'#323e45',[14,24,74,23,75,43,65,48,47,41,35,48,17,40]);
  pol(c,'#354a4d',[16,26,72,25,73,40,64,44,48,38,34,43,17,38]);
  for(let x=20;x<72;x+=7)tinta(c,'#425350',x,27,1,10+x%7);
  tinta(c,'#494146',18,29,44,3);tinta(c,'#93765b',19,29,41);
  for(const [x,longa] of [[24,7],[30,6],[36,9],[44,7],[51,8]]){
    linha(c,'#242a32',x,31,x-1,31+longa,2);tinta(c,'#a58b69',x,32,1,3);
    tinta(c,'#829a91',x-1,33+longa,2,3);
  }
  pol(c,FUNDO,[2,23,19,16,39,7,56,7,70,12,92,20,94,24,82,27,69,25,54,28,40,26,26,29,15,26,4,26]);
  pol(c,'#456263',[4,23,21,17,40,9,55,9,73,16,91,21,82,24,68,22,54,25,40,23,25,26,15,24]);
  for(const [a,d,c1] of [[7,23,'#8d7662'],[22,38,'#466e68'],[37,50,'#816a59'],[51,65,'#426b68'],[66,81,'#816957']]){
    pol(c,c1,[44+(a-37)*.38,10,46+(d-37)*.38,10,d,22+(d%3),a,23+(a%3)]);
    linha(c,'#a18b6c',a,24+(a%2),d-2,23);
  }
  fios(c,'#c5a172',[4,24,15,25,25,27,40,24,54,26,68,23,81,25,91,22]);
  fios(c,'#385953',[17,26,17,29,20,30]);tinta(c,BRONZE,11,28,2,4);tinta(c,CREME,78,27,2,4);
  tinta(c,'#62504a',38,7,20,2);tinta(c,'#bf986b',40,7,13);
  // Bancada assimétrica com bigorna, goivas e pote de pó de cristal.
  tinta(c,FUNDO,59,46,27,5);tinta(c,'#c39a68',60,46,24);tinta(c,'#876953',59,48,27,2);
  tinta(c,'#594a47',60,51,3,16);tinta(c,'#9c7e5c',60,52,1,14);
  tinta(c,'#584846',81,51,3,16);linha(c,'#634e46',63,63,79,55,2);
  pol(c,'#393d47',[65,40,78,40,79,42,76,43,75,46,68,46,68,44,64,43,61,41]);
  tinta(c,'#a6aaa0',65,40,12);tinta(c,'#6c7774',67,42,8);
  tinta(c,'#714e46',81,41,5,5);tinta(c,'#cc9266',81,41,5);
  linha(c,'#b8bd9e',83,41,85,36);tinta(c,'#e1b77b',84,36,2,2);
  // Ânfora de limalha e rolos de couro na base do poste.
  disco(c,'#514149',20,64,6,5);tinta(c,'#9c7e61',17,59,6,2);tinta(c,'#7f6154',16,63,3,3);
  for(let x=24;x<31;x+=3){tinta(c,'#5a4846',x,59,2,7);tinta(c,'#b08b65',x,59);}
  tinta(c,'#b69665',15,40,9,1);tinta(c,'#9b7757',15,44,6,1);
  return v;
}
function lanterna(c,x,y,tempo,brilho,parado) {
  const dy=parado?0:Math.round(Math.sin(tempo*2)*.8);
  linha(c,'#a78761',x,y-7,x+dy,y-3);x+=dy;
  luz(c,x,y+3,13,brilho,.35);
  pol(c,FUNDO,[x-4,y,x,y-4,x+4,y,x+3,y+6,x,y+8,x-3,y+6]);
  pol(c,'#4d9a93',[x-2,y,x,y-2,x+3,y,x+2,y+5,x,y+6,x-2,y+4]);
  fios(c,'#a1e7c9',[x,y-1,x+1,y+2,x,y+5]);tinta(c,'#d4ffe0',x,y,2,2);
  tinta(c,'#bb9668',x-3,y-2,6);tinta(c,'#ddb879',x-2,y+6,4);
}
function oficina(c,x,y,tempo,sprite,brilhos,parado){
  c.drawImage(sprite,x-47,y-68);
  lanterna(c,x+26,y-38,tempo,brilhos.verde,parado);
}
function santuario(c,x,y,ativo,t,brilhos,parado) {
  disco(c,'#141c2580',x,y,15,3);
  pol(c,'#1c242d',[x-13,y,x-10,y-4,x-7,y-4,x-6,y-8,x+7,y-8,x+10,y-4,x+13,y-2,x+13,y]);
  tinta(c,'#819184',x-10,y-4,6);tinta(c,'#5a6665',x+4,y-3,7);tinta(c,'#ceb07a',x-5,y-8,9,1);
  pol(c,'#53434a',[x-6,y-8,x-8,y-12,x-5,y-18,x-4,y-12,x+1,y-10,x+5,y-17,x+7,y-11,x+4,y-8]);
  fios(c,'#a59475',[x-6,y-12,x-6,y-15,x-5,y-17]);tinta(c,'#b7a27b',x+4,y-14,2);
  const passo=parado?0:Math.floor(t*7)%4,altura=(ativo?13:8)+[0,2,1,3][passo];
  luz(c,x,y-13,ativo?25:18,brilhos.ouro,ativo?.69:.42);
  pol(c,'#a65344',[x-5,y-9,x-4,y-14,x-1,y-18,x,y-altura-8,x+2,y-15,x+4,y-18,x+5,y-13,x+3,y-9]);
  pol(c,'#ec9d63',[x-4,y-10,x-2,y-15,x,y-altura-6,x+1,y-14,x+3,y-15,x+3,y-11,x+1,y-9]);
  pol(c,'#ffdb91',[x-2,y-10,x-1,y-14,x+1,y-17,x+2,y-12,x+1,y-10]);
  if(!parado)tinta(c,'#e5ad70',x-2+(Math.floor(t*4)%4),y-21-(Math.floor(t*9)%6),1,2);
}
function atalho(c,x,y,aberto,origem,t,brilhos){
  disco(c,'#171d2566',x,y,8,2);tinta(c,FUNDO,x-4,y-21,7,21);
  tinta(c,aberto?'#6d9086':'#7f6b62',x-3,y-20,2,19);tinta(c,'#43484a',x,y-18,2,16);
  const cor=aberto?'#add9b6':'#b39470';
  diamante(c,FUNDO,x,y-23,6);diamante(c,cor,x,y-23,4);diamante(c,'#344541',x,y-23,2);
  if(aberto){luz(c,x,y-22,11,brilhos.verde,.2);tinta(c,'#c9e3ba',x,y-24,1,2);}
  else if(!origem){tinta(c,'#b99972',x-2,y-23,4,3);tinta(c,'#5d5050',x,y-22);}
  for(let n=0;n<2;n++)fios(c,cor,[x-3,y-13+n*5,x,y-15+n*5,x+3,y-13+n*5]);
}
function portao(c,x,y,aberto,t,brilhos,saida=false){
  if(aberto&&!saida){
    tinta(c,'#716862',x-4,y-4,8,3);tinta(c,'#a4b391',x-3,y-5,6);return;
  }
  const claro=aberto?'#9abda4':'#be8275';
  if(saida){
    pol(c,FUNDO,[x-17,y,x-17,y-28,x-12,y-36,x-2,y-41,x+9,y-38,x+16,y-31,x+17,y,x+12,y,x+11,y-28,x+6,y-33,x-1,y-36,x-8,y-32,x-11,y-27,x-11,y]);
    fios(c,'#838f80',[x-16,y-2,x-16,y-26,x-12,y-34,x-2,y-39,x+8,y-36,x+13,y-30]);
    tinta(c,'#65736b',x-13,y-26,2,24);tinta(c,'#526561',x+12,y-26,2,26);
    diamante(c,'#293d40',x-1,y-36,5);diamante(c,claro,x-1,y-36,3);
    if(aberto){
      luz(c,x,y-21,18,brilhos.verde,.43);
      const k=Math.floor(t*6)%11;for(let i=0;i<4;i++)tinta(c,'#aedbc2',x-6+i*4,y-7-(k+i*4)%19,1,2);
    }
  }else{
    tinta(c,'#38313d',x-3,y-34,6,34);
    for(let i=0;i<6;i++){
      const py=y-1-i*5;fios(c,'#936c69',[x-4,py,x-2,py-2,x+3,py-2]);
    }
    diamante(c,'#282535',x,y-38,7);diamante(c,claro,x,y-38,4);tinta(c,'#fff0c6',x,y-40,1,3);
    luz(c,x,y-24,11,brilhos.rubro,.24);
    for(let i=0;i<4;i++)tinta(c,'#f1a598',x-1,y-7-i*7,2);
  }
}
export { franja,oficinaEstatica,oficina,santuario,atalho,portao,cristal };
