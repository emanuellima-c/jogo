# Arte de Santuários de Aurora

Os sprites de Walter White, Bento, criaturas e guardiões, o retrato de Bento, o sigilo e os ícones foram desenhados para esta edição. Os atlas estão em `arte/cinzas/`. A fonte editável dos sprites está em `ferramentas/pintar-personagens.py`. O terreno, as armadilhas e a cenografia da oficina também têm desenho próprio em Canvas. Os timbres e as melodias foram compostos para esta edição.

A capa, os 15 painéis de fase e as imagens decorativas do atlas, do descanso e da oficina foram criados com a ferramenta integrada OpenAI ImageGen em modo de geração de imagem. A capa de Walter White foi editada a partir da capa da edição 7 e da referência fotográfica fornecida para o protagonista, em modo de edição de imagem. Foi exportada como `capa.webp`. Os três painéis compostos foram recortados em `f01.webp` a `f15.webp`, `oficina.webp`, `santuario.webp` e `mesa.webp`. Cada paisagem de fase tem 576 × 324 pixels e é recortada pela câmera na escala nativa.

## Efeitos desta revisão

Os desenhos originais das dez criaturas dos biomas estão em `src/cinzas/criaturas-pixel.js`. Os cinco mini-chefes usam o atlas original com marcas em Canvas. Os sinais de direção e alcance, os cinco motivos dos perigos, as partículas, os sinais de arena e o fantasma do contrarrelógio são feitos em código. Os timbres de perigo, aparo e impacto metálico usam síntese WebAudio.

Uma revisão visual futura pode acrescentar quadros próprios para os cinco mini-chefes em `criaturas.png`, ícones para os amuletos e poses de transição para os guardiões. As representações atuais estão na galeria de leitura.

## Descrição da capa

Walter White está sobre a plataforma de pedra, de camisa verde-oliva, bermuda clara, óculos e botas, com a espada da Aurora apontada para baixo. Ele olha em direção ao eclipse sobre as ruínas e as cachoeiras. A área escura à esquerda dá espaço ao título do jogo.

## Descrição compartilhada pelas três folhas

```text
Original artisanal 1990s 16-bit dark fantasy platform game background art set in mythical Brazilian jungle ruins. Crisp hand-placed square pixel clusters, stepped diagonals, restrained colored light, painterly composition but true pixel art at native 384 by 220 per panel (deliberately visible pixels); no smooth brush marks, painterly blur, crayon or vector. Atmospheric mural depth with layers of mossy silhouettes and architectural scale. Shadow palette blue-black, iron indigo and subtle desaturated jade, amber or muted lilac highlights depending on scene. Keep the bottom quarter relatively muted to leave space for bright game terrain composited later. No UI, no frames, no text, no lettering, no numbers, no player, no obvious playable floating platforms. Perfect full bleed sheet of SIX equally large separate landscape paintings, 2 columns and 3 rows. Straight invisible boundaries between panels; each panel is wide approximately 16:9; overall sheet near square (about 1.18:1). All six paintings are different places.
```

O conteúdo específico das folhas, em ordem de leitura, foi mangue ao amanhecer, palafitas alagadas, guindastes sobre cachoeira, pontes de uma cidade em ruínas, lua e cristais no Templo dos Ecos e campanário. A segunda contém sentinelas esculpidas no deserto, cisternas com rodas de cobre, desfiladeiro com pontes, cidadela nevada, espigões de gelo e claustro com aurora. A terceira contém fornalhas de basalto, caminhos para o vulcão, altar com disco do eclipse partido, oficina de Bento, santuário talhado entre raízes e mesa de cartografia.

## Fontes

Barlow e Silkscreen são distribuídas sob a SIL Open Font License 1.1. [Barlow](../fontes/licenca-barlow.txt) · [Silkscreen](../fontes/licenca-silkscreen.txt)
