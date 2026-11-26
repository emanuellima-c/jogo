# Plano de entrega · Rodadas 2 e 3

Vou executar na ordem abaixo. Cada tarefa ou marco termina com `npm run preparar` quando houver mudança de fonte, `npm test`, um resumo do que mudou e uma checagem manual curta. A Rodada 2 terá suas próprias medições. As metas mais exigentes da Rodada 3 serão aferidas com a escala de poder ativa, depois da integração do Marco 2B.

| Etapa | Mudança | Risco e medida |
| --- | --- | --- |
| R2 · T1 | Pilotos veterano, mediano e novato, ajuste de guardiões e uma janela de ouro por luta | Preservar o kit básico e os avisos. Comparar os mesmos pilotos e sementes, com 200 ou mais tentativas por célula, e medir a vantagem da gravura. |
| R2 · T2 | Silhuetas e poses próprias, avisos dos perigos e galeria | Conferir dados e desenhos em alto contraste e em cinza. A confirmação de leitura cabe ao teste humano. |
| R2 · T3 | Edição 6.0.0 e cache versionado | Simular atualização a partir do cache anterior e abrir uma cópia servida offline. O formato de save continua independente da versão do jogo. |
| R2 · T4 | Arquivo da edição 4 e comando `test:legado` | Rastrear imports transitivos antes de mover. Rodar as duas suítes e testar `file://` e PWA com a edição arquivada fora do jogo ativo. |
| R3 · M1 | Ritmo de combate, objetivos de santuário e pilotos em fases comuns | Escalonar ataques e curas sem apagar avisos. Comparar vitória, dano, mortes, tempo e recompensas com a linha de base. |
| R3 · M2 | Seleção de classe, kits próprios e migração v7 | Preservar saves como Herdeiro e percorrer a campanha com o kit básico de cada classe. |
| R3 · M2B | Sete atributos, melhoria por ecos, retrato do poder, nível e resistências dos inimigos | Testar custos, soft caps, migrações, respec, monotonicidade e limites. Medir alvos acima e abaixo da curva, quatro builds por classe e o ganho líquido nas 15 fases. |
| R3 · M3 | Gravuras com papéis de combate, escala e recurso de classe | Comparar cada gravura ao básico em um cenário reproduzível. Ensaios seguem disponíveis e as recompensas extras ficam opcionais. |
| R3 · M4 | Catálogo de Bento conforme a classe e a progressão | Assegurar que cada oferta tenha origem e fase de acesso, preservando itens já obtidos. |
| R3 · M5 | Provas semeadas, pistas e assistência | Gerar e resolver mil instâncias por tipo, testar recompensas únicas e incluir as Provas na rota exploradora. |
| R3 · M6 | Até cinco melhorias de ritmo escolhidas a partir do diagnóstico | Relacionar cada melhoria a um problema observado e conferir o fluxo com teclado, toque emulado e gamepad simulado. |

No Marco 2B, o preço de evoluir precisa competir com o preço de comprar uma gravura. A resistência inimiga só será calculada na entrada, no descanso e no reaparecimento que retorna ao santuário. O retrato registrará uma referência de poder que resista à retirada deliberada de equipamento. A decisão entre conservar XP como registro separado ou convertê-lo em ecos, a equivalência de migração e o primeiro refazer gratuito serão verificados junto à economia.
