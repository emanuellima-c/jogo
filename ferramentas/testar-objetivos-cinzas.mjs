import assert from 'node:assert/strict';
import { BALANCO } from '../src/cinzas/ajustes.js';
import { FASES } from '../src/cinzas/fases.js';
import { posicionar } from '../src/cinzas/fisica.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { iniciarCiclo } from '../src/cinzas/modos.js';
import { novoPerfil, validar } from '../src/cinzas/perfil.js';

function iniciar(fase=1,perfil=novoPerfil()){
  const premios=[];
  const jogo=new Jogo(perfil,{evento:(nome,meta)=>{if(nome==='objetivo')premios.push(meta);}});
  assert(jogo.carregar(fase));
  return {jogo,perfil,premios};
}

for(const fase of FASES){
  assert(fase.objetivos.length>=2&&fase.objetivos.length<=3);
  assert.equal(new Set(fase.objetivos.map(meta=>meta.id)).size,fase.objetivos.length);
  assert(fase.objetivos.every(meta=>meta.ecos>0&&!meta.texto.includes('undefined')));
}

const {jogo,perfil,premios}=iniciar();
const [chama,estrela,relicario]=jogo.fase.objetivos;
const altar=jogo.fase.santuarios.find(objeto=>objeto.id===chama.alvo);
posicionar(jogo,jogo.heroi,altar);
assert(jogo.interagir());
assert.deepEqual(premios,[chama]);
assert.equal(perfil.ecos,chama.ecos);
assert(jogo.interagir());
assert.equal(perfil.ecos,chama.ecos,'O descanso repetido conserva o saldo');

const ponto=jogo.fase.estrelas.find(objeto=>objeto.id===estrela.alvo);
posicionar(jogo,jogo.heroi,{x:ponto.x,y:ponto.y+jogo.heroi.h*.51});
jogo.coletar();
assert.equal(perfil.ecos,chama.ecos+estrela.ecos+BALANCO.premio.estrela);
const mini=jogo.inimigos.find(inimigo=>inimigo.id===relicario.alvo);
jogo.derrotar(mini);
assert.deepEqual(premios,[chama,estrela,relicario]);

const carregado=validar(structuredClone(perfil));
const retomada=iniciar(1,carregado);
assert.equal(carregado.ecos,perfil.ecos);
assert.deepEqual(retomada.premios,[]);
carregado.concluidas=FASES.map(fase=>fase.id);
assert(iniciarCiclo(carregado,[]));
assert([chama,estrela,relicario].every(meta=>carregado.coletas[1].includes(meta.id)));

const preexistente=novoPerfil();
preexistente.estrelas[1].push(estrela.alvo);
assert.deepEqual(iniciar(1,preexistente).premios,[estrela]);
assert.equal(preexistente.ecos,estrela.ecos);
assert.deepEqual(iniciar(1,preexistente).premios,[]);

for(const gastouFrasco of [false,true]){
  const duelo=iniciar(4);
  if(gastouFrasco)duelo.jogo.heroi.frascos--;
  const inimigo=duelo.jogo.inimigos.find(alvo=>alvo.tipo==='chefe');
  duelo.jogo.derrotar(inimigo);
  assert.equal(duelo.premios.some(meta=>meta.tipo==='duelo'),!gastouFrasco);
}

console.log('Objetivos do santuário verificados nas 15 fases, com prêmios persistentes e sem pagamento duplicado.');
