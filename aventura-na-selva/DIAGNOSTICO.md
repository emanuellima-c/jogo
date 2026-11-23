# Diagnóstico de Santuários de Aurora

A edição atual executa `src/main.js`, que monta `cinzas/aplicacao.js`, o jogo e o desenho em Canvas. O navegador usa WebAudio, o loop compartilhado e a migração de `core/save.js`. HTTP usa os módulos ES de `src/`. A abertura por duplo clique usa o manifesto e os scripts clássicos gerados em `compat/`. O [inventário do legado](LEGADO.md) lista os 44 módulos arquivados e os testes da campanha antiga.

| O que encontrei na linha de base | Estado | Evidência e pendências |
| --- | --- | --- |
| Quatro inimigos comuns se repetiam pelos biomas. | Resolvido | Cada bioma tem dois tipos próprios. O teste de leitura cobre três poses para cada tipo e 23 avisos em alto contraste. A revisão humana está no checklist. |
| Espinhos e plataformas concentravam os perigos. | Resolvido | Cinco perigos têm zonas anunciadas, padrões que se distinguem pela forma e timbres próprios. As duas travessias passaram com as zonas ativas. |
| Guardiões compartilhavam golpes e a curva estava branda. | Parcialmente resolvido | Três etapas e cinco janelas opcionais foram verificadas com o kit básico. Todos os pilotos venciam 100% na linha de base. Na Rodada 2, 14 de 15 taxas ficaram na faixa. O mediano ainda vence o Grande Gorila em 83% dos duelos. |
| Estrelas e ecos davam pouca escolha de equipamento. | Resolvido | Os 15 amuletos têm IDs persistentes e efeitos com contrapartidas. A suíte exercita aquisições e combinações. |
| Gravuras e frascos tinham comportamento fixo. | Parcialmente resolvido | Há três níveis, melhorias de frasco e janelas de ouro. O diagnóstico da Rodada 3 descreve o custo, as condições de uso e a falta de sinergias mais frequentes. |
| A câmera tinha pouca diferença de feedback ao acertar. | Resolvido | Pausa de impacto conserva pulsos de entrada. Tremor e flash têm ajuste, e a opção de redução de movimento vale para as marcas dos perigos. |
| Vários trechos pediam as mesmas ações em sequência. | Parcialmente resolvido | Há momentos anotados e cinco desvios de relicário. A variedade da sessão inicial e a cadência de recompensas pedem observação humana. |
| O ciclo reforçava principalmente a vida inimiga. | Resolvido | O ciclo inclui encontros, ataques de chefes e dois modificadores. Provas usam perfis temporários e guardam recordes locais. |
| Teclado fixo e ausência de gamepad no jogo ativo. | Resolvido | Remapeamento e mapeamento padrão de gamepad passaram em entrada simulada. Toque e controles físicos seguem no checklist. |
| Perfil v5, migração v2/v3 e cópias antigas em `compat/`. | Resolvido | As migrações v2/v3/v5 para v6 passam. Os 44 módulos inativos foram arquivados. A lista gerada em `compat/` coincide com a árvore ativa. |
| Número de edição estava disperso e o cache só mostrava um hash. | Resolvido | Pacote, título, manifesto e nome de cache apresentam 6.0.0. O teste de ativação cobre a troca do cache antigo e a abertura offline. |

Os marcos, arquivos, testes focados e verificações rápidas estão no [changelog](CHANGELOG.md).
