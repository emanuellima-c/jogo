// Gerado a partir de src/cinzas/trilhas.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/trilhas.js", function (exports, usar) {
"use strict";
const { PLANTAS_SELVA } = usar("src/cinzas/trilhas/selva.js");
const { PLANTAS_RUINAS } = usar("src/cinzas/trilhas/ruinas.js");
const { PLANTAS_DESERTO } = usar("src/cinzas/trilhas/deserto.js");
const { PLANTAS_NEVE } = usar("src/cinzas/trilhas/neve.js");
const { PLANTAS_VULCAO } = usar("src/cinzas/trilhas/vulcao.js");
// Trilha: [identificador, vão, largura, topo, material, amplitude X, amplitude Y, período, fase].
// Desvio: [origem, nome da estrela, lista de [centro relativo, altura relativa, largura, material, movimento]].
// Encontro: [id, tipo, piso, posição, patrulha, nome, fecha passagem, altura de voo, amuleto].
// Ambiente: [piso, posição, largura, tipo, direção]. Momento: [piso, posição, nome, texto].
// A posição neste array define o número da fase no perfil.
const PLANTAS = [...PLANTAS_SELVA, ...PLANTAS_RUINAS, ...PLANTAS_DESERTO, ...PLANTAS_NEVE, ...PLANTAS_VULCAO];

Object.defineProperty(exports, "PLANTAS", { enumerable: true, get: () => PLANTAS });
});
