// O carregador local e o cache offline usam a mesma árvore que o navegador inicia em src/main.js.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const raiz=new URL('../',import.meta.url);
export async function modulosEmUso(){
  const vistos=new Set();
  async function visitar(id){
    if(vistos.has(id))return;
    vistos.add(id);
    const fonte=await readFile(new URL(id,raiz),'utf8');
    const referencias=[...fonte.matchAll(/^import\s*\{[^}]+\}\s*from\s*['"]([^'"]+)['"]/gm)];
    for(const [,local] of referencias)await visitar(path.posix.normalize(path.posix.join(path.posix.dirname(id),local)));
  }
  await visitar('src/main.js');return [...vistos].sort();
}
