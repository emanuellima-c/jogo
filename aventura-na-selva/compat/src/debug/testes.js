// Gerado a partir de src/debug/testes.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/debug/testes.js", function (exports, usar) {
"use strict";
const { CONFIG: C, CAMPANHA: B, ACOES: A, ESTADOS: E } = usar("src/core/configuracoes.js");
const { sessao, criarSessao, pontuar } = usar("src/core/estado.js");
const { BarramentoEventos } = usar("src/core/barramentoEventos.js");
const { MaquinaEstados } = usar("src/core/maquinaEstados.js");
const { Aleatorio } = usar("src/core/aleatorio.js");
const { Pool } = usar("src/core/pool.js");
const { LoopPrincipal } = usar("src/core/loopPrincipal.js");
const { Engine } = usar("src/core/engine.js");
const { carregarPerfil, salvarPerfil, validarPerfil, lerRecorde } = usar("src/core/save.js");
const { criarPerfil, ganharXP, xpNecessario, estatisticas, sortearPoderes, escolherPoder, novaExpedicao } = usar("src/meta/progressao.js");
const { avaliarDesafios } = usar("src/meta/desafios.js");
const { criarMundo } = usar("src/ecs/mundo.js");
const { SpatialHash } = usar("src/ecs/spatialHash.js");
const { atualizarMovimento } = usar("src/ecs/sistemas/movimento.js");
const { atualizarFisica } = usar("src/ecs/sistemas/fisica.js");
const { atualizarPlataformas } = usar("src/ecs/sistemas/plataformas.js");
const { veJogador } = usar("src/ecs/sistemas/ia.js");
const { atualizarChefe } = usar("src/entidades/chefes/grandeGuardiao.js");
const { PODERES } = usar("src/dados/poderes.js");
const { FASES } = usar("src/fases/campanha.js");
const { Puzzle } = usar("src/meta/puzzles.js");
const { comprarProduto, precoProduto, podeTreinar } = usar("src/meta/mercador.js");
const { enquadrar } = usar("src/core/telaCheia.js");
const { criarTrilha, frequencia } = usar("src/audio/trilhas.js");
const { FASE_TESTE } = usar("src/fases/teste.js");
class EntradaTeste {
  constructor() { this.mantidas=0; this.pulsos=0; }
  ativa(acao) { return (this.mantidas & acao)!==0; }
  consumir(acao) { const valor=(this.pulsos & acao)!==0; this.pulsos &= ~acao; return valor; }
  pressionar(acao) { this.pulsos |= acao & ~this.mantidas; this.mantidas |= acao; }
  soltar(acao) { this.mantidas &= ~acao; }
  limparPulsos() { this.pulsos=0; }
  limpar() { this.mantidas=0; this.pulsos=0; }
  destruir() { this.limpar(); }
}
class MemoriaTeste {
  constructor() { this.dados=new Map(); }
  getItem(chave) { return this.dados.get(chave) ?? null; }
  setItem(chave,valor) { this.dados.set(chave,valor); }
}
function engineTeste(memoria=new MemoriaTeste()) {
  return new Engine(new EntradaTeste(), {trocarTela(){},atualizar(){},ocultarTestes(){},destruir(){}},
    {preparar(){},desenhar(){},destruir(){}}, memoria, true);
}
function exigir(c,m='Condição não satisfeita') { if(!c) throw new Error(m); }
function contexto() {
  const mundo=criarMundo(FASE_TESTE), c={mundo,j:mundo.jogador,entrada:new EntradaTeste(),eventos:new BarramentoEventos()};
  passo(c); return c;
}
function passo(c) { atualizarMovimento(c.j,c.entrada,C.passo,c.eventos); atualizarFisica(c.j,c.mundo,C.passo,c.eventos); c.entrada.limparPulsos(); }
function poderes(e, ids) { Object.assign(e.perfil.poderes,ids); e.carregarFase(e.mundo.fase.numero); }
function semInimigos(e) { e.inimigos.pool.limpar(); e.hash.reconstruir(e.inimigos.pool.itens); }

/** Suite sem DOM: roda no navegador com ?test=1 e num ambiente de módulos JavaScript. */
function executarTestes() {
  const linhas=[], original={...sessao};
  function teste(nome,fn) { try { fn(); linhas.push('✓ '+nome); } catch(e) { linhas.push('✗ '+nome+': '+e.message); } }
  try {
    teste('15 fases retangulares com início e portal',()=>{for(const f of FASES){const m=criarMundo(f);exigir(m.portalX>m.inicioX);}});
    teste('Chefes exatamente a cada 3 fases',()=>{exigir(FASES.filter(f=>f.chefe).map(f=>f.numero).join(',')==='3,6,9,12,15');});
    teste('Três estrelas e três desafios em cada fase',()=>{for(const f of FASES)exigir(f.itens.filter(i=>i.tipo==='estrela').length===3&&f.desafios.length===3);});
    teste('Pulo permitido no chão',()=>{const c=contexto();c.entrada.pressionar(A.pular);passo(c);exigir(c.j.corpo.vy<0);});
    teste('Segundo aperto no ar é bloqueado sem habilidade',()=>{const c=contexto();c.entrada.pressionar(A.pular);passo(c);c.entrada.soltar(A.pular);passo(c);c.entrada.pressionar(A.pular);const v=c.j.corpo.vy;passo(c);exigir(c.j.corpo.vy>v);});
    teste('Coyote aceita e expira em 0,1 s',()=>{for(const espera of [3,8]){const c=contexto();c.j.corpo.noChao=false;c.j.controle.coyote=C.coyote;c.j.corpo.vy=0;for(let i=0;i<espera;i++)atualizarMovimento(c.j,c.entrada,C.passo,c.eventos);c.entrada.pressionar(A.pular);atualizarMovimento(c.j,c.entrada,C.passo,c.eventos);exigir(espera===3?c.j.corpo.vy<0:c.j.corpo.vy===0);}});
    teste('Buffer dispara ao pousar',()=>{const c=contexto();c.j.transformacao.y-=2;c.j.corpo.noChao=false;c.j.controle.coyote=0;c.j.corpo.vy=150;c.entrada.pressionar(A.pular);passo(c);exigir(c.j.corpo.noChao);passo(c);exigir(c.j.corpo.vy<0);});
    teste('Buffer expira em queda longa',()=>{const c=contexto();c.j.transformacao.y=100;c.j.corpo.noChao=false;c.j.controle.coyote=0;c.entrada.pressionar(A.pular);for(let i=0;i<80;i++)passo(c);exigir(c.j.corpo.noChao&&c.j.controle.buffer===0);});
    teste('Segurar pulo não repete saltos no pouso',()=>{const c=contexto();let n=0;c.eventos.ao('pulou',()=>n++);c.entrada.pressionar(A.pular);for(let i=0;i<130;i++)passo(c);exigir(n===1);});
    teste('Pulo de altura variável',()=>{const l=contexto(),s=contexto();let yl=Infinity,ys=Infinity;l.entrada.pressionar(A.pular);s.entrada.pressionar(A.pular);for(let i=0;i<80;i++){if(i===3)s.entrada.soltar(A.pular);passo(l);passo(s);yl=Math.min(yl,l.j.transformacao.y);ys=Math.min(ys,s.j.transformacao.y);}exigir(ys-yl>40);});
    teste('Habilidade libera salto extra, consumido uma vez',()=>{const c=contexto();c.j.estatisticas=estatisticas({...criarPerfil(),poderes:{duplo:1},aprendidas:{duplo:true}});passo(c);c.entrada.pressionar(A.pular);passo(c);c.entrada.soltar(A.pular);passo(c);c.entrada.pressionar(A.pular);passo(c);exigir(c.j.corpo.vy<-600&&c.j.controle.saltosRestantes===0);});
    teste('Velocidade máxima e atrito',()=>{const c=contexto();c.entrada.pressionar(A.direita);for(let i=0;i<30;i++)atualizarMovimento(c.j,c.entrada,C.passo,c.eventos);exigir(c.j.corpo.vx===C.velocidade);c.entrada.soltar(A.direita);for(let i=0;i<30;i++)atualizarMovimento(c.j,c.entrada,C.passo,c.eventos);exigir(c.j.corpo.vx===0);});
    teste('AABB separa parede e teto',()=>{const c=contexto();c.j.transformacao.x=39*32-25;c.j.corpo.vx=C.velocidade;atualizarFisica(c.j,c.mundo,C.passo,c.eventos);exigir(c.j.transformacao.x===39*32-24);c.j.transformacao.x=324;c.j.transformacao.y=384;c.j.corpo.vy=-300;c.j.corpo.vx=0;atualizarFisica(c.j,c.mundo,C.passo,c.eventos);exigir(c.j.transformacao.y===384&&c.j.corpo.vy===0);});
    teste('Correção de quina não atravessa bloco',()=>{const c=contexto();c.j.transformacao.x=298;c.j.transformacao.y=384;c.j.corpo.vy=-300;c.j.corpo.noChao=false;atualizarFisica(c.j,c.mundo,C.passo,c.eventos);exigir(c.j.corpo.vy<0&&c.j.transformacao.x+24<=320);});
    teste('Plataforma móvel carrega o jogador',()=>{const e=engineTeste();e.carregarFase(2);const p=e.mundo.plataformas.find(p=>p.tipo==='horizontal'),j=e.mundo.jogador;j.transformacao.x=p.x+15;j.transformacao.y=p.y-j.transformacao.altura;j.corpo.noChao=true;const x=j.transformacao.x;atualizarPlataformas(e.mundo,C.passo);exigir(j.transformacao.x>x);});
    teste('Plataforma de mão única aceita passagem de baixo',()=>{const e=engineTeste();e.carregarFase(1);const p=e.mundo.plataformas[0],j=e.mundo.jogador;j.transformacao.x=p.x+15;j.transformacao.y=p.y+8;j.corpo.vy=-300;atualizarFisica(j,e.mundo,C.passo,e.eventos);exigir(j.corpo.vy<0&&!j.corpo.noChao);});
    teste('Plataforma frágil cai e retorna',()=>{const e=engineTeste();e.carregarFase(5);const p=e.mundo.plataformas.find(p=>p.tipo==='fragil');p.acionada=true;for(let i=0;i<60;i++)atualizarPlataformas(e.mundo,C.passo);exigir(p.y>p.origemY);for(let i=0;i<250;i++)atualizarPlataformas(e.mundo,C.passo);exigir(p.y===p.origemY&&!p.acionada);});
    teste('Dano repetido retira exatamente um coração',()=>{const e=engineTeste();e.carregarFase(1);for(let i=0;i<100;i++)e.ferirJogador('inimigo');exigir(sessao.vidas===2&&e.corrida.danos===1);});
    teste('Esquiva aprendida protege e entra em recarga',()=>{const e=engineTeste();e.perfil.aprendidas.dash=true;e.carregarFase(1);e.entrada.pressionar(A.dash);e.combate.atualizarJogador(e,C.passo);exigir(e.mundo.jogador.combate.dash>0&&!e.ferirJogador('inimigo')&&sessao.vidas===3);});
    teste('Escudo bloqueia um golpe e recarrega',()=>{const e=engineTeste();poderes(e,{escudo:1});e.ferirJogador('inimigo');exigir(sessao.vidas===3&&!e.mundo.jogador.combate.escudo);for(let i=0;i<1200;i++)e.combate.atualizarJogador(e,C.passo);exigir(e.mundo.jogador.combate.escudo);});
    teste('Fênix evita dano fatal com carga limitada',()=>{const e=engineTeste();poderes(e,{fenix:1});sessao.vidas=1;e.ferirJogador('inimigo');exigir(sessao.vidas===2&&e.mundo.jogador.combate.fenix===0&&e.estados.atual===E.JOGANDO);});
    teste('Zero corações abre Fim de Jogo',()=>{const e=engineTeste();e.carregarFase(1);sessao.vidas=1;e.ferirJogador('inimigo');exigir(sessao.vidas===0&&e.estados.atual===E.FIM_DE_JOGO);});
    teste('Checkpoint acende e respawn preserva pontos',()=>{const e=engineTeste();e.carregarFase(1);semInimigos(e);const c=e.mundo.checkpoints[0],j=e.mundo.jogador;j.transformacao.x=c.x;j.transformacao.y=c.y-j.transformacao.altura;e.atualizarPerigos(C.passo);exigir(c.aceso);e.pontuar(85);j.transformacao.y=e.mundo.altura+C.margemQueda+1;e.atualizar(C.passo);exigir(j.transformacao.x===c.x&&sessao.pontos===85);});
    teste('Coletável some e pontua somente uma vez',()=>{const e=engineTeste();e.carregarFase(1);const moeda=e.mundo.itens.find(i=>i.tipo==='moeda'),j=e.mundo.jogador;j.transformacao.x=moeda.x-12;j.transformacao.y=moeda.y-19;e.atualizarItens(C.passo);const pontos=sessao.pontos;e.atualizarItens(C.passo);exigir(!moeda.ativo&&pontos>=10&&sessao.pontos===pontos);});
    teste('Combo cresce e é zerado pelo dano',()=>{const e=engineTeste();e.carregarFase(1);for(let i=0;i<15;i++)e.recompensarItem({tipo:'moeda'});exigir(e.combo===5);e.ferirJogador('inimigo');exigir(e.combo===1);});
    teste('XP sobe múltiplos níveis sem perder excedente',()=>{const p=criarPerfil();ganharXP(p,xpNecessario(1)+xpNecessario(2)+9);exigir(p.nivel===3&&p.xp===9);});
    teste('Nível do herói e poderes modificam atributos',()=>{const p=criarPerfil(),a=estatisticas(p);p.nivel=6;p.aprendidas.duplo=true;p.poderes={forca:2,vigor:1,botas:2,duplo:4};const b=estatisticas(p);exigir(b.dano>a.dano&&b.coracoes>a.coracoes&&b.velocidade>a.velocidade&&b.saltosExtras===2);});
    teste('Escolha contém três habilidades distintas',()=>{const p=criarPerfil();for(let f=1;f<=15;f++){const ids=sortearPoderes(p,f);exigir(ids.length===3&&new Set(ids).size===3);}});
    teste('Chefes garantem uma opção épica ou lendária',()=>{const p=criarPerfil();for(const f of [3,6,9,12,15])exigir(sortearPoderes(p,f).some(id=>['epica','lendaria'].includes(PODERES.find(h=>h.id===id).raridade)));});
    teste('Habilidade repetida sobe de nível',()=>{const p=criarPerfil();p.poderes.forca=2;p.pendente={fase:1,opcoes:['forca','vigor','duplo']};exigir(escolherPoder(p,'forca')&&p.poderes.forca===3&&!p.pendente);});
    teste('Escolha inválida não gasta recompensa',()=>{const p=criarPerfil();p.pendente={fase:1,opcoes:['forca','vigor','duplo']};exigir(!escolherPoder(p,'fenix')&&p.pendente!==null);});
    teste('Poder já adquirido pode reaparecer',()=>{const p=criarPerfil();p.poderes.forca=1;exigir(FASES.some(f=>sortearPoderes(p,f.numero).includes('forca')));});
    teste('Save mantém XP, poder, fase e escolha pendente',()=>{const m=new MemoriaTeste(),p=criarPerfil();p.nivel=4;p.xp=50;p.poderes.forca=2;p.concluidas[0]=true;p.fase=2;p.pendente={fase:1,opcoes:['forca','vigor','duplo']};exigir(salvarPerfil(m,p));const q=carregarPerfil(m);exigir(q.nivel===4&&q.xp===50&&q.poderes.forca===2&&q.fase===2&&q.pendente.opcoes.length===3);});
    teste('Save inválido não desbloqueia a campanha',()=>{const p=validarPerfil({...criarPerfil(),fase:15,nivel:-30,xp:NaN,concluidas:[]});exigir(p.fase===1&&p.nivel===1&&p.xp===0);});
    teste('Save bloqueado e JSON quebrado são tolerados',()=>{const b={getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');}};exigir(carregarPerfil(b).nivel===1&&!salvarPerfil(b,criarPerfil()));const m=new MemoriaTeste();m.setItem('aventura-selva-campanha-v2','{');exigir(carregarPerfil(m).fase===1);});
    teste('Migração preserva recorde do M1',()=>{const m=new MemoriaTeste();m.setItem(C.chaveSave,JSON.stringify({versao:1,recorde:1234}));exigir(lerRecorde(m)===1234&&carregarPerfil(m).recorde===1234);});
    teste('Recarregar não troca as três ofertas',()=>{const m=new MemoriaTeste(),e=engineTeste(m);e.carregarFase(1);e.concluirFase();const ids=e.perfil.pendente.opcoes.join(',');const recarregada=engineTeste(m);recarregada.iniciarPartida();exigir(recarregada.estados.atual===E.JOGANDO&&recarregada.descanso&&recarregada.perfil.pendente.opcoes.join(',')===ids);});
    teste('Uma recompensa libera a próxima fase e não pode ser escolhida duas vezes',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.agir('avancar');exigir(e.descanso&&e.estados.atual===E.JOGANDO);e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();const id=e.perfil.pendente.opcoes[0];exigir(e.escolherRecompensa(id));exigir(e.estados.atual===E.LOJA&&e.perfil.poderes[id]===1&&!e.escolherRecompensa(id));e.agir('fecharLoja');e.sairDescanso();exigir(e.mundo.fase.numero===2);});
    teste('Repetir fase não oferece outro poder',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.agir('avancar');e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();e.escolherRecompensa(e.perfil.pendente.opcoes[0]);e.agir('fecharLoja');e.carregarFase(1);e.concluirFase();exigir(!e.resultado.primeira&&e.perfil.pendente===null);});
    teste('Menu não permite pular fase bloqueada',()=>{const e=engineTeste();e.agir('mapa');e.agir('fase','15');exigir(e.estados.atual===E.MAPA&&e.mundo.fase.numero===1);});
    teste('Desafios pagam bônus somente uma vez',()=>{const p=criarPerfil(),f=FASES[0],r={danos:0,estrelas:3,tempo:20,moedas:99,eliminados:99,quedas:0,chefeVencido:true};const a=avaliarDesafios(p,f,r),b=avaliarDesafios(p,f,r);exigir(a.novos===3&&a.xp>0&&b.novos===0&&b.xp===0);});
    teste('Nova expedição mantém habilidades e nível',()=>{const p=criarPerfil();p.nivel=9;p.poderes.duplo=2;p.concluidas.fill(true);novaExpedicao(p);exigir(p.ciclo===2&&p.nivel===9&&p.poderes.duplo===2&&p.fase===1&&p.concluidas.every(v=>!v));});
    teste('Spatial hash deduplica corpos em várias células',()=>{const e=engineTeste();e.inimigos.pool.limpar();const n=e.inimigos.criar('macaco',120,448,1,1,1);n.transformacao.largura=100;e.hash.reconstruir(e.inimigos.pool.itens);e.hash.consultar(0,0,500,540);exigir(e.hash.quantidade===1&&e.hash.resultados[0]===n.id);});
    teste('Visão respeita direção e obstáculos',()=>{const e=engineTeste();semInimigos(e);const n=e.inimigos.criar('onca',100,448,1,1,0),t=e.mundo.jogador.transformacao;n.controle.direcao=1;t.x=280;t.y=410;const solido=e.mundo.solido;e.mundo.solido=(x,y)=>x===5&&y<14;exigir(!veJogador(n,e));e.mundo.solido=()=>false;exigir(veJogador(n,e));t.x=-100;exigir(!veJogador(n,e));e.mundo.solido=solido;});
    teste('Armadura do tatu reduz dano frontal',()=>{const e=engineTeste();e.carregarFase(1);semInimigos(e);e.rng.proximo=()=>1;const n=e.inimigos.criar('tatu',200,448,1,1,0);n.controle.direcao=1;n.vida=100;e.ferirInimigo(n,20,300);const frente=100-n.vida;n.invulneravel=0;n.estado='patrulha';n.vida=100;e.ferirInimigo(n,20,100);exigir(frente<100-n.vida);});
    teste('Golpe causa dano uma vez por inimigo',()=>{const e=engineTeste();e.carregarFase(1);semInimigos(e);e.rng.proximo=()=>1;const t=e.mundo.jogador.transformacao,n=e.inimigos.criar('tatu',t.x+30,448,1,1,1);e.hash.reconstruir(e.inimigos.pool.itens);e.entrada.pressionar(A.atacar);e.combate.atualizarJogador(e,C.passo);e.combate.resolverGolpes(e);const vida=n.vida;n.invulneravel=0;e.combate.resolverGolpes(e);exigir(vida<n.vidaMaxima&&n.vida===vida);});
    teste('Lâmina do vento cria projétil do jogador',()=>{const e=engineTeste();poderes(e,{onda:1});e.entrada.pressionar(A.atacar);e.combate.atualizarJogador(e,C.passo);exigir(e.projeteis.pool.itens.some(p=>p.ativo&&!p.hostil&&p.tipo==='onda'));});
    teste('Projétil acerta jogador e se desativa',()=>{const e=engineTeste();e.carregarFase(1);const t=e.mundo.jogador.transformacao,p=e.projeteis.atirar(t.x+12,t.y+19,0,0);e.projeteis.atualizar(e,C.passo);exigir(!p.ativo&&sessao.vidas===2);});
    teste('Chefe possui três fases de vida',()=>{const e=engineTeste();e.carregarFase(3);e.mundo.jogador.transformacao.x=450;atualizarChefe(e,C.passo);exigir(e.chefe.fase===1&&e.chefe.estado==='aviso');e.chefe.vida=e.chefe.vidaMaxima*.5;atualizarChefe(e,C.passo);exigir(e.chefe.fase===2);e.chefe.vida=e.chefe.vidaMaxima*.2;atualizarChefe(e,C.passo);exigir(e.chefe.fase===3);});
    teste('Portal do chefe fica selado até a derrota',()=>{const e=engineTeste();e.carregarFase(3);exigir(!e.concluirFase());e.chefe.estado='recuperando';e.ferirChefe(100000);exigir(!e.chefe.ativo&&e.corrida.chefeVencido&&e.concluirFase());});
    teste('Pausa congela IA, projéteis, buffs e temporizadores',()=>{const e=engineTeste();e.carregarFase(3);e.mundo.jogador.animacao.invulneravel=1;e.projeteis.atirar(500,100,90,0);e.particulas.emitir(e.mundo.jogador,3);e.agir('pausa');const foto=()=>JSON.stringify([e.mundo,e.camera,e.chefe,e.inimigos.pool.itens,e.projeteis.pool.itens,e.particulas.pool.itens,e.comboTempo,e.hitstop]);const antes=foto();for(let i=0;i<120;i++)e.atualizar(C.passo);exigir(antes===foto());});
    teste('100 reinícios não multiplicam eventos nem preservam projéteis',()=>{const e=engineTeste();for(let i=0;i<100;i++){e.carregarFase(1);e.projeteis.atirar(100,100,50,0);}e.carregarFase(1);exigir(e.projeteis.pool.itens.every(p=>!p.ativo)&&e.eventos.ouvintes.get('dano').length===1&&sessao.vidas===3);});
    teste('Loop limita atraso e mantém passo de 60 Hz',()=>{let passos=0,alpha=-1;const l=new LoopPrincipal(dt=>{exigir(dt===C.passo);passos++;},a=>{alpha=a;});l.avancar(5);exigir(passos===6&&alpha>=0&&alpha<1);});
    teste('RNG e pool mantêm sequência e capacidade',()=>{const a=new Aleatorio(1),b=new Aleatorio(1);for(let i=0;i<100;i++)exigir(a.proximo()===b.proximo());const p=new Pool(2,()=>({ativo:false}));const n=p.obter();p.obter();exigir(p.obter()===null);n.ativo=false;exigir(p.obter()===n);});
    teste('Máquina de estados rejeita transição inválida',()=>{const m=new MaquinaEstados(new BarramentoEventos());exigir(!m.mudar(E.FIM_DE_JOGO)&&m.mudar(E.JOGANDO)&&m.mudar(E.PAUSADO));});
    teste('Dano devolve ao checkpoint sem apagar XP e poderes',()=>{const e=engineTeste();poderes(e,{forca:2});const cp=e.mundo.checkpoints[0],j=e.mundo.jogador;j.transformacao.x=cp.x;j.transformacao.y=410;e.atualizarPerigos(C.passo);j.transformacao.x+=150;const nivel=e.perfil.nivel;e.ferirJogador('inimigo');exigir(j.transformacao.x===cp.x&&e.perfil.poderes.forca===2&&e.perfil.nivel===nivel);});
    teste('Seiva vital cura após o número previsto de eliminações',()=>{const e=engineTeste();poderes(e,{sangue:1});semInimigos(e);sessao.vidas=1;for(let i=0;i<7;i++){const n=e.inimigos.criar('macaco',500,448,1,1,i);e.eliminar(n);}exigir(sessao.vidas===2);});
    teste('Espinhos retaliam contra inimigo próximo',()=>{const e=engineTeste();poderes(e,{espinhos:1});semInimigos(e);const n=e.inimigos.criar('tatu',e.mundo.jogador.transformacao.x+40,448,1,1,1);const v=n.vida;e.ferirJogador('inimigo',n);exigir(n.vida<v);});
    teste('Fúria ancestral aumenta dano com poucos corações',()=>{const e=engineTeste();poderes(e,{furia:1});const dano=e.danoAtual();sessao.vidas=1;exigir(e.danoAtual()>dano);});
    teste('Tempestade produz dano adicional sem recursão',()=>{const e=engineTeste();poderes(e,{tempestade:1});semInimigos(e);const n=e.inimigos.criar('tatu',180,448,1,1,1),vida=n.vida;for(let i=0;i<4;i++)e.processarAcerto();exigir(n.vida<vida);});
    teste('Campanha completa escolhe 15 poderes e permite nova expedição',()=>{const e=engineTeste();for(let f=1;f<=15;f++){e.carregarFase(f);if(e.chefe){e.chefe.estado='recuperando';e.ferirChefe(1000000);}exigir(e.concluirFase());e.agir('avancar');e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();const id=e.perfil.pendente.opcoes[0];exigir(e.escolherRecompensa(id));e.agir('fecharLoja');e.sairDescanso();}exigir(e.estados.atual===E.VITORIA&&e.perfil.concluidas.every(Boolean));const total=Object.values(e.perfil.poderes).reduce((a,b)=>a+b,0);exigir(total===15);e.agir('novoCiclo');exigir(e.perfil.ciclo===2&&e.mundo.fase.numero===1&&Object.values(e.perfil.poderes).reduce((a,b)=>a+b,0)===15);});
    teste('Novos personagens aprendem dash antes de usar',()=>{const e=engineTeste();e.carregarFase(1);e.entrada.pressionar(A.dash);e.combate.atualizarJogador(e,C.passo);exigir(e.mundo.jogador.combate.dash===0);});
    teste('Planar limita a queda sem permitir pulo adicional',()=>{const c=contexto();c.j.transformacao.y=100;c.j.corpo.noChao=false;c.j.corpo.vy=500;c.j.planando=true;atualizarFisica(c.j,c.mundo,C.passo,c.eventos);exigir(c.j.corpo.vy<=130&&!c.j.corpo.noChao);});
    teste('Enquadramento mantém proporção em PC, celular e retrato',()=>{for(const [w,h]of [[1920,1080],[1366,768],[390,844],[844,390],[320,640]]){const q=enquadrar(w,h);exigir(Math.abs(q.largura/q.altura-16/9)<1e-8&&q.largura<=w+.01&&q.altura<=h+.01);}});
    teste('Moedas e ouro aumentam a carteira persistente',()=>{const e=engineTeste();e.carregarFase(1);e.recompensarItem({tipo:'moeda'});e.recompensarItem({tipo:'ouro'});exigir(e.perfil.moedas===6);});
    teste('Compra sem saldo é recusada sem desconto',()=>{const p=criarPerfil();const r=comprarProduto(p,'pulo',3);exigir(!r.ok&&p.moedas===0&&p.melhorias.pulo===0);});
    teste('Melhoria permanente cobra preço crescente e muda o atributo',()=>{const p=criarPerfil();p.moedas=1000;const preco=precoProduto(p,'pulo'),antes=estatisticas(p).impulso;exigir(comprarProduto(p,'pulo',3).ok&&p.moedas===1000-preco&&precoProduto(p,'pulo')>preco&&estatisticas(p).impulso>antes);});
    teste('Vida não ultrapassa o máximo e escudo não duplica compra',()=>{const p=criarPerfil();p.moedas=500;exigir(!comprarProduto(p,'vida',3).ok&&p.moedas===500);exigir(comprarProduto(p,'escudo',2).ok);const saldo=p.moedas;exigir(!comprarProduto(p,'escudo',2,true).ok&&p.moedas===saldo);});
    teste('Conclusão não abre loja ou upgrade automaticamente',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();exigir(e.estados.atual===E.FASE_CONCLUIDA);e.agir('avancar');exigir(e.estados.atual===E.JOGANDO&&e.descanso&&!e.mercadorPerto);});
    teste('Mercador exige proximidade para abrir a loja',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.agir('avancar');exigir(!e.abrirLoja());e.mundo.jogador.transformacao.x=e.mercador.x;exigir(e.abrirLoja()&&e.estados.atual===E.LOJA);});
    teste('Cura comprada permanece na fase seguinte',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.entrarDescanso(1,1);e.perfil.moedas=100;e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();e.agir('comprar','vida');exigir(sessao.vidas===2);e.agir('fecharLoja');e.sairDescanso();exigir(sessao.vidas===2&&e.mundo.fase.numero===2);});
    teste('Ímã comprado congela no descanso e na loja',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.agir('avancar');e.perfil.moedas=100;e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();e.agir('comprar','ima');for(let i=0;i<90;i++)e.atualizar(C.passo);exigir(e.perfil.consumiveis.ima===60);e.agir('fecharLoja');for(let i=0;i<90;i++)e.atualizar(C.passo);exigir(e.perfil.consumiveis.ima===60);});
    teste('Escudo comprado absorve dano e consome a provisão',()=>{const e=engineTeste();e.carregarFase(1);e.perfil.moedas=100;comprarProduto(e.perfil,'escudo',3);e.mundo.jogador.combate.escudo=true;e.ferirJogador('inimigo');exigir(sessao.vidas===3&&!e.perfil.consumiveis.escudo);});
    teste('Relíquias não escolhidas acumulam para o mercador',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.carregarFase(2);e.concluirFase();exigir(e.perfil.pendente.fase===1&&e.perfil.presentes.length===1);e.agir('avancar');e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();e.escolherRecompensa(e.perfil.pendente.opcoes[0]);exigir(e.perfil.pendente.fase===2&&e.estados.atual===E.LOJA);});
    teste('Provas têm requisitos progressivos de fase',()=>{const p=criarPerfil();exigir(!podeTreinar(p,'duplo'));p.concluidas[0]=true;exigir(podeTreinar(p,'duplo')&&!podeTreinar(p,'dash'));p.concluidas.fill(true,0,6);exigir(podeTreinar(p,'dash')&&podeTreinar(p,'planar'));});
    teste('Sequência só aceita entrada depois da demonstração',()=>{const p=new Puzzle('duplo',42);exigir(!p.simbolo(p.sequencia[0])&&p.cursor===0);p.atualizar(4.5);for(const n of p.sequencia)p.simbolo(n);exigir(p.status==='vitoria');});
    teste('Sequência errada permite uma nova tentativa sem custo',()=>{const p=new Puzzle('duplo',42);p.atualizar(4.5);p.simbolo((p.sequencia[0]+1)%4);exigir(p.status==='erro');const q=new Puzzle('duplo',42,1);q.atualizar(4.5);for(const n of q.sequencia)q.simbolo(n);exigir(q.status==='vitoria');});
    teste('Memória bloqueia cliques durante o erro e vira as cartas',()=>{const p=new Puzzle('dash',12);let a=0,b=p.cartas.findIndex(x=>x!==p.cartas[0]);p.carta(a);p.carta(b);exigir(p.espera>0&&!p.carta(7));p.atualizar(1);exigir(p.abertas.length===0&&p.erros===1);});
    teste('Memória resolve quatro pares sem reutilizar cartas',()=>{const p=new Puzzle('dash',12);for(let n=0;n<4;n++){const ids=p.cartas.map((v,i)=>v===n?i:-1).filter(i=>i>=0);p.carta(ids[0]);exigir(!p.carta(ids[0]));p.carta(ids[1]);}exigir(p.status==='vitoria');});
    teste('Peças rejeitam espaços errados e aceitam os seis corretos',()=>{const p=new Puzzle('planar',99);exigir(!p.encaixar(0,1)&&!p.encaixadas[0]);for(let i=0;i<6;i++){p.selecionar(i);exigir(p.encaixar(p.selecionada,i));}exigir(p.status==='vitoria'&&!p.encaixar(0,0));});
    teste('Puzzle ensina habilidade uma vez e mantém mundo congelado',()=>{const e=engineTeste();e.carregarFase(1);e.concluirFase();e.agir('avancar');e.mundo.jogador.transformacao.x=e.mercador.x;e.abrirLoja();e.agir('treinar','duplo');const tempo=e.mundo.tempo;e.puzzle.atualizar(5);for(const n of e.puzzle.sequencia)e.puzzle.simbolo(n);e.atualizar(C.passo);exigir(e.perfil.aprendidas.duplo&&e.atributos.saltosExtras===1&&e.mundo.tempo===tempo);const xp=e.perfil.xp;e.atualizar(C.passo);exigir(e.perfil.xp===xp);});
    teste('Save versão 3 preserva compras, aprendizado, saldo e descanso',()=>{const m=new MemoriaTeste(),e=engineTeste(m);e.carregarFase(1);e.concluirFase();e.entrarDescanso(1,2);e.perfil.moedas=321;e.perfil.melhorias.pulo=2;e.perfil.aprendidas.duplo=true;e.perfil.consumiveis.ima=40;e.salvar();const p=carregarPerfil(m);exigir(p.versao===3&&p.moedas===321&&p.melhorias.pulo===2&&p.aprendidas.duplo&&p.consumiveis.ima===40&&p.descanso.fase===1);});
    teste('Migração da campanha anterior preserva dash e relíquias',()=>{const d={...criarPerfil(),versao:2,nivel:5,poderes:{duplo:2,forca:3}};const p=validarPerfil(d);exigir(p.versao===3&&p.aprendidas.dash&&p.aprendidas.duplo&&p.poderes.forca===3&&p.nivel===5);});
    teste('Música troca ao sair do descanso sem trocar o estado de jogo',()=>{const e=engineTeste();let tema='';e.audio={iniciar(){},tocar(){},pausar(){},definirTema(id){tema=id;}};e.carregarFase(1);e.concluirFase();e.agir('avancar');exigir(tema==='loja');e.sairDescanso();exigir(tema==='fase2');});
    teste('Inimigos têm variantes próprias de cada ambiente',()=>{const e=engineTeste();const a=e.inimigos.criar('onca',100,448,1,1,1),b=e.inimigos.criar('onca',500,448,10,1,1);exigir(a.nome!==b.nome&&a.cor!==b.cor&&b.nome==='Lince da Geada'&&a.tipo===b.tipo);});
    teste('Cidade posiciona criaturas e moedas sobre os telhados',()=>{const e=engineTeste();e.carregarFase(4);for(const n of e.inimigos.pool.itens){if(!n.ativo||n.tipo==='aranha'||n.tipo==='besouro'||n.tipo==='piranha')continue;const t=n.transformacao;exigir(!e.mundo.solido(Math.floor((t.x+t.largura/2)/32),Math.floor((t.y+t.altura/2)/32)));}for(const p of e.mundo.fase.predios)for(const item of e.mundo.itens)if(item.x>=p.x&&item.x<p.x+p.largura)exigir(item.y<p.y);});
    teste('Músicas de 15 fases, menu e loja são distintas e válidas',()=>{const trilhas=['menu','loja',...Array.from({length:15},(_,i)=>'fase'+(i+1))].map(criarTrilha);exigir(new Set(trilhas.map(t=>JSON.stringify(t))).size===17);for(const t of trilhas)exigir(t.bpm>0&&t.melodia.length===16&&Number.isFinite(frequencia(t.raiz)));});
    teste('15 fases simulam física, IA e chefes sem valores inválidos',()=>{const e=engineTeste();for(let f=1;f<=15;f++){e.carregarFase(f);e.mundo.jogador.animacao.invulneravel=9999;if(e.chefe)e.mundo.jogador.transformacao.x=500;for(let i=0;i<300;i++)e.atualizar(C.passo);const t=e.mundo.jogador.transformacao;exigir(Number.isFinite(t.x)&&Number.isFinite(t.y)&&sessao.vidas>0,'Fase '+f);}});
    teste('Todas as fases têm rota terrestre sem exigir poderes',()=>{const e=engineTeste();for(const fase of FASES){if(fase.chefe)continue;e.carregarFase(fase.numero);semInimigos(e);e.mundo.perigos.length=0;e.mundo.jogador.animacao.invulneravel=9999;e.entrada.pressionar(A.direita);let salto=0,soltura=0;for(let i=0;i<1500&&e.estados.atual===E.JOGANDO;i++){if(soltura>0&&--soltura===0)e.entrada.soltar(A.pular);const alvos=fase.numero===4?[26*32-65,31*32-70,36*32-70,...fase.buracos.slice(1).map(b=>b.x-34)]:fase.buracos.map(b=>b.x-34);const buraco=alvos[salto];if(buraco!==undefined&&e.mundo.jogador.transformacao.x>=buraco&&e.mundo.jogador.corpo.noChao){e.entrada.pressionar(A.pular);salto++;soltura=fase.numero===4?20:40;}e.atualizar(C.passo);}exigir(e.estados.atual===E.FASE_CONCLUIDA&&e.corrida.quedas===0,'Rota da fase '+fase.numero);e.perfil.pendente=null;e.perfil.descanso=null;}});
  } finally { Object.assign(sessao,original); }
  const falhas=linhas.filter(l=>l.startsWith('✗')).length;
  return { total:linhas.length, falhas, texto:'CAMPANHA · '+(linhas.length-falhas)+'/'+linhas.length+' testes passaram\n'+linhas.join('\n') };
}

Object.defineProperty(exports, "EntradaTeste", { enumerable: true, get: () => EntradaTeste });
Object.defineProperty(exports, "MemoriaTeste", { enumerable: true, get: () => MemoriaTeste });
Object.defineProperty(exports, "engineTeste", { enumerable: true, get: () => engineTeste });
Object.defineProperty(exports, "executarTestes", { enumerable: true, get: () => executarTestes });
});
