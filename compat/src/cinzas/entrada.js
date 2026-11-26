// Gerado a partir de src/cinzas/entrada.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/entrada.js", function (exports, usar) {
"use strict";
const COMANDOS = [
  ['esq', 'Andar para a esquerda', ['KeyA', 'ArrowLeft']],
  ['dir', 'Andar para a direita', ['KeyD', 'ArrowRight']],
  ['pulo', 'Saltar', ['Space', 'KeyW', 'ArrowUp']],
  ['leve', 'Golpe leve', ['KeyJ', 'KeyX']],
  ['pesado', 'Golpe pesado', ['KeyK', 'KeyZ']],
  ['esquiva', 'Esquivar', ['ShiftLeft', 'ShiftRight', 'KeyL']],
  ['cura', 'Usar o frasco', ['KeyF']],
  ['interagir', 'Interagir', ['KeyE']],
  ['t1', 'Técnica I', ['KeyQ']],
  ['t2', 'Técnica II', ['KeyR']],
  ['pausa', 'Pausar', ['KeyP']],
  ['som', 'Som', ['KeyM']],
  ['talento', 'Talento da classe', ['KeyC']]
];

const COMANDO_POR_ID = new Map(COMANDOS.map(comando => [comando[0], comando]));
const LIMITE_TECLAS = 3;
const TECLAS_PARA_TALENTO = Array.from('CVBHNUITYABCDEFGHIJKLMNOPQRSTUVWXYZ',letra=>'Key'+letra)
  .concat(Array.from({length:10},(_,numero)=>'Digit'+numero),Array.from({length:10},(_,numero)=>'Numpad'+numero));
const TECLAS_VALIDAS = /^(?:Key[A-Z]|Digit[0-9]|Numpad[0-9]|Arrow(?:Left|Right|Up|Down)|Shift(?:Left|Right)|Space|Enter|Comma|Period|Slash|Semicolon|Quote|Bracket(?:Left|Right)|Backslash|Minus|Equal)$/;
const ROTULOS = {
  ArrowLeft:'←', ArrowRight:'→', ArrowUp:'↑', ArrowDown:'↓', Space:'Espaço', Enter:'Enter',
  ShiftLeft:'Shift esq.', ShiftRight:'Shift dir.', Comma:',', Period:'.', Slash:'/', Semicolon:';',
  Quote:"'", BracketLeft:'[', BracketRight:']', Backslash:'\\', Minus:'-', Equal:'='
};

const BOTOES_GAMEPAD = [
  ['pulo', 0, 'A'], ['esquiva', 1, 'B'], ['leve', 2, 'X'], ['pesado', 3, 'Y'],
  ['t1', 4, 'LB'], ['t2', 5, 'RB'], ['cura', 6, 'LT'], ['interagir', 7, 'RT'], ['pausa', 9, 'Start'],
  ['talento', 11, 'R3']
];
const ROTULOS_GAMEPAD = Object.fromEntries(BOTOES_GAMEPAD.map(([acao, , rotulo]) => [acao, rotulo]));
const ESQUERDA = 1 << 14;
const DIREITA = 1 << 15;
const CIMA = 1 << 12;
const BAIXO = 1 << 13;
const DIRECOES = ESQUERDA | DIREITA | CIMA | BAIXO;
const ZONA_MORTA = .42;

function nomeTecla(codigo) {
  return ROTULOS[codigo] ?? codigo.replace(/^Numpad/, 'Num ').replace(/^(?:Key|Digit)/, '');
}

function teclasPadrao() {
  return Object.fromEntries(COMANDOS.map(([acao, , codigos]) => [acao, [...codigos]]));
}

function validarTeclas(origem) {
  const padrao = teclasPadrao();
  const teclas = {};
  const usadas = new Set();
  for (const [acao] of COMANDOS) {
    const valor = origem?.[acao];
    const codigos = Array.isArray(valor) ? [...new Set(valor.slice(0, LIMITE_TECLAS)
      .filter(codigo => typeof codigo === 'string' && TECLAS_VALIDAS.test(codigo)))] : [];
    const semConflito=acao==='talento'&&!codigos.length?[TECLAS_PARA_TALENTO.find(codigo=>!usadas.has(codigo))]:padrao[acao];
    teclas[acao] = codigos.length ? codigos : semConflito;
    for (const codigo of teclas[acao]) {
      if (usadas.has(codigo)) return padrao;
      usadas.add(codigo);
    }
  }
  return teclas;
}

function validarOpcoesEntrada(origem = {}) {
  const limitar = (valor, maximo) => Number.isFinite(valor) ? Math.max(1, Math.min(maximo, valor)) : 1;
  return {
    teclas: validarTeclas(origem?.teclas),
    toqueEscala: limitar(origem?.toqueEscala, 1.25),
    toquePosicao: ['espalhado', 'central', 'canhoto'].includes(origem?.toquePosicao) ? origem.toquePosicao : 'espalhado',
    haptico: origem?.haptico === true,
    alternarSegurar: origem?.alternarSegurar === true,
    altoContraste: origem?.altoContraste === true,
    assistenciaPulo: limitar(origem?.assistenciaPulo, 1.6)
  };
}

function mascaraGamepad(controle) {
  let mascara = 0;
  for (let indice = 0; indice < 16; indice++) {
    const botao = controle.buttons[indice];
    if (botao?.pressed || botao?.value > .55) mascara |= 1 << indice;
  }
  const horizontal = controle.axes[0], vertical = controle.axes[1];
  if (!(mascara & (ESQUERDA | DIREITA))) {
    if (horizontal < -ZONA_MORTA) mascara |= ESQUERDA;
    if (horizontal > ZONA_MORTA) mascara |= DIREITA;
  }
  if (!(mascara & (CIMA | BAIXO))) {
    if (vertical < -ZONA_MORTA) mascara |= CIMA;
    if (vertical > ZONA_MORTA) mascara |= BAIXO;
  }
  return mascara;
}

class EntradaCinzas {
  constructor(emPartida, atalho, opcoes = () => ({}), tecnicas = () => [], talento = () => null) {
    this.emPartida = emPartida;
    this.atalho = atalho;
    this.opcoes = opcoes;
    this.tecnicas = tecnicas;
    this.talento = talento;
    this.fontes = new Map();
    this.pulsos = new Set();
    this.alternadas = new Map();
    this.ponteirosDirecao = new Set();
    this.botoes = [...document.querySelectorAll('#toque [data-controle]')];
    this.palco = document.getElementById('palco');
    this.zonaToque = document.getElementById('toque');
    this.dpad = this.zonaToque?.querySelector('.dpad');
    this.mascaraPad = 0;
    this.quadroPad = 0;
    this.indicePad = null;
    this.dispositivoAtual = '';
    this.usarDispositivo(window.matchMedia('(any-pointer: coarse)').matches ? 'toque' : 'teclado');
    this.atualizarOpcoes();

    window.addEventListener('keydown', evento => this.teclaPressionada(evento));
    window.addEventListener('keyup', evento => {
      const chave = 'k' + evento.code;
      if (!this.fontes.has(chave)) return;
      evento.preventDefault();
      this.soltar(chave);
    });
    window.addEventListener('blur', () => this.limpar());
    window.screen?.orientation?.addEventListener('change', () => this.limpar());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.limpar();
    });
    document.addEventListener('pointerdown', evento => {
      if (this.captura && !this.captura.alvo?.contains(evento.target)) this.cancelarCaptura();
    });

    for (const botao of this.botoes) {
      botao.addEventListener('pointerdown', evento => this.toquePressionado(evento, botao));
      for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        botao.addEventListener(tipo, evento => this.soltarPonteiro(evento.pointerId, tipo !== 'pointerup'));
      }
      botao.addEventListener('contextmenu', evento => evento.preventDefault());
    }
    // A captura mantém o evento no primeiro botão, mesmo ao deslizar para outro.
    for (const botao of this.botoes.filter(b => ['pulo','leve','pesado','esquiva'].includes(b.dataset.controle))) {
      botao.addEventListener('pointermove', evento => {
        const chave = 't' + evento.pointerId;
        if (!this.fontes.has(chave) || !this.emPartida()) return;
        const alvo = document.elementFromPoint(evento.clientX, evento.clientY)?.closest('.toque-acoes button');
        if (!alvo || alvo.disabled || alvo.dataset.controle === this.fontes.get(chave)) return;
        this.apertar(chave, alvo.dataset.controle);
      });
    }
    this.dpad?.addEventListener('pointermove', evento => this.moverDirecaoPorToque(evento));

    this.sondarGamepad = () => {
      this.quadroPad = 0;
      const controle = this.encontrarGamepad();
      this.atualizarGamepad(controle);
      if (controle) this.iniciarSondagem();
    };
    window.addEventListener('gamepadconnected', () => this.iniciarSondagem());
    window.addEventListener('gamepaddisconnected', () => this.iniciarSondagem());
    if (this.encontrarGamepad()) this.iniciarSondagem();
  }

  atualizarOpcoes() {
    this.preferencias = validarOpcoesEntrada(this.opcoes());
    this.atalhosTeclado = new Map();
    for (const [acao, codigos] of Object.entries(this.preferencias.teclas)) {
      for (const codigo of codigos) this.atalhosTeclado.set(codigo, acao);
    }
    if (this.zonaToque) {
      this.zonaToque.dataset.posicao = this.preferencias.toquePosicao;
      this.zonaToque.style.setProperty('--escala-toque', this.preferencias.toqueEscala);
    }
    this.limpar();
  }

  usarDispositivo(tipo) {
    if (tipo === this.dispositivoAtual) return;
    this.dispositivoAtual = tipo;
    this.toque = tipo === 'toque';
    if (this.palco) this.palco.dataset.dispositivo = tipo;
  }

  rotulo(acao) {
    if (this.dispositivoAtual === 'gamepad' && ROTULOS_GAMEPAD[acao]) return ROTULOS_GAMEPAD[acao];
    return nomeTecla(this.preferencias.teclas[acao]?.[0] || '');
  }

  capturarTecla(acao, slot, aoFinalizar) {
    const limite = Math.min(LIMITE_TECLAS, (this.preferencias.teclas[acao]?.length ?? 0) + 1);
    if (!COMANDO_POR_ID.has(acao) || !Number.isInteger(slot) || slot < 0 || slot >= limite) return;
    this.limpar();
    this.captura = { acao, slot, aoFinalizar, alvo: document.activeElement };
  }

  cancelarCaptura() {
    if (!this.captura) return;
    const { aoFinalizar } = this.captura;
    this.captura = null;
    aoFinalizar({ mensagem: 'Remapeamento cancelado.' });
  }

  concluirCaptura(evento) {
    if (evento.code === 'Escape' || evento.code === 'Tab') {
      if (evento.code === 'Escape') evento.preventDefault();
      this.cancelarCaptura();
      return;
    }
    if (evento.repeat) return;
    evento.preventDefault();
    const { acao, slot, aoFinalizar } = this.captura;
    this.captura = null;
    const teclas = validarTeclas(this.preferencias.teclas);
    const codigos = teclas[acao];
    if (evento.code === 'Backspace' || evento.code === 'Delete') {
      if (codigos.length === 1 || slot >= codigos.length) {
        aoFinalizar({ mensagem: 'Cada ação precisa de pelo menos uma tecla.' });
        return;
      }
      codigos.splice(slot, 1);
    } else {
      if (evento.altKey || evento.ctrlKey || evento.metaKey || !TECLAS_VALIDAS.test(evento.code)) {
        aoFinalizar({ mensagem: 'Escolha uma tecla sem atalhos do sistema.' });
        return;
      }
      const ocupada = this.atalhosTeclado.get(evento.code);
      if (ocupada && codigos[slot] !== evento.code) {
        aoFinalizar({ mensagem: 'A tecla já está em uso em ' + COMANDO_POR_ID.get(ocupada)[1].toLowerCase() + '.' });
        return;
      }
      codigos[slot] = evento.code;
    }
    aoFinalizar({ teclas, mensagem: COMANDO_POR_ID.get(acao)[1] + ' · ' + codigos.map(nomeTecla).join(' / ') });
  }

  teclaPressionada(evento) {
    if (this.captura) {
      this.concluirCaptura(evento);
      return;
    }
    const codigo = evento.code;
    const alvo = evento.target?.tagName;
    if (codigo !== 'Escape' && (/^(INPUT|SELECT|TEXTAREA)$/.test(alvo) || evento.target?.isContentEditable)) return;
    if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
    const acao = this.atalhosTeclado.get(codigo);
    if (codigo === 'Escape' || acao === 'pausa' || acao === 'som') {
      evento.preventDefault();
      if (!evento.repeat) {
        this.usarDispositivo('teclado');
        this.atalho(codigo === 'Escape' ? codigo : acao === 'som' ? 'KeyM' : 'KeyP');
      }
      return;
    }
    if (!this.emPartida() || !acao || /^(BUTTON|A|SUMMARY)$/.test(alvo) && ['Enter', 'Space'].includes(codigo)) return;
    evento.preventDefault();
    if (evento.repeat) return;
    this.usarDispositivo('teclado');
    this.apertar('k' + codigo, acao);
  }

  toquePressionado(evento, botao) {
    if (!this.emPartida() || evento.button !== 0 || botao.disabled) return;
    evento.preventDefault();
    this.captura = null;
    this.usarDispositivo('toque');
    botao.setPointerCapture(evento.pointerId);
    const acao = botao.dataset.controle;
    if (acao === 'esq' || acao === 'dir') this.ponteirosDirecao.add(evento.pointerId);
    else this.vibrar(9);
    this.apertar('t' + evento.pointerId, acao);
  }

  soltarPonteiro(indice, cancelado) {
    const chave = 't' + indice;
    const acao = this.fontes.get(chave);
    this.ponteirosDirecao.delete(indice);
    this.soltar(chave);
    if (cancelado && acao && !this.mantida(acao)) {
      this.pulsos.delete(acao);
      if (this.alternadas.delete(acao)) this.pintar();
    }
  }

  moverDirecaoPorToque(evento) {
    if (!this.emPartida() || !this.ponteirosDirecao.has(evento.pointerId)) return;
    const { left, right, top, bottom } = this.dpad.getBoundingClientRect();
    const chave = 't' + evento.pointerId;
    if (evento.clientX < left - 14 || evento.clientX > right + 14 ||
        evento.clientY < top - 14 || evento.clientY > bottom + 14) {
      this.soltar(chave);
      return;
    }
    const centro = (left + right) / 2;
    if (this.fontes.has(chave) && Math.abs(evento.clientX - centro) <= 5) return;
    const acao = evento.clientX < centro ? 'esq' : 'dir';
    if (acao !== this.fontes.get(chave)) this.apertar(chave, acao);
  }

  vibrar(duracao = 12) {
    if (this.toque && this.preferencias.haptico) navigator.vibrate?.(Math.min(45, Math.max(0, duracao)));
  }

  encontrarGamepad() {
    try {
      const controles = navigator.getGamepads?.();
      if (!controles) return null;
      for (const controle of controles) {
        if (controle?.connected && controle.mapping === 'standard') return controle;
      }
    } catch {
      // O navegador pode bloquear esta API em alguns contextos.
    }
    return null;
  }

  iniciarSondagem() {
    if (!this.quadroPad) this.quadroPad = window.requestAnimationFrame(this.sondarGamepad);
  }

  atualizarGamepad(controle) {
    const indice = controle?.index ?? null;
    if (indice !== this.indicePad) {
      for (const chave of this.fontes.keys()) {
        if (chave.startsWith('g')) this.soltar(chave);
      }
      for (const [acao, chave] of this.alternadas) {
        if (chave.startsWith('g')) this.alternadas.delete(acao);
      }
      this.pintar();
      this.mascaraPad = 0;
      this.indicePad = indice;
    }
    const mascara = controle ? mascaraGamepad(controle) : 0;
    const mudancas = mascara ^ this.mascaraPad;
    this.mascaraPad = mascara;
    if (!mudancas) return;
    if (!document.hasFocus() || document.hidden) return;
    if (mascara) this.usarDispositivo('gamepad');
    if (this.captura) return;

    const novos = mudancas & mascara;
    if (novos & (1 << 9)) {
      this.atalho('KeyP');
      return;
    }
    if (!this.emPartida()) {
      this.navegarComGamepad(novos);
      return;
    }
    this.aplicarBotaoGamepad(mudancas, mascara, ESQUERDA, 'esq');
    this.aplicarBotaoGamepad(mudancas, mascara, DIREITA, 'dir');
    for (const [acao, indice] of BOTOES_GAMEPAD) {
      if (acao !== 'pausa') this.aplicarBotaoGamepad(mudancas, mascara, 1 << indice, acao);
    }
  }

  aplicarBotaoGamepad(mudancas, mascara, bit, acao) {
    if (!(mudancas & bit)) return;
    const chave = 'g' + bit;
    if (mascara & bit) this.apertar(chave, acao);
    else this.soltar(chave);
  }

  navegarComGamepad(novos) {
    if (novos & (1 << 1)) {
      this.atalho('Escape');
      return;
    }
    if (!(novos & (DIRECOES | 1))) return;
    const alvos = [...this.palco.querySelectorAll('button:not(:disabled), a[href], summary')]
      .filter(elemento => !elemento.closest('[hidden], [inert]') && elemento.getClientRects().length &&
        (elemento.tagName === 'SUMMARY' || !elemento.closest('details:not([open])')));
    if (!alvos.length) return;
    const indice = alvos.indexOf(document.activeElement);
    const inicial = alvos.findIndex(elemento => elemento.id === 'partir' || elemento.classList.contains('primario'));
    if (novos & 1) {
      alvos[Math.max(0, indice < 0 ? inicial : indice)].click();
      return;
    }
    const avanco = novos & (ESQUERDA | CIMA) ? -1 : 1;
    const destino = indice < 0 ? Math.max(0, inicial) : (indice + avanco + alvos.length) % alvos.length;
    alvos[destino].focus();
  }

  mantida(acao) {
    for (const valor of this.fontes.values()) if (valor === acao) return true;
    return false;
  }

  aceitaAlternar(acao) {
    if (!this.preferencias.alternarSegurar) return false;
    if (acao === 'pulo') return true;
    if (acao === 'talento') return Boolean(this.talento()?.segurar);
    const slot = acao === 't1' ? 0 : acao === 't2' ? 1 : -1;
    return slot >= 0 && this.tecnicas()[slot] === 'quebra';
  }

  ativa(acao) {
    return this.aceitaAlternar(acao) ? this.alternadas.has(acao) : this.mantida(acao);
  }

  apertar(chave, acao) {
    const mantida = this.mantida(acao);
    this.fontes.set(chave, acao);
    if (!mantida) {
      if (!this.aceitaAlternar(acao)) this.pulsos.add(acao);
      else if (!this.alternadas.delete(acao)) {
        this.alternadas.set(acao, chave);
        this.pulsos.add(acao);
      }
    }
    this.pintar();
  }

  soltar(chave) {
    if (this.fontes.delete(chave)) this.pintar();
  }

  pintar() {
    for (const botao of this.botoes) botao.classList.toggle('ativo', this.ativa(botao.dataset.controle));
  }

  limpar() {
    this.fontes.clear();
    this.pulsos.clear();
    this.alternadas.clear();
    this.ponteirosDirecao.clear();
    this.captura = null;
    this.pintar();
  }

  ler() {
    const entrada = {
      eixo: Number(this.mantida('dir')) - Number(this.mantida('esq')),
      seguraPulo: this.ativa('pulo'),
      seguraT1: this.ativa('t1'),
      seguraT2: this.ativa('t2'),
      seguraTalento: this.ativa('talento')
    };
    for (const pulso of this.pulsos) entrada[pulso] = true;
    if (entrada.pulo && this.toque) entrada.puloPorToque = true;
    this.pulsos.clear();
    return entrada;
  }
}

Object.defineProperty(exports, "COMANDOS", { enumerable: true, get: () => COMANDOS });
Object.defineProperty(exports, "EntradaCinzas", { enumerable: true, get: () => EntradaCinzas });
Object.defineProperty(exports, "nomeTecla", { enumerable: true, get: () => nomeTecla });
Object.defineProperty(exports, "teclasPadrao", { enumerable: true, get: () => teclasPadrao });
Object.defineProperty(exports, "validarOpcoesEntrada", { enumerable: true, get: () => validarOpcoesEntrada });
});
