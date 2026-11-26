// Primitivas discretas. Tanto a textura pré-pintada quanto o ator usam um pixel por unidade.
function tela(w,h) {
  const c=document.createElement('canvas');
  c.width=Math.max(1,Math.ceil(w)); c.height=Math.max(1,Math.ceil(h));
  return c;
}
function tinta(c,cor,x,y,w=1,h=1) {
  c.fillStyle=cor; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function linha(c,cor,x0,y0,x1,y1,largura=1) {
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
  let erro=dx+dy;
  c.fillStyle=cor;
  for (;;) {
    c.fillRect(x0,y0,largura,largura);
    if(x0===x1 && y0===y1)return;
    const proximo=erro*2;
    if(proximo>=dy){erro+=dy;x0+=sx;}
    if(proximo<=dx){erro+=dx;y0+=sy;}
  }
}
function fios(c,cor,p,largura=1) {
  for(let i=2;i<p.length;i+=2)linha(c,cor,p[i-2],p[i-1],p[i],p[i+1],largura);
}
function pol(c,cor,p) {
  let ymin=p[1],ymax=p[1];
  for(let n=3;n<p.length;n+=2){ymin=Math.min(ymin,p[n]);ymax=Math.max(ymax,p[n]);}
  const cortes=[];c.fillStyle=cor;
  for(let y=Math.round(ymin);y<=Math.round(ymax);y++){
    const scan=y+.5;cortes.length=0;
    for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){
      const a=p[i+1],b=p[j+1];
      if((a<=scan&&b>scan)||(b<=scan&&a>scan))cortes.push(p[i]+(scan-a)*(p[j]-p[i])/(b-a));
    }
    if(cortes.length>2)cortes.sort((a,b)=>a-b);
    for(let k=0;k+1<cortes.length;k+=2){
      const x=Math.ceil(Math.min(cortes[k],cortes[k+1])-.5);
      const dir=Math.ceil(Math.max(cortes[k],cortes[k+1])-.5);
      if(dir>x)c.fillRect(x,y,dir-x,1);
    }
  }
}
function disco(c,cor,x,y,rx,ry) {
  rx=Math.max(1,rx);ry=Math.max(1,ry);c.fillStyle=cor;
  for(let i=-Math.floor(ry);i<=Math.floor(ry);i++){
    const borda=Math.floor(rx*Math.sqrt(Math.max(0,1-i*i/(ry*ry))));
    c.fillRect(Math.round(x)-borda,Math.round(y)+i,2*borda+1,1);
  }
}
function diamante(c,cor,x,y,r) {pol(c,cor,[x,y-r,x+r+1,y,x,y+r+1,x-r,y]);}
function acaso(s) {
  return ()=>{s=Math.imul(s,1664525)+1013904223|0;return (s>>>0)/4294967296;};
}
function hash(txt) {
  let r=2166136261;
  for(const l of String(txt)){r^=l.charCodeAt(0);r=Math.imul(r,16777619);}
  return r>>>0;
}
function luz(c,x,y,r,sprite,forca=1) {
  if(!sprite||forca<=0)return;
  const alpha=c.globalAlpha;
  c.globalAlpha=alpha*forca;c.drawImage(sprite,Math.round(x-r),Math.round(y-r),r*2,r*2);c.globalAlpha=alpha;
}
function halo(rgb) {
  const v=tela(48,48),c=v.getContext('2d'),g=c.createRadialGradient(24,24,0,24,24,24);
  g.addColorStop(0,'rgba('+rgb+',.72)');g.addColorStop(.32,'rgba('+rgb+',.34)');g.addColorStop(.72,'rgba('+rgb+',.10)');g.addColorStop(1,'rgba('+rgb+',0)');
  c.fillStyle=g;c.fillRect(0,0,48,48);return v;
}
export { tela,tinta,linha,fios,pol,disco,diamante,acaso,hash,luz,halo };
