// Gerado a partir de src/core/recursos.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/recursos.js", function (exports, usar) {
"use strict";
/** Na edição portátil o mapa contém os mesmos recursos como URLs de dados. */
function arte(nome) {
  return globalThis.AventuraPortatil?.arte[nome] ?? ('arte/cinzas/' + nome);
}

Object.defineProperty(exports, "arte", { enumerable: true, get: () => arte });
});
