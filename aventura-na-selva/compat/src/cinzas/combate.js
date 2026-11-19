// Gerado a partir de src/cinzas/combate.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/combate.js", function (exports, usar) {
"use strict";
const { BALANCO: B, TIPOS } = usar("src/cinzas/ajustes.js");
const { abrirGuarda } = usar("src/cinzas/inimigos.js");
const { centro, limitar, pe } = usar("src/cinzas/fisica.js");
function vidaMaxima(p){return B.vida.base+Math.min(B.vida.bonusMaximo,(p.nivel-1)*B.vida.porNivel);}
function criarHeroi(p){
  return {x:0,y:0,w:B.movimento.largura,h:B.movimento.altura,vx:0,vy:0,dir:1,
    vida:vidaMaxima(p),vidaMax:vidaMaxima(p),vigor:B.vigor.maximo,vigorMax:B.vigor.maximo,
    frascos:B.vida.frascos,frascosMax:B.vida.frascos,invul:0,noChao:false,pisoId:null,
    acao:'livre',etapa:'livre',tempoAcao:0,duracaoAcao:0,progressoEtapa:0,prep:0,imp:0,rec:0,
    retorno:0,esperaVigor:0,atingidos:new Set(),efetuou:false,combo:0,janelaCombo:0,
    fila:null,bufferPulo:0,coyote:0,cortouPulo:false,usouEco:false,seguro:null,rolouPerfeito:false};
}
function livre(h){h.acao='livre';h.etapa='livre';h.tempoAcao=0;h.duracaoAcao=0;h.progressoEtapa=0;h.atingidos.clear();}
function definir(h,acao,preparo,impacto,recuperacao){
  h.acao=acao;h.tempoAcao=0;h.prep=preparo;h.imp=impacto;h.rec=recuperacao;
  h.duracaoAcao=preparo+impacto+recuperacao;h.etapa=preparo>0?'preparo':'impacto';
  h.progressoEtapa=0;h.atingidos.clear();h.efetuou=false;
}
function definirEtapa(h){
  const t=h.tempoAcao;
  if(t<h.prep){h.etapa='preparo';h.progressoEtapa=t/h.prep;}
  else if(t<h.prep+h.imp){h.etapa='impacto';h.progressoEtapa=(t-h.prep)/h.imp;}
  else{h.etapa='recuperacao';h.progressoEtapa=limitar((t-h.prep-h.imp)/(h.rec||1),0,1);}
}
function iniciar(j,acao,entrada,slot){
  const h=j.heroi,rolar=acao==='esquiva',g=rolar?B.esquiva:B.golpe[acao];
  if(!g)return false;
  if(rolar&&!h.noChao&&h.coyote<=0)return false;
  if(acao==='cura'&&(!h.noChao||h.frascos<=0||h.vida>=h.vidaMax))return false;
  if(acao==='retorno'&&h.retorno<=0){j.dicaCurta('Esquive no instante do impacto para abrir o retorno.');return false;}
  if(acao==='pisada'&&h.noChao||acao==='eco'&&(h.noChao||h.usouEco))return false;
  const custo=rolar?g.custo:g.vigor;
  if(h.vigor+1e-5<custo){j.emitirSom('vigor');j.dicaCurta('Recupere o vigor antes de agir.');return false;}
  if(entrada.eixo)h.dir=Math.sign(entrada.eixo);
  h.vigor=Math.max(0,h.vigor-custo);h.esperaVigor=B.vigor.repouso;h.slotCarga=slot;
  definir(h,acao,g.preparo,g.impacto,g.recuperacao);
  if(acao==='cura'){
    h.frascos--;j.salvarSessao();
  }else if(rolar){h.rolouPerfeito=false;h.vx=h.dir*g.velocidade;j.emitirSom('esquiva');j.efeito('esquiva',centro(h),pe(h)-8,h.dir);}
  else if(acao==='eco'){h.usouEco=true;h.vy=0;j.emitirSom('eco');j.efeito('eco',centro(h),pe(h)-8,h.dir);}
  else if(acao==='retorno')h.retorno=0;
  else if(acao==='pisada'){h.vy=Math.min(0,h.vy);j.emitirSom('pisada');}
  if(acao==='leve'){h.combo=h.janelaCombo>0?(h.combo%2)+1:1;h.janelaCombo=.75;}else h.combo=0;
  return true;
}
function pedido(j,e){
  if(e.esquiva)return {acao:'esquiva'};
  if(e.cura)return {acao:'cura'};
  if(e.t1||e.t2){const slot=e.t1?0:1;return {acao:j.tecnicasAtivas[slot],slot};}
  if(e.pesado)return {acao:'pesado'};
  if(e.leve)return {acao:'leve'};
  return null;
}
function atualizarAcao(j,dt,e){
  const h=j.heroi;
  h.invul=Math.max(0,h.invul-dt);h.retorno=Math.max(0,h.retorno-dt);
  h.janelaCombo=Math.max(0,h.janelaCombo-dt);h.esperaVigor=Math.max(0,h.esperaVigor-dt);
  if(h.acao!=='livre'){
    h.tempoAcao+=dt;
    if(h.acao==='quebra' && h.etapa==='preparo' && (h.slotCarga===0?e.seguraT1:e.seguraT2)){
      h.prep=limitar(Math.max(h.prep,h.tempoAcao+dt),B.golpe.quebra.preparo,B.golpe.quebra.cargaMax);
      h.duracaoAcao=h.prep+h.imp+h.rec;
    }
    if(h.acao==='pisada'&&h.etapa==='impacto'&&!h.noChao)h.tempoAcao=Math.min(h.tempoAcao,h.prep+h.imp-.001);
    if(h.tempoAcao+1e-8>=h.duracaoAcao)livre(h);
    else definirEtapa(h);
  }else if(h.esperaVigor===0){
    h.vigor=Math.min(h.vigorMax,h.vigor+B.vigor.porSegundo*dt);
  }
  if(h.fila){h.fila.tempo-=dt;if(h.fila.tempo<=0)h.fila=null;}
  const ped=pedido(j,e);
  if(ped?.acao&&(h.acao==='livre'||h.duracaoAcao-h.tempoAcao<=B.vigor.fila)){
    h.fila={...ped,tempo:B.vigor.fila};
  }
  if(h.acao==='livre'&&h.fila){const f=h.fila;h.fila=null;iniciar(j,f.acao,e,f.slot);}
}
function alvoDeGolpe(h,i,alcance,altura,radial=false){
  if(radial)return Math.abs(centro(h)-centro(i))<=alcance+i.w/2&&Math.abs(pe(h)-pe(i))<=altura+i.h*.55;
  const distancia=(centro(i)-centro(h))*h.dir;
  return distancia>=-h.w*.5-i.w*.35&&distancia<=h.w*.5+i.w*.5+alcance &&
    h.y+h.h+altura>i.y+2 && h.y-altura<pe(i)-1;
}
function aplicarGolpe(j,i,g,acao){
  const h=j.heroi,desprotegido=['recuperacao','aberto'].includes(i.estado);
  const guarda=i.tipo==='escudo' && !desprotegido && (centro(h)-centro(i))*i.dir>=-1;
  const carregado=acao==='quebra',pesado=acao==='pesado';
  let multiplicador=1+Math.min(B.combate.bonusNivelMaximo,(j.perfil.nivel-1)*B.combate.danoPorNivel);
  if(i.estado==='aberto')multiplicador*=B.combate.bonusAberto;
  else if(i.estado==='recuperacao')multiplicador*=B.combate.bonusRecuperacao;
  if(i.tipo==='chefe'&&['aviso','impacto'].includes(i.estado)&&(centro(h)-centro(i))*i.dir>=-2){
    multiplicador*=i.transicao?B.combate.guardaTransicao:(pesado||carregado?B.combate.guardaChefePesado:B.combate.guardaChefeLeve);
    j.emitirSom('guarda');j.efeito('guarda',centro(i),i.y+i.h*.45,h.dir);
  }
  if(guarda&&!carregado){
    if(pesado){i.postura+=1;if(i.postura>=B.combate.postura)abrirGuarda(i,B.combate.abertura);}
    if(i.estado!=='aberto'){multiplicador*=B.combate.danoGuarda;j.emitirSom('guarda');j.efeito('guarda',centro(i),i.y+i.h*.4,h.dir);}
  }else if(carregado && i.tipo!=='chefe'){
    abrirGuarda(i,B.combate.abertura+(h.prep-B.golpe.quebra.preparo));
  }else if((acao==='pisada'||pesado)&&['vigia','lanceiro','voador','boneco'].includes(i.tipo)){
    abrirGuarda(i,acao==='pisada'?.58:.42);
  }else if(carregado&&i.tipo==='chefe'&&i.estado==='recuperacao'){
    abrirGuarda(i,.64);
  }
  const dano=Math.max(1,Math.round(g.dano*multiplicador));
  i.vida=Math.max(0,i.vida-dano);i.flash=.12;
  j.emitirSom('impacto');j.efeito('impacto',centro(i),i.y+i.h*.42,h.dir);
  if(i.vida<=0)j.derrotar(i);
}
function atacar(j,radial){
  const h=j.heroi,g=B.golpe[h.acao];
  for(const i of j.inimigos){
    if(i.estado==='morto'||h.atingidos.has(i.id)||!alvoDeGolpe(h,i,g.alcance,g.altura,radial))continue;
    h.atingidos.add(i.id);aplicarGolpe(j,i,g,h.acao);
  }
}
function resolverAcao(j,pouso){
  const h=j.heroi,acao=h.acao;
  if(h.etapa!=='impacto'||!B.golpe[acao])return;
  if(acao==='pisada'){
    if(!pouso)return;
    j.emitirSom('pisada');j.efeito('pisada',centro(h),pe(h),h.dir);
    atacar(j,true);
    if(pouso.tipo==='selado'){
      pouso.estado='ausente';h.noChao=false;h.pisoId=null;
      const selos=j.perfil.selados[j.fase.id];
      if(!selos.includes(pouso.id)){selos.push(pouso.id);j.emitirSom('ruptura');j.salvarSessao();}
    }else{
      h.tempoAcao=h.prep+h.imp;definirEtapa(h);
    }
    return;
  }
  if(!h.efetuou){
    h.efetuou=true;
    if(acao==='cura'){
      h.vida=Math.min(h.vidaMax,h.vida+B.vida.cura);j.salvarSessao();
    }
    if(acao!=='eco'){j.emitirSom(acao);j.efeito(acao,centro(h),pe(h)-12,h.dir);}
  }
  if(B.golpe[acao].dano)atacar(j,false);
}
function impactoInimigo(j,i,imparavel=i.imparavel){
  const h=j.heroi;
  if(h.acao==='esquiva'&&h.etapa==='impacto'){
    if(!h.rolouPerfeito){h.rolouPerfeito=true;h.retorno=B.esquiva.janelaRetorno;j.emitirSom('perfeito');j.efeito('perfeito',centro(h),h.y+9,h.dir);}
    return false;
  }
  const frontal=(centro(i)-centro(h))*h.dir>=-h.w/2;
  if(h.acao==='aparo'&&h.etapa==='impacto'&&!imparavel&&frontal){
    abrirGuarda(i,B.combate.abertura);h.tempoAcao=h.prep+h.imp+h.rec-.10;
    j.emitirSom('aparo');j.efeito('aparo',centro(h),h.y+8,h.dir);return false;
  }
  if(j.emTreino){j.dicaCurta('O alvo tocou você. Observe a marca antes do impacto.');return false;}
  const op=B.dificuldade[j.perfil.opcoes.modo]||B.dificuldade.normal;
  return j.receberGolpe(Math.round(TIPOS[i.tipo].dano*op.dano*(i.faseChefe===2?1.1:1)),centro(h)>=centro(i)?1:-1);
}
function sofrer(j,valor,dir){
  const h=j.heroi;
  if(h.invul>0||h.vida<=0||j.emTreino||(h.acao==='esquiva'&&h.etapa==='impacto'))return false;
  h.vida=Math.max(0,h.vida-valor);h.invul=B.vida.protecao;h.vx=dir*90;h.vy=Math.min(h.vy,-55);h.fila=null;
  definir(h,'dano',0,B.vida.duracaoDano,0);
  j.emitirSom('dano');j.efeito('dano',centro(h),h.y+13,dir);
  if(h.vida===0)j.morrer(false);else j.salvarSessao();
  return true;
}
Object.defineProperty(exports, "vidaMaxima", { enumerable: true, get: () => vidaMaxima });
Object.defineProperty(exports, "criarHeroi", { enumerable: true, get: () => criarHeroi });
Object.defineProperty(exports, "atualizarAcao", { enumerable: true, get: () => atualizarAcao });
Object.defineProperty(exports, "resolverAcao", { enumerable: true, get: () => resolverAcao });
Object.defineProperty(exports, "impactoInimigo", { enumerable: true, get: () => impactoInimigo });
Object.defineProperty(exports, "sofrer", { enumerable: true, get: () => sofrer });
});
