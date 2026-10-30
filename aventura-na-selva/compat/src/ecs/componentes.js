// Gerado a partir de src/ecs/componentes.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/componentes.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
function transformacao(x, y) {
  return { x, y, anteriorX: x, anteriorY: y, largura: C.larguraJogador, altura: C.alturaJogador };
}
function corpo() { return { vx: 0, vy: 0, noChao: false }; }
function controle() { return { coyote: 0, buffer: 0, cortouPulo: true, direcao: 1, saltosRestantes: 0 }; }
function animacao() { return { estado: 'parado', tempo: 0, escalaY: 1, invulneravel: 0, flash: 0 }; }

Object.defineProperty(exports, "transformacao", { enumerable: true, get: () => transformacao });
Object.defineProperty(exports, "corpo", { enumerable: true, get: () => corpo });
Object.defineProperty(exports, "controle", { enumerable: true, get: () => controle });
Object.defineProperty(exports, "animacao", { enumerable: true, get: () => animacao });
});
