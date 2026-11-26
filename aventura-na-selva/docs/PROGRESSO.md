# Progresso de Santuários de Aurora

## Ponto de retomada

A Rodada 2 está integrada à edição 6.0.0 com save v6. O Marco 1 da Rodada 3 passou em `npm run preparar && npm test`. As travessias básica e exploradora cobriram as 15 fases sem mortes. A exploradora obteve 45 estrelas. A PWA atualizou o cache e reabriu com o servidor desligado no Chromium durante a Rodada 2. O arquivo da edição 4 passou 122 casos e 15 fases em `npm run test:legado`.

Na Rodada 2, 14 de 15 taxas de vitória atingiram as faixas e as cinco gravuras cumpriram o critério de vantagem. O mediano ficou em 83% contra o Grande Gorila. O Marco 1 acrescentou pressão de combate e três objetivos por fase. A nova medição das fases comuns ficou em 93,05% sem mortes, acima da faixa de 40–60%. A calibração no nível-alvo, com a escala ativa, cabe ao Marco 2B. [Medições e diagnóstico](DIAGNOSTICO-R3.md)

Na edição 7.0.0, o Marco 2 passou em `npm run preparar`, `npm test` e `npm run test:classes`. São sete kits jogáveis com a seleção ativa, migração v7 e troca de classe no novo ciclo. Ladino teve duas mortes e Piromante uma nas travessias de classe. As outras cinco terminaram sem mortes. No Chromium, a seleção passou via teclado, toque e gamepad emulados, e a retomada funcionou com o servidor desligado.

## Marco 2B · Ponto de parada

Atributos, evolução por ecos, redistribuição e retrato de escala ficam integrados. Os testes de migração cobrem v2, v3, v5, v6 e v7 anteriores aos atributos. Os testes puros verificam IP, soft caps, custos, limites e ganho líquido de poder. A tabela dos custos e limites está no README. Na retomada anterior, o Chromium abriu a tela de atributos por `file://` e pela PWA com o servidor desligado. Teclado, toque e gamepad emulados passaram.

A calibração aplicou os cinco candidatos de vida e dano. O Rei tem menos golpes aparáveis fora da janela dourada, com aviso mais longo e a investida preservada nas etapas 2 e 3. O Gorila usa Onda no lugar de Salto na terceira etapa. Salto segue exclusivo do NG+.

| Guardião | Vida / dano antes → depois | Vitória V/M/N antes → depois |
| --- | --- | --- |
| Rei das Presas | 230/35 → 246/32 | 81,5/21,0/2,0% → 84,0/49,5/8,5% |
| Matriarca | 236/39 → 237/41 | 84,5/39,5/10,5% → 78,5/41,5/10,5% |
| Titã | 301/41 → 310/40 | 70,0/57,0/21,0% → 67,5/50,5/15,0% |
| Guardião da Geada | 328/40 → 320/43 | 86,0/61,5/16,5% → 68,0/47,0/14,0% |
| Grande Gorila | 355/40 → 379/43 | 76,0/61,5/13,0% → 49,5/26,5/5,5% |

Normal, Herdeiro equilibrado no nível-alvo, semente 50601, 200 por célula. Quatro guardiões ficaram dentro da tolerância de ±5 p.p. O veterano ficou abaixo do mínimo de 55% no Gorila após duas iterações. Se a calibração for reaberta, o próximo passo é testar o intervalo após Onda na terceira etapa do Gorila e medir os três pilotos com essa mesma semente. [Tabela de dificuldade](DIAGNOSTICO-R3.md#calibração-do-marco-2b)

Nas fases comuns, o mediano terminou com 63,9% sem mortes e 98% de conclusão. O veterano ficou com 97% sem mortes e 100% de conclusão. Foram 100 travessias por fase e piloto, semente 50601. Com o novo piloto, antes e depois de encurtar as pausas e acelerar o flanco, a taxa sem mortes foi a mesma. O mediano ficou 3,9 p.p. acima da meta. Se a pressão for reavaliada, comece pelos encontros da F5 e F9, que ainda passaram de 90% sem mortes com o mediano. [Tabela das fases comuns](DIAGNOSTICO-R3.md#fases-comuns)

`npm run preparar && npm test` e `npm run test:classes` passaram. As duas travessias cobriram 15 fases sem morrer, e a exploradora coletou as 45 estrelas. As sete classes concluíram os cinco guardiões com o kit básico. Ladino morreu uma vez. As outras seis não morreram.

A matriz de níveis e builds permanece pendente. O Marco 3 está pendente. A leitura visual em combate, os sons, a sensação de progressão, o gamepad físico e os controles em Android e iPhone dependem da revisão humana. [Checklist](CHECKLIST.md)
