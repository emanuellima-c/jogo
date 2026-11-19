# Aventura na Selva · Santuários de Aurora

Jogo de ação e plataforma em português, edição 5.0. Guie Lula por 15 fases da Selva Esmeralda ao Vulcão de Obsidiana. O salto, o golpe leve, o pesado e a esquiva bastam para chegar ao Grande Gorila. Cada fase guarda três estrelas em desvios opcionais.

## Começar

Extraia o ZIP inteiro, abra **index.html** e escolha **Iniciar jornada**. Use **Continuar jornada** para retomar o perfil. O **Atlas** permite voltar às fases abertas, procurar estrelas e recuperar ecos deixados para trás.

Para instalar como aplicativo, sirva a pasta por HTTPS ou em localhost. Com Python, execute o comando abaixo dentro da pasta e abra `http://localhost:8000`. Escolha **Instalar jogo** e aguarde **Pronto para jogar offline** antes de desconectar.

```sh
python3 -m http.server 8000
```

## Controles e combate

| Ação | Teclado |
| --- | --- |
| Andar | A e D ou ← e → |
| Pular | Espaço, W ou ↑. Segure para alcançar mais altura |
| Golpe leve | J ou X |
| Golpe pesado | K ou Z |
| Esquivar | Shift ou L |
| Usar frasco | F |
| Técnicas I e II | Q e R |
| Interagir com Bento, santuário, atalho, portal ou marca de ecos | E |
| Pausar ou retomar | P ou Esc |
| Ligar ou desligar o som | M |

No toque, as setas ficam à esquerda. À direita ficam o salto, a esquiva e os ataques. Os botões I e II acionam as gravuras equipadas. Toque no nome de um objeto próximo para interagir.

O herói começa com **100 de vida, 100 de vigor e dois frascos**. O golpe leve custa 14 de vigor, o pesado custa 29 e a esquiva custa 23. O salto é livre. A preparação de um golpe inimigo denuncia sua direção. Uma marca vermelha serrilhada anuncia um ataque que atravessa o aparo. Há tempo para contra-atacar na recuperação e para alcançar o flanco de um inimigo protegido. Os guardiões mudam de padrão ao chegar à metade da vida.

O frasco recupera 48 de vida após 0,61 s de preparação. Um golpe nesse intervalo pode interromper a cura e gastar a dose. Descansar enche os frascos, recupera vida e vigor e reativa os inimigos comuns. Estrelas, atalhos, lajes rompidas e vitórias sobre elites e chefes ficam gravados.

Ao morrer, o saldo de ecos vira uma marca recuperável. Em uma queda ela fica na última superfície firme. Volte até a marca e interaja para recuperar o saldo. Uma nova morte substitui a marca anterior, inclusive quando a carteira está vazia.

## Bento do Cipó e as seis gravuras

O manto de viagem, a lanterna de cristal e as ferramentas de gravação identificam Bento junto à oficina. Aproxime-se e escolha **Experimentar** para praticar com o autômato, inclusive antes de comprar. O ensaio conserva o saldo e os frascos da jornada. A compra é permanente. Você pode trocar as duas gravuras equipadas na oficina ou em um santuário.

| Técnica | A partir da fase | Preço em ecos | Vigor | Uso |
| --- | ---: | ---: | ---: | --- |
| Corte de Retorno | 1 | 8 | 19 | Após esquivar no impacto, acione a técnica em até 0,76 s para contra-atacar. |
| Aparo de Ferro | 2 | 14 | 17 | Encare o inimigo e antecipe o impacto. A defesa dura 0,15 s e abre a guarda em caso de acerto. |
| Quebra-Guarda | 3 | 22 | 31 | Segure e solte a técnica diante de um escudo. O carregamento expõe o herói e o golpe rompe a defesa. |
| Estocada da Aurora | 5 | 38 | 25 | Acione na direção do alvo. A estocada alcança longe e exige 0,36 s de recuperação. |
| Pisada Sísmica | 7 | 58 | 28 | Acione no ar para descer sobre o alvo. O impacto interrompe inimigos leves e quebra lajes com selo dourado. |
| Passo do Eco | 9 | 72 | 18 | Acione no ar com uma direção para avançar uma vez por salto. A carga volta ao pousar. |

## As 15 fases

| Fase | Percurso da edição 5.0 |
| --- | --- |
| 1 · Trilha dos Brotos | Degraus curtos ensinam o salto antes do primeiro duelo. O vigia anuncia o talho, o braseiro ensina o descanso e um desvio pela copa leva à primeira estrela. |
| 2 · Passagem dos Cipós | Do mirante, observe a aterrissagem no aterro e o alcance da lança. A recuperação do arpoador abre a passagem. |
| 3 · Engenhos das Presas | Roldanas carregam plataformas sobre a cachoeira. Observe os ciclos na varanda e faça uma transferência mais precisa para alcançar a estrela. |
| 4 · Cidade de Aurora | Pontes frágeis e espinhos aparecem em trechos de aprendizado. A arena do Rei das Presas recompensa quem deixa a investida passar. |
| 5 · Templo dos Ecos | Lajes móveis, uma ponte rachada e a mariposa da nave interrompem o trajeto sob os arcos. **Agulha da Lua** exige precisão. **Pulso das Naves** usa dois ciclos móveis. **Acorde do Cristal** combina piso frágil e transferência. |
| 6 · Campanário da Matriarca | A subida passa por galerias, patamares e voadores. No alto, solte o cesto que liga a sineira à entrada. |
| 7 · Dunas de Âmbar | O Tatu de Bronze defende a frente nos desníveis do cânion. Flanqueie, espere a recuperação ou rompa a guarda antes do encontro com a Matriarca das Ruínas. |
| 8 · Cisternas do Oásis | Duas rodas de cobre têm ciclos distintos. Observe a aproximação dos apoios e escolha o momento de pousar antes do duelo no tanque. |
| 9 · Pontes do Titã | Patrulhas vigiam os passadiços de corda. A estrela do funâmbulo leva a apoios menores acima da travessia. |
| 10 · Cidadela da Lua Clara | As torres encadeiam travessia, escudo frontal e ataque aéreo. A vigília da tribuna encurta o retorno ao Titã das Areias. |
| 11 · Pontes da Geada | As alturas variam entre pináculos com áreas de pouso menores. As estrelas reservam os saltos mais estreitos, e o Passo do Eco alcança uma varanda adicional. |
| 12 · Claustro da Geada | Patamares permitem enfrentar o lanceiro e o vigia alado separadamente. O Guardião da Geada combina varredura e abalo. |
| 13 · Encosta da Brasa | Plataformas móveis, espinhos e pontes frágeis alternam com apoios de observação entre as fornalhas. A Pisada abre um depósito de ecos. |
| 14 · Pontes do Magma | O aqueduto oferece uma travessia baixa e vigas altas. O desvio da Coroa das Duas Brasas desemboca na torre e dá acesso ao retorno. |
| 15 · O Grande Gorila | Depois do elevador e da ponte frágil, o Sineiro de Escória protege o baluarte. Acenda a última chama antes da arena. Sob o eclipse, o gorila passa a encadear golpes, ondas e investidas. |

## Arte e som

Cada fase tem uma paisagem própria. O Templo dos Ecos combina lua, aqueduto partido e cristais. Texturas de primeiro plano, bordas de pouso, rachaduras animadas e marcas nos próprios inimigos ajudam a ler a ação. Lula tem poses de preparação, impacto e recuperação. Bento tem retrato, animações de saudação e oficina. As trilhas e os efeitos dos golpes, dos frascos e das técnicas são sintetizados no navegador. [Arte de Bento](arte/cinzas/retrato.png) · [Paisagem do Templo](arte/cinzas/f05.webp)

## Progresso de edições anteriores

O jogo reconhece os perfis v2 e v3, inclusive os usados pela edição 4.0. A migração conserva saldo, nível, XP, fases concluídas, contagem de estrelas, ciclo e preferências. As moedas viram ecos e as habilidades antigas com equivalente liberam gravuras. Como a edição anterior registrava somente a quantidade de estrelas por fase, a migração atribui essa quantidade aos primeiros identificadores das três novas estrelas.

A versão 5 usa uma chave própria de armazenamento e mantém o perfil legado no arquivo exportado. Para mudar de navegador, endereço ou aparelho, use a exportação e a importação de progresso em **Opções**.

## Desenvolvimento e testes

O jogo usa HTML, CSS, Canvas 2D e JavaScript. Com Node.js 18 ou superior, execute na pasta do projeto.

```sh
npm run preparar
npm test
```

O preparo gera a versão para abrir por duplo clique e o cache offline. A suíte verifica esses arquivos, o carregador, a PWA, a migração e as regras de combate. Há duas travessias por comandos simulados, uma com movimentos básicos e outra que explora os 45 desvios. Para repetir apenas uma delas, execute `node ferramentas/testar-trilhas-cinzas.mjs --basico` ou `node ferramentas/testar-trilhas-cinzas.mjs --explorar`.

| Arquivo | Uso |
| --- | --- |
| [ajustes.js](src/cinzas/ajustes.js) | Vigor, dano, preços, cura, tempos de ataque e padrões dos guardiões |
| [trilhas.js](src/cinzas/trilhas.js) | Geometria, encontros, marcos, desvios e atalhos das 15 fases |
| [perfil.js](src/cinzas/perfil.js) | Formato de progresso, conversões e migração |
| [pintura.js](src/cinzas/pintura.js) | Câmera e desenho da partida |
| [som.js](src/cinzas/som.js) | Música, sinais e efeitos de impacto |

## Verificação da entrega

| Verificação | Resultado |
| --- | --- |
| Campanha com movimentos básicos | 15 fases, cinco guardiões e o elite da fase final. O percurso automático entrou no Templo dos Ecos no nível 2 e terminou no nível 5, sem comprar técnicas. |
| Campanha exploradora | 45 estrelas, 30 santuários, 16 atalhos percorridos nos dois sentidos e seis técnicas adquiridas. A vitória veio no nível 7. |
| Rotas de técnica | Travessia da varanda de gelo da fase 11 com Passo do Eco e abertura das câmaras nas fases 13 e 14 com Pisada Sísmica. |
| Combate e progresso | 21 verificações automatizadas, incluindo aparo, guarda, cura interrompida, vigor e retorno dos cinco guardiões testados com um personagem de nível 1. As 15 fases passaram pelo teste de queda, recarga e recuperação única dos ecos. |
| Navegador | Duas campanhas completas por entradas automatizadas de teclado no Chrome, com o relógio da simulação acelerado. Compra, troca de técnica e retomada de um perfil legado testadas na interface. As 15 fases foram inspecionadas visualmente. |
| Toque e PWA | Multitoque em retrato e paisagem. Instalação e abertura offline em janela própria verificadas no Chrome para Linux. A abertura por duplo clique também foi testada. |

O toque foi testado em emulação. A avaliação em aparelhos Android e iPhone físicos permanece pendente.

A pasta de arte inclui a origem das ilustrações e as licenças das fontes. [Créditos de arte](arte/cinzas/CREDITOS.md)
