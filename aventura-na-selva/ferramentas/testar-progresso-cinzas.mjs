import assert from 'node:assert/strict';
import { BALANCO, dificuldadeDoPerfil } from '../src/cinzas/ajustes.js';
import { criarHeroi, recalcularHeroi } from '../src/cinzas/combate.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { novoPerfil, validar } from '../src/cinzas/perfil.js';
import {
  AMULETOS, atributos, bonusEstrela, comprarAmuleto, equiparAmuleto,
  melhorarFrasco, melhorarGravura, nivelGravura, obterAmuleto, slotsAmuletos
} from '../src/cinzas/progresso.js';

const piso={id:'base',x:0,y:200,w:440,h:75,tipo:'terra'};
const arena={
  id:1,nome:'Oficina de ensaio',regiao:0,largura:440,entrada:{x:140,y:200},saida:{x:416,y:200},
  pisos:[piso],espinhos:[],moedas:[],estrelas:[],inimigos:[],portas:[],atalhos:[],dicas:[],
  santuarios:[{id:'inicio',x:33,y:200}],bento:{x:95,y:200},treino:{x:155,y:200}
};

function jogoCom(perfil,tipo){
  const inimigos=tipo?[{id:'alvo',tipo,x:168,y:200,min:168,max:168}]:[];
  const jogo=new Jogo(perfil,{},[{...arena,inimigos}]);
  assert(jogo.carregar(1));
  if(tipo)jogo.inimigos[0].espera=10;
  return jogo;
}
function avancar(jogo,quadros,entrada={}){
  for(let quadro=0;quadro<quadros;quadro++)jogo.atualizar(BALANCO.passo,entrada);
}

assert.equal(AMULETOS.length,15);
assert.equal(new Set(AMULETOS.map(amuleto=>amuleto.id)).size,15);
for(const origem of ['mini-chefe','desvio','loja']){
  assert.equal(AMULETOS.filter(amuleto=>amuleto.origem===origem).length,5);
}
for(const amuleto of AMULETOS){
  const perfil=novoPerfil(), neutros=atributos(perfil);
  assert(obterAmuleto(perfil,amuleto.id));
  assert(!obterAmuleto(perfil,amuleto.id),'Um amuleto encontrado se torna único');
  assert(equiparAmuleto(perfil,amuleto.id,0));
  const ajustados=atributos(perfil);
  assert.notDeepEqual(ajustados,neutros);
  for(const [chave,valor] of Object.entries(amuleto.bonus)){
    assert.equal(ajustados[chave],neutros[chave]+valor,amuleto.id+' · '+chave);
  }
  assert(equiparAmuleto(perfil,null,0));
  assert.deepEqual(atributos(perfil),neutros);
}

const colecao=novoPerfil();
colecao.ecos=100;
assert(!comprarAmuleto(colecao,'asa-de-cristal'));
assert(!comprarAmuleto(colecao,'fivela-do-rancho'));
colecao.liberada=7;
assert(comprarAmuleto(colecao,'fivela-do-rancho'));
assert.equal(colecao.ecos,88);
assert(!comprarAmuleto(colecao,'fivela-do-rancho'));
assert.equal(colecao.ecos,88);
assert(obterAmuleto(colecao,bonusEstrela(1,'s3')));
assert.equal(slotsAmuletos(colecao),2);
assert(!equiparAmuleto(colecao,'folha-dupla',2));
assert(equiparAmuleto(colecao,'folha-dupla',0));
assert(equiparAmuleto(colecao,'fivela-do-rancho',1));
assert(equiparAmuleto(colecao,'folha-dupla',1));
assert.deepEqual(colecao.amuletosEquipados,['fivela-do-rancho','folha-dupla',null]);
colecao.concluidas.push(15);
assert.equal(slotsAmuletos(colecao),3);
assert(equiparAmuleto(colecao,'folha-dupla',2));
assert.deepEqual(validar(colecao).amuletosEquipados,['fivela-do-rancho',null,'folha-dupla']);

function dano(acao,amuleto){
  const perfil=novoPerfil();
  if(amuleto){assert(obterAmuleto(perfil,amuleto));assert(equiparAmuleto(perfil,amuleto,0));}
  const jogo=jogoCom(perfil,'elite'), alvo=jogo.inimigos[0];
  avancar(jogo,1,{[acao]:true,eixo:1});
  avancar(jogo,20);
  return alvo.vidaMax-alvo.vida;
}
assert(dano('pesado','dente-do-vigia')>dano('pesado'));
assert(dano('leve','dente-do-vigia')<dano('leve'));

const defensivo=novoPerfil();
assert(obterAmuleto(defensivo,'fio-da-neve'));
assert(equiparAmuleto(defensivo,'fio-da-neve',0));
const jogoDefensivo=jogoCom(defensivo);
jogoDefensivo.receberGolpe(30);
assert.equal(jogoDefensivo.heroi.vida,75);
jogoDefensivo.heroi.vigor=20;
jogoDefensivo.heroi.frascos=1;
assert(obterAmuleto(defensivo,'fragmento-lunar'));
assert(equiparAmuleto(defensivo,'fragmento-lunar',1));
recalcularHeroi(jogoDefensivo.heroi,defensivo);
assert.deepEqual([jogoDefensivo.heroi.vida,jogoDefensivo.heroi.vigor,jogoDefensivo.heroi.frascos],[75,20,1]);

const gravador=novoPerfil();
gravador.ecos=200;
assert(!melhorarGravura(gravador,'aparo'));
gravador.compradas=['aparo','eco'];
gravador.equipadas=['aparo','eco'];
assert.equal(nivelGravura(gravador,'aparo'),1);
assert(melhorarGravura(gravador,'aparo'));
assert(melhorarGravura(gravador,'aparo'));
assert(!melhorarGravura(gravador,'aparo'));
assert(melhorarGravura(gravador,'eco'));
assert(melhorarGravura(gravador,'eco'));
assert.equal(gravador.ecos,78);
const jogoAparo=jogoCom(gravador,'elite');
avancar(jogoAparo,1,{t1:true,eixo:1});
avancar(jogoAparo,5);
const antes=jogoAparo.heroi.vigor;
jogoAparo.impactoInimigo(jogoAparo.inimigos[0]);
assert.equal(jogoAparo.heroi.vigor,antes+12);
assert(jogoAparo.heroi.retorno>0);

function gravura(id){
  const perfil=novoPerfil();
  perfil.compradas=[id];perfil.equipadas=[id,null];perfil.gravuras[id]=3;
  return perfil;
}
const jogoRetorno=jogoCom(gravura('retorno'),'escudo');
jogoRetorno.heroi.retorno=.65;
avancar(jogoRetorno,1,{t1:true,eixo:1});
avancar(jogoRetorno,5);
assert.equal(jogoRetorno.heroi.vigor,90);
assert.equal(jogoRetorno.inimigos[0].estado,'aberto');

const jogoQuebra=jogoCom(gravura('quebra'),'escudo');
avancar(jogoQuebra,1,{t1:true,eixo:-1,seguraT1:true});
avancar(jogoQuebra,52,{seguraT1:true});
assert.equal(jogoQuebra.heroi.dir,-1);
assert.equal(jogoQuebra.inimigos[0].estado,'aberto');
assert.equal(jogoQuebra.heroi.vigor,83);

const jogoEstocada=jogoCom(gravura('estocada'),'escudo');
avancar(jogoEstocada,1,{t1:true,eixo:1});
avancar(jogoEstocada,22);
assert.equal(jogoEstocada.inimigos[0].estado,'aberto');
assert.equal(jogoEstocada.heroi.etapa,'recuperacao');
avancar(jogoEstocada,1,{esquiva:true});
assert.equal(jogoEstocada.heroi.acao,'esquiva');

const jogoPisada=jogoCom(gravura('pisada'),'escudo'), ponte=jogoPisada.pisos[0];
Object.assign(ponte,{tipo:'fragil',estado:'racha',relogio:.45});
jogoPisada.heroi.y-=45;jogoPisada.heroi.noChao=false;jogoPisada.heroi.pisoId=null;
avancar(jogoPisada,1,{t1:true,eixo:1});
avancar(jogoPisada,14);
assert.equal(jogoPisada.inimigos[0].estado,'aberto');
assert(ponte.relogio>.7);

const jogoEco=jogoCom(gravador), heroiEco=jogoEco.heroi;
heroiEco.y-=100;heroiEco.noChao=false;heroiEco.pisoId=null;
avancar(jogoEco,1,{t2:true,eixo:1});
avancar(jogoEco,5);
assert.equal(heroiEco.etapa,'impacto');
assert(!jogoEco.receberGolpe(30));
avancar(jogoEco,12);
avancar(jogoEco,1,{t2:true,eixo:1});
assert.equal(heroiEco.ecoUsos,1);
avancar(jogoEco,1,{t2:true,eixo:-1});
assert.equal(heroiEco.ecoUsos,2);
avancar(jogoEco,17);
avancar(jogoEco,1,{t2:true,eixo:1});
assert.equal(heroiEco.ecoUsos,2);

assert(melhorarFrasco(gravador));
assert(melhorarFrasco(gravador));
assert(!melhorarFrasco(gravador));
const curador=jogoCom(gravador);
assert.equal(curador.heroi.frascos,3);
curador.heroi.vida=20;curador.heroi.vigor=10;
avancar(curador,1,{cura:true});
const vigorNoPreparo=curador.heroi.vigor;
assert.equal(curador.heroi.frascos,2);
assert.equal(curador.heroi.vida,20);
const dificuldade=dificuldadeDoPerfil(gravador);
avancar(curador,Math.floor(dificuldade.preparoFrasco/BALANCO.passo)-1);
assert.equal(curador.heroi.vida,20);
avancar(curador,2);
assert.equal(curador.heroi.vida,20+dificuldade.cura);
assert.equal(curador.heroi.vigor,vigorNoPreparo+18);
gravador.modificadores=['sem-frascos','vigor-curto'];
const heroiNormal=criarHeroi(gravador);
assert.deepEqual([heroiNormal.frascosMax,heroiNormal.vigorMax],[3,100]);
gravador.ciclo=2;
const heroiCiclo=criarHeroi(gravador);
assert.deepEqual([heroiCiclo.frascosMax,heroiCiclo.vigorMax],[0,75]);

const cliente=novoPerfil();
cliente.liberada=2;cliente.ecos=70;
const loja=jogoCom(cliente);
assert(!loja.investir('comprarAmuleto','fivela-do-rancho'));
loja.heroi.x=loja.fase.bento.x-loja.heroi.w/2;
assert(loja.investir('comprarAmuleto','fivela-do-rancho'));
assert(loja.investir('equiparAmuleto','fivela-do-rancho',0));
assert.equal(loja.heroi.vigorMax,118);
assert(loja.investir('melhorarFrasco'));
assert(loja.investir('melhorarFrasco'));
assert.equal(loja.heroi.frascos,2);
loja.heroi.x=loja.fase.santuarios[0].x-loja.heroi.w/2;
assert(loja.descansar());
assert.equal(loja.heroi.frascos,3);

console.log('15 amuletos com bônus e tradeoffs, loja, terceiro espaço, gravuras evoluídas, frascos e modificadores passaram.');
