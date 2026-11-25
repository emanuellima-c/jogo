// Gerado a partir de src/cinzas/combate.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/combate.js", function (exports, usar) {
"use strict";
const { BALANCO: B, TIPOS, classeDoPerfil, dificuldadeDoPerfil } = usar("src/cinzas/ajustes.js");
const { abrirGuarda, dispararDoHeroi, janelaOuro } = usar("src/cinzas/inimigos.js");
const { centro, limitar, pe } = usar("src/cinzas/fisica.js");
const { atributos: atributosAmuletos, nivelGravura } = usar("src/cinzas/progresso.js");
const { dadosHeroi, danoEscalado, eficaciaGravura, multiplicadorResistencia } = usar("src/cinzas/poder.js");
function vidaMaxima(p,bonus){
  return dadosHeroi(p,bonus).vidaMax;
}
function recalcularHeroi(heroi,perfil){
  const bonus=atributosAmuletos(perfil);
  const dados=dadosHeroi(perfil,bonus);
  const modo=dificuldadeDoPerfil(perfil);
  heroi.atributos=bonus;
  heroi.atributosBase=dados.atributos;
  heroi.nivel=dados.nivel;
  heroi.vidaMax=dados.vidaMax;
  heroi.vigorMax=dados.vigorMax;
  heroi.frascosMax=dados.frascosMax;
  heroi.multiplicadorRegeneracao=dados.regeneracaoVigor/modo.regeneracaoVigor;
  heroi.bonusCura=dados.cura-modo.cura;
  heroi.postura=dados.postura;
  heroi.recuo=dados.recuo;
  heroi.custoEsquiva=dados.custoEsquiva;
  heroi.reducaoDano=dados.reducaoDano;
  heroi.recursoMax=dados.recursoMax;
  heroi.regeneracaoRecurso=dados.regeneracaoRecurso;
  // Mudar de equipamento ou comprar uma melhoria preserva os recursos restantes.
  heroi.vida=Math.min(heroi.vida??heroi.vidaMax,heroi.vidaMax);
  heroi.vigor=Math.min(heroi.vigor??heroi.vigorMax,heroi.vigorMax);
  heroi.frascos=Math.min(heroi.frascos??heroi.frascosMax,heroi.frascosMax);
  heroi.recursoClasse=Math.min(heroi.recursoClasse??0,heroi.recursoMax);
}
function criarHeroi(p){
  const classe=classeDoPerfil(p);
  const heroi={classe,recursoClasse:classe.recurso?.inicial??0,contraClasse:0,barreiraClasse:0,
    tempoFuria:0,pontosFuriaAcao:0,golpeAcao:null,
    x:0,y:0,w:B.movimento.largura,h:B.movimento.altura,vx:0,vy:0,dir:1,
    invul:0,noChao:false,pisoId:null,
    acao:'livre',etapa:'livre',tempoAcao:0,duracaoAcao:0,progressoEtapa:0,prep:0,imp:0,rec:0,
    retorno:0,esperaVigor:0,atingidos:new Set(),efetuou:false,combo:0,janelaCombo:0,
    fila:null,bufferPulo:0,bufferPorToque:false,subidaMinima:0,coyote:0,cortouPulo:false,usouEco:false,seguro:null,rolouPerfeito:false,
    ecoUsos:0,ecoDirecao:0,nivelAcao:1,fezContato:false};
  recalcularHeroi(heroi,p);
  return heroi;
}
function livre(h){h.acao='livre';h.etapa='livre';h.tempoAcao=0;h.duracaoAcao=0;h.progressoEtapa=0;h.golpeAcao=null;h.atingidos.clear();}
function definir(h,acao,preparo,impacto,recuperacao,golpe=null){
  h.acao=acao;h.tempoAcao=0;h.prep=preparo;h.imp=impacto;h.rec=recuperacao;
  h.golpeAcao=golpe;
  h.duracaoAcao=preparo+impacto+recuperacao;h.etapa=preparo>0?'preparo':'impacto';
  h.progressoEtapa=0;h.atingidos.clear();h.efetuou=false;h.fezContato=false;
}
// O preparo abre caminho para o impacto e a ação termina depois da recuperação.
// A janela de aparo e a proteção da esquiva começam somente durante o impacto.
function definirEtapa(h){
  const t=h.tempoAcao;
  if(t<h.prep){h.etapa='preparo';h.progressoEtapa=t/h.prep;}
  else if(t<h.prep+h.imp){h.etapa='impacto';h.progressoEtapa=(t-h.prep)/h.imp;}
  else{h.etapa='recuperacao';h.progressoEtapa=limitar((t-h.prep-h.imp)/(h.rec||1),0,1);}
}
const CUSTOS = {leve:'custoLeve',pesado:'custoPesado',esquiva:'custoEsquiva'};
function custoAcao(heroi,acao,base){
  const ajuste=acao==='esquiva'?heroi.custoEsquiva:1;
  return Math.round(base*ajuste*heroi.atributos[CUSTOS[acao]||'custoTecnica']);
}
function devolverVigor(heroi,valor){
  heroi.vigor=Math.min(heroi.vigorMax,heroi.vigor+valor);
}
function alterarRecurso(heroi,valor){
  if(heroi.recursoMax)heroi.recursoClasse=limitar(heroi.recursoClasse+valor,0,heroi.recursoMax);
}
function perderFuria(h){
  if(h.classe.recurso?.tipo!=='furia')return;
  h.recursoClasse=0;h.tempoFuria=0;
}
function aproveitarOuro(jogo,inimigo,janela,prepararGolpe=false){
  inimigo.janelaGasta=true;
  abrirGuarda(inimigo,janela.abertura??1);
  if(prepararGolpe){
    inimigo.danoOuro=janela.bonus;
    inimigo.ouroAte=jogo.tempo+inimigo.duracao;
  }
  devolverVigor(jogo.heroi,janela.vigor??16);
  jogo.emitirSom('janela-ouro');
  jogo.efeito('janela-ouro',centro(inimigo),inimigo.y);
  jogo.evento('janelaOuro',{tecnica:janela.tecnica,guardiao:inimigo.id});
  if(janela.danoDireto){
    inimigo.vida=Math.max(0,inimigo.vida-janela.danoDireto);
    inimigo.flash=.12;
    if(inimigo.vida===0)jogo.derrotar(inimigo);
  }
}

function atravessaFornalha(jogo,inimigo){
  const heroi=jogo.heroi;
  if(heroi.acao!=='eco'||heroi.etapa!=='impacto'||heroi.noChao)return false;
  const janela=janelaOuro(inimigo,true);
  if(janela?.tecnica!=='eco')return false;
  if(inimigo.estado==='aviso'&&inimigo.duracao-inimigo.tempo>(janela.antecedencia??0))return false;
  const x=centro(heroi);
  if(!inimigo.campos.some(campo=>x>=campo.x-5&&x<=campo.x+campo.w+5&&
    pe(heroi)>=campo.y-62&&pe(heroi)<=campo.y+3))return false;
  aproveitarOuro(jogo,inimigo,janela,true);
  return true;
}
function iniciar(j,acao,entrada,slot){
  const h=j.heroi,rolar=acao==='esquiva',talento=h.classe.talento;
  const modo=dificuldadeDoPerfil(j.perfil);
  const direcao=Math.sign(entrada.eixo)||h.dir;
  if(acao==='guarda'){
    if(!h.noChao||h.vigor<=0||!entrada.seguraTalento&&!entrada.talento)return false;
    h.dir=direcao;h.esperaVigor=modo.atrasoVigor;
    definir(h,acao,0,1,0);
    h.combo=0;
    return true;
  }
  let g=B.golpe[acao];
  if(rolar)g=h.classe.esquiva??B.esquiva;
  else if(acao==='talento')g=talento;
  else if(acao==='leve'||acao==='pesado')g=h.classe[acao];
  if(!g)return false;
  const nivel=nivelGravura(j.perfil,acao);
  if((g.recurso??0)>h.recursoClasse){
    if(!g.semRecurso){
      j.dicaCurta(talento.nome+' requer '+g.recurso+' de '+h.classe.recurso.nome+'.');
      return false;
    }
    g=g.semRecurso;
  }
  if(rolar&&!h.noChao&&h.coyote<=0)return false;
  if(acao==='cura'&&(!h.noChao||h.frascos<=0||h.vida>=h.vidaMax))return false;
  if(acao==='retorno'&&h.retorno<=0){j.dicaCurta('Esquive no instante do impacto para abrir o retorno.');return false;}
  if(acao==='pisada'&&h.noChao)return false;
  if(acao==='eco'&&(h.noChao||(h.usouEco&&(nivel<3 || h.ecoUsos>=2 || direcao===h.ecoDirecao))))return false;
  const custoBase=rolar?g.custo:g.vigor;
  const eficiencia=g.dano?1:eficaciaGravura(g,h.atributosBase);
  const custo=custoAcao(h,acao,custoBase/eficiencia);
  if(h.vigor+1e-5<custo){j.emitirSom('vigor');j.dicaCurta('Recupere o vigor antes de agir.');return false;}
  h.dir=direcao;h.nivelAcao=nivel;
  h.vigor=Math.max(0,h.vigor-custo);h.esperaVigor=modo.atrasoVigor;h.slotCarga=slot;
  if(g.recurso)alterarRecurso(h,-g.recurso);
  const furia=acao==='pesado'&&h.classe.recurso?.tipo==='furia'?h.classe.recurso:null;
  h.pontosFuriaAcao=furia?h.recursoClasse:0;
  const preparo=acao==='cura'?modo.preparoFrasco:g.preparo;
  const recuperacao=g.recuperacao-(furia?.recuperacaoPorPonto??0)*h.pontosFuriaAcao;
  definir(h,acao,preparo,g.impacto+(acao==='aparo'?h.atributos.janelaAparo:0),recuperacao,g);
  if(acao==='cura'){
    h.frascos--;j.salvarSessao();
  }else if(rolar){h.rolouPerfeito=false;h.vx=h.dir*g.velocidade;j.emitirSom('esquiva');j.efeito('esquiva',centro(h),pe(h)-8,h.dir);}
  else if(acao==='eco'){
    h.ecoUsos=h.usouEco?h.ecoUsos+1:1;h.ecoDirecao=h.dir;
    h.usouEco=true;h.vy=0;j.emitirSom('eco');j.efeito('eco',centro(h),pe(h)-8,h.dir);
  }
  else if(acao==='retorno')h.retorno=0;
  else if(acao==='pisada'){h.vy=Math.min(0,h.vy);j.emitirSom('pisada');}
  if(acao==='leve'){h.combo=h.janelaCombo>0?(h.combo%2)+1:1;h.janelaCombo=.75;}else h.combo=0;
  return true;
}
function pedido(j,e){
  if(e.esquiva)return {acao:'esquiva'};
  if(e.cura)return {acao:'cura'};
  if(e.t1||e.t2){const slot=e.t1?0:1;return {acao:j.tecnicasAtivas[slot],slot};}
  const talento=j.heroi.classe.talento;
  if(talento&&!talento.segurar&&e.talento)return {acao:'talento'};
  if(e.pesado)return {acao:'pesado'};
  if(e.leve)return {acao:'leve'};
  if(talento?.segurar&&(e.seguraTalento||e.talento))return {acao:'guarda'};
  return null;
}
function atualizarAcao(j,dt,e){
  const h=j.heroi;
  h.invul=Math.max(0,h.invul-dt);h.retorno=Math.max(0,h.retorno-dt);
  h.janelaCombo=Math.max(0,h.janelaCombo-dt);h.esperaVigor=Math.max(0,h.esperaVigor-dt);
  h.contraClasse=Math.max(0,h.contraClasse-dt);h.barreiraClasse=Math.max(0,h.barreiraClasse-dt);
  if(h.tempoFuria>0){
    h.tempoFuria=Math.max(0,h.tempoFuria-dt);
    if(h.tempoFuria===0)perderFuria(h);
  }
  const ped=pedido(j,e),modo=dificuldadeDoPerfil(j.perfil);
  if(h.acao==='guarda'){
    if(ped?.acao==='guarda'&&h.noChao){
      const custo=h.classe.talento.vigorPorSegundo*dt;
      h.vigor=Math.max(0,h.vigor-custo);
      h.esperaVigor=modo.atrasoVigor;
      if(e.eixo)h.dir=Math.sign(e.eixo);
      if(h.vigor>0)return;
    }
    livre(h);
  }
  if(h.acao!=='livre'){
    h.tempoAcao+=dt;
    if(h.acao==='quebra' && h.etapa==='preparo' && (h.slotCarga===0?e.seguraT1:e.seguraT2)){
      h.prep=limitar(Math.max(h.prep,h.tempoAcao+dt),B.golpe.quebra.preparo,B.golpe.quebra.cargaMax);
      h.duracaoAcao=h.prep+h.imp+h.rec;
    }
    if(h.acao==='pisada'&&h.etapa==='impacto'&&!h.noChao)h.tempoAcao=Math.min(h.tempoAcao,h.prep+h.imp-.001);
    if(h.etapa!=='recuperacao'&&h.tempoAcao>=h.prep+h.imp&&!h.fezContato){
      if(h.acao==='pesado')perderFuria(h);
      if(h.golpeAcao?.risco&&h.efetuou){
        ricocheteDeChama(j,h.golpeAcao.risco);
        if(h.vida<=0)return;
      }
    }
    if(h.tempoAcao+1e-8>=h.duracaoAcao)livre(h);
    else definirEtapa(h);
  }else{
    const regeneracao=h.regeneracaoRecurso;
    if(regeneracao)alterarRecurso(h,regeneracao*dt);
    if(h.esperaVigor===0)devolverVigor(h,modo.regeneracaoVigor*h.multiplicadorRegeneracao*dt);
  }
  if(h.fila){h.fila.tempo-=dt;if(h.fila.tempo<=0)h.fila=null;}
  if(ped?.acao==='esquiva'&&h.acao==='estocada'&&h.etapa==='recuperacao'&&h.nivelAcao>=3&&h.fezContato&&
    (h.noChao||h.coyote>0)&&h.vigor>=custoAcao(h,'esquiva',B.esquiva.custo))livre(h);
  if(ped?.acao&&(h.acao==='livre'||h.duracaoAcao-h.tempoAcao<=B.vigor.fila)){
    h.fila={...ped,tempo:B.vigor.fila};
  }
  if(h.acao==='livre'&&h.fila){const f=h.fila;h.fila=null;iniciar(j,f.acao,e,f.slot);}
}
function alvoDeGolpe(h,i,g,radial=false){
  const {alcance,altura}=g;
  if(radial)return Math.abs(centro(h)-centro(i))<=alcance+i.w/2&&Math.abs(pe(h)-pe(i))<=altura+i.h*.55;
  const distancia=(centro(i)-centro(h))*h.dir;
  const limite=h.w*.5+i.w*.5+alcance;
  const noAlcance=g.radial?Math.abs(distancia)<=limite:distancia>=-h.w*.5-i.w*.35&&distancia<=limite;
  return noAlcance&&pe(h)+altura>i.y+2&&h.y-altura<pe(i)-1;
}
function aplicarGolpe(j,i,g,acao,projetil){
  const h=j.heroi,recuperando=i.estado==='recuperacao',desprotegido=recuperando||i.estado==='aberto';
  const janela=janelaOuro(i);
  const direcao=projetil?.dir??h.dir;
  const ladoDoGolpe=(projetil?-projetil.dir*i.w*.5:centro(h)-centro(i))*i.dir;
  const escudo=i.tipo==='escudo'||i.arquetipo==='escudo';
  const guarda=escudo&&!desprotegido&&ladoDoGolpe>=-1;
  const carregado=acao==='quebra',pesado=acao==='pesado';
  const aprimorada=h.nivelAcao>=2;
  const rompeEscudo=escudo&&(carregado||aprimorada&&['estocada','pisada'].includes(acao)||
    h.nivelAcao>=3&&acao==='retorno');
  const bonus=h.atributos;
  const danoBase=danoEscalado(g,h.atributosBase);
  const resistencia=multiplicadorResistencia(i.resistencias,g.tipoDano);
  let multiplicador=bonus.dano*resistencia;
  if(acao==='leve')multiplicador*=bonus.danoLeve;
  if(pesado)multiplicador*=bonus.danoPesado;
  if((projetil?.aereo??!h.noChao)||acao==='pisada')multiplicador*=bonus.danoAereo;
  if(h.frascos===0)multiplicador*=bonus.danoSemFrasco;
  let bloqueado=false;
  if(i.estado==='aberto')multiplicador*=B.combate.bonusAberto;
  else if(i.estado==='recuperacao')multiplicador*=B.combate.bonusRecuperacao*bonus.danoRecuperacao;
  if(i.tipo==='chefe'&&['aviso','impacto'].includes(i.estado)&&ladoDoGolpe>=-2){
    multiplicador*=i.transicao?B.combate.guardaTransicao:(pesado||carregado?B.combate.guardaChefePesado:B.combate.guardaChefeLeve);
    bloqueado=true;
    j.emitirSom('guarda');j.efeito('guarda',centro(i),i.y+i.h*.45,direcao);
  }
  if(guarda&&!rompeEscudo){
    if(pesado){i.postura+=1;if(i.postura>=i.posturaMax)abrirGuarda(i,B.combate.abertura);}
    if(i.estado!=='aberto'){
      bloqueado=true;multiplicador*=B.combate.danoGuarda;
      j.emitirSom('guarda');j.efeito('guarda',centro(i),i.y+i.h*.4,direcao);
    }
  }else if((carregado||rompeEscudo) && i.tipo!=='chefe'){
    abrirGuarda(i,B.combate.abertura+(carregado?h.prep-B.golpe.quebra.preparo:0));
    if(guarda&&carregado&&h.nivelAcao>=3&&!h.fezContato)devolverVigor(h,14);
  }else if((acao==='pisada'||pesado)&&['vigia','lanceiro','voador','boneco'].includes(i.arquetipo||i.tipo)){
    abrirGuarda(i,acao==='pisada'?.58:.42);
  }else if(i.tipo==='chefe'&&i.estado==='recuperacao'&&(carregado||pesado||acao==='pisada')){
    const limite=i.posturaMax;
    if(acao==='pisada'&&i.guardiao?.revelaComPisada){
      abrirGuarda(i,1.12);j.efeito('quebra',centro(i),i.y+i.h*.4,h.dir);
    }else if(limite){
      i.postura+=carregado?3:acao==='pisada'?2:1;
      if(i.postura>=limite){abrirGuarda(i,1);j.efeito('quebra',centro(i),i.y+i.h*.4,h.dir);}
    }else if(carregado)abrirGuarda(i,.64);
  }
  if(janela?.tecnica===acao){
    multiplicador*=1+janela.bonus;
    aproveitarOuro(j,i,janela);
  }else if(i.danoOuro&&i.ouroAte>=j.tempo){
    multiplicador*=1+i.danoOuro;
    i.danoOuro=0;
  }
  const critico=h.classe.critico&&(ladoDoGolpe<-1||recuperando);
  if(critico){
    multiplicador*=h.classe.critico.multiplicador;
    j.efeito('critico',centro(i),i.y+i.h*.32,direcao);
  }
  if(h.contraClasse>0){
    h.contraClasse=0;
    multiplicador*=1+h.classe.talento.bonusContra;
    j.efeito('contra-guarda',centro(i),i.y+i.h*.32,direcao);
  }
  if(pesado&&h.pontosFuriaAcao>0)multiplicador*=1+h.pontosFuriaAcao*h.classe.recurso.bonusPorPonto;
  const dano=Math.max(1,Math.round(danoBase*multiplicador));
  i.vida=Math.max(0,i.vida-dano);i.flash=.12;
  if(!projetil){
    if(!h.fezContato){
      if(acao==='retorno'&&aprimorada)devolverVigor(h,9);
      if(g.concedeRecurso)alterarRecurso(h,g.concedeRecurso);
      if(pesado&&h.classe.recurso?.tipo==='furia'){
        alterarRecurso(h,1);h.tempoFuria=h.classe.recurso.duracao;
        j.efeito('furia',centro(h),h.y+8,h.dir);
      }
    }
    h.fezContato=true;
  }
  if(g.queimadura&&!bloqueado&&i.vida>0){
    const danoQueimadura=Math.max(1,Math.round(g.queimadura.dano*danoBase/g.dano*resistencia));
    if(!i.queimadura||i.queimadura.dano<=danoQueimadura){
      i.queimadura={...g.queimadura,dano:danoQueimadura,tempo:i.queimadura?.tempo??g.queimadura.intervalo};
    }
  }
  const impacto=bloqueado?'impacto-metal':'impacto';
  j.emitirSom(impacto);j.efeito(impacto,centro(i),i.y+i.h*.42,direcao,dano/34);
  if(i.vida<=0)j.derrotar(i,critico?h.classe.critico.ecos:0);
}
function impactoProjetilHeroi(j,i,projetil){
  aplicarGolpe(j,i,projetil.golpe,projetil.acao,projetil);
}
function atacar(j,g,radial){
  const h=j.heroi;
  const giroCompleto=h.acao==='quebra'&&h.nivelAcao>=2&&h.prep>=B.golpe.quebra.cargaMax-1e-7;
  for(const i of j.inimigos){
    if(i.estado==='morto'||i.intangivel||h.atingidos.has(i.id)||!alvoDeGolpe(h,i,g,radial||giroCompleto))continue;
    h.atingidos.add(i.id);aplicarGolpe(j,i,g,h.acao);
  }
}
function ricocheteDeChama(j,dano){
  if(j.emTreino)return;
  const h=j.heroi;
  h.vida=Math.max(0,h.vida-dano);
  j.emitirSom('dano');j.efeito('dano',centro(h),h.y+13,h.dir,dano/22);
  j.dicaCurta('O Sopro da fornalha falhou. A chama voltou contra você.');
  if(h.vida===0)j.morrer(false);else j.salvarSessao();
}
function resolverAcao(j,pouso){
  const h=j.heroi,acao=h.acao;
  const g=h.golpeAcao??B.golpe[acao];
  if(h.etapa!=='impacto'||!g||acao==='esquiva')return;
  if(acao==='eco'){
    for(const inimigo of j.inimigos)if(atravessaFornalha(j,inimigo))break;
  }
  if(acao==='pisada'){
    if(!pouso)return;
    j.emitirSom('pisada');j.efeito('pisada',centro(h),pe(h),h.dir);
    atacar(j,g,true);
    if(h.nivelAcao>=3&&pouso.tipo==='fragil'&&pouso.estado==='racha'){
      pouso.relogio=B.ambiente.avisoPonte;pouso.aviso=0;
    }
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
      h.vida=Math.min(h.vidaMax,h.vida+dificuldadeDoPerfil(j.perfil).cura+h.bonusCura);
      if(j.perfil.frascoNivel>=2)devolverVigor(h,18);
      j.salvarSessao();
    }
    if(g.projetil)dispararDoHeroi(j,g,acao);
    if(g.duracaoBarreira)h.barreiraClasse=g.duracaoBarreira;
    if(g.cura){
      h.vida=Math.min(h.vidaMax,h.vida+g.cura);j.salvarSessao();
    }
    if(acao!=='eco'){
      const efeito=g.tipoDano==='fogo'?'chama':g.projetil?'arcano':acao==='talento'?g.tipo:acao;
      j.emitirSom(acao==='talento'?(g.risco?'pesado':g.cura?'cura':'aparo'):acao);
      j.efeito(efeito,centro(h),pe(h)-12,h.dir);
    }
  }
  if(g.dano&&!g.projetil)atacar(j,g,false);
}
function impactoInimigo(j,i,imparavel=i.imparavel,projetil){
  const h=j.heroi;
  if(atravessaFornalha(j,i))return false;
  if(h.acao==='esquiva'&&h.etapa==='impacto'){
    if(!h.rolouPerfeito){
      h.rolouPerfeito=true;h.retorno=(h.classe.esquiva??B.esquiva).janelaRetorno;devolverVigor(h,h.atributos.vigorEsquiva);
      j.emitirSom('perfeito');j.efeito('perfeito',centro(h),h.y+9,h.dir);
    }
    return false;
  }
  const frontal=(centro(i)-centro(h))*h.dir>=-h.w/2;
  if(h.acao==='aparo'&&h.etapa==='impacto'&&!imparavel&&frontal){
    const janela=janelaOuro(i);
    if(janela?.tecnica==='aparo')aproveitarOuro(j,i,janela,true);
    else abrirGuarda(i,B.combate.abertura);
    h.tempoAcao=h.prep+h.imp+h.rec-.10;
    if(h.nivelAcao>=2)devolverVigor(h,12);
    if(h.nivelAcao>=3)h.retorno=B.esquiva.janelaRetorno;
    if(h.classe.recurso?.porAparo)alterarRecurso(h,h.classe.recurso.porAparo);
    j.emitirSom('aparo-perfeito');j.efeito('aparo-perfeito',centro(h),h.y+8,h.dir,1);return false;
  }
  const op=dificuldadeDoPerfil(j.perfil);
  const escala=i.faseChefe===3?1.16:i.faseChefe===2?1.1:1;
  const danoBase=i.guardiao?.dano??TIPOS[i.tipo].dano;
  const dano=i.dano*(i.nivel===null?op.dano:1)*escala;
  if(!imparavel&&h.invul===0){
    const frenteDaGuarda=projetil?projetil.dir===-h.dir:frontal;
    if(h.acao==='guarda'&&frenteDaGuarda){
      const talento=h.classe.talento;
      const custo=talento.vigorImpacto+dano*talento.vigorPorDano*(1-h.reducaoDano);
      if(h.vigor>=custo){
        h.vigor-=custo;h.contraClasse=talento.janelaContra;
        j.emitirSom('guarda');j.efeito('bloqueio-classe',centro(h)+h.dir*7,h.y+10,h.dir);
        return false;
      }
    }
    if(h.barreiraClasse>0){
      h.barreiraClasse=0;
      j.emitirSom('guarda');j.efeito('barreira-impacto',centro(h),h.y+10,h.dir);
      return false;
    }
  }
  if(j.emTreino){j.dicaCurta('O alvo tocou você. Observe a marca antes do impacto.');return false;}
  const amortecido=!imparavel&&danoBase<=h.classe.armaduraLeve;
  return j.receberGolpe(Math.round(dano*(amortecido?1-h.classe.reducaoLeve:1)),centro(h)>=centro(i)?1:-1,!imparavel);
}
function sofrer(j,valor,dir,permitePostura=false){
  const h=j.heroi;
  const protegido=h.etapa==='impacto'&&(h.acao==='esquiva'||h.acao==='eco'&&h.nivelAcao>=2);
  if(h.invul>0||h.vida<=0||j.emTreino||protegido)return false;
  valor=Math.round(valor*h.atributos.danoRecebido*(1-h.reducaoDano));
  h.vida=Math.max(0,h.vida-valor);h.invul=dificuldadeDoPerfil(j.perfil).protecaoAposDano;
  const atacando=(h.acao==='leve'||h.acao==='pesado')&&h.etapa!=='recuperacao';
  if(!permitePostura||!atacando||valor>h.postura||h.vida===0){
    if(h.acao==='pesado'&&!h.fezContato)perderFuria(h);
    h.vx=dir*90*h.recuo;h.vy=Math.min(h.vy,-55*h.recuo);h.fila=null;
    definir(h,'dano',0,B.vida.duracaoDano,0);
  }
  j.emitirSom('dano');j.efeito('dano',centro(h),h.y+13,dir,valor/22);
  if(h.vida===0)j.morrer(false);else j.salvarSessao();
  return true;
}
Object.defineProperty(exports, "vidaMaxima", { enumerable: true, get: () => vidaMaxima });
Object.defineProperty(exports, "criarHeroi", { enumerable: true, get: () => criarHeroi });
Object.defineProperty(exports, "recalcularHeroi", { enumerable: true, get: () => recalcularHeroi });
Object.defineProperty(exports, "atualizarAcao", { enumerable: true, get: () => atualizarAcao });
Object.defineProperty(exports, "resolverAcao", { enumerable: true, get: () => resolverAcao });
Object.defineProperty(exports, "impactoInimigo", { enumerable: true, get: () => impactoInimigo });
Object.defineProperty(exports, "impactoProjetilHeroi", { enumerable: true, get: () => impactoProjetilHeroi });
Object.defineProperty(exports, "sofrer", { enumerable: true, get: () => sofrer });
});
