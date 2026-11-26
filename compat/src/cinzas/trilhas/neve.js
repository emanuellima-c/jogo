// Gerado a partir de src/cinzas/trilhas/neve.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/trilhas/neve.js", function (exports, usar) {
"use strict";
// Veja a legenda das tuplas em ../trilhas.js.
const PLANTAS_NEVE=[
{
  nome:'Cidadela da Lua Clara',subtitulo:'O cerco das três torres',marca:'Fortificações cobertas pela primeira neve',
  ambientes:[['bastiao',27,58,'gelo',0]],
  momento:['tribunal',52,'A sentença do Titã','O trilho aceso alterna os lados da arena. Salte na descarga.'],
  trilha:[
    ['muro',0,208,229,'pedra'],['bastiao',36,115,203,'pedra'],['guincho',47,61,185,'movel',12,0,4.2,0],
    ['estrebaria',43,171,168,'pedra'],['ponte',40,63,153,'fragil'],['merlao',40,85,142,'pedra'],
    ['muralha',45,155,166,'pedra'],['antecamara',38,159,189,'metal'],['tribunal',26,306,201,'pedra'],
    ['aurora',40,135,178,'pedra']
  ],
  desvios:[
    ['bastiao','Fecho da torre baixa',[[34,-34,43,'madeira'],[86,-72,35,'metal'],[44,-100,29,'pedra']]],
    ['estrebaria','Bandeira do norte',[[-35,-34,44,'fragil'],[-87,-69,38,'pedra'],[-40,-97,32,'metal']]],
    ['muralha','Lente de prata',[[34,-31,44,'movel',0,7,3.6,.2],[90,-70,36,'metal'],[44,-100,31,'pedra']]]
  ],
  espinhos:[['merlao',74,20,28],['ponte',11,22,38]],
  ecos:[['bastiao',89,-15],['guincho',31,-16],['merlao',39,-17,2],['antecamara',23,-16],['s3-1',21,-13,2]],
  inimigos:[['campeao','escudo','estrebaria',105,35,'Cavaleiro da torre',true],['gralha','cristalino','muralha',87,33,'Vigia de cristal'],
    ['tita','chefe','tribunal',195,77,'Titã das Areias',true]],
  portas:[['estrebaria',160,'campeao'],['tribunal',295,'tita']],santuarios:[['tribuna','antecamara',111,'Vigília da tribuna']],
  atalhos:[['eclusa','antecamara',31,'bastiao',29,'Monta-cargas do cerco']],
  dicas:[
    ['bastiao',32,'A faixa clara escorrega. Comece a frear antes da borda.'],['bastiao',41,'Do portão até a tribuna se repetem três lições: transferir, quebrar a guarda e cruzar.'],
    ['antecamara',68,'A chama da tribuna fica antes da arena. Os trilhos acendem quando o Titã entra na segunda vigília.']]
},
{
  nome:'Pontes da Geada',subtitulo:'Os dentes de gelo',marca:'Pináculos azuis com lajes de xisto',
  ambientes:[['selim',9,36,'gelo',0]],
  momento:['selim',35,'A varanda escondida','Do último dente, o Passo do Eco alcança o balcão de gelo.'],
  inimigosCiclo:[['ciclo-gelo','cristalino','mirante',52,24,'Cristal da segunda chama']],
  trilha:[
    ['alpendre',0,210,219,'pedra'],['unha',42,65,193,'pedra'],['pinha',46,88,169,'pedra'],
    ['mandibula',43,58,144,'metal'],['selim',50,134,165,'pedra'],['espora',54,61,193,'pedra'],
    ['mesa',47,130,214,'pedra'],['quilha',45,65,188,'madeira'],['pico',45,86,162,'pedra'],['mirante',46,133,181,'pedra']
  ],
  desvios:[
    ['pinha','Coroa da agulha',[[31,-32,38,'metal'],[85,-69,29,'pedra'],[43,-97,27,'metal']]],
    ['selim','Pólen de neve',[[-33,-33,36,'pedra'],[-90,-68,27,'madeira'],[-44,-98,24,'metal']]],
    ['mesa','Safira do talude',[[41,-34,42,'pedra'],[90,-72,32,'movel',6,0,3.9,.2],[49,-101,28,'madeira']]]
  ],
  segredos:[{tecnica:'eco',origem:'s2-3',destino:'varanda-eco'}],
  auxiliares:[
    ['relicario-neve','s1-3',-151,-19,119,'pedra'],['varanda-eco','s2-3',167,-2,39,'metal']],
  espinhos:[['mandibula',63,20,22],['espora',63,28,24]],
  ecos:[['unha',28,-14],['mandibula',30,-15],['espora',26,-16,2],['quilha',32,-14],['s2-2',11,-12,2],['varanda-eco',19,-13,4]],
  inimigos:[['ronda','patinador','selim',83,24,'Patinador da nevasca'],['asa','voador','mesa',77,32,'Coruja de quartzo',true],
    ['vigia-neve','mini','relicario-neve',66,29,'Coruja do Relicário',false,0,'olho-da-geada']],
  portas:[['mesa',120,'asa']],santuarios:[['nicho','mesa',20,'Nicho entre pináculos']],
  atalhos:[['cunha','pico',40,'pinha',19,'Cunha do alpinista']],
  dicas:[
    ['s1-3',14,'Escondido à esquerda, o relicário da geada merece um desvio.'],['unha',27,'As marcas claras nas pontas indicam o início das superfícies.'],
    ['selim',28,'Pelo alto, as agulhas levam a uma estrela. Do último dente, o Passo do Eco alcança a varanda azul.']]
},
{
  nome:'Claustro da Geada',subtitulo:'O silêncio entre batidas',marca:'Arcos de gelo e neve no claustro',
  ambientes:[['celas',150,44,'gelo',0]],
  momento:['atrium',45,'Coro de estilhaços','Escolha a faixa livre entre as marcas antes da queda.'],
  trilha:[
    ['celas',0,209,199,'pedra'],['claustro',39,103,174,'pedra'],['canto',46,183,191,'pedra'],
    ['lancil',43,70,167,'metal'],['cimbre',42,137,140,'pedra'],['nave',52,179,166,'pedra'],
    ['baixio',44,87,201,'madeira'],['oratorio',35,164,216,'pedra'],['atrium',25,295,193,'pedra'],['coroa',41,124,170,'pedra']
  ],
  desvios:[
    ['claustro','Vela do vitral',[[-30,-35,43,'pedra'],[-83,-69,35,'metal'],[-40,-99,30,'madeira']]],
    ['nave','Pena de aurora',[[38,-33,43,'madeira'],[93,-68,34,'movel',7,0,3.4,1.2],[44,-101,31,'metal']]],
    ['oratorio','Lágrima do colosso',[[40,-37,43,'metal'],[-5,-73,36,'pedra'],[-55,-99,31,'fragil']]]
  ],
  ecos:[['claustro',75,-19],['canto',20,-14],['lancil',39,-16],['nave',17,-12,2],['s2-1',18,-13,2]],
  inimigos:[['lanca','cristalino','canto',107,28,'Porteiro da neve'],['asa','voador','cimbre',73,32,'Vigia de plumas'],
    ['penacho','voador','nave',45,24,'Corvo das janelas',false,46],['escudo','escudo','nave',116,29,'Escudo do claustro',true],['geada','chefe','atrium',184,66,'Guardião da Geada',true]],
  portas:[['nave',168,'escudo'],['atrium',284,'geada']],santuarios:[['capela','oratorio',109,'Chama do coro']],
  atalhos:[['rosario','oratorio',29,'claustro',24,'Corda do rosário']],
  dicas:[['canto',26,'A lança alcança o pátio. A criatura alada ronda o teto seguinte.'],['cimbre',28,'Recue uma laje para chamar apenas uma ameaça.'],
    ['oratorio',74,'O guardião bate o chão, recolhe os punhos e revela a junta de gelo.']]
}
];

Object.defineProperty(exports, "PLANTAS_NEVE", { enumerable: true, get: () => PLANTAS_NEVE });
});
