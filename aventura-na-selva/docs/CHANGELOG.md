# Alterações de Santuários de Aurora

## Rodada 3

| Marco | Alterações e arquivos principais | Teste rápido e cobertura automática |
| --- | --- | --- |
| M1 · Dificuldade e ritmo | `ajustes.js`, `inimigos.js` e `combate.js` definem turnos, flanco, combos com novos avisos e a economia de cura e vigor por modo. `fases.js`, `objetivos.js`, `jogo.js`, `aplicacao.js`, HTML e CSS mostram e pagam três metas em cada fase. | Acenda a segunda chama da F1 e confira a nova marca e os ecos. `testar-objetivos-cinzas.mjs` cobre prêmios e recarga. `testar-pressao-cinzas.mjs` cobre o flanco, a vez de atacar e a duração do aviso. |
| M2 · Classes | Sete kits em `ajustes.js`, combate e projéteis no motor e seleção em `telas.js` e `aplicacao.js`. `entrada.js`, `index.html` e CSS expõem o talento por teclado, toque e gamepad. `perfil.js` migra para v7 e conserva Herdeiro. | Escolha Feiticeiro, dispare duas centelhas e confira o Foco no HUD. `testar-classes-cinzas.mjs` mede os kits, o teste de perfil cobre migrações e `npm run test:classes` percorre as 15 fases por classe com os kits básicos. |
| M2B · Atributos e escala | Sete atributos em `ajustes.js`, Índice de Poder em `poder.js`, retrato de escala em `jogo.js` e `perfil.js`, evolução e refazer em `niveis-ui.js` e HUD de nível e resistências. A calibração estatística está em andamento. | Descanse, escolha Vitalidade e confira vida e custo antes de confirmar. `testar-poder-cinzas.mjs` cobre os cálculos e `testar-niveis-cinzas.mjs` cobre evolução, postura, retrato, refazer e recompensas. |

O teste do frasco nível III agora mede o preparo e a cura do modo, com três doses e 18 de vigor. O duelo de nível 1 passou de 28,3 s para 40 s de limite porque três vitórias com o kit básico foram truncadas após a redução da regeneração. As verificações de vitória com o kit básico, três vigílias e derrota por repetir ataques foram preservadas.

No Marco 2B, o teste de Quebra-Guarda e Estocada passou a calcular o dano com os atributos do ensaio, preservando a quebra de guarda, o alcance e o acerto único. O piloto automático volta ao piso do encontro se cair em outra plataforma. O planejador de saltos espera uma janela segura ao cruzar o vapor da F14, pois o jato ativo pode interromper a trajetória. A travessia continua sendo executada com os mesmos comandos do jogo.

Na calibração do Marco 2B, o teste de leitura passou a verificar a duração efetiva do aviso, limitada pelo mesmo cálculo da simulação, inclusive nos extremos da variação. A medição das fases comuns aplica erros de retenção de salto aos pilotos simulados. As travessias de regressão mantêm seus comandos precisos.

## Rodada 2

| Tarefa | Alterações e arquivos principais | Teste rápido e cobertura automática |
| --- | --- | --- |
| T1 · Guardiões | Rebalanceamento em `ajustes.js`, janelas de ouro em `inimigos.js` e `combate.js` e sinais em `atores-pixel.js`, `pintura.js`, `som.js` e `aplicacao.js`. | O Rei das Presas mostra um losango na terceira etapa. Aparo de Ferro na investida abre espaço para um golpe. `testar-combate-cinzas.mjs` cobre as cinco janelas e mantém a travessia dos chefes com kit básico. `testar-dificuldade-cinzas.mjs` mede os três pilotos e a gravura indicada. |
| T2 · Leitura visual | Dez desenhos originais e três poses em `criaturas-pixel.js`. Sinais de direção e alcance em `atores-pixel.js`. Cinco padrões e timbres de perigo em `ambiente.js` e `som.js`. Limites de aviso em `ajustes.js`. | Abra a `ferramentas/galeria.html` por servidor local e marque **Tons de cinza** e **Alto contraste**. `testar-leitura-cinzas.mjs` verifica o desenho e os 23 avisos por dados e primitivas Canvas. |
| T3 · Edição e cache | Edição 6.0.0 em `package.json`, no título e no manifesto. O cache inclui a edição e um hash dos recursos. `DIAGNOSTICO.md` registra o estado de cada problema. | `testar-pwa.mjs` confere a mesma versão nos pontos públicos, conserva o cache anterior enquanto a atualização espera e o remove na ativação. Abra a PWA, aceite a atualização e recarregue sem rede. |
| T4 · Edição 4 | Quarenta e quatro módulos arquivados em `legado/edicao-4/` com os dois testes. Oito dependências copiadas para isolar o arquivo. `gerar-arte.mjs` escreve o atlas JS no novo destino. | `npm run test:legado` verifica os 122 casos e percorre as 15 fases antigas. O teste arquivado de referências agora verifica sua própria árvore. A abertura por duplo clique e a PWA são verificadas com o jogo atual. |

O piloto de `testar-trilhas-cinzas.mjs` agora reage desde o início do aviso de guardião, reserva o pesado para uma recuperação com tempo suficiente e lê o segundo talho dos golpes duplos. O piloto anterior iniciava golpes durante o aviso e ficava preso na recuperação quando vinha o impacto. As duas rotas ainda exigem zero mortes e a básica continua sem gravuras.

## Rodada 1

A revisão mantém a identidade da edição 5.0 e passa a salvar no formato v6.

| Marco | Alterações e arquivos principais | Teste rápido e cobertura automática |
| --- | --- | --- |
| M1 · Biomas | Dez tipos novos, cinco perigos com aviso em solo firme e cinco relicários opcionais. Dados em `ajustes.js`, `trilhas.js` e `fases.js`. Execução em `ambiente.js`, `inimigos.js` e `fisica.js`. | Observe um perigo até acender e recue. `testar-biomas-cinzas.mjs` verifica os avisos e efeitos. A travessia exploradora inclui os relicários. |
| M2 · Guardiões | Três etapas e uma regra de arena para cada guardião. Ataques definidos em `ajustes.js`, executados em `inimigos.js` e desenhados em `atores-pixel.js` e `ambiente.js`. Barra e fala ligadas em `aplicacao.js`. | Abra uma arena pelo Atlas e baixe a vida até a primeira transição. Os testes de combate atravessam as três etapas no nível 1. |
| M3 · Progresso | Migração v2/v3/v5, 15 amuletos, gravuras em três níveis e melhorias do frasco. `perfil.js`, `progresso.js`, `combate.js`, `jogo.js` e `telas.js`. | Visite Bento para abrir os catálogos. `testar-perfil-cinzas.mjs` testa formatos antigos e retomada. `testar-progresso-cinzas.mjs` testa os efeitos e as compras. |
| M4 · Feedback | Pausas breves de impacto, câmera com antecipação, tremor e flash ajustáveis, poeira por terreno e deformação visual no salto e pouso. Momentos de fase anotados no percurso. `aplicacao.js`, `pintura.js`, `som.js` e `jogo.js`. | Compare o combate com efeitos ligados e desligados. A rota integra a simulação de movimento e combate. |
| M5 · Provas | Novo ciclo com cinco encontros adicionais, padrões de ataque ampliados e dois modificadores. Desafio diário UTC, contrarrelógio por fase, fantasma e 19 conquistas. `modos.js`, `aplicacao.js` e `telas.js`. | Abra Provas, corra a primeira fase e repita. `testar-modos-cinzas.mjs` verifica a semente, os recordes e a preservação de progresso no novo ciclo. |
| M6 · Entrada | Remapeamento, gamepad, multitoque, vibração opcional, layouts redimensionáveis, alto contraste e ajuste da assistência de salto. `entrada.js`, `controles-ui.js`, `index.html` e `css/santuarios.css`. | Troque a tecla de interação ou mova com o analógico. `testar-entrada-cinzas.mjs` simula teclado, toque, gamepad e cancelamento de gestos. |
| Entrega | Plantas divididas por bioma, 44 cópias geradas excedentes retiradas e registro dos 44 módulos legados de origem. `src/cinzas/trilhas/`, gerador de compatibilidade e `LEGADO.md`. | Abra por duplo clique e recarregue a PWA offline. A igualdade das plantas montadas foi comparada e `npm test` confere manifesto e precache. |

O [checklist](CHECKLIST.md) cobre validação no navegador e em aparelhos físicos. O [inventário do legado](LEGADO.md) documenta o recorte para publicação.
