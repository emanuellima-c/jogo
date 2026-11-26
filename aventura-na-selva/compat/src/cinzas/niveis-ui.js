// Gerado a partir de src/cinzas/niveis-ui.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/niveis-ui.js", function (exports, usar) {
"use strict";
const { ATRIBUTOS, BALANCO, MAXIMO_ATRIBUTO, MINIMO_ATRIBUTO, NIVEL_MAXIMO, classeDoPerfil } = usar("src/cinzas/ajustes.js");
const { custoNivel, dadosHeroi, danoEscalado, nivelDosAtributos } = usar("src/cinzas/poder.js");
const { botao, cabecalho, icone } = usar("src/cinzas/telas.js");
function formato(valor){
  return Number.isInteger(valor)?String(valor):valor.toFixed(1).replace('.',',');
}
function efeitosDaMelhoria(perfil,antes,depois){
  const ficha=classeDoPerfil(perfil);
  const esquiva=ficha.esquiva??BALANCO.esquiva;
  const efeitos=[
    ['Vida máxima',antes.vidaMax,depois.vidaMax],
    ['Vigor máximo',antes.vigorMax,depois.vigorMax],
    ['Vigor por segundo',antes.regeneracaoVigor,depois.regeneracaoVigor],
    ['Cura do frasco',antes.cura,depois.cura],
    ['Postura',antes.postura,depois.postura],
    ['Recuo (%)',100*antes.recuo,100*depois.recuo],
    ['Custo da esquiva',esquiva.custo*antes.custoEsquiva,esquiva.custo*depois.custoEsquiva],
    ['Dano leve',danoEscalado(ficha.leve,antes.atributos),danoEscalado(ficha.leve,depois.atributos)],
    ['Dano pesado',danoEscalado(ficha.pesado,antes.atributos),danoEscalado(ficha.pesado,depois.atributos)]
  ];
  return efeitos.filter(([,valor,novo])=>formato(valor)!==formato(novo));
}
function telaNivel(perfil,id,disponivel){
  const meta=ATRIBUTOS[id];
  const antes=dadosHeroi(perfil);
  const nivel=antes.nivel;
  const valor=antes.atributos[id];
  const preco=custoNivel(nivel);
  const noLimite=nivel>=NIVEL_MAXIMO||valor>=MAXIMO_ATRIBUTO;
  const refazer=perfil.refazerGratuito||perfil.cinzasRefazer>0;
  const depois=noLimite?antes:dadosHeroi({...perfil,atributos:{...antes.atributos,[id]:valor+1}});
  const efeitos=efeitosDaMelhoria(perfil,antes,depois);
  const opcoes=Object.entries(ATRIBUTOS).map(([chave,atributo])=>botao('verAtributo',
    '<span>'+atributo.nome+'</span><strong>'+antes.atributos[chave]+'</strong>','','atributo-opcao',
    'data-id="'+chave+'" aria-pressed="'+(chave===id)+'"')).join('');
  const investimento='<p>'+icone('eco')+' '+perfil.ecos+' ecos · '+perfil.xp+' XP de campo</p>';
  const faixa=cabecalho('Santuário','Evoluir atributos');
  const confirmar=botao('elevarAtributo','Evoluir · '+preco+' ecos','chama','primario',
    'data-id="'+id+'" '+(noLimite||!disponivel||perfil.ecos<preco?'disabled':''));
  return faixa+investimento+'<div class="seletor-classe seletor-atributos"><div class="lista-atributos" role="group" aria-label="Atributos">'+opcoes+'</div>'+
    '<article class="ficha previa-atributo"><h3>'+meta.nome+' '+valor+(noLimite?'':' → '+(valor+1))+'</h3><p>'+meta.descricao+'</p>'+
    '<p>Rendimentos menores a partir de '+meta.limites.join(' e ')+'.</p><p>Nível '+nivel+
    (nivel>=NIVEL_MAXIMO?' · Máximo':valor>=MAXIMO_ATRIBUTO?' · Atributo no máximo':' → '+(nivel+1))+'</p>'+
    (efeitos.length?'<dl class="efeitos-atributo">'+efeitos.map(([nome,de,para])=>
      '<div><dt>'+nome+'</dt><dd>'+formato(de)+' → '+formato(para)+'</dd></div>').join('')+'</dl>':'')+
    (noLimite?'':confirmar)+'</article></div><p id="feedbackNivel" class="status-oficina" role="status"></p>'+
    '<div class="grupo-acoes">'+botao('refazerMenu',perfil.refazerGratuito?'Refazer pontos gratuitamente':'Refazer pontos com cinza','', '',
      refazer&&disponivel?'':'disabled')+'</div>';
}

function telaRefazer(perfil,proposta,disponivel){
  const nivel=dadosHeroi(perfil).nivel;
  const pontos=nivel-nivelDosAtributos(proposta);
  const mudou=Object.keys(ATRIBUTOS).some(id=>proposta[id]!==perfil.atributos[id]);
  const linhas=Object.entries(ATRIBUTOS).map(([id,meta])=>{
    const valor=proposta[id];
    const remover=botao('mudarPonto','−','','','data-id="'+id+'" data-delta="-1" aria-label="Diminuir '+meta.nome+'" '+(valor<=MINIMO_ATRIBUTO?'disabled':''));
    const adicionar=botao('mudarPonto','+','','','data-id="'+id+'" data-delta="1" aria-label="Aumentar '+meta.nome+'" '+(pontos<=0||valor>=MAXIMO_ATRIBUTO?'disabled':''));
    return '<div class="linha-refazer"><span>'+meta.nome+'</span>'+remover+'<output>'+valor+'</output>'+adicionar+'</div>';
  }).join('');
  return cabecalho('Santuário','Refazer pontos')+
    '<p aria-live="polite">'+pontos+' pontos para distribuir · Nível '+nivel+'</p><div class="lista-refazer">'+linhas+'</div>'+
    '<p>'+(perfil.refazerGratuito?'Refazer gratuito de migração':'Usa uma Cinza de Refazer')+'</p>'+
    '<div class="grupo-acoes">'+botao('confirmarRefazer','Confirmar distribuição','','primario',pontos||!mudou||!disponivel?'disabled':'')+'</div>';
}

Object.defineProperty(exports, "telaNivel", { enumerable: true, get: () => telaNivel });
Object.defineProperty(exports, "telaRefazer", { enumerable: true, get: () => telaRefazer });
});
