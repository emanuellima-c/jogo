// Gerado a partir de src/cinzas/objetivos.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/objetivos.js", function (exports, usar) {
"use strict";
// As marcas usam o mapa de coletas do perfil e permanecem após descanso, morte e novo ciclo.
function montarObjetivos(fase){
  const objetivos=[];
  const chama=fase.santuarios[1];
  if(chama)objetivos.push({id:'obj:chama',tipo:'chama',alvo:chama.id,texto:`Acenda “${chama.nome}”`,ecos:3});

  const estrela=fase.estrelas[(fase.id-1)%fase.estrelas.length];
  if(estrela)objetivos.push({id:'obj:estrela',tipo:'estrela',alvo:estrela.id,texto:`Encontre “${estrela.nome}”`,ecos:2});

  const guardiao=fase.inimigos.find(inimigo=>inimigo.tipo==='chefe');
  const relicario=fase.inimigos.find(inimigo=>inimigo.tipo==='mini');
  const atalho=fase.atalhos[0];
  if(guardiao)objetivos.push({id:'obj:duelo',tipo:'duelo',alvo:guardiao.id,texto:'Vença o guardião sem frasco',ecos:5});
  else if(relicario)objetivos.push({id:'obj:relicario',tipo:'relicario',alvo:relicario.id,texto:'Vença o relicário',ecos:4});
  else if(atalho)objetivos.push({id:'obj:atalho',tipo:'atalho',alvo:atalho.id,texto:`Abra “${atalho.nome}”`,ecos:3});
  return objetivos;
}

function cumprirObjetivo(jogo,tipo,alvo){
  const objetivo=jogo.fase.objetivos?.find(meta=>meta.tipo===tipo&&meta.alvo===alvo);
  if(!objetivo||jogo.emTreino)return false;
  const coletas=jogo.perfil.coletas[jogo.fase.id];
  if(coletas.includes(objetivo.id))return false;
  if(tipo==='duelo'&&jogo.heroi.frascos<jogo.heroi.frascosMax)return false;
  coletas.push(objetivo.id);
  jogo.perfil.ecos+=objetivo.ecos;
  jogo.evento('objetivo',objetivo);
  return true;
}

function reconhecerObjetivos(jogo){
  const {fase,perfil}=jogo;
  const id=fase.id;
  for(const meta of fase.objetivos||[]){
    const jaCumpriu=(meta.tipo==='estrela'&&perfil.estrelas[id].includes(meta.alvo))||
      (meta.tipo==='atalho'&&perfil.atalhos[id].includes(meta.alvo))||
      (meta.tipo==='relicario'&&perfil.chefes[id].includes(meta.alvo));
    if(jaCumpriu)cumprirObjetivo(jogo,meta.tipo,meta.alvo);
  }
}

Object.defineProperty(exports, "montarObjetivos", { enumerable: true, get: () => montarObjetivos });
Object.defineProperty(exports, "cumprirObjetivo", { enumerable: true, get: () => cumprirObjetivo });
Object.defineProperty(exports, "reconhecerObjetivos", { enumerable: true, get: () => reconhecerObjetivos });
});
