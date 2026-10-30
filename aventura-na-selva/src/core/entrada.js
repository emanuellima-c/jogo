import { ACOES as A } from './configuracoes.js';
const TECLAS = {
  ArrowLeft: A.esquerda, KeyA: A.esquerda, ArrowRight: A.direita, KeyD: A.direita,
  Space: A.pular, ArrowUp: A.pular, KeyW: A.pular,
  KeyP: A.pausa, Escape: A.pausa, Enter: A.confirmar,
  KeyX: A.atacar, KeyJ: A.atacar, ShiftLeft: A.dash, ShiftRight: A.dash, KeyK: A.dash,
  KeyE:A.interagir, KeyC:A.planar, KeyM: A.som, Digit1: A.um, Digit2: A.dois, Digit3: A.tres
};

/** Combina fontes sem perder uma tecla quando outra da mesma ação é solta. */
class Entrada {
  constructor(raiz = document) {
    this.teclas = new Set(); this.toques = new Map();
    this.mantidas = 0; this.pulsos = 0; this.abortar = new AbortController();
    const opcoes = { signal: this.abortar.signal };
    raiz.addEventListener('keydown', evento => {
      if (!TECLAS[evento.code] || /^(INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(evento.target.tagName)) return;
      if (evento.target.tagName === 'BUTTON' && (evento.code === 'Enter' || evento.code === 'Space')) return;
      evento.preventDefault();
      if (!evento.repeat) this.teclas.add(evento.code);
      this.sincronizar();
    }, opcoes);
    raiz.addEventListener('keyup', evento => {
      if (!TECLAS[evento.code]) return;
      evento.preventDefault(); this.teclas.delete(evento.code); this.sincronizar();
    }, opcoes);
    this.botoes = raiz.querySelectorAll('[data-controle]');
    for (const botao of this.botoes) {
      botao.addEventListener('pointerdown', evento => {
        evento.preventDefault();
        botao.setPointerCapture(evento.pointerId);
        this.toques.set(evento.pointerId, A[botao.dataset.controle]);
        botao.classList.add('ativo'); this.sincronizar();
      }, opcoes);
      const soltar = evento => {
        this.toques.delete(evento.pointerId);
        botao.classList.remove('ativo'); this.sincronizar();
      };
      botao.addEventListener('pointerup', soltar, opcoes);
      botao.addEventListener('pointercancel', soltar, opcoes);
      botao.addEventListener('lostpointercapture', soltar, opcoes);
      botao.addEventListener('contextmenu', evento => evento.preventDefault(), opcoes);
    }
    window.addEventListener('blur', () => this.limpar(), opcoes);
  }
  sincronizar() {
    let mascara = 0;
    for (const tecla of this.teclas) mascara |= TECLAS[tecla];
    for (const acao of this.toques.values()) mascara |= acao;
    this.pulsos |= mascara & ~this.mantidas;
    this.mantidas = mascara;
  }
  ativa(acao) { return (this.mantidas & acao) !== 0; }
  consumir(acao) {
    const ativa = (this.pulsos & acao) !== 0;
    this.pulsos &= ~acao;
    return ativa;
  }
  limparPulsos() { this.pulsos = 0; }
  limpar() {
    this.teclas.clear(); this.toques.clear(); this.mantidas = 0; this.pulsos = 0;
    for (const botao of this.botoes) botao.classList.remove('ativo');
  }
  destruir() { this.abortar.abort(); this.limpar(); }
}

export { Entrada };
