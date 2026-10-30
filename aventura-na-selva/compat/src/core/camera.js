// Gerado a partir de src/core/camera.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/camera.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
class Camera {
  constructor(larguraMundo, reduzirMovimento = false) {
    this.limite = Math.max(0, larguraMundo - C.largura);
    this.x = 0; this.anteriorX = 0; this.trauma = 0; this.tempo = 0;
    this.reduzirMovimento = reduzirMovimento;
  }
  focar(jogador) {
    const t = jogador.transformacao;
    this.x = Math.max(0, Math.min(this.limite, t.x + t.largura / 2 - C.largura / 2));
    this.anteriorX = this.x; this.trauma = 0;
  }
  atualizar(jogador, dt) {
    this.anteriorX = this.x; this.tempo += dt;
    const t = jogador.transformacao;
    const alvo = Math.max(0, Math.min(this.limite,
      t.x + t.largura / 2 - C.largura / 2 + jogador.corpo.vx * C.cameraAntecipacao));
    this.x += (alvo - this.x) * (1 - Math.exp(-C.cameraSuavidade * dt));
    this.trauma = Math.max(0, this.trauma - C.cameraDecaimento * dt);
  }
  abalar() { if (!this.reduzirMovimento) this.trauma = C.cameraTrauma; }
  tremorX() { return Math.sin(this.tempo * 97) * this.trauma ** 2 * C.cameraTremor; }
  tremorY() { return Math.cos(this.tempo * 113) * this.trauma ** 2 * C.cameraTremor; }
}

Object.defineProperty(exports, "Camera", { enumerable: true, get: () => Camera });
});
