import { readFile, writeFile } from 'node:fs/promises';

const raiz = new URL('../', import.meta.url);
const verificar = process.argv.includes('--verificar');
const arte = [
  ['ATLAS_HEROI', 'arte/personagem-atlas.png'],
  ['RETRATO_HEROI', 'arte/personagem-retrato.png']
];
let codigo = '// Gerado por npm run preparar. Edite os PNGs em arte/.\n';
for (const [nome, caminho] of arte) {
  const imagem = await readFile(new URL(caminho, raiz));
  codigo += 'const ' + nome + ' = ' + JSON.stringify('data:image/png;base64,' + imagem.toString('base64')) + ';\n';
}
codigo += '\nexport { ATLAS_HEROI, RETRATO_HEROI };\n';

const saida = new URL('src/dados/arteHeroi.js', raiz);
if (verificar) {
  if (await readFile(saida, 'utf8') !== codigo) throw new Error('Sprites embutidos desatualizados. Execute npm run preparar.');
} else await writeFile(saida, codigo);

// O Chromium exige uma origem HTTP para máscaras CSS externas. Embutir o atlas
// mantém os pictogramas também na abertura direta do ZIP extraído.
const pictogramas = await readFile(new URL('arte/interface.png', raiz));
const icones = ':root{--atlas-icones:url("data:image/png;base64,' + pictogramas.toString('base64') + '")}\n';
const folhaIcones = new URL('css/atlas.css', raiz);
if (verificar) {
  if (await readFile(folhaIcones, 'utf8') !== icones) throw new Error('Pictogramas desatualizados. Execute npm run preparar.');
} else await writeFile(folhaIcones, icones);
