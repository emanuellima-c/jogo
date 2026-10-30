// Gerado a partir de src/dados/inimigos.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/dados/inimigos.js", function (exports, usar) {
"use strict";
const DADOS_INIMIGOS = {
  macaco: { nome: 'Macaco', vida: 28, velocidade: 58, largura: 28, altura: 30, xp: 18, cor: '#b97b47', pisa: true },
  cobra: { nome: 'Cobra', vida: 35, velocidade: 0, largura: 36, altura: 20, xp: 22, cor: '#a8cf68', pisa: false },
  aranha: { nome: 'Aranha', vida: 32, velocidade: 55, largura: 30, altura: 24, xp: 24, cor: '#c78dc3', pisa: false },
  besouro: { nome: 'Besouro', vida: 24, velocidade: 60, largura: 30, altura: 24, xp: 22, cor: '#65bbe0', pisa: true },
  onca: { nome: 'Onça', vida: 55, velocidade: 78, largura: 46, altura: 28, xp: 35, cor: '#e9b451', pisa: false },
  xama: { nome: 'Xamã', vida: 43, velocidade: 36, largura: 28, altura: 40, xp: 30, cor: '#a795e6', pisa: true },
  tatu: { nome: 'Tatu de pedra', vida: 72, velocidade: 40, largura: 38, altura: 28, xp: 32, cor: '#8b9b9b', pisa: false },
  piranha: { nome: 'Piranha', vida: 22, velocidade: 0, largura: 30, altura: 22, xp: 25, cor: '#f08472', pisa: false }
};
const CHEFES = [
  { nome: 'Rei das Presas', tipo: 'onca', cor: '#f8bc51', ataques: ['investida', 'salto', 'tremor'] },
  { nome: 'Matriarca das Ruínas', tipo: 'aranha', cor: '#cf8cd9', ataques: ['tiros', 'invocar', 'chuva'] },
  { nome: 'Titã das Areias', tipo: 'peixe', cor: '#69d8e2', ataques: ['salto', 'tiros', 'tremor'] },
  { nome: 'Guardião da Geada', tipo: 'pedra', cor: '#d0c39a', ataques: ['chuva', 'tremor', 'investida'] },
  { nome: 'Grande Gorila', tipo: 'gorila', cor: '#bd8c64', ataques: ['tiros', 'salto', 'tremor'] }
];

// Variantes originais por ambiente: mesma família de IA, aparência e identidade locais.
const VARIANTES = [
  {cor:null,nomes:{}},
  {cor:'#b9a5c3',nomes:{macaco:'Vigia das Colunas',cobra:'Serpente de Mármore',aranha:'Tecelã das Ruínas',besouro:'Escaravelho de Aurora',onca:'Guardião das Ruas',xama:'Oráculo do Templo',tatu:'Carapaça de Pedra',piranha:'Peixe das Cisternas'}},
  {cor:'#deb77a',nomes:{macaco:'Saltador das Dunas',cobra:'Víbora de Âmbar',aranha:'Tecelã da Areia',besouro:'Escaravelho das Dunas',onca:'Felino de Areia',xama:'Guardião do Oásis',tatu:'Tatu da Duna',piranha:'Peixe do Oásis'}},
  {cor:'#c6e8ef',nomes:{macaco:'Saltador da Geada',cobra:'Serpente de Gelo',aranha:'Tecelã de Neve',besouro:'Mariposa da Neve',onca:'Lince da Geada',xama:'Guardião da Aurora',tatu:'Tatu de Cristal',piranha:'Peixe da Geada'}},
  {cor:'#d78f7c',nomes:{macaco:'Macaco da Brasa',cobra:'Serpente de Magma',aranha:'Aranha de Cinzas',besouro:'Besouro de Obsidiana',onca:'Onça de Cinzas',xama:'Oráculo das Brasas',tatu:'Carapaça de Obsidiana',piranha:'Peixe de Lava'}}
];

Object.defineProperty(exports, "DADOS_INIMIGOS", { enumerable: true, get: () => DADOS_INIMIGOS });
Object.defineProperty(exports, "CHEFES", { enumerable: true, get: () => CHEFES });
Object.defineProperty(exports, "VARIANTES", { enumerable: true, get: () => VARIANTES });
});
