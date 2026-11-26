import { BALANCO, TIPOS } from '../src/cinzas/ajustes.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { novoPerfil } from '../src/cinzas/perfil.js';

const POSES = [
  {estado:'aviso',nome:'Preparo',progresso:.24},
  {estado:'impacto',nome:'Impacto',progresso:.54},
  {estado:'recuperacao',nome:'Recuperação',progresso:.46}
];

function amostrasDeInimigo(tipo,{fase=1,golpe,etapa=1,modo='normal'}={}){
  const piso={id:'galeria',x:22,y:203,w:436,h:70,tipo:'terra'};
  const entrada={x:245,y:piso.y};
  const definicao={id:'amostra',tipo,x:193,y:piso.y,min:73,max:388,piso:piso.id};
  if(tipo==='voador'||TIPOS[tipo].arquetipo==='voador')definicao.y-=29;
  if(golpe)definicao.padrao=[golpe];
  const arena={id:fase,largura:480,entrada,saida:{x:429,y:piso.y},pisos:[piso],santuarios:[{id:'inicio',...entrada}],
    inimigos:[definicao],espinhos:[],moedas:[],estrelas:[],portas:[],atalhos:[],dicas:[]};
  const perfil=novoPerfil();
  perfil.opcoes.modo=modo;
  const jogo=new Jogo(perfil,{},[arena]);
  jogo.carregar(fase);
  const inimigo=jogo.inimigos[0];
  inimigo.faseChefe=etapa;
  const amostras=[];
  for(let quadro=0;quadro<300&&amostras.length<POSES.length;quadro++){
    jogo.atualizar(BALANCO.passo);
    const pose=POSES[amostras.length];
    if(inimigo.estado===pose.estado&&inimigo.tempo>=inimigo.duracao*pose.progresso){
      const projeteis=jogo.projeteis.map(({autor,...projetil})=>projetil);
      amostras.push({...pose,tempo:jogo.tempo,inimigo:structuredClone(inimigo),projeteis});
    }
  }
  if(amostras.length!==POSES.length)throw new Error(`Poses incompletas de ${tipo} em F${fase}`);
  return {fase:arena,piso,amostras};
}

export { amostrasDeInimigo, POSES };
