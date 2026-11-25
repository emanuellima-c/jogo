import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';


const raiz = new URL('../', import.meta.url);
const verificar = process.argv.includes('--verificar');
const {version:versaoJogo} = JSON.parse(await readFile(new URL('package.json', raiz), 'utf8'));
const manifesto = JSON.parse(await readFile(new URL('manifest.webmanifest', raiz), 'utf8'));
const arquivos = [
  'index.html', 'manifest.webmanifest',
  ...manifesto.icons.map(icone => icone.src)
].sort();
const modelo = await readFile(new URL('ferramentas/service-worker.modelo.js', raiz), 'utf8');
const hash = createHash('sha256').update(versaoJogo).update('\0').update(modelo);
for (const nome of arquivos) {
  hash.update(nome).update('\0').update(await readFile(new URL(nome, raiz))).update('\0');
}
const rotas = arquivos.map(nome => nome === 'index.html' ? './' : './' + nome);
const codigo = '// Gerado por npm run preparar a partir do modelo e dos arquivos do jogo.\n' +
  'const VERSAO_CACHE = ' + JSON.stringify(versaoJogo + '-' + hash.digest('hex').slice(0, 16)) + ';\n' +
  'const ROTAS = ' + JSON.stringify(rotas, null, 2) + ';\n\n' + modelo;
const saida = new URL('service-worker.js', raiz);
if (verificar) {
  if (await readFile(saida, 'utf8') !== codigo) throw new Error('Cache desatualizado. Execute npm run preparar.');
} else await writeFile(saida, codigo);
console.log(rotas.length + ' recursos da PWA ' + (verificar ? 'verificados.' : 'preparados.'));
