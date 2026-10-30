// Gerado a partir de src/core/configuracoes.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/configuracoes.js", function (exports, usar) {
"use strict";
// Ajuste aqui o ritmo da campanha. Unidades: pixels, segundos e pixels/segundo.
const CONFIG = Object.freeze({
  largura: 960, altura: 540, tile: 32, dprMaximo: 2,
  passo: 1 / 60, deltaMaximo: 0.1, subpassosMaximos: 6,
  gravidade: 1950, quedaMaxima: 880,
  aceleracao: 2250, atrito: 2900, velocidade: 278,
  impulso: 650, cortePulo: 0.48, coyote: 0.1, buffer: 0.1,
  larguraJogador: 24, alturaJogador: 38, epsilon: 0.001, correcaoQuina: 4,
  vidasIniciais: 3, vidasMaximas: 5, invulnerabilidade: 1.5,
  moeda: 10, moedaDourada: 50, fruta: 25, inimigo: 100,
  margemQueda: 96, hitstop: 3 / 60,
  cameraSuavidade: 7.5, cameraAntecipacao: 0.24,
  cameraTrauma: 0.65, cameraDecaimento: 1.8, cameraTremor: 8,
  animacaoFrequencia: 11, animacaoRetorno: 16,
  particulas: 120, poeiraPouso: 12, poeiraPulo: 5,
  intervaloPoeira: 0.09, duracaoPoeira: 0.4, intervaloRastro: 0.06, duracaoRastro: 0.13,
  seed: 20261030, versaoSave: 1, chaveSave: 'aventura-selva-m1'
});
const ESTADOS = Object.freeze({
  MENU: 'MENU', JOGANDO: 'JOGANDO', PAUSADO: 'PAUSADO',
  FASE_CONCLUIDA: 'FASE_CONCLUIDA', FIM_DE_JOGO: 'FIM_DE_JOGO', VITORIA: 'VITORIA',
  MAPA: 'MAPA', PERSONAGEM: 'PERSONAGEM', DESAFIOS: 'DESAFIOS',
  RECOMPENSA: 'RECOMPENSA', LOJA:'LOJA', PUZZLE:'PUZZLE', SAIU:'SAIU', OPCOES: 'OPCOES', AJUDA: 'AJUDA'
});
const ACOES = Object.freeze({ esquerda: 1, direita: 2, pular: 4, pausa: 8, confirmar: 16,
  atacar: 32, dash: 64, som: 128, um: 256, dois: 512, tres: 1024, interagir:2048, planar:4096 });
const CAMPANHA = Object.freeze({
  inimigosMaximos: 96, projeteisMaximos: 128, textosMaximos: 40, celula: 128,
  duracaoAtaque: .18, duracaoDash: .2, velocidadeDash: 560, invulnerabilidadeDash: .2,
  vidaProjetil: 4, velocidadeOnda: 540, velocidadeTiro: 270, quique: 510,
  alcanceVisao: 370, avisoInimigo: .5, atordoamento: .18,
  vidaChefe: 650, vidaPorMundo: 180, avisoChefe: 1, recuperacaoChefe: .9,
  checkpointCura: 1, xpEstrela: 25, xpFase: 100, xpPorFase: 20, xpChefe: 120,
  intervaloAutosave: 1, versao: '2.0.0'
});

Object.defineProperty(exports, "CONFIG", { enumerable: true, get: () => CONFIG });
Object.defineProperty(exports, "ESTADOS", { enumerable: true, get: () => ESTADOS });
Object.defineProperty(exports, "ACOES", { enumerable: true, get: () => ACOES });
Object.defineProperty(exports, "CAMPANHA", { enumerable: true, get: () => CAMPANHA });
});
