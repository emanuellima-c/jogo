// Gerado a partir de src/dados/poderes.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/dados/poderes.js", function (exports, usar) {
"use strict";
const RARIDADES = {
  comum: { nome: 'Comum', peso: 55, cor: '#b4ceb0' },
  rara: { nome: 'Rara', peso: 28, cor: '#73c4ff' },
  epica: { nome: 'Épica', peso: 13, cor: '#cd9aff' },
  lendaria: { nome: 'Lendária', peso: 4, cor: '#ffce70' }
};
const PODERES = [
  { id: 'vigor', nome: 'Coração da selva', raridade: 'comum', icone: '♥', descricao: '+1 coração máximo por nível (até 10).' },
  { id: 'forca', nome: 'Punhos de pedra', raridade: 'comum', icone: '◆', descricao: '+15% de dano base por nível.' },
  { id: 'botas', nome: 'Passos de onça', raridade: 'comum', icone: '»', descricao: '+3,5% de velocidade por nível (limite: 375 px/s).' },
  { id: 'impulso', nome: 'Salto do macaco', raridade: 'comum', icone: '↑', descricao: '+2,5% de impulso por nível (limite: 760 px/s).' },
  { id: 'alcance', nome: 'Braços de cipó', raridade: 'comum', icone: '⌁', descricao: '+8 pixels de alcance e +22 de atração de itens por nível.' },
  { id: 'ritmo', nome: 'Ritmo selvagem', raridade: 'comum', icone: '≋', descricao: 'Ataques mais rápidos a cada nível (intervalo mínimo: 0,17 s).' },
  { id: 'critico', nome: 'Olhar de águia', raridade: 'rara', icone: '✧', descricao: '+8% de chance crítica por nível. Críticos causam dano duplo (até 60%).' },
  { id: 'duplo', nome: 'Asas de folha', raridade: 'rara', icone: '↟', descricao: 'Libera um salto no ar. No nível 4, libera dois saltos no ar.' },
  { id: 'escudo', nome: 'Casca protetora', raridade: 'rara', icone: '⬡', descricao: 'Escudo que absorve um golpe e recarrega. Cada nível reduz a recarga.' },
  { id: 'sangue', nome: 'Seiva vital', raridade: 'rara', icone: '✚', descricao: 'Recupera um coração a cada 7 eliminações. Cada nível reduz o requisito, até 2.' },
  { id: 'onda', nome: 'Lâmina do vento', raridade: 'epica', icone: '➤', descricao: 'Seu ataque dispara uma lâmina à distância. Níveis aumentam dano e perfuração.' },
  { id: 'espinhos', nome: 'Armadura de espinhos', raridade: 'epica', icone: '✹', descricao: 'Inimigos próximos recebem retaliação quando você sofre dano. Melhora por nível.' },
  { id: 'sombra', nome: 'Passagem sombria', raridade: 'epica', icone: '↠', descricao: 'A esquiva causa dano e recarrega mais rápido. Melhora a cada nível.' },
  { id: 'fenix', nome: 'Espírito da fênix', raridade: 'lendaria', icone: '☀', descricao: 'Evita uma morte por fase e recupera 2 corações. A cada 4 níveis, ganha uma carga extra.' },
  { id: 'tempestade', nome: 'Coração da tempestade', raridade: 'lendaria', icone: 'ϟ', descricao: 'A cada 4 ataques acertados, um raio atinge inimigos próximos. Níveis reduzem o intervalo.' },
  { id: 'furia', nome: 'Fúria ancestral', raridade: 'lendaria', icone: '♛', descricao: '+30% de dano por nível enquanto estiver com metade dos corações ou menos.' }
];
const PODER_POR_ID = Object.fromEntries(PODERES.map(p => [p.id, p]));

Object.defineProperty(exports, "RARIDADES", { enumerable: true, get: () => RARIDADES });
Object.defineProperty(exports, "PODERES", { enumerable: true, get: () => PODERES });
Object.defineProperty(exports, "PODER_POR_ID", { enumerable: true, get: () => PODER_POR_ID });
});
