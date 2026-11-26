/** Gera scripts separados para file://. Os módulos em src são a fonte editável. */
import { readFile, mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { modulosEmUso } from './modulos-em-uso.mjs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const verificar = process.argv.includes('--verificar');
function assinatura(id){
  return '// Gerado a partir de ' + id + '. Edite o original e execute npm run preparar.\n';
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
for (const id of await modulosEmUso()) {
  const arquivo = path.join(raiz, id);
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
  await gravar(saida, assinatura(id) +
    'globalThis.AventuraModulos.registrar(' + JSON.stringify(id) + ', function (exports, usar) {\n"use strict";\n' + texto.trim() + '\n});\n');
  manifesto.push(saida);
}
await gravar('compat/manifesto.js', '// Lista de arquivos para abertura local; gerada automaticamente.\n' +
  'globalThis.AventuraModulos.arquivos = ' + JSON.stringify(manifesto, null, 2) + ';\n');

const esperados = new Set(manifesto);
async function retirarSobras(pasta) {
  let retiradas = 0;
  for(const entrada of await readdir(path.join(raiz, pasta), {withFileTypes:true})){
    const arquivo = path.posix.join(pasta, entrada.name);
    if(entrada.isDirectory()){
      retiradas += await retirarSobras(arquivo);
      continue;
    }
    if(!entrada.isFile() || !arquivo.endsWith('.js') || esperados.has(arquivo))continue;
    const caminho = path.join(raiz, arquivo);
    if(!(await readFile(caminho, 'utf8')).startsWith(assinatura(arquivo.slice('compat/'.length))))continue;
    if(verificar)throw new Error('Cópia gerada fora do manifesto: ' + arquivo + '. Execute npm run preparar.');
    await unlink(caminho);
    retiradas++;
  }
  return retiradas;
}
const retiradas = await retirarSobras('compat/src');
if(retiradas)console.log(retiradas + ' cópias geradas fora do manifesto removidas.');
console.log(manifesto.length + ' módulos de compatibilidade ' + (verificar ? 'verificados.' : 'gerados.'));
