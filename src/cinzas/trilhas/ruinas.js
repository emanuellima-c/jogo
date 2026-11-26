// Veja a legenda das tuplas em ../trilhas.js.
const PLANTAS_RUINAS=[
{
  nome:'Cidade de Aurora',subtitulo:'O juramento das pontes',marca:'Pontes da cidadela do Rei das Presas',
  ambientes:[['alcova',158,43,'corrente',1]],
  momento:['arena',64,'A coroa partida','Perto dos contrafortes, a investida pode expor o rei.'],
  trilha:[
    ['alcova',0,219,202,'pedra'],['lajes',41,105,183,'pedra'],['costura',31,63,182,'fragil'],
    ['patio',33,153,200,'pedra'],['arame',44,164,221,'terra'],['vigota',35,62,204,'fragil'],
    ['agulha',35,71,181,'metal'],['antecoro',42,155,163,'pedra'],['arena',24,295,188,'pedra'],['torre',36,127,168,'pedra']
  ],
  desvios:[
    ['lajes','Vidro da sacada',[[40,-35,47,'madeira'],[0,-76,39,'pedra']]],
    ['patio','Sinete rachado',[[-41,-35,43,'fragil'],[-96,-70,36,'madeira'],[-55,-102,31,'pedra']]],
    ['antecoro','Presa de âmbar',[[32,-32,43,'metal'],[80,-69,34,'fragil'],[38,-99,32,'metal']]]
  ],
  espinhos:[['arame',79,-8,22],['vigota',12,31,40]],
  ecos:[['lajes',96,-15],['arame',103,-32,2],['agulha',33,-21],['s2-1',20,-13,2],['torre',67,-15,2]],
  inimigos:[['beco','ressonante','patio',82,23,'Eco do pátio'],['presas','chefe','arena',194,72,'Rei das Presas',true]],
  portas:[['arena',285,'presas']],santuarios:[['portico','antecoro',102,'Oratório da coroa']],
  atalhos:[['guincho','antecoro',27,'patio',25,'Guincho de bronze']],
  dicas:[
    ['alcova',158,'A faixa azul marca a água rasa. A corrente empurra na direção das setas.'],['lajes',30,'As costuras amarelas tremem antes de a ponte ceder.'],['patio',60,'Olhe as pontas no chão da rua seguinte. A luz vermelha marca o lançamento.'],
    ['antecoro',78,'O rei baixa a cabeça para investir. A roseta rubra anuncia um golpe impossível de aparar.']]
},
{
  nome:'Templo dos Ecos',subtitulo:'As três respostas da pedra',marca:'Lua minguante, aqueduto partido e cristais de quartzo',
  ambientes:[['oratorio',34,59,'corrente',1]],
  momento:['oratorio',26,'As três respostas','Para a estrela, siga a agulha. Para a relíquia, suba até o relicário do cristal.'],
  auxiliares:[['relicario-cristal','s1-3',-155,-18,122,'pedra']],
  trilha:[
    ['vestibulo',0,216,219,'pedra'],['degrau',34,70,192,'pedra'],['oratorio',38,121,167,'pedra'],
    ['cadencia',55,57,154,'movel',12,0,4.5,0],['tambor',47,150,178,'pedra'],['coro',36,66,158,'fragil'],
    ['pedestal',40,68,143,'pedra'],['nave',44,169,167,'pedra'],['badalo',53,59,180,'movel',0,13,3.8,.5],
    ['eco',41,65,182,'fragil'],['abside',40,164,202,'pedra'],['selo',39,130,178,'pedra']
  ],
  desvios:[
    ['oratorio','Agulha da Lua',[[-24,-35,35,'metal'],[-77,-74,27,'pedra'],[-29,-101,29,'pedra']]],
    ['tambor','Pulso das Naves',[[29,-34,52,'movel',0,7,4.3,.6],[86,-69,40,'movel',12,0,3.4,2.6],[44,-101,33,'metal']]],
    ['abside','Acorde do Cristal',[[-29,-35,43,'fragil'],[-82,-68,42,'movel',9,0,3.7,1.1],[-32,-100,29,'pedra']]]
  ],
  espinhos:[['coro',6,20,50],['badalo',60,52,34]],
  ecos:[['degrau',34,-14],['cadencia',28,-14,2],['pedestal',26,-16],['abside',13,-13],['s2-2',17,-12,2]],
  inimigos:[['salmista','ressonante','tambor',108,19,'Salmista de cristal'],
    ['asa','voador','nave',92,45,'Mariposa do eco',true],['prisma','voador','abside',60,31,'Vespa de quartzo',false,51],
    ['cristal-cantor','mini','relicario-cristal',67,30,'Coroa de Cristal',false,0,'asa-de-cristal']],
  portas:[['nave',159,'asa']],santuarios:[['nave','nave',26,'Lume da nave central']],
  atalhos:[['ressonador','abside',124,'oratorio',25,'Elevador de contracanto']],
  dicas:[
    ['s1-3',14,'No patamar à esquerda, o cristal cantor guarda uma relíquia.'],['oratorio',26,'Suba pelas três agulhas à esquerda para encontrar a marca lunar.'],['oratorio',75,'A primeira laje móvel se alinha com o recorte no arco.'],
    ['tambor',28,'O piso de âmbar racha sob os pés. O pedestal ao fundo sustenta peso.'],['nave',36,'A mariposa recolhe as asas antes de mergulhar. Há espaço para esperar na nave.']]
},
{
  nome:'Campanário da Matriarca',subtitulo:'A subida do fio',marca:'Campanário entrelaçado por uma figueira',
  ambientes:[['fundicao',122,30,'corrente',-1]],
  momento:['sineira',94,'O cesto do sino maior','Solte a corda para abrir o retorno até a entrada.'],
  inimigosCiclo:[['ciclo-sino','sineiro','lanterna',52,23,'Repique da segunda chama']],
  trilha:[
    ['poco',0,213,235,'pedra'],['braço',35,79,207,'madeira'],['galeria',35,133,181,'pedra'],
    ['misula',38,64,153,'pedra'],['gaiola',44,65,138,'movel',0,13,4.4,2],['sineira',43,162,119,'pedra'],
    ['pala',41,84,146,'madeira'],['fundicao',45,162,173,'pedra'],['boca',43,72,148,'metal'],['lanterna',36,125,132,'pedra']
  ],
  desvios:[
    ['galeria','Conta da raiz',[[-32,-35,43,'madeira'],[-84,-70,32,'pedra'],[-36,-96,31,'metal']]],
    ['sineira','Lágrima de sino',[[30,-31,45,'madeira'],[83,-65,35,'metal']]],
    ['fundicao','Fio da abóbada',[[37,-31,45,'movel',8,0,3.3,.5],[88,-66,35,'madeira'],[49,-95,30,'metal']]]
  ],
  ecos:[['braço',30,-16],['misula',29,-18],['sineira',18,-16,2],['boca',33,-13],['s3-1',18,-13,2]],
  inimigos:[['vespa','voador','galeria',84,38,'Vespa de sino'],
    ['asa','voador','sineira',80,45,'Coruja da torre',true],['sineiro','sineiro','fundicao',95,28,'Sineiro oco']],
  portas:[['sineira',151,'asa']],santuarios:[['coroa','sineira',25,'Braseiro do sino maior']],
  atalhos:[['cesto','sineira',127,'poco',198,'Cesto do poço']],
  dicas:[['galeria',17,'Espere a vespa inclinar o corpo antes de deixar a galeria.'],['sineira',103,'Solte o cesto no topo. Ele liga esta plataforma à entrada da torre.']]
}
];

export { PLANTAS_RUINAS };
