import { FASES, REGIOES } from './fases.js';
import { ATRIBUTOS, CINZA_REFAZER, CLASSES, TECNICAS, BALANCO } from './ajustes.js';
import { eficaciaGravura, dadosHeroi } from './poder.js';
import { AMULETOS, FRASCOS, GRAVURAS, nivelGravura, slotsAmuletos } from './progresso.js';
import { CONQUISTAS, MODIFICADORES, cicloEmAndamento, tempoProva } from './modos.js';
import { opcoesEntrada } from './controles-ui.js';
import { nomeTecla } from './entrada.js';

const glifos={retorno:'espada',quebra:'peso',aparo:'aparo',estocada:'tecnicas',pisada:'pisada',eco:'passo'};
const icone=nome=>'<i class="ico i-'+nome+'" aria-hidden="true"></i>';
const dois=n=>String(n).padStart(2,'0');
const figura=n=>'arte/cinzas/f'+dois(n)+'.webp';
const pequena=(n,txt)=>'<span class="kicker">'+n+'</span>'+txt;
function botao(acao,texto,g='',classe='',atrib=''){
  return '<button type="button" data-acao="'+acao+'" class="'+classe+'" '+atrib+'>'+(g?icone(g):'')+texto+'</button>';
}
function teclasDaAcao(perfil,acao){
  return perfil.opcoes.teclas[acao].map(nomeTecla).join(' / ');
}
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
      const aberta=f.id<=(cicloEmAndamento(p)?p.cicloAte:p.liberada),feita=p.concluidas.includes(f.id);
      return '<article class="etapa"><b class="num">'+dois(f.id)+'</b><div><strong>'+f.nome+'</strong><small>'+f.subtitulo+' · '+estrelas(p,f.id)+'</small></div>'+
        (aberta?botao('visitar',feita?'Revisitar':'Entrar','jogar','','data-id="'+f.id+'" aria-label="Entrar na fase '+f.id+', '+f.nome+'"'):'<span class="selo-estado" aria-label="Fase bloqueada">'+icone('fechadura')+'</span>')+'</article>';
    }).join('')+'</div>';
}
function telaClasses(selecao){
  const {id,novoCiclo}=selecao;
  const ficha=CLASSES[id];
  const opcoes=Object.values(CLASSES).filter(classe=>classe.id!=='herdeiro'||novoCiclo);
  const golpe=(acao,definicao)=>'<div><dt>'+acao+'</dt><dd>'+definicao.nome+' · '+definicao.dano+' de dano · '+definicao.alcance+' px</dd></div>';
  return cabecalho(novoCiclo?'Novo ciclo':'Jornada','Escolha sua classe')+
    '<div class="seletor-classe"><div class="grade-classes" role="group" aria-label="Classes disponíveis">'+
    opcoes.map(classe=>botao('verClasse','<strong>'+classe.nome+'</strong><small>'+classe.estilo+'</small>','','classe-opcao',
      'data-id="'+classe.id+'" aria-pressed="'+(classe.id===id)+'"')).join('')+'</div>'+
    '<article class="ficha previa-classe"><header><canvas id="poseClasse" width="96" height="64" role="img" aria-label="Pose de '+ficha.nome+'"></canvas>'+
    '<div><h3 aria-live="polite">'+ficha.nome+'</h3><p>'+ficha.estilo+' · '+ficha.dificuldade+'</p></div></header>'+
    '<p>'+ficha.descricao+'</p><dl class="estatisticas-classe">'+
    '<div><dt>Vida base</dt><dd>'+ficha.vidaBase+'</dd></div><div><dt>Vigor base</dt><dd>'+ficha.vigorBase+'</dd></div>'+
    '<div><dt>Nível inicial</dt><dd>'+ficha.nivelInicial+'</dd></div></dl><dl class="golpes-classe">'+golpe('Leve',ficha.leve)+golpe('Pesado',ficha.pesado)+'</dl>'+
    (ficha.talento?'<p><strong>'+ficha.talento.nome+'</strong> · '+ficha.talento.descricao+'</p>':'')+
    '<dl class="atributos-classe">'+Object.entries(ficha.atributosIniciais).map(([atributo,valor])=>
      '<div><dt>'+ATRIBUTOS[atributo].nome+'</dt><dd>'+valor+'</dd></div>').join('')+'</dl></article></div><div class="grupo-acoes confirmar-classe">'+
    botao('confirmarClasse',novoCiclo?'Confirmar e começar o ciclo':'Confirmar e iniciar jornada','jogar','primario')+'</div>';
}
function inventario(p,trocar){
  return '<div class="inventario" aria-label="Técnicas equipadas">'+p.equipadas.map((id,i)=>{
    const nome=TECNICAS.find(t=>t.id===id)?.nome||'Livre';
    const tecla=teclasDaAcao(p,i===0?'t1':'t2');
    return '<span><b>'+(i===0?'I':'II')+' · '+tecla+'</b> '+nome+'</span>'+((id&&trocar)?botao('limparSlot','','fechar','','data-slot="'+i+'" aria-label="Remover '+nome+' do espaço '+(i+1)+'"'):'');
  }).join('')+'</div>';
}
function catalogo(p,modo){
  const atributos=dadosHeroi(p).atributos;
  return '<div class="catalogo">'+TECNICAS.map(t=>{
    const comprada=p.compradas.includes(t.id),aberta=p.liberada>=t.fase;
    const slot=p.equipadas.indexOf(t.id);let acoes='';
    if(modo==='oficina'&&!comprada){
      acoes+=botao('comprar','Gravar · '+t.preco+' ecos','eco','', 'data-id="'+t.id+'" '+(!aberta||p.ecos<t.preco?'disabled':''));
    }
    if(comprada&&modo!=='tecnicas'){
      for(let i=0;i<2;i++)acoes+=botao('equipar',slot===i?'No espaço '+(i?'II':'I'):'Equipar '+(i?'II':'I'),'','', 'data-id="'+t.id+'" data-slot="'+i+'" '+(slot===i?'disabled':''));
    }
    const nivel=nivelGravura(p,t.id), evolucao=GRAVURAS[t.id]?.[nivel+1];
    if(modo==='oficina'){
      acoes+=botao('ensaiar','Experimentar','treino','','data-id="'+t.id+'"');
      if(comprada&&evolucao)
        acoes+=botao('melhorarGravura','Gravar nível '+(nivel+1)+' · '+evolucao.preco+' ecos','eco','',
          'data-id="'+t.id+'" '+(p.ecos<evolucao.preco?'disabled':''));
    }
    const aprendido=comprada&&nivel>1?
      '<p>'+Array.from({length:nivel-1},(_,indice)=>GRAVURAS[t.id][indice+2].efeito).join(' ')+'</p>':'';
    const proximo=comprada&&evolucao&&modo==='oficina'?'<p>Próxima gravação · '+evolucao.efeito+'</p>':'';
    const golpe=BALANCO.golpe[t.id];
    const requisito=Object.entries(golpe.requisitos??{}).map(([id,valor])=>ATRIBUTOS[id].nome+' '+valor).join(' · ');
    const eficaz=eficaciaGravura(golpe,atributos);
    const eficiencia=requisito?'<p>Requisito suave · '+requisito+' · Eficácia '+Math.round(100*eficaz)+'%</p>':'';
    return '<article class="ficha"><h3>'+icone(glifos[t.id])+t.nome+'</h3><dl><dt>Preço</dt><dd>'+t.preco+' ecos</dd><dt>Requisito</dt><dd>Alcançar a fase '+t.fase+'</dd><dt>Vigor</dt><dd>'+t.vigor+'</dd><dt>Comando</dt><dd>'+t.comando+'</dd></dl><p>'+t.efeito+'</p>'+
      eficiencia+aprendido+proximo+(comprada?'<span class="selo-estado">'+icone('selo')+'Nível '+nivel+'</span>':'')+
      (acoes?'<div class="grupo-acoes">'+acoes+'</div>':'')+'</article>';
  }).join('')+'</div>';
}
function telaTecnicas(p,modo,fala,evoluir=true){
  const loja=modo==='oficina',descanso=modo==='descanso',mostra=loja||descanso;
  let html=cabecalho(loja?'Oficina de gravação':descanso?'Santuário aceso':'Gravuras de Aurora',loja?'Bento do Cipó':descanso?'Descanso':'Técnicas');
  if(loja)html+='<div class="oficina-topo"><img src="arte/cinzas/retrato.png" width="108" height="108" alt="Bento do Cipó com manto, óculos e lanterna de cristal"><div><h3>Gravador dos caminhos</h3><blockquote>“'+fala+'”</blockquote></div></div>';
  else html+='<p class="texto-intro">'+(descanso?'Vida e frascos restaurados. As patrulhas comuns retomaram seus postos. Troque aqui as duas gravuras equipadas.':'Bento grava técnicas em troca de ecos. Equipe até duas na oficina ou em um santuário.')+'</p>';
  html+='<div class="figuras"><span class="bolsa">'+icone('eco')+p.ecos+' ecos</span>'+inventario(p,mostra)+'</div>';
  if(descanso)html+=botao('retomar','Voltar à trilha','jogar','primario')+(evoluir?botao('nivelMenu','Evoluir atributos','chama'):'');
  if(mostra)html+=botao('amuletoMenu','Amuletos','selo');
  if(loja){
    const atual=FRASCOS[p.frascoNivel], proximo=FRASCOS[p.frascoNivel+1];
    html+='<section class="ficha"><h3>'+icone('frasco')+'Frasco · nível '+p.frascoNivel+'</h3><p>'+atual.efeito+
      (p.frascoNivel===3?' '+FRASCOS[2].efeito:'')+'</p>';
    if(proximo)html+='<p>Próximo nível · '+proximo.efeito+'</p>'+
      botao('melhorarFrasco','Melhorar · '+proximo.preco+' ecos','eco','',p.ecos<proximo.preco?'disabled':'');
    html+='</section>';
    if(evoluir&&p.liberada>=CINZA_REFAZER.fase){
      const indisponivel=p.cinzasRefazer>0||p.cicloDaCinza===p.ciclo||p.ecos<CINZA_REFAZER.preco;
      html+='<section class="ficha"><h3>Cinza de Refazer</h3><p>Redistribua os pontos no santuário. Bento guarda uma cinza por ciclo.</p>'+
        botao('comprarCinza','Comprar cinza · '+CINZA_REFAZER.preco+' ecos','eco','',indisponivel?'disabled':'')+'</section>';
    }
  }
  html+='<p id="feedbackOficina" class="status-oficina" role="status"></p>';
  if(descanso&&!p.compradas.length)html+='<p>Visite a oficina de Bento, perto do início da fase, para gravar a primeira técnica.</p>';
  else if(descanso)html+='<div class="catalogo">'+TECNICAS.filter(t=>p.compradas.includes(t.id)).map(t=>'<article class="ficha"><h3>'+icone(glifos[t.id])+t.nome+'</h3><p>'+t.efeito+'</p><div class="grupo-acoes">'+[0,1].map(i=>botao('equipar','Equipar '+(i?'II':'I'),'','','data-id="'+t.id+'" data-slot="'+i+'" '+(p.equipadas[i]===t.id?'disabled':''))).join('')+'</div></article>').join('')+'</div>';
  else html+=catalogo(p,modo);
  return html;
}
function telaManual(perfil){
  const tecla=acao=>teclasDaAcao(perfil,acao);
  const comandos=[['Andar',tecla('esq')+' · '+tecla('dir')],['Saltar e controlar a altura',tecla('pulo')],['Golpe leve',tecla('leve')],
    ['Golpe pesado',tecla('pesado')],['Esquivar',tecla('esquiva')],['Usar o frasco',tecla('cura')],['Interagir',tecla('interagir')],
    ['Técnicas I e II',tecla('t1')+' · '+tecla('t2')],['Talento da classe',tecla('talento')],['Pausar','Esc / '+tecla('pausa')]];
  return cabecalho('Guia de campo','Como jogar')+'<div class="grade-guia guias"><div><h3>Comandos</h3><div class="controles-lista">'+comandos.map(([s,k])=>'<div class="linha-guia"><span>'+s+'</span><kbd>'+k+'</kbd></div>').join('')+'</div></div>'+
    '<div class="guia-texto"><h3>O ritmo do combate</h3><p>Observe a preparação do inimigo. Um golpe leve cabe em aberturas curtas. O pesado expõe a guarda e exige tempo para voltar a agir.</p><p>O vigor verde paga ataques e esquivas. Ele se recompõe quando você para de gastá-lo. O salto é livre. O aviso vermelho serrilhado identifica golpes que atravessam o aparo.</p><h3>Fogo e ecos</h3><p>Interaja com a chama para recuperar vida e recarregar os frascos. Inimigos comuns voltam aos postos. Use a cura quando o inimigo estiver em recuperação.</p><p>Ao morrer, seus ecos ficam numa marca. Volte a ela e interaja para recolher. Uma nova morte substitui a marca anterior.</p><h3>Toque</h3><p>Use as setas à esquerda e os botões de ação à direita. A espada curta golpeia de leve e a larga desfere o golpe pesado. A seta dupla esquiva. Toque no nome de um objeto próximo para interagir.</p></div></div>';
}
function telaOpcoes(p){
  const o=p.opcoes;
  return cabecalho('Sistema','Opções')+
    '<div class="grade-opcoes"><div><label class="op-linha">Som<input id="prefSom" type="checkbox" '+(o.som?'checked':'')+'></label>'+
    '<label class="op-linha">Volume<input id="volume" type="range" min="0" max="100" value="'+Math.round(o.volume*100)+'"></label>'+
    '<label class="op-linha">Efeitos de movimento<input id="prefMovimento" type="checkbox" '+(o.movimento?'checked':'')+'></label>'+
    ['Tremor','Flash'].map(nome=>{
      const id=nome.toLowerCase();
      return '<label class="op-linha">'+nome+'<input id="'+id+'" type="range" min="0" max="100" value="'+Math.round(o[id]*100)+'"></label>';
    }).join('')+
    '<label class="op-linha">Dificuldade<select id="modo">'+[['relaxado','Relaxado'],['normal','Normal'],['desafio','Provação']].map(([k,v])=>'<option value="'+k+'" '+(o.modo===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div>'+
    '<div class="arquivos"><h3>Arquivo da jornada</h3><p>Exporte seu progresso para levá-lo a outro aparelho. A importação aceita também os arquivos das edições anteriores.</p>'+
    botao('exportar','Exportar progresso','salvar')+botao('importar','Importar progresso','baixar')+botao('telaCheia','Tela cheia','expandir')+'</div></div>'+
    opcoesEntrada(o);
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
  return cabecalho(final?'Santuários de Aurora':'Fase '+dois(f.id),final?'O eclipse se desfez':'Passagem aberta',false)+'<p>'+ (final?'O Grande Gorila tombou. A luz volta às copas da selva. Bento mantém a oficina acesa para a sua volta.':f.nome+' foi atravessada. O próximo santuário já aparece no atlas.')+'</p><div class="resultado-resumo">'+(final?'<span>'+Object.values(p.estrelas).reduce((a,s)=>a+s.length,0)+' de 45 estrelas</span>':estrelas(p,f.id))+'<span>'+icone('eco')+' '+p.ecos+' ecos</span></div><div class="pilha">'+(final?botao('provas','Provas e novo ciclo','jogar','primario')+botao('atlas','Revisitar pelo atlas','mapa'):botao('avancar','Seguir para '+FASES[f.id].nome,'seta','primario'))+botao('menu','Voltar ao título','voltar')+'</div>';
}

function telaAmuletos(perfil,origem){
  const loja=origem==='oficina',equipar=loja||origem==='descanso';
  const vagas=slotsAmuletos(perfil);
  const tem=id=>perfil.amuletos.includes(id);
  const espacos=perfil.amuletosEquipados.slice(0,vagas).map((id,slot)=>{
    const item=AMULETOS.find(amuleto=>amuleto.id===id);
    return '<span><b>'+String(slot+1)+'</b> '+(item?.nome||'Livre')+'</span>'+
      (item&&equipar?botao('equiparAmuleto','Remover','fechar','','data-slot="'+slot+'" aria-label="Remover '+item.nome+'"'):'');
  }).join('');
  return cabecalho('Coleção da Aurora','Amuletos')+
    '<p>Equipe amuletos com Bento ou em um santuário. O terceiro espaço abre ao concluir a jornada.</p>'+
    '<div class="figuras"><span class="bolsa">'+icone('eco')+perfil.ecos+' ecos</span><div class="inventario">'+espacos+'</div></div>'+
    '<p id="feedbackOficina" class="status-oficina" role="status"></p>'+
    '<div class="catalogo">'+AMULETOS.map(a=>{
      const adquirido=tem(a.id);
      let acoes='';
      if(adquirido&&equipar){
        for(let slot=0;slot<vagas;slot++){
          acoes+=botao('equiparAmuleto','Equipar '+(slot+1),'','','data-id="'+a.id+'" data-slot="'+slot+'" '+
            (perfil.amuletosEquipados[slot]===a.id?'disabled':''));
        }
      }else if(loja&&!adquirido&&a.preco){
        acoes=botao('comprarAmuleto','Comprar · '+a.preco+' ecos','eco','','data-id="'+a.id+'" '+
          (perfil.ecos<a.preco||perfil.liberada<a.fase?'disabled':''));
      }
      return '<article class="ficha"><h3>'+icone('selo')+a.nome+'</h3><p>'+a.efeito+'</p>'+
        '<p>'+ (adquirido?'Encontrado':a.origem)+'</p>'+
        (acoes?'<div class="grupo-acoes">'+acoes+'</div>':'')+'</article>';
    }).join('')+'</div>';
}

function telaProvas(perfil,diario){
  const tempos=perfil.recordes.diarios[diario.chave]||[];
  const diarioFase=FASES[diario.fase-1];
  const modificador=MODIFICADORES.find(item=>item.id===diario.modificador);
  const fases=FASES.filter(fase=>fase.id<=perfil.liberada).map(fase=>{
    const tempo=perfil.recordes.cronos[fase.id]?.ms;
    return '<option value="'+fase.id+'">'+dois(fase.id)+' · '+fase.nome+(tempo?' · '+tempoProva(tempo):'')+'</option>';
  }).join('');
  const novoCiclo=perfil.concluidas.length===15&&!cicloEmAndamento(perfil)?
    '<article class="ficha"><h3>Novo ciclo</h3><p>Recomece pela Selva com seu inventário. Os inimigos e guardiões voltam reforçados.</p>'+
      MODIFICADORES.map(item=>'<label class="op-linha">'+item.nome+'<input type="checkbox" data-ciclo="'+item.id+'"></label>').join('')+
      botao('novoCiclo','Escolher classe e iniciar ciclo','chama')+'</article>':
    '<article class="ficha"><h3>Novo ciclo</h3><p>'+ (cicloEmAndamento(perfil)?'Ciclo '+perfil.ciclo+' em andamento.':'Conclua a jornada para desbloquear.')+'</p></article>';
  return cabecalho('Provas da Aurora','Provas e conquistas')+'<div class="catalogo">'+
    '<article class="ficha"><h3>Desafio do dia</h3><p>'+diario.chave+' UTC · '+diarioFase.nome+' · '+modificador.nome+'</p>'+
    (tempos.length?'<ol aria-label="Melhores tempos de hoje">'+tempos.map(ms=>'<li>'+tempoProva(ms)+'</li>').join('')+'</ol>':'<p>Sem marcas neste dispositivo.</p>')+
    botao('jogarDiario','Entrar no desafio','jogar')+'</article>'+
    '<article class="ficha"><h3>Contrarrelógio</h3><p>Corra uma fase e reencontre o fantasma da sua melhor marca.</p>'+
    '<label class="op-linha">Fase<select id="faseProva">'+fases+'</select></label>'+botao('jogarCrono','Correr','jogar')+'</article>'+
    novoCiclo+'</div><h3>Conquistas · '+perfil.conquistas.length+' / '+CONQUISTAS.length+'</h3><div class="catalogo">'+
    CONQUISTAS.map(item=>'<article class="ficha"><h3>'+item.nome+'</h3><p>'+item.descricao+'</p><p>'+
      (perfil.conquistas.includes(item.id)?'Conquistada':'Pendente')+'</p></article>').join('')+'</div>';
}

function telaResultadoProva(prova){
  return cabecalho('Provas da Aurora','Passagem cronometrada',false)+'<p>'+tempoProva(prova.ms)+
    (prova.registrado?' · Marca salva neste dispositivo.':' · Marca anterior preservada.')+'</p><div class="pilha">'+
    botao('repetirProva','Tentar de novo','jogar','primario')+botao('provas','Voltar às provas','voltar')+'</div>';
}

export { botao, cabecalho, icone, dois, figura, regiaoCasa, telaAtlas, telaClasses, telaTecnicas, telaManual, telaOpcoes, telaPausa, telaMorte,
  telaResultado, telaAmuletos, telaProvas, telaResultadoProva };
