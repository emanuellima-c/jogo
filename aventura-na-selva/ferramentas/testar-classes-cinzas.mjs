import assert from 'node:assert/strict';
import { BALANCO, CLASSES, MINIMO_ATRIBUTO, TIPOS } from '../src/cinzas/ajustes.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { escolherClasse, novoPerfil } from '../src/cinzas/perfil.js';

const passo=BALANCO.passo,entrada={x:165,y:200};
const arena={id:1,largura:460,entrada,saida:{x:440,y:200},pisos:[{id:'piso',x:0,y:200,w:460,h:70,tipo:'terra'}],
  santuarios:[{id:'inicio',...entrada}],espinhos:[],moedas:[],estrelas:[],portas:[],atalhos:[],dicas:[]};
const nomes=['cavaleiro','guerreiro','ladino','piromante','feiticeiro','clerigo','despojado'];

function ensaio(id,distancia=23){
  const perfil=novoPerfil();
  if(id!=='herdeiro')assert(escolherClasse(perfil,id));
  const x=entrada.x+distancia;
  const jogo=new Jogo(perfil,{},[{...arena,inimigos:[{id:'alvo',tipo:'vigia',piso:'piso',x,y:200,min:x,max:x}]}]);
  jogo.carregar(1);
  const alvo=jogo.inimigos[0];
  alvo.vida=alvo.vidaMax=800;
  alvo.espera=20;
  alvo.dir=-1;
  return {jogo,alvo,heroi:jogo.heroi,perfil};
}

function avancar(jogo,quadros,comandos={}){
  for(let quadro=0;quadro<quadros;quadro++)jogo.atualizar(passo,comandos);
}

const ataques=new Set();
for(const id of nomes){
  const classe=CLASSES[id];
  const iniciais=Object.values(classe.atributosIniciais);
  assert.equal(iniciais.length,7);
  assert.equal(classe.nivelInicial,iniciais.reduce((soma,valor)=>soma+valor-MINIMO_ATRIBUTO,0));
  for(const acao of ['leve','pesado']){
    const golpe=classe[acao];
    assert(Object.values(golpe.escala).every(nota=>/^[SABCDE]$/.test(nota)));
    const {jogo,heroi,alvo}=ensaio(id);
    assert.equal(heroi.classe,classe);
    jogo.atualizar(passo,{[acao]:true,eixo:1});
    assert.equal(heroi.acao,acao);
    assert.deepEqual([heroi.prep,heroi.imp,heroi.rec],[golpe.preparo,golpe.impacto,golpe.recuperacao],golpe.nome);
    ataques.add([golpe.preparo,golpe.impacto,golpe.recuperacao,golpe.alcance,golpe.altura].join('/'));
    avancar(jogo,72);
    assert(alvo.vida<alvo.vidaMax,golpe.nome+' acerta com o conjunto inicial');
  }
}
assert.equal(ataques.size,2*nomes.length,'Leves e pesados têm ritmos e alcances próprios');
assert.equal(ensaio('herdeiro').heroi.classe,CLASSES.herdeiro);

for(const vermelho of [false,true]){
  const {jogo,heroi,alvo}=ensaio('cavaleiro');
  avancar(jogo,3,{talento:true,seguraTalento:true,eixo:1});
  const vida=heroi.vida,vigor=heroi.vigor;
  jogo.impactoInimigo(alvo,vermelho);
  assert.equal(heroi.vida===vida,!vermelho,'A serrilha atravessa a guarda');
  if(!vermelho)assert(heroi.vigor<vigor);
}

{
  const {jogo,heroi,alvo}=ensaio('guerreiro');
  jogo.atualizar(passo,{pesado:true});
  avancar(jogo,52);
  const primeiro=alvo.vidaMax-alvo.vida;
  assert(heroi.recursoClasse>0);
  jogo.atualizar(passo,{pesado:true});
  avancar(jogo,52);
  assert(alvo.vidaMax-alvo.vida>2*primeiro);
}

{
  const {jogo,alvo,perfil}=ensaio('ladino');
  alvo.dir=1;
  alvo.estado='recuperacao';
  alvo.duracao=5;
  alvo.vida=20;
  jogo.atualizar(passo,{leve:true});
  avancar(jogo,22);
  assert.equal(alvo.vida,0);
  assert.equal(perfil.ecos,TIPOS.vigia.ecos+1);
}

{
  const {jogo,heroi,alvo}=ensaio('piromante');
  jogo.atualizar(passo,{pesado:true});
  avancar(jogo,21);
  const aposContato=alvo.vida;
  assert(aposContato<alvo.vidaMax);
  avancar(jogo,55);
  assert(alvo.vida<aposContato,'A queimadura continua após o contato');
  const fora=ensaio('piromante',134);
  fora.jogo.atualizar(passo,{talento:true});
  avancar(fora.jogo,60);
  assert(fora.heroi.vida<heroi.vidaMax,'O sopro perdido tem risco');
}

for(const distancia of [100,187]){
  const {jogo,alvo,heroi}=ensaio('feiticeiro',distancia);
  jogo.atualizar(passo,{leve:true});
  avancar(jogo,12);
  assert(jogo.projeteis.length>0,'A centelha percorre o mundo');
  avancar(jogo,70);
  assert.equal(alvo.vida<alvo.vidaMax,distancia===100);
  assert.equal(jogo.projeteis.length,0);
  heroi.recursoClasse=0;
  jogo.atualizar(passo,{leve:true});
  assert.equal(heroi.acao,'leve','O cajado permanece disponível sem Foco');
}

{
  const {jogo,heroi}=ensaio('clerigo');
  for(let golpe=0;golpe<2;golpe++){
    jogo.atualizar(passo,{leve:true});
    avancar(jogo,29);
  }
  assert(heroi.recursoClasse>=3);
  heroi.vida=42;
  jogo.atualizar(passo,{talento:true});
  avancar(jogo,32);
  assert(heroi.vida>42);
}

{
  const {jogo,alvo,perfil}=ensaio('despojado');
  alvo.vida=2;
  jogo.atualizar(passo,{leve:true});
  avancar(jogo,22);
  assert.equal(perfil.ecos,TIPOS.vigia.ecos+1);
}

console.log('Sete kits verificados por entrada: golpes próprios, guarda, Fúria, flanco, fogo, projéteis, Fé e ecos.');
