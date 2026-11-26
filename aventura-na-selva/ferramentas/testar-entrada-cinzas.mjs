import assert from 'node:assert/strict';
import { EntradaCinzas, nomeTecla, teclasPadrao, validarOpcoesEntrada } from '../src/cinzas/entrada.js';
import { opcoesEntrada } from '../src/cinzas/controles-ui.js';

const ativos = new Set();
const janela = new EventTarget();
janela.matchMedia = () => ({ matches:true });
janela.requestAnimationFrame = () => 1;

const documento = new EventTarget();
let emPartida = true;
let preferencias = {};
let tecnicas = [];
let talento = null;
const vibracoes = [], atalhos = [];
const dpad = new EventTarget();
dpad.getBoundingClientRect = () => ({ left:0, right:98, top:420, bottom:466 });

function botao(acao, id) {
  const elemento = new EventTarget();
  elemento.id = id;
  elemento.tagName = 'BUTTON';
  elemento.dataset = { controle:acao };
  elemento.classList = { toggle:(_, ligado) => ligado ? ativos.add(acao) : ativos.delete(acao), contains:()=>false };
  elemento.setPointerCapture = () => {};
  elemento.getClientRects = () => [1];
  elemento.closest = () => null;
  elemento.focus = () => { documento.activeElement = elemento; };
  elemento.click = () => { elemento.cliques = (elemento.cliques ?? 0) + 1; };
  return elemento;
}

const botoes = ['esq','dir','pulo','leve','t1','t2','talento'].map(acao => botao(acao));
const menu = [botao('jogar','partir'), botao('opcoes','opcoes')];
const palco = { dataset:{}, querySelectorAll:() => menu };
const zona = { dataset:{}, style:{setProperty(){}}, querySelector:() => dpad };
documento.querySelectorAll = () => botoes;
documento.getElementById = id => id === 'palco' ? palco : zona;
documento.activeElement = null;
documento.hasFocus = () => true;

Object.defineProperties(globalThis, {
  window:{ value:janela, configurable:true },
  document:{ value:documento, configurable:true },
  navigator:{ value:{getGamepads:() => [], vibrate:ms => vibracoes.push(ms)}, configurable:true }
});
const entrada = new EntradaCinzas(() => emPartida, code => atalhos.push(code), () => preferencias, () => tecnicas, () => talento);

function emitir(alvo, tipo, propriedades = {}) {
  const evento = new Event(tipo, { cancelable:true });
  Object.assign(evento, propriedades);
  alvo.dispatchEvent(evento);
  return evento;
}

function pressionar(code) { emitir(janela, 'keydown', { code }); }
function soltar(code) { emitir(janela, 'keyup', { code }); }
function toque(alvo, tipo, pointerId) { emitir(alvo, tipo, { pointerId, button:0 }); }
function lerGamepad(pressionados = [], axes = [0, 0]) {
  entrada.atualizarGamepad({ index:0, mapping:'standard', axes, buttons:Array.from({ length:16 }, (_, i) =>
    ({ pressed:pressionados.includes(i), value:pressionados.includes(i) ? 1 : 0 })) });
}

assert.deepEqual(teclasPadrao().pulo, ['Space', 'KeyW', 'ArrowUp']);
assert.equal(nomeTecla('Numpad1'), 'Num 1');
assert.equal(nomeTecla('Quote'), "'");
const saneado = validarOpcoesEntrada({
  teclas:{esq:['KeyD']}, assistenciaPulo:4, toqueEscala:-1, haptico:'true', toquePosicao:'lateral'
});
assert.deepEqual(saneado.teclas, teclasPadrao());
assert.deepEqual([saneado.assistenciaPulo, saneado.toqueEscala, saneado.haptico, saneado.toquePosicao], [1.6, 1, false, 'espalhado']);
assert.match(opcoesEntrada({}), /aria-describedby="ajudaTeclas estadoControles"/);

pressionar('KeyA');
pressionar('ArrowLeft');
soltar('KeyA');
assert.equal(entrada.ler().eixo, -1);
soltar('ArrowLeft');
assert.equal(entrada.ler().eixo, 0);
pressionar('Space');
soltar('Space');
assert.deepEqual([entrada.ler().pulo, entrada.ler().pulo], [true, undefined]);

let captura;
entrada.capturarTecla('interagir', 0, resultado => { captura = resultado; });
pressionar('KeyF');
assert.match(captura.mensagem, /já está em uso/);
assert.equal(captura.teclas, undefined);
entrada.capturarTecla('interagir', 0, resultado => { captura = resultado; });
pressionar('Escape');
assert.match(captura.mensagem, /cancelado/);
assert.deepEqual(atalhos, []);
entrada.capturarTecla('interagir', 0, resultado => { captura = resultado; });
pressionar('KeyG');
assert.deepEqual(captura.teclas.interagir, ['KeyG']);
preferencias = { teclas:captura.teclas, toquePosicao:'canhoto', toqueEscala:1.15, haptico:true };
entrada.atualizarOpcoes();
assert.equal(zona.dataset.posicao, 'canhoto');
assert.equal(entrada.rotulo('interagir'), 'G');
pressionar('KeyE');
assert.equal(entrada.ler().interagir, undefined);
pressionar('KeyG');
assert.equal(entrada.ler().interagir, true);
soltar('KeyG');

toque(botoes[0], 'pointerdown', 3);
toque(botoes[2], 'pointerdown', 8);
assert.deepEqual([entrada.ler().eixo, entrada.ler().seguraPulo], [-1, true]);
assert.deepEqual(vibracoes, [9]);
emitir(dpad, 'pointermove', { pointerId:3, clientX:51, clientY:445 });
assert.equal(entrada.ler().eixo, -1);
emitir(dpad, 'pointermove', { pointerId:3, clientX:77, clientY:445 });
assert.equal(entrada.ler().eixo, 1);
toque(botoes[2], 'pointerup', 8);
assert.equal(entrada.ler().seguraPulo, false);
assert.equal(entrada.ler().eixo, 1);
toque(botoes[0], 'lostpointercapture', 3);
assert.equal(entrada.ler().eixo, 0);
assert.equal(ativos.size, 0);
toque(botoes[3], 'pointerdown', 5);
toque(botoes[3], 'pointercancel', 5);
assert.equal(entrada.ler().leve, undefined);

toque(botoes[1], 'pointerdown', 20);
toque(botoes[2], 'pointerdown', 21);
toque(botoes[2], 'pointerup', 21);
toque(botoes[2], 'lostpointercapture', 21);
const saltoRapido = entrada.ler();
assert.deepEqual([saltoRapido.eixo, saltoRapido.pulo, saltoRapido.puloPorToque, saltoRapido.seguraPulo], [1,true,true,false]);
assert.equal(entrada.ler().pulo, undefined);
toque(botoes[1], 'pointerup', 20);

// Um dedo segura a direção e o outro passa do pulo ao ataque. Um terceiro pode usar a técnica.
toque(botoes[1], 'pointerdown', 30);
toque(botoes[2], 'pointerdown', 31);
toque(botoes[4], 'pointerdown', 32);
documento.elementFromPoint = () => ({closest:() => botoes[3]});
emitir(botoes[2], 'pointermove', {pointerId:31,clientX:250,clientY:440});
const combinado = entrada.ler();
assert.deepEqual([combinado.eixo,combinado.puloPorToque,combinado.leve,combinado.t1],[1,true,true,true]);
toque(botoes[2], 'pointerup', 31);
toque(botoes[4], 'pointercancel', 32);
assert.equal(entrada.ler().eixo,1);
toque(botoes[1], 'pointerup', 30);
assert.equal(ativos.size,0);

preferencias.alternarSegurar = true;
tecnicas = ['quebra', 'aparo'];
entrada.atualizarOpcoes();
pressionar('Space');
soltar('Space');
assert.equal(entrada.ler().seguraPulo, true);
pressionar('Space');
soltar('Space');
assert.equal(entrada.ler().seguraPulo, false);
pressionar('KeyQ');
soltar('KeyQ');
pressionar('KeyR');
soltar('KeyR');
const tecnica = entrada.ler();
assert.deepEqual([tecnica.t1, tecnica.t2, tecnica.seguraT1, tecnica.seguraT2], [true, true, true, false]);
emitir(janela, 'blur');
assert.equal(entrada.ler().seguraT1, false);

lerGamepad([2, 7], [.62, 0]);
const controle = entrada.ler();
assert.deepEqual([controle.eixo, controle.leve, controle.interagir], [1, true, true]);
assert.equal(entrada.rotulo('interagir'), 'RT');
lerGamepad([2, 7], [.62, 0]);
assert.equal(entrada.ler().leve, undefined);
lerGamepad([14], [.62, 0]);
assert.equal(entrada.ler().eixo, -1, 'O direcional tem prioridade sobre o analógico.');
entrada.atualizarGamepad(null);
assert.equal(entrada.ler().eixo, 0);
lerGamepad([0]);
assert.equal(entrada.ler().seguraPulo, true);
entrada.atualizarGamepad(null);
assert.equal(entrada.ler().seguraPulo, false);

talento={segurar:true};
pressionar('KeyC');
soltar('KeyC');
const guarda=entrada.ler();
assert.deepEqual([guarda.talento,guarda.seguraTalento],[true,true]);
pressionar('KeyC');
soltar('KeyC');
assert.equal(entrada.ler().seguraTalento,false);
toque(botoes.at(-1),'pointerdown',18);
assert.equal(entrada.ler().seguraTalento,true);
toque(botoes.at(-1),'pointercancel',18);
assert.equal(entrada.ler().seguraTalento,false);
lerGamepad([11]);
const talentoDoPad=entrada.ler();
assert.deepEqual([talentoDoPad.talento,talentoDoPad.seguraTalento],[true,true]);
assert.equal(entrada.rotulo('talento'),'R3');
entrada.atualizarGamepad(null);
assert.equal(entrada.ler().seguraTalento,false);

emPartida = false;
lerGamepad([0]);
assert.equal(menu[0].cliques, 1);
lerGamepad([13]);
assert.equal(documento.activeElement, menu[0]);
lerGamepad([]);
lerGamepad([15]);
lerGamepad([0]);
assert.equal(menu[1].cliques, 1);
lerGamepad([9]);
lerGamepad([1]);
assert.deepEqual(atalhos, ['KeyP', 'Escape']);
assert.equal(entrada.ler().pulo, undefined);

console.log('Entrada verificada: remapeamento, multitoque, alternância, talento da classe, gamepad e menus.');
