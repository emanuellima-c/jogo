// Gerado a partir de src/entidades/inimigos/fabrica.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/entidades/inimigos/fabrica.js", function (exports, usar) {
"use strict";
const { criarJogador } = usar("src/entidades/jogador.js");
const { DADOS_INIMIGOS, VARIANTES } = usar("src/dados/inimigos.js");
function criarInimigoVazio() {
  const e = criarJogador(0, 0);
  Object.assign(e, { ativo: false, id: 0, tipo: 'macaco', dados: null, vida: 0, vidaMaxima: 0,
    estado: 'patrulha', espera: 0, idade: 0, alerta: 0, recarga: 0, invulneravel: 0,
    ancoraX: 0, ancoraY: 0, ultimoGolpe: -1, direcaoAtaque: 1, mergulhando: false, origem: true });
  return e;
}
function ativarInimigo(e, tipo, x, y, fase, ciclo, seed = 0, origem = true) {
  const d = DADOS_INIMIGOS[tipo], t = e.transformacao;
  if (!d) throw new Error('Inimigo desconhecido: ' + tipo);
  const variante=VARIANTES[Math.max(0,Math.min(4,Math.floor((fase-1)/3)))];
  e.nome=variante.nomes[tipo]||d.nome;e.cor=variante.cor||d.cor;
  e.ativo = true; e.tipo = tipo; e.dados = d; e.origem = origem;
  t.largura = d.largura; t.altura = d.altura;
  t.x = t.anteriorX = x; t.y = t.anteriorY = ['aranha','besouro','piranha'].includes(tipo) ? y : y - d.altura;
  e.ancoraX = x; e.ancoraY = t.y; e.idade = (seed % 100) / 17;
  e.corpo.vx = e.corpo.vy = 0; e.corpo.noChao = false; e.controle.direcao = seed % 2 ? -1 : 1;
  e.vida = e.vidaMaxima = Math.ceil(d.vida * (1 + (fase - 1) * .055 + (ciclo - 1) * .28));
  e.estado = 'patrulha'; e.espera = 0; e.alerta = 0; e.recarga = 1; e.invulneravel = 0; e.ultimoGolpe = -1; e.mergulhando = false;
}

Object.defineProperty(exports, "criarInimigoVazio", { enumerable: true, get: () => criarInimigoVazio });
Object.defineProperty(exports, "ativarInimigo", { enumerable: true, get: () => ativarInimigo });
});
