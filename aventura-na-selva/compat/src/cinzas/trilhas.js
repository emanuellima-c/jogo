// Gerado a partir de src/cinzas/trilhas.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/trilhas.js", function (exports, usar) {
"use strict";
// Trilha: [identificador, vão, largura, topo, material, amplitude X, amplitude Y, período, fase].
// Desvio: [origem, nome da estrela, lista de [centro relativo, altura relativa, largura, material, movimento]].
// Encontro: [id, tipo, piso, posição no piso, raio de patrulha, nome, fecha passagem, altura de voo].
const PLANTAS=[
{
  nome:'Trilha dos Brotos', subtitulo:'A primeira vigília', marca:'Raízes de mangue diante da queda-d’água',
  trilha:[
    ['rancho',0,210,217,'terra'],['raiz',28,86,197,'terra'],['ninho',36,128,172,'terra'],
    ['foz',38,116,196,'madeira'],['vigilia',23,184,208,'terra'],['vau',37,70,188,'pedra'],
    ['sombra',30,120,165,'terra'],['figueira',41,137,190,'terra'],['arco',37,126,208,'pedra']
  ],
  desvios:[
    ['ninho','Semente da copa',[[-31,-36,53,'madeira'],[-73,-74,39,'madeira']]],
    ['sombra','Olho do beija-flor',[[40,-30,42,'madeira'],[0,-65,39,'madeira'],[-48,-91,33,'terra']]],
    ['figueira','Luz da várzea',[[31,-35,41,'madeira'],[73,-71,32,'pedra'],[24,-98,35,'terra']]]
  ],
  ecos:[['rancho',194,-12],['raiz',8,-26],['vigilia',141,-13,2],['sombra',12,-20],['s2-2',16,-12,2]],
  inimigos:[['vigia','vigia','vigilia',103,28,'Vigia dos brotos',true],['remador','lanceiro','figueira',74,24,'Remador de casca']],
  portas:[['vigilia',173,'vigia']], santuarios:[['vau','vigilia',25,'Braseiro das raízes']],
  atalhos:[['cipo','figueira',25,'foz',18,'Cipó trançado']],
  dicas:[['rancho',8,'Caminhe até a chama. Interagir permite descansar e encher os frascos.'],['rancho',174,'Segure o salto para alcançar a raiz iluminada.'],
    ['ninho',20,'O ninho acima guarda uma estrela. Volte pelas folhas.'],['foz',65,'Observe o braço do vigia. Ataque quando ele recolher a lâmina.'],
    ['vigilia',23,'Role através do golpe no instante do brilho. Deixe o vigor voltar.']]
},
{
  nome:'Passagem dos Cipós',subtitulo:'A distância da lança',marca:'Estacas alagadas e a casa suspensa',
  trilha:[
    ['cais',0,204,190,'madeira'],['estaca',42,53,169,'madeira'],['mirante',46,117,153,'terra'],
    ['aterro',49,200,182,'terra'],['pilastra',42,66,211,'pedra'],['ribanceira',41,159,229,'terra'],
    ['vara',51,65,202,'madeira'],['clareira',48,157,184,'terra'],['poste',42,64,161,'madeira'],['saida',35,124,182,'terra']
  ],
  desvios:[
    ['mirante','Casulo de linho',[[-37,-34,47,'madeira'],[-94,-69,35,'madeira'],[-55,-93,30,'pedra']]],
    ['ribanceira','Agulha do brejo',[[47,-35,47,'terra'],[7,-77,40,'madeira'],[-52,-104,28,'madeira']]],
    ['clareira','Selo do arpoador',[[37,-37,48,'madeira'],[90,-77,31,'pedra']]]
  ],
  ecos:[['estaca',29,-19],['aterro',20,-12],['vara',24,-22],['s2-2',18,-12,2],['poste',33,-13,2]],
  inimigos:[['arpao','lanceiro','aterro',118,32,'Sentinela do arpão',true],['espora','vigia','clareira',94,34,'Guardião dos cipós']],
  portas:[['aterro',189,'arpao']],santuarios:[['brejo','ribanceira',39,'Lume do brejo']],
  atalhos:[['polia','clareira',28,'mirante',18,'Polia da canoa']],
  dicas:[['mirante',36,'Da beira você vê onde pousar e até onde a lança alcança.'],['aterro',7,'O lanceiro recolhe a haste depois da estocada. Essa é sua abertura.']]
},
{
  nome:'Engenhos das Presas',subtitulo:'O ritmo das roldanas',marca:'Guindastes de cipó na cachoeira',
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
  inimigos:[['machado','vigia','moinho',83,20,'Operário de cobre'],['levante','voador','quilha',56,40,'Cigarra de roda',true]],
  portas:[['jusante',77,'levante']],santuarios:[['casa','represa',42,'Braseiro das comportas']],
  atalhos:[['contrapeso','jusante',40,'varanda',24,'Contrapeso de tronco']],
  dicas:[['varanda',28,'Observe a corda passar pela marca clara antes de saltar.'],['represa',48,'A próxima balança corre na horizontal. Espere a volta da polia.']]
},
{
  nome:'Cidade de Aurora',subtitulo:'O juramento das pontes',marca:'Pontes da cidadela do Rei das Presas',
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
  inimigos:[['beco','vigia','patio',82,23,'Patrulha do arco'],['presas','chefe','arena',194,72,'Rei das Presas',true]],
  portas:[['arena',285,'presas']],santuarios:[['portico','antecoro',102,'Oratório da coroa']],
  atalhos:[['guincho','antecoro',27,'patio',25,'Guincho de bronze']],
  dicas:[['lajes',30,'As costuras amarelas tremem antes de a ponte ceder.'],['patio',60,'Olhe as pontas no chão da rua seguinte. A luz vermelha marca o lançamento.'],
    ['antecoro',78,'O rei baixa a cabeça para investir. A roseta rubra anuncia um golpe impossível de aparar.']]
},
{
  nome:'Templo dos Ecos',subtitulo:'As três respostas da pedra',marca:'Lua minguante, aqueduto partido e cristais de quartzo',
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
  inimigos:[['salmista','lanceiro','tambor',108,19,'Salmista de cristal'],
    ['asa','voador','nave',92,45,'Mariposa do eco',true],['prisma','voador','abside',60,31,'Vespa de quartzo',false,51]],
  portas:[['nave',159,'asa']],santuarios:[['nave','nave',26,'Lume da nave central']],
  atalhos:[['ressonador','abside',124,'oratorio',25,'Elevador de contracanto']],
  dicas:[['oratorio',26,'Suba pelas três agulhas à esquerda para encontrar a marca lunar.'],['oratorio',75,'A primeira laje móvel se alinha com o recorte no arco.'],
    ['tambor',28,'O piso de âmbar racha sob os pés. O pedestal ao fundo sustenta peso.'],['nave',36,'A mariposa recolhe as asas antes de mergulhar. Há espaço para esperar na nave.']]
},
{
  nome:'Campanário da Matriarca',subtitulo:'A subida do fio',marca:'Campanário entrelaçado por uma figueira',
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
    ['asa','voador','sineira',80,45,'Coruja da torre',true],['sineiro','lanceiro','fundicao',95,28,'Sineiro oco']],
  portas:[['sineira',151,'asa']],santuarios:[['coroa','sineira',25,'Braseiro do sino maior']],
  atalhos:[['cesto','sineira',127,'poco',198,'Cesto do poço']],
  dicas:[['galeria',17,'Espere a vespa inclinar o corpo antes de deixar a galeria.'],['sineira',103,'Solte o cesto no topo. Ele liga esta plataforma à entrada da torre.']]
},
{
  nome:'Dunas de Âmbar',subtitulo:'A face do escudo',marca:'Sentinelas calcificadas no cânion',
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
    ['espora','vigia','fosso',48,21,'Escudeiro da duna'],['matriarca','chefe','arena',188,68,'Matriarca das Ruínas',true]],
  portas:[['trono',176,'porta'],['arena',283,'matriarca']],santuarios:[['nicho','guarita',98,'Oratório de areia']],
  atalhos:[['roldana','guarita',32,'mesa',29,'Roldana dos escudos']],
  dicas:[['mesa',42,'A entrada pelo alto deixa as costas do escudeiro expostas.'],['trono',12,'O escudo frontal cede ao pesado ou se abre quando a estocada termina.'],
    ['guarita',80,'A matriarca marca o chão antes de avançar. Aguarde o recolher das patas.']]
},
{
  nome:'Cisternas do Oásis',subtitulo:'Duas rodas de água',marca:'Rodas de cobre num reservatório subterrâneo',
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
  inimigos:[['fiscal','lanceiro','tanque',129,31,'Fiscal das águas',true],['bico','voador','laje',75,36,'Corvo da cisterna']],
  portas:[['tanque',179,'fiscal']],santuarios:[['reserva','tanque',27,'Câmara da reserva']],
  atalhos:[['canal','laje',24,'observatorio',24,'Carro do canal']],
  dicas:[['observatorio',42,'A roda lateral cruza a vertical. Espere aqui e veja as duas voltarem.'],
    ['tanque',11,'Pouse no recuo de pedra. O fiscal guarda a outra margem.']]
},
{
  nome:'Pontes do Titã',subtitulo:'O desfiladeiro suspenso',marca:'Passadiços de corda entre fósseis gigantes',
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
  inimigos:[['vigia','vigia','campana',103,39,'Guarda da primeira ponte',true],['vara','lanceiro','cranio',91,44,'Arpão de osso'],
    ['espada','escudo','planalto',132,24,'Escudo do leito']],
  portas:[['campana',157,'vigia']],santuarios:[['osso','cranio',28,'Fogo da costela']],
  atalhos:[['trena','planalto',34,'crista',23,'Trenó das cordas']],
  dicas:[['crista',51,'O patrulheiro volta até o osso claro. Atravesse quando ele se afastar.'],
    ['costela',28,'A próxima ponte se desfaz em direção à pedra larga.']]
},
{
  nome:'Cidadela da Lua Clara',subtitulo:'O cerco das três torres',marca:'Fortificações cobertas pela primeira neve',
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
  inimigos:[['campeao','escudo','estrebaria',105,35,'Cavaleiro da torre',true],['gralha','voador','muralha',87,33,'Gralha do cerco'],
    ['tita','chefe','tribunal',195,77,'Titã das Areias',true]],
  portas:[['estrebaria',160,'campeao'],['tribunal',295,'tita']],santuarios:[['tribuna','antecamara',111,'Vigília da tribuna']],
  atalhos:[['eclusa','antecamara',31,'bastiao',29,'Monta-cargas do cerco']],
  dicas:[['bastiao',41,'Do portão até a tribuna se repetem três lições: transferir, quebrar a guarda e cruzar.'],
    ['antecamara',68,'A chama da tribuna fica logo antes da arena. O Titã muda o ritmo na metade da luta.']]
},
{
  nome:'Pontes da Geada',subtitulo:'Os dentes de gelo',marca:'Pináculos azuis com lajes de xisto',
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
  auxiliares:[['varanda-eco','s2-3',167,-2,39,'metal']],
  espinhos:[['mandibula',63,20,22],['espora',63,28,24]],
  ecos:[['unha',28,-14],['mandibula',30,-15],['espora',26,-16,2],['quilha',32,-14],['s2-2',11,-12,2],['varanda-eco',19,-13,4]],
  inimigos:[['ronda','lanceiro','selim',83,24,'Ronda da nevasca'],['asa','voador','mesa',77,32,'Coruja de quartzo',true]],
  portas:[['mesa',120,'asa']],santuarios:[['nicho','mesa',20,'Nicho entre pináculos']],
  atalhos:[['cunha','pico',40,'pinha',19,'Cunha do alpinista']],
  dicas:[['unha',27,'As marcas claras nas pontas indicam o início das superfícies.'],
    ['selim',28,'Pelo alto, as agulhas levam a uma estrela. Do último dente, o Passo do Eco alcança a varanda azul.']]
},
{
  nome:'Claustro da Geada',subtitulo:'O silêncio entre batidas',marca:'Arcos de gelo e neve no claustro',
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
  inimigos:[['lanca','lanceiro','canto',107,28,'Porteiro da neve'],['asa','voador','cimbre',73,32,'Vigia de plumas'],
    ['penacho','voador','nave',45,24,'Corvo das janelas',false,46],['escudo','escudo','nave',116,29,'Escudo do claustro',true],['geada','chefe','atrium',184,66,'Guardião da Geada',true]],
  portas:[['nave',168,'escudo'],['atrium',284,'geada']],santuarios:[['capela','oratorio',109,'Chama do coro']],
  atalhos:[['rosario','oratorio',29,'claustro',24,'Corda do rosário']],
  dicas:[['canto',26,'A lança alcança o pátio. A criatura alada ronda o teto seguinte.'],['cimbre',28,'Recue uma laje para chamar apenas uma ameaça.'],
    ['oratorio',74,'O guardião bate o chão, recolhe os punhos e revela a junta de gelo.']]
},
{
  nome:'Encosta da Brasa',subtitulo:'O fôlego dos fornos',marca:'Fornalhas escavadas no basalto',
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
  inimigos:[['oleiro','vigia','forno',87,29,'Operário de basalto',true],['ferrao','voador','alivio',114,30,'Fagulha alada']],
  portas:[['forno',164,'oleiro']],santuarios:[['forno','forno',27,'Boca fria da fornalha']],
  atalhos:[['cacamba','alivio',30,'apoio',26,'Caçamba do forno']],
  dicas:[['respiro',44,'A primeira grua conduz a um balcão firme. Respire antes da ponte.'],['forno',143,'A Pisada Sísmica rompe o selo e abre a câmara sob o forno.'],
    ['eixo',21,'Veja o vagonete e a ponte antes de sair do contraforte.']]
},
{
  nome:'Pontes do Magma',subtitulo:'O aqueduto das duas brasas',marca:'Dois aquedutos sobre o mesmo fluxo',
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
  auxiliares:[['selo','torre',149,0,48,'selado'],['poco','torre',149,38,48,'pedra']],
  espinhos:[['canais',70,39,30],['cinzel',8,29,49],['lamina',70,25,29]],
  ecos:[['esporao',48,-17],['poco',24,-15,3],['comporta',30,-15],['lamina',30,-17],['s3-2',17,-12,2],['fulgor',32,-15]],
  inimigos:[['gume','lanceiro','soleira',87,26,'Cinzel da ponte',true],['guarda','escudo','torre',91,38,'Guardião do duto',true]],
  portas:[['soleira',126,'gume'],['torre',139,'guarda']],santuarios:[['fundicao','comporta',29,'Braseiro dos dois canais']],
  atalhos:[['sifao','torre',25,'comporta',95,'Desaguar do sifão'],['monovia','fulgor',47,'aduela',31,'Monovia antiga']],
  dicas:[['aduela',48,'As quinas claras alternam terreno firme e trilhos de transporte.'],
    ['comporta',24,'As vigas altas passam pela estrela e desembocam na torre. As baixas seguem pela lâmina.'],
    ['torre',16,'A corrente abre o retorno. Na borda oposta, uma laje selada protege o poço de ecos.']]
},
{
  nome:'O Grande Gorila',subtitulo:'O altar do eclipse',marca:'Altar de obsidiana sob o disco do eclipse',
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
  inimigos:[['vigia','voador','primeiro',83,36,'Mensageiro de escória'],
    ['sineiro','elite','baluarte',151,61,'Sineiro de Escória',true],['gorila','chefe','ritual',202,84,'Grande Gorila',true]],
  portas:[['baluarte',240,'sineiro'],['ritual',314,'gorila']],santuarios:[['eclipse','vespera',116,'Última chama da aurora']],
  atalhos:[['grua','vespera',35,'primeiro',36,'Grua do altar']],
  dicas:[['primeiro',52,'Desça os degraus até o sineiro. A arena fica além da próxima chama.'],
    ['vespera',83,'O repouso encurta a volta ao altar. O sineiro derrotado permanece em silêncio.'],
    ['ritual',21,'O gorila muda a cadência quando o selo do peito acende. Preserve vigor para a abertura.']]
}
];

Object.defineProperty(exports, "PLANTAS", { enumerable: true, get: () => PLANTAS });
});
