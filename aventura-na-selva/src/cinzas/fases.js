// As distâncias da trilha principal são medidas da borda anterior à próxima.
// Nos desvios, cada terraço usa o centro e o topo do piso de origem como referência.
import { PLANTAS } from './trilhas.js';
import { CURVA_FASES, TIPOS } from './ajustes.js';
import { montarObjetivos } from './objetivos.js';

const REGIOES = [
  {nome:'Selva Esmeralda',marca:'Raízes da vigília',cor:'#86b98d'},
  {nome:'Ruínas de Aurora',marca:'Pedra e ressonância',cor:'#a99cc9'},
  {nome:'Deserto de Âmbar',marca:'Areia e cobre',cor:'#c6a06c'},
  {nome:'Neve da Lua Clara',marca:'Noite de vidro',cor:'#82b6c5'},
  {nome:'Vulcão de Obsidiana',marca:'Cinza acesa',cor:'#c68172'}
];
const MINI_GOLPES=[
  ['raizes','varredura'], ['repique','teia'], ['areia','flanco'], ['agulhas','lamina'], ['salto','varredura']
];

function plataforma(id,x,y,w,tipo='pedra',h=11,movimento=[]){
  const p={id,x,y,w,h,tipo};
  if(tipo==='movel'){
    const [dx=0,dy=0,periodo=4,offset=0]=movimento;
    Object.assign(p,{dx,dy,periodo,offset});
  }
  return p;
}
function materialFirme(tipo){return tipo==='terra'||tipo==='pedra'||tipo==='metal';}

function montar(planta,indice){
  const id=indice+1, regio=Math.floor(indice/3), pisos=[], principal=[], desvios=[];
  const estrelas=[], moedas=[], espinhos=[], portas=[], santuarios=[], atalhos=[];
  const porId=new Map();
  function inserir(p){pisos.push(p);porId.set(p.id,p);return p;}
  let borda=0;
  for(const [chave,vao,largura,topo,tipo='pedra',...mov] of planta.trilha){
    const altura=materialFirme(tipo)?Math.max(28,334-topo):12;
    const p=inserir(plataforma(chave,borda+vao,topo,largura,tipo,altura,mov));
    borda=p.x+p.w;principal.push(chave);
  }
  // Referências locais evitam reposicionar uma fase inteira ao ajustar um vão.
  const local=(chave,dx,dy=0)=>{const p=porId.get(chave);return {x:p.x+dx,y:p.y+dy};};
  for(const [i,d] of planta.desvios.entries()){
    const [origem,nome,degraus,opcoes={}]=d;
    const base=porId.get(origem), meio=base.x+base.w/2, chave='s'+(i+1);
    const caminho=degraus.map(([cx,dy,w,tipo='pedra',...mov],j)=>{
      const cid=chave+'-'+(j+1);
      inserir(plataforma(cid,Math.round(meio+cx-w/2),base.y+dy,w,tipo,10,mov));
      return cid;
    });
    const ultimo=porId.get(caminho[caminho.length-1]);
    estrelas.push({id:chave,nome,x:Math.round(ultimo.x+ultimo.w/2+(opcoes.desloca||0)),y:ultimo.y-15});
    desvios.push({estrela:chave,origem,caminho,retorno:opcoes.retorno||origem,volta:opcoes.volta || caminho.slice(0,-1).reverse()});
  }
  for(const [chave,pl,dx,dy,w,tipo] of planta.auxiliares||[]){
    const ponto=local(pl,dx,dy);
    inserir(plataforma(chave,ponto.x,ponto.y,w,tipo,10));
  }
  for(const [i,[pl,dx,dy,valor=1]] of planta.ecos.entries())moedas.push({id:'eco-'+(i+1),...local(pl,dx,dy),valor});
  for(const [pl,dx,dy,w] of planta.espinhos||[])espinhos.push({...local(pl,dx,dy),w,h:9});
  function montarInimigo([identificador,tipo,piso,dx,patrulha,nome,obrigatorio,altura,reliquia]){
    const base=porId.get(piso), centro=base.x+dx;
    const arquetipo=TIPOS[tipo].arquetipo||tipo;
    return {
      id:identificador,tipo,piso,pisoX:base.x,pisoY:base.y,pisoW:base.w,
      x:centro,y:base.y-(altura??(arquetipo==='voador'?33:0)),
      min:Math.max(base.x+10,centro-patrulha),max:Math.min(base.x+base.w-10,centro+patrulha),
      nome,obrigatorio:!!obrigatorio,reliquia,padrao:tipo==='mini'?MINI_GOLPES[regio]:undefined
    };
  }
  const inimigos=planta.inimigos.map(montarInimigo);
  const inimigosCiclo=(planta.inimigosCiclo||[]).map(montarInimigo);
  const relicarios=(planta.auxiliares||[]).filter(([piso])=>inimigos.some(inimigo=>inimigo.piso===piso&&inimigo.reliquia))
    .map(([piso,origem])=>({piso,origem}));
  const ambientes=(planta.ambientes||[]).map(([piso,dx,w,tipo,dir=0])=>({piso,...local(piso,dx),w,tipo,dir}));
  const [baseMomento,dxMomento,nomeMomento,textoMomento]=planta.momento||[];
  const momento=baseMomento?{...local(baseMomento,dxMomento),nome:nomeMomento,texto:textoMomento}:null;
  for(const [pl,dx,...alvos] of planta.portas||[])portas.push({...local(pl,dx),alvos});
  santuarios.push({id:'inicio',...local(principal[0],33),nome:'Fogueira de entrada'});
  for(const [cid,pl,dx,nome] of planta.santuarios)santuarios.push({id:cid,...local(pl,dx),nome});
  for(const [cid,pl,dx,volta,dxVolta,nome] of planta.atalhos){
    const a=local(pl,dx),b=local(volta,dxVolta);
    atalhos.push({id:cid,...a,paraX:b.x,paraY:b.y,nome});
  }
  const ultimo=porId.get(principal[principal.length-1]);
  const fase={id,nome:planta.nome,subtitulo:planta.subtitulo,marca:planta.marca,regiao:regio,curva:CURVA_FASES[id],
    largura:ultimo.x+ultimo.w,entrada:local(principal[0],21),saida:local(ultimo.id,ultimo.w-23),
    pisos,espinhos,estrelas,moedas,inimigos,inimigosCiclo,portas,santuarios,atalhos,ambientes,momento,
    bento:local(principal[0],94),treino:local(principal[0],154),
    dicas:planta.dicas.map(([pl,dx,texto])=>({...local(pl,dx),texto})),
    rotas:{principal,desvios,relicarios,segredos:planta.segredos||[]}};
  fase.objetivos=montarObjetivos(fase);
  return fase;
}
const FASES=PLANTAS.map(montar);

export { FASES, REGIOES };
