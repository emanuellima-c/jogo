/** Verifica as referências do projeto e executa os testes puros sem navegador. */
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { executarTestes } from '../src/debug/testes.js';

const raiz = fileURLToPath(new URL('../', import.meta.url));
async function arquivos(diretorio) {
  const lista = [];
  for (const entrada of await readdir(diretorio, { withFileTypes: true })) {
    const nome = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) lista.push(...await arquivos(nome));
    else lista.push(nome);
  }
  return lista;
}
const modulos = [...await arquivos(path.join(raiz, 'src')), ...await arquivos(path.join(raiz, 'compat')), path.join(raiz, 'iniciar.js')].filter(nome => nome.endsWith('.js'));
for (const nome of modulos) {
  const texto = await readFile(nome, 'utf8');
  const sintaxe = spawnSync(process.execPath, ['--check', nome], { encoding: 'utf8' });
  assert.equal(sintaxe.status, 0, sintaxe.stderr);
  for (const referencia of texto.matchAll(/^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm)) {
    assert(referencia[1].startsWith('.'), 'Importação externa: ' + referencia[1]);
    const alvo = path.resolve(path.dirname(nome), referencia[1]);
    assert((await stat(alvo)).isFile(), 'Módulo ausente: ' + alvo);
  }
}
const html = await readFile(path.join(raiz, 'index.html'), 'utf8');
for (const referencia of html.matchAll(/(?:src|href)="((?:(?:src|css)\/[^"?#]+)|iniciar\.js)"/g)) {
  assert((await stat(path.join(raiz, referencia[1]))).isFile(), 'Recurso ausente: ' + referencia[1]);
}
assert(!/<style\b|<script\b(?![^>]*\bsrc=)/i.test(html), 'HTML contém código embutido.');
console.log('Referências locais e sintaxe de ' + modulos.length + ' módulos: OK.');
const resultado = executarTestes();
console.log(resultado.texto);
if (resultado.falhas) process.exitCode = 1;
