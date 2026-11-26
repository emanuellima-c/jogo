// Ajuste aqui o ritmo da campanha. Unidades: pixels, segundos e pixels/segundo.
const CONFIG = Object.freeze({
  largura: 960, altura: 540, tile: 32,
  passo: 1 / 60, deltaMaximo: 0.1, subpassosMaximos: 6,
  gravidade: 1950, quedaMaxima: 880,
  aceleracao: 2850, atrito: 3400, velocidade: 288,
  impulso: 665, cortePulo: 0.50, coyote: 0.13, buffer: 0.15,
  larguraJogador: 24, alturaJogador: 38, folgaDano: 2, epsilon: 0.001, correcaoQuina: 4,
  vidasIniciais: 3, vidasMaximas: 5, invulnerabilidade: 1.65,
  moeda: 10, moedaDourada: 50, fruta: 25, inimigo: 100,
  margemQueda: 96, hitstop: 3 / 60,
  cameraSuavidade: 7.5, cameraAntecipacao: 0.24,
  cameraTrauma: 0.65, cameraDecaimento: 1.8, cameraTremor: 5,
  animacaoFrequencia: 11, animacaoRetorno: 16, animacaoVelocidadeMinima: 8,
  intervaloPiscada: 5.5, duracaoPiscada: .18,
  particulas: 88, poeiraPouso: 12, poeiraPulo: 5,
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
  atacar: 32, dash: 64, som: 128, um: 256, dois: 512, tres: 1024, interagir:2048, planar:4096,
  abaixo: 8192, pogo: 16384 });
const CAMPANHA = Object.freeze({
  inimigosMaximos: 96, projeteisMaximos: 128, textosMaximos: 40, celula: 128,
  duracaoAtaque: .18, duracaoAtaqueRapido: .12, bufferAtaque: .12, margemAtaque: 7, alcanceAereo: 12,
  golpesCombo: 3, janelaCombo: .35, intervaloComboRapido: .5, danoComboFinal: 1.5,
  empurraoGolpe: 140, empurraoComboFinal: 230, hitstopGolpe: 2 / 60, hitstopComboFinal: 4 / 60,
  velocidadePogo: 570, alcancePogo: 18, quiquePogo: 580, toleranciaPogo: 6, recargaPogoChefe: .35,
  toleranciaPisao: 16, toleranciaPisaoChefe: 20, danoPisaoChefe: 1.8,
  duracaoDash: .2, velocidadeDash: 560, invulnerabilidadeDash: .2,
  janelaDashPerfeito: .12, recargaDashPerfeito: .3, atordoamentoDashPerfeito: .8,
  particulasDashPerfeito: 14, corDashPerfeito: '#9befff',
  vidaProjetil: 4, velocidadeOnda: 540, velocidadeTiro: 270, quique: 510,
  alcanceVisao: 370, atordoamento: .18,
  velocidadeMergulhoBesouro: 230, quedaMergulhoBesouro: 170,
  periodoPiranha: 3.1, alturaSaltoPiranha: 220, oscilacaoPiranha: 20, limiteSubmersaoPiranha: 446,
  vidaChefe: 240, vidaPorMundo: 105, avisoChefe: 1.15, recuperacaoChefe: 1.18,
  bonusRecuperacaoChefe: 1.45, aereosParaGuarda: 2, fatorGuardaAlta: .35, limiteInvocados: 3, alcancePatrulha: 76,
  avisoBote: .72, avisoBesouro: .80, avisoOnca: .68, avisoTeia: .80,
  recuoDano: 118, saltoDano: 135, precoCura: 16, esperaPonte: .8,
  limiteEsquerdoChefe: 340, margemDireitaChefe: 150,
  checkpointCura: 1, xpEstrela: 25, xpFase: 100, xpPorFase: 20, xpChefe: 120,
  intervaloAutosave: 1, versao: '4.0.0'
});

export { CONFIG, ESTADOS, ACOES, CAMPANHA };
