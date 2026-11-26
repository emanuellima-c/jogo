/** Verifica a árvore arquivada e executa os testes puros da edição 4. */
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
const modulos = (await arquivos(path.join(raiz, 'src'))).filter(nome => nome.endsWith('.js'));
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
console.log('Referências locais e sintaxe de ' + modulos.length + ' módulos: OK.');
const resultado = executarTestes();
console.log(resultado.texto);
if (resultado.falhas) process.exitCode = 1;
