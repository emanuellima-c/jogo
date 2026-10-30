/** Regressões do carregador local: ordem, arquivo ausente, erro e diagnóstico visível. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const codigo = await readFile(new URL('../iniciar.js', import.meta.url), 'utf8');
const manifesto = "AventuraModulos.arquivos=['compat/dado.js','compat/main.js'];";
const fontesBase = {
  'compat/manifesto.js': manifesto,
  'compat/dado.js': "AventuraModulos.registrar('dado', e => { e.valor = 42; });",
  'compat/main.js': "AventuraModulos.registrar('src/main.js', (e, usar) => { globalThis.valor = usar('dado').valor; globalThis.inicios = (globalThis.inicios || 0) + 1; });"
};
async function executar(fontes, ajustar = () => {}) {
  const aviso = { hidden: false, textContent: '', setAttribute() {} };
  const palco = { dataset: {}, atributos: {}, setAttribute(k,v) { this.atributos[k] = v; } };
  const janela = new EventTarget();
  let contexto;
  const documento = {
    currentScript: { src: 'file:///teste%20com%20espaco/iniciar.js' },
    getElementById: id => id === 'palco' ? palco : aviso,
    createElement: () => ({}),
    head: { appendChild(script) {
      const caminho = new URL(script.src).pathname.replace('/teste%20com%20espaco/', '');
      queueMicrotask(() => {
        if (!(caminho in fontes)) { script.onerror?.(); return; }
        try { vm.runInContext(fontes[caminho], contexto); }
        catch (erro) {
          const evento = new Event('error'); Object.defineProperty(evento, 'error', { value: erro }); janela.dispatchEvent(evento);
        }
        script.onload?.();
      });
    }}
  };
  contexto = vm.createContext({ document: documento, window: janela, location: { protocol: 'file:' }, URL, setTimeout, clearTimeout });
  ajustar(contexto, documento);
  vm.runInContext(codigo, contexto);
  await new Promise(resolver => setImmediate(resolver));
  return { aviso, palco, contexto };
}
const certo = await executar(fontesBase);
assert.equal(certo.contexto.valor, 42);
assert.equal(certo.contexto.inicios, 1);
assert.equal(certo.aviso.hidden, true);
assert.equal(certo.palco.dataset.inicializacao, 'pronto');
assert.equal(certo.palco.atributos['aria-busy'], 'false');

const ausente = await executar({ ...fontesBase, 'compat/manifesto.js': "AventuraModulos.arquivos=['compat/faltando.js'];" });
assert.equal(ausente.palco.dataset.inicializacao, 'erro');
assert.equal(ausente.aviso.hidden, false);
assert.match(ausente.aviso.textContent, /faltando\.js/);
assert.equal(ausente.contexto.inicios, undefined);

const quebrado = await executar({ ...fontesBase, 'compat/dado.js': 'const = quebra;' });
assert.equal(quebrado.palco.dataset.inicializacao, 'erro');
assert.equal(quebrado.contexto.inicios, undefined);

const incompleto = await executar({ ...fontesBase, 'compat/dado.js': '/* Arquivo inválido, sem declaração do módulo. */' });
assert.match(incompleto.aviso.textContent, /Módulo ausente: dado/);
assert.equal(incompleto.palco.dataset.inicializacao, 'erro');

const vazio = await executar({ 'compat/manifesto.js': 'AventuraModulos.arquivos=[];' });
assert.equal(vazio.palco.dataset.inicializacao, 'erro');
assert.match(vazio.aviso.textContent, /lista de arquivos/);
console.log('5 testes do carregador local passaram: inicialização única, pasta com espaço, arquivo ausente, erro de código e registro incompleto/vazio.');
