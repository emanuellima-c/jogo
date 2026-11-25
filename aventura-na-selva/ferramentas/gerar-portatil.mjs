// Monta a entrada de um único arquivo a partir da mesma página e dos mesmos módulos.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { modulosEmUso } from './modulos-em-uso.mjs';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const tipos = { '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const ler = nome => readFile(path.join(raiz, nome), 'utf8');
async function dados(nome) {
  const mime = tipos[path.extname(nome)];
  if (!mime) throw new Error('Formato sem tipo definido: ' + nome);
  const bytes = await readFile(path.join(raiz, nome));
  return 'data:' + mime + ';base64,' + bytes.toString('base64');
}

let html = await ler('src/pagina.html.tmpl');
for (const [tag, folha] of html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)) {
  let css = await ler(folha);
  for (const [url, recurso] of css.matchAll(/url\(["']?([^)'"]+)["']?\)/g)) {
    if (!recurso.startsWith('data:')) {
      const arquivo = path.join(path.dirname(folha), recurso);
      css = css.replace(url, 'url("' + await dados(arquivo) + '")');
    }
  }
  html = html.replace(tag, () => '<style>\n' + css + '\n</style>');
}
html = html.replace(/\s*<link rel="manifest"[^>]*>/, '');
for (const [atributo, chave, nome] of html.matchAll(/(src|href)="((?:arte|pwa)\/[^"]+)"/g)) {
  html = html.replace(atributo, chave + '="' + await dados(nome) + '"');
}

const arte = {};
for (const nome of (await readdir(path.join(raiz, 'arte/cinzas'))).sort()) {
  if (tipos[path.extname(nome)]) arte[nome] = await dados('arte/cinzas/' + nome);
}
const modulos = await Promise.all((await modulosEmUso()).map(id => ler('compat/' + id)));
const codigo = 'globalThis.AventuraPortatil = { arte: ' + JSON.stringify(arte) +
  ', registrarModulos() {\n' + modulos.join('\n') + '\n} };\n' + await ler('src/iniciar.js');
html = html.replace('<script src="iniciar.js" defer></script>', () =>
  '<script>\n' + codigo.replace(/<\/script/gi, '<\\/script') + '\n</script>');
const saida = path.join(raiz, 'index.html');
if (process.argv.includes('--verificar')) {
  if (await readFile(saida, 'utf8') !== html) throw new Error('index.html desatualizado. Execute npm run preparar.');
} else {
  await writeFile(saida, html);
}
