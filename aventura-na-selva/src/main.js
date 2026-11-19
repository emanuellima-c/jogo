import { Aplicacao } from './cinzas/aplicacao.js';
import { iniciarPwa } from './core/pwa.js';

function imagem(arquivo) {
  return new Promise((resolve,reject)=>{
    const im=new Image();
    im.onload=()=>resolve(im);
    im.onerror=()=>reject(new Error('Faltou o recurso gráfico '+arquivo+'.'));
    im.src='arte/cinzas/'+arquivo;
  });
}
async function iniciar(){
  const nomes=Array.from({length:15},(_,i)=>'f'+String(i+1).padStart(2,'0')+'.webp');
  const [fundos,hero,ferase,bento,retrato,capa]=await Promise.all([
    Promise.all(nomes.map(imagem)),...['heroi.png','criaturas.png','bento.png','retrato.png','capa.webp'].map(imagem)
  ]);
  return new Aplicacao({fundos,hero,ferase,criaturas:ferase,bento,retrato,capa});
}
iniciarPwa();
const pronto=iniciar();
export { pronto };
