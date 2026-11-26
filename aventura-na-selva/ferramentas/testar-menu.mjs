import assert from 'node:assert/strict';
import { Aplicacao } from '../src/cinzas/aplicacao.js';
import { novoPerfil, carregarPerfil } from '../src/cinzas/perfil.js';
import { telaClasses } from '../src/cinzas/telas.js';

const memoria = new Map();
const armazenamento = {
  getItem: chave => memoria.get(chave),
  setItem: (chave, valor) => memoria.set(chave, valor)
};
const perfil = novoPerfil();
const app = Object.assign(Object.create(Aplicacao.prototype), {
  perfil, armazenamento, tela:'menu',
  abrir(tela){ this.tela=tela; },
  titulo(){ this.tela='menu'; },
  mostrarFase(fase,retomar){ this.jogo.carregar(fase,retomar); this.tela='jogando'; }
});
app.jogo=app.criarJogo(perfil);
app.agir('partir');
assert.equal(app.tela,'menu');
app.agir('novoJogo');
app.agir('confirmarClasse');
assert.equal(carregarPerfil(armazenamento).fase,1);

Object.assign(app.perfil,{ecos:95,liberada:4});
app.perfil.opcoes.som=false;
app.mostrarFase(4,false);
app.titulo();
const salvo=carregarPerfil(armazenamento);
app.agir('novoJogo');
assert.match(telaClasses(app.selecaoClasse),/Substituir jornada/);
app.voltar();
assert.deepEqual(carregarPerfil(armazenamento),salvo);
app.agir('partir');
assert.equal(app.jogo.fase.id,4);
assert.equal(app.perfil.ecos,95);

app.titulo();
app.agir('novoJogo');
app.agir('verClasse',{id:'ladino'});
app.agir('confirmarClasse');
const novo=carregarPerfil(armazenamento);
assert.deepEqual([novo.classe,novo.fase,novo.liberada,novo.ecos,novo.opcoes.som],['ladino',1,1,0,false]);
assert(novo.revisao>salvo.revisao);
console.log('Menu verificado: primeiro jogo, cancelamento, retomada e substituição do save.');
