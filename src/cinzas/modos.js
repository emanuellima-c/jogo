const MODIFICADORES = [
  {id:'sem-frascos', nome:'Sem frascos', efeito:'Comece sem doses de cura.'},
  {id:'vigor-curto', nome:'Vigor curto', efeito:'O vigor máximo recebe um corte de 25%.'}
];
const CONQUISTAS = [
  {id:'primeira-estrela', nome:'Uma luz entre as folhas', descricao:'Colete uma estrela.'},
  {id:'quinze-estrelas', nome:'Mapa de luz', descricao:'Colete 15 estrelas.'},
  {id:'quarenta-e-cinco', nome:'Aurora inteira', descricao:'Colete as 45 estrelas.'},
  {id:'primeiro-atalho', nome:'Rota de volta', descricao:'Abra um atalho.'},
  {id:'todos-atalhos', nome:'À sombra dos atalhos', descricao:'Abra os 16 atalhos.'},
  {id:'retomada', nome:'Cinza recuperada', descricao:'Recupere uma marca de ecos.'},
  {id:'fogo-amigo', nome:'Abrigo sob as folhas', descricao:'Descanse em um santuário.'},
  {id:'primeira-gravura', nome:'Marca de Bento', descricao:'Compre sua primeira gravura.'},
  {id:'seis-gravuras', nome:'Mão de gravador', descricao:'Adquira as seis gravuras.'},
  {id:'gravura-mestra', nome:'Selo de mestre', descricao:'Eleve uma gravura ao nível 3.'},
  {id:'primeiro-amuleto', nome:'Talismã de viagem', descricao:'Obtenha um amuleto.'},
  {id:'colecao', nome:'Coleção da Aurora', descricao:'Obtenha 15 amuletos.'},
  {id:'frasco-mestre', nome:'Alquimia de campo', descricao:'Melhore o frasco até o nível 3.'},
  {id:'esquiva-precisa', nome:'Por um fio', descricao:'Esquive no instante do impacto.'},
  {id:'primeiro-guardiao', nome:'A vigília que cedeu', descricao:'Derrote o primeiro guardião.'},
  {id:'fim-da-jornada', nome:'Depois do eclipse', descricao:'Conclua as 15 fases.'},
  {id:'novo-ciclo', nome:'Outra aurora', descricao:'Inicie um novo ciclo.'},
  {id:'diario', nome:'Trilha de hoje', descricao:'Conclua um desafio do dia.'},
  {id:'crono', nome:'Passos contados', descricao:'Registre um tempo no contrarrelógio.'}
];

const FASES_DIARIAS = [1,2,3,5,6,8,9,11,13,14];
const LIMITE_TEMPO = 60 * 60 * 1000;
const LIMITE_FANTASMA = 720;
const formatoData = /^\d{4}-\d{2}-\d{2}$/;

function desafioDoDia(data = new Date()){
  const chave = data.toISOString().slice(0,10);
  let seed = 2166136261;
  for(const digito of chave)seed = Math.imul(seed ^ digito.charCodeAt(0),16777619) >>> 0;
  return {
    tipo:'diario', chave, seed, fase:FASES_DIARIAS[seed % FASES_DIARIAS.length],
    modificador:MODIFICADORES[(seed >>> 12) % MODIFICADORES.length].id
  };
}

function tempoValido(valor){
  return Number.isInteger(valor) && valor>0 && valor<=LIMITE_TEMPO;
}

function validarTrilha(trilha,tempo){
  const pontos=[];
  let ultimo=-1;
  for(const ponto of (Array.isArray(trilha)?trilha.slice(0,LIMITE_FANTASMA):[])){
    if(!Array.isArray(ponto)||ponto.length!==3)continue;
    const [ms,x,y]=ponto;
    if(!Number.isInteger(ms)||ms<=ultimo||ms>tempo||!Number.isInteger(x)||x<0||x>100000||
      !Number.isInteger(y)||y< -1000||y>1000)continue;
    pontos.push([ms,x,y]);ultimo=ms;
  }
  return pontos;
}

function validarRecordes(valor){
  const cronos={};
  for(let fase=1;fase<=15;fase++){
    const marca=valor?.cronos?.[fase];
    if(tempoValido(marca?.ms))cronos[fase]={ms:marca.ms,trilha:validarTrilha(marca.trilha,marca.ms)};
  }
  const diarios={};
  const chaves=Object.keys(valor?.diarios||{}).filter(chave=>formatoData.test(chave)).sort().slice(-14);
  for(const chave of chaves){
    const tempos=valor.diarios[chave];
    if(Array.isArray(tempos))diarios[chave]=[...new Set(tempos.slice(0,30).filter(tempoValido))].sort((a,b)=>a-b).slice(0,5);
  }
  return {cronos,diarios};
}

function registrarProva(perfil,prova,ms,trilha=[]){
  if(!tempoValido(ms)||!Number.isInteger(prova.fase)||prova.fase<1||prova.fase>15)return false;
  const {cronos,diarios}=perfil.recordes;
  if(prova.tipo==='crono'){
    const anterior=cronos[prova.fase];
    if(anterior&&anterior.ms<=ms)return false;
    cronos[prova.fase]={ms,trilha:validarTrilha(trilha,ms)};
    return true;
  }
  if(prova.tipo!=='diario'||!formatoData.test(prova.chave))return false;
  diarios[prova.chave]=[...new Set([...(diarios[prova.chave]||[]),ms])].sort((a,b)=>a-b).slice(0,5);
  for(const antiga of Object.keys(diarios).sort().slice(0,-14))delete diarios[antiga];
  return diarios[prova.chave].includes(ms);
}

function gravarFantasma(trilha,ms,x,y){
  if(trilha.length<LIMITE_FANTASMA&&(!trilha.length||ms-trilha.at(-1)[0]>=150))
    trilha.push([ms,Math.round(x),Math.round(y)]);
}

function posicaoFantasma(trilha,ms,destino){
  if(!trilha?.length||ms<trilha[0][0]||ms>trilha.at(-1)[0])return null;
  let inicio=0,fim=trilha.length-1;
  while(fim-inicio>1){
    const meio=(inicio+fim)>>1;
    if(trilha[meio][0]<=ms)inicio=meio;
    else fim=meio;
  }
  const [a,x,y]=trilha[inicio], [b,proximoX,proximoY]=trilha[fim];
  const parte=b===a?0:(ms-a)/(b-a);
  const ponto=destino||{};
  ponto.x=x+(proximoX-x)*parte;ponto.y=y+(proximoY-y)*parte;
  return ponto;
}

function tempoProva(ms){
  const minutos=Math.floor(ms/60000), segundos=String(Math.floor(ms/1000)%60).padStart(2,'0');
  return minutos+':'+segundos+'.'+String(Math.floor(ms%1000/10)).padStart(2,'0');
}

function desbloquear(perfil,id){
  if(!Array.isArray(perfil.conquistas)||perfil.conquistas.includes(id))return null;
  const conquista=CONQUISTAS.find(item=>item.id===id);
  if(conquista)perfil.conquistas.push(id);
  return conquista||null;
}

function cicloEmAndamento(perfil){
  return perfil.ciclo>1&&!perfil.cicloConcluido;
}

function iniciarCiclo(perfil,modificadores){
  if(perfil.concluidas.length!==15||cicloEmAndamento(perfil)||perfil.ciclo>=999)return false;
  perfil.ciclo++;
  perfil.cicloAte=1;
  perfil.cicloConcluido=false;
  perfil.modificadores=MODIFICADORES.map(item=>item.id).filter(id=>modificadores.includes(id));
  for(let fase=1;fase<=15;fase++){
    perfil.chefes[fase]=[];
    perfil.coletas[fase]=perfil.coletas[fase].filter(id=>!id.startsWith('v:'));
  }
  perfil.fase=1;
  perfil.sessao=null;
  perfil.santuario={fase:1,id:'inicio'};
  desbloquear(perfil,'novo-ciclo');
  return true;
}

export { MODIFICADORES, CONQUISTAS, desafioDoDia, validarRecordes, registrarProva, gravarFantasma,
  posicaoFantasma, tempoProva, desbloquear, cicloEmAndamento, iniciarCiclo };
