// Gerado a partir de src/core/engine.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/engine.js", function (exports, usar) {
"use strict";
const { CONFIG: C, CAMPANHA: B, ESTADOS: E, ACOES: A } = usar("src/core/configuracoes.js");
const { sessao, reiniciarSessao, pontuar } = usar("src/core/estado.js");
const { BarramentoEventos } = usar("src/core/barramentoEventos.js");
const { MaquinaEstados } = usar("src/core/maquinaEstados.js");
const { Camera } = usar("src/core/camera.js");
const { LoopPrincipal } = usar("src/core/loopPrincipal.js");
const { Pool } = usar("src/core/pool.js");
const { Aleatorio } = usar("src/core/aleatorio.js");
const { carregarPerfil, salvarPerfil } = usar("src/core/save.js");
const { criarMundo } = usar("src/ecs/mundo.js");
const { SpatialHash } = usar("src/ecs/spatialHash.js");
const { posicionarJogador } = usar("src/entidades/jogador.js");
const { atualizarMovimento } = usar("src/ecs/sistemas/movimento.js");
const { atualizarFisica } = usar("src/ecs/sistemas/fisica.js");
const { atualizarAnimacao } = usar("src/ecs/sistemas/animacao.js");
const { atualizarDano, aplicarDano } = usar("src/ecs/sistemas/dano.js");
const { SistemaParticulas } = usar("src/ecs/sistemas/particulas.js");
const { atualizarPlataformas } = usar("src/ecs/sistemas/plataformas.js");
const { SistemaCombate } = usar("src/ecs/sistemas/combate.js");
const { SistemaProjeteis } = usar("src/ecs/sistemas/projeteis.js");
const { atualizarIA } = usar("src/ecs/sistemas/ia.js");
const { sobrepoe } = usar("src/ecs/sistemas/colisao.js");
const { GerenciadorInimigos } = usar("src/entidades/inimigos/gerenciador.js");
const { criarChefe, atualizarChefe } = usar("src/entidades/chefes/grandeGuardiao.js");
const { estatisticas, ganharXP, sortearPoderes, escolherPoder, novaExpedicao } = usar("src/meta/progressao.js");
const { avaliarDesafios, notaDaFase } = usar("src/meta/desafios.js");
const { PODER_POR_ID } = usar("src/dados/poderes.js");
const { FASES } = usar("src/fases/campanha.js");
const { criarFaseDescanso } = usar("src/fases/descanso.js");
const { MERCADOR, comprarProduto, podeTreinar } = usar("src/meta/mercador.js");
const { Puzzle, PROVAS } = usar("src/meta/puzzles.js");
/** Coordena sistemas. O perfil permanente é separado da corrida e das entidades temporárias. */
class Engine {
  constructor(entrada, interfaceUsuario, renderizador, armazenamento, reduzirMovimento = false, audio = null) {
    this.entrada = entrada; this.interface = interfaceUsuario; this.renderizador = renderizador;
    this.armazenamento = armazenamento; this.audio = audio; this.reduzirMovimento = reduzirMovimento;
    this.perfil = carregarPerfil(armazenamento); this.eventos = new BarramentoEventos();
    this.estados = new MaquinaEstados(this.eventos); this.rng = new Aleatorio(this.perfil.seed);
    this.particulas = new SistemaParticulas(); this.combate = new SistemaCombate();
    this.inimigos = new GerenciadorInimigos(); this.projeteis = new SistemaProjeteis();
    this.textos = new Pool(B.textosMaximos, () => ({ ativo: false, x: 0, y: 0, tempo: 0, texto: '', cor: '#fff4c4' }));
    this.aviso = { texto: '', cor: '#ffe0a0', tempo: 0 }; this.hitstop = 0; this.cameraLenta = 0;
    this.combo = 1; this.comboContagem = 0; this.comboTempo = 0; this.sujo = false; this.esperaSave = 0;
    this.saveDisponivel = true; this.resultado = null;
    this.descanso=null; this.puzzle=null; this.mercadorPerto=false; this.tempoTitulo=0; this.suspenso=false;
    this.lojaFeedback='Bem-vindo! Dê uma olhada. As provas de habilidade são gratuitas.'; this.telaCheia=null; this.origemOpcoes=E.MENU;
    this.loop = new LoopPrincipal(this.atualizar.bind(this), this.desenhar.bind(this));
    this.eventos.ao('pulou', j => { if (j.tipo === 'jogador') { this.particulas.emitir(j, C.poeiraPulo); this.som('pulo'); } });
    this.eventos.ao('pousou', j => { if (j.tipo === 'jogador') this.particulas.emitir(j, C.poeiraPouso); });
    this.eventos.ao('dano', () => { this.camera.abalar(); this.hitstop = this.semMovimento() ? 0 : C.hitstop; this.som('dano'); });
    this.eventos.ao('inimigoDerrotado', e => this.recompensarInimigo(e));
    this.eventos.ao('itemColetado', item => this.recompensarItem(item));
    this.eventos.ao('estadoAlterado', estado => {
      this.entrada.limpar(); this.interface.trocarTela(estado, sessao, this.mundo, this);
      this.salvar(); this.audio?.definirTema(this.temaAudio(estado)); this.audio?.pausar(estado===E.PAUSADO || estado===E.SAIU);
    });
    reiniciarSessao(sessao); sessao.recorde = this.perfil.recorde;
    this.carregarFase(this.perfil.fase, false);
    this.interface.trocarTela(E.MENU, sessao, this.mundo, this);
  }
  vidasAtuais(){return sessao.vidas;}
  semMovimento() { return this.reduzirMovimento || !this.perfil.opcoes.movimento; }
  som(tipo) { this.audio?.tocar(tipo); }
  salvar() {
    this.perfil.recorde = Math.max(this.perfil.recorde, sessao.recorde);
    if(this.descanso && this.perfil.descanso)this.perfil.descanso.vidas=sessao.vidas;
    this.saveDisponivel = salvarPerfil(this.armazenamento, this.perfil); this.sujo = false; this.esperaSave = B.intervaloAutosave;
    return this.saveDisponivel;
  }
  mostrar(estado) {
    if (this.estados.atual === estado) { this.audio?.definirTema(this.temaAudio(estado));this.audio?.pausar(estado===E.PAUSADO||estado===E.SAIU);this.entrada.limpar(); this.interface.trocarTela(estado, sessao, this.mundo, this); return true; }
    return this.estados.mudar(estado);
  }
  faseDesbloqueada() {
    let numero = 1; while (numero < FASES.length && this.perfil.concluidas[numero - 1]) numero++;
    return numero;
  }
  carregarFase(numero, iniciar = true, vidasDeEntrada = null) {
    if (!Number.isInteger(numero) || numero < 1 || numero > FASES.length) return false;
    const fase = FASES[numero - 1];
    this.descanso=null; this.puzzle=null; this.mercadorPerto=false;
    if(iniciar){this.perfil.descanso=null;this.perfil.iniciada=true;}
    this.mundo = criarMundo(fase);
    this.atributos = estatisticas(this.perfil); this.mundo.jogador.estatisticas = this.atributos;
    this.camera = new Camera(this.mundo.largura, this.semMovimento()); this.camera.focar(this.mundo.jogador);
    this.hash = new SpatialHash(this.mundo.largura, this.mundo.altura);
    this.inimigos.preparar(fase, this.perfil); this.hash.reconstruir(this.inimigos.pool.itens);
    this.chefe = criarChefe(this.mundo, this.perfil); this.projeteis.pool.limpar(); this.particulas.limpar(); this.textos.limpar();
    this.rng.reiniciar(fase.seed ^ this.perfil.ciclo); this.hitstop = 0; this.cameraLenta = 0;
    this.combo = 1; this.comboContagem = 0; this.comboTempo = 0;
    this.corrida = { danos: 0, quedas: 0, eliminados: 0, moedas: 0, estrelas: 0, tempo: 0, esquivas: 0,
      chefeVencido: !fase.chefe, completa: false };
    const combate = this.mundo.jogador.combate;
    combate.escudo = this.atributos.recargaEscudo > 0 || this.perfil.consumiveis.escudo; combate.fenix = this.atributos.fenix;
    combate.esperaEscudo = this.atributos.recargaEscudo;
    sessao.vidas = vidasDeEntrada===null?this.atributos.coracoes:Math.max(1,Math.min(this.atributos.coracoes,vidasDeEntrada)); sessao.pontos = 0; sessao.faseAtual = numero;
    if (iniciar) {
      this.perfil.fase = numero; this.interface.ocultarTestes(); this.mostrar(E.JOGANDO);
      this.notificar('FASE ' + numero + ' · ' + fase.nome, '#e6f4b7'); this.salvar();
    }
    this.renderizador.preparar(this.mundo);
    return true;
  }
  iniciarPartida() {
    if(this.perfil.descanso)return this.entrarDescanso(this.perfil.descanso.fase,this.perfil.descanso.vidas);
    return this.carregarFase(this.perfil.fase);
  }
  agir(acao, valor) {
    this.suspenso=false; this.audio?.iniciar();
    if(acao==='navegar'){this.som('menu');return;}
    if(acao==='telaCheia'){this.telaCheia?.alternar();return;}
    if(acao==='volume'){
      const n=Number(valor);if(Number.isFinite(n)){this.perfil.opcoes.volume=Math.max(0,Math.min(1,n));this.audio?.configurar(this.perfil.opcoes.som,this.perfil.opcoes.volume);this.salvar();}return;
    }
    if(acao==='jogar')this.carregarFase(1);
    else if(acao==='retomar')this.iniciarPartida();
    else if(acao==='reiniciar')this.descanso?this.entrarDescanso(this.descanso.fase):this.carregarFase(this.mundo.fase.numero);
    else if(acao==='pausa'&&this.estados.atual===E.JOGANDO)this.mostrar(E.PAUSADO);
    else if(acao==='continuar'&&this.estados.atual===E.PAUSADO)this.mostrar(E.JOGANDO);
    else if(acao==='menu'){this.mostrar(E.MENU);this.loop.iniciar();}
    else if(acao==='mapa')this.mostrar(E.MAPA);
    else if(acao==='personagem')this.mostrar(E.PERSONAGEM);
    else if(acao==='desafios')this.mostrar(E.DESAFIOS);
    else if(acao==='opcoes'){this.origemOpcoes=this.estados.atual;this.mostrar(E.OPCOES);}
    else if(acao==='voltarOpcoes')this.mostrar(this.origemOpcoes);
    else if(acao==='ajuda')this.mostrar(E.AJUDA);
    else if(acao==='sair'){this.salvar();this.mostrar(E.SAIU);this.loop.parar();this.desenhar(1);if(this.telaCheia?.estaAtiva())this.telaCheia.alternar();}
    else if(acao==='fase'){const n=Number(valor);if(n>=1&&n<=this.faseDesbloqueada())this.carregarFase(n);}
    else if(acao==='avancar'&&this.estados.atual===E.FASE_CONCLUIDA)this.entrarDescanso(this.mundo.fase.numero,sessao.vidas);
    else if(acao==='seguir'&&this.descanso)this.sairDescanso();
    else if(acao==='interagir')this.abrirLoja();
    else if(acao==='fecharLoja'&&this.estados.atual===E.LOJA)this.mostrar(E.JOGANDO);
    else if(acao==='comprar'&&this.estados.atual===E.LOJA){
      const antes=this.atributos.coracoes, r=comprarProduto(this.perfil,valor,sessao.vidas,this.mundo.jogador.combate.escudo);
      this.lojaFeedback=r.mensagem;
      if(r.ok){this.recalcularAtributos();sessao.vidas=Math.min(this.atributos.coracoes,sessao.vidas+(r.curar||0));if(valor==='escudo')this.mundo.jogador.combate.escudo=true;this.som('compra');this.salvar();}
      else this.som('erro');
      this.mostrar(E.LOJA);
    }else if(acao==='poder')this.escolherRecompensa(valor);
    else if(acao==='treinar'&&this.estados.atual===E.LOJA&&podeTreinar(this.perfil,valor)){
      this.puzzle=new Puzzle(valor,this.perfil.seed+this.perfil.ciclo*311);this.mostrar(E.PUZZLE);
    }else if(acao==='repetirPuzzle'&&this.estados.atual===E.PUZZLE&&this.puzzle){
      this.puzzle=new Puzzle(this.puzzle.id,this.perfil.seed+this.perfil.ciclo*311,this.puzzle.tentativa+1);
    }else if(acao==='voltarLoja'&&this.estados.atual===E.PUZZLE){this.puzzle=null;this.mostrar(E.LOJA);}
    else if(acao==='simbolo'&&this.estados.atual===E.PUZZLE){const certo=this.puzzle.simbolo(Number(valor));this.som(certo?'moeda':'erro');}
    else if(acao==='carta'&&this.estados.atual===E.PUZZLE){if(this.puzzle.carta(Number(valor)))this.som('menu');}
    else if(acao==='selecionarPeca'&&this.estados.atual===E.PUZZLE)this.puzzle.selecionar(Number(valor));
    else if(acao==='destino'&&this.estados.atual===E.PUZZLE){this.som(this.puzzle.encaixar(this.puzzle.selecionada,Number(valor))?'moeda':'erro');}
    else if(acao==='encaixar'&&this.estados.atual===E.PUZZLE){const p=Number(valor.peca),d=Number(valor.destino);this.som(this.puzzle.encaixar(p,d)?'moeda':'erro');}
    else if(acao==='novoCiclo'&&this.perfil.concluidas.every(Boolean)){novaExpedicao(this.perfil);this.carregarFase(1);}
    else if(acao==='som'){
      this.perfil.opcoes.som=!this.perfil.opcoes.som;this.audio?.configurar(this.perfil.opcoes.som,this.perfil.opcoes.volume);this.salvar();
      if(this.estados.atual===E.OPCOES)this.mostrar(E.OPCOES);
    }else if(acao==='movimento'){
      this.perfil.opcoes.movimento=!this.perfil.opcoes.movimento;this.camera.reduzirMovimento=this.semMovimento();this.salvar();this.mostrar(E.OPCOES);
    }else if(acao==='modo'&&['normal','relaxado','desafio'].includes(valor)){this.perfil.opcoes.modo=valor;this.salvar();this.mostrar(E.OPCOES);}
  }
  escolherRecompensa(id) {
    if(this.estados.atual!==E.LOJA||!this.perfil.pendente)return false;
    if(!escolherPoder(this.perfil,id))return false;
    this.perfil.pendente=this.perfil.presentes.shift()||null;
    if(id==='duplo'&&this.perfil.legado)this.perfil.aprendidas.duplo=true;
    this.recalcularAtributos();this.som('poder');this.salvar();
    this.lojaFeedback=PODER_POR_ID[id].nome+' agora está no nível '+this.perfil.poderes[id]+'. Leve esse presente dos caminhos!';
    this.mostrar(E.LOJA);return true;
  }
  recalcularAtributos(){
    const antes=this.atributos.coracoes;this.atributos=estatisticas(this.perfil);this.mundo.jogador.estatisticas=this.atributos;
    sessao.vidas=Math.min(this.atributos.coracoes,sessao.vidas+Math.max(0,this.atributos.coracoes-antes));
    if(this.atributos.recargaEscudo&&this.mundo.jogador.combate.esperaEscudo===0)this.mundo.jogador.combate.escudo=true;
  }
  temaAudio(estado){
    if(estado===E.OPCOES&&this.origemOpcoes===E.MENU)return 'menu';
    if(estado===E.MENU||estado===E.MAPA||estado===E.PERSONAGEM||estado===E.AJUDA||estado===E.DESAFIOS||estado===E.SAIU)return 'menu';
    if(estado===E.LOJA||estado===E.PUZZLE||this.descanso)return 'loja';
    return this.mundo?.fase.temaMusica||'menu';
  }
  entrarDescanso(fase,vidas=sessao.vidas){
    const origem=FASES[fase-1];if(!origem)return false;
    this.descanso={fase,proxima:fase+1};this.perfil.descanso={fase,proxima:fase+1,vidas:Math.max(1,vidas)};
    this.perfil.fase=Math.min(15,fase+1);this.perfil.iniciada=true;
    this.mundo=criarMundo(criarFaseDescanso(fase,origem.mundo));
    this.atributos=estatisticas(this.perfil);this.mundo.jogador.estatisticas=this.atributos;
    this.mercador={x:520,y:448,nome:MERCADOR.nome};this.mercadorPerto=false;this.puzzle=null;
    this.camera=new Camera(this.mundo.largura,this.semMovimento());this.camera.focar(this.mundo.jogador);
    this.hash=new SpatialHash(this.mundo.largura,this.mundo.altura);this.inimigos.pool.limpar();this.hash.reconstruir(this.inimigos.pool.itens);
    this.chefe=null;this.projeteis.pool.limpar();this.particulas.limpar();this.textos.limpar();this.hitstop=0;this.cameraLenta=0;
    this.corrida={danos:0,quedas:0,eliminados:0,moedas:0,estrelas:0,tempo:0,esquivas:0,chefeVencido:true,completa:false};
    sessao.vidas=Math.max(1,Math.min(this.atributos.coracoes,vidas));
    this.mundo.jogador.combate.escudo=this.perfil.consumiveis.escudo||this.atributos.recargaEscudo>0;
    this.renderizador.preparar(this.mundo);this.mostrar(E.JOGANDO);this.salvar();
    this.notificar('ÁREA DE DESCANSO · encontre Bento do Cipó e use E','#ffe4b0');return true;
  }
  sairDescanso(){
    if(!this.descanso)return false;
    const n=this.descanso.proxima;this.perfil.descanso=null;this.descanso=null;
    if(n>15){this.mostrar(E.VITORIA);this.salvar();return true;}
    return this.carregarFase(n,true,sessao.vidas);
  }
  abrirLoja(){
    const t=this.mundo.jogador.transformacao;
    if(this.estados.atual!==E.JOGANDO||!this.descanso||Math.abs(t.x-this.mercador.x)>110||Math.abs(t.y+t.altura-448)>60)return false;
    this.mercadorPerto=true;this.mostrar(E.LOJA);return true;
  }
  atualizarDescanso(dt){
    const m=this.mundo,j=m.jogador,t=j.transformacao;
    m.tempo+=dt;this.aviso.tempo=Math.max(0,this.aviso.tempo-dt);
    atualizarDano(j,dt);atualizarMovimento(j,this.entrada,dt,this.eventos);this.combate.atualizarJogador(this,dt);
    j.planando=this.atributos.podePlanar&&j.corpo.vy>0&&(this.entrada.ativa(A.pular)||this.entrada.ativa(A.planar));
    atualizarFisica(j,m,dt,this.eventos);atualizarAnimacao(j,dt);this.particulas.atualizar(j,dt);this.camera.atualizar(j,dt);
    this.mercadorPerto=Math.abs(t.x-this.mercador.x)<110&&Math.abs(t.y+t.altura-448)<60;
    if(this.entrada.consumir(A.interagir))this.abrirLoja();
    if(t.x+t.largura>m.portalX&&t.x<m.portalX+32)this.sairDescanso();
    this.entrada.limparPulsos();
  }
  concluirPuzzle(){
    const p=this.puzzle;if(!p||p.status!=='vitoria'||p.recompensado)return;
    p.recompensado=true;
    if(!this.perfil.aprendidas[p.id]){this.perfil.aprendidas[p.id]=true;this.xp(60*p.dados.dificuldade);}
    this.recalcularAtributos();this.lojaFeedback='Mandou bem! '+p.dados.habilidade+' agora faz parte dos seus movimentos.';
    this.som('puzzle');this.salvar();
  }
  retomarFoco(){this.suspenso=false;this.loop.sincronizar();this.audio?.iniciar();this.audio?.pausar(this.estados.atual===E.PAUSADO||this.estados.atual===E.SAIU);}
  suspender() {
    this.suspenso=true;this.audio?.pausar(true);
    if (this.estados.atual === E.JOGANDO) this.mostrar(E.PAUSADO);
    this.entrada.limpar(); this.loop.sincronizar(); this.salvar();
  }
  notificar(texto, cor = '#ffe0a0') { this.aviso.texto = texto; this.aviso.cor = cor; this.aviso.tempo = 3; }
  flutuar(texto, x, y, cor = '#fff4c4') {
    const p = this.textos.obter(); if (!p) return;
    p.texto = texto; p.x = x; p.y = y; p.tempo = .8; p.cor = cor;
  }
  pontuar(valor) { pontuar(sessao, valor); this.perfil.recorde = sessao.recorde; this.sujo = true; }
  xp(valor) {
    const maximoAntes = this.atributos.coracoes;
    const niveis = ganharXP(this.perfil, valor * this.atributos.bonusXP); this.sujo = true;
    if (niveis) {
      this.atributos = estatisticas(this.perfil); this.mundo.jogador.estatisticas = this.atributos;
      sessao.vidas = Math.min(this.atributos.coracoes, sessao.vidas + Math.max(0, this.atributos.coracoes - maximoAntes));
      this.notificar('NÍVEL ' + this.perfil.nivel + ' · dano permanente aumentado!', '#b8f1a3'); this.som('nivel');
    }
  }
  danoAtual() {
    return this.atributos.dano * (sessao.vidas <= this.atributos.coracoes / 2 ? 1 + this.atributos.furia * .3 : 1);
  }
  ferirJogador(origem, inimigo = null) {
    const j = this.mundo.jogador, c = j.combate;
    if (j.animacao.invulneravel > 0 || c.dash > 0 && origem !== 'queda' || sessao.vidas === 0) return false;
    if (c.escudo && origem !== 'queda') {
      c.escudo = false; this.perfil.consumiveis.escudo=false;this.sujo=true; c.esperaEscudo = this.atributos.recargaEscudo; j.animacao.invulneravel = .4;
      this.flutuar('BLOQUEADO', j.transformacao.x - 20, j.transformacao.y, '#8fd4ff'); return false;
    }
    this.corrida.danos++; this.combo = 1; this.comboContagem = 0; this.comboTempo = 0;
    if (sessao.vidas === 1 && c.fenix > 0) {
      c.fenix--; sessao.vidas = Math.min(this.atributos.coracoes, 2); j.animacao.invulneravel = 2;
      this.notificar('A fênix protegeu você! Cargas: ' + c.fenix, '#ffce70'); this.som('poder'); return true;
    }
    if (!aplicarDano(j, sessao, this.eventos)) return false;
    j.animacao.invulneravel=this.atributos.protecao;
    this.flutuar('−1 ♥', j.transformacao.x, j.transformacao.y - 8, '#ff9f96');
    if (inimigo) { j.corpo.vx = j.transformacao.x < inimigo.transformacao.x ? -180 : 180; j.corpo.vy = -200; }
    if (this.atributos.espinhos) {
      const x = j.transformacao.x;
      for (let i = 0; i < this.inimigos.pool.itens.length; i++) {
        const e = this.inimigos.pool.itens[i];
        if (e.ativo && Math.abs(e.transformacao.x - x) < 115) this.ferirInimigo(e, this.danoAtual() * this.atributos.espinhos * .5, x, false);
      }
      if (this.chefe?.ativo && Math.abs(this.chefe.transformacao.x - x) < 130) this.ferirChefe(this.danoAtual() * this.atributos.espinhos * .5);
    }
    if (sessao.vidas === 0) { this.perfil.totais.mortes++; this.salvar(); this.mostrar(E.FIM_DE_JOGO); }
    else {
      posicionarJogador(j, this.mundo.respawnX, this.mundo.respawnY);
      c.dash = 0; c.ataque = 0; this.camera.focar(j); this.camera.abalar();
    }
    return true;
  }
  ferirInimigo(e, dano, origemX, processar = false) {
    if (!e.ativo || e.invulneravel > 0 || e.estado === 'submerso') return false;
    const critico = this.rng.proximo() < this.atributos.critico;
    if (critico) dano *= 2;
    if (e.tipo === 'tatu' && Math.sign(origemX - e.transformacao.x) === e.controle.direcao && e.estado !== 'atordoado') dano *= .35;
    e.vida -= dano; e.invulneravel = .08; e.estado = 'atordoado'; e.espera = B.atordoamento;
    e.corpo.vx = origemX < e.transformacao.x ? 140 : -140;
    this.flutuar(String(Math.ceil(dano)) + (critico ? '!' : ''), e.transformacao.x, e.transformacao.y - 10, critico ? '#ffde70' : '#fff5d4');
    this.hitstop = this.semMovimento() ? 0 : 2 / 60;
    if (e.vida <= 0) this.eliminar(e);
    if (processar) this.processarAcerto();
    return true;
  }
  eliminar(e) {
    if (!e.ativo) return;
    e.ativo = false; this.particulas.emitir(e, 10); this.eventos.emitir('inimigoDerrotado', e);
  }
  recompensarInimigo(e) {
    if (e.origem) this.corrida.eliminados++;
    this.perfil.totais.inimigos++; this.pontuar(C.inimigo * this.combo);
    this.xp(e.origem ? e.dados.xp : 5);
    const c = this.mundo.jogador.combate;
    if (this.atributos.seiva && ++c.seiva >= this.atributos.seiva) {
      c.seiva = 0; sessao.vidas = Math.min(this.atributos.coracoes, sessao.vidas + 1);
      this.flutuar('+1 ♥', this.mundo.jogador.transformacao.x, this.mundo.jogador.transformacao.y - 15, '#a6f09a');
    }
  }
  processarAcerto() {
    const j = this.mundo.jogador, nivel = this.atributos.tempestade;
    j.combate.acertos++;
    if (!nivel || j.combate.acertos % Math.max(2, 5 - nivel) !== 0) return;
    let restantes = 1 + Math.floor(nivel / 2);
    for (let i = 0; i < this.inimigos.pool.itens.length && restantes > 0; i++) {
      const e = this.inimigos.pool.itens[i];
      if (e.ativo && Math.abs(e.transformacao.x - j.transformacao.x) < 340) {
        e.invulneravel = 0; this.ferirInimigo(e, this.danoAtual() * (1 + nivel * .2), j.transformacao.x, false);
        this.flutuar('ϟ', e.transformacao.x, e.transformacao.y - 50, '#a4e8ff'); restantes--;
      }
    }
    if (restantes && this.chefe?.ativo && Math.abs(this.chefe.transformacao.x - j.transformacao.x) < 340) {
      this.chefe.invulneravel = 0; this.ferirChefe(this.danoAtual() * (1 + nivel * .2));
    }
  }
  ferirChefe(dano) {
    const b = this.chefe; if (!b?.ativo || b.invulneravel > 0 || b.estado === 'dormindo') return false;
    dano *= b.estado === 'recuperando' ? 1.3 : 1;
    b.vida = Math.max(0, b.vida - dano); b.invulneravel = .09;
    this.flutuar(String(Math.ceil(dano)), b.transformacao.x + 30, b.transformacao.y - 10, '#ffe1a0');
    this.hitstop = this.semMovimento() ? 0 : 2 / 60;
    if (b.vida === 0) {
      b.ativo = false; this.corrida.chefeVencido = true; this.perfil.totais.chefes++;
      this.pontuar(1000); this.xp(B.xpChefe + this.mundo.fase.numero * 12); this.particulas.emitir(b, 36);
      this.camera.abalar(); this.cameraLenta = this.semMovimento() ? 0 : 1.2;
      this.notificar('GUARDIÃO DERROTADO · portal aberto!', '#ffdc85'); this.som('vitoria');
    }
    return true;
  }
  tiroMirado(x, y, tipo = 'coco', velocidade = B.velocidadeTiro, anguloExtra = 0) {
    const p = this.mundo.jogador.transformacao;
    const angulo = Math.atan2(p.y + p.altura / 2 - y, p.x + p.largura / 2 - x) + anguloExtra;
    this.projeteis.atirar(x, y, Math.cos(angulo) * velocidade, Math.sin(angulo) * velocidade, tipo, true, 1, tipo === 'coco' ? 100 : 0);
  }
  atualizarItens(dt) {
    const t = this.mundo.jogador.transformacao;
    for (let i = 0; i < this.mundo.itens.length; i++) {
      const item = this.mundo.itens[i]; if (!item.ativo) continue;
      let dx = t.x + t.largura / 2 - item.x, dy = t.y + t.altura / 2 - item.y;
      const distancia = Math.hypot(dx, dy);
      if ((item.tipo === 'moeda' || item.tipo === 'ouro') && distancia < this.atributos.ima+(this.perfil.consumiveis.ima>0?200:0) && distancia > 1) {
        const passo = Math.min(distancia, 330 * dt); item.x += dx / distancia * passo; item.y += dy / distancia * passo;
        dx = t.x + t.largura / 2 - item.x; dy = t.y + t.altura / 2 - item.y;
      }
      // O if desativa antes de emitir: um item nunca pontua duas vezes.
      if (Math.abs(dx) < 24 && Math.abs(dy) < 29) { item.ativo = false; this.eventos.emitir('itemColetado', item); }
    }
  }
  recompensarItem(item) {
    const j = this.mundo.jogador;
    if (item.tipo === 'moeda' || item.tipo === 'ouro') {
      this.comboContagem++; this.combo = Math.min(5, 1 + Math.floor(this.comboContagem / 3)); this.comboTempo = 2;
      this.pontuar((item.tipo === 'ouro' ? C.moedaDourada : C.moeda) * this.combo);
      this.corrida.moedas++; this.perfil.totais.moedas++;this.perfil.moedas+=item.tipo==='ouro'?5:1; this.xp(item.tipo === 'ouro' ? 4 : 1);
    } else if (item.tipo === 'estrela') {
      this.corrida.estrelas++; this.pontuar(150); this.xp(B.xpEstrela);
      this.notificar('Estrela da Selva ' + this.corrida.estrelas + '/3', '#ffe38a');
    } else if (item.tipo === 'coracao') sessao.vidas = Math.min(this.atributos.coracoes, sessao.vidas + 1);
    this.particulas.emitirBrilho(item.x??j.transformacao.x,item.y??j.transformacao.y,8);this.som('moeda');
  }
  atualizarPerigos(dt) {
    const m = this.mundo, t = m.jogador.transformacao;
    for (let i = 0; i < m.perigos.length; i++) {
      const p = m.perigos[i];
      if (p.tipo === 'espinhos') { if (sobrepoe(t, p)) this.ferirJogador('espinhos'); }
      else if (p.tipo === 'pedras') {
        p.espera -= dt;
        if (p.espera <= 0 && Math.abs(t.x - p.x) < 180) {
          this.projeteis.atirar(t.x + 12, -24, 0, 20, 'pedra', true, 1, 900, .9); p.espera = p.recarga;
        }
      }
    }
    for (let i = 0; i < m.checkpoints.length; i++) {
      const p = m.checkpoints[i];
      if (!p.aceso && Math.abs(t.x - p.x) < 32 && Math.abs(t.y + t.altura - p.y) < 60) {
        p.aceso = true; m.respawnX = p.x; m.respawnY = p.y - t.altura;
        sessao.vidas = Math.min(this.atributos.coracoes, sessao.vidas + B.checkpointCura);
        this.notificar('CHECKPOINT · +1 coração', '#b7ee9c'); this.som('poder');
      }
    }
  }
  concluirFase() {
    if (this.corrida.completa || this.estados.atual !== E.JOGANDO || !this.corrida.chefeVencido) return false;
    this.corrida.completa = true;
    const fase = this.mundo.fase, i = fase.numero - 1, primeira = !this.perfil.concluidas[i];
    this.corrida.tempo = this.mundo.tempo;
    const desafios = avaliarDesafios(this.perfil, fase, this.corrida);
    const xp = (primeira ? B.xpFase + fase.numero * B.xpPorFase : 15) + desafios.xp;
    this.xp(xp); this.perfil.concluidas[i] = true;
    this.perfil.estrelas[i] = Math.max(this.perfil.estrelas[i], this.corrida.estrelas);
    if (!this.perfil.tempos[i] || this.mundo.tempo < this.perfil.tempos[i]) this.perfil.tempos[i] = this.mundo.tempo;
    this.perfil.fase = Math.max(this.perfil.fase, Math.min(15, fase.numero + 1)); this.perfil.totais.fases++;
    const nota = notaDaFase(this.corrida, fase);
    this.perfil.ranking.push({ pontos: sessao.pontos, tempo: this.mundo.tempo, fase: fase.numero, nota, ciclo: this.perfil.ciclo });
    this.perfil.ranking.sort((a, b) => b.pontos - a.pontos || a.tempo - b.tempo); this.perfil.ranking.length = Math.min(10, this.perfil.ranking.length);
    if(primeira){
      const presente={fase:fase.numero,ciclo:this.perfil.ciclo,opcoes:sortearPoderes(this.perfil,fase.numero)};
      if(this.perfil.pendente)this.perfil.presentes.push(presente);else this.perfil.pendente=presente;
      this.perfil.moedas+=20+fase.numero*3;
    }
    this.perfil.descanso={fase:fase.numero,proxima:fase.numero+1,vidas:sessao.vidas};
    this.resultado = { nota, xp: Math.floor(xp * this.atributos.bonusXP), primeira, desafios: desafios.resultados, estrelas: this.corrida.estrelas, tempo: this.mundo.tempo, pontos: sessao.pontos };
    this.salvar(); this.som('vitoria'); this.mostrar(E.FASE_CONCLUIDA); return true;
  }
  atualizar(dt) {
    if(this.suspenso)return;
    const estado=this.estados.atual;
    if(estado===E.MENU||estado===E.SAIU)this.tempoTitulo+=dt;
    if(this.entrada.consumir(A.som))this.agir('som');
    if(this.entrada.consumir(A.pausa)){
      if(estado===E.LOJA)this.agir('fecharLoja');
      else if(estado===E.PUZZLE)this.agir('voltarLoja');
      else if(estado===E.OPCOES)this.agir('voltarOpcoes');
      else if(estado===E.JOGANDO||estado===E.PAUSADO)this.agir(estado===E.PAUSADO?'continuar':'pausa');
      else if(estado!==E.MENU)this.agir('menu');
      this.entrada.limparPulsos();return;
    }
    if(this.entrada.consumir(A.confirmar)&&estado!==E.JOGANDO){
      if(estado===E.PAUSADO)this.agir('continuar');
      else if(estado===E.FASE_CONCLUIDA)this.agir('avancar');
      else if(estado===E.FIM_DE_JOGO)this.agir('reiniciar');
      else if(estado===E.MENU)this.agir(this.perfil.iniciada?'retomar':'jogar');
      this.entrada.limparPulsos();return;
    }
    if(estado===E.PUZZLE){this.puzzle?.atualizar(dt);this.concluirPuzzle();this.entrada.limparPulsos();return;}
    if(this.estados.atual!==E.JOGANDO){this.entrada.limparPulsos();return;}
    if(this.descanso){this.atualizarDescanso(dt);return;}
    if (this.hitstop > 0) { this.hitstop = Math.max(0, this.hitstop - dt); return; }
    if (this.cameraLenta > 0) { this.cameraLenta = Math.max(0, this.cameraLenta - dt); dt *= .35; }
    const m = this.mundo, j = m.jogador, t = j.transformacao;
    m.tempo += dt; this.aviso.tempo = Math.max(0, this.aviso.tempo - dt);
    this.comboTempo = Math.max(0, this.comboTempo - dt);
    if (this.comboTempo === 0) { this.combo = 1; this.comboContagem = 0; }
    atualizarDano(j, dt); atualizarPlataformas(m, dt);
    atualizarMovimento(j, this.entrada, dt, this.eventos); this.combate.atualizarJogador(this, dt);
    j.planando=this.atributos.podePlanar&&j.corpo.vy>0&&(this.entrada.ativa(A.pular)||this.entrada.ativa(A.planar));
    if(this.perfil.consumiveis.ima>0){this.perfil.consumiveis.ima=Math.max(0,this.perfil.consumiveis.ima-dt);this.sujo=true;}
    atualizarFisica(j, m, dt, this.eventos);
    if (t.y > m.altura + C.margemQueda) {
      this.corrida.quedas++; this.ferirJogador('queda');
      if (sessao.vidas > 0) {
        posicionarJogador(j, m.respawnX, m.respawnY); j.combate.dash = 0;
        this.camera.focar(j); this.camera.abalar();
      }
    }
    if (this.estados.atual !== E.JOGANDO) { this.entrada.limparPulsos(); return; }
    atualizarIA(this, dt); atualizarChefe(this, dt); this.hash.reconstruir(this.inimigos.pool.itens);
    this.combate.resolverGolpes(this); this.projeteis.atualizar(this, dt); this.atualizarPerigos(dt);
    if (this.estados.atual !== E.JOGANDO) { this.entrada.limparPulsos(); return; }
    this.atualizarItens(dt); atualizarAnimacao(j, dt); this.particulas.atualizar(j, dt);
    for (let i = 0; i < this.textos.itens.length; i++) {
      const p = this.textos.itens[i]; if (!p.ativo) continue;
      p.tempo -= dt; p.y -= 32 * dt; if (p.tempo <= 0) p.ativo = false;
    }
    if (t.x + t.largura > m.portalX && t.x < m.portalX + C.tile && t.y + t.altura > m.portalY - 96 && t.y < m.portalY) {
      if (this.corrida.chefeVencido) this.concluirFase();
      else if (this.aviso.tempo === 0) this.notificar('Derrote o guardião para abrir o portal.', '#ffb796');
    }
    this.camera.atualizar(j, dt); this.esperaSave -= dt;
    if (this.sujo && this.esperaSave <= 0) this.salvar();
    this.entrada.limparPulsos();
  }
  desenhar(alpha) {
    const interpolacao = this.estados.atual === E.JOGANDO && this.hitstop === 0 ? alpha : 1;
    this.renderizador.desenhar(this.mundo, this.camera, this.particulas, interpolacao, this);
    this.interface.atualizar(sessao, this.mundo, this.estados.atual, this);
  }
  destruir() {
    this.salvar(); this.loop.parar(); this.entrada.destruir(); this.interface.destruir();
    this.renderizador.destruir(); this.eventos.limpar(); this.particulas.limpar();
    this.inimigos.pool.limpar(); this.projeteis.pool.limpar(); this.textos.limpar();
  }
}

Object.defineProperty(exports, "Engine", { enumerable: true, get: () => Engine });
});
