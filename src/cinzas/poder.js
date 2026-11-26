import { ATRIBUTOS, BALANCO as B, CLASSES, CURVA_FASES, ESCALA_DANO, GUARDIOES, MAXIMO_ATRIBUTO,
  MINIMO_ATRIBUTO, NIVEL_MAXIMO, RESISTENCIAS_NEUTRAS, TIPOS, TIPOS_DANO, classeDoPerfil, dificuldadeDoPerfil } from './ajustes.js';
import { limitar } from './fisica.js';
import { amuletoPorId, atributos as atributosAmuletos, modificadorAtivo, nivelGravura } from './progresso.js';

const chaves = Object.keys(ATRIBUTOS);
const custosRedutiveis = new Set(['custoLeve','custoPesado','custoEsquiva','custoTecnica','danoRecebido']);
const inteiro = (valor,minimo,maximo,padrao=minimo) =>
  Number.isFinite(valor)?limitar(Math.floor(valor),minimo,maximo):padrao;
const pontoValido = valor => inteiro(valor,MINIMO_ATRIBUTO,MAXIMO_ATRIBUTO);

function pontosEfetivos(chave,valor){
  if(!Object.hasOwn(ATRIBUTOS,chave))return 0;
  const [primeiro,segundo]=ATRIBUTOS[chave].limites;
  const ponto=pontoValido(valor);
  return Math.min(ponto,primeiro)-MINIMO_ATRIBUTO+
    .50*Math.max(0,Math.min(ponto,segundo)-primeiro)+.25*Math.max(0,ponto-segundo);
}

function nivelDosAtributos(atributos){
  return chaves.reduce((soma,chave)=>soma+pontoValido(atributos?.[chave])-MINIMO_ATRIBUTO,0);
}

function alocar(atributos,pontos,ordem,limite){
  let livres=ordem.filter(chave=>atributos[chave]<limite[chave]);
  let indice=0;
  while(pontos>0&&livres.length){
    const chave=livres[indice%livres.length];
    atributos[chave]++;pontos--;indice++;
    if(atributos[chave]===limite[chave])livres=livres.filter(id=>id!==chave);
  }
  return pontos;
}

const tetosAtributos = Object.fromEntries(chaves.map(chave=>[chave,MAXIMO_ATRIBUTO]));
function atributosParaNivel(classeOuId,nivel,estrategia='equilibrada'){
  const classe=typeof classeOuId==='string'?classeDoPerfil({classe:classeOuId}):classeOuId??CLASSES.herdeiro;
  const iniciais=classe.atributosIniciais;
  const inicial=classe.nivelInicial;
  const alvo=inteiro(nivel,0,NIVEL_MAXIMO,inicial);
  const sugeridos=classe.atributosSugeridos;
  if(alvo<inicial){
    // A troca de classe em saves anteriores podia deixar um nível abaixo do inicial do kit novo.
    const atributos=Object.fromEntries(chaves.map(chave=>[chave,MINIMO_ATRIBUTO]));
    alocar(atributos,alvo,[...new Set([...sugeridos,...chaves])],iniciais);
    return atributos;
  }
  const atributos={...iniciais};
  const principal=sugeridos.find(chave=>Object.hasOwn(classe.pesado.escala,chave))??sugeridos[0];
  let ordem;
  if(estrategia==='especializada')ordem=[principal,...sugeridos];
  else if(estrategia==='concentrada')ordem=[principal];
  else if(estrategia==='mal-construida')ordem=chaves.filter(chave=>!sugeridos.includes(chave)&&
    !Object.hasOwn(classe.leve.escala,chave)&&!Object.hasOwn(classe.pesado.escala,chave));
  else ordem=[...new Set(['vitalidade',principal,'folego','equilibrio',...chaves])];
  const restantes=alocar(atributos,alvo-inicial,ordem,tetosAtributos);
  alocar(atributos,restantes,chaves,tetosAtributos);
  return atributos;
}

function custoNivel(nivelAtual){
  const nivel=inteiro(nivelAtual,0,NIVEL_MAXIMO);
  return nivel===NIVEL_MAXIMO?Infinity:8+nivel+Math.floor(18*nivel*nivel/1000);
}

function custoAcumulado(deNivel,ateNivel){
  const inicio=ateNivel===undefined?0:inteiro(deNivel,0,NIVEL_MAXIMO);
  const fim=inteiro(ateNivel??deNivel,0,NIVEL_MAXIMO);
  let custo=0;
  for(let nivel=inicio;nivel<fim;nivel++)custo+=custoNivel(nivel);
  return custo;
}

function dadosHeroi(perfil,bonus=atributosAmuletos(perfil)){
  const classe=classeDoPerfil(perfil),modo=dificuldadeDoPerfil(perfil);
  const atributos=perfil.atributos?Object.fromEntries(chaves.map(chave=>[chave,pontoValido(perfil.atributos[chave])])):
    atributosParaNivel(classe,perfil.nivel);
  const ganho=chave=>pontosEfetivos(chave,atributos[chave])-pontosEfetivos(chave,classe.atributosIniciais[chave]);
  const folego=ganho('folego'),fe=ganho('fe'),intelecto=ganho('intelecto');
  const equilibrio=pontosEfetivos('equilibrio',atributos.equilibrio);
  const custoEsquiva=1+limitar(-.012*ganho('destreza'),-.30,.12);
  const vigorCurto=modificadorAtivo(perfil,'vigor-curto')?.75:1;
  const recurso=classe.recurso;
  let recursoMax=recurso?.maximo??0;
  if(recurso?.tipo==='foco')recursoMax+=Math.trunc(intelecto/6);
  if(recurso?.tipo==='chama')recursoMax+=Math.trunc((intelecto+fe)/9);
  if(recurso?.tipo==='fe')recursoMax+=Math.trunc(fe/6);
  return {
    classe,atributos,nivel:nivelDosAtributos(atributos),
    vidaMax:Math.max(1,Math.round(classe.vidaBase+3.5*ganho('vitalidade')+bonus.vida)),
    vigorMax:Math.max(1,Math.round((classe.vigorBase+2.8*folego+bonus.vigor)*vigorCurto)),
    regeneracaoVigor:Math.max(1,(modo.regeneracaoVigor+.55*folego)*bonus.regeneracao),
    cura:Math.max(0,modo.cura+.75*fe+bonus.cura),
    frascosMax:modificadorAtivo(perfil,'sem-frascos')?0:B.vida.frascos+Number(perfil.frascoNivel===3),
    postura:(classe.armaduraLeve??0)+1.35*equilibrio,
    recuo:1-.02*equilibrio,reducaoDano:limitar(.009*ganho('equilibrio'),-.08,.28),custoEsquiva,
    recursoMax:Math.max(recurso?.inicial??0,recursoMax),
    regeneracaoRecurso:recurso?.regeneracao?Math.max(.1,recurso.regeneracao+.045*intelecto):0
  };
}

function eficaciaGravura(golpe,atributos){
  const faltam=Object.entries(golpe.requisitos??{}).reduce((soma,[chave,minimo])=>
    soma+Math.max(0,minimo-pontoValido(atributos?.[chave])),0);
  return 1-Math.min(.25,.025*faltam);
}

function danoEscalado(golpe,atributos){
  const bonus=Object.entries(golpe.escala??{}).reduce((soma,[chave,nota])=>
    soma+(ESCALA_DANO[nota]??0)*pontosEfetivos(chave,atributos?.[chave]),0);
  return (golpe.dano??0)*(1+.028*bonus)*eficaciaGravura(golpe,atributos);
}

function multiplicadorResistencia(resistencias,tipoDano='fisico'){
  const resistencia=Object.hasOwn(TIPOS_DANO,tipoDano)?resistencias?.[tipoDano]:0;
  return 1-limitar(Number.isFinite(resistencia)?resistencia:0,-.25,.32);
}

function bonusPositivos(perfil){
  const bonus=atributosAmuletos({});
  for(const id of new Set(perfil.amuletosEquipados)){
    for(const [chave,valor] of Object.entries(amuletoPorId(id)?.bonus??{})){
      bonus[chave]+=custosRedutiveis.has(chave)?Math.min(0,valor):Math.max(0,valor);
    }
  }
  return bonus;
}

function indicePoder(perfil){
  // O índice usa a mesma referência de cura e vigor em todos os modos.
  const bonus=bonusPositivos(perfil);
  const {classe,atributos,nivel,vidaMax,cura,frascosMax,vigorMax,regeneracaoVigor,recursoMax,regeneracaoRecurso,reducaoDano,custoEsquiva}=
    dadosHeroi({...perfil,opcoes:{modo:'normal'},modificadores:[]},bonus);
  const danoRecebido=(1-reducaoDano)*bonus.danoRecebido*(1-.35*(classe.reducaoLeve??0));
  const vidaEfetiva=(vidaMax+.65*cura*frascosMax)*(1+bonus.janelaAparo)/Math.max(.25,danoRecebido);
  const golpesPorSegundo=golpe=>danoEscalado(golpe,atributos)/(golpe.preparo+golpe.impacto+golpe.recuperacao);
  const danoBasico=.55*bonus.danoLeve*golpesPorSegundo(classe.leve)+.45*bonus.danoPesado*golpesPorSegundo(classe.pesado);
  const danoSituacional=1+.20*(bonus.danoAereo-1)+.40*(bonus.danoRecuperacao-1)+.20*(bonus.danoSemFrasco-1);
  let danoPorSegundo=danoBasico*bonus.dano*danoSituacional;
  for(const id of new Set(perfil.equipadas)){
    const gravura=Object.hasOwn(B.golpe,id)?B.golpe[id]:null;
    if(gravura?.requisitos)danoPorSegundo+=1.3*eficaciaGravura(gravura,atributos)+
      .025*danoEscalado(gravura,atributos)+.85*(nivelGravura(perfil,id)-1);
  }
  const custoMedio=.50*bonus.custoLeve*classe.leve.vigor+.30*bonus.custoPesado*classe.pesado.vigor+
    .15*bonus.custoEsquiva*custoEsquiva*(classe.esquiva??B.esquiva).custo+.05*bonus.custoTecnica*B.golpe.retorno.vigor;
  const frascoDeVigor=perfil.frascoNivel>=2?.25*18*frascosMax:0;
  const vigorUtil=vigorMax+1.5*regeneracaoVigor+.5*bonus.vigorEsquiva+frascoDeVigor;
  const recursos=vigorUtil/Math.max(1,custoMedio)+.07*recursoMax+.3*regeneracaoRecurso;
  const afinidade=chaves.reduce((soma,chave)=>soma+pontosEfetivos(chave,atributos[chave]),0);
  return 43*vidaEfetiva/147+42*danoPorSegundo/45+15*recursos/7.2+.25*afinidade+.10*nivel;
}

function referenciaFase(fase){
  return CURVA_FASES[fase?.id??fase]??CURVA_FASES[1];
}

const PONTOS_DE_PODER_POR_NIVEL=2.4;
const RANK_INIMIGO={chefe:2,mini:1};

function retratoPoder(perfil,fase){
  const referencia=referenciaFase(fase);
  const ciclo=inteiro(perfil.ciclo,1,999);
  const incremento=2*Math.min(5,ciclo-1);
  const indice=indicePoder(perfil);
  const maiorPoder=Math.max(indice,Number.isFinite(perfil.maiorPoder)?perfil.maiorPoder:0);
  const modo=Object.hasOwn(B.dificuldade,perfil.opcoes?.modo)?perfil.opcoes.modo:'normal';
  const esperado=indicePoder({classe:'herdeiro',nivel:referencia.nivelAlvo+incremento});
  return {nivel:dadosHeroi(perfil).nivel,indicePoder:indice,maiorPoder,esperado,
    piso:Math.max(0,referencia.piso+incremento+B.dificuldade[modo].piso),
    teto:referencia.teto+incremento,modo,ciclo};
}

function escalaInimigo(fase,retrato,tipo,guardiao){
  const ficha=typeof tipo==='string'?TIPOS[tipo]:tipo;
  const chefe=ficha===TIPOS.chefe?GUARDIOES[fase?.id??fase]:null;
  const base=guardiao??chefe??ficha;
  const tipoDano=base.tipoDano??'fisico';
  if(!retrato||ficha===TIPOS.boneco)return {nivel:null,vida:base.vida,dano:base.dano,postura:1,ritmo:1,
    resistencias:RESISTENCIAS_NEUTRAS,tipoDano};
  const {nivelBase}=referenciaFase(fase);
  const {esperado,piso,teto,modo}=retrato;
  const dificuldade=B.dificuldade[modo]??B.dificuldade.normal;
  const deslocamento=2*Math.min(5,retrato.ciclo-1)+dificuldade.nivelBase;
  const desvio=(retrato.maiorPoder-esperado)/PONTOS_DE_PODER_POR_NIVEL;
  const nominal=nivelBase+deslocamento+dificuldade.elasticidade*desvio;
  const grau=base===ficha?(ficha===TIPOS.mini?RANK_INIMIGO.mini:0):RANK_INIMIGO.chefe;
  const nivel=limitar(Math.round(nominal),piso,teto-RANK_INIMIGO.chefe)+grau;
  const variacao=nivel-nivelBase-grau;
  const resistencias=Object.fromEntries(Object.keys(TIPOS_DANO).map(chave=>[chave,
    limitar(base.resistencias?.[chave]??0,-.25,.32)]));
  return {
    nivel,tipoDano,resistencias,
    vida:Math.max(1,Math.round(base.vida*1.016**variacao)),dano:base.dano*1.012**variacao,
    postura:1.048**variacao,ritmo:limitar(.983**variacao,.80,1.15)
  };
}

function fatorRecompensa(nivelInimigo,nivelHeroi){
  const diferenca=nivelInimigo-nivelHeroi;
  return limitar(1.045**diferenca,.42,1.38);
}

export { atributosParaNivel, custoAcumulado, custoNivel, dadosHeroi, danoEscalado, eficaciaGravura,
  escalaInimigo, fatorRecompensa, indicePoder, multiplicadorResistencia, nivelDosAtributos, pontosEfetivos,
  retratoPoder };
