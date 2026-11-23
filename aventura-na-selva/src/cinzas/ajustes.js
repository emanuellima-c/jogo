// Tempos em segundos e medidas em pixels do mundo. As três janelas de um golpe são consecutivas.
const BALANCO = {
  passo: 1/60, vazio: 326,
  movimento: { velocidade:128, impulso:268, gravidade:620, queda:355, aceleracao:1150, freio:1390,
    coyote:.115, buffer:.14, corte:.59, largura:14, altura:26 },
  vida: { base:100, porNivel:3, bonusMaximo:21, danoEspinhos:17, duracaoDano:.22, frascos:2 },
  vigor: { maximo:100, fila:.15 },
  esquiva: { custo:23, preparo:.04, impacto:.18, recuperacao:.11, velocidade:216, janelaRetorno:.76 },
  golpe: {
    leve:     { vigor:14, preparo:.105, impacto:.105, recuperacao:.195, dano:19, alcance:23, altura:7 },
    pesado:   { vigor:29, preparo:.295, impacto:.145, recuperacao:.37,  dano:34, alcance:31, altura:10 },
    cura:     { vigor:0,  preparo:.61,  impacto:.07,  recuperacao:.29 },
    retorno:  { vigor:19, preparo:.055, impacto:.13,  recuperacao:.22,  dano:40, alcance:32, altura:9,
      escala:{destreza:'A',forca:'C'}, requisitos:{destreza:11} },
    quebra:   { vigor:31, preparo:.42,  impacto:.14,  recuperacao:.43,  dano:42, alcance:33, altura:12, cargaMax:.82,
      escala:{forca:'S',equilibrio:'C'}, requisitos:{forca:12} },
    aparo:    { vigor:17, preparo:.055, impacto:.15,  recuperacao:.36,
      escala:{equilibrio:'B',destreza:'C'}, requisitos:{equilibrio:10,destreza:9} },
    estocada: { vigor:25, preparo:.15,  impacto:.17,  recuperacao:.36,  dano:32, alcance:39, altura:7, avanco:184,
      escala:{destreza:'A',forca:'C'}, requisitos:{destreza:12} },
    pisada:   { vigor:28, preparo:.1,   impacto:.7,   recuperacao:.43,  dano:40, alcance:43, altura:19, queda:448,
      escala:{forca:'B',equilibrio:'A'}, requisitos:{forca:11,equilibrio:12} },
    eco:      { vigor:18, preparo:.025, impacto:.12,  recuperacao:.07,  avanco:218,
      escala:{destreza:'B',intelecto:'C'}, requisitos:{destreza:11,intelecto:10} }
  },
  combate: { bonusRecuperacao:1.25, bonusAberto:1.4, danoGuarda:.18, postura:1.3, abertura:.88, danoPorNivel:.021, bonusNivelMaximo:.16,
    guardaChefeLeve:.30, guardaChefePesado:.62, guardaTransicao:.15 },
  ambiente: { avisoPonte:.82, voltaPonte:3.15, alcanceInteracao:25, alcanceItem:14, alcanceEstrela:13 },
  premio: { estrela:2, xpEstrela:7, fimFase:3, xpFim:21, xpBase:84, xpPorNivel:27 },
  dificuldade: {
    relaxado: {dano:.75,aviso:1.18,variacaoAviso:0,cura:48,preparoFrasco:.61,protecaoAposDano:.67,elasticidade:.32,piso:-3,nivelBase:-3,
      regeneracaoVigor:34,atrasoVigor:.43,recuperacaoPatrulha:1,pausaPatrulha:.4},
    normal: {dano:1,aviso:1,variacaoAviso:.12,cura:36,preparoFrasco:.65,protecaoAposDano:.56,elasticidade:.58,piso:0,nivelBase:0,
      regeneracaoVigor:30,atrasoVigor:.49,recuperacaoPatrulha:.76,pausaPatrulha:.20,
      combo:{aCada:3,recuperacao:.43},grupo:{raio:124,altura:64,distanciaFlanco:24,velocidadeFlanco:2.8}},
    desafio: {dano:1.3,aviso:.91,variacaoAviso:.15,cura:28,preparoFrasco:.71,protecaoAposDano:.49,elasticidade:.65,piso:3,nivelBase:3,
      regeneracaoVigor:26,atrasoVigor:.59,recuperacaoPatrulha:.82,pausaPatrulha:.24,
      combo:{aCada:2,recuperacao:.36},grupo:{raio:130,altura:70,distanciaFlanco:26,velocidadeFlanco:2.5}}
  }
};

function dificuldadeDoPerfil(perfil){
  return BALANCO.dificuldade[perfil.opcoes?.modo]??BALANCO.dificuldade.normal;
}

const MINIMO_ATRIBUTO = 8;
const MAXIMO_ATRIBUTO = 60;
const NIVEL_MAXIMO = 99;
const ATRIBUTOS = Object.freeze({
  vitalidade:{nome:'Vitalidade',descricao:'Aumenta a vida máxima.',limites:[16,26]},
  folego:{nome:'Fôlego',descricao:'Aumenta o vigor máximo e a regeneração de vigor.',limites:[16,25]},
  forca:{nome:'Força',descricao:'Fortalece golpes e gravuras com escala de força.',limites:[18,30]},
  destreza:{nome:'Destreza',descricao:'Reduz o custo da esquiva e fortalece golpes com escala de destreza.',limites:[18,30]},
  intelecto:{nome:'Intelecto',descricao:'Fortalece golpes arcanos e de fogo e ajuda a recuperar Foco.',limites:[18,30]},
  fe:{nome:'Fé',descricao:'Fortalece golpes sagrados e de fogo e melhora a cura do frasco.',limites:[18,30]},
  equilibrio:{nome:'Equilíbrio',descricao:'Reduz dano e recuo. A postura sustenta um ataque diante de impactos leves.',limites:[16,24]}
});
const atributosMinimos = Object.freeze(Object.fromEntries(Object.keys(ATRIBUTOS).map(chave=>[chave,MINIMO_ATRIBUTO])));
const ESCALA_DANO = Object.freeze({E:.24,D:.46,C:.66,B:.86,A:1.06,S:1.26});
const CINZA_REFAZER = Object.freeze({preco:60,fase:7,estoque:1});

const CURVA_FASES = Object.freeze(Object.fromEntries([
  [0,3,7], [0,5,10], [1,6,11], [3,8,13], [4,9,14], [5,10,15],
  [6,12,18], [7,13,19], [8,14,20], [9,15,21], [10,16,22], [11,17,23],
  [12,18,24], [13,19,25], [15,21,27]
].map(([piso,nivelAlvo,teto],i)=>[i+1,Object.freeze({piso,nivelAlvo,teto,nivelBase:nivelAlvo})])));

const TIPOS_DANO = Object.freeze({
  fisico:{nome:'Físico'}, fogo:{nome:'Fogo'}, arcano:{nome:'Arcano'}, sagrado:{nome:'Sagrado'}
});
function resistencias(fisico=0,fogo=0,arcano=0,sagrado=0){
  return Object.freeze({fisico,fogo,arcano,sagrado});
}
const RESISTENCIAS_NEUTRAS = resistencias();

// Um ponto acima de 8 em qualquer atributo conta como um nível inicial.
// Os tempos de cada golpe indicam preparo, impacto e recuperação, em segundos.
const CLASSES = Object.freeze({
  cavaleiro: {
    id:'cavaleiro',nome:'Cavaleiro',estilo:'Escudo e contragolpe',dificuldade:'Acolhedora',
    descricao:'Levante a guarda diante de golpes aparáveis e responda com um corte. Vestes pesadas amortecem golpes leves.',
    vidaBase:125,vigorBase:106,velocidade:.94,cor:'#cdd1de',
    atributosIniciais:{...atributosMinimos,vitalidade:12,folego:9,forca:11,equilibrio:11},
    atributosSugeridos:['vitalidade','forca','equilibrio'],
    leve:{nome:'Talho da guarda',vigor:13,preparo:.126,impacto:.115,recuperacao:.184,dano:21,alcance:24,altura:8,escala:{forca:'C',destreza:'D'}},
    pesado:{nome:'Golpe de escudo',vigor:28,preparo:.305,impacto:.145,recuperacao:.38,dano:37,alcance:30,altura:14,escala:{forca:'B',equilibrio:'D'}},
    talento:{tipo:'guarda',nome:'Guarda firme',descricao:'Segure para bloquear golpes aparáveis à frente. Acertar um golpe logo após o bloqueio causa mais dano.',
      segurar:true,vigorPorSegundo:8,vigorImpacto:12,vigorPorDano:.20,janelaContra:.85,bonusContra:.40},
    armaduraLeve:16,reducaoLeve:.18
  },
  guerreiro: {
    id:'guerreiro',nome:'Guerreiro',estilo:'Machado e Fúria',dificuldade:'Moderada',
    descricao:'Encadeie golpes pesados acertados para aumentar o dano e recuperar-se mais cedo. Um erro encerra a cadeia.',
    vidaBase:110,vigorBase:122,velocidade:1,cor:'#f0a471',
    atributosIniciais:{...atributosMinimos,vitalidade:9,folego:12,forca:12,destreza:9},
    atributosSugeridos:['forca','folego','vitalidade'],
    leve:{nome:'Corte de machado',vigor:15,preparo:.12,impacto:.10,recuperacao:.19,dano:20,alcance:23,altura:9,escala:{forca:'B'}},
    pesado:{nome:'Machado em arco',vigor:26,preparo:.258,impacto:.16,recuperacao:.34,dano:39,alcance:32,altura:13,escala:{forca:'A'}},
    recurso:{tipo:'furia',nome:'Fúria',maximo:3,inicial:0,duracao:3.4,bonusPorPonto:.14,recuperacaoPorPonto:.025}
  },
  ladino: {
    id:'ladino',nome:'Ladino',estilo:'Adagas e flanqueio',dificuldade:'Exigente',
    descricao:'Passe ao flanco com uma esquiva barata. Golpes pelas costas ou na recuperação causam críticos e rendem um eco ao vencer o alvo.',
    vidaBase:91,vigorBase:109,velocidade:1.075,cor:'#c8a3df',
    atributosIniciais:{...atributosMinimos,folego:11,destreza:14},
    atributosSugeridos:['destreza','folego','vitalidade'],
    leve:{nome:'Agulha de cipó',vigor:10,preparo:.071,impacto:.088,recuperacao:.155,dano:17,alcance:17,altura:7,escala:{destreza:'B'}},
    pesado:{nome:'Duas adagas',vigor:22,preparo:.188,impacto:.123,recuperacao:.263,dano:30,alcance:23,altura:10,escala:{destreza:'A'}},
    esquiva:{...BALANCO.esquiva,custo:17,preparo:.035,impacto:.205,recuperacao:.10,velocidade:232},
    critico:{multiplicador:1.38,ecos:1}
  },
  piromante: {
    id:'piromante',nome:'Piromante',estilo:'Fogo em área',dificuldade:'Moderada',
    descricao:'O fogo atinge dos dois lados. Ataques leves recuperam Chama, e o pesado fortalece a queimadura quando há Chama disponível.',
    vidaBase:104,vigorBase:105,velocidade:1,cor:'#ffad80',
    atributosIniciais:{...atributosMinimos,vitalidade:9,folego:10,intelecto:11,fe:11},
    atributosSugeridos:['intelecto','fe','folego'],
    leve:{nome:'Língua de brasa',vigor:13,preparo:.146,impacto:.103,recuperacao:.175,dano:18,alcance:23,altura:10,
      radial:true,tipoDano:'fogo',concedeRecurso:1,escala:{intelecto:'C',fe:'D'}},
    pesado:{nome:'Forja de chão',vigor:27,preparo:.27,impacto:.14,recuperacao:.34,dano:36,alcance:36,altura:13,
      radial:true,tipoDano:'fogo',recurso:2,queimadura:{dano:3,pulsos:3,intervalo:.36},escala:{intelecto:'B',fe:'C'},
      semRecurso:{vigor:25,preparo:.29,impacto:.13,recuperacao:.34,dano:32,alcance:28,altura:13,radial:true,tipoDano:'fogo',escala:{intelecto:'B',fe:'C'}}},
    talento:{tipo:'sopro',nome:'Sopro da fornalha',descricao:'Consuma 3 Chamas para incendiar os arredores. Se errar por completo, a chama de retorno causa 8 de dano.',
      segurar:false,vigor:16,recurso:3,risco:8,preparo:.255,impacto:.15,recuperacao:.32,dano:37,alcance:42,altura:16,
      radial:true,tipoDano:'fogo',queimadura:{dano:4,pulsos:3,intervalo:.36},escala:{intelecto:'A',fe:'D'}},
    recurso:{tipo:'chama',nome:'Chama',maximo:6,inicial:4}
  },
  feiticeiro: {
    id:'feiticeiro',nome:'Feiticeiro',estilo:'Distância e proteção arcana',dificuldade:'Exigente',
    descricao:'Gaste Foco para disparar de longe e recarregue ao recuar. Sem Foco, ataque de perto com o cajado.',
    vidaBase:92,vigorBase:102,velocidade:1,cor:'#98c9ff',
    atributosIniciais:{...atributosMinimos,folego:9,destreza:9,intelecto:15},
    atributosSugeridos:['intelecto','folego','vitalidade'],
    leve:{nome:'Centelha arcana',vigor:12,preparo:.16,impacto:.10,recuperacao:.22,dano:21,alcance:132,altura:6,
      recurso:1,tipoDano:'arcano',escala:{intelecto:'B'},
      projetil:{tipo:'arcano',velocidade:192,alcance:132,largura:12,altura:6},
      semRecurso:{vigor:12,preparo:.10,impacto:.10,recuperacao:.18,dano:18,alcance:23,altura:8,escala:{forca:'E',intelecto:'D'}}},
    pesado:{nome:'Dardo de Aurora',vigor:25,preparo:.268,impacto:.11,recuperacao:.32,dano:38,alcance:175,altura:9,
      recurso:2,tipoDano:'arcano',escala:{intelecto:'A'},
      projetil:{tipo:'arcano-forte',velocidade:227,alcance:175,largura:16,altura:9},
      semRecurso:{vigor:24,preparo:.27,impacto:.14,recuperacao:.33,dano:31,alcance:28,altura:10,escala:{forca:'D',intelecto:'D'}}},
    talento:{tipo:'barreira',nome:'Escudo arcano',descricao:'Use 3 de Foco para absorver um golpe aparável por até 2 segundos.',
      segurar:false,vigor:13,recurso:3,preparo:.145,impacto:.07,recuperacao:.20,duracaoBarreira:2,escala:{intelecto:'B'}},
    esquiva:{...BALANCO.esquiva,custo:21,preparo:.035,velocidade:225},
    recurso:{tipo:'foco',nome:'Foco',maximo:6,inicial:6,regeneracao:1.05}
  },
  clerigo: {
    id:'clerigo',nome:'Clérigo',estilo:'Martelo, cura e proteção',dificuldade:'Moderada',
    descricao:'Ataques que tocam o alvo e aparos bem-sucedidos restauram Fé. Use-a para fazer uma prece de abrigo.',
    vidaBase:113,vigorBase:106,velocidade:.98,cor:'#ffe3a6',
    atributosIniciais:{...atributosMinimos,vitalidade:10,forca:10,fe:13,equilibrio:9},
    atributosSugeridos:['fe','vitalidade','forca'],
    leve:{nome:'Martelo ascendente',vigor:14,preparo:.137,impacto:.112,recuperacao:.21,dano:22,alcance:22,altura:15,
      tipoDano:'sagrado',concedeRecurso:1,escala:{fe:'B',forca:'C'}},
    pesado:{nome:'Badalada de pedra',vigor:28,preparo:.315,impacto:.15,recuperacao:.31,dano:38,alcance:28,altura:16,
      tipoDano:'sagrado',concedeRecurso:1,escala:{fe:'A',forca:'C'}},
    talento:{tipo:'prece',nome:'Prece de abrigo',descricao:'Use 3 de Fé para recuperar 16 pontos de vida e absorver um golpe aparável por 1,8 segundo.',
      segurar:false,vigor:18,recurso:3,preparo:.38,impacto:.07,recuperacao:.25,cura:16,duracaoBarreira:1.8,escala:{fe:'A'}},
    recurso:{tipo:'fe',nome:'Fé',maximo:6,inicial:1,porAparo:2}
  },
  despojado: {
    id:'despojado',nome:'Despojado',estilo:'Armas simples e mais ecos',dificuldade:'Exigente',
    descricao:'Comece com todos os atributos no mínimo e lute com um bastão curto. Cada inimigo derrotado rende um eco adicional.',
    vidaBase:BALANCO.vida.base,vigorBase:BALANCO.vigor.maximo,velocidade:1,cor:'#d9b392',
    atributosIniciais:{...atributosMinimos},atributosSugeridos:['vitalidade','folego','forca'],
    leve:{nome:'Toque do bastão',vigor:14,preparo:.096,impacto:.10,recuperacao:.197,dano:19,alcance:20,altura:7,escala:{forca:'D',destreza:'D'}},
    pesado:{nome:'Bastão descendente',vigor:29,preparo:.285,impacto:.13,recuperacao:.37,dano:34,alcance:27,altura:13,escala:{forca:'C',destreza:'E'}},
    ecosExtra:1
  },
  herdeiro: {
    id:'herdeiro',nome:'Herdeiro',estilo:'Lâmina de Aurora',dificuldade:'Familiar',
    descricao:'Continue a jornada com os golpes e a esquiva da edição anterior.',
    vidaBase:BALANCO.vida.base,vigorBase:BALANCO.vigor.maximo,velocidade:1,cor:'#acd5af',
    atributosIniciais:{...atributosMinimos,vitalidade:9},atributosSugeridos:['vitalidade','folego','forca'],
    leve:{...BALANCO.golpe.leve,nome:'Corte da jornada',escala:{forca:'D',destreza:'D'}},
    pesado:{...BALANCO.golpe.pesado,nome:'Talho da jornada',escala:{forca:'B',destreza:'E'}}
  }
});

for(const classe of Object.values(CLASSES)){
  classe.nivelInicial=Object.values(classe.atributosIniciais).reduce((nivel,valor)=>nivel+valor-MINIMO_ATRIBUTO,0);
  Object.freeze(classe.atributosIniciais);
  Object.freeze(classe);
}

function classeDoPerfil(perfil){
  return Object.hasOwn(CLASSES,perfil?.classe)?CLASSES[perfil.classe]:CLASSES.herdeiro;
}

const TECNICAS = [
  {id:'retorno',nome:'Corte de Retorno',preco:8,fase:1,comando:'Técnica logo após esquiva precisa',efeito:'Um corte veloz de 40 de dano. A abertura dura 0,76 s após esquivar no impacto.'},
  {id:'aparo',nome:'Aparo de Ferro',preco:14,fase:2,comando:'Técnica antes do impacto',efeito:'A lâmina desvia durante 0,15 s e abre a defesa. Golpes com marca vermelha atravessam o aparo.'},
  {id:'quebra',nome:'Quebra-Guarda',preco:22,fase:3,comando:'Segure a técnica e solte',efeito:'Carrega diante do alvo, rompe a guarda frontal e o expõe. A recuperação permite um contra-ataque inimigo se errar.'},
  {id:'estocada',nome:'Estocada da Aurora',preco:38,fase:5,comando:'Técnica na direção do alvo',efeito:'Avança com a ponta da lâmina. Tem alcance longo e 0,36 s de recuperação.'},
  {id:'pisada',nome:'Pisada Sísmica',preco:58,fase:7,comando:'Técnica durante o salto',efeito:'Desce sobre o chão, interrompe inimigos leves e rompe lajes de selo dourado. Recupera-se ao pousar.'},
  {id:'eco',nome:'Passo do Eco',preco:72,fase:9,comando:'Técnica no ar + direção',efeito:'Desliza uma vez por salto. A carga retorna ao pousar e o corpo permanece vulnerável.'}
].map(t=>({...t,vigor:BALANCO.golpe[t.id].vigor}));

const TIPOS = {
  vigia:    {w:16,h:24,vida:35,dano:12,vel:16,alcance:26,visao:57,ecos:2,xp:6,encadeia:'corte',
    tipoDano:'fisico',resistencias:resistencias(0,-.08,.04)},
  lanceiro: {w:16,h:28,vida:45,dano:16,vel:15,alcance:47,visao:78,ecos:3,xp:8,encadeia:'corte',
    tipoDano:'fisico',resistencias:resistencias(.02,-.06)},
  voador:   {w:18,h:14,vida:28,dano:12,vel:15,alcance:58,visao:70,ecos:2,xp:6,
    tipoDano:'fisico',resistencias:resistencias(-.04,.04,-.13)},
  escudo:   {w:20,h:26,vida:57,dano:17,vel:13,alcance:33,visao:59,ecos:3,xp:9,encadeia:'corte',
    tipoDano:'fisico',resistencias:resistencias(.09,-.10,-.06,.07)},
  elite:    {w:24,h:32,vida:85,dano:18,vel:17,alcance:48,visao:79,ecos:5,xp:14,encadeia:'estocada',
    tipoDano:'fisico',resistencias:resistencias(.05,.01,.03,-.10)},
  chefe:    {w:36,h:32,vida:118,dano:20,vel:17,alcance:50,visao:91,ecos:8,xp:22,
    tipoDano:'fisico',resistencias:resistencias(.04)},
  boneco:   {w:18,h:27,vida:180,dano:0,vel:0,alcance:31,visao:55,ecos:0,xp:0,
    tipoDano:'fisico',resistencias:RESISTENCIAS_NEUTRAS},
  escavador:  {w:18,h:22,vida:37,dano:12,vel:14,visao:60,ecos:2,xp:6,arquetipo:'vigia',cor:'#92b67e',padrao:['raizes'],encadeia:'corte',
    tipoDano:'fisico',resistencias:resistencias(.04,-.16,.02)},
  cuspidor:   {w:15,h:25,vida:32,dano:11,vel:14,visao:92,ecos:2,xp:6,arquetipo:'lanceiro',cor:'#d9d67f',padrao:['semente'],
    tipoDano:'fisico',resistencias:resistencias(-.03,-.10,.09)},
  ressonante: {w:17,h:26,vida:44,dano:14,vel:14,visao:63,ecos:3,xp:8,arquetipo:'vigia',cor:'#c9a4e2',padrao:['imitar','repique'],
    tipoDano:'arcano',resistencias:resistencias(.03,.02,.15,-.14)},
  sineiro:    {w:20,h:29,vida:48,dano:15,vel:13,visao:61,ecos:3,xp:8,arquetipo:'escudo',cor:'#f0c17d',padrao:['repique','varredura'],encadeia:'varredura',
    tipoDano:'arcano',resistencias:resistencias(.07,0,.12,-.09)},
  miragem:    {w:17,h:25,vida:42,dano:14,vel:16,visao:63,ecos:3,xp:8,arquetipo:'lanceiro',cor:'#ead4a0',padrao:['flanco'],
    tipoDano:'arcano',resistencias:resistencias(-.02,.04,.13,-.10)},
  areeiro:    {w:18,h:25,vida:43,dano:13,vel:14,visao:72,ecos:3,xp:8,arquetipo:'vigia',cor:'#eac084',padrao:['areia','corte'],
    tipoDano:'fisico',resistencias:resistencias(.04,.07,-.11)},
  cristalino: {w:17,h:28,vida:44,dano:14,vel:14,visao:73,ecos:3,xp:8,arquetipo:'lanceiro',cor:'#bbdff2',padrao:['agulhas'],
    tipoDano:'arcano',resistencias:resistencias(.08,-.17,.08,-.035)},
  patinador:  {w:18,h:24,vida:43,dano:15,vel:15,visao:67,ecos:3,xp:8,arquetipo:'vigia',cor:'#a1f3ef',padrao:['lamina'],encadeia:'lamina',
    tipoDano:'fisico',resistencias:resistencias(.02,-.15,.02,.02)},
  fornalha:   {w:23,h:30,vida:55,dano:16,vel:14,visao:64,ecos:3,xp:9,arquetipo:'elite',cor:'#f8ae77',padrao:['salto','martelo'],encadeia:'martelo',
    tipoDano:'fogo',resistencias:resistencias(.08,.22,-.10,-.08)},
  fagulheiro: {w:18,h:14,vida:32,dano:12,vel:14,visao:90,ecos:2,xp:7,arquetipo:'voador',cor:'#ffa88f',padrao:['centelha','mergulho'],
    tipoDano:'fogo',resistencias:resistencias(.01,.18,-.12,-.04)},
  mini:       {w:26,h:30,vida:76,dano:16,vel:16,visao:62,ecos:5,xp:12,arquetipo:'elite',cor:'#e8b8f0',padrao:['varredura','investida'],
    tipoDano:'fisico',resistencias:resistencias(.04,.06,.04,-.05)}
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
  duplo:{nome:'Talho duplo',aviso:.78,impacto:.50,recupera:1.08,alcance:32,altura:10,avanco:24,janelas:[.16,.31]},
  teia:{nome:'Fio de seda',aviso:.96,impacto:.22,recupera:1.06,alcance:22,altura:6,onda:99},
  raizes:{nome:'Raiz irrompente',aviso:.87,impacto:.19,recupera:.86,alcance:20,altura:14,campo:'alvo',movimento:'emergir'},
  semente:{nome:'Semente veloz',aviso:.9,impacto:.18,recupera:.88,alcance:0,altura:5,onda:147,projetil:'semente',sinal:'linha'},
  repique:{nome:'Repique partido',aviso:.94,impacto:.48,recupera:1,alcance:27,altura:8,sinal:'repique',janelas:[.15,.28]},
  flanco:{nome:'Miragem de flanco',aviso:.97,impacto:.21,recupera:1,alcance:22,altura:13,campo:'flanco',movimento:'emergir'},
  areia:{nome:'Redemoinho de areia',aviso:1,impacto:.23,recupera:.9,alcance:25,altura:9,campo:'alvo',atrito:.54},
  agulhas:{nome:'Chuva de agulhas',aviso:.99,impacto:.22,recupera:.86,alcance:18,altura:44,campo:'alvo',sinal:'queda'},
  lamina:{nome:'Lâmina sobre o gelo',aviso:.86,impacto:.29,recupera:.96,alcance:19,altura:7,avanco:102,sinal:'trilho'},
  salto:{nome:'Salto de brasa',aviso:1.06,impacto:.40,recupera:1.1,alcance:26,altura:15,campo:'alvo',movimento:'salto',imparavel:true},
  centelha:{nome:'Centelha em arco',aviso:.88,impacto:.24,recupera:.92,alcance:0,altura:7,onda:106,projetil:'brasa',sinal:'linha',queda:76},
  contraforte:{nome:'Investida nos contrafortes',aviso:.98,impacto:.43,recupera:1.12,alcance:20,altura:8,avanco:176,sinal:'trilho',contraforte:true},
  seda:{nome:'Armadilha de seda',aviso:1.19,impacto:.21,recupera:1.16,alcance:32,altura:8,campo:'alvo',atrito:.52},
  trilho:{nome:'Trilho de arenito',aviso:1.25,impacto:.22,recupera:1.14,alcance:0,altura:10,campo:'faixa',sinal:'trilho',imparavel:true},
  fragmentos:{nome:'Colunas de estilhaços',aviso:1.3,impacto:.23,recupera:1.22,alcance:27,altura:63,campo:'duplo',sinal:'queda',imparavel:true},
  fornalhas:{nome:'Fornalhas do eclipse',aviso:1.36,impacto:.27,recupera:1.22,alcance:0,altura:18,campo:'fornalhas',sinal:'brasa',imparavel:true}
};
for(const golpe of Object.values(GOLPES_INIMIGOS)){
  golpe.limitesAviso=Object.freeze([Math.max(.45,golpe.aviso*.70),golpe.aviso*1.18]);
}
const GUARDIOES = {
  4: {w:36,h:28,vida:246,dano:32,postura:3,pausa:.18,ciclo:'repique',arena:'Contrafortes da coroa',
    tipoDano:'fisico',resistencias:resistencias(.02,-.10,0,.04),
    janela:{tecnica:'aparo',golpe:'contraforte',momento:'impacto',bonus:2.2,abertura:1.42,vigor:20},
    entrada:'Rei das Presas · Aparar abre a guarda. Esquive da investida perto dos contrafortes.',
    etapas:[
      {ate:1,nome:'Vigília',aviso:1.10,recuperacao:.94,padrao:['corte','investida','martelo']},
      {ate:.68,nome:'Coroa em marcha',aviso:1.05,padrao:['contraforte','onda','martelo']},
      {ate:.52,nome:'Coroa partida',aviso:1.03,recuperacao:.82,padrao:['contraforte','martelo','duplo','corte']}
    ]},
  7: {w:40,h:30,vida:237,dano:41,postura:3,pausa:.16,ciclo:'flanco',arena:'Tapete de seda',
    tipoDano:'fisico',resistencias:resistencias(0,-.12,.14,-.05),
    janela:{tecnica:'quebra',golpe:'seda',momento:'recuperacao',bonus:1.6},
    entrada:'Matriarca · Saia do círculo de seda antes que a trama feche. A Quebra-Guarda explora o recuo.',
    etapas:[
      {ate:1,nome:'Trama',aviso:1.03,padrao:['estocada','teia']},
      {ate:.68,nome:'Seda armada',aviso:.98,padrao:['seda','varredura']},
      {ate:.42,nome:'Ninho aberto',aviso:.95,padrao:['seda','onda','investida','teia']}
    ]},
  10:{w:32,h:38,vida:310,dano:40,postura:3,pausa:.15,ciclo:'areia',arena:'Trilhos do tribunal',
    tipoDano:'sagrado',resistencias:resistencias(.06,.07,-.12,-.07),
    janela:{tecnica:'estocada',golpe:'trilho',momento:'recuperacao',bonus:1.85},
    entrada:'Titã das Areias · O trilho acende antes da descarga. Salte; a Estocada alcança o Titã no recuo.',
    etapas:[
      {ate:1,nome:'Julgar',aviso:.97,padrao:['estocada','onda','corte']},
      {ate:.68,nome:'Tribunal em marcha',aviso:.91,padrao:['trilho','investida']},
      {ate:.42,nome:'Sentença',aviso:.87,padrao:['trilho','duplo','onda']}
    ]},
  12:{w:34,h:42,vida:320,dano:43,postura:4,pausa:.14,revelaComPisada:true,ciclo:'lamina',arena:'Coro dos estilhaços',
    tipoDano:'arcano',resistencias:resistencias(.065,-.18,.08),
    janela:{tecnica:'pisada',golpe:'fragmentos',momento:'recuperacao',bonus:1.65},
    entrada:'Guardião da Geada · Entre as marcas, o piso fica livre. A Pisada expõe a junta no recuo.',
    etapas:[
      {ate:1,nome:'Claustro',aviso:.96,padrao:['martelo','varredura','onda']},
      {ate:.68,nome:'Coro estilhaçado',aviso:.90,padrao:['fragmentos','estocada']},
      {ate:.42,nome:'Inverno aberto',aviso:.86,padrao:['fragmentos','duplo','martelo','onda']}
    ]},
  15:{w:38,h:40,vida:379,dano:43,postura:4,pausa:.13,ciclo:'salto',arena:'Fornalhas do eclipse',
    tipoDano:'fogo',resistencias:resistencias(.07,.15,-.07,-.10),
    janela:{tecnica:'eco',golpe:'fornalhas',momento:'impacto',bonus:2.65,abertura:1.8,vigor:32,antecedencia:.14,danoDireto:52},
    entrada:'Grande Gorila · A brasa toma o centro ou as bordas. Cruze para o piso apagado com salto e Passo do Eco.',
    etapas:[
      {ate:1,nome:'Eclipse',aviso:1.01,padrao:['investida','corte','martelo']},
      {ate:.75,nome:'Altar em brasa',aviso:.94,padrao:['fornalhas','onda','investida']},
      {ate:.54,nome:'Última chama',aviso:.90,recuperacao:.9,cobertura:.61,padrao:['fornalhas','martelo','onda','duplo']}
    ]}
};
export { ATRIBUTOS, BALANCO, CINZA_REFAZER, CLASSES, CURVA_FASES, ESCALA_DANO, GOLPES_INIMIGOS, GUARDIOES,
  MAXIMO_ATRIBUTO, MINIMO_ATRIBUTO, NIVEL_MAXIMO, RESISTENCIAS_NEUTRAS, TECNICAS, TIPOS, TIPOS_DANO,
  classeDoPerfil, dificuldadeDoPerfil };
