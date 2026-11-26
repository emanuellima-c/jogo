import { PLANTAS_SELVA } from './trilhas/selva.js';
import { PLANTAS_RUINAS } from './trilhas/ruinas.js';
import { PLANTAS_DESERTO } from './trilhas/deserto.js';
import { PLANTAS_NEVE } from './trilhas/neve.js';
import { PLANTAS_VULCAO } from './trilhas/vulcao.js';

// Trilha: [identificador, vão, largura, topo, material, amplitude X, amplitude Y, período, fase].
// Desvio: [origem, nome da estrela, lista de [centro relativo, altura relativa, largura, material, movimento]].
// Encontro: [id, tipo, piso, posição, patrulha, nome, fecha passagem, altura de voo, amuleto].
// Ambiente: [piso, posição, largura, tipo, direção]. Momento: [piso, posição, nome, texto].
// A posição neste array define o número da fase no perfil.
const PLANTAS = [...PLANTAS_SELVA, ...PLANTAS_RUINAS, ...PLANTAS_DESERTO, ...PLANTAS_NEVE, ...PLANTAS_VULCAO];

export { PLANTAS };
