# Aventura na Selva · Arquivo da edição 4

Este arquivo preserva o motor ECS, a campanha, os puzzles e os testes da edição 4. Contém os 44 módulos retirados da árvore atual e oito dependências copiadas para executar os testes em isolamento.

Com Node.js 18 ou superior, rode `npm run test:legado` na raiz do projeto. Dentro desta pasta, os comandos equivalentes são `node ferramentas/testar.mjs` e `node ferramentas/testar-campanha.mjs`. O primeiro verifica a sintaxe, as referências da árvore arquivada e os 122 casos da edição 4. O segundo percorre as 15 fases com comandos de jogo simulados.
