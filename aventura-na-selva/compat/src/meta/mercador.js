// Gerado a partir de src/meta/mercador.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/meta/mercador.js", function (exports, usar) {
"use strict";
const { estatisticas } = usar("src/meta/progressao.js");
const { PROVAS } = usar("src/meta/puzzles.js");
const MERCADOR = { nome: 'Bento do Cipó', titulo: 'Mercador e guardião dos caminhos',
  falas: ['Uma pausa também faz parte da aventura.', 'Moedas guardadas, viagem preparada!', 'Os melhores movimentos começam com uma descoberta.', 'Minhas provas não cobram moedas. Pode tentar de novo!'] };
const PRODUTOS = [
  { id:'vida', nome:'Vida extra', icone:'♥', preco:25, descricao:'Recupera um coração agora.' },
  { id:'escudo', nome:'Escudo de casca', icone:'⬡', preco:45, descricao:'Absorve o próximo golpe. Continua ativo na próxima fase.' },
  { id:'ima', nome:'Ímã de moedas', icone:'✧', preco:55, descricao:'Atrai moedas por 60 segundos de jogo. Congela no descanso e nos menus.' },
  { id:'pulo', nome:'Pulo mais alto', icone:'↑', preco:65, melhoria:true, descricao:'+2,5% de impulso permanente por nível. Limite: 760 px/s.' },
  { id:'velocidade', nome:'Passos velozes', icone:'»', preco:75, melhoria:true, descricao:'+3% de velocidade permanente por nível. Limite: 375 px/s.' },
  { id:'resistencia', nome:'Resistência', icone:'◆', preco:95, melhoria:true, descricao:'+1 coração máximo e +0,12 s de proteção após dano. Máximo de 10 corações.' }
];
function precoProduto(perfil, id) {
  const produto = PRODUTOS.find(p => p.id === id);
  if (!produto) return Infinity;
  return produto.melhoria ? Math.ceil(produto.preco * 1.6 ** (perfil.melhorias[id] || 0)) : produto.preco;
}
function podeTreinar(perfil, id) {
  const prova = PROVAS[id]; if (!prova) return false;
  return perfil.aprendidas[id] || perfil.concluidas.slice(0, prova.fase).every(Boolean);
}
/** Valida antes de descontar. Uma compra recusada nunca muda o saldo. */
function comprarProduto(perfil, id, vidasAtuais, escudoAtivo = false) {
  const produto = PRODUTOS.find(p => p.id === id), a = estatisticas(perfil);
  if (!produto) return { ok:false, mensagem:'Esse produto não existe.' };
  if (id === 'vida' && vidasAtuais >= a.coracoes) return { ok:false, mensagem:'Seus corações já estão completos.' };
  if (id === 'escudo' && (escudoAtivo || perfil.consumiveis.escudo)) return { ok:false, mensagem:'Você já está protegido por um escudo.' };
  if (id === 'ima' && perfil.consumiveis.ima >= 120) return { ok:false, mensagem:'Seu ímã já tem dois minutos de carga.' };
  if (id === 'pulo' && a.impulso >= 760 || id === 'velocidade' && a.velocidade >= 375 || id === 'resistencia' && a.coracoes >= 10) return { ok:false, mensagem:'Você já alcançou o limite desse atributo.' };
  const preco = precoProduto(perfil,id);
  if (perfil.moedas < preco) return { ok:false, mensagem:'Faltam ' + (preco - perfil.moedas) + ' moedas. Explore mais uma trilha!' };
  perfil.moedas -= preco;
  if (produto.melhoria) perfil.melhorias[id]++;
  else if (id === 'escudo') perfil.consumiveis.escudo = true;
  else if (id === 'ima') perfil.consumiveis.ima = Math.min(120,perfil.consumiveis.ima + 60);
  return { ok:true, curar: id === 'vida' ? 1 : 0, mensagem:'Negócio fechado! ' + produto.nome + '.' };
}

Object.defineProperty(exports, "MERCADOR", { enumerable: true, get: () => MERCADOR });
Object.defineProperty(exports, "PRODUTOS", { enumerable: true, get: () => PRODUTOS });
Object.defineProperty(exports, "precoProduto", { enumerable: true, get: () => precoProduto });
Object.defineProperty(exports, "podeTreinar", { enumerable: true, get: () => podeTreinar });
Object.defineProperty(exports, "comprarProduto", { enumerable: true, get: () => comprarProduto });
});
