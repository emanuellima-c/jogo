// Mede combate e travessia nas fases reais, com o mesmo orçamento de atributos em cada comparação.
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { carregarMotor, medirDuelos, medirFases, PERFIS_PILOTO } from './testar-dificuldade-cinzas.mjs';

const GRUPOS=['guardioes','comuns','builds','poder'];
const CENARIOS={abaixo:-6,alvo:0,acima:10};
const BUILDS=['equilibrada','especializada','concentrada','mal-construida'];
const ARENAS_BUILD={cavaleiro:15,guerreiro:15,ladino:15,piromante:12,feiticeiro:15,clerigo:12,despojado:7,herdeiro:10};
const META_GUARDIAO={veterano:[60,80],mediano:[30,50],novato:[10,25]};
const META_SEM_MORTES=[40,60];
const META_MORTES_F14=[1,2];

const AJUDA=`node ferramentas/testar-curva-poder-cinzas.mjs [opções]

  --grupo=guardioes,comuns,builds,poder   Grupos a medir (padrão: todos)
  --fase=1,4,7                          Fases a incluir
  --cenario=abaixo,alvo,acima            Cenários de nível para guardiões e fases comuns
  --piloto=veterano,mediano,novato       Pilotos de guardiões e fases comuns
  --classe=cavaleiro,ladino              Classes a medir no grupo builds
  --tentativas=200                       Tentativas por célula
  --semente=50601                        Semente inteira
  --modo=normal                          Relaxado, normal ou desafio
  --fonte=src                            Árvore de fontes do motor
  --json                                 Imprime o resultado como JSON

A matriz usa o Herdeiro equilibrado. O veterano leva Aparo I nos duelos.
O mediano usa o kit próprio de cada classe nos cenários de builds.

node ferramentas/testar-curva-poder-cinzas.mjs --grupo=guardioes --fase=4,7 --json
`;

function lerLista(valor,permitidos,opcao,converter=String){
  if(valor===undefined)return permitidos;
  const itens=[...new Set(valor.split(',').map(converter))];
  assert(itens.every(item=>permitidos.includes(item)),`Use --${opcao} com ${permitidos.join(', ')}.`);
  return itens;
}

function fichaNoNivel(poder,classe,nivelSolicitado,build){
  const atributos=poder.atributosParaNivel(classe,nivelSolicitado,build);
  return {classe,build,nivelSolicitado,atributos,nivel:poder.nivelDosAtributos(atributos)};
}

function aplicarFicha(perfil,ficha){
  perfil.classe=ficha.classe;
  perfil.atributos={...ficha.atributos};
  perfil.nivel=ficha.nivel;
}

function faseDeGuardiao(fase){
  return fase.inimigos.some(inimigo=>inimigo.tipo==='chefe');
}

function dentro(valor,[minimo,maximo]){
  return valor>=minimo&&valor<=maximo;
}

function medirCenarios(motor,poder,{modo,semente,tentativas,pilotos,cenarios},fases,grupo){
  const guardioes=grupo==='guardioes';
  const medir=guardioes?medirDuelos:medirFases;
  const ids=fases.filter(fase=>faseDeGuardiao(fase)===guardioes).map(fase=>fase.id);
  return cenarios.flatMap(cenario=>{
    const fichas=new Map(ids.map(id=>{
      const nivel=Math.max(0,motor.CURVA_FASES[id].nivelAlvo+CENARIOS[cenario]);
      return [id,fichaNoNivel(poder,'herdeiro',nivel,'equilibrada')];
    }));
    const {resultados,limite,maxMortes}=medir(motor,{
      modo,semente,tentativas,pilotos,fases:ids,tecnica:'padrao',
      configurarPerfil:(perfil,fase)=>aplicarFicha(perfil,fichas.get(fase.id))
    });
    return resultados.map(linha=>{
      const ficha=fichas.get(linha.fase);
      const {nivelAlvo}=motor.CURVA_FASES[linha.fase];
      const resultado={...linha,cenario,nivelAlvo,nivelSolicitado:ficha.nivelSolicitado,limiteTempo:limite,maxMortes};
      if(cenario==='alvo'&&modo==='normal'){
        if(guardioes)resultado.naFaixaVitoria=dentro(linha.taxaVitoria,META_GUARDIAO[linha.piloto]);
        if(!guardioes&&linha.piloto==='mediano')resultado.naFaixaSemMortes=dentro(linha.taxaSemMortes,META_SEM_MORTES);
        if(linha.fase===14&&linha.piloto==='mediano')resultado.naFaixaMortesF14=dentro(linha.mortes,META_MORTES_F14);
      }
      if(cenario==='acima'&&guardioes&&linha.piloto==='veterano')resultado.veteranoRecebeuDano=linha.danoMedio>0;
      return resultado;
    });
  });
}

function variacaoPercentual(antes,depois){
  return 100*(depois/antes-1);
}

function medirBuilds(motor,poder,{modo,semente,tentativas,classes},fases){
  const resultados=[];
  const comparacoes=[];
  for(const classe of classes){
    const id=ARENAS_BUILD[classe];
    if(!fases.some(fase=>fase.id===id))continue;
    const fichaClasse=motor.CLASSES[classe];
    const {nivelAlvo}=motor.CURVA_FASES[id];
    const linhas=BUILDS.map(build=>{
      const ficha=fichaNoNivel(poder,classe,nivelAlvo,build);
      const {resultados:[duelo],limite}=medirDuelos(motor,{
        modo,semente,tentativas,fases:[id],pilotos:['mediano'],tecnica:'sem',lerKitClasse:true,
        configurarPerfil:perfil=>aplicarFicha(perfil,ficha)
      });
      const danoPesado=poder.danoEscalado(fichaClasse.pesado,ficha.atributos);
      return {...ficha,...duelo,nivelAlvo,danoPesado,limiteTempo:limite};
    });
    assert(linhas.every(linha=>linha.nivel===linhas[0].nivel),`Orçamento diferente entre builds de ${classe}.`);
    resultados.push(...linhas);
    const especializada=linhas.find(linha=>linha.build==='especializada');
    const ruim=linhas.find(linha=>linha.build==='mal-construida');
    comparacoes.push({
      fase:id,classe,nivel:especializada.nivel,
      ganhoDanoPesado:variacaoPercentual(ruim.danoPesado,especializada.danoPesado),
      ganhoVitoriaPp:especializada.taxaVitoria-ruim.taxaVitoria,
      ganhoTempoMedio:ruim.tempoMedio-especializada.tempoMedio,
      ganhoTempoVitoria:especializada.tempoVitoria===null||ruim.tempoVitoria===null?null:ruim.tempoVitoria-especializada.tempoVitoria
    });
  }
  return {resultados,comparacoes};
}

function retratoEmJogo(motor,poder,fase,modo,nivel){
  const ficha=fichaNoNivel(poder,'herdeiro',nivel,'equilibrada');
  const perfil=motor.novoPerfil();
  perfil.opcoes.modo=modo;
  aplicarFicha(perfil,ficha);
  const jogo=new motor.Jogo(perfil);
  jogo.carregar(fase.id);
  const {heroi,inimigos}=jogo;
  const danoPesado=poder.danoEscalado(heroi.classe.pesado,heroi.atributosBase);
  const vidaEfetiva=heroi.vidaMax/(1-heroi.reducaoDano);
  const poderHeroi=vidaEfetiva*danoPesado;
  const ameacas=inimigos.map(inimigo=>({id:inimigo.id,tipo:inimigo.tipo,nivel:inimigo.nivel,vida:inimigo.vidaMax,dano:inimigo.dano}));
  const poderNpc=ameacas.reduce((soma,inimigo)=>soma+inimigo.vida*inimigo.dano,0)/ameacas.length;
  assert(Number.isFinite(poderHeroi)&&poderHeroi>0&&Number.isFinite(poderNpc)&&poderNpc>0,`Poder inválido em F${fase.id}.`);
  return {
    nivel:jogo.retrato.nivel,vida:heroi.vidaMax,vidaEfetiva,vigor:heroi.vigorMax,danoPesado,
    indicePoder:jogo.retrato.indicePoder,poderHeroi,poderNpc,vantagem:poderHeroi/poderNpc,ameacas
  };
}

function ganhoNoMapa(antes,depois){
  return {
    heroi:variacaoPercentual(antes.poderHeroi,depois.poderHeroi),
    npc:variacaoPercentual(antes.poderNpc,depois.poderNpc),
    liquido:variacaoPercentual(antes.vantagem,depois.vantagem)
  };
}

function medirPoder(motor,poder,modo,fases){
  const resultados=fases.map(fase=>{
    const {nivelAlvo}=motor.CURVA_FASES[fase.id];
    const [abaixo,alvo,acima]=Object.values(CENARIOS).map(delta=>retratoEmJogo(motor,poder,fase,modo,Math.max(0,nivelAlvo+delta)));
    return {fase:fase.id,nome:fase.nome,nivelAlvo,abaixo,alvo,acima,
      ganhoAteAlvo:ganhoNoMapa(abaixo,alvo),ganhoAcimaDoAlvo:ganhoNoMapa(alvo,acima)};
  });
  return {todasComGanhoLiquido:resultados.every(linha=>linha.ganhoAteAlvo.liquido>0&&linha.ganhoAcimaDoAlvo.liquido>0),resultados};
}

function imprimir(resumo){
  const {modo,semente,tentativas,resultados}=resumo;
  const pc=valor=>valor.toFixed(1)+'%';
  const num=valor=>valor?.toFixed(1)??'—';
  console.log(`Curva de poder · ${modo} · semente ${semente} · ${tentativas} tentativas por célula`);
  if(resultados.guardioes){
    console.log('Guardiões · Herdeiro equilibrado · Aparo I com o veterano');
    console.table(resultados.guardioes.map(linha=>({
      fase:linha.fase,cenário:linha.cenario,piloto:linha.piloto,nível:linha.nivel,alvo:linha.nivelAlvo,
      vitórias:pc(linha.taxaVitoria),dano:num(linha.danoMedio),'vitórias sem dano':linha.vitoriasSemDano,
      'mortes por duelo':linha.mortes.toFixed(2),'tempo (s)':num(linha.tempoMedio),limite:linha.esgotadas
    })));
  }
  if(resultados.comuns){
    console.log('Fases comuns · Herdeiro equilibrado com kit básico');
    console.table(resultados.comuns.map(linha=>({
      fase:linha.fase,cenário:linha.cenario,piloto:linha.piloto,nível:linha.nivel,alvo:linha.nivelAlvo,
      conclusões:pc(linha.taxaConclusao),'sem mortes':pc(linha.taxaSemMortes),'mortes por jornada':linha.mortes.toFixed(2),
      dano:num(linha.danoMedio),'tempo (s)':num(linha.tempoMedio),'falhas de navegação':linha.interrupcoes.navegacao?.quantidade??0
    })));
  }
  if(resultados.builds){
    console.log('Builds · mediano com o kit de cada classe');
    console.table(resultados.builds.resultados.map(linha=>({
      fase:linha.fase,classe:linha.classe,build:linha.build,nível:linha.nivel,vitórias:pc(linha.taxaVitoria),
      'pesado base':num(linha.danoPesado),'dano recebido':num(linha.danoMedio),'tempo (s)':num(linha.tempoMedio)
    })));
    console.log('Vantagem da especializada sobre a mal construída');
    console.table(resultados.builds.comparacoes.map(linha=>({
      fase:linha.fase,classe:linha.classe,'pesado base':pc(linha.ganhoDanoPesado),
      'vitória (pp)':num(linha.ganhoVitoriaPp),'tempo poupado (s)':num(linha.ganhoTempoMedio)
    })));
  }
  if(resultados.poder){
    console.log('Poder por mapa · vida efetiva × dano pesado base do Herdeiro e média de vida × dano base dos NPCs');
    console.table(resultados.poder.resultados.map(linha=>({
      fase:linha.fase,níveis:[linha.abaixo.nivel,linha.alvo.nivel,linha.acima.nivel].join(' → '),
      'herói no alvo':num(linha.alvo.poderHeroi),'NPC no alvo':num(linha.alvo.poderNpc),
      'líquido até alvo':pc(linha.ganhoAteAlvo.liquido),'herói com +10':pc(linha.ganhoAcimaDoAlvo.heroi),
      'NPC com +10':pc(linha.ganhoAcimaDoAlvo.npc),'líquido com +10':pc(linha.ganhoAcimaDoAlvo.liquido)
    })));
  }
}

async function executar(){
  const tipos=['grupo','fase','cenario','piloto','classe','tentativas','semente','modo','fonte'];
  const options=Object.fromEntries(tipos.map(nome=>[nome,{type:'string'}]));
  const {values}=parseArgs({options:{...options,json:{type:'boolean'},ajuda:{type:'boolean'},help:{type:'boolean'}}});
  if(values.ajuda||values.help){console.log(AJUDA);return;}

  const motor=await carregarMotor(values.fonte);
  const poder=await motor.modulo('poder');
  const modo=values.modo??'normal';
  const semente=Number(values.semente??50601);
  const tentativas=Number(values.tentativas??200);
  const grupos=lerLista(values.grupo,GRUPOS,'grupo');
  const ids=lerLista(values.fase,motor.FASES.map(fase=>fase.id),'fase',Number);
  const fases=motor.FASES.filter(fase=>ids.includes(fase.id));
  const cenarios=lerLista(values.cenario,Object.keys(CENARIOS),'cenario');
  const pilotos=lerLista(values.piloto,Object.keys(PERFIS_PILOTO),'piloto');
  const classes=lerLista(values.classe,Object.keys(ARENAS_BUILD),'classe');
  assert(Number.isInteger(tentativas)&&tentativas>=1&&tentativas<=1000,'Use de 1 a 1000 tentativas.');
  assert(Number.isSafeInteger(semente),'Use uma semente inteira.');
  assert(Object.hasOwn(motor.BALANCO.dificuldade,modo),'Use relaxado, normal ou desafio.');
  assert(fases.every(fase=>Number.isInteger(motor.CURVA_FASES?.[fase.id]?.nivelAlvo)),'Faltam níveis-alvo na curva.');

  const opcoes={semente,tentativas,modo,pilotos,cenarios,classes};
  const resultados={};
  for(const grupo of grupos){
    if(grupo==='poder')resultados.poder=medirPoder(motor,poder,modo,fases);
    else if(grupo==='builds')resultados.builds=medirBuilds(motor,poder,opcoes,fases);
    else resultados[grupo]=medirCenarios(motor,poder,opcoes,fases,grupo);
  }
  const resumo={...opcoes,fases:ids,grupos,
    matriz:{classe:'herdeiro',build:'equilibrada',gravuraVeterano:'aparo I',deslocamentos:CENARIOS},
    metas:{vitoriaGuardioes:META_GUARDIAO,semMortesMediano:META_SEM_MORTES,mortesMedianoF14:META_MORTES_F14},
    resultados};
  if(values.json)console.log(JSON.stringify(resumo,null,2));
  else imprimir(resumo);
}

await executar();
