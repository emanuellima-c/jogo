// Gerado a partir de src/cinzas/ajustes.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/ajustes.js", function (exports, usar) {
"use strict";
// Tempos em segundos e medidas em pixels do mundo. As três janelas de um golpe são consecutivas.
const BALANCO = {
  passo: 1/60, vazio: 326,
  movimento: { velocidade:128, impulso:268, gravidade:620, queda:355, aceleracao:1150, freio:1390,
    coyote:.115, buffer:.14, corte:.59, largura:14, altura:26 },
  vida: { base:100, porNivel:3, bonusMaximo:21, protecao:.67, danoEspinhos:17, duracaoDano:.22, frascos:2, cura:48 },
  vigor: { maximo:100, porSegundo:34, repouso:.43, fila:.15 },
  esquiva: { custo:23, preparo:.04, impacto:.18, recuperacao:.11, velocidade:216, janelaRetorno:.76 },
  golpe: {
    leve:     { vigor:14, preparo:.105, impacto:.105, recuperacao:.195, dano:19, alcance:23, altura:7 },
    pesado:   { vigor:29, preparo:.295, impacto:.145, recuperacao:.37,  dano:34, alcance:31, altura:10 },
    cura:     { vigor:0,  preparo:.61,  impacto:.07,  recuperacao:.29 },
    retorno:  { vigor:19, preparo:.055, impacto:.13,  recuperacao:.22,  dano:40, alcance:32, altura:9 },
    quebra:   { vigor:31, preparo:.42,  impacto:.14,  recuperacao:.43,  dano:42, alcance:33, altura:12, cargaMax:.82 },
    aparo:    { vigor:17, preparo:.055, impacto:.15,  recuperacao:.36 },
    estocada: { vigor:25, preparo:.15,  impacto:.17,  recuperacao:.36,  dano:32, alcance:39, altura:7, avanco:184 },
    pisada:   { vigor:28, preparo:.1,   impacto:.7,   recuperacao:.43,  dano:40, alcance:43, altura:19, queda:448 },
    eco:      { vigor:18, preparo:.025, impacto:.12,  recuperacao:.07,  avanco:218 }
  },
  combate: { bonusRecuperacao:1.25, bonusAberto:1.4, danoGuarda:.18, postura:1.3, abertura:.88, danoPorNivel:.021, bonusNivelMaximo:.16,
    guardaChefeLeve:.30, guardaChefePesado:.62, guardaTransicao:.15 },
  ambiente: { avisoPonte:.82, voltaPonte:3.15, alcanceInteracao:25, alcanceItem:14, alcanceEstrela:13 },
  premio: { estrela:2, xpEstrela:7, fimFase:3, xpFim:21, xpBase:84, xpPorNivel:27 },
  dificuldade: { relaxado:{dano:.75,aviso:1.18},normal:{dano:1,aviso:1},desafio:{dano:1.25,aviso:.91} }
};
const TECNICAS = [
  {id:'retorno',nome:'Corte de Retorno',preco:8,fase:1,comando:'Técnica logo após esquiva precisa',efeito:'Um corte veloz de 40 de dano. A abertura dura 0,76 s após esquivar no impacto.'},
  {id:'aparo',nome:'Aparo de Ferro',preco:14,fase:2,comando:'Técnica antes do impacto',efeito:'A lâmina desvia durante 0,15 s e abre a defesa. Golpes com marca vermelha atravessam o aparo.'},
  {id:'quebra',nome:'Quebra-Guarda',preco:22,fase:3,comando:'Segure a técnica e solte',efeito:'Carrega diante do alvo, rompe a guarda frontal e o expõe. A recuperação permite um contra-ataque inimigo se errar.'},
  {id:'estocada',nome:'Estocada da Aurora',preco:38,fase:5,comando:'Técnica na direção do alvo',efeito:'Avança com a ponta da lâmina. Tem alcance longo e 0,36 s de recuperação.'},
  {id:'pisada',nome:'Pisada Sísmica',preco:58,fase:7,comando:'Técnica durante o salto',efeito:'Desce sobre o chão, interrompe inimigos leves e rompe lajes de selo dourado. Recupera-se ao pousar.'},
  {id:'eco',nome:'Passo do Eco',preco:72,fase:9,comando:'Técnica no ar + direção',efeito:'Desliza uma vez por salto. A carga retorna ao pousar e o corpo permanece vulnerável.'}
].map(t=>({...t,vigor:BALANCO.golpe[t.id].vigor}));

const TIPOS = {
  vigia:    {w:16,h:24,vida:35,dano:12,vel:16,alcance:26,visao:57,ecos:2,xp:6},
  lanceiro: {w:16,h:28,vida:45,dano:16,vel:15,alcance:47,visao:78,ecos:3,xp:8},
  voador:   {w:18,h:14,vida:28,dano:12,vel:15,alcance:58,visao:70,ecos:2,xp:6},
  escudo:   {w:20,h:26,vida:57,dano:17,vel:13,alcance:33,visao:59,ecos:3,xp:9},
  elite:    {w:24,h:32,vida:85,dano:18,vel:17,alcance:48,visao:79,ecos:5,xp:14},
  chefe:    {w:36,h:32,vida:118,dano:20,vel:17,alcance:50,visao:91,ecos:8,xp:22},
  boneco:   {w:18,h:27,vida:180,dano:0,vel:0,alcance:31,visao:55,ecos:0,xp:0}
};
// Golpes horizontais usam alcance a partir da borda do corpo. O tempo de aviso precede todo impacto.
const GOLPES_INIMIGOS = {
  corte:{nome:'Talho',aviso:.67,impacto:.17,recupera:.84,alcance:25,altura:7},
  estocada:{nome:'Ponta longa',aviso:.78,impacto:.2,recupera:.93,alcance:43,altura:5,avanco:38},
  mergulho:{nome:'Rasante',aviso:.76,impacto:.36,recupera:1.1,alcance:11,altura:5},
  varredura:{nome:'Varredura',aviso:.81,impacto:.23,recupera:.95,alcance:37,altura:9,avanco:23},
  martelo:{nome:'Abalo',aviso:1.06,impacto:.2,recupera:1.16,alcance:35,altura:14,imparavel:true},
  onda:{nome:'Onda de pedra',aviso:1.11,impacto:.19,recupera:1.15,alcance:22,altura:7,onda:88,imparavel:true},
  investida:{nome:'Investida',aviso:.83,impacto:.31,recupera:.98,alcance:21,altura:8,avanco:117},
  duplo:{nome:'Talho duplo',aviso:.78,impacto:.50,recupera:1.08,alcance:32,altura:10,avanco:24},
  teia:{nome:'Fio de seda',aviso:.96,impacto:.22,recupera:1.06,alcance:22,altura:6,onda:99}
};
const GUARDIOES = {
  4: {w:36,h:28,vida:116,normal:['corte','investida'],furia:['investida','duplo','martelo']},
  7: {w:40,h:30,vida:138,normal:['estocada','teia'],furia:['teia','investida','varredura']},
  10:{w:32,h:38,vida:164,normal:['estocada','onda','corte'],furia:['investida','onda','duplo']},
  12:{w:34,h:42,vida:182,normal:['varredura','martelo'],furia:['onda','martelo','estocada']},
  15:{w:38,h:40,vida:244,normal:['investida','corte','martelo'],furia:['duplo','onda','investida','martelo']}
};
Object.defineProperty(exports, "BALANCO", { enumerable: true, get: () => BALANCO });
Object.defineProperty(exports, "TECNICAS", { enumerable: true, get: () => TECNICAS });
Object.defineProperty(exports, "TIPOS", { enumerable: true, get: () => TIPOS });
Object.defineProperty(exports, "GOLPES_INIMIGOS", { enumerable: true, get: () => GOLPES_INIMIGOS });
Object.defineProperty(exports, "GUARDIOES", { enumerable: true, get: () => GUARDIOES });
});
