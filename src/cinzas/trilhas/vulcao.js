// Veja a legenda das tuplas em ../trilhas.js.
const PLANTAS_VULCAO=[
{
  nome:'Encosta da Brasa',subtitulo:'O fôlego dos fornos',marca:'Fornalhas escavadas no basalto',
  ambientes:[['forja',161,36,'vapor',0]],
  momento:['forno',139,'Câmara do forno','Pise com força no selo dourado para revelar a câmara.'],
  trilha:[
    ['forja',0,215,230,'pedra'],['respiro',35,105,203,'pedra'],['grua',47,62,184,'movel',12,0,3.9,.7],
    ['apoio',45,103,165,'metal'],['escoria',36,70,177,'fragil'],['forno',41,175,197,'pedra'],
    ['eixo',38,67,172,'metal'],['vagonete',48,61,158,'movel',0,10,3.7,2.0],['costura',44,65,171,'fragil'],
    ['alivio',39,161,194,'pedra'],['ventaneira',43,128,172,'pedra']
  ],
  desvios:[
    ['respiro','Cinza da salamandra',[[-34,-33,45,'metal'],[-85,-71,36,'pedra'],[-42,-100,30,'metal']]],
    ['forno','Selo da fornalha',[[40,-31,46,'fragil'],[94,-66,38,'movel',9,0,4,.5],[46,-98,32,'metal']]],
    ['alivio','Lente da ventaneira',[[33,-36,41,'metal'],[-9,-72,34,'fragil'],[-65,-103,28,'pedra']]]
  ],
  segredos:[{tecnica:'pisada',origem:'forno',selo:'tampa',destino:'nicho'}],
  auxiliares:[['tampa','forno',175,0,38,'selado'],['nicho','forno',175,38,38,'pedra']],
  espinhos:[['escoria',10,25,45],['eixo',71,28,23],['costura',4,23,54],['alivio',83,-8,22]],
  ecos:[['respiro',85,-14],['apoio',36,-14],['nicho',19,-15,3],['eixo',30,-16],['alivio',14,-14],['s3-2',16,-13,2]],
  inimigos:[['oleiro','fornalha','forno',87,29,'Fornalha ambulante',true],['ferrao','voador','alivio',114,30,'Fagulha alada']],
  portas:[['forno',164,'oleiro']],santuarios:[['forno','forno',27,'Boca fria da fornalha']],
  atalhos:[['cacamba','alivio',30,'apoio',26,'Caçamba do forno']],
  dicas:[
    ['forja',148,'As grelhas assobiam antes da coluna de vapor. Espere ou atravesse de um salto.'],['respiro',44,'A primeira grua conduz a um balcão firme. Respire antes da ponte.'],['forno',143,'A Pisada Sísmica rompe o selo e abre a câmara sob o forno.'],
    ['eixo',21,'Veja o vagonete e a ponte antes de sair do contraforte.']]
},
{
  nome:'Pontes do Magma',subtitulo:'O aqueduto das duas brasas',marca:'Dois aquedutos sobre o mesmo fluxo',
  ambientes:[['comporta',61,31,'vapor',0]],
  momento:['comporta',45,'Dois caminhos sobre a brasa','As vigas altas levam à coroa. As baixas cruzam pelo duto.'],
  trilha:[
    ['oficina',0,209,220,'pedra'],['esporao',41,92,197,'metal'],['aduela',45,124,171,'pedra'],
    ['canais',46,64,153,'movel',10,0,4.5,.7],['soleira',44,136,174,'pedra'],
    ['cinzel',43,70,201,'fragil'],['comporta',39,143,219,'metal'],['lamina',50,65,193,'pedra'],
    ['torre',48,149,166,'pedra'],['fulgor',48,79,147,'metal'],['arco',45,134,171,'pedra']
  ],
  desvios:[
    ['aduela','Brasa do pedreiro',[[-32,-31,42,'madeira'],[-87,-70,33,'metal'],[-43,-99,31,'pedra']]],
    ['soleira','Marca do sifão',[[-36,-32,41,'movel',8,0,3.6,1],[-91,-70,34,'fragil'],[-45,-97,28,'metal']]],
    ['comporta','Coroa das duas brasas',[[12,-33,46,'metal'],[72,-66,41,'fragil'],[130,-87,36,'movel',8,0,4.1,1.7],
      [193,-100,33,'metal']],{retorno:'torre',volta:[]}]
  ],
  segredos:[{tecnica:'pisada',origem:'torre',selo:'selo',destino:'poco'}],
  auxiliares:[
    ['relicario-brasa','s1-3',-158,-18,123,'pedra'],['selo','torre',149,0,48,'selado'],['poco','torre',149,38,48,'pedra']],
  espinhos:[['canais',70,39,30],['cinzel',8,29,49],['lamina',70,25,29]],
  ecos:[['esporao',48,-17],['poco',24,-15,3],['comporta',30,-15],['lamina',30,-17],['s3-2',17,-12,2],['fulgor',32,-15]],
  inimigos:[['gume','fornalha','soleira',87,26,'Cinzel da ponte',true],['guarda','escudo','torre',91,38,'Guardião do duto',true],
    ['vigia-brasa','mini','relicario-brasa',69,29,'Ferreiro de Escória',false,0,'pavio-de-escoria']],
  portas:[['soleira',126,'gume'],['torre',139,'guarda']],santuarios:[['fundicao','comporta',29,'Braseiro dos dois canais']],
  atalhos:[['sifao','torre',25,'comporta',95,'Desaguar do sifão'],['monovia','fulgor',47,'aduela',31,'Monovia antiga']],
  dicas:[
    ['s1-3',13,'Salte para o patamar à esquerda para desafiar o ferreiro.'],['aduela',48,'As quinas claras alternam terreno firme e trilhos de transporte.'],
    ['comporta',24,'As vigas altas passam pela estrela e desembocam na torre. As baixas seguem pela lâmina.'],
    ['torre',16,'A corrente abre o retorno. Na borda oposta, uma laje selada protege o poço de ecos.']]
},
{
  nome:'O Grande Gorila',subtitulo:'O altar do eclipse',marca:'Altar de obsidiana sob o disco do eclipse',
  ambientes:[['primeiro',24,37,'vapor',0]],
  momento:['ritual',56,'O chão do eclipse','O fogo alterna entre centro e bordas. Procure as pedras apagadas.'],
  inimigosCiclo:[['ciclo-cinzas','fagulheiro','aurora',57,26,'Fagulha da segunda chama']],
  trilha:[
    ['vigilia',0,211,222,'pedra'],['montante',39,101,195,'pedra'],['garra',46,62,171,'metal'],
    ['elevador',47,68,158,'movel',0,11,4.2,1.2],['primeiro',47,154,180,'pedra'],
    ['nervo',38,66,165,'fragil'],['baluarte',40,252,188,'pedra'],['patamar',41,81,163,'metal'],
    ['vespera',40,164,143,'pedra'],['ritual',28,325,164,'pedra'],['aurora',42,139,189,'metal']
  ],
  desvios:[
    ['montante','Memória das raízes',[[-30,-35,43,'madeira'],[-81,-71,36,'metal'],[-42,-101,29,'pedra']]],
    ['primeiro','Memória dos sinos',[[37,-34,44,'movel',8,0,4.2,0],[93,-71,34,'fragil'],[49,-100,28,'metal']]],
    ['vespera','Estrela do eclipse',[[32,-32,43,'metal'],[86,-65,36,'movel',0,7,3.7,1.6],[43,-94,30,'pedra']]]
  ],
  espinhos:[['nervo',8,29,47],['elevador',75,43,21]],
  ecos:[['montante',81,-15],['garra',29,-17],['primeiro',25,-13],['baluarte',33,-16,2],
    ['patamar',26,-15],['s3-1',20,-12,2]],
  inimigos:[['vigia','fagulheiro','primeiro',83,36,'Mensageiro de escória'],
    ['sineiro','elite','baluarte',151,61,'Sineiro de Escória',true],['gorila','chefe','ritual',202,84,'Grande Gorila',true]],
  portas:[['baluarte',240,'sineiro'],['ritual',314,'gorila']],santuarios:[['eclipse','vespera',116,'Última chama da aurora']],
  atalhos:[['grua','vespera',35,'primeiro',36,'Grua do altar']],
  dicas:[['primeiro',52,'Desça os degraus até o sineiro. A arena fica além da próxima chama.'],
    ['vespera',83,'O repouso encurta a volta ao altar. O sineiro derrotado permanece em silêncio.'],
    ['ritual',21,'O gorila muda a cadência quando o selo do peito acende. Preserve vigor para a abertura.']]
}
];

export { PLANTAS_VULCAO };
