import { Jogo } from './jogo.js';
import { ATRIBUTOS, CLASSES, MAXIMO_ATRIBUTO, MINIMO_ATRIBUTO, TECNICAS, TIPOS_DANO, classeDoPerfil } from './ajustes.js';
import { CHAVE, novoPerfil, escolherClasse, carregarPerfil, salvarPerfil, validar } from './perfil.js';
import { criarHeroi } from './combate.js';
import { desenharHeroi } from './atores-pixel.js';
import { Som } from './som.js';
import { EntradaCinzas, teclasPadrao } from './entrada.js';
import { Pintura } from './pintura.js';
import { LoopPrincipal } from '../core/loopPrincipal.js';
import { AMULETOS } from './progresso.js';
import { dadosHeroi, multiplicadorResistencia, nivelDosAtributos } from './poder.js';
import { telaNivel, telaRefazer } from './niveis-ui.js';
import { desafioDoDia, tempoProva, gravarFantasma, registrarProva, desbloquear, cicloEmAndamento, iniciarCiclo } from './modos.js';
import { dois, telaAtlas, telaClasses, telaTecnicas, telaManual, telaOpcoes, telaPausa, telaMorte,
  telaResultado, telaAmuletos, telaProvas, telaResultadoProva } from './telas.js';

const $=id=>document.getElementById(id);
const FALAS=['Uma gravação boa começa ouvindo a pedra.','O cristal canta antes do impacto. Escute.','Leve só duas marcas. Aprenda o peso de cada uma.'];
const caminhos={menu:'menu',atlas:'menu',tecnicas:'menu',manual:'menu',opcoes:'menu',pausa:'jogando',descanso:'jogando',oficina:'jogando',nivel:'descanso',refazer:'nivel'};
const submenus=['manual','opcoes','atlas','tecnicas','amuletos','provas'];
const congelamentos={impacto:.035,'impacto-metal':.045,dano:.054,'aparo-perfeito':.068,perfeito:.045};
const pulsosCongelados=['pulo','puloPorToque','leve','pesado','esquiva','cura','t1','t2','interagir','talento'];
const tiposBarra = new Set(['chefe','elite','mini']);
const iconesDano={fisico:'⚔',fogo:'♨',arcano:'✦',sagrado:'✚'};
function texto(el,v){const s=String(v);if(el.textContent!==s)el.textContent=s;}
function ocultar(el,sim){if(el.hidden!==sim)el.hidden=sim;}
function barra(el,v,max){
  const atual=Math.round(Math.max(0,v));
  if(el.max!==max)el.max=max;if(el.value!==atual)el.value=atual;
}
class Aplicacao {
  constructor(arte){
    this.palco=$('palco');this.casa=$('casa');this.partida=$('partida');this.canvas=$('jogo');this.camada=$('camada');this.painel=$('painel');
    this.hud=Object.fromEntries(['vida','vigor','vidaTexto','vigorTexto','frascos','ecos','local','faixaChefe','nomeChefe','faseChefe',
      'vidaChefe','posturaChefe','avisoCampo','sairTreino','interacao','objetivos','classeEstado','alvoEstado','alvoNome','alvoResistencias'].map(id=>[id,$(id)]));
    this.controles=[...document.querySelectorAll('[data-controle]')];this.regiao=0;this.tela='menu';this.sobreCampo=false;this.anterior='menu';this.fala=0;
    this.botaoTalento=this.controles.find(botao=>botao.dataset.controle==='talento');
    this.movimento=window.matchMedia('(prefers-reduced-motion: reduce)');this.som=new Som();
    try{this.armazenamento=window.localStorage;}catch{this.armazenamento=null;}
    this.saveOk=!!this.armazenamento;this.perfil=carregarPerfil(this.armazenamento);this.jogo=this.criarJogo(this.perfil);
    this.desenho=new Pintura(this.canvas,arte);
    this.entrada=new EntradaCinzas(()=>this.tela==='jogando',codigo=>this.atalho(codigo),
      ()=>this.perfil.opcoes,()=>this.jogo.tecnicasAtivas,()=>this.jogo.heroi?.classe?.talento);
    this.hitStop=0;this.pulsosPendentes={};this.prova=null;this.opcoesDesenho={};
    this.loop=new LoopPrincipal(dt=>this.simular(dt),()=>this.quadro());
    this.instalarEventos();this.redimensionar();this.configurarSom();this.titulo(false);
  }
  criarJogo(p){
    return new Jogo(p,{
      salvar:perfil=>{if(perfil===this.perfil)this.gravar(perfil);},
      som:id=>this.som.tocar(id),evento:(nome,dados)=>this.evento(nome,dados)
    });
  }
  simular(dt){
    if(this.tela!=='jogando')return;
    const entrada=this.entrada.ler();
    if(this.hitStop>0){
      this.hitStop=Math.max(0,this.hitStop-dt);
      for(const acao of pulsosCongelados)if(entrada[acao])this.pulsosPendentes[acao]=true;
      return;
    }
    for(const acao of pulsosCongelados){
      if(!this.pulsosPendentes[acao])continue;
      entrada[acao]=true;
      this.pulsosPendentes[acao]=false;
    }
    this.jogo.atualizar(dt,entrada);
    if(this.prova?.tipo==='crono'&&!this.jogo.concluida)this.amostrarProva();
  }
  amostrarProva(){
    const h=this.jogo.heroi;
    gravarFantasma(this.prova.trilha,Math.round(this.jogo.tempo*1000),h.x+h.w/2,h.y+h.h);
  }
  iniciarProva(config){
    if(!Number.isInteger(config.fase)||config.fase<1||config.fase>15)return;
    if(!this.prova&&this.sobreCampo)this.jogo.salvarSessao();
    const temporario=novoPerfil();
    temporario.classe='herdeiro';
    temporario.liberada=15;
    temporario.opcoes={...this.perfil.opcoes,modo:'normal',assistenciaPulo:1};
    if(config.modificador){temporario.ciclo=2;temporario.modificadores=[config.modificador];}
    this.prova={
      tipo:config.tipo,fase:config.fase,chave:config.chave,seed:config.seed,
      modificador:config.modificador,trilha:[],fantasma:this.perfil.recordes.cronos[config.fase]?.trilha
    };
    this.jogo=this.criarJogo(temporario);
    this.mostrarFase(config.fase);
    if(config.tipo==='crono')this.amostrarProva();
  }
  finalizarProva(){
    const prova=this.prova;
    if(prova.ms)return;
    if(prova.tipo==='crono')this.amostrarProva();
    prova.ms=Math.round(this.jogo.tempo*1000);
    prova.registrado=registrarProva(this.perfil,prova,prova.ms,prova.trilha);
    desbloquear(this.perfil,prova.tipo);
    this.gravar();
  }
  sairProva(){
    if(!this.prova)return;
    this.prova=null;
    this.jogo=this.criarJogo(this.perfil);
  }
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
      else if(['tremor','flash'].includes(alvo.id))o[alvo.id]=alvo.valueAsNumber/100;
      else if(alvo.id==='modo')o.modo=alvo.value;
      else if(alvo.dataset.opcaoEntrada){
        const nome=alvo.dataset.opcaoEntrada;
        o[nome]=alvo.type==='checkbox'?alvo.checked:alvo.type==='range'?alvo.valueAsNumber:alvo.value;
        this.entrada.atualizarOpcoes();
      }else return;
      this.configurarSom();this.gravar();
    });
    this.palco.addEventListener('input',e=>{if(e.target.id==='volume')this.som.configurar(this.perfil.opcoes.som,Number(e.target.value)/100);});
    this.painel.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const itens=[...this.painel.querySelectorAll('button:not(:disabled),input,select,a[href],summary')]
        .filter(elemento=>elemento.offsetParent&&(elemento.tagName==='SUMMARY'||!elemento.closest('details:not([open])')));
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
        this.loop.parar();this.perfil=salvo;this.jogo=this.criarJogo(salvo);this.prova=null;
        this.entrada.atualizarOpcoes();this.configurarSom();this.titulo(false);
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
    this.sairProva();
    this.selecaoClasse=null;
    this.loop.parar();this.entrada.limpar();this.tela='menu';this.sobreCampo=false;this.palco.dataset.tela='menu';
    this.casa.hidden=false;this.casa.inert=false;this.partida.hidden=true;this.partida.inert=true;this.camada.hidden=true;
    const p=this.perfil;
    $('partir').disabled = !p.iniciada;
    const principal = p.iniciada ? $('partir') : $('novoJogo');
    for (const id of ['partir', 'novoJogo']) $(id).classList.toggle('recomendado', $(id) === principal);
    texto($('estadoSave').querySelector('span'),this.saveOk?(p.iniciada?classeDoPerfil(p).nome+' · Nível '+p.nivel+' · '+p.concluidas.length+' de 15 fases':'Progresso neste dispositivo'):'Progresso nesta sessão');
    this.som.definirTema('menu');this.som.pausar(false);
    if(salvar)principal.focus({preventScroll:true});return true;
  }
  carregar(id,retomar=false){
    const perfil=this.perfil;
    if(id<1||id>(cicloEmAndamento(perfil)?perfil.cicloAte:perfil.liberada))return;
    if(!perfil.iniciada&&!perfil.classe){
      this.selecaoClasse={id:'cavaleiro',fase:id,origem:this.tela,novoCiclo:false};
      this.abrir('classes');
      return;
    }
    this.sairProva();
    this.mostrarFase(id,retomar);
  }
  mostrarFase(id,retomar=false){
    this.jogo.carregar(id,retomar);this.desenho.centrar?.(this.jogo);
    this.sobreCampo=true;this.regiao=this.jogo.fase.regiao;this.hud.avisoCampo.hidden=true;
    this.ateAviso=-1;this.retomar();this.quadro(true);
  }
  retomar(){
    if(!this.jogo.fase||this.jogo.concluida||this.jogo.heroi.acao==='morto')return;
    this.tela='jogando';this.sobreCampo=true;this.palco.dataset.tela=this.tela;
    this.casa.hidden=true;this.casa.inert=true;this.partida.hidden=false;this.partida.inert=false;this.camada.hidden=true;
    this.entrada.limpar();this.hitStop=0;this.pulsosPendentes={};this.ultimoDesenho=undefined;
    this.canvas.focus({preventScroll:true});this.som.definirTema(this.jogo.emTreino?'oficina':'fase'+this.jogo.fase.id);
    this.som.pausar(false);this.loop.iniciar();
  }
  conteudo(tipo){
    const p=this.perfil,j=this.jogo;
    if(tipo==='atlas')return telaAtlas(p,this.regiao);
    if(tipo==='classes')return telaClasses(this.selecaoClasse);
    if(tipo==='nivel')return telaNivel(j.perfil,this.atributoSelecionado,j.podeMelhorarAtributos());
    if(tipo==='refazer')return telaRefazer(j.perfil,this.rascunhoAtributos,j.podeMelhorarAtributos());
    if(['tecnicas','oficina','descanso'].includes(tipo))
      return telaTecnicas(tipo==='tecnicas'?p:j.perfil,tipo,FALAS[this.fala%FALAS.length],!this.prova);
    if(tipo==='manual')return telaManual(p);
    if(tipo==='opcoes')return telaOpcoes(p);
    if(tipo==='amuletos')return telaAmuletos(this.sobreCampo?j.perfil:p,this.anterior);
    if(tipo==='provas')return telaProvas(p,this.diarioPainel=desafioDoDia());
    if(tipo==='resultado-prova')return telaResultadoProva(this.prova);
    if(tipo==='pausa')return telaPausa(j);
    if(tipo==='morte')return telaMorte(j);
    return telaResultado(j);
  }
  abrir(tipo,atualizar=false){
    const rolagem=atualizar?this.painel.scrollTop:0,alvo=atualizar?document.activeElement?.dataset:null;
    const controlesAbertos=atualizar&&this.painel.querySelector('.detalhes-controles')?.open;
    if(!atualizar){
      if(this.camada.hidden)this.focoAnterior=document.activeElement;
      if(submenus.includes(tipo))this.anterior=this.tela;
      if(tipo==='oficina')this.fala++;
    }
    this.loop.parar();this.entrada.limpar();this.tela=tipo;this.palco.dataset.tela=tipo;
    this.casa.inert=true;this.partida.inert=true;this.camada.hidden=false;
    this.painel.className='painel '+(['pausa','morte','resultado','vitoria'].includes(tipo)?'estreito':tipo==='oficina'?'loja':'');
    this.painel.dataset.painel=tipo;this.painel.innerHTML=this.conteudo(tipo);this.painel.scrollTop=rolagem;
    if(tipo==='classes')this.pintarPreviaClasse();
    if(controlesAbertos&&tipo==='opcoes')this.painel.querySelector('.detalhes-controles').open=true;
    if(tipo==='oficina')this.quadro(true);
    if(tipo==='oficina'||tipo==='descanso'){this.som.definirTema(tipo);this.som.pausar(false);}
    else if(this.sobreCampo)this.som.pausar(true);
    let foco=alvo?.acao?[...this.painel.querySelectorAll('[data-acao]')].find(b=>!b.disabled&&b.dataset.acao===alvo.acao&&b.dataset.id===alvo.id&&b.dataset.slot===alvo.slot):null;
    if(!foco&&tipo==='classes')foco=this.painel.querySelector('.classe-opcao[aria-pressed="true"]');
    if(!foco)foco=this.painel.querySelector('.primario:not(:disabled)')||this.painel;
    foco.focus({preventScroll:true});
  }
  voltar(){
    if(this.tela==='classes'){
      const escolha=this.selecaoClasse;
      this.selecaoClasse=null;
      if(escolha.novoCiclo){
        this.abrir('provas');
        for(const opcao of this.painel.querySelectorAll('[data-ciclo]'))opcao.checked=escolha.modificadores.includes(opcao.dataset.ciclo);
        this.painel.querySelector('[data-acao="novoCiclo"]')?.focus({preventScroll:true});
      }else if(escolha.origem==='atlas')this.abrir('atlas');
      else this.titulo();
      return;
    }
    if(this.tela==='morte'){this.agir('renascer');return;}
    if(this.tela==='vitoria'||this.tela==='resultado'||this.tela==='resultado-prova'){this.titulo();return;}
    const pai=submenus.includes(this.tela)?this.anterior:caminhos[this.tela];
    if(pai==='jogando'){this.retomar();return;}
    if(pai&&pai!=='menu'&&pai!==this.tela){this.abrir(pai);return;}
    const foco=this.focoAnterior;this.titulo(false);
    if(foco?.isConnected&&this.casa.contains(foco))foco.focus({preventScroll:true});else $('partir').focus({preventScroll:true});
  }
  pintarPreviaClasse(){
    const tela=$('poseClasse');
    const contexto=tela.getContext('2d');
    if(!contexto)return;
    const heroi=criarHeroi({...this.perfil,classe:this.selecaoClasse.id});
    Object.assign(heroi,{x:41,y:30,noChao:true,acao:'pesado',etapa:'preparo',progressoEtapa:.68});
    contexto.imageSmoothingEnabled=false;
    desenharHeroi(contexto,heroi,this.desenho.arte.hero,0,true,this.desenho.brilhos);
  }
  evento(nome,dados){
    if(nome==='efeito'){
      this.desenho?.efeito(dados);
      if(this.perfil.opcoes.movimento&&!this.movimento.matches&&congelamentos[dados.tipo])
        this.hitStop=Math.max(this.hitStop,congelamentos[dados.tipo]);
      if(['dano','aparo-perfeito','perfeito'].includes(dados.tipo))this.entrada.vibrar(dados.tipo==='dano'?26:14);
      return;
    }
    if(nome==='dica'||nome==='momento'){this.aviso(String(dados));return;}
    if(nome==='objetivo'){
      if(!this.prova)this.global('Objetivo cumprido · '+dados.texto+' · +'+dados.ecos+' ecos');
      return;
    }
    if(nome==='janelaOuro'||nome==='janelaAnunciada'){
      const tecnica=TECNICAS.find(item=>item.id===(nome==='janelaOuro'?dados.tecnica:dados));
      if(tecnica)this.aviso((nome==='janelaOuro'?'Abertura aproveitada':'Janela de ouro')+' · '+tecnica.nome);
      return;
    }
    if(nome==='conquista'){if(!this.prova)this.global('Conquista · '+dados);return;}
    if(nome==='amuleto'){
      const item=AMULETOS.find(amuleto=>amuleto.id===dados);
      if(item&&!this.prova)this.aviso('Amuleto · '+item.nome);
      return;
    }
    if(['descanso','oficina','morte','faseConcluida'].includes(nome)){
      this.quadro(true);
      if(nome==='faseConcluida'&&this.prova){
        this.finalizarProva();this.abrir('resultado-prova');return;
      }
      this.abrir(nome==='faseConcluida'?(this.jogo.fase.id===15?'vitoria':'resultado'):nome);
    }
  }
  aviso(msg){
    const rotulo=this.entrada.toque?'Interagir':this.entrada.rotulo('interagir');
    msg=msg.replace(/\[E\]|\btecla E\b/g,rotulo);
    texto(this.hud.avisoCampo,msg);this.hud.avisoCampo.hidden=false;this.ateAviso=this.jogo.tempo+3.5;
  }
  mostrarObjetivos(jogo){
    const lista=this.hud.objetivos, fase=jogo.fase;
    ocultar(lista,Boolean(this.prova||jogo.emTreino||!fase.objetivos?.length));
    if(lista.hidden)return;
    if(this.faseDosObjetivos!==fase){
      this.faseDosObjetivos=fase;
      this.itensDosObjetivos=fase.objetivos.map(meta=>{
        const item=document.createElement('li');
        const marca=document.createElement('span');
        marca.className='marca-objetivo';
        marca.setAttribute('aria-hidden','true');
        item.append(marca,document.createTextNode(meta.texto));
        return {meta,item,marca};
      });
      lista.replaceChildren(...this.itensDosObjetivos.map(({item})=>item));
    }
    for(const {meta,item,marca} of this.itensDosObjetivos){
      const feito=jogo.perfil.coletas[fase.id].includes(meta.id);
      const perdeuJanela=meta.tipo==='duelo'&&jogo.venceuEncontro(meta.alvo);
      const estado=feito?'feito':perdeuJanela?'proximo-ciclo':'pendente';
      if(item.dataset.estado===estado)continue;
      item.dataset.estado=estado;
      marca.textContent=feito?'✓':perdeuJanela?'↻':'◇';
      item.setAttribute('aria-label',meta.texto+(feito?' · Concluído':perdeuJanela?' · Disponível no próximo ciclo':' · Pendente'));
      item.title=perdeuJanela?'Disponível no próximo ciclo':'';
    }
  }
  mostrarClasse(jogo){
    const {heroi}=jogo,classe=heroi.classe??classeDoPerfil(jogo.perfil);
    const talento=classe.talento;
    const recurso=classe.recurso;
    const mostrar=!this.prova&&!jogo.emTreino;
    ocultar(this.hud.classeEstado,!mostrar);
    if(mostrar){
      const valor=Math.floor(heroi.recursoClasse??recurso?.inicial??0);
      texto(this.hud.classeEstado,classe.nome+' · Nv. '+heroi.nivel+(recurso?' · '+recurso.nome+' '+valor+'/'+heroi.recursoMax:''));
    }
    const botao=this.botaoTalento;
    if(!botao)return;
    ocultar(botao,!talento);
    const temTalento=talento?'sim':'nao';
    if(this.palco.dataset.talento!==temTalento)this.palco.dataset.talento=temTalento;
    if(talento&&botao.dataset.talento!==talento.nome){
      botao.dataset.talento=talento.nome;
      botao.setAttribute('aria-label',talento.nome);
    }
  }
  mostrarOponente(jogo,chefe){
    const u=this.hud,h=jogo.heroi;
    let alvo=chefe,distancia=96;
    if(!alvo&&!jogo.emTreino){
      for(const inimigo of jogo.inimigos){
        if(inimigo.estado==='morto'||Math.abs(inimigo.y+inimigo.h-h.y-h.h)>58)continue;
        const dx=Math.abs(inimigo.x+inimigo.w/2-h.x-h.w/2);
        if(dx<distancia){alvo=inimigo;distancia=dx;}
      }
    }
    ocultar(u.alvoEstado,!Number.isFinite(alvo?.nivel)||jogo.emTreino);
    if(u.alvoEstado.hidden||this.oponenteMostrado===alvo&&this.nivelComparado===jogo.perfil.nivel)return;
    this.oponenteMostrado=alvo;
    this.nivelComparado=jogo.perfil.nivel;
    const diferenca=alvo.nivel-jogo.perfil.nivel;
    const estado=diferenca>=5?'alto':diferenca<=-3?'baixo':'proximo';
    u.alvoEstado.dataset.nivel=estado;
    texto(u.alvoNome,(estado==='alto'?'↑ ':estado==='baixo'?'↓ ':'● ')+alvo.nome+' · Nv. '+alvo.nivel);
    const marcas=[],descricoes=[];
    for(const [id,tipo] of Object.entries(TIPOS_DANO)){
      const fator=multiplicadorResistencia(alvo.resistencias,id);
      if(fator===1)continue;
      marcas.push(iconesDano[id]+' '+tipo.nome+(fator>1?' ↑':' ↓'));
      descricoes.push((fator>1?'Fraqueza a ':'Resistência a ')+tipo.nome.toLowerCase());
    }
    texto(u.alvoResistencias,marcas.join(' · '));
    u.alvoResistencias.setAttribute('aria-label',descricoes.join('. '));
    u.alvoResistencias.title=descricoes.join('. ');
  }
  quadro(forcar=false){
    const j=this.jogo;if(!j.fase||(!forcar&&this.tela!=='jogando'))return;
    const h=j.heroi,p=j.perfil,u=this.hud;
    const agora=performance.now(),delta=this.ultimoDesenho===undefined?1/60:(agora-this.ultimoDesenho)/1000;
    this.ultimoDesenho=agora;
    const opcoes=this.perfil.opcoes, desenho=this.opcoesDesenho;
    desenho.movimento=opcoes.movimento&&!this.movimento.matches;
    desenho.oficina=this.tela==='oficina';
    desenho.tremor=opcoes.tremor;desenho.flash=opcoes.flash;desenho.altoContraste=opcoes.altoContraste;
    desenho.fantasma=this.prova?.tipo==='crono'?this.prova.fantasma:null;
    this.desenho.exibir(j,delta,desenho);
    barra(u.vida,h.vida,h.vidaMax);barra(u.vigor,h.vigor,h.vigorMax);
    texto(u.vidaTexto,Math.ceil(h.vida));texto(u.vigorTexto,Math.floor(h.vigor));texto(u.frascos,h.frascos);texto(u.ecos,p.ecos);
    const local=this.prova?'F'+dois(j.fase.id)+' · '+tempoProva(Math.round(j.tempo*1000)):
      'F'+dois(j.fase.id)+' · '+j.fase.nome+' · '+p.estrelas[j.fase.id].length+'/3 ★';
    texto(u.local,j.emTreino?'Oficina · Campo de treino':local);
    this.mostrarObjetivos(j);
    this.mostrarClasse(j);
    const chefe=j.inimigos.find(i=>tiposBarra.has(i.tipo)&&i.estado!=='morto'&&Math.abs(i.x-h.x)<Math.min(175,this.canvas.width*.44));
    this.mostrarOponente(j,chefe);
    ocultar(u.faixaChefe,!chefe);
    if(chefe){
      texto(u.nomeChefe,chefe.nome);
      const guardaAberta=chefe.estado==='aberto';
      texto(u.faseChefe,guardaAberta?'Guarda aberta':chefe.guardiao?.etapas?.[chefe.faseChefe-1]?.nome||'');
      barra(u.vidaChefe,chefe.vida,chefe.vidaMax);
      const limite=chefe.posturaMax??chefe.guardiao?.postura;
      ocultar(u.posturaChefe,!limite);
      if(limite)barra(u.posturaChefe,guardaAberta?limite:chefe.postura,limite);
    }
    if(this.ateAviso!==undefined&&j.tempo>this.ateAviso)ocultar(u.avisoCampo,true);
    const alvo=j.alvoInteracao();
    ocultar(u.interacao,!alvo||j.emTreino);
    if(alvo&&!j.emTreino){
      texto(u.interacao.lastElementChild,alvo.texto);
      texto(u.interacao.firstElementChild,this.entrada.rotulo('interagir'));
    }
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
    if(acao==='nivelMenu'&&this.tela==='descanso'&&!this.prova){
      this.atributoSelecionado='vitalidade';this.abrir('nivel');return;
    }
    if(acao==='verAtributo'&&this.tela==='nivel'&&Object.hasOwn(ATRIBUTOS,id)){
      this.atributoSelecionado=id;this.abrir('nivel',true);return;
    }
    if(acao==='elevarAtributo'&&this.tela==='nivel'&&!this.prova){
      const elevou=j.elevarAtributo(id);
      this.abrir('nivel',true);
      texto($('feedbackNivel'),elevou?'Atributo elevado · Nível '+j.perfil.nivel:'Confira o custo e a segurança do santuário.');
      return;
    }
    if(acao==='refazerMenu'&&this.tela==='nivel'&&j.podeMelhorarAtributos()&&(p.refazerGratuito||p.cinzasRefazer>0)){
      this.rascunhoAtributos={...dadosHeroi(p).atributos};this.abrir('refazer');return;
    }
    if(acao==='mudarPonto'&&this.tela==='refazer'&&Object.hasOwn(ATRIBUTOS,id)){
      const delta=Number(d.delta),proposta=this.rascunhoAtributos;
      const valor=proposta[id]+delta;
      if(![-1,1].includes(delta)||valor<MINIMO_ATRIBUTO||valor>MAXIMO_ATRIBUTO||nivelDosAtributos(proposta)+delta>p.nivel)return;
      proposta[id]=valor;this.abrir('refazer',true);return;
    }
    if(acao==='confirmarRefazer'&&this.tela==='refazer'&&!this.prova){
      if(!j.refazerAtributos(this.rascunhoAtributos))return;
      this.rascunhoAtributos=null;this.abrir('nivel');
      texto($('feedbackNivel'),'Distribuição gravada.');return;
    }
    if(acao==='comprarCinza'&&this.tela==='oficina'&&!this.prova){
      const comprou=j.comprarCinza();
      this.abrir('oficina',true);texto($('feedbackOficina'),comprou?'Cinza de Refazer guardada.':'Confira o saldo e o estoque de Bento.');return;
    }
    if(acao==='interagir'){if(this.tela==='jogando')j.interagir();return;}
    if(acao==='sairTreino'){if(j.emTreino)j.treinar();return;}
    if(acao==='novoJogo' && this.tela==='menu'){
      this.selecaoClasse={id:'cavaleiro',fase:1,origem:'menu',novaJornada:true,substitui:p.iniciada};
      this.abrir('classes');
      return;
    }
    if(acao==='partir'){
      if(!p.iniciada)return;
      if(p.concluidas.length===15&&!cicloEmAndamento(p)){this.regiao=4;this.abrir('atlas');}
      else this.carregar(p.fase,p.iniciada);
      return;
    }
    if(acao==='visitar'){const n=Number(id);this.carregar(n,n===p.fase&&p.iniciada);return;}
    if(acao==='renascer'){
      if(this.prova)this.iniciarProva(this.prova);
      else if(j.renascer()){this.desenho.centrar?.(j);this.retomar();this.aviso('A chama voltou a arder.');}
      return;
    }
    if(acao==='avancar'){this.carregar(Math.min(15,j.fase.id+1));return;}
    if(acao==='inicio'||acao==='menu'){this.titulo();return;}
    if(acao==='voltar'){this.voltar();return;}
    if(acao==='regiao'){this.regiao=Number(id);this.abrir('atlas',this.tela==='atlas');return;}
    if(acao==='exportar'){this.exportar();return;}
    if(acao==='importar'){$('arquivoSave').click();return;}
    if(acao==='provas'){
      if(this.prova)this.titulo(false);
      this.abrir('provas');return;
    }
    if(acao==='amuletoMenu'){this.abrir('amuletos');return;}
    if(acao==='jogarDiario'){this.iniciarProva(this.diarioPainel||desafioDoDia());return;}
    if(acao==='jogarCrono'){
      const fase=Number($('faseProva')?.value);
      if(fase<=p.liberada)this.iniciarProva({tipo:'crono',fase});
      return;
    }
    if(acao==='repetirProva'){if(this.prova)this.iniciarProva(this.prova);return;}
    if(acao==='novoCiclo'){
      const modificadores=[...this.painel.querySelectorAll('[data-ciclo]:checked')].map(el=>el.dataset.ciclo);
      if(p.concluidas.length!==15||cicloEmAndamento(p)||p.ciclo>=999)return;
      this.selecaoClasse={id:classeDoPerfil(p).id,fase:1,novoCiclo:true,modificadores};
      this.abrir('classes');
      return;
    }
    if(acao==='verClasse'&&this.tela==='classes'){
      if(!Object.hasOwn(CLASSES,id)||id==='herdeiro'&&!this.selecaoClasse.novoCiclo)return;
      this.selecaoClasse.id=id;
      this.abrir('classes',true);
      return;
    }
    if(acao==='confirmarClasse'&&this.tela==='classes'){
      const selecao=this.selecaoClasse;
      if(selecao.novoCiclo&&!iniciarCiclo(p,selecao.modificadores))return;
      const perfil = selecao.novaJornada ? novoPerfil() : p;
      if(!escolherClasse(perfil,selecao.id,selecao.novoCiclo))return;
      if(selecao.novaJornada){
        perfil.opcoes=p.opcoes;
        perfil.revisao=p.revisao;
        this.perfil=perfil;
        this.jogo=this.criarJogo(perfil);
        this.prova=null;
        this.fala=0;
      }
      this.selecaoClasse=null;
      this.carregar(selecao.fase);
      if(selecao.novoCiclo)this.aviso('Novo ciclo · os guardiões despertaram.');
      return;
    }
    if(acao==='remapear'){
      texto($('estadoControles'),'Pressione a nova tecla. Esc cancela e Delete remove o atalho.');
      this.entrada.capturarTecla(id,Number(d.slot),({teclas,mensagem})=>{
        if(teclas){
          p.opcoes.teclas=teclas;
          this.entrada.atualizarOpcoes();this.gravar();this.abrir('opcoes',true);
        }
        const estado=$('estadoControles');
        if(estado)texto(estado,mensagem);
      });
      return;
    }
    if(acao==='restaurarTeclas'){
      p.opcoes.teclas=teclasPadrao();
      this.entrada.atualizarOpcoes();this.gravar();this.abrir('opcoes',true);
      texto($('estadoControles'),'Atalhos originais restaurados.');
      return;
    }
    if(['comprarAmuleto','equiparAmuleto','melhorarFrasco','melhorarGravura'].includes(acao)){
      const ok=j.investir(acao,id,Number(d.slot));
      this.abrir(this.tela,true);
      texto($('feedbackOficina'),ok?'Alteração gravada.':'Confira o custo e as condições na oficina.');
      return;
    }
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
      this.loop.parar();this.perfil=p;this.jogo=this.criarJogo(p);this.prova=null;this.gravar();
      this.entrada.atualizarOpcoes();this.configurarSom();this.titulo(false);
      this.global('Jornada importada. Fase '+p.fase+' disponível.');
    }catch(e){this.global('Falha ao importar. '+(e instanceof SyntaxError?'O arquivo precisa conter JSON válido.':e.message));}
  }
}
export { Aplicacao };
