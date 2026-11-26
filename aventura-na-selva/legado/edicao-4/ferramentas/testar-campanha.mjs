// Percorre a campanha a 60 Hz. O piloto usa apenas entradas, moedas e ações disponíveis no jogo.
import assert from 'node:assert/strict';
import { Engine } from '../src/core/engine.js';
import { ACOES as A, CONFIG as C } from '../src/core/configuracoes.js';
import { precoProduto } from '../src/meta/mercador.js';

class Controles {
  mantidas=0;
  pulsos=0;
  definir(acoes){this.pulsos|=acoes&~this.mantidas;this.mantidas=acoes;}
  ativa(a){return Boolean(this.mantidas&a);}
  consumir(a){const pressionada=Boolean(this.pulsos&a);this.pulsos&=~a;return pressionada;}
  limparPulsos(){this.pulsos=0;}
  limpar(){this.mantidas=this.pulsos=0;}
}
function direcao(valor){return valor>0?A.direita:A.esquerda;}
function escolherEntrada(engine,quadro,piloto){
  if(engine.descanso)return A.direita;
  const m=engine.mundo,j=m.jogador,t=j.transformacao,base=t.y+t.altura,centro=t.x+t.largura/2;
  const chefe=engine.chefe;
  let acoes=quadro%11===0?0:A.atacar;
  let saltar;
  if(chefe?.ativo && chefe.estado!=='dormindo'){
    const b=chefe.transformacao,distancia=b.x+b.largura/2-centro;
    if(Math.abs(distancia)>20 || j.controle.direcao!==Math.sign(distancia))acoes|=direcao(distancia);
    saltar=Math.abs(distancia)<220 || chefe.estado==='investida';
    if(j.corpo.vy>80 && base<b.y+25 && Math.abs(distancia)<50 && quadro%6===0)acoes|=A.pogo;
  }else{
    acoes|=A.direita;
    const abismo=m.fase.buracos.some(b=>b.x-centro<43 && b.x+b.largura>centro);
    const espinhos=m.perigos.some(p=>p.tipo==='espinhos' && p.x-centro<47 && p.x+p.largura>t.x);
    const parede=m.solido(Math.floor((t.x+t.largura+58)/32),Math.floor((base-8)/32));
    saltar=abismo || espinhos || parede;
  }
  if(j.corpo.noChao && saltar && !piloto.puloAnterior)piloto.quadrosPulo=32;
  piloto.puloAnterior=piloto.quadrosPulo>0;
  if(piloto.puloAnterior){acoes|=A.pular;piloto.quadrosPulo--;}
  return acoes;
}
function visitarBento(engine){
  engine.agir('interagir');assert.equal(engine.estados.atual,'LOJA');
  const p=engine.perfil,opcoes=p.pendente?.opcoes||[];
  const escolha=['forca','escudo','vigor','ritmo','critico'].find(id=>opcoes.includes(id))||opcoes[0];
  if(escolha)engine.agir('poder',escolha);
  while(engine.vidasAtuais()<engine.atributos.coracoes && p.moedas>=precoProduto(p,'vida'))engine.agir('comprar','vida');
  if(p.moedas>=95)engine.agir('comprar','resistencia');
  engine.agir('fecharLoja');
}
const entrada=new Controles(),salvos=new Map();
const engine=new Engine(entrada,{trocarTela(){},atualizar(){},ocultarTestes(){}},{preparar(){},desenhar(){}},
  {getItem:chave=>salvos.get(chave)??null,setItem:(chave,valor)=>salvos.set(chave,valor)});
engine.agir('jogar');
const piloto={quadrosPulo:0,puloAnterior:false},concluidas=[];
let ultimoDescanso=0;
for(let quadro=0;quadro<60000 && engine.estados.atual!=='VITORIA';quadro++){
  assert.notEqual(engine.estados.atual,'FIM_DE_JOGO','O piloto morreu na fase '+engine.mundo.fase.numero);
  assert(engine.mundo.tempo<160,'O piloto ficou preso na fase '+engine.mundo.fase.numero);
  if(engine.estados.atual==='FASE_CONCLUIDA'){
    concluidas.push(engine.mundo.fase.numero);engine.agir('avancar');
  }
  const t=engine.mundo.jogador.transformacao;
  if(engine.descanso && ultimoDescanso!==engine.descanso.fase && Math.abs(t.x-engine.mercador.x)<10){
    ultimoDescanso=engine.descanso.fase;visitarBento(engine);
  }
  entrada.definir(escolherEntrada(engine,quadro,piloto));engine.atualizar(C.passo);
}
assert.deepEqual(concluidas,Array.from({length:15},(_,i)=>i+1));
assert.equal(engine.estados.atual,'VITORIA');assert.equal(engine.perfil.totais.chefes,5);
console.log('Expedição normal concluída por entradas simuladas: 15 fases, 15 descansos e cinco guardiões.');
