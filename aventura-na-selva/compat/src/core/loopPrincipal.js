// Gerado a partir de src/core/loopPrincipal.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/loopPrincipal.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
/** Simulação fixa de 60 Hz, renderização interpolada e limite contra a espiral de atraso. */
class LoopPrincipal {
  constructor(atualizar, desenhar) {
    this.atualizar = atualizar; this.desenhar = desenhar;
    this.acumulador = 0; this.ultimo = null; this.ativo = false; this.id = 0;
    this.quadro = this.quadro.bind(this);
  }
  iniciar() {
    if (this.ativo) return;
    this.ativo = true; this.sincronizar();
    this.id = requestAnimationFrame(this.quadro);
  }
  parar() { this.ativo = false; cancelAnimationFrame(this.id); }
  sincronizar() { this.ultimo = null; this.acumulador = 0; }
  avancar(delta) {
    this.acumulador += Math.max(0, Math.min(delta, C.deltaMaximo));
    let passos = 0;
    // Este while é o laço principal da simulação: sempre usa o mesmo dt.
    while (this.acumulador + Number.EPSILON >= C.passo && passos < C.subpassosMaximos) {
      this.atualizar(C.passo);
      this.acumulador = Math.max(0, this.acumulador - C.passo);
      passos++;
    }
    if (this.acumulador >= C.passo) this.acumulador %= C.passo;
    this.desenhar(this.acumulador / C.passo);
  }
  quadro(agora) {
    if (!this.ativo) return;
    const delta = this.ultimo === null ? 0 : (agora - this.ultimo) / 1000;
    this.ultimo = agora;
    this.avancar(delta);
    if (this.ativo) this.id = requestAnimationFrame(this.quadro);
  }
}

Object.defineProperty(exports, "LoopPrincipal", { enumerable: true, get: () => LoopPrincipal });
});
