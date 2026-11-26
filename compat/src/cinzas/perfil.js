// Gerado a partir de src/cinzas/perfil.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/perfil.js", function (exports, usar) {
"use strict";
const { validarPerfil: lerAntigo, lerRecorde } = usar("src/core/save.js");
const { FASES } = usar("src/cinzas/fases.js");
const { ATRIBUTOS, CLASSES, MAXIMO_ATRIBUTO, MINIMO_ATRIBUTO, NIVEL_MAXIMO, TECNICAS } = usar("src/cinzas/ajustes.js");
const { amuletoPorId, bonusEstrela, obterAmuleto, slotsAmuletos } = usar("src/cinzas/progresso.js");
const { CONQUISTAS, MODIFICADORES, validarRecordes } = usar("src/cinzas/modos.js");
const { validarOpcoesEntrada } = usar("src/cinzas/entrada.js");
const { atributosParaNivel, nivelDosAtributos } = usar("src/cinzas/poder.js");
const CHAVE = 'aventura-selva-santuarios-v7';
const CHAVE_V6 = 'aventura-selva-santuarios-v6';
const CHAVE_V5 = 'aventura-selva-santuarios-v5';
const ANTIGAS = [CHAVE_V6,CHAVE_V5,'aventura-selva-jornada-v3','aventura-selva-campanha-v2'];
const idsEstrelas = ['s1','s2','s3'];
const idsConquistas = new Set(CONQUISTAS.map(({id})=>id));
const idsModificadores = new Set(MODIFICADORES.map(({id})=>id));
const mapas = () => Object.fromEntries(Array.from({length:15},(_,i)=>[i+1,[]]));
const numero = (v,min,max,padrao=min) => Number.isFinite(v) ? Math.min(max,Math.max(min,v)) : padrao;
const inteiro = (v,min,max,padrao=min) => Math.floor(numero(v,min,max,padrao));
function lista(v, filtro, limite=100) {
  return Array.isArray(v) ? [...new Set(v.slice(0,limite).filter(filtro))] : [];
}
function chave(v){ return typeof v==='string' && /^[a-z0-9_:-]{1,64}$/i.test(v); }
function ponto(v) {
  if(!v || !Number.isFinite(v.x) || !Number.isFinite(v.y))return null;
  return {x:numero(v.x,0,100000),y:numero(v.y,-1000,1000)};
}
function opcoes(v={}) {
  return {som:v.som!==false,volume:numero(v.volume,0,1,.55),movimento:v.movimento!==false,
    modo:['relaxado','desafio'].includes(v.modo)?v.modo:'normal',
    tremor:numero(v.tremor,0,1,.65),flash:numero(v.flash,0,1,.65),
    ...validarOpcoesEntrada(v)};
}
function novoPerfil(){
  return {versao:7,revisao:0,iniciada:false,fase:1,liberada:1,classe:null,concluidas:[],estrelas:mapas(),
    coletas:mapas(),atalhos:mapas(),chefes:mapas(),selados:mapas(),ecos:0,xp:0,nivel:1,
    atributos:null,refazerGratuito:false,cinzasRefazer:0,cicloDaCinza:0,maiorPoder:0,
    compradas:[],equipadas:[null,null],mancha:null,santuario:{fase:1,id:'inicio'},
    amuletos:[],amuletosEquipados:[null,null,null],gravuras:{},frascoNivel:1,
    mortes:0,ciclo:1,cicloAte:1,cicloConcluido:false,modificadores:[],conquistas:[],recordes:validarRecordes(),
    opcoes:opcoes(),legado:null,sessao:null};
}
function escolherClasse(perfil,id,novoCiclo=false){
  if(typeof id!=='string'||!Object.hasOwn(CLASSES,id))return false;
  if(novoCiclo){
    if(perfil.ciclo<=1||perfil.cicloAte!==1||perfil.fase!==1||perfil.sessao)return false;
  }else if(perfil.iniciada||perfil.classe||id==='herdeiro')return false;
  perfil.classe=id;
  if(novoCiclo)perfil.maiorPoder=0;
  else{
    perfil.atributos={...CLASSES[id].atributosIniciais};
    perfil.nivel=nivelDosAtributos(perfil.atributos);
  }
  return true;
}
function validarDistribuicao(origem){
  if(!origem||typeof origem!=='object')return null;
  const atributos={};
  for(const nome of Object.keys(ATRIBUTOS)){
    const numero=origem[nome];
    if(!Number.isInteger(numero)||numero<MINIMO_ATRIBUTO||numero>MAXIMO_ATRIBUTO)return null;
    atributos[nome]=numero;
  }
  return nivelDosAtributos(atributos)<=NIVEL_MAXIMO?atributos:null;
}
function normalizarAtributos(perfil,origem,conversao=false){
  const anteriores=origem?.versao<7||!Object.hasOwn(origem??{},'atributos');
  const precisaConversao=conversao||anteriores||!origem?.atributos&&Boolean(perfil.classe||perfil.iniciada);
  const atributos=validarDistribuicao(origem?.atributos);
  if(atributos)perfil.atributos=atributos;
  else if(perfil.classe||perfil.iniciada)perfil.atributos=atributosParaNivel(perfil.classe??'herdeiro',perfil.nivel);
  if(perfil.atributos)perfil.nivel=nivelDosAtributos(perfil.atributos);
  perfil.refazerGratuito=origem?.refazerGratuito===true||precisaConversao&&Boolean(perfil.atributos);
  perfil.cinzasRefazer=inteiro(origem?.cinzasRefazer,0,1);
  perfil.cicloDaCinza=inteiro(origem?.cicloDaCinza,0,perfil.ciclo);
  perfil.maiorPoder=numero(origem?.maiorPoder,0,1000000);
}
function validarRetrato(retrato,ciclo){
  if(!retrato||retrato.ciclo!==ciclo||!['relaxado','normal','desafio'].includes(retrato.modo))return null;
  const chaves=['nivel','indicePoder','maiorPoder','esperado','piso','teto'];
  if(chaves.some(chave=>!Number.isFinite(retrato[chave])||retrato[chave]<0||retrato[chave]>1000000)||retrato.piso>retrato.teto)return null;
  return {...Object.fromEntries(chaves.map(chave=>[chave,retrato[chave]])),modo:retrato.modo,ciclo};
}
function concederAmuletosEncontrados(perfil){
  for(const fase of FASES){
    for(const estrela of perfil.estrelas[fase.id])obterAmuleto(perfil,bonusEstrela(fase.id,estrela));
    for(const inimigo of fase.inimigos){
      if(inimigo.reliquia && (perfil.chefes[fase.id].includes(inimigo.id)||perfil.coletas[fase.id].includes('v:'+inimigo.id)))
        obterAmuleto(perfil,inimigo.reliquia);
    }
  }
}
function migrar(d){
  const a=lerAntigo(d),p=novoPerfil();
  p.classe='herdeiro';
  p.legado={origem:d.versao,perfil:a};
  p.concluidas=a.concluidas.flatMap((sim,i)=>sim?[i+1]:[]);
  p.liberada=Math.min(15,Math.max(1,...p.concluidas.map(n=>n+1)));
  p.iniciada=a.iniciada||p.concluidas.length>0;
  p.fase=Math.min(p.liberada,a.descanso?.proxima??a.fase);
  p.ecos=a.moedas;p.xp=a.xp;p.nivel=a.nivel;p.ciclo=a.ciclo;p.mortes=a.totais.mortes;p.opcoes=opcoes(a.opcoes);
  if(p.ciclo>1){
    p.cicloAte=p.liberada;
    p.cicloConcluido=p.concluidas.includes(15);
  }
  p.santuario={fase:p.fase,id:FASES[p.fase-1].santuarios[0].id};
  for(const f of FASES) {
    p.estrelas[f.id]=idsEstrelas.slice(0,a.estrelas[f.id-1]);
    if(p.concluidas.includes(f.id)){
      p.chefes[f.id]=f.inimigos.filter(e=>!e.reliquia&&(e.tipo==='chefe'||e.tipo==='elite')).map(e=>e.id);
      p.coletas[f.id].push(...p.chefes[f.id].map(id=>'v:'+id));
    }
  }
  const conversoes=[
    ['retorno',a.aprendidas.dash||a.poderes.sombra],['eco',a.aprendidas.duplo||a.aprendidas.planar],
    ['aparo',a.poderes.escudo],['quebra',a.poderes.forca],['estocada',a.poderes.onda],['pisada',a.poderes.tempestade]
  ];
  p.compradas=conversoes.filter(([,tem])=>tem).map(([id])=>id);
  p.equipadas=[p.compradas[0]??null,p.compradas[1]??null];
  concederAmuletosEncontrados(p);
  normalizarAtributos(p,d,true);
  return p;
}
function validar(d){
  if(d?.versao===2||d?.versao===3)return migrar(d);
  if(![5,6,7].includes(d?.versao))throw new Error('Escolha um arquivo de progresso de Aventura na Selva.');
  const p=novoPerfil(),tecnicas=TECNICAS.map(t=>t.id);
  for(const nome of ['ecos','xp','mortes','revisao'])p[nome]=inteiro(d[nome],0,999999999);
  p.ciclo=inteiro(d.ciclo,1,999);p.iniciada=d.iniciada===true;
  const classeValida=typeof d.classe==='string'&&Object.hasOwn(CLASSES,d.classe);
  if(d.versao<7)p.classe='herdeiro';
  else if(classeValida)p.classe=d.classe;
  else if(p.iniciada)p.classe='herdeiro';
  p.nivel=inteiro(d.nivel,d.versao===7?0:1,NIVEL_MAXIMO,CLASSES[p.classe]?.nivelInicial??1);
  normalizarAtributos(p,d);
  p.concluidas=lista(d.concluidas,n=>Number.isInteger(n)&&n>=1&&n<=15,15).sort((a,b)=>a-b);
  p.liberada=inteiro(d.liberada,1,15,Math.min(15,Math.max(1,...p.concluidas.map(n=>n+1))));
  p.fase=inteiro(d.fase,1,p.liberada);
  for(let i=1;i<=15;i++){
    p.estrelas[i]=lista(d.estrelas?.[i],id=>idsEstrelas.includes(id),8);
    for(const grupo of ['coletas','atalhos','chefes','selados'])p[grupo][i]=lista(d[grupo]?.[i],chave);
  }
  p.compradas=lista(d.compradas,id=>tecnicas.includes(id));
  const escolhidas=Array.isArray(d.equipadas)?d.equipadas:[];
  p.equipadas=[0,1].map(i=>p.compradas.includes(escolhidas[i]) && !(i===1&&escolhidas[i]===escolhidas[0])?escolhidas[i]:null);
  p.opcoes=opcoes(d.opcoes||{});
  if(d.legado?.perfil && [2,3].includes(d.legado.origem)) p.legado={origem:d.legado.origem,perfil:lerAntigo(d.legado.perfil)};
  if(d.legado?.recorde && !p.legado)p.legado={recorde:inteiro(d.legado.recorde,0,999999999)};
  const sd=d.santuario;
  if(sd && Number.isInteger(sd.fase) && FASES[sd.fase-1]?.santuarios.some(s=>s.id===sd.id))
    p.santuario={fase:sd.fase,id:sd.id};
  else p.santuario={fase:p.fase,id:FASES[p.fase-1].santuarios[0].id};
  const marca=ponto(d.mancha);
  if(marca && Number.isInteger(d.mancha.fase) && FASES[d.mancha.fase-1] && d.mancha.valor>0)
    p.mancha={...marca,fase:d.mancha.fase,valor:inteiro(d.mancha.valor,1,999999999)};
  if(d.sessao?.fase===p.fase) p.sessao={fase:p.fase,vida:numero(d.sessao.vida,0,10000),frascos:inteiro(d.sessao.frascos,0,12),
    morto:d.sessao.morto===true,derrotados:lista(d.sessao.derrotados,chave),seguro:ponto(d.sessao.seguro)};
  if(p.sessao){
    const retrato=validarRetrato(d.sessao.retrato,p.ciclo);
    if(retrato)p.sessao.retrato=retrato;
  }
  if(d.versao>=6){
    p.amuletos=lista(d.amuletos,id=>amuletoPorId(id)!==undefined);
    for(const id of p.compradas){
      const nivel=inteiro(d.gravuras?.[id],1,3);
      if(nivel>1)p.gravuras[id]=nivel;
    }
    p.frascoNivel=inteiro(d.frascoNivel,1,3);
    p.modificadores=lista(d.modificadores,id=>idsModificadores.has(id));
    p.conquistas=lista(d.conquistas,id=>idsConquistas.has(id));
    p.recordes=validarRecordes(d.recordes);
  }
  p.cicloAte=inteiro(d.versao>=6?d.cicloAte:null,1,15,p.ciclo>1?p.liberada:1);
  p.cicloConcluido=d.versao>=6 ? d.cicloConcluido===true : p.ciclo>1&&p.concluidas.includes(15);
  concederAmuletosEncontrados(p);
  if(d.versao>=6&&Array.isArray(d.amuletosEquipados)){
    for(let slot=0;slot<slotsAmuletos(p);slot++){
      const id=d.amuletosEquipados[slot];
      if(p.amuletos.includes(id)&&!p.amuletosEquipados.includes(id))p.amuletosEquipados[slot]=id;
    }
  }
  return p;
}
function carregarPerfil(armazenamento){
  for(const k of [CHAVE,...ANTIGAS]){
    try{const bruto=armazenamento?.getItem(k);if(bruto)return validar(JSON.parse(bruto));}catch{}
  }
  const p=novoPerfil(),recorde=lerRecorde(armazenamento);
  if(recorde)p.legado={recorde};return p;
}
function salvarPerfil(armazenamento,p){
  if(!armazenamento)return false;
  try{
    const anterior=armazenamento.getItem(CHAVE);
    let revisao=0;
    if(anterior){try{revisao=JSON.parse(anterior)?.revisao||0;}catch{}}
    if(revisao>p.revisao)return false;
    const proxima=p.revisao+1;
    armazenamento.setItem(CHAVE,JSON.stringify({...p,revisao:proxima}));p.revisao=proxima;
    return true;
  }catch{return false;}
}

Object.defineProperty(exports, "CHAVE", { enumerable: true, get: () => CHAVE });
Object.defineProperty(exports, "CHAVE_V6", { enumerable: true, get: () => CHAVE_V6 });
Object.defineProperty(exports, "CHAVE_V5", { enumerable: true, get: () => CHAVE_V5 });
Object.defineProperty(exports, "novoPerfil", { enumerable: true, get: () => novoPerfil });
Object.defineProperty(exports, "escolherClasse", { enumerable: true, get: () => escolherClasse });
Object.defineProperty(exports, "validar", { enumerable: true, get: () => validar });
Object.defineProperty(exports, "carregarPerfil", { enumerable: true, get: () => carregarPerfil });
Object.defineProperty(exports, "salvarPerfil", { enumerable: true, get: () => salvarPerfil });
});
