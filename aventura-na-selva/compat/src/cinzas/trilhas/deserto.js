// Gerado a partir de src/cinzas/trilhas/deserto.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/trilhas/deserto.js", function (exports, usar) {
"use strict";
// Veja a legenda das tuplas em ../trilhas.js.
const PLANTAS_DESERTO=[
{
  nome:'Dunas de Âmbar',subtitulo:'A face do escudo',marca:'Sentinelas calcificadas no cânion',
  ambientes:[['acampamento',153,41,'areia',0]],
  momento:['arena',55,'A teia sob os pés','O círculo da seda marca a área que vai prender seus passos.'],
  trilha:[
    ['acampamento',0,210,211,'terra'],['limiar',43,88,191,'pedra'],['mesa',45,155,171,'terra'],
    ['fosso',37,181,205,'terra'],['trono',42,186,177,'pedra'],['dente',31,65,150,'pedra'],
    ['guarita',46,148,172,'terra'],['arena',27,294,197,'pedra'],['sela',42,125,176,'terra']
  ],
  desvios:[
    ['mesa','Placa de nácar',[[39,-31,48,'terra'],[1,-69,35,'pedra'],[-57,-96,29,'metal']]],
    ['trono','Sol do avesso',[[-35,-34,45,'madeira'],[-94,-68,38,'pedra'],[-50,-97,32,'terra']]],
    ['guarita','Aro da tecedeira',[[41,-36,45,'metal'],[94,-74,35,'madeira'],[53,-102,32,'pedra']]]
  ],
  espinhos:[['fosso',124,-8,18]],
  ecos:[['limiar',54,-16],['trono',17,-15],['dente',31,-18,2],['s1-2',16,-13,2],['sela',67,-14]],
  inimigos:[['porta','escudo','trono',105,44,'Tatu de bronze',true],
    ['espora','areeiro','fosso',48,21,'Areeiro da duna'],['matriarca','chefe','arena',188,68,'Matriarca das Ruínas',true]],
  portas:[['trono',176,'porta'],['arena',283,'matriarca']],santuarios:[['nicho','guarita',98,'Oratório de areia']],
  atalhos:[['roldana','guarita',32,'mesa',29,'Roldana dos escudos']],
  dicas:[
    ['acampamento',153,'A poeira avisa quando a areia vai agarrar seus passos.'],['mesa',42,'A entrada pelo alto deixa as costas do escudeiro expostas.'],['trono',12,'O escudo frontal cede ao pesado ou se abre quando a estocada termina.'],
    ['guarita',80,'A matriarca marca o chão antes de avançar. Aguarde o recolher das patas.']]
},
{
  nome:'Cisternas do Oásis',subtitulo:'Duas rodas de água',marca:'Rodas de cobre num reservatório subterrâneo',
  ambientes:[['observatorio',17,70,'areia',0]],
  momento:['observatorio',100,'As rodas desencontradas','Espere o ponto em que as duas rodas se aproximam.'],
  inimigosCiclo:[['ciclo-cobre','areeiro','comporta',67,27,'Areeiro da segunda chama']],
  auxiliares:[['relicario-ambar','s2-3',-154,-21,121,'pedra']],
  trilha:[
    ['refugio',0,209,222,'terra'],['respiro',36,82,197,'pedra'],['observatorio',42,139,172,'pedra'],
    ['rodaA',50,60,171,'movel',13,0,4.7,.3],['rodaB',47,63,159,'movel',0,11,3.2,2.2],
    ['tanque',48,189,182,'pedra'],['bica',47,77,210,'metal'],['rodaC',48,60,199,'movel',12,0,3.9,1.4],
    ['laje',47,137,179,'pedra'],['comporta',36,134,198,'pedra']
  ],
  desvios:[
    ['observatorio','Marca do sextante',[[-35,-35,44,'metal'],[-93,-68,38,'movel',9,0,4.4,.3],[-48,-97,31,'pedra']]],
    ['tanque','Gota de cobre',[[37,-32,46,'movel',0,6,3.2,2.3],[90,-65,37,'movel',10,0,4.9,.7],[45,-95,31,'metal']]],
    ['laje','Chave da maré',[[42,-36,39,'madeira'],[-2,-74,32,'metal'],[-48,-100,28,'pedra']]]
  ],
  ecos:[['respiro',51,-22],['observatorio',119,-14],['rodaA',27,-15],['tanque',32,-16,2],['laje',74,-15],['s2-2',15,-12,2]],
  inimigos:[['fiscal','lanceiro','tanque',129,31,'Fiscal das águas',true],['bico','miragem','laje',75,36,'Miragem da cisterna'],
    ['vigia-ambar','mini','relicario-ambar',68,29,'Sentinela do Fosso',false,0,'garra-do-fosso']],
  portas:[['tanque',179,'fiscal']],santuarios:[['reserva','tanque',27,'Câmara da reserva']],
  atalhos:[['canal','laje',24,'observatorio',24,'Carro do canal']],
  dicas:[
    ['s2-3',15,'O patamar de âmbar fica além da roda, à esquerda.'],['observatorio',42,'A roda lateral cruza a vertical. Espere aqui e veja as duas voltarem.'],
    ['tanque',11,'Pouse no recuo de pedra. O fiscal guarda a outra margem.']]
},
{
  nome:'Pontes do Titã',subtitulo:'O desfiladeiro suspenso',marca:'Passadiços de corda entre fósseis gigantes',
  ambientes:[['planalto',42,36,'areia',0]],
  momento:['costela',18,'A costura dos fósseis','Apoie-se no osso largo antes de saltar da ponte frágil.'],
  trilha:[
    ['cordoaria',0,217,208,'terra'],['crista',39,114,179,'pedra'],['passarela',34,80,178,'fragil'],
    ['campana',36,168,196,'terra'],['costela',45,76,168,'pedra'],['junta',39,64,155,'fragil'],
    ['cranio',42,157,176,'pedra'],['medula',45,72,193,'fragil'],['planalto',36,179,214,'terra'],['selo',47,123,189,'pedra']
  ],
  desvios:[
    ['crista','Nó da primeira corda',[[39,-31,42,'fragil'],[ -8,-69,34,'madeira'],[-52,-96,29,'terra']]],
    ['cranio','Dente de âmbar',[[-30,-36,38,'metal'],[-85,-66,31,'fragil'],[-42,-99,25,'pedra']]],
    ['planalto','Insígnia do funâmbulo',[[40,-36,40,'madeira'],[98,-72,31,'movel',6,0,3.3,0],[52,-99,27,'metal']]]
  ],
  espinhos:[['passarela',15,28,47],['medula',12,23,40],['planalto',90,-8,19]],
  ecos:[['passarela',38,-14],['campana',18,-15],['costela',32,-19],['cranio',21,-16,2],['s2-2',11,-12,2]],
  inimigos:[['vigia','vigia','campana',103,39,'Guarda da primeira ponte',true],['vara','areeiro','cranio',91,44,'Tecelão de areia'],
    ['espada','escudo','planalto',132,24,'Escudo do leito']],
  portas:[['campana',157,'vigia']],santuarios:[['osso','cranio',28,'Fogo da costela']],
  atalhos:[['trena','planalto',34,'crista',23,'Trenó das cordas']],
  dicas:[['crista',51,'O patrulheiro volta até o osso claro. Atravesse quando ele se afastar.'],
    ['costela',28,'A próxima ponte se desfaz em direção à pedra larga.']]
}
];

Object.defineProperty(exports, "PLANTAS_DESERTO", { enumerable: true, get: () => PLANTAS_DESERTO });
});
