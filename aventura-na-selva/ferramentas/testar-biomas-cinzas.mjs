import assert from 'node:assert/strict';
import { BALANCO, GOLPES_INIMIGOS, GUARDIOES, TIPOS } from '../src/cinzas/ajustes.js';
import { TIPOS_AMBIENTE, atualizarAmbiente } from '../src/cinzas/ambiente.js';
import { FASES } from '../src/cinzas/fases.js';
import { centro, posicionar } from '../src/cinzas/fisica.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { novoPerfil } from '../src/cinzas/perfil.js';

const passo=BALANCO.passo;
const mapa={
  id:1,largura:610,entrada:{x:210,y:205},saida:{x:588,y:205},
  santuarios:[{id:'inicio',x:33,y:205}],pisos:[{id:'patio',x:0,y:205,w:610,h:110,tipo:'terra'}],
  espinhos:[],moedas:[],estrelas:[],portas:[],atalhos:[],inimigos:[],dicas:[]
};
function ensaio(fase=mapa){
  const jogo=new Jogo(novoPerfil(),{},[fase]);
  jogo.carregar(fase.id);
  return jogo;
}
function andarTempo(jogo, quadros){
  for(let quadro=0;quadro<quadros;quadro++)jogo.atualizar(passo);
}
function aguardar(jogo, condicao, limite=400){
  for(let quadro=0;quadro<limite;quadro++){
    if(condicao())return true;
    jogo.atualizar(passo);
  }
  return false;
}
function encontro(tipo,distancia,campos={}){
  const definicao={id:'prova',tipo,piso:'patio',x:210+distancia,y:tipo==='fagulheiro'?172:205,min:105,max:465, ...campos};
  return ensaio({...mapa,inimigos:[definicao]});
}

const provas={
  escavador:['raizes',28],
  cuspidor:['semente',74],
  ressonante:['corte',26],
  sineiro:['repique',30],
  miragem:['flanco',24],
  areeiro:['areia',32],
  cristalino:['agulhas',43],
  patinador:['lamina',47],
  fornalha:['salto',42],
  fagulheiro:['centelha',86]
};
for(const [tipo,[ataque,distancia]] of Object.entries(provas)){
  const jogo=encontro(tipo,distancia);
  const alvo=jogo.inimigos[0], vida=jogo.heroi.vida;
  assert(aguardar(jogo,()=>alvo.estado==='aviso'),tipo+' prepara um golpe');
  assert.equal(alvo.ataqueId,ataque,tipo);
  const golpe=GOLPES_INIMIGOS[ataque];
  assert.equal(alvo.duracao,golpe.aviso,tipo+' avisa no tempo declarado');
  assert.equal(alvo.imparavel,!!golpe.imparavel,tipo+' sinaliza o que atravessa o aparo');
  andarTempo(jogo,Math.floor(golpe.aviso/passo)-1);
  assert.equal(jogo.heroi.vida,vida,tipo+' não acerta durante o aviso');
  assert(aguardar(jogo,()=>jogo.heroi.vida<vida,100),tipo+' alcança o alvo próximo');
  assert.equal(vida-jogo.heroi.vida,TIPOS[tipo].dano,tipo+' aplica o dano declarado');

  const fora=encontro(tipo,distancia);
  assert(aguardar(fora,()=>fora.inimigos[0].estado==='aviso'));
  posicionar(fora,fora.heroi,{x:15,y:205});
  andarTempo(fora,150);
  assert.equal(fora.heroi.vida,vida,tipo+' não acerta um alvo fora do alcance');
}
const espelho=encontro('ressonante',58);
espelho.atualizar(passo,{pesado:true});
assert(aguardar(espelho,()=>espelho.inimigos[0].estado==='aviso'));
assert.equal(espelho.inimigos[0].ataqueId,'repique');
assert.match(espelho.inimigos[0].ataqueNome,/^Eco/);

for(const [tipo,config] of Object.entries(TIPOS_AMBIENTE)){
  const jogo=ensaio({...mapa,ambientes:[{piso:'patio',x:190,y:205,w:40,tipo,dir:1}]});
  const ambiente=jogo.ambiente;
  jogo.tempo=config.periodo-config.ativo-config.aviso/2;
  atualizarAmbiente(jogo,passo);
  assert.equal(ambiente.zonas[0].estado,'aviso',tipo);
  assert.equal(ambiente.arrasto,0,tipo);
  assert.equal(ambiente.velocidade,1,tipo);
  assert.equal(ambiente.freio,1,tipo);
  assert.equal(jogo.heroi.vida,jogo.heroi.vidaMax,tipo);
  jogo.tempo=config.periodo-config.ativo+.05;
  atualizarAmbiente(jogo,passo);
  assert.equal(ambiente.zonas[0].estado,'ativo',tipo);
  assert.equal(ambiente.arrasto,config.arrasto??0,tipo);
  assert.equal(ambiente.velocidade,config.velocidade??1,tipo);
  assert.equal(ambiente.freio,config.freio??1,tipo);
  assert.equal(jogo.heroi.vidaMax-jogo.heroi.vida,config.dano??0,tipo);
}

const nomesDeArena=new Set();
for(const [faseId,guardiao] of Object.entries(GUARDIOES)){
  const fase=FASES[Number(faseId)-1];
  const chefe=fase.inimigos.find(inimigo=>inimigo.tipo==='chefe');
  assert(chefe&&chefe.obrigatorio);
  assert.equal(guardiao.etapas.length,3);
  assert(guardiao.etapas[0].ate>guardiao.etapas[1].ate&&guardiao.etapas[1].ate>guardiao.etapas[2].ate);
  assert(!guardiao.etapas.flatMap(etapa=>etapa.padrao).includes(guardiao.ciclo));
  nomesDeArena.add(guardiao.arena);
  const jogo=ensaio({...mapa,id:fase.id,inimigos:[{...chefe,piso:'patio',x:267,y:205,min:105,max:465}]});
  const inimigo=jogo.inimigos[0];
  inimigo.vida=Math.floor(inimigo.vidaMax*guardiao.etapas[1].ate);
  assert(aguardar(jogo,()=>inimigo.faseChefe===2&&inimigo.estado==='aviso'&&!inimigo.transicao));
  const ataque=GOLPES_INIMIGOS[inimigo.ataqueId];
  assert(ataque.campo||ataque.contraforte,guardiao.arena);
  assert(!ataque.campo||inimigo.campos.length>0,guardiao.arena);
  const vida=jogo.heroi.vida;
  andarTempo(jogo,Math.floor(inimigo.duracao/passo)-1);
  assert.equal(jogo.heroi.vida,vida,guardiao.arena+' sinaliza antes do contato');
  if(ataque.contraforte){
    inimigo.x=inimigo.min+12-inimigo.w/2;
    posicionar(jogo,jogo.heroi,{x:inimigo.min-65,y:205});
    assert(aguardar(jogo,()=>inimigo.estado==='aberto',60),'O contraforte expõe o rei ao aparar a investida');
  }
}
assert.equal(nomesDeArena.size,5);

for(let regiao=0;regiao<5;regiao++){
  const fases=FASES.filter(fase=>fase.regiao===regiao);
  const tipos=new Set(fases.flatMap(fase=>fase.inimigos.map(inimigo=>inimigo.tipo)).filter(tipo=>tipo in provas));
  assert(tipos.size>=2,'Dois novos tipos no bioma '+regiao);
  assert(fases.every(fase=>fase.ambientes.length&&fase.momento));
  assert.equal(fases.flatMap(fase=>fase.inimigos).filter(inimigo=>inimigo.reliquia&&!inimigo.obrigatorio).length,1);
  assert.equal(fases.flatMap(fase=>fase.inimigosCiclo).length,1);
}
console.log('Dez criaturas, cinco perigos, cinco arenas e cinco desvios de relíquias verificados.');
