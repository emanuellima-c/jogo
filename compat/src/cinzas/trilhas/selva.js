// Gerado a partir de src/cinzas/trilhas/selva.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/trilhas/selva.js", function (exports, usar) {
"use strict";
// Veja a legenda das tuplas em ../trilhas.js.
const PLANTAS_SELVA=[
{
  nome:'Trilha dos Brotos', subtitulo:'A primeira vigília', marca:'Raízes de mangue diante da queda-d’água',
  ambientes:[['rancho',165,34,'vento',1],['remanso',57,68,'vento',-1]],
  momento:['prainha',34,'Travessia da maré','Leia as bandeirolas antes de seguir a jangada.'],
  trilha:[
    ['rancho',0,210,217,'terra'],['raiz',28,86,197,'terra'],['ninho',36,128,172,'terra'],
    ['foz',38,116,196,'madeira'],['vigilia',23,184,208,'terra'],['vau',37,70,188,'pedra'],
    ['sombra',30,120,165,'terra'],['figueira',41,137,190,'terra'],['arco',37,126,208,'pedra'],
    ['prainha',34,88,187,'pedra'],['jangada',42,70,179,'movel',11,0,3.9,.45],['ilhota',41,142,196,'terra'],
    ['remanso',30,133,207,'terra'],['esteira',36,59,195,'fragil'],['barranco',39,142,205,'terra'],
    ['copado',34,164,182,'terra'],['tronco',35,78,159,'madeira'],['terreiro',37,200,186,'terra'],
    ['soleira',35,92,205,'pedra'],['portal',32,128,186,'pedra']
  ],
  desvios:[
    ['ninho','Semente da copa',[[-31,-36,53,'madeira'],[-73,-74,39,'madeira']]],
    ['sombra','Olho do beija-flor',[[40,-30,42,'madeira'],[0,-65,39,'madeira'],[-48,-91,33,'terra']]],
    ['copado','Luz da várzea',[[41,-33,46,'fragil'],[82,-69,34,'madeira'],[33,-101,33,'terra']]]
  ],
  // Os apoios da figueira ainda recebem sessões e manchas de ecos da trilha original.
  auxiliares:[
    ['relicario-folha','s1-2',-156,-19,120,'terra'],
    ['galho-baixo','figueira',79,-35,41,'madeira'],['galho-medio','figueira',126,-71,32,'pedra'],
    ['galho-alto','figueira',75,-98,35,'terra']
  ],
  espinhos:[['barranco',58,-8,22]],
  ecos:[['rancho',194,-12],['raiz',8,-26],['vigilia',141,-13,2],['sombra',12,-20],['s2-2',16,-12,2],
    ['galho-alto',17,-14,2],['prainha',55,-15],['soleira',43,-13]],
  inimigos:[
    ['vigia','vigia','vigilia',103,28,'Vigia dos brotos',true],['remador','lanceiro','figueira',74,24,'Remador de casca'],
    ['martim','voador','ilhota',83,22,'Martim-pescador da ilhota'],['pescador','escavador','copado',68,24,'Escavador da várzea'],
    ['sentinela','vigia','terreiro',114,39,'Sentinela das raízes',true]
  ,
    ['vigilia-verde','mini','relicario-folha',67,29,'Vigia da Copa',false,0,'dente-do-vigia']],
  portas:[['vigilia',173,'vigia'],['terreiro',189,'sentinela']],
  santuarios:[['vau','vigilia',25,'Braseiro das raízes'],['remanso','remanso',35,'Braseiro do remanso']],
  atalhos:[['cipo','figueira',25,'foz',18,'Cipó trançado']],
  dicas:[
    ['rancho',165,'Observe as folhas. A faixa de vento aponta a direção da rajada.'],
    ['s1-2',20,'A clareira alta à esquerda esconde um mini-chefe e uma relíquia.'],
    ['rancho',8,'Interaja com a chama para marcar o retorno e encher os frascos.'],['rancho',174,'Segure o salto para alcançar a raiz iluminada.'],
    ['ninho',20,'O ninho acima guarda uma estrela. Volte pelas folhas.'],['foz',25,'O vigia ergue o braço antes do talho. Ataque quando ele recolher a lâmina.'],
    ['vigilia',23,'Esquive no instante do brilho. Deixe o vigor voltar antes de atacar.'],
    ['prainha',53,'Espere a jangada se aproximar e salte dela para a ilhota.'],
    ['ilhota',28,'O pássaro recolhe as asas antes do rasante. Reaja em terra firme.'],
    ['remanso',88,'A esteira racha após o pouso. Salte para o barranco antes que ela ceda.'],
    ['barranco',28,'Salte por cima das pontas. No próximo trecho, os galhos da direita levam à Luz da várzea.']
  ]
},
{
  nome:'Passagem dos Cipós',subtitulo:'A distância da lança',marca:'Estacas alagadas e a casa suspensa',
  ambientes:[['cais',166,31,'vento',1]],
  momento:['taboa',136,'A balsa do contrapeso','O cais alto dá tempo para acompanhar a balsa.'],
  trilha:[
    ['cais',0,204,190,'madeira'],['estaca',42,53,169,'madeira'],['mirante',46,117,153,'terra'],
    ['aterro',49,200,182,'terra'],['pilastra',42,66,211,'pedra'],['ribanceira',41,159,229,'terra'],
    ['vara',51,65,202,'madeira'],['clareira',48,157,184,'terra'],['poste',42,64,161,'madeira'],['saida',35,124,182,'terra'],
    ['taboa',38,156,204,'terra'],['contrapeso',43,68,183,'movel',0,12,4.3,.85],['cabeceira',43,74,160,'pedra'],
    ['balsa',37,64,174,'fragil'],['estaleiro',37,122,193,'terra'],['estrado',36,112,168,'madeira'],
    ['palafita',31,180,188,'terra'],['cepo',38,69,173,'pedra'],['tablado',38,71,185,'fragil'],
    ['enseada',41,218,199,'terra'],['foz',39,133,179,'terra']
  ],
  desvios:[
    ['mirante','Casulo de linho',[[-37,-34,47,'madeira'],[-94,-69,35,'madeira'],[-55,-93,30,'pedra']]],
    ['ribanceira','Agulha do brejo',[[47,-35,47,'terra'],[7,-77,40,'madeira'],[-52,-104,28,'madeira']]],
    ['palafita','Selo do arpoador',[[30,-33,47,'movel',0,7,3.4,1],[83,-68,39,'fragil'],[34,-99,33,'pedra']]]
  ],
  auxiliares:[['viga-baixa','clareira',92,-37,48,'madeira'],['viga-alta','clareira',153,-77,31,'pedra']],
  espinhos:[['estrado',47,-8,24],['tablado',12,27,45]],
  ecos:[['estaca',29,-19],['aterro',20,-12],['vara',24,-22],['s2-2',18,-12,2],['poste',33,-13,2],
    ['viga-alta',15,-13,2],['cabeceira',32,-16],['cepo',37,-13]],
  inimigos:[
    ['arpao','lanceiro','aterro',118,32,'Sentinela do arpão',true],['espora','vigia','clareira',94,34,'Guardião dos cipós'],
    ['vespa','voador','taboa',89,23,'Vespa do brejo'],['canoeiro','cuspidor','palafita',71,28,'Semeador da palafita'],
    ['arpoador','lanceiro','enseada',123,39,'Arpoador da enseada',true]
  ],
  portas:[['aterro',189,'arpao'],['enseada',207,'arpoador']],
  santuarios:[['brejo','ribanceira',39,'Lume do brejo'],['estaleiro','estaleiro',31,'Lume do estaleiro']],
  atalhos:[['polia','clareira',28,'mirante',18,'Polia da canoa']],
  dicas:[
    ['mirante',36,'Da beira você vê onde pousar e até onde a lança alcança.'],['aterro',7,'O lanceiro recolhe a haste depois da estocada. Essa é sua abertura.'],
    ['taboa',131,'Salte quando o contrapeso baixar. Do alto dele, alcance a pedra seguinte.'],
    ['cabeceira',37,'A balsa racha sob os pés. Salte assim que pousar para alcançar o estaleiro.'],
    ['estaleiro',84,'Pouse antes das pontas do estrado. Depois, salte por cima delas.'],
    ['palafita',105,'Suba pela prancha móvel e pela tábua rachada para chegar ao Selo do arpoador.'],
    ['cepo',32,'Pouse na ponte e salte logo para a enseada. A madeira cede sobre os espinhos.']
  ]
},
{
  nome:'Engenhos das Presas',subtitulo:'O ritmo das roldanas',marca:'Guindastes de cipó na cachoeira',
  ambientes:[['represa',66,58,'vento',1]],
  momento:['represa',36,'Cadência das comportas','Use a margem firme para ler o ciclo das duas roldanas.'],
  inimigosCiclo:[['ciclo-engenho','escavador','represa',112,24,'Escavador da segunda chama']],
  trilha:[
    ['oficina',0,215,211,'terra'],['varanda',32,118,190,'madeira'],['cambao',50,64,181,'movel',16,0,4.2,0],
    ['moinho',49,144,165,'pedra'],['peso',54,65,177,'movel',0,15,3.8,1.3],['represa',48,148,191,'terra'],
    ['balanca',49,61,165,'movel',17,0,4.9,2.2],['quilha',44,115,148,'madeira'],['jusante',56,135,186,'terra'],
    ['porta',37,126,202,'pedra']
  ],
  desvios:[
    ['varanda','Engrenagem de orvalho',[[33,-35,48,'madeira'],[-12,-75,36,'pedra']]],
    ['moinho','Dente da roldana',[[-43,-32,48,'movel',11,0,3.8,.4],[-94,-69,33,'movel',0,6,3,1],[ -47,-99,32,'madeira']]],
    ['jusante','Íris do vertedouro',[[34,-30,43,'madeira'],[89,-66,38,'movel',8,0,3.3,1],[48,-98,34,'metal']]]
  ],
  ecos:[['varanda',105,-15],['cambao',34,-17],['represa',19,-13,2],['quilha',26,-15],['s2-1',23,-11,2]],
  inimigos:[['machado','cuspidor','moinho',83,20,'Arremessador de cobre'],['levante','voador','quilha',56,40,'Cigarra de roda',true]],
  portas:[['jusante',77,'levante']],santuarios:[['casa','represa',42,'Braseiro das comportas']],
  atalhos:[['contrapeso','jusante',40,'varanda',24,'Contrapeso de tronco']],
  dicas:[['varanda',28,'Observe a corda passar pela marca clara antes de saltar.'],['represa',48,'A próxima balança corre na horizontal. Espere a volta da polia.']]
}
];

Object.defineProperty(exports, "PLANTAS_SELVA", { enumerable: true, get: () => PLANTAS_SELVA });
});
