# Aventura na Selva — Caminhos de Aurora

Projeto completo em **arquivos separados**, com HTML, cinco folhas CSS e 51 módulos JavaScript ES. Sem bibliotecas, instalação de pacotes, imagens, fontes ou áudios externos. Os gráficos são desenhados em canvas e os sons são sintetizados pela Web Audio API.

## Como rodar

1. Extraia o ZIP inteiro, preservando a pasta `aventura-na-selva`.
2. Entre na pasta extraída e dê **duplo clique em `index.html`**.
3. Aguarde a mensagem de preparação desaparecer e clique em **JOGAR**.

Mantenha `iniciar.js`, `css`, `src` e `compat` junto do HTML. Abra o arquivo depois de extrair; não o execute dentro do visualizador do ZIP.

Para desenvolver, você também pode abrir a pasta no VS Code e usar **Open with Live Server** no `index.html`.

Ou, com Python instalado, abra um terminal **dentro da pasta que contém index.html**:

```sh
python -m http.server 8000
```

No Windows, se necessário, use `py -m http.server 8000`. No macOS/Linux, use `python3 -m http.server 8000`.
Abra **http://localhost:8000**. Para encerrar o servidor, pressione Ctrl+C no terminal. Depois de extraído, o jogo não depende de conexão com a internet.

A abertura direta usa os scripts separados de `compat/`, já incluídos. Com Live Server ou Python, são carregados os módulos ES de `src/`. Não é necessário instalar nada para jogar por duplo clique.

## Edição visual · 3.2

- Cenários redesenhados em quatro planos: selva com copas e cascata, ruínas e arcos, dunas, neve com aurora e vulcões com fumaça.
- Novo atlas de protagonista de 32×48 pixels, com mochila, lenço, roupa sombreada, piscada e poses de corrida, salto e planar.
- Bento ganhou óculos, barba, roupas e animação; a barraca tem cobertura listrada, placa, ervas, estoque, lanternas e luz. O retrato da loja usa o mesmo personagem.
- Inimigos e guardiões têm contornos, rostos, detalhes e movimento; moedas e portais têm acabamento e brilho.
- Chão com grama, raízes, pedra, areia, gelo ou basalto; cidades com janelas, telhados e ruas que respeitam os buracos.
- HUD e loja com cores de tecido verde, latão e pergaminho.

Toda a arte é produzida por código. As camadas, o chão, o atlas e a barraca são guardados em canvas auxiliares; não são recriados a cada quadro. Nenhum arquivo de imagem, fonte ou áudio externo é necessário.

## Correção dos botões

A edição anterior carregava somente ES Modules: ao abrir pelo sistema de arquivos, o navegador bloqueava o JavaScript, deixando o menu visível sem eventos de clique. A inicialização agora detecta a abertura local e usa os scripts compatíveis. O menu fica coberto durante o carregamento; arquivos ausentes ou erros de inicialização geram uma mensagem visível. Os arquivos continuam separados.

## O que está incluído

- Quinze fases, cinco chefes com três etapas de ataque e dificuldade crescente.
- Selva, ruínas, deserto, neve e vulcão; cidades em parallax e ruas/telhados jogáveis na Cidade de Aurora.
- Inimigos com patrulha, campo de visão, perseguição, ataques próprios e variantes por ambiente.
- Moedas, vidas, checkpoints, combate, XP, níveis, combo, 16 relíquias com raridade e evolução por repetição.
- Bento do Cipó nas áreas de descanso: vida, escudo, ímã e melhorias permanentes compradas com moedas.
- Três provas gratuitas: sequência de símbolos (pulo duplo), memória (dash) e encaixe de peças (planar). Liberadas após as fases 1, 3 e 6, respectivamente.
- Os presentes de fase são escolhidos com Bento. Não há popup automático de upgrade.
- Menu animado original, mapa, personagem, desafios, opções, pausa, resultados, ranking local e Nova Expedição+.
- Três estrelas e três desafios por fase, totalizando 45 de cada.
- Música procedural para cada fase, menu e loja; volume, mute, tela cheia e redução de movimento.
- Salvamento automático versionado e importação/exportação de progresso JSON.

## Controles

| Ação | Teclas |
| --- | --- |
| Andar | A / D ou setas esquerda / direita |
| Pular | Espaço, W ou seta para cima; segure para aumentar a altura |
| Atacar | X ou J |
| Conversar com Bento | E, quando estiver próximo |
| Dash | Shift ou K, depois de aprender |
| Planar | C ou segurar pulo durante a queda, depois de aprender |
| Pausar / voltar | P ou Esc |
| Confirmar | Enter |
| Ativar / desativar som | M |
| Tela cheia | Botão ⛶ no canto superior |

No celular, os botões de toque aparecem automaticamente. Toque em **CONVERSAR COM BENTO** perto do mercador. No puzzle de peças, arraste ou selecione a peça e toque no destino.

O áudio começa somente após uma interação. Se o navegador não permitir a Fullscreen API, o jogo usa a janela expandida, mantendo a proporção do canvas.

## Organização

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Canvas, HUD e marcação das telas |
| `iniciar.js` | Inicialização, escolha entre abertura direta/servidor e diagnóstico de falhas |
| `compat/` | Cópias executáveis separadas dos módulos, usadas no duplo clique |
| `css/temas.css` | Paleta e variáveis CSS |
| `css/base.css` | Layout e regras gerais |
| `css/hud.css` | HUD e botões de toque |
| `css/menus.css` | Painéis e componentes dos menus |
| `css/aurora.css` | Título animado, fullscreen, loja, puzzles e transições |
| `src/main.js` | Inicialização, eventos do navegador e importação/exportação de save |
| `src/core/` | Engine, estados, entrada, câmera, laço fixo, eventos, pools, RNG e save |
| `src/ecs/` | Componentes, mundo, spatial hash e sistemas de simulação |
| `src/entidades/` | Jogador, fábrica de inimigos, gerenciador e chefes |
| `src/fases/` | Matrizes e dados das fases e áreas de descanso |
| `src/meta/` | Progressão, desafios, mercador e lógica pura dos puzzles |
| `src/dados/` | Definições de inimigos, variantes e relíquias |
| `src/render/` | Atlas procedural, tiles, atores, parallax, cenário e interface; `arte.js` compartilha as primitivas e `detalhes.js` pinta terreno e objetos |
| `src/audio/` | Síntese de efeitos, trilhas e agendamento de áudio |
| `src/debug/testes.js` | Testes de física, combate, progressão, puzzles e save |
| `ferramentas/testar.mjs` | Verificação de sintaxe, dependências locais e execução dos testes |
| `ferramentas/gerar-compatibilidade.mjs` | Gera ou verifica as cópias de `compat/`, sem dependências |
| `ferramentas/testar-inicializacao.mjs` | Regressões do carregador, incluindo arquivos ausentes e erros |

O laço em `core/loopPrincipal.js` atualiza a simulação em 60 Hz e interpola a renderização. O `Engine` coordena os sistemas, enquanto o barramento distribui eventos de dano, salto, coleta e mudança de estado. Partículas, projéteis e inimigos usam pools. A pausa e as telas da loja congelam a simulação e seus temporizadores.

## Progresso e migração

O save v3 usa a chave `aventura-selva-jornada-v3` no localStorage, protegido por try/catch. Lê também o save anterior da campanha e preserva nível, relíquias e avanço. O recorde antigo pode ser migrado.

O armazenamento pertence ao endereço e ao navegador. Para trazer o progresso do HTML anterior, exporte nas **Opções** daquele arquivo e importe nas **Opções** desta versão. Use sempre o mesmo endereço e porta para continuar automaticamente. Se o armazenamento estiver bloqueado, o jogo continua e informa isso no HUD.

## Editar o projeto

Edite os módulos originais em `src/`. Com servidor local, as alterações aparecem ao recarregar. Para atualizar também a versão aberta por duplo clique, execute `npm run preparar` com Node.js instalado. Esse comando recria os arquivos separados de `compat/`, sem compactar o jogo em um arquivo único. O ZIP já vem com essas cópias prontas.

## Ajustar dificuldade

- `src/core/configuracoes.js`: gravidade, aceleração, atrito, salto, velocidades, vidas, invulnerabilidade e balanceamento de combate.
- `src/dados/inimigos.js`: atributos, recompensas e variantes por ambiente.
- `src/meta/mercador.js`: produtos, preços e curva de custo das melhorias.
- `src/meta/puzzles.js`: sequência, memória, encaixe e fases necessárias para aprender movimentos.
- `src/fases/campanha.js`: disposição dos tiles, inimigos, perigos, estrelas, chefes e metas dos desafios.

## Adicionar uma fase

Edite os dados e matrizes em `src/fases/campanha.js`, seguindo a legenda de símbolos e o formato de uma fase existente. Mantenha as linhas com a mesma largura, início, portal e uma rota acessível sem poderes opcionais. Defina ambiente, perigos, criaturas, estrelas e desafios.

Para **acrescentar além das 15 fases**, atualize também os limites e tamanhos dos arrays em `core/configuracoes.js`, `core/save.js` e `meta/progressao.js`, a seleção/contagem de fases em `render/interfaceBase.js` e `render/interface.js`, os limites de progressão em `core/engine.js`, os temas em `audio/trilhas.js` e os testes. Os limites atuais são explícitos; acrescentar apenas uma matriz não amplia sozinho a campanha.

## Adicionar um inimigo

1. Cadastre os atributos e o identificador em `src/dados/inimigos.js`.
2. Configure a entidade/pool em `src/entidades/inimigos/fabrica.js` e no gerenciador, se necessário.
3. Implemente seu comportamento em `src/ecs/sistemas/ia.js`, reutilizando estados e visão existentes.
4. Acrescente o desenho em `src/render/atores.js`, uma entrada de spawn na fase e testes para o comportamento novo.

## Adicionar um item ou habilidade

Para relíquias permanentes, acrescente uma definição em `src/dados/poderes.js` e aplique o efeito em `src/meta/progressao.js` ou no sistema responsável. Verifique a validação do save e os testes de sorteio/repetição.

Para um coletável de cenário, adicione seu símbolo/dado à fase, crie a leitura em `src/ecs/mundo.js`, trate a recompensa em `src/core/engine.js` e desenhe em `src/render/renderizador.js`. Para produtos de loja, use `src/meta/mercador.js`.

## Testes

No navegador, abra **http://localhost:8000/?test=1** ou **Opções → Executar testes automáticos**. O relatório exibe os 89 testes. Eles incluem pulo, coyote/buffer, AABB, dano, checkpoint, moedas, pausa, poderes, inimigos, chefes, campanha, mercador, puzzles, proporção de tela e save.

Opcionalmente, com Node.js 18 ou superior, sem instalar pacotes:

```sh
npm test
```

`npm test` verifica a sincronia das cópias de compatibilidade, a sintaxe dos 104 scripts (originais, cópias, manifesto e carregador), os caminhos locais, os 89 testes do jogo e cinco cenários de inicialização. Os testes não exigem instalação de pacotes.

## Verificação e limites conhecidos

- [x] 89 testes do jogo e cinco testes de inicialização passaram após a correção.
- [x] Referências de HTML e imports locais verificadas; não há recursos de terceiros.
- [x] A simulação e o carregador de abertura direta foram preservados; o desenho do mundo, dos atores e da interface foi atualizado.
- [x] Abertura local pelo carregador real, menus, teclado, pausa, save, tela expandida e saída/retorno verificados com DOM simulado; seis fases renderizadas em canvas nativo.
- [ ] Validação manual desta distribuição em Chrome, Firefox, Edge e aparelhos reais permanece pendente.
- Para abrir sem servidor, extraia o pacote completo; a pasta `compat` faz parte do jogo.
- Fullscreen e armazenamento dependem das permissões e capacidades do navegador.
- Os testes de rotas verificam geometria e física; não substituem uma campanha completa jogada por uma pessoa.
