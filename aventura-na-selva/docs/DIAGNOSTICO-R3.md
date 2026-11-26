# Diagnóstico da Rodada 3

## Linha de base

O `npm test` da edição 5.0.0 com save v6 saiu com código 0 em 19/11/2026. As duas rotas automatizadas concluíram 15 fases sem mortes. A básica terminou no nível 6 e a exploradora, com 45 estrelas, no nível 7. A rodada anterior mediu a Matriarca com 50 tentativas e observou a queda de 26,8 para 13,2 de dano médio. A nova linha de base, com 200 tentativas, usa o mesmo piloto veterano e semente decimal **50601**, em arenas reais, com dois frascos e Aparo de Ferro I. O piloto chega sozinho à arena com o nível indicado. Os resultados medem esse piloto. [Suíte](../package.json) · [Piloto original](../ferramentas/testar-dificuldade-cinzas.mjs)

| Guardião | Nível | Vitórias | Mortes | Tempo médio | Dano médio |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rei das Presas | 2 | 200/200 | 0 | 7,8 s | 14,9 |
| Matriarca das Ruínas | 3 | 200/200 | 0 | 9,3 s | 15,5 |
| Titã das Areias | 4 | 200/200 | 0 | 11,4 s | 20,1 |
| Guardião da Geada | 5 | 200/200 | 0 | 11,7 s | 18,0 |
| Grande Gorila | 6 | 200/200 | 0 | 15,3 s | 29,8 |

## Entrada do Marco 1

Após a Rodada 2, a linha de base imediata do Marco 1 é a edição 6.0.0 com save v6. `npm test` passou com 15 fases e zero mortes em cada travessia. O mesmo conjunto de 200 primeiras tentativas por combinação, semente **50601**, deu as seguintes taxas no Normal. Os dados de tempo, dano e mortes estão na tabela histórica da Rodada 2. [Curva de dificuldade](../README.md#curva-de-dificuldade)

| Guardião | Veterano | Mediano | Novato |
| --- | ---: | ---: | ---: |
| Rei das Presas | 89,5% | 64% | 25% |
| Matriarca das Ruínas | 92,5% | 70,5% | 35,5% |
| Titã das Areias | 85% | 74% | 25,5% |
| Guardião da Geada | 93,5% | 72,5% | 33% |
| Grande Gorila | 90% | 83% | 36% |

## Medição do Marco 1

No Normal, a cura passou de 48 para 36 por frasco, o preparo de 0,61 para 0,65 s e a regeneração de vigor de 34 para 30 por segundo. A proteção depois de receber dano passou de 0,67 para 0,56 s. Os ataques seguintes ao primeiro usam variação determinística de até 12% no aviso, dentro dos limites de cada golpe. No ensaio com dois vigias, o máximo simultâneo caiu de dois para um. Três objetivos foram acrescentados a cada fase.

Os duelos abaixo usaram **200 tentativas por combinação**, no Normal, com semente **50601**. Veterano com Aparo I e os outros dois pilotos com o kit básico. As diferenças entre arenas ainda pedem recalibração com a escala de poder do Marco 2B.

| Guardião | Veterano antes → depois | Mediano antes → depois | Novato antes → depois |
| --- | ---: | ---: | ---: |
| Rei das Presas | 89,5% → 75,5% | 64% → 14,5% | 25% → 3,5% |
| Matriarca das Ruínas | 92,5% → 88,5% | 70,5% → 29,5% | 35,5% → 4% |
| Titã das Areias | 85% → 57% | 74% → 55,5% | 25,5% → 12% |
| Guardião da Geada | 93,5% → 89% | 72,5% → 59,5% | 33% → 22,5% |
| Grande Gorila | 90% → 80,5% | 83% → 63,5% | 36% → 17% |

Nas dez fases comuns, **200 jornadas por fase** do mediano com a mesma semente deram 93,05% de conclusões sem morte, 0,0695 morte por jornada e 21,70 s de tempo médio. Nove fases ficaram em 100% sem morte. A F14 ficou em 30,5%, com 0,695 morte por jornada. Todas terminaram após as retomadas. A meta de 40–60% sem morte continua pendente.

```sh
node ferramentas/testar-dificuldade-cinzas.mjs --tentativas=200 --semente=50601
node ferramentas/testar-dificuldade-cinzas.mjs --comuns --piloto=mediano --tentativas=200 --semente=50601
```

Os dois percursos automáticos de regressão completaram as 15 fases sem mortes. O Chromium emulado verificou as três metas no HUD da F1 e o prêmio ao interagir com a segunda chama. A cadência humana de 2 a 4 minutos por novidade segue no checklist. [Verificação manual](CHECKLIST.md)

## Por que parece fácil

- **Erros consomem uma fração da cura disponível.** O herói começa com 100 de vida, dois frascos que curam 48 cada e reposição integral no santuário. No nível sugerido dos guardiões, são 103–115 de vida mais até 96 de cura. Os guardiões causam 20 de dano por contato na primeira etapa do modo normal, cerca de 22 na segunda e 23 na terceira. Após um impacto, o herói fica protegido por 0,67 s. Isso pode absorver a segunda janela de um repique sem exigir uma nova decisão de defesa. [Ajustes](../src/cinzas/ajustes.js) · [Dano e cura](../src/cinzas/combate.js) · [Descanso](../src/cinzas/jogo.js)
- **As respostas são previsíveis e deixam margem de vigor.** A esquiva custa 23 de 100 de vigor, protege por 0,18 s após 0,04 s de preparo e tem 0,11 s de recuperação. A regeneração livre é de 34 por segundo após 0,43 s. Os avisos nominais medem de 0,67 a 1,36 s. Os guardiões escolhem seus golpes em ordem fixa, com aviso reduzido a 94% e 89% nas últimas etapas. [Ajustes](../src/cinzas/ajustes.js) · [Padrões de ataque](../src/cinzas/inimigos.js)
- **A pressão de grupos é rara no percurso atual.** As fases têm de 2 a 6 inimigos, contando relicários. Numa amostra de herói parado em pontos de pisos firmes, o máximo observado foi de dois inimigos em aviso ou impacto ao mesmo tempo, o Penacho e o Escudo na nave da F12. A execução atual permite que cada inimigo decida por conta própria. Essa amostra identifica sobreposição, sem medir toda situação a que um jogador pode chegar. [Mapas](../src/cinzas/trilhas.js) · [IA](../src/cinzas/inimigos.js)

## Por que o ritmo pode perder o jogador

- **O começo oferece a mesma build e a mesma rota principal.** A entrada cria o mesmo herói para todo perfil. XP sobe automaticamente nos limiares de 84, 111 e 138 nos primeiros níveis e dá +3 de vida e pequeno bônus de dano, sem escolha de atributo. Os amuletos do começo estão em desvios, e a oficina usa o mesmo catálogo para todos. [Perfil](../src/cinzas/perfil.js) · [Progresso](../src/cinzas/progresso.js) · [Oficina](../src/cinzas/telas.js)
- **Falta uma decisão curta entre dois portais.** O HUD informa fase, vida, vigor, estrelas e interações. Portais abrem após os encontros obrigatórios. Desvios e atalhos têm valor, mas fora da rota exploradora o objetivo volta a ser vencer o encontro e seguir. A primeira gravura custa 8 ecos, concede uma ação condicionada à defesa, e a segunda exige a F2 e 14 ecos. O início alterna sobretudo ecos, saltos e avisos de inimigos. [HUD](../src/cinzas/aplicacao.js) · [F1–F3](../src/cinzas/trilhas/selva.js) · [Preços](../src/cinzas/ajustes.js)
- **A cadência humana precisa de observação.** O piloto básico leva 36, 34 e 16 s simulados nas três fases iniciais. Esses tempos permitem localizar a ordem de recompensas, mas não estimam minutos de exploração humana. O feedback de que o jogo não prende é do dono. Ritmo de recompensa e identidade de build são hipóteses para conferir em jogo. [Travessia](../ferramentas/testar-trilhas-cinzas.mjs)

## Por que as gravuras pouco mudam a luta

- **O custo compete com o básico.** O leve custa 14 de vigor e o pesado 29. Retorno custa 19 e exige a janela de 0,76 s aberta por uma esquiva precisa. Aparo custa 17 e protege por 0,15 s após 0,055 s de preparo, com golpe serrilhado fora da defesa. Quebra-Guarda custa 31 e exige pelo menos 0,42 s de preparo. A Estocada custa 25 e deixa 0,36 s de recuperação. A Pisada custa 28 e precisa de salto. Passo do Eco custa 18 e no primeiro nível é deslocamento aéreo. [Dados](../src/cinzas/ajustes.js) · [Condições de uso](../src/cinzas/combate.js)
- **O retorno nem sempre é legível antes de apertar.** O treino permite praticar e há efeitos distintos de aparo, eco, impacto e carga. Os botões de técnica indicam o nome equipado. Falta apresentar em conjunto custo, condição satisfeita e ganho esperado. A única ligação direta entre duas gravuras é o Aparo nível 3 abrir o Retorno. Os amuletos conferem bônus pontuais. Acertos precisos ainda não alimentam um recurso comum que permita planejar a próxima jogada. [HUD](../src/cinzas/aplicacao.js) · [Gravuras e amuletos](../src/cinzas/progresso.js) · [Combate](../src/cinzas/combate.js)

## Calibração do Marco 2B

Na linha de base, os inimigos usavam os números de tipo e guardião com +10% de vida por ciclo extra, até 50%. O Marco 2B passou a tirar um retrato do IP na entrada e no descanso, com maior IP do ciclo, piso e teto por fase. A escala é parcial. O ensaio puro já verificou que o Herdeiro equilibrado melhora a razão entre sua vida efetiva vezes dano pesado e a vida vezes dano do oponente de referência nas 15 fases, nas passagens de −6 níveis ao alvo e do alvo a +10. O cenário abaixo do alvo usa piso zero nas duas primeiras fases. [Cálculo de poder](../src/cinzas/poder.js) · [Teste dos invariantes](../ferramentas/testar-poder-cinzas.mjs)

Normal, Herdeiro equilibrado no nível-alvo, semente **50601**, **200 duelos por piloto e guardião** em cada versão. O veterano usa Aparo I. Faixas com tolerância de 5 pontos percentuais: veterano 55–85%, mediano 25–55%, novato 5–30%.

| Guardião (nível-alvo) | Vitória veterano | Vitória mediano | Vitória novato |
| --- | ---: | ---: | ---: |
| Rei das Presas (8) | 81,5% → 84,0% | 21,0% → 49,5% | 2,0% → 8,5% |
| Matriarca (12) | 84,5% → 78,5% | 39,5% → 41,5% | 10,5% → 10,5% |
| Titã (15) | 70,0% → 67,5% | 57,0% → 50,5% | 21,0% → 15,0% |
| Guardião da Geada (17) | 86,0% → 68,0% | 61,5% → 47,0% | 16,5% → 14,0% |
| Grande Gorila (21) | 76,0% → **49,5%** | 61,5% → 26,5% | 13,0% → 5,5% |

O veterano ficou abaixo da tolerância contra o Gorila após a segunda iteração. Na primeira, com Varredura no lugar do Salto na terceira etapa, o resultado foi 57,5% / 25,5% / 4,5%. A versão final usa Onda nessa etapa e preserva Salto como ataque exclusivo do NG+. Quatro guardiões atingiram as três faixas com tolerância. A matriz ampliada de níveis e builds ficou fora desta retomada.

`node ferramentas/testar-curva-poder-cinzas.mjs --grupo=guardioes --cenario=alvo --tentativas=200 --semente=50601`

### Fases comuns

O mediano reage em 300–450 ms e erra o timing em 35% das leituras. Em 35% dos saltos planejados, pode soltar o comando entre 130 e 270 ms. O veterano reage em 200–350 ms, erra em 24% e retém o salto por 250–400 ms quando erra. A comparação usa os mesmos pilotos nos dois balanços, no Normal, no nível-alvo e com semente **50601**. Foram **100 travessias por fase e piloto** em cada versão.

| Fase | Mediano sem mortes, antes → depois | Veterano sem mortes, antes → depois | Mortes médias do mediano, depois |
| ---: | ---: | ---: | ---: |
| 1 | 56% → 56% | 99% → 99% | 0,60 |
| 2 | 57% → 57% | 99% → 99% | 0,73 |
| 3 | 74% → 74% | 98% → 98% | 0,39 |
| 5 | 91% → 91% | 100% → 100% | 0,12 |
| 6 | 59% → 59% | 98% → 98% | 0,67 |
| 8 | 39% → 39% | 88% → 88% | 1,11 |
| 9 | 94% → 94% | 100% → 100% | 0,06 |
| 11 | 64% → 64% | 95% → 95% | 0,64 |
| 13 | 61% → 61% | 100% → 100% | 0,58 |
| 14 | 44% → 44% | 93% → 93% | 0,88 |
| **Total** | **63,9% → 63,9%** | **97,0% → 97,0%** | **0,578** |

O mediano concluiu 98% das tentativas, e o veterano, 100%. No Normal, a recuperação comum passou de 90% para 76% do tempo-base do golpe, a pausa caiu de 310 para 200 ms, o raio do grupo subiu de 110 para 124 px e o multiplicador de velocidade de flanco passou de 2,2 para 2,8. A taxa sem mortes ficou estável com esses ajustes. A queda em relação aos 93,05% históricos coincide com a mudança do perfil de travessia. O mediano terminou 3,9 pontos percentuais acima da meta de 40–60%.

`node ferramentas/testar-curva-poder-cinzas.mjs --grupo=comuns --cenario=alvo --piloto=mediano,veterano --tentativas=100 --semente=50601`
