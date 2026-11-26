# Aventura na Selva · Santuários de Aurora

Jogo de ação e plataforma em português, edição 7.0.0. Guie Lula por 15 fases da Selva Esmeralda ao Vulcão de Obsidiana. Cada classe pode chegar ao Grande Gorila com seus movimentos básicos. Cada fase guarda três estrelas em desvios opcionais. As chamas dos santuários marcam o avanço de Lula e a resistência da Aurora ao eclipse.

## Começar

Extraia o ZIP e abra **index.html** no Chrome do celular ou no navegador do computador e escolha **Novo jogo**. Confira os golpes e a pose de cada classe e confirme a escolha. Use **Continuar** para retomar o perfil. O **Atlas** permite voltar às fases abertas, procurar estrelas e recuperar ecos deixados para trás.

Após editar o jogo, execute `npm run preparar` na pasta principal para atualizar **index.html** a partir de `src/pagina.html.tmpl`, `src/`, `css/` e `arte/`.

Para instalar como aplicativo, sirva a pasta principal por HTTPS ou em localhost. Com Python, execute o comando abaixo dentro da pasta e abra `http://localhost:8000`. Escolha **Instalar jogo** e aguarde **Pronto para jogar offline** antes de desconectar.

```sh
python3 -m http.server 8000
```

## Controles e combate

| Ação | Teclado padrão | Gamepad de mapeamento padrão |
| --- | --- | --- |
| Andar | A e D ou ← e → | Direcional ou analógico esquerdo |
| Pular e controlar a altura | Espaço, W ou ↑ | A |
| Golpe leve | J ou X | X |
| Golpe pesado | K ou Z | Y |
| Esquivar | Shift ou L | B |
| Usar frasco | F | LT |
| Talento da classe, quando disponível | C | R3, clique do analógico direito |
| Técnicas I e II | Q e R | LB e RB |
| Interagir com Bento, santuário, atalho, portal ou marca de ecos | E | RT |
| Pausar ou retomar | P ou Esc | Start |
| Ligar ou desligar o som | M | Opções |

Em **Opções**, remapeie até três teclas por ação, ajuste a intensidade do tremor e do flash e ligue o alto contraste para avisos de combate. A assistência ao salto amplia as janelas de salto após a borda e de entrada antes do pouso. O modo alternar permite ligar e desligar a retenção do salto e da Quebra-Guarda com toques separados.

No toque, use os grupos de direção e ação ao mesmo tempo. Deslize entre as setas para inverter a direção. Toque no nome de um objeto próximo para interagir. Posição, tamanho e vibração são ajustáveis em **Opções**. A vibração depende do navegador e do aparelho.

O Herdeiro e o Despojado têm 100 de vida e 100 de vigor como referência. Vida, vigor, custo e alcance dos golpes variam com o kit e os atributos. O salto é livre. A preparação de um golpe inimigo denuncia sua direção. Uma marca vermelha serrilhada anuncia um ataque que atravessa o aparo. Há tempo para contra-atacar na recuperação e para alcançar o flanco de um inimigo protegido. Cada guardião muda de padrão duas vezes. A faixa no chão ou no ar indica a área de alcance antes do impacto.

No Normal, o frasco de referência recupera 36 de vida após 0,65 s de preparação. O herói começa com duas doses. Um golpe durante a preparação pode interromper a cura e gastar a dose. Descansar enche os frascos, recupera vida e vigor e reativa os inimigos comuns. Estrelas, atalhos, lajes rompidas e vitórias sobre elites, mini-chefes e guardiões ficam gravados.

Ao morrer, o saldo de ecos vira uma marca recuperável. Em uma queda ela fica na última superfície firme. Volte até a marca e interaja para recuperar o saldo. Uma nova morte substitui a marca anterior, inclusive quando a carteira está vazia.

## Classes

| Classe | Como luta | Traço inicial |
| --- | --- | --- |
| Cavaleiro | Lâmina, escudo e defesa frontal | Segure o talento para bloquear golpes aparáveis com vigor e contra-atacar. |
| Guerreiro | Machado de arco amplo | Pesados acertados acumulam Fúria e encurtam a recuperação. |
| Ladino | Adagas perto do alvo e esquiva longa | Flanquear ou aproveitar a recuperação inimiga aumenta o dano e rende um eco. |
| Piromante | Ataques de fogo em área | Acertos leves dão Chama. O Sopro da fornalha queima quem o usa caso erre por completo. |
| Feiticeiro | Projéteis arcanos e cajado | O Foco alimenta os projéteis e o Escudo arcano, com ataques de cajado disponíveis quando ele acaba. |
| Clérigo | Martelo e proteção | Golpes certeiros e aparos recuperam Fé para a Prece de abrigo. |
| Despojado | Bastão curto e atributos iniciais no mínimo | Cada derrota de inimigo rende um eco adicional. |

O **Herdeiro** usa o kit da edição anterior. Provas cronometradas usam esse kit para conservar a referência dos recordes. Depois de concluir a jornada, escolha outra classe ao confirmar um novo ciclo. Estrelas, gravuras, amuletos, ecos e nível acompanham a troca.

## Atributos e nível

Descanse num santuário e abra **Evoluir atributos**. Selecione um atributo para ver seus efeitos e o preço antes de confirmar. Cada ponto acima de 8 conta para o nível. As classes começam com distribuições próprias, visíveis na seleção. O limite de 99 preserva níveis das edições anteriores.

| Atributo | Efeito | Cortes |
| --- | --- | --- |
| Vitalidade | Vida máxima | 16 e 26 |
| Fôlego | Vigor máximo e regeneração | 16 e 25 |
| Força | Dano conforme a escala do golpe | 18 e 30 |
| Destreza | Escala de dano e custo da esquiva | 18 e 30 |
| Intelecto | Escala de dano, reserva de Chama ou Foco e regeneração de Foco | 18 e 30 |
| Fé | Escala de dano, cura do frasco e reservas de Fé ou Chama | 18 e 30 |
| Equilíbrio | Postura contra impactos leves, redução de dano e de recuo | 16 e 24 |

Cada ponto rende 100% até o primeiro corte, 50% até o segundo e 25% depois. Cada atributo pode chegar a 60. As grades E a S definem quanto um golpe recebe de cada atributo. Uma gravura abaixo do requisito suave ainda funciona. O preço é até 25% de dano a menos ou, nas técnicas sem dano, um aumento proporcional de custo.

Ecos financiam os pontos e também as compras de Bento. Isso faz cada gasto competir com outra melhoria. O XP acumulado permanece como registro de campo. O custo do próximo ponto, dado o nível atual `n`, é `8 + n + ⌊18 × n² ÷ 1000⌋` ecos. O custo acumulado parte do nível zero. Desconte o valor acumulado no nível inicial da classe para calcular a jornada daquela classe.

<details>
<summary>Custo acumulado até o nível máximo</summary>

| Nível | Ecos |
| ---: | ---: |
| 0 | 0 |
| 5 | 50 |
| 10 | 127 |
| 15 | 238 |
| 20 | 387 |
| 25 | 578 |
| 30 | 818 |
| 35 | 1.108 |
| 40 | 1.454 |
| 45 | 1.860 |
| 50 | 2.332 |
| 55 | 2.873 |
| 60 | 3.488 |
| 65 | 4.181 |
| 70 | 4.958 |
| 75 | 5.822 |
| 80 | 6.778 |
| 85 | 7.833 |
| 90 | 8.988 |
| 95 | 10.248 |
| 99 | 11.334 |

</details>

Ao liberar a fase 7, Bento vende uma **Cinza de Refazer** por ciclo, por 60 ecos. Use a cinza num santuário para redistribuir os pontos do mesmo nível. Um perfil convertido para o sistema de atributos tem direito a uma primeira redistribuição gratuita.

## Bento do Cipó e as seis gravuras

O manto de viagem, a lanterna de cristal e as ferramentas de gravação identificam Bento junto à oficina. Aproxime-se e escolha **Experimentar** para praticar com o autômato, inclusive antes de comprar. O ensaio conserva o saldo e os frascos da jornada. A compra é permanente. Você pode trocar as duas gravuras equipadas na oficina ou em um santuário.

| Técnica | A partir da fase | Ecos no nível 1 | Vigor | Evoluções de nível 2 e 3 |
| --- | ---: | ---: | ---: | --- |
| Corte de Retorno | 1 | 8 | 19 | Devolve vigor no acerto. Depois abre a guarda de comuns protegidos. |
| Aparo de Ferro | 2 | 14 | 17 | O aparo devolve vigor. Depois habilita o Corte de Retorno. |
| Quebra-Guarda | 3 | 22 | 31 | A carga completa alcança atrás. Depois a quebra devolve vigor contra escudos. |
| Estocada da Aurora | 5 | 38 | 25 | Perfura escudos comuns. Depois permite cancelar a recuperação com esquiva se acertar. |
| Pisada Sísmica | 7 | 58 | 28 | Abre escudos. Depois renova o tempo de queda de uma ponte rachada ao pousar sobre ela. |
| Passo do Eco | 9 | 72 | 18 | Protege durante o avanço no ar. Depois permite mais um avanço no sentido oposto. |

O frasco melhora na oficina. O nível 2 também restaura 18 de vigor quando a cura se completa. O nível 3 aumenta a capacidade para três cargas ao descansar.

## Amuletos

Equipe dois amuletos no início e três após o final. Bento vende parte da coleção. Os demais vêm de estrelas específicas ou dos cinco relicários de mini-chefes. Troque os equipados com Bento ou em um santuário.

| Amuleto | Origem | Efeito e contrapartida |
| --- | --- | --- |
| Dente do Vigia | Vigia da Copa | Pesados causam 28% mais dano e leves causam 14% menos dano. |
| Asa de Cristal | Coroa de Cristal | Gravuras custam 20% menos vigor. Vigor máximo −16. |
| Garra do Fosso | Sentinela do Fosso | Dano em inimigos em recuperação +24%. Esquiva custa 20% mais vigor. |
| Olho da Geada | Coruja do Relicário | O aparo ganha 0,05 s de proteção. Dano recebido +18%. |
| Pavio de Escória | Ferreiro de Escória | Ataques no ar causam 30% mais dano. Regeneração de vigor −15%. |
| Folha Dupla | F1 · Luz da várzea | Esquiva perfeita restaura 10 de vigor. Vida máxima −16. |
| Fragmento Lunar | F5 · Pulso das Naves | Vida máxima +18. Frascos recuperam 12 de vida a menos. |
| Bússola das Dunas | F8 · Chave da maré | Esquiva custa 22% menos vigor. Golpes leves causam 17% menos dano. |
| Fio da Neve | F11 · Pólen de neve | Dano recebido −16%. Regeneração de vigor −12%. |
| Vidro Sulfúrico | F14 · Coroa das duas brasas | Dano infligido e recebido +18%. |
| Fivela do Rancho | Bento · F2 · 12 ecos | Vigor máximo +18. Regeneração de vigor −16%. |
| Gota de Resina | Bento · F3 · 16 ecos | Frascos recuperam mais 14 de vida. Dano recebido +12%. |
| Cinzel de Bento | Bento · F4 · 20 ecos | Pesado custa 25% menos vigor. Leve custa 22% mais vigor. |
| Nó de Cobre | Bento · F7 · 25 ecos | Vigor regenera 23% mais rápido. Vigor máximo −20. |
| Pérola da Várzea | Bento · F10 · 30 ecos | Sem cargas no frasco, dano +25%. Frascos recuperam 8 de vida a menos. |

## As 15 fases

| Fase | Momento | Guia |
| --- | --- | --- |
| 1 · Trilha dos Brotos | Travessia da maré | Leia as bandeirolas antes de seguir a jangada. |
| 2 · Passagem dos Cipós | A balsa do contrapeso | O cais alto dá tempo para acompanhar a balsa. |
| 3 · Engenhos das Presas | Cadência das comportas | Use a margem firme para ler o ciclo das duas roldanas. |
| 4 · Cidade de Aurora | A coroa partida | Perto dos contrafortes, a investida pode expor o rei. |
| 5 · Templo dos Ecos | As três respostas | Para a estrela, siga a agulha. Para a relíquia, suba até o relicário do cristal. |
| 6 · Campanário da Matriarca | O cesto do sino maior | Solte a corda para abrir o retorno até a entrada. |
| 7 · Dunas de Âmbar | A teia sob os pés | O círculo da seda marca a área que vai prender seus passos. |
| 8 · Cisternas do Oásis | As rodas desencontradas | Espere o ponto em que as duas rodas se aproximam. |
| 9 · Pontes do Titã | A costura dos fósseis | Apoie-se no osso largo antes de saltar da ponte frágil. |
| 10 · Cidadela da Lua Clara | A sentença do Titã | O trilho aceso alterna os lados da arena. Salte na descarga. |
| 11 · Pontes da Geada | A varanda escondida | Do último dente, o Passo do Eco alcança o balcão de gelo. |
| 12 · Claustro da Geada | Coro de estilhaços | Escolha a faixa livre entre as marcas antes da queda. |
| 13 · Encosta da Brasa | Câmara do forno | Pise com força no selo dourado para revelar a câmara. |
| 14 · Pontes do Magma | Dois caminhos sobre a brasa | As vigas altas levam à coroa. As baixas cruzam pelo duto. |
| 15 · O Grande Gorila | O chão do eclipse | O fogo alterna entre centro e bordas. Procure as pedras apagadas. |

## Biomas

| Bioma | Novos inimigos | Perigo com aviso |
| --- | --- | --- |
| Selva Esmeralda | Escavador e Cuspidor | Rajadas na direção das bandeirolas |
| Ruínas de Aurora | Ressonante e Sineiro | Correnteza que empurra |
| Deserto de Âmbar | Miragem e Areeiro | Areia que reduz a velocidade |
| Neve da Lua Clara | Cristalino e Patinador | Gelo que reduz a frenagem |
| Vulcão de Obsidiana | Fornalha e Fagulheiro | Vapor que sobe da pedra |

## Guardiões

| Fase e guardião | Etapas | Regra de arena |
| --- | --- | --- |
| 4 · Rei das Presas | Vigília → Coroa em marcha → Coroa partida | Contrafortes da coroa |
| 7 · Matriarca das Ruínas | Trama → Seda armada → Ninho aberto | Tapete de seda |
| 10 · Titã das Areias | Julgar → Tribunal em marcha → Sentença | Trilhos do tribunal |
| 12 · Guardião da Geada | Claustro → Coro estilhaçado → Inverno aberto | Coro dos estilhaços |
| 15 · Grande Gorila | Eclipse → Altar em brasa → Última chama | Fornalhas do eclipse |

## Objetivos dos santuários

O HUD mostra três metas por fase. Acenda a chama indicada, procure a estrela nomeada e realize o encontro ou atalho da terceira meta. Nas arenas principais, a terceira meta é vencer o guardião sem usar frasco desde o último descanso. Cada recompensa dá de 2 a 5 ecos uma vez por perfil. O marcador ✓ indica uma meta cumprida. Se a luta terminar depois de gastar um frasco, ↻ indica outra oportunidade no próximo ciclo.

**Relaxado** mantém a cura mais generosa. **Normal** reduz a cura e a regeneração de vigor, alterna a iniciativa de inimigos próximos e permite que alguns encadeiem um golpe com novo aviso. **Provação** aperta os intervalos e o vigor. Troque o modo em **Opções**.

## Arte e som

Cada fase tem uma paisagem própria. O Templo dos Ecos combina lua, aqueduto partido e cristais. Texturas de primeiro plano, bordas de pouso, rachaduras animadas e marcas nos próprios inimigos ajudam a ler a ação. Lula tem poses de preparação, impacto e recuperação. Bento tem retrato, animações de saudação e oficina. As dez criaturas dos biomas têm silhuetas e poses próprias desenhadas em Canvas. Os cinco perigos têm padrões de direção ou contorno distintos e um timbre de aviso por perigo. As trilhas e os efeitos são sintetizados no navegador. [Arte de Bento](arte/cinzas/retrato.png) · [Paisagem do Templo](arte/cinzas/f05.webp)

A galeria reúne criaturas, guardiões, relicários e perigos em quadros de preparo, impacto e recuperação. Use um servidor local na raiz do projeto e abra `/ferramentas/galeria.html`. Marque **Tons de cinza** e **Alto contraste** para comparar as formas e use **Ouvir aviso** nos perigos. A avaliação de leitura e som depende de revisão humana. [Galeria de leitura](ferramentas/galeria.html)

## Progresso de edições anteriores

O jogo lê os perfis v2, v3, v5 e v6 e grava em v7. Essas jornadas recebem a classe **Herdeiro**. Saves v7 sem atributos mantêm a classe escolhida. Em ambos os casos, os níveis anteriores viram pontos distribuídos e o primeiro refazer é gratuito. Sessões, marcas de ecos, pontos de retorno, saldo, XP, gravuras, amuletos, fases concluídas, estrelas, ciclo e preferências são preservados quando existem na versão de origem. Nos saves v2 e v3, as moedas viram ecos e as habilidades antigas com equivalente liberam gravuras. As estrelas registradas como contagem são atribuídas aos primeiros identificadores das três estrelas de cada fase.

A versão 7 tem uma chave própria de armazenamento. As chaves anteriores ficam disponíveis para leitura. Para mudar de navegador, endereço ou aparelho, use a exportação e a importação de progresso em **Opções**.

## Curva de dificuldade

O HUD mostra o nível do oponente próximo, com uma seta para cima quando está pelo menos 5 níveis acima e para baixo quando está pelo menos 3 abaixo. Físico, fogo, arcano e sagrado têm ícones e nomes. As setas junto ao tipo indicam fraqueza ou resistência. Espinhos, jatos e quedas continuam ligados ao terreno.

Na entrada da fase e ao descansar, o jogo grava um retrato do poder. O cálculo considera vida efetiva, dano esperado, vigor, recursos de classe, nível, atributos, frascos, gravuras e benefícios dos amuletos. Conserva o maior IP do ciclo, inclusive depois de tirar equipamento. No Normal, o nível nominal move 0,58 nível inimigo por 2,4 pontos de IP acima ou abaixo da referência do Herdeiro equilibrado. Relaxado usa 0,32 e reduz base e piso em 3. Provação usa 0,65 e aumenta base e piso em 3. O novo ciclo aumenta base e limites em 2 por ciclo, até +10. Os nomes e avisos dos golpes continuam legíveis.

Os limites abaixo valem no primeiro ciclo Normal. Um mini-chefe fica um nível acima do inimigo comum da mesma fase, e um guardião, dois. O nível dos inimigos comuns reserva os dois níveis finais do teto para essa diferença.

| Fase | Nível-alvo e base | Piso | Teto |
| ---: | ---: | ---: | ---: |
| 1 | 3 | 0 | 7 |
| 2 | 5 | 0 | 10 |
| 3 | 6 | 1 | 11 |
| 4 | 8 | 3 | 13 |
| 5 | 9 | 4 | 14 |
| 6 | 10 | 5 | 15 |
| 7 | 12 | 6 | 18 |
| 8 | 13 | 7 | 19 |
| 9 | 14 | 8 | 20 |
| 10 | 15 | 9 | 21 |
| 11 | 16 | 10 | 22 |
| 12 | 17 | 11 | 23 |
| 13 | 18 | 12 | 24 |
| 14 | 19 | 13 | 25 |
| 15 | 21 | 15 | 27 |

Vida, dano e postura crescem de forma exponencial com o nível, e a recuperação e as pausas encurtam. Alguns inimigos encadeiam mais golpes, sempre com um novo aviso. Ecos e XP de inimigos rendem menos quando estão abaixo do nível do herói e um pouco mais quando estão acima. Cada encontro paga apenas uma vez por ciclo.

### Histórico da Rodada 2

Os números desta seção registram a Rodada 2 na edição 6.0.0, antes das mudanças de ritmo e classes. As novas medições estão no diagnóstico da Rodada 3. [Diagnóstico e medições](docs/DIAGNOSTICO-R3.md#medição-do-marco-1)

O dano da tabela é por contato na primeira etapa do modo Normal. As outras etapas aplicam +10% e +16%. Os multiplicadores de aviso e recuperação são aplicados à duração própria de cada golpe. A pausa fica entre a recuperação e o próximo ataque.

| Fase | Vida | Dano | Postura | Pausa, s | Aviso por etapa | Início da terceira etapa | Outros ajustes |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| 4 | 116 → 230 | 20 → 35 | 2 → 3 | 0,18 → 0,18 | 100/94/89% → 100/95/94% | 34% → 52% | Recuperação da etapa 1: 100% → 94% · Etapa 3: contraforte, martelo, corte → contraforte, martelo, contraforte, corte · Recuperação da etapa 3: 100% → 82% |
| 7 | 138 → 236 | 20 → 39 | 2 → 3 | 0,18 → 0,16 | 100/94/89% → 98/93/90% | 34% → 42% | — |
| 10 | 164 → 301 | 20 → 41 | 3 → 3 | 0,18 → 0,15 | 100/94/89% → 97/91/87% | 34% → 42% | — |
| 12 | 182 → 328 | 20 → 40 | 3 → 4 | 0,18 → 0,14 | 100/94/89% → 96/90/86% | 34% → 42% | Etapa 1: varredura, martelo → martelo, varredura, onda · Etapa 3: fragmentos, onda, martelo → fragmentos, duplo, martelo |
| 15 | 244 → 355 | 20 → 40 | 3 → 4 | 0,18 → 0,13 | 100/94/89% → 95/89/85% | 34% → 58% | Etapa 3: martelo, duplo, fornalhas, onda → fornalhas, martelo, fornalhas, duplo · Recuperação da etapa 3: 100% → 90% · Fornalhas na etapa 3: centro 44% ou bordas 50% → 66% do piso |

A simulação compara a versão da Rodada 1 com a Rodada 2 em arenas reais, no modo Normal, com **200** primeiras tentativas por combinação, semente **50601** e limite de **65 s**. O veterano mantém Aparo de Ferro I, com reação de 200–350 ms e erro de timing em 24% das leituras. O mediano reage em 300–450 ms, erra em 35% e esquiva no último instante. O novato reage em 450–650 ms, erra em 50% e joga com os comandos básicos. Na primeira tabela, mediano e novato usam o kit básico. Tempo geral e dano incluem as tentativas perdidas.

Rode `node ferramentas/testar-dificuldade-cinzas.mjs --tentativas=200 --semente=50601` para medir a versão instalada. Acrescente `--json` para exportar os resultados ou `--fonte=/caminho/da/edicao/src` para medir uma cópia de uma edição anterior.

| Fase | Nível | Piloto | Vitória, % | Tempo, s | Dano recebido | Mortes por tentativa |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| 4 | 2 | veterano | 100,0 → 89,5 | 7,8 → 14,2 | 14,9 → 52,3 | 0,000 → 0,105 |
| 4 | 2 | mediano | 100,0 → 64,0 | 7,6 → 18,3 | 29,9 → 157,0 | 0,000 → 0,360 |
| 4 | 2 | novato | 100,0 → 25,0 | 11,5 → 18,4 | 66,5 → 192,6 | 0,000 → 0,750 |
| 7 | 3 | veterano | 100,0 → 92,5 | 9,3 → 17,4 | 15,5 → 72,6 | 0,000 → 0,075 |
| 7 | 3 | mediano | 100,0 → 70,5 | 10,1 → 18,4 | 38,8 → 147,9 | 0,000 → 0,295 |
| 7 | 3 | novato | 100,0 → 35,5 | 10,9 → 18,0 | 55,3 → 188,3 | 0,000 → 0,645 |
| 10 | 4 | veterano | 100,0 → 85,0 | 11,4 → 22,1 | 20,1 → 97,1 | 0,000 → 0,150 |
| 10 | 4 | mediano | 100,0 → 74,0 | 10,0 → 19,5 | 27,2 → 138,6 | 0,000 → 0,260 |
| 10 | 4 | novato | 100,0 → 25,5 | 11,4 → 17,1 | 43,0 → 189,8 | 0,000 → 0,745 |
| 12 | 5 | veterano | 100,0 → 93,5 | 11,7 → 22,7 | 18,0 → 71,3 | 0,000 → 0,065 |
| 12 | 5 | mediano | 100,0 → 72,5 | 11,1 → 21,9 | 29,4 → 146,3 | 0,000 → 0,275 |
| 12 | 5 | novato | 100,0 → 33,0 | 13,2 → 21,3 | 55,6 → 189,3 | 0,000 → 0,670 |
| 15 | 6 | veterano | 100,0 → 90,0 | 15,3 → 24,4 | 29,8 → 88,5 | 0,000 → 0,100 |
| 15 | 6 | mediano | 100,0 → 83,0 | 15,5 → 21,6 | 55,9 → 123,3 | 0,000 → 0,170 |
| 15 | 6 | novato | 100,0 → 36,0 | 19,7 → 21,3 | 102,0 → 189,1 | 0,000 → 0,640 |

Células fora das faixas pedidas (14/15 dentro). F15 mediano 83,0%.

A terceira etapa mostra um losango dourado para a resposta de cada arena. A gravura abre uma oportunidade que também pode ser vencida com os movimentos básicos. O tempo da tabela de janelas considera as vitórias. A redução pareada considera apenas sementes vencidas nas duas condições.

| Fase | Gravura | Vitória sem → com | Ganho | Tempo sem → com | Redução pareada | Ativações |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 4 | Aparo de Ferro | 64,0 → 88,0% | 24,0 p.p. | 20,0 → 15,0 s | 26,8% | 155 |
| 7 | Quebra-Guarda | 70,5 → 94,5% | 24,0 p.p. | 18,8 → 13,3 s | 31,2% | 186 |
| 10 | Estocada da Aurora | 74,0 → 90,0% | 16,0 p.p. | 20,3 → 15,3 s | 27,0% | 180 |
| 12 | Pisada Sísmica | 72,5 → 91,0% | 18,5 p.p. | 22,6 → 17,1 s | 26,2% | 180 |
| 15 | Passo do Eco | 83,0 → 92,0% | 9,0 p.p. | 22,4 → 16,0 s | 29,2% | 164 |

As cinco gravuras atingiram 15 pontos percentuais a mais de vitória ou 20% de redução no tempo. A leitura do sinal e a sensação de dificuldade também precisam de avaliação humana.

## Provas e novo ciclo

Em **Provas**, o desafio do dia sorteia fase e modificador a partir da data UTC e guarda os cinco melhores tempos locais. O contrarrelógio registra o melhor tempo por fase e desenha um fantasma da marca. As provas usam personagens temporários, dificuldade normal e o cronômetro da simulação. O desafio do dia usa inimigos do segundo ciclo e o modificador da data. O menu exibe 19 conquistas locais.

Após a última saída, comece um novo ciclo com as estrelas, os atalhos, os amuletos e as gravuras adquiridas. Os guardiões retornam com um ataque adicional e cinco patrulhas extras aparecem na campanha. A vida inimiga sobe 10% por ciclo extra, até 50%. **Sem frascos** retira as doses. **Vigor curto** reduz o máximo de vigor em 25%. Os modificadores podem ser usados juntos.

## Desenvolvimento e testes

O jogo usa HTML, CSS, Canvas 2D e JavaScript. Com Node.js 18 ou superior, execute na pasta do projeto.

```sh
npm run preparar
npm test
```

O preparo gera a versão para abrir por duplo clique e o cache offline. `package.json` fornece a versão que abre o nome do cache, seguida do hash dos recursos do jogo. Ao ativar uma atualização, a PWA remove os caches anteriores do mesmo endereço. A suíte verifica versão, carregador, ativação, abertura offline, migração e combate. Há duas travessias por comandos simulados, uma com movimentos básicos e outra que explora os 45 desvios e os relicários. Para repetir apenas uma delas, execute `node ferramentas/testar-trilhas-cinzas.mjs --basico` ou `node ferramentas/testar-trilhas-cinzas.mjs --explorar`.

| Arquivo | Uso |
| --- | --- |
| [ajustes.js](src/cinzas/ajustes.js) | Vigor, dano, preços, cura, tempos de ataque e padrões dos guardiões |
| [trilhas.js](src/cinzas/trilhas.js) | Geometria, encontros, marcos, desvios e atalhos das 15 fases |
| [perfil.js](src/cinzas/perfil.js) | Formato de progresso, conversões e migração |
| [pintura.js](src/cinzas/pintura.js) | Câmera e desenho da partida |
| [som.js](src/cinzas/som.js) | Música, sinais e efeitos de impacto |

O arquivo da edição 4 tem a suíte própria `npm run test:legado`. [Inventário e comandos](docs/LEGADO.md)

`npm run test:classes` percorre o Normal inteiro com cada classe usando somente o kit básico. Para focar uma classe, rode `node ferramentas/testar-trilhas-cinzas.mjs --classe=feiticeiro`.

## Verificação da entrega

| Verificação | Resultado |
| --- | --- |
| Campanha básica | 15 fases e cinco guardiões sem mortes nem compra de técnicas. A travessia do Marco 2B manteve o nível inicial. |
| Campanha exploradora | 45 estrelas, cinco relicários vencidos, 32 santuários, 16 atalhos percorridos nos dois sentidos e seis gravuras adquiridas. Sem mortes e com o nível inicial no Marco 2B. |
| Novos inimigos e guardiões | Dez criaturas verificadas por aviso, alcance e dano. Cinco perigos, cinco arenas e ataques extras de novo ciclo. Os 22 casos de combate incluem as cinco janelas de ouro e as três etapas de cada guardião com kit básico. |
| Classes | As sete classes concluíram 15 fases e cinco guardiões só com os kits básicos. Ladino teve uma morte. As outras seis concluíram sem morrer. |
| Progresso | Saves v2, v3, v5, v6 e v7 anteriores aos atributos passaram pela conversão. Foram verificados inventário, marcas de ecos, retomada, refazer gratuito único e troca de classe no novo ciclo. |
| Atributos e escala | Testes de monotonicidade do IP, limites por fase, custos e ganho líquido nas 15 fases passaram. No Chromium, a evolução passou por teclado, toque e gamepad emulados. A matriz de dificuldade de 200 tentativas por célula está pendente. |
| Controles | Remapeamento, persistência e guia de tecla no HUD em Chromium. Gamepad virtual, multitoque, deslize e cancelamento em emulação. Alvos de 44 px ou mais em sete dimensões simuladas. |
| Navegador e PWA | A edição 7.0.0 abriu por `file://` e HTTP no Chromium. A seleção e a evolução passaram por teclado, toque emulado e gamepad emulado. A tela de evolução abriu com o servidor desligado. Na Rodada 2, o botão Atualizar jogo removeu o cache anterior. |
| Compatibilidade | 37 módulos gerados e 72 recursos no pré-cache na Rodada 2. Os 44 módulos inativos estão arquivados. A suíte legada passou 122 de 122 testes e percorreu 15 fases. |
| Desempenho emulado na Rodada 1 | Em três pares de medições de 300 quadros na F1, no Chromium com viewport de 390 × 844 e CPU limitada a 4×, a mediana ficou em 60 FPS nas duas versões. As faixas foram 59,6–60,0 antes e 59,2–60,0 depois. A mediana do custo p95 de simulação e desenho foi de 5,0 → 5,1 ms. |

A avaliação de áudio em alto-falantes, gamepad físico e toque, vibração e desempenho em Android e iPhone físicos permanece pendente. Use o [checklist de testes manuais](docs/CHECKLIST.md) para conferir esses fluxos.

Veja o [diagnóstico](docs/DIAGNOSTICO.md), o [changelog por marcos](docs/CHANGELOG.md), o [inventário do legado](docs/LEGADO.md) e os [créditos e itens de arte futura](arte/cinzas/CREDITOS.md).
