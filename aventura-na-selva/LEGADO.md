# Inventário do código legado

O ponto de entrada é `src/main.js`. Na Rodada 2, a comparação anterior à movimentação encontrou 37 módulos importados por `modulosEmUso()` e 44 fora da árvore usada por HTTP, `compat/manifesto.js` e service worker. Os 44 caminhos abaixo são relativos à pasta `legado/edicao-4/`. Os geradores seguem a lista de módulos em uso.

```text
src/core/barramentoEventos.js
src/core/camera.js
src/core/engine.js
src/core/entrada.js
src/core/estado.js
src/core/maquinaEstados.js
src/core/pool.js
src/core/telaCheia.js
src/dados/arteHeroi.js
src/dados/inimigos.js
src/debug/testes.js
src/ecs/componentes.js
src/ecs/mundo.js
src/ecs/sistemas/animacao.js
src/ecs/sistemas/colisao.js
src/ecs/sistemas/combate.js
src/ecs/sistemas/dano.js
src/ecs/sistemas/fisica.js
src/ecs/sistemas/ia.js
src/ecs/sistemas/movimento.js
src/ecs/sistemas/particulas.js
src/ecs/sistemas/plataformas.js
src/ecs/sistemas/projeteis.js
src/ecs/spatialHash.js
src/entidades/chefes/grandeGuardiao.js
src/entidades/inimigos/fabrica.js
src/entidades/inimigos/gerenciador.js
src/entidades/jogador.js
src/fases/campanha.js
src/fases/descanso.js
src/fases/teste.js
src/meta/desafios.js
src/meta/mercador.js
src/meta/puzzles.js
src/render/arte.js
src/render/atores.js
src/render/detalhes.js
src/render/extras.js
src/render/gerarSprites.js
src/render/interface.js
src/render/interfaceBase.js
src/render/paisagens.js
src/render/parallax.js
src/render/renderizador.js
```

`npm run test:legado` executa os dois testes a partir do arquivo. `testar.mjs` verifica sintaxe, imports e os casos em `src/debug/testes.js`. `testar-campanha.mjs` importa `src/core/engine.js` e percorre as 15 fases. A parte do teste antigo que lia HTML e `compat` da raiz passou a ser verificada pelas suítes atuais de inicialização e PWA. [Arquivo da edição 4](legado/edicao-4/README.md)

O gerador já havia retirado 44 cópias assinadas fora do manifesto na Rodada 1. A execução com `--verificar` detecta sobras, e o teste do cache exclui os caminhos `legado/`, `ferramentas/`, `compat/` e `src/debug/` da PWA. A ferramenta `gerar-arte.mjs` grava o atlas JS no arquivo da edição 4, onde o renderizador antigo o importa.

`src/core/save.js`, `src/dados/poderes.js`, `src/meta/progressao.js`, `src/audio/motorAudio.js` e `src/audio/trilhas.js` seguem na árvore atual. O arquivo da edição 4 tem cópias próprias dessas dependências para isolar os testes. As migrações v2, v3 e v5 são verificadas na suíte atual.
