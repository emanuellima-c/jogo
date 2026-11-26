import { BALANCO as B } from './ajustes.js';

const limitar=(v,min,max)=>Math.max(min,Math.min(max,v));
const centro=ator=>ator.x+ator.w/2;
const pe=ator=>ator.y+ator.h;
function sobrepoe(a,b,margem=0){
  return a.x+margem<b.x+b.w && a.x+a.w-margem>b.x &&
    a.y+margem<b.y+b.h && a.y+a.h-margem>b.y;
}
function criarPisos(fase,selados,tempo=0){
  return fase.pisos.map(p=>{
    const onda=p.tipo==='movel'?Math.sin(tempo*Math.PI*2/(p.periodo||3)+(p.offset||0)):0;
    const x=p.x+onda*(p.dx||0),y=p.y+onda*(p.dy||0);
    return {...p,x,y,origemX:p.x,origemY:p.y,anteriorX:x,anteriorY:y,
      estado:selados.includes(p.id)?'ausente':'inteiro',relogio:0,aviso:0};
  });
}
function posicionar(j,h,p){
  const assistencia=j.perfil?.opcoes?.assistenciaPulo??1;
  h.x=p.x-h.w/2;h.y=p.y-h.h;h.vx=h.vy=0;h.coyote=B.movimento.coyote*assistencia;h.bufferPulo=0;
  h.pisoId=j.pisos.find(s=>s.estado!=='ausente'&&p.x>=s.x&&p.x<=s.x+s.w&&Math.abs(s.y-p.y)<4)?.id??null;
  h.subidaMinima=0;h.bufferPorToque=false;
  h.noChao=h.pisoId!==null;h.usouEco=false;h.cortouPulo=false;
}
function limitePortal(j,antigo){
  const h=j.heroi,cx=centro(h),antes=antigo+h.w/2;
  for(const p of j.fase.portas){
    if(j.portaAberta(p))continue;
    if(antes<=p.x && cx>p.x-h.w/2){h.x=p.x-h.w;h.vx=0;}
    else if(antes>=p.x && cx<p.x+h.w/2){h.x=p.x;h.vx=0;}
  }
}
function atualizarPisos(j,dt){
  const h=j.heroi;
  for(const p of j.pisos){
    p.anteriorX=p.x;p.anteriorY=p.y;
    if(p.tipo==='movel'){
      const onda=Math.sin(j.tempo*Math.PI*2/(p.periodo||3)+(p.offset||0));
      p.x=p.origemX+onda*(p.dx||0);p.y=p.origemY+onda*(p.dy||0);
      if(h.noChao&&h.pisoId===p.id){h.x+=p.x-p.anteriorX;h.y+=p.y-p.anteriorY;}
    }else if(p.tipo==='fragil'){
      if(p.estado==='inteiro'&&h.noChao&&h.pisoId===p.id){
        p.estado='racha';p.relogio=B.ambiente.avisoPonte;
        j.emitirSom('pedra');j.efeito('racha',p.x+p.w/2,p.y);
      }else if(p.estado!=='inteiro'){
        p.relogio-=dt;
        if(p.estado==='racha'){
          p.aviso=limitar(1-p.relogio/B.ambiente.avisoPonte,0,1);
          if(p.relogio<=0){p.estado='ausente';p.relogio=B.ambiente.voltaPonte;j.emitirSom('ruptura');j.efeito('ruptura',p.x+p.w/2,p.y);}
        }else if(p.relogio<=0&&!sobrepoe(h,p)){
          p.estado='inteiro';p.aviso=0;
        }
      }
    }
  }
}
function solidoLateral(p){return p.h>14 && !['movel','fragil','selado'].includes(p.tipo);}
function moverX(j,h,dt){
  const x=h.x;h.x=limitar(x+h.vx*dt,0,j.fase.largura-h.w);
  for(const p of j.pisos){
    if(p.estado==='ausente'||!solidoLateral(p)||h.y+h.h<=p.y+.35||h.y>=p.y+p.h-.35)continue;
    if(x+h.w<=p.x+.01&&h.x+h.w>p.x){h.x=p.x-h.w;h.vx=0;}
    else if(x>=p.x+p.w-.01&&h.x<p.x+p.w){h.x=p.x+p.w;h.vx=0;}
  }
  limitePortal(j,x);
}
function moverY(j,h,dt){
  const e=h.y,base=e+h.h;
  h.y+=h.vy*dt;h.noChao=false;h.pisoId=null;
  let pouso=null,teto=-Infinity;
  for(const p of j.pisos){
    if(p.estado==='ausente'||h.x+h.w-1<=p.x||h.x+1>=p.x+p.w)continue;
    if(h.vy>=0 && base<=Math.max(p.anteriorY,p.y)+1.4 && pe(h)>=p.y-.01){
      if(!pouso||p.y<pouso.y)pouso=p;
    }else if(h.vy<0&&solidoLateral(p)&&e>=p.y+p.h-.02&&h.y<p.y+p.h)teto=Math.max(teto,p.y+p.h);
  }
  if(pouso){h.y=pouso.y-h.h;h.vy=0;h.noChao=true;h.pisoId=pouso.id;h.usouEco=false;}
  else if(teto!==-Infinity){h.y=teto;h.vy=0;}
  return pouso;
}
function movimentar(j,dt,entrada){
  const h=j.heroi,m=B.movimento,eixo=limitar(Number(entrada.eixo)||0,-1,1);
  const assistencia=j.perfil?.opcoes?.assistenciaPulo??1;
  const estavaNoChao=h.noChao,antesVy=h.vy;
  h.coyote=h.noChao?m.coyote*assistencia:Math.max(0,h.coyote-dt);
  if (entrada.pulo) {
    h.bufferPorToque = Boolean(entrada.puloPorToque);
    h.bufferPulo = (h.bufferPorToque ? m.bufferToque : m.buffer) * assistencia;
  } else {
    h.bufferPulo = Math.max(0, h.bufferPulo - dt);
  }
  h.subidaMinima = Math.max(0, h.subidaMinima - dt);
  const livre=h.acao==='livre',aerea=!h.noChao;
  // No multitoque, o ataque pode começar no mesmo passo ou logo antes do salto.
  const saltoComGolpe = h.bufferPorToque && h.etapa==='preparo' &&
    (h.acao==='leve'||h.acao==='pesado') && h.tempoAcao<=.09;
  if(h.bufferPulo>0&&h.coyote>0&&(livre||saltoComGolpe||h.etapa==='recuperacao'&&h.duracaoAcao-h.tempoAcao<.07)){
    h.vy=-m.impulso;h.noChao=false;h.pisoId=null;h.coyote=0;h.bufferPulo=0;h.cortouPulo=false;
    h.subidaMinima = h.bufferPorToque ? m.subidaMinimaToque : 0;
    j.emitirSom('pulo');j.efeito('pulo',centro(h),pe(h),h.dir);
  }
  if(h.subidaMinima===0&&entrada.seguraPulo===false&&!entrada.pulo&&!h.cortouPulo&&h.vy<0){
    h.vy*=m.corte;h.cortouPulo=true;
  }
  if(livre&&eixo)h.dir=eixo>0?1:-1;
  let escala=livre?1:0;
  if(aerea&&['leve','pesado','retorno'].includes(h.acao))escala=.70;
  if(h.acao==='dano')escala=.18;
  let velocidade=escala*eixo*m.velocidade*(h.classe?.velocidade??1);
  const etapa=h.etapa,acao=h.acao;
  if(acao==='esquiva')velocidade=h.dir*(h.classe?.esquiva??B.esquiva).velocidade*(etapa==='recuperacao'?.55:1);
  else if(acao==='eco'&&etapa!=='recuperacao')velocidade=h.dir*B.golpe.eco.avanco;
  else if(acao==='estocada'&&etapa==='impacto')velocidade=h.dir*B.golpe.estocada.avanco;
  if(acao!=='dano'||h.tempoAcao>.08){
    const ambiente=j.emTreino?null:j.ambiente;
    const freio=ambiente?.freio??1;
    const ganhandoVelocidade=eixo&&Math.sign(h.vx)===Math.sign(eixo)&&Math.abs(velocidade)>=Math.abs(h.vx);
    const aceleracao=(eixo||!livre?m.aceleracao:m.freio)*(ganhandoVelocidade||!livre?1:freio)*dt;
    if(livre&&ambiente)velocidade=velocidade*ambiente.velocidade+ambiente.arrasto;
    h.vx+=limitar(velocidade-h.vx,-aceleracao,aceleracao);
  }
  if(acao==='pisada'&&etapa==='impacto')h.vy=B.golpe.pisada.queda;
  else if(acao==='eco'&&etapa!=='recuperacao')h.vy=0;
  else h.vy=Math.min(m.queda,h.vy+m.gravidade*dt);
  moverX(j,h,dt);
  const pouso=moverY(j,h,dt);
  if(pouso&&!estavaNoChao&&antesVy>110){
    j.efeito('pouso',centro(h),pouso.y,h.dir,Math.min(1.4,antesVy/190));
    if(antesVy>220)j.emitirSom('pouso');
  }
  if(pouso && !['movel','fragil','selado'].includes(pouso.tipo)){
    const margem=Math.min(8,pouso.w*.18),cx=centro(h);
    if(cx>=pouso.x+margem&&cx<=pouso.x+pouso.w-margem &&
      !j.fase.espinhos.some(p=>cx>p.x-8&&cx<p.x+p.w+8&&Math.abs(p.y-pouso.y)<25)&&
      !j.ambiente?.zonas.some(zona=>zona.tipo==='vapor'&&cx>zona.x-8&&cx<zona.x+zona.w+8&&Math.abs(zona.y-pouso.y)<25)){
      h.seguro.x=cx;h.seguro.y=pouso.y;
    }
  }
  return pouso;
}
export { limitar, centro, pe, sobrepoe, criarPisos, posicionar, atualizarPisos, movimentar };
