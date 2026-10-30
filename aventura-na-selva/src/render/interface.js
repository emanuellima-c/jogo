import { Interface as InterfaceBase } from './interfaceBase.js';
import { ESTADOS as E } from '../core/configuracoes.js';
import { PRODUTOS, precoProduto, podeTreinar } from '../meta/mercador.js';
import { PROVAS, SIMBOLOS } from '../meta/puzzles.js';
import { PODER_POR_ID, RARIDADES } from '../dados/poderes.js';
import { estatisticas, xpNecessario } from '../meta/progressao.js';

import { desenharBento } from './extras.js';

class Interface extends InterfaceBase {
  constructor(aoAgir){
    super(aoAgir);this.aoAgir=aoAgir;this.engine=null;this.arraste=null;this.ignorarClique=false;this.puzzleAtual=null;this.versaoPuzzle=-1;
    for(const id of ['moedas','estadoIma'])this.elementos[id]=document.getElementById(id);
    this.ghost=document.getElementById('puzzleGhost');this.ghostCanvas=document.getElementById('ghostCanvas');this.mapaPuzzle=this.criarImagemPuzzle();
    const op={signal:this.abortar.signal};
    this.palco.addEventListener('input',e=>{if(e.target.id==='volumeMestre')aoAgir('volume',Number(e.target.value)/100);},op);
    let ultimoBotao=null;
    const navegar=e=>{const b=e.target.closest('button');if(b&&b!==ultimoBotao&&!b.disabled&&this.engine?.estados.atual!==E.JOGANDO){ultimoBotao=b;aoAgir('navegar');}};
    this.palco.addEventListener('pointerover',navegar,op);this.palco.addEventListener('focusin',navegar,op);
    this.palco.addEventListener('click',e=>{if(this.ignorarClique){this.ignorarClique=false;e.stopImmediatePropagation();}}, {...op,capture:true});
    this.palco.addEventListener('pointerdown',e=>{
      const b=e.target.closest('[data-peca]');if(!b||b.disabled||this.engine?.estados.atual!==E.PUZZLE)return;
      e.preventDefault();b.setPointerCapture(e.pointerId);this.arraste={peca:Number(b.dataset.peca),pointer:e.pointerId,x:e.clientX,y:e.clientY,moveu:false};
      this.aoAgir('selecionarPeca',b.dataset.peca);const origem=b.querySelector('canvas');if(origem)this.ghostCanvas.getContext('2d').drawImage(origem,0,0,72,72);
      this.ghost.hidden=false;this.ghost.style.left=e.clientX+'px';this.ghost.style.top=e.clientY+'px';
    },op);
    this.palco.addEventListener('pointermove',e=>{
      const a=this.arraste;if(!a||a.pointer!==e.pointerId)return;
      if(Math.hypot(e.clientX-a.x,e.clientY-a.y)>5)a.moveu=true;
      this.ghost.style.left=e.clientX+'px';this.ghost.style.top=e.clientY+'px';
    },op);
    const soltar=e=>{
      const a=this.arraste;if(!a||a.pointer!==e.pointerId)return;
      if(e.type==='pointerup'){
        const alvo=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-destino]');
        if(alvo)this.aoAgir('encaixar',{peca:a.peca,destino:Number(alvo.dataset.destino)});
      }
      this.ignorarClique=a.moveu;if(a.moveu)setTimeout(()=>this.ignorarClique=false,0);this.arraste=null;this.ghost.hidden=true;
    };
    this.palco.addEventListener('pointerup',soltar,op);this.palco.addEventListener('pointercancel',soltar,op);
    this.palco.addEventListener('lostpointercapture',e=>{if(this.arraste&&this.arraste.pointer===e.pointerId){this.arraste=null;this.ghost.hidden=true;}},op);
  }
  trocarTela(estado,sessao,mundo,engine){
    this.engine=engine;if(estado===E.JOGANDO)this.cache.faseNumero=-1;super.trocarTela(estado,sessao,mundo,engine);
    this.arraste=null;this.ghost.hidden=true;
    if(estado===E.MENU){
      const p=engine.perfil;document.getElementById('botaoJogar').textContent='JOGAR ↗';
      const continuar=document.getElementById('botaoContinuar');continuar.disabled=!p.iniciada;continuar.textContent='CONTINUAR →';
      document.getElementById('resumoPerfil').innerHTML=`<strong>Nível ${p.nivel} · ◈ ${p.moedas}</strong><p>${p.xp} / ${xpNecessario(p.nivel)} XP<br>${p.concluidas.filter(Boolean).length}/15 fases · ${p.estrelas.reduce((a,b)=>a+b,0)}/45 estrelas<br>${p.descanso?'No descanso com Bento':'Próxima trilha: '+p.fase}</p>`;
    }else if(estado===E.LOJA)this.montarLoja(engine);
    else if(estado===E.PUZZLE)this.montarPuzzle(engine.puzzle);
    else if(estado===E.SAIU)document.getElementById('textoSaida').textContent=engine.saveDisponivel?'Seu progresso foi salvo. Você pode fechar esta aba.':'O navegador bloqueou o salvamento. Volte ao título e exporte o progresso nas opções antes de fechar.';
    const transicao=document.getElementById('transicao');
    if(!engine.semMovimento()&&transicao){transicao.className='transicao';void transicao.offsetWidth;transicao.className='transicao animando '+(estado===E.FASE_CONCLUIDA?'flash':estado===E.JOGANDO?'deslize':'');}
  }
  montarPersonagem(p){
    super.montarPersonagem(p);
    document.getElementById('movimentosAprendidos').innerHTML=Object.entries(PROVAS).map(([id,d])=>`<span>${p.aprendidas[id]?'✓':'○'} ${d.habilidade}</span>`).join('')+`<span>Melhorias · pulo ${p.melhorias.pulo} · velocidade ${p.melhorias.velocidade} · resistência ${p.melhorias.resistencia}</span>`;
  }
  montarOpcoes(p){
    document.getElementById('opcoes').innerHTML=`<label class="volume-opcao" for="volumeMestre">Volume geral <input id="volumeMestre" type="range" min="0" max="100" step="1" value="${Math.round(p.opcoes.volume*100)}" aria-label="Volume geral"></label><button data-acao="som">Som <b>${p.opcoes.som?'LIGADO':'MUDO'}</b></button><button data-acao="telaCheia">Entrar / sair da tela cheia ⛶</button><button data-acao="movimento">Movimento <b>${p.opcoes.movimento?'NORMAL':'REDUZIDO'}</b></button><h3>Dificuldade da próxima tentativa</h3>${[['normal','Normal · 3 vidas'],['relaxado','Relaxado · 5 vidas, inimigos mais lentos'],['desafio','Desafio · 1 vida, +25% XP']].map(([id,n])=>`<button data-acao="modo" data-valor="${id}" class="${p.opcoes.modo===id?'modo-ativo':''}">${n}</button>`).join('')}<h3>Seu progresso</h3><div class="arquivo-save"><button data-acao="exportar">Exportar save</button><button data-acao="importar">Importar save</button></div><button data-acao="testes">Executar testes automáticos</button><small>Moedas e habilidades ficam neste navegador. A exportação permite mover o progresso entre arquivos e aparelhos. Se a Fullscreen API estiver bloqueada, o jogo mantém a tela expandida na janela. SAIR guarda a jornada e exibe uma tela para fechar a aba.</small>`;
  }
  montarResultado(engine){
    super.montarResultado(engine);document.getElementById('botaoAvancar').textContent='Ir para a área de descanso →';
    const caixa=document.getElementById('resultado');caixa.innerHTML=caixa.innerHTML.replace('Uma nova evolução permanente está esperando.','Bento separou um presente para você. Converse com ele no descanso!').replace('O poder desta fase já foi escolhido nesta expedição.','O presente desta fase já foi concedido nesta expedição.');
  }
  montarLoja(engine){
    const retrato=document.getElementById('retratoBento'),ctx=retrato.getContext('2d');
    ctx.clearRect(0,0,128,144);ctx.save();ctx.scale(1.35,1.35);desenharBento(ctx,47,102,0);ctx.restore();
    const p=engine.perfil,a=estatisticas(p),c=engine.mundo.jogador.combate;
    document.getElementById('saldoLoja').textContent='◈ '+p.moedas;
    document.getElementById('falaLoja').textContent=engine.lojaFeedback;
    document.getElementById('produtosLoja').innerHTML=PRODUTOS.map(d=>{
      const preco=precoProduto(p,d.id),limite=d.id==='vida'&&this.engine.vidasAtuais()>=a.coracoes||d.id==='escudo'&&c.escudo||d.id==='ima'&&p.consumiveis.ima>=120||d.id==='pulo'&&a.impulso>=760||d.id==='velocidade'&&a.velocidade>=375||d.id==='resistencia'&&a.coracoes>=10;
      return `<article class="produto"><h4>${d.icone} ${d.nome}</h4><p>${d.descricao}</p><small>${d.melhoria?'Nível '+p.melhorias[d.id]+' → '+(p.melhorias[d.id]+1):'Provisão para a viagem'}</small><button data-acao="comprar" data-valor="${d.id}" ${limite||p.moedas<preco?'disabled':''}>${limite?'Já está completo':'◈ '+preco+' · Comprar'}</button></article>`;
    }).join('');
    document.getElementById('treinosLoja').innerHTML=Object.entries(PROVAS).map(([id,d])=>`<article class="treino"><h4>${p.aprendidas[id]?'✓ ':''}${d.habilidade}</h4><p>${d.descricao}</p><small>Dificuldade ${d.dificuldade}/3 · ${p.aprendidas[id]?'Aprendida para sempre':'Após a fase '+d.fase}</small><button data-acao="treinar" data-valor="${id}" ${podeTreinar(p,id)?'':'disabled'}>${p.aprendidas[id]?'Rever a prova':podeTreinar(p,id)?'Aprender · gratuito':'Prova ainda bloqueada'}</button></article>`).join('');
    document.getElementById('presentesLoja').innerHTML=p.pendente?`<h3>Presente da trilha ${p.pendente.fase} · escolha uma relíquia grátis</h3><p>As habilidades já adquiridas ganham +1 nível. Você pode decidir agora ou guardar a escolha para outro descanso.</p><div class="cartas">${p.pendente.opcoes.map(id=>{const h=PODER_POR_ID[id],r=RARIDADES[h.raridade],n=p.poderes[id]||0;return `<button class="carta" data-acao="poder" data-valor="${id}" style="--cor:${r.cor}"><span class="raridade">${r.nome.toUpperCase()}</span><span class="icone">${h.icone}</span><b>${h.nome}</b><span class="descricao-poder">${h.descricao}</span><span class="nivel-poder">${n?'Aprimorar '+n+' → '+(n+1):'Nova relíquia · nível 1'}</span></button>`;}).join('')}</div>`:'';
  }
  criarImagemPuzzle(){
    const c=document.createElement('canvas');c.width=216;c.height=144;const x=c.getContext('2d');
    x.fillStyle='#7eb8c0';x.fillRect(0,0,216,144);x.fillStyle='#edd69d';x.fillRect(0,91,216,53);
    x.fillStyle='#7d9e84';x.beginPath();x.moveTo(0,95);x.lineTo(37,32);x.lineTo(88,95);x.lineTo(141,22);x.lineTo(216,98);x.fill();
    x.strokeStyle='#fff0bb';x.lineWidth=12;x.beginPath();x.moveTo(0,125);x.lineTo(40,110);x.lineTo(69,132);x.lineTo(111,93);x.lineTo(159,110);x.lineTo(216,64);x.stroke();
    x.fillStyle='#f8e399';x.beginPath();x.arc(176,26,13,0,Math.PI*2);x.fill();
    x.fillStyle='#4b7566';x.fillRect(24,62,9,49);x.fillRect(9,55,43,19);x.fillRect(18,42,27,18);
    x.fillStyle='#ac7563';x.fillRect(104,45,25,40);x.fillStyle='#4f6682';x.fillRect(99,39,35,8);x.fillStyle='#ead5a2';x.fillRect(112,58,9,18);
    x.fillStyle='#c99b55';x.fillRect(181,101,25,20);x.fillStyle='#ffed98';x.fillRect(179,97,29,8);x.fillRect(191,105,5,7);
    return c;
  }
  montarPuzzle(p){
    if(!p)return;this.puzzleAtual=p;this.versaoPuzzle=p.versao;
    document.getElementById('tituloPuzzle').textContent=p.dados.nome+' · '+p.dados.habilidade;
    document.getElementById('instrucaoPuzzle').textContent=p.dados.descricao;
    const corpo=document.getElementById('corpoPuzzle');
    if(p.dados.tipo==='sequencia')corpo.innerHTML=`<div class="simbolos">${SIMBOLOS.slice(0,4).map((s,i)=>`<button class="simbolo ${p.luz===i?'acendendo':''}" data-acao="simbolo" data-valor="${i}" aria-label="Símbolo ${i+1}: ${s}" ${p.status!=='jogando'?'disabled':''}>${s}</button>`).join('')}</div><p>${p.status==='observando'?'Observe as luzes. Espere sua vez.':p.status==='vitoria'?'Você dominou a sequência!':'Progresso: '+p.cursor+'/'+p.sequencia.length}</p>`;
    else if(p.dados.tipo==='memoria')corpo.innerHTML=`<div class="cartas-memoria">${p.cartas.map((s,i)=>{const aberta=p.encontradas[i]||p.abertas.includes(i);return `<button class="carta-memoria ${aberta?'virada':''} ${p.encontradas[i]?'encontrada':''}" data-acao="carta" data-valor="${i}" aria-label="Carta ${i+1}${aberta?': '+SIMBOLOS[s]:', virada para baixo'}" ${p.encontradas[i]||p.espera>0?'disabled':''}>${aberta?SIMBOLOS[s]:'✦'}</button>`;}).join('')}</div><p>Pares: ${p.encontradas.filter(Boolean).length/2}/4 · Tentativas diferentes: ${p.erros}</p>`;
    else{
      corpo.innerHTML=`<div class="puzzle-mapa"><div class="referencia-puzzle"><p>Mapa de referência</p><canvas id="referenciaPuzzle" width="216" height="144" aria-label="Referência: caminho entre árvore, torre e tesouro"></canvas></div><div class="grade-encaixes">${p.encaixadas.map((ok,i)=>`<button class="destino ${ok?'encaixado':''}" data-destino="${i}" data-acao="destino" data-valor="${i}" aria-label="Espaço ${i+1}" ${ok?'disabled':''}>${ok?`<canvas width="72" height="72" data-recorte="${i}"></canvas>`:i+1}</button>`).join('')}</div></div><div class="bandeja-pecas">${p.ordem.map((id,i)=>`<button class="peca ${p.selecionada===id?'selecionada':''}" data-peca="${id}" data-acao="selecionarPeca" data-valor="${id}" aria-label="Peça ${i+1} da bandeja" ${p.encaixadas[id]?'disabled':''}>${p.encaixadas[id]?'✓':`<canvas width="72" height="72" data-recorte="${id}"></canvas>`}</button>`).join('')}</div>`;
      document.getElementById('referenciaPuzzle').getContext('2d').drawImage(this.mapaPuzzle,0,0);
      for(const canvas of corpo.querySelectorAll('[data-recorte]')){const id=Number(canvas.dataset.recorte);canvas.getContext('2d').drawImage(this.mapaPuzzle,id%3*72,Math.floor(id/3)*72,72,72,0,0,72,72);}
    }
    document.getElementById('feedbackPuzzle').textContent=p.feedback;
    document.getElementById('finalizarPuzzle').textContent=p.status==='vitoria'?'Aprendido! Voltar à loja →':'Voltar ao Bento →';
  }
  atualizar(sessao,m,estado,engine){
    super.atualizar(sessao,m,estado,engine);this.texto('moedas','◈ '+engine.perfil.moedas);
    const ima=engine.perfil.consumiveis.ima;this.texto('estadoIma',ima>0?'✧ ÍMÃ '+Math.ceil(ima)+'s':'');
    document.getElementById('interagirMercador').hidden=!(estado===E.JOGANDO&&engine.descanso&&engine.mercadorPerto);
    document.getElementById('toqueDash').disabled=!engine.atributos.podeDash;
    const som=document.getElementById('botaoSom');som.textContent=engine.perfil.opcoes.som?'♫':'♪̸';som.setAttribute('aria-label',engine.perfil.opcoes.som?'Desativar som':'Ativar som');
    if(engine.descanso){this.texto('nomeFase','DESCANSO · Bento do Cipó');this.texto('fase','PRÓXIMA '+(engine.descanso.proxima>15?'VITÓRIA':'FASE '+engine.descanso.proxima));}
    if(estado===E.PUZZLE&&engine.puzzle&&(engine.puzzle!==this.puzzleAtual||engine.puzzle.versao!==this.versaoPuzzle)&&!this.arraste)this.montarPuzzle(engine.puzzle);
  }
  mostrarTestes(r){const caixa=document.getElementById('relatorioTestes');caixa.hidden=false;caixa.innerHTML='<button data-acao="fecharTestes">Fechar relatório →</button><pre></pre>';caixa.querySelector('pre').textContent=r.texto;}
}

export { Interface };
