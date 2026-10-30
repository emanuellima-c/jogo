/** Gera scripts separados para file://. Os módulos em src são a fonte editável. */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const verificar = process.argv.includes('--verificar');
async function listar(diretorio) {
  const resultado = [];
  for (const item of await readdir(diretorio, { withFileTypes: true })) {
    const arquivo = path.join(diretorio, item.name);
    if (item.isDirectory()) resultado.push(...await listar(arquivo));
    else if (item.name.endsWith('.js')) resultado.push(arquivo);
  }
  return resultado.sort();
}
async function gravar(nome, conteudo) {
  const arquivo = path.join(raiz, nome);
  if (verificar) {
    if (await readFile(arquivo, 'utf8') !== conteudo) throw new Error('Cópia local desatualizada: ' + nome + '. Execute npm run preparar.');
  } else {
    await mkdir(path.dirname(arquivo), { recursive: true });
    await writeFile(arquivo, conteudo);
  }
}
const manifesto = [];
for (const arquivo of await listar(path.join(raiz, 'src'))) {
  const id = path.relative(raiz, arquivo).split(path.sep).join('/');
  let texto = await readFile(arquivo, 'utf8');
  texto = texto.replace(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm, (_, nomes, referencia) => {
    const dependencia = path.posix.normalize(path.posix.join(path.posix.dirname(id), referencia));
    const campos = nomes.split(',').map(n => n.trim().replace(/\s+as\s+/, ': ')).join(', ');
    return 'const { ' + campos + ' } = usar(' + JSON.stringify(dependencia) + ');';
  });
  texto = texto.replace(/^export\s*\{([^}]+)\};?\s*$/gm, (_, nomes) => nomes.split(',').map(n => {
    const [local, publico = local] = n.trim().split(/\s+as\s+/);
    return 'Object.defineProperty(exports, ' + JSON.stringify(publico) + ', { enumerable: true, get: () => ' + local + ' });';
  }).join('\n'));
  if (/^\s*(?:import|export)\s/m.test(texto)) throw new Error('Formato não suportado em ' + id);
  const saida = 'compat/' + id;
  await gravar(saida, '// Gerado a partir de ' + id + '. Edite o original e execute npm run preparar.\n' +
    'globalThis.AventuraModulos.registrar(' + JSON.stringify(id) + ', function (exports, usar) {\n"use strict";\n' + texto.trim() + '\n});\n');
  manifesto.push(saida);
}
await gravar('compat/manifesto.js', '// Lista de arquivos para abertura local; gerada automaticamente.\n' +
  'globalThis.AventuraModulos.arquivos = ' + JSON.stringify(manifesto, null, 2) + ';\n');
console.log(manifesto.length + ' módulos de compatibilidade ' + (verificar ? 'verificados.' : 'gerados.'));
