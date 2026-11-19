import { Jogo } from './jogo.js';
import { TECNICAS } from './ajustes.js';
import { CHAVE, carregarPerfil, salvarPerfil, validar } from './perfil.js';
import { Som } from './som.js';
import { EntradaCinzas } from './entrada.js';
import { Pintura } from './pintura.js';
import { LoopPrincipal } from '../core/loopPrincipal.js';
import { icone, dois, regiaoCasa, telaAtlas, telaTecnicas, telaManual, telaOpcoes, telaPausa, telaMorte, telaResultado } from './telas.js';

const $=id=>document.getElementById(id);
const FALAS=['Uma gravação boa começa ouvindo a pedra.','O cristal canta antes do impacto. Escute.','Leve só duas marcas. Aprenda o peso de cada uma.'];
const caminhos={menu:'menu',atlas:'menu',tecnicas:'menu',manual:'menu',opcoes:'menu',pausa:'jogando',descanso:'jogando',oficina:'jogando'};
function texto(el,v){const s=String(v);if(el.textContent!==s)el.textContent=s;}
function ocultar(el,sim){if(el.hidden!==sim)el.hidden=sim;}
function barra(el,v,max){
  const atual=Math.round(Math.max(0,v));
  if(el.max!==max)el.max=max;if(el.value!==atual)el.value=atual;
}
class Aplicacao {
  constructor(arte){
    this.palco=$('palco');this.casa=$('casa');this.partida=$('partida');this.canvas=$('jogo');this.camada=$('camada');this.painel=$('painel');
    this.hud=Object.fromEntries(['vida','vigor','vidaTexto','vigorTexto','frascos','ecos','local','faixaChefe','nomeChefe','faseChefe','vidaChefe','avisoCampo','sairTreino','interacao'].map(id=>[id,$(id)]));
    this.controles=[...document.querySelectorAll('[data-controle]')];this.regiao=0;this.tela='menu';this.sobreCampo=false;this.anterior='menu';this.fala=0;
    this.movimento=window.matchMedia('(prefers-reduced-motion: reduce)');this.som=new Som();
    try{this.armazenamento=window.localStorage;}catch{this.armazenamento=null;}
    this.saveOk=!!this.armazenamento;this.perfil=carregarPerfil(this.armazenamento);this.jogo=this.criarJogo(this.perfil);
    this.desenho=new Pintura(this.canvas,arte);
    this.entrada=new EntradaCinzas(()=>this.tela==='jogando',codigo=>this.atalho(codigo));
    this.loop=new LoopPrincipal(dt=>{if(this.tela==='jogando')this.jogo.atualizar(dt,this.entrada.ler());},()=>this.quadro());
    this.instalarEventos();this.redimensionar();this.configurarSom();this.titulo(false);
  }
  criarJogo(p){return new Jogo(p,{salvar:perfil=>this.gravar(perfil),som:id=>this.som.tocar(id),evento:(nome,dados)=>this.evento(nome,dados)});}
  gravar(perfil=this.perfil){
    this.saveOk=salvarPerfil(this.armazenamento,perfil);
    if(!this.saveOk&&!this.avisouSave){this.avisouSave=true;this.global('O progresso está nesta sessão. Exporte uma cópia nas opções.');}
    return this.saveOk;
  }
  global(msg){
    const el=$('avisoGlobal');texto(el,msg);el.hidden=false;clearTimeout(this.esperaAviso);
    this.esperaAviso=setTimeout(()=>el.hidden=true,4100);
  }
  configurarSom(){
    const p=this.perfil.opcoes;this.som.configurar(p.som,p.volume);
    const b=$('somMenu');b.setAttribute('aria-pressed',String(p.som));b.setAttribute('aria-label',p.som?'Desativar som':'Ativar som');
    b.firstElementChild.className='ico i-'+(p.som?'som':'mudo');
  }
  instalarEventos(){
    const audio=()=>this.som.iniciar();
    window.addEventListener('pointerdown',audio,{once:true});window.addEventListener('keydown',audio,{once:true});
    this.palco.addEventListener('click',e=>{
      const b=e.target.closest('[data-acao]');if(!b||b.disabled)return;e.preventDefault();this.agir(b.dataset.acao,b.dataset);
    });
    this.palco.addEventListener('change',e=>{
      const o=this.perfil.opcoes,alvo=e.target;
      if(alvo.id==='arquivoSave'){this.importar(alvo);return;}
      if(alvo.id==='prefSom')o.som=alvo.checked;
      else if(alvo.id==='prefMovimento')o.movimento=alvo.checked;
      else if(alvo.id==='volume')o.volume=Number(alvo.value)/100;
      else if(alvo.id==='modo')o.modo=alvo.value;else return;
      this.configurarSom();this.gravar();
    });
    this.palco.addEventListener('input',e=>{if(e.target.id==='volume')this.som.configurar(this.perfil.opcoes.som,Number(e.target.value)/100);});
    this.painel.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;const itens=[...this.painel.querySelectorAll('button:not(:disabled),input,select,a[href]')].filter(b=>b.offsetParent);
      if(!itens.length)return;
      if(e.shiftKey&&(document.activeElement===itens[0]||document.activeElement===this.painel)){e.preventDefault();itens.at(-1).focus();}
      else if(!e.shiftKey&&document.activeElement===itens.at(-1)){e.preventDefault();itens[0].focus();}
    });
    window.addEventListener('resize',()=>this.redimensionar());
    const descanso=()=>{
      this.entrada.limpar();
      if(this.tela==='jogando')this.abrir('pausa');
      if(this.jogo.fase&&this.sobreCampo)this.jogo.salvarSessao();
    };
    window.addEventListener('blur',descanso);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)descanso();});
    window.addEventListener('pagehide',()=>{if(this.sobreCampo)this.jogo.salvarSessao();this.loop.parar();});
    window.addEventListener('pageshow',()=>{if(this.tela==='jogando')this.loop.iniciar();});
    window.addEventListener('storage',e=>{
      if(e.key!==CHAVE||!e.newValue)return;
      try{const salvo=validar(JSON.parse(e.newValue));if(salvo.revisao>this.perfil.revisao){
        this.loop.parar();this.perfil=salvo;this.jogo=this.criarJogo(salvo);this.configurarSom();this.titulo(false);
        this.global('Progresso atualizado pela outra aba. Você pode continuar daqui.');
      }}catch{}
    });
  }
  redimensionar(){
    const estreito=innerWidth<=740&&innerHeight>innerWidth;
    const w=estreito?304:480,h=estreito?252:270;
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    if(this.sobreCampo&&this.jogo.heroi)this.quadro(true);
  }
  atalhosSom(){this.perfil.opcoes.som=!this.perfil.opcoes.som;this.configurarSom();this.gravar();if(this.tela==='opcoes')$('prefSom').checked=this.perfil.opcoes.som;}
  atalho(codigo){
    if(codigo==='KeyM'){this.atalhosSom();return;}
    if(this.tela==='jogando')this.abrir('pausa');else if(this.tela==='pausa')this.retomar();
    else if(codigo==='Escape'&&this.tela!=='menu')this.voltar();
  }
  titulo(salvar=true){
    if(salvar&&this.sobreCampo)this.jogo.salvarSessao();
    this.loop.parar();this.entrada.limpar();this.tela='menu';this.sobreCampo=false;this.palco.dataset.tela='menu';
    this.casa.hidden=false;this.casa.inert=false;this.partida.hidden=true;this.partida.inert=true;this.camada.hidden=true;
    const p=this.perfil;texto($('partir').querySelector('span'),p.concluidas.length===15?'Explorar a jornada':p.iniciada?'Continuar jornada':'Iniciar jornada');
    $('cartasRegiao').innerHTML=regiaoCasa(p);
    texto($('estadoSave').querySelector('span'),this.saveOk?(p.iniciada?'Nível '+p.nivel+' · '+p.concluidas.length+' de 15 fases':'Progresso neste dispositivo'):'Progresso nesta sessão');
    this.som.definirTema('menu');this.som.pausar(false);
    if(salvar)$('partir').focus({preventScroll:true});return true;
  }
  carregar(id,retomar=false){
    if(id<1||id>this.perfil.liberada)return;
    this.jogo.carregar(id,retomar);this.desenho.centrar?.(this.jogo);
    this.sobreCampo=true;this.regiao=this.jogo.fase.regiao;this.hud.avisoCampo.hidden=true;
    this.ateAviso=-1;this.retomar();this.quadro(true);
  }
  retomar(){
    if(!this.jogo.fase||this.jogo.concluida||this.jogo.heroi.acao==='morto')return;
    this.tela='jogando';this.sobreCampo=true;this.palco.dataset.tela=this.tela;
    this.casa.hidden=true;this.casa.inert=true;this.partida.hidden=false;this.partida.inert=false;this.camada.hidden=true;
    this.entrada.limpar();this.canvas.focus({preventScroll:true});this.som.definirTema(this.jogo.emTreino?'oficina':'fase'+this.jogo.fase.id);
    this.som.pausar(false);this.loop.iniciar();
  }
  conteudo(tipo){
    const p=this.perfil,j=this.jogo;
    if(tipo==='atlas')return telaAtlas(p,this.regiao);
    if(['tecnicas','oficina','descanso'].includes(tipo))return telaTecnicas(p,tipo,FALAS[this.fala%FALAS.length]);
    if(tipo==='manual')return telaManual();
    if(tipo==='opcoes')return telaOpcoes(p);
    if(tipo==='pausa')return telaPausa(j);
    if(tipo==='morte')return telaMorte(j);
    return telaResultado(j);
  }
  abrir(tipo,atualizar=false){
    const rolagem=atualizar?this.painel.scrollTop:0,alvo=atualizar?document.activeElement?.dataset:null;
    if(!atualizar){
      if(this.camada.hidden)this.focoAnterior=document.activeElement;
      if(['manual','opcoes','atlas','tecnicas'].includes(tipo))this.anterior=this.tela;
      if(tipo==='oficina')this.fala++;
    }
    this.loop.parar();this.entrada.limpar();this.tela=tipo;this.palco.dataset.tela=tipo;
    this.casa.inert=true;this.partida.inert=true;this.camada.hidden=false;
    this.painel.className='painel '+(['pausa','morte','resultado','vitoria'].includes(tipo)?'estreito':tipo==='oficina'?'loja':'');
    this.painel.dataset.painel=tipo;this.painel.innerHTML=this.conteudo(tipo);this.painel.scrollTop=rolagem;
    if(tipo==='oficina')this.quadro(true);
    if(tipo==='oficina'||tipo==='descanso'){this.som.definirTema(tipo);this.som.pausar(false);}
    else if(this.sobreCampo)this.som.pausar(true);
    let foco=alvo?.acao?[...this.painel.querySelectorAll('[data-acao]')].find(b=>!b.disabled&&b.dataset.acao===alvo.acao&&b.dataset.id===alvo.id&&b.dataset.slot===alvo.slot):null;
    if(!foco)foco=this.painel.querySelector('.primario:not(:disabled)')||this.painel;
    foco.focus({preventScroll:true});
  }
  voltar(){
    if(this.tela==='morte'){this.agir('renascer');return;}
    if(this.tela==='vitoria'||this.tela==='resultado'){this.titulo();return;}
    const pai=['atlas','tecnicas','manual','opcoes'].includes(this.tela)?this.anterior:caminhos[this.tela];
    if(pai==='jogando'){this.retomar();return;}
    if(pai&&pai!=='menu'&&pai!==this.tela){this.abrir(pai);return;}
    const foco=this.focoAnterior;this.titulo(false);
    if(foco?.isConnected&&this.casa.contains(foco))foco.focus({preventScroll:true});else $('partir').focus({preventScroll:true});
  }
  evento(nome,dados){
    if(nome==='efeito'){this.desenho?.efeito(dados);return;}
    if(nome==='dica'){this.aviso(String(dados));return;}
    if(['descanso','oficina','morte','faseConcluida'].includes(nome)){
      this.quadro(true);
      this.abrir(nome==='faseConcluida'?(this.jogo.fase.id===15?'vitoria':'resultado'):nome);
    }
  }
  aviso(msg){
    const toque=this.entrada?.toque;
    if(toque)msg=msg.replace(/\[E\]|\btecla E\b/g,'Interagir');
    texto(this.hud.avisoCampo,msg);this.hud.avisoCampo.hidden=false;this.ateAviso=this.jogo.tempo+3.5;
  }
  quadro(forcar=false){
    const j=this.jogo;if(!j.fase||(!forcar&&this.tela!=='jogando'))return;
    const h=j.heroi,p=j.perfil,u=this.hud;
    this.desenho.exibir(j,1/60,{movimento:p.opcoes.movimento&&!this.movimento.matches,oficina:this.tela==='oficina'});
    barra(u.vida,h.vida,h.vidaMax);barra(u.vigor,h.vigor,h.vigorMax);
    texto(u.vidaTexto,Math.ceil(h.vida));texto(u.vigorTexto,Math.floor(h.vigor));texto(u.frascos,h.frascos);texto(u.ecos,p.ecos);
    texto(u.local,j.emTreino?'Oficina · Campo de treino':'F'+dois(j.fase.id)+' · '+j.fase.nome+' · '+p.estrelas[j.fase.id].length+'/3 ★');
    const chefe=j.inimigos.find(i=>(i.tipo==='chefe'||i.tipo==='elite')&&i.estado!=='morto'&&Math.abs(i.x-h.x)<Math.min(175,this.canvas.width*.44));
    ocultar(u.faixaChefe,!chefe);
    if(chefe){texto(u.nomeChefe,chefe.nome);texto(u.faseChefe,chefe.faseChefe===2?'Fúria':'');barra(u.vidaChefe,chefe.vida,chefe.vidaMax);}
    if(this.ateAviso!==undefined&&j.tempo>this.ateAviso)ocultar(u.avisoCampo,true);
    const alvo=j.alvoInteracao();
    ocultar(u.interacao,!alvo||j.emTreino);if(alvo&&!j.emTreino)texto(u.interacao.lastElementChild,alvo.texto);
    ocultar(u.sairTreino,!j.emTreino);
    const equip=j.tecnicasAtivas;
    for(const b of this.controles){
      const slot=b.dataset.controle==='t1'?0:b.dataset.controle==='t2'?1:-1;
      if(slot<0)continue;
      const desabilitado=!equip[slot];if(b.disabled!==desabilitado)b.disabled=desabilitado;
      if(b.dataset.tecnica!==(equip[slot]||'')){
        b.dataset.tecnica=equip[slot]||'';
        const nome=TECNICAS.find(t=>t.id===equip[slot])?.nome||'livre';
        b.setAttribute('aria-label','Técnica '+(slot+1)+' · '+nome);
      }
    }
  }
  agir(acao,d={}){
    const j=this.jogo,p=this.perfil,id=d.id;
    if(acao==='som'){this.atalhosSom();return;}
    if(acao==='telaCheia'){this.alternarTelaCheia();return;}
    if(acao==='pausa'){if(this.tela==='jogando')this.abrir('pausa');return;}
    if(acao==='retomar'){this.retomar();return;}
    if(acao==='interagir'){if(this.tela==='jogando')j.interagir();return;}
    if(acao==='sairTreino'){if(j.emTreino)j.treinar();return;}
    if(acao==='partir'){if(p.concluidas.length===15){this.regiao=4;this.abrir('atlas');}else this.carregar(p.fase,p.iniciada);return;}
    if(acao==='visitar'){const n=Number(id);this.carregar(n,n===p.fase&&p.iniciada);return;}
    if(acao==='renascer'){if(j.renascer()){this.desenho.centrar?.(j);this.retomar();this.aviso('A chama voltou a arder.');}return;}
    if(acao==='avancar'){this.carregar(Math.min(15,j.fase.id+1));return;}
    if(acao==='inicio'||acao==='menu'){this.titulo();return;}
    if(acao==='voltar'){this.voltar();return;}
    if(acao==='regiao'){this.regiao=Number(id);this.abrir('atlas',this.tela==='atlas');return;}
    if(acao==='exportar'){this.exportar();return;}
    if(acao==='importar'){$('arquivoSave').click();return;}
    if(['manual','atlas','tecnicas','opcoes'].includes(acao)){this.som.tocar('menu');this.abrir(acao);return;}
    if(acao==='ensaiar'){if(j.treinar(id)){this.desenho.centrar?.(j);this.retomar();}return;}
    if(['comprar','equipar','limparSlot'].includes(acao)){
      const ok=acao==='comprar'?j.comprar(id):j.equipar(acao==='limparSlot'?null:id,Number(d.slot));
      const nome=TECNICAS.find(t=>t.id===id)?.nome||'Técnica';
      this.abrir(this.tela,true);texto($('feedbackOficina'),ok?(acao==='comprar'?nome+' gravada.':acao==='equipar'?nome+' equipada.':'Espaço liberado.'):'A gravação não pôde ser concluída.');
    }
  }
  async alternarTelaCheia(){
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else if(this.palco.requestFullscreen)await this.palco.requestFullscreen();
      else this.global('Use a opção de tela cheia do navegador.');
    }catch{this.global('O navegador manteve o tamanho da janela.');}
  }
  exportar(){
    if(this.sobreCampo)this.jogo.salvarSessao();
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(this.perfil,null,2)],{type:'application/json'}));
    a.href=url;a.download='aventura-na-selva-jornada.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  async importar(input){
    const arq=input.files?.[0];input.value='';if(!arq)return;
    try{
      if(arq.size>1200000)throw new Error('O arquivo excede o tamanho de uma jornada.');
      const p=validar(JSON.parse(await arq.text()));p.revisao=carregarPerfil(this.armazenamento).revisao;
      this.loop.parar();this.perfil=p;this.jogo=this.criarJogo(p);this.gravar();this.configurarSom();this.titulo(false);
      this.global('Jornada importada. Fase '+p.fase+' disponível.');
    }catch(e){this.global('Falha ao importar. '+(e instanceof SyntaxError?'O arquivo precisa conter JSON válido.':e.message));}
  }
}
export { Aplicacao };
