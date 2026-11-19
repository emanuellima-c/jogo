import { FASES, REGIOES } from './fases.js';
import { TECNICAS, BALANCO } from './ajustes.js';

const glifos={retorno:'espada',quebra:'peso',aparo:'aparo',estocada:'tecnicas',pisada:'pisada',eco:'passo'};
const icone=nome=>'<i class="ico i-'+nome+'" aria-hidden="true"></i>';
const dois=n=>String(n).padStart(2,'0');
const figura=n=>'arte/cinzas/f'+dois(n)+'.webp';
const pequena=(n,txt)=>'<span class="kicker">'+n+'</span>'+txt;
function botao(acao,texto,g='',classe='',atrib=''){
  return '<button type="button" data-acao="'+acao+'" class="'+classe+'" '+atrib+'>'+(g?icone(g):'')+texto+'</button>';
}
const rotuloSlot=i=>i===0?'I · Q':'II · R';
function cabecalho(faixa,titulo,voltar=true){
  return '<header class="cab-painel"><div><p class="secao">'+faixa+'</p><h2 id="painelTitulo">'+titulo+'</h2></div>'+
    (voltar?botao('voltar','','fechar','fechar','aria-label="Voltar"'):'')+'</header>';
}
function estrelas(perfil,n){
  const total=perfil.estrelas[n].length;
  return '<span class="estrelas" aria-label="'+total+' de 3 estrelas">'+'★'.repeat(total)+'☆'.repeat(3-total)+'</span>';
}
function regiaoCasa(p){
  return REGIOES.map((r,i)=>{
    const aberta=p.liberada>=i*3+1,feita=p.concluidas.includes(i*3+3);
    return '<button class="carta" data-acao="regiao" data-id="'+i+'" aria-label="Ver '+r.nome+' no atlas"><span class="mini"><img src="'+figura([1,5,7,11,15][i])+'" alt="" width="576" height="324"><span class="pino">'+icone(feita?'selo':aberta?'bandeira':'fechadura')+'</span></span><span class="descricao">'+pequena('Território '+dois(i+1),'<strong>'+r.nome+'</strong>')+'</span></button>';
  }).join('');
}
function telaAtlas(p,i){
  return cabecalho('Atlas de Aurora','Atlas da jornada')+'<nav class="regioes-atlas" aria-label="Territórios">'+
    REGIOES.map((r,j)=>botao('regiao',r.nome,'','','data-id="'+j+'" aria-pressed="'+(j===i)+'"')).join('')+
    '</nav><img class="atlas-faixa" src="'+figura([1,5,7,11,15][i])+'" alt=""><div class="etapas">'+
    FASES.slice(i*3,i*3+3).map(f=>{
      const aberta=f.id<=p.liberada,feita=p.concluidas.includes(f.id);
      return '<article class="etapa"><b class="num">'+dois(f.id)+'</b><div><strong>'+f.nome+'</strong><small>'+f.subtitulo+' · '+estrelas(p,f.id)+'</small></div>'+
        (aberta?botao('visitar',feita?'Revisitar':'Entrar','jogar','','data-id="'+f.id+'" aria-label="Entrar na fase '+f.id+', '+f.nome+'"'):'<span class="selo-estado" aria-label="Fase bloqueada">'+icone('fechadura')+'</span>')+'</article>';
    }).join('')+'</div>';
}
function inventario(p,trocar){
  return '<div class="inventario" aria-label="Técnicas equipadas">'+p.equipadas.map((id,i)=>{
    const nome=TECNICAS.find(t=>t.id===id)?.nome||'Livre';
    return '<span><b>'+rotuloSlot(i)+'</b> '+nome+'</span>'+((id&&trocar)?botao('limparSlot','','fechar','','data-slot="'+i+'" aria-label="Remover '+nome+' do espaço '+(i+1)+'"'):'');
  }).join('')+'</div>';
}
function catalogo(p,modo){
  return '<div class="catalogo">'+TECNICAS.map(t=>{
    const comprada=p.compradas.includes(t.id),aberta=p.liberada>=t.fase;
    const slot=p.equipadas.indexOf(t.id);let acoes='';
    if(modo==='oficina'&&!comprada){
      acoes+=botao('comprar','Gravar · '+t.preco+' ecos','eco','', 'data-id="'+t.id+'" '+(!aberta||p.ecos<t.preco?'disabled':''));
    }
    if(comprada&&modo!=='tecnicas'){
      for(let i=0;i<2;i++)acoes+=botao('equipar',slot===i?'No espaço '+(i?'II':'I'):'Equipar '+(i?'II':'I'),'','', 'data-id="'+t.id+'" data-slot="'+i+'" '+(slot===i?'disabled':''));
    }
    if(modo==='oficina')acoes+=botao('ensaiar','Experimentar','treino','','data-id="'+t.id+'"');
    return '<article class="ficha"><h3>'+icone(glifos[t.id])+t.nome+'</h3><dl><dt>Preço</dt><dd>'+t.preco+' ecos</dd><dt>Requisito</dt><dd>Alcançar a fase '+t.fase+'</dd><dt>Vigor</dt><dd>'+t.vigor+'</dd><dt>Comando</dt><dd>'+t.comando+'</dd></dl><p>'+t.efeito+'</p>'+
      (comprada?'<span class="selo-estado">'+icone('selo')+'Gravada</span>':'')+(acoes?'<div class="grupo-acoes">'+acoes+'</div>':'')+'</article>';
  }).join('')+'</div>';
}
function telaTecnicas(p,modo,fala){
  const loja=modo==='oficina',descanso=modo==='descanso',mostra=loja||descanso;
  let html=cabecalho(loja?'Oficina de gravação':descanso?'Santuário aceso':'Gravuras de Aurora',loja?'Bento do Cipó':descanso?'Descanso':'Técnicas');
  if(loja)html+='<div class="oficina-topo"><img src="arte/cinzas/retrato.png" width="108" height="108" alt="Bento do Cipó com manto, óculos e lanterna de cristal"><div><h3>Gravador dos caminhos</h3><blockquote>“'+fala+'”</blockquote></div></div>';
  else html+='<p class="texto-intro">'+(descanso?'Vida e frascos restaurados. As patrulhas comuns retomaram seus postos. Troque aqui as duas gravuras equipadas.':'Bento grava técnicas em troca de ecos. Equipe até duas na oficina ou em um santuário. No teclado, use Q e R.')+'</p>';
  html+='<div class="figuras"><span class="bolsa">'+icone('eco')+p.ecos+' ecos</span>'+inventario(p,mostra)+'</div>';
  if(descanso)html+=botao('retomar','Voltar à trilha','jogar','primario');
  html+='<p id="feedbackOficina" class="status-oficina" role="status"></p>';
  if(descanso&&!p.compradas.length)html+='<p>Visite a oficina de Bento, perto do início da fase, para gravar a primeira técnica.</p>';
  else if(descanso)html+='<div class="catalogo">'+TECNICAS.filter(t=>p.compradas.includes(t.id)).map(t=>'<article class="ficha"><h3>'+icone(glifos[t.id])+t.nome+'</h3><p>'+t.efeito+'</p><div class="grupo-acoes">'+[0,1].map(i=>botao('equipar','Equipar '+(i?'II':'I'),'','','data-id="'+t.id+'" data-slot="'+i+'" '+(p.equipadas[i]===t.id?'disabled':''))).join('')+'</div></article>').join('')+'</div>';
  else html+=catalogo(p,modo);
  return html;
}
function telaManual(){
  const comandos=[['Andar','A / D ou ← / →'],['Saltar e controlar a altura','Espaço / W / ↑'],['Golpe leve','J / X'],['Golpe pesado','K / Z'],['Esquivar','Shift / L'],['Usar o frasco','F'],['Interagir','E'],['Técnicas I e II','Q / R'],['Pausar','Esc / P']];
  return cabecalho('Guia de campo','Como jogar')+'<div class="grade-guia guias"><div><h3>Comandos</h3><div class="controles-lista">'+comandos.map(([s,k])=>'<div class="linha-guia"><span>'+s+'</span><kbd>'+k+'</kbd></div>').join('')+'</div></div>'+
    '<div class="guia-texto"><h3>O ritmo do combate</h3><p>Observe a preparação do inimigo. Um golpe leve cabe em aberturas curtas. O pesado expõe a guarda e exige tempo para voltar a agir.</p><p>O vigor verde paga ataques e esquivas. Ele se recompõe quando você para de gastá-lo. O salto é livre. O aviso vermelho serrilhado identifica golpes que atravessam o aparo.</p><h3>Fogo e ecos</h3><p>Interaja com a chama para recuperar vida e recarregar os frascos. Inimigos comuns voltam aos postos. Use a cura quando o inimigo estiver em recuperação.</p><p>Ao morrer, seus ecos ficam numa marca. Volte a ela e interaja para recolher. Uma nova morte substitui a marca anterior.</p><h3>Toque</h3><p>Use as setas à esquerda e os botões de ação à direita. A espada curta golpeia de leve e a larga desfere o golpe pesado. A seta dupla esquiva. Toque no nome de um objeto próximo para interagir.</p></div></div>';
}
function telaOpcoes(p){
  const o=p.opcoes;
  return cabecalho('Sistema','Opções')+'<div class="grade-opcoes"><div><label class="op-linha">Som<input id="prefSom" type="checkbox" '+(o.som?'checked':'')+'></label><label class="op-linha">Volume<input id="volume" type="range" min="0" max="100" value="'+Math.round(o.volume*100)+'"></label><label class="op-linha">Efeitos de movimento<input id="prefMovimento" type="checkbox" '+(o.movimento?'checked':'')+'></label><label class="op-linha">Dificuldade<select id="modo">'+[['relaxado','Sereno'],['normal','Peregrino'],['desafio','Provação']].map(([k,v])=>'<option value="'+k+'" '+(o.modo===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div><div class="arquivos"><h3>Arquivo da jornada</h3><p>Exporte seu progresso para levá-lo a outro aparelho. A importação aceita também os arquivos das edições anteriores.</p>'+botao('exportar','Exportar progresso','salvar')+botao('importar','Importar progresso','baixar')+botao('telaCheia','Tela cheia','expandir')+'</div></div>';
}
function telaPausa(j){
  return cabecalho('Fase '+dois(j.fase.id)+' · '+REGIOES[j.fase.regiao].nome,'Jornada pausada',false)+'<h3>'+j.fase.nome+'</h3><div class="pausa-resumo"><span>'+icone('eco')+' '+j.perfil.ecos+' ecos</span>'+estrelas(j.perfil,j.fase.id)+'</div><div class="pilha">'+botao('retomar','Retomar jornada','jogar','primario')+botao('manual','Guia de campo','manual')+botao('opcoes','Opções','ajustes')+botao('menu','Salvar e voltar ao título','voltar')+'</div>';
}
function telaMorte(j){
  const m=j.perfil.mancha;
  return cabecalho('Fase '+dois(j.fase.id),'A chama se apagou',false)+'<p>'+(m?'A marca guarda '+m.valor+' ecos. Você pode recolhê-los interagindo com ela na última superfície segura.':'O santuário ainda brilha. Suas estrelas, gravuras e passagens abertas continuam registradas.')+'</p><div class="pilha">'+botao('renascer','Reacender no santuário','chama','primario')+botao('menu','Voltar ao título','voltar')+'</div>';
}
function telaResultado(j){
  const f=j.fase,p=j.perfil,final=f.id===15;
  return cabecalho(final?'Santuários de Aurora':'Fase '+dois(f.id),final?'O eclipse se desfez':'Passagem aberta',false)+'<p>'+ (final?'O Grande Gorila tombou. A luz volta às copas da selva. Bento mantém a oficina acesa para a sua volta.':f.nome+' foi atravessada. O próximo santuário já aparece no atlas.')+'</p><div class="resultado-resumo">'+(final?'<span>'+Object.values(p.estrelas).reduce((a,s)=>a+s.length,0)+' de 45 estrelas</span>':estrelas(p,f.id))+'<span>'+icone('eco')+' '+p.ecos+' ecos</span></div><div class="pilha">'+(final?botao('atlas','Revisitar pelo atlas','mapa','primario'):botao('avancar','Seguir para '+FASES[f.id].nome,'seta','primario'))+botao('menu','Voltar ao título','voltar')+'</div>';
}
export { icone, dois, figura, regiaoCasa, telaAtlas, telaTecnicas, telaManual, telaOpcoes, telaPausa, telaMorte, telaResultado };
