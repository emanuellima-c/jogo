import { GUARDIOES, TIPOS } from '../src/cinzas/ajustes.js';
import { FASES } from '../src/cinzas/fases.js';
import { desenharInimigo, projetil } from '../src/cinzas/atores-pixel.js';
import { desenharAmbiente, desenharZona, TIPOS_AMBIENTE } from '../src/cinzas/ambiente.js';
import { halo, tinta, linha } from '../src/cinzas/formas.js';
import { Som } from '../src/cinzas/som.js';
import { amostrasDeInimigo, POSES } from './amostras-leitura-cinzas.mjs';

const galeria=document.querySelector('#galeria');
const situacao=document.querySelector('#situacao');
const contraste=document.querySelector('#contraste');
const cinza=document.querySelector('#cinza');
const grupo=document.querySelector('#grupo');
const quadros=[];
const artigos=[];
const brilho={ouro:halo('225,167,88'),rubro:halo('221,111,103')};
const nomes={escavador:'Escavador',cuspidor:'Cuspidor',ressonante:'Ressonante',sineiro:'Sineiro',miragem:'Miragem',
  areeiro:'Areeiro',cristalino:'Cristalino',patinador:'Patinador',fornalha:'Fornalha',fagulheiro:'Fagulheiro'};
let folha;
let som;

function elemento(pai,tag,texto){
  const novo=document.createElement(tag);
  if(texto)novo.textContent=texto;
  pai.append(novo);
  return novo;
}

function adicionar(nome,categoria,detalhe,poses,desenhar,ouvir){
  const artigo=elemento(galeria,'article');
  artigos.push({artigo,categoria});
  const cabecalho=elemento(artigo,'header');
  elemento(cabecalho,'h2',nome);
  elemento(cabecalho,'p',detalhe);
  if(ouvir){
    const ouvirAviso=elemento(cabecalho,'button','Ouvir aviso');
    ouvirAviso.type='button';
    ouvirAviso.setAttribute('aria-label',`Ouvir aviso de ${nome.toLowerCase()}`);
    ouvirAviso.addEventListener('click',ouvir);
  }
  const linhaDePoses=elemento(artigo,'div');
  linhaDePoses.className='poses';
  for(const pose of poses){
    const figura=elemento(linhaDePoses,'figure');
    const canvas=elemento(figura,'canvas');
    canvas.width=480;
    canvas.height=270;
    canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label',`${nome} · ${pose.nome}`);
    elemento(figura,'figcaption',pose.nome);
    quadros.push({tela:canvas.getContext('2d'),pose,desenhar});
  }
}

function pintarFundo(tela,piso){
  tinta(tela,'#202a34',0,0,480,270);
  tinta(tela,'#2c383c',0,180,480,90);
  tinta(tela,'#454139',piso.x,piso.y,piso.w,270-piso.y);
  linha(tela,'#a49878',piso.x,piso.y,piso.x+piso.w-1,piso.y);
}

function registrarInimigo(tipo,opcoes,nome,categoria){
  const {amostras,fase,piso}=amostrasDeInimigo(tipo,opcoes);
  const [preparo]=amostras;
  const duracao=preparo.inimigo.duracao.toFixed(2).replace('.',',');
  const detalhe=`${preparo.inimigo.ataqueNome} · ${duracao} s de aviso`;
  adicionar(nome||preparo.inimigo.nome,categoria,detalhe,amostras,(tela,pose,altoContraste)=>{
    const partida={fase,inimigos:[pose.inimigo]};
    pintarFundo(tela,piso);
    desenharAmbiente(tela,partida,altoContraste);
    for(const disparo of pose.projeteis)projetil(tela,disparo,pose.tempo);
    desenharInimigo(tela,pose.inimigo,partida,folha,folha,pose.tempo,true,brilho,altoContraste);
  });
}

function registrarPerigo(tipo,config){
  const piso={x:22,y:203,w:436};
  const zona={tipo,x:152,y:piso.y,w:176,dir:['vento','corrente'].includes(tipo)?1:0};
  const poses=[
    {...POSES[0],estado:'aviso',progresso:.62},
    {...POSES[1],estado:'ativo',progresso:.48},
    {...POSES[2],estado:'quieto',progresso:.15}
  ];
  adicionar(config.nome,'perigo',config.aviso.toFixed(2).replace('.',',')+' s de aviso',poses,(tela,pose,altoContraste)=>{
    pintarFundo(tela,piso);
    desenharZona(tela,{...zona,estado:pose.estado,progresso:pose.progresso},altoContraste);
  },async ()=>{
    som??=new Som();
    som.pausar(true);
    som.iniciar();
    if(som.contexto?.state==='suspended')await som.contexto.resume().catch(()=>{});
    som.tocar(config.som);
  });
}

function atualizar(){
  galeria.classList.toggle('cinza',cinza.checked);
  for(const {artigo,categoria} of artigos)artigo.hidden=grupo.value!=='todos'&&grupo.value!==categoria;
  for(const {tela,pose,desenhar} of quadros)desenhar(tela,pose,contraste.checked);
}

async function iniciar(){
  folha=new Image();
  folha.src=new URL('../arte/cinzas/criaturas.png',import.meta.url).href;
  await folha.decode();
  for(const tipo of Object.keys(TIPOS)){
    if(['chefe','mini'].includes(tipo))continue;
    registrarInimigo(tipo,{golpe:tipo==='ressonante'?'repique':undefined},nomes[tipo],'criatura');
  }
  for(const fase of FASES){
    const chefe=fase.inimigos.find(inimigo=>inimigo.tipo==='chefe');
    if(chefe)registrarInimigo('chefe',{fase:fase.id,etapa:3,golpe:GUARDIOES[fase.id].janela.golpe},chefe.nome,'guardiao');
    for(const mini of fase.inimigos.filter(inimigo=>inimigo.tipo==='mini')){
      registrarInimigo('mini',{fase:fase.id},mini.nome,'guardiao');
    }
  }
  for(const [tipo,config] of Object.entries(TIPOS_AMBIENTE))registrarPerigo(tipo,config);
  atualizar();
  for(const controle of [contraste,cinza,grupo])controle.addEventListener('change',atualizar);
  situacao.hidden=true;
}

iniciar().catch(erro=>{
  situacao.textContent='A galeria não conseguiu preparar todos os quadros. Confira a pasta arte e abra esta página por um servidor local.';
  situacao.setAttribute('role','alert');
  console.error(erro);
});
