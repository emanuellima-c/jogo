import { validarPerfil as lerAntigo, lerRecorde } from '../core/save.js';
import { FASES } from './fases.js';
import { TECNICAS } from './ajustes.js';

const CHAVE = 'aventura-selva-santuarios-v5';
const ANTIGAS = ['aventura-selva-jornada-v3','aventura-selva-campanha-v2'];
const idsEstrelas = ['s1','s2','s3'];
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
    modo:['relaxado','desafio'].includes(v.modo)?v.modo:'normal'};
}
function novoPerfil(){
  return {versao:5,revisao:0,iniciada:false,fase:1,liberada:1,concluidas:[],estrelas:mapas(),
    coletas:mapas(),atalhos:mapas(),chefes:mapas(),selados:mapas(),ecos:0,xp:0,nivel:1,
    compradas:[],equipadas:[null,null],mancha:null,santuario:{fase:1,id:'inicio'},
    mortes:0,ciclo:1,opcoes:opcoes(),legado:null,sessao:null};
}
function migrar(d){
  const a=lerAntigo(d),p=novoPerfil();
  p.legado={origem:d.versao,perfil:a};
  p.concluidas=a.concluidas.flatMap((sim,i)=>sim?[i+1]:[]);
  p.liberada=Math.min(15,Math.max(1,...p.concluidas.map(n=>n+1)));
  p.iniciada=a.iniciada||p.concluidas.length>0;
  p.fase=Math.min(p.liberada,a.descanso?.proxima??a.fase);
  p.ecos=a.moedas;p.xp=a.xp;p.nivel=a.nivel;p.ciclo=a.ciclo;p.mortes=a.totais.mortes;p.opcoes=opcoes(a.opcoes);
  p.santuario={fase:p.fase,id:FASES[p.fase-1].santuarios[0].id};
  for(const f of FASES) {
    p.estrelas[f.id]=idsEstrelas.slice(0,a.estrelas[f.id-1]);
    if(p.concluidas.includes(f.id)){
      p.chefes[f.id]=f.inimigos.filter(e=>e.tipo==='chefe'||e.tipo==='elite').map(e=>e.id);
      p.coletas[f.id].push(...p.chefes[f.id].map(id=>'v:'+id));
    }
  }
  const conversoes=[
    ['retorno',a.aprendidas.dash||a.poderes.sombra],['eco',a.aprendidas.duplo||a.aprendidas.planar],
    ['aparo',a.poderes.escudo],['quebra',a.poderes.forca],['estocada',a.poderes.onda],['pisada',a.poderes.tempestade]
  ];
  p.compradas=conversoes.filter(([,tem])=>tem).map(([id])=>id);
  p.equipadas=[p.compradas[0]??null,p.compradas[1]??null];
  return p;
}
function validar(d){
  if(d?.versao===2||d?.versao===3)return migrar(d);
  if(d?.versao!==5)throw new Error('Escolha um arquivo de progresso de Aventura na Selva.');
  const p=novoPerfil(),tecnicas=TECNICAS.map(t=>t.id);
  for(const nome of ['ecos','xp','mortes','revisao'])p[nome]=inteiro(d[nome],0,999999999);
  p.nivel=inteiro(d.nivel,1,99);p.ciclo=inteiro(d.ciclo,1,999);p.iniciada=d.iniciada===true;
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

export { CHAVE, novoPerfil, validar, carregarPerfil, salvarPerfil };
