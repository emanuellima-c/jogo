// Gerado a partir de src/core/aleatorio.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/aleatorio.js", function (exports, usar) {
"use strict";
/** Xorshift32: uma seed igual produz a mesma sequência. Não use Math.random na simulação. */
class Aleatorio {
  constructor(seed) { this.reiniciar(seed); }
  reiniciar(seed) { this.estado = (seed >>> 0) || 1; }
  proximo() {
    let x = this.estado;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.estado = x >>> 0;
    return this.estado / 4294967296;
  }
  entre(minimo, maximo) { return minimo + (maximo - minimo) * this.proximo(); }
}

Object.defineProperty(exports, "Aleatorio", { enumerable: true, get: () => Aleatorio });
});
