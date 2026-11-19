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
const { atualizarIA, veJogador } = usar("src/ecs/sistemas/ia.js");
const { atualizarChefe } = usar("src/entidades/chefes/grandeGuardiao.js");
const { PODERES } = usar("src/dados/poderes.js");
const { FASES } = usar("src/fases/campanha.js");
const { Puzzle } = usar("src/meta/puzzles.js");
const { comprarProduto, precoProduto, podeTreinar } = usar("src/meta/mercador.js");
const { enquadrar } = usar("src/core/telaCheia.js");
const { MotorAudio } = usar("src/audio/motorAudio.js");
const { criarTrilha, frequencia } = usar("src/audio/trilhas.js");
const { Interface: InterfaceBase } = usar("src/render/interfaceBase.js");
const { quadroDoHeroi, QUADROS } = usar("src/render/gerarSprites.js");
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
function engineCombate(fase = 1, reduzirMovimento = false) {
  const e = engineTeste();
  e.reduzirMovimento = reduzirMovimento; e.carregarFase(fase); semInimigos(e);
  e.rng.proximo = () => 1;
  return e;
}
function tocarControle(entrada, acao) { entrada.pressionar(acao); entrada.soltar(acao); }
function avancarCombate(e, segundos) {
  for (let i = 0; i < Math.ceil(segundos / C.passo); i++) e.combate.atualizarJogador(e, C.passo);
}
function prepararQueda(j, x, base) {
  const t = j.transformacao;
  t.x = t.anteriorX = x; t.y = t.anteriorY = base - t.altura;
  j.corpo.vy = 300; j.corpo.noChao = false;
}

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
    teste('Coyote aceita dentro da janela e expira em seguida',()=>{for(const espera of [3,Math.ceil(C.coyote/C.passo)+1]){const c=contexto();c.j.corpo.noChao=false;c.j.controle.coyote=C.coyote;c.j.corpo.vy=0;for(let i=0;i<espera;i++)atualizarMovimento(c.j,c.entrada,C.passo,c.eventos);c.entrada.pressionar(A.pular);atualizarMovimento(c.j,c.entrada,C.passo,c.eventos);exigir(espera===3?c.j.corpo.vy<0:c.j.corpo.vy===0);}});
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
    teste('Combo de três golpes acelera os dois cortes e reforça o finalizador', () => {
      const e = engineCombate(), j = e.mundo.jogador, c = j.combate, t = j.transformacao;
      j.corpo.noChao = true;
      const alvo = e.inimigos.criar('macaco', t.x + 35, 448, 1, 1, 0);
      alvo.vida = alvo.vidaMaxima = 200; e.hash.reconstruir(e.inimigos.pool.itens);
      for (let golpe = 1; golpe <= B.golpesCombo; golpe++) {
        const finalizador = golpe === B.golpesCombo, vida = alvo.vida;
        alvo.invulneravel = 0; e.hitstop = 0;
        tocarControle(e.entrada, A.atacar); e.combate.atualizarJogador(e, C.passo);
        exigir(c.golpeCombo === golpe && c.tipoAtaque === 'corte', 'Sequência incorreta');
        exigir(c.ataque === (finalizador ? B.duracaoAtaque : B.duracaoAtaqueRapido), 'Duração do corte');
        exigir((c.esperaAtaque < e.atributos.intervaloAtaque) === !finalizador, 'Recuperação do corte');
        e.combate.resolverGolpes(e);
        exigir(vida - alvo.vida === e.danoAtual() * (finalizador ? 1.5 : 1), 'Dano do golpe');
        exigir(alvo.corpo.vx === (finalizador ? B.empurraoComboFinal : B.empurraoGolpe), 'Empurrão do golpe');
        exigir(e.hitstop === (finalizador ? B.hitstopComboFinal : B.hitstopGolpe), 'Pausa de impacto');
        avancarCombate(e, c.esperaAtaque);
      }
      tocarControle(e.entrada, A.atacar); e.combate.atualizarJogador(e, C.passo);
      exigir(c.golpeCombo === 1);
    });
    teste('Combo guarda um toque na recuperação e expira fora da janela', () => {
      const e = engineCombate(), c = e.mundo.jogador.combate;
      tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo);
      avancarCombate(e, .14);
      tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo);
      exigir(c.golpeCombo === 1 && c.bufferAtaque > 0);
      avancarCombate(e, .08); exigir(c.golpeCombo === 2 && c.bufferAtaque === 0);
      avancarCombate(e, B.janelaCombo + C.passo); exigir(c.golpeCombo === 0);
      tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo); exigir(c.golpeCombo === 1);
    });
    teste('HUD mostra a sequência de golpes separada do multiplicador de pontos', () => {
      const e = engineCombate(), interfaceTeste = Object.create(InterfaceBase.prototype);
      const textos = {};
      interfaceTeste.cache = {};
      interfaceTeste.elementos = { vidas: { setAttribute() {} }, xp: {}, progresso: {}, dash: {}, chefeHud: {}, aviso: { style: {} }, avisoSave: {} };
      interfaceTeste.texto = (id, texto) => { textos[id] = texto; };
      e.combo = 4;
      for (const golpe of [1, 2, 3, 0]) {
        e.mundo.jogador.combate.golpeCombo = golpe;
        interfaceTeste.atualizar(sessao, e.mundo, E.JOGANDO, e);
        exigir(textos.comboGolpes === 'Golpes ' + golpe + '/3' && textos.combo === '×4');
      }
    });
    teste('Segurar ataque preserva a repetição simples e o dano cancela a sequência', () => {
      const e = engineCombate(), c = e.mundo.jogador.combate;
      e.entrada.pressionar(A.atacar); avancarCombate(e, C.passo + .22);
      exigir(c.numeroGolpe === 1);
      avancarCombate(e, .22); exigir(c.numeroGolpe === 2 && c.golpeCombo === 1);
      e.entrada.soltar(A.atacar); avancarCombate(e, .14);
      tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo);
      exigir(c.bufferAtaque > 0);
      e.ferirJogador('inimigo'); avancarCombate(e, .3);
      exigir(c.golpeCombo === 0 && c.ataque === 0 && c.numeroGolpe === 2 && sessao.vidas === 2);
    });
    teste('Corte aéreo atinge abaixo do alcance do corte no chão', () => {
      for (const noChao of [true, false]) {
        const e = engineCombate(), j = e.mundo.jogador, t = j.transformacao;
        j.corpo.noChao = noChao; t.y = t.anteriorY = 330;
        const alvo = e.inimigos.criar('aranha', t.x + t.largura + 5,
          t.y + t.altura + B.margemAtaque + B.alcanceAereo / 2, 1, 1, 0);
        e.hash.reconstruir(e.inimigos.pool.itens);
        tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo); e.combate.resolverGolpes(e);
        exigir(j.combate.tipoAtaque === (noChao ? 'corte' : 'aereo'));
        exigir((alvo.vida < alvo.vidaMaxima) === !noChao);
      }
    });
    teste('Lâmina do vento cria projétil do jogador',()=>{const e=engineTeste();poderes(e,{onda:1});e.entrada.pressionar(A.atacar);e.combate.atualizarJogador(e,C.passo);exigir(e.projeteis.pool.itens.some(p=>p.ativo&&!p.hostil&&p.tipo==='onda'));});
    teste('Onda do finalizador conserva o bônus até atingir um alvo distante', () => {
      const e = engineCombate();
      poderes(e, { onda: 1 }); semInimigos(e);
      const j = e.mundo.jogador, t = j.transformacao;
      let danoNormal = 0, onda;
      for (let i = 1; i <= B.golpesCombo; i++) {
        tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo);
        onda = e.projeteis.pool.itens.find(p => p.ativo);
        exigir(onda?.tipo === 'onda');
        if (i === 1) danoNormal = onda.dano;
        if (i < B.golpesCombo) {
          onda.ativo = false;
          avancarCombate(e, e.mundo.jogador.combate.esperaAtaque);
        }
      }
      exigir(onda.dano === danoNormal * B.danoComboFinal && onda.tipoGolpe === 'finalizador');
      const alvo = e.inimigos.criar('macaco', t.x + 115, 448, 1, 1, 0);
      e.hash.reconstruir(e.inimigos.pool.itens);
      for (let i = 0; i < 15; i++) e.projeteis.atualizar(e, C.passo);
      exigir(Math.abs(alvo.vidaMaxima - alvo.vida - onda.dano) < C.epsilon);
      exigir(alvo.corpo.vx === B.empurraoComboFinal && e.hitstop === B.hitstopComboFinal);
    });
    teste('Pogo por cima quica em todas as famílias e atravessa a defesa do tatu', () => {
      const tipos = ['macaco','cobra','onca','tatu','aranha','piranha','xama','besouro'];
      for (const tipo of tipos) {
        const e = engineCombate(), j = e.mundo.jogador;
        const x = j.transformacao.x, topo = 350;
        const alvo = e.inimigos.criar(tipo, x - 4, 448, 1, 1, 0);
        alvo.transformacao.y = alvo.transformacao.anteriorY = topo;
        e.hash.reconstruir(e.inimigos.pool.itens);
        prepararQueda(j, x, topo - B.alcancePogo - 3);
        e.entrada.pressionar(A.abaixo); tocarControle(e.entrada, A.atacar);
        avancarCombate(e, C.passo); atualizarFisica(j, e.mundo, C.passo, e.eventos);
        e.combate.resolverGolpes(e);
        exigir(j.corpo.vy === -B.quiquePogo && j.combate.ataque === 0 && sessao.vidas === 3, 'Quique em ' + tipo);
        exigir(alvo.vida === alvo.vidaMaxima - e.danoAtual() && alvo.ativo, 'Dano do pogo em ' + tipo);
      }
    });
    teste('Pogo quica em inimigo invulnerável e ignora piranha submersa', () => {
      for (const submersa of [false, true]) {
        const e = engineCombate(), j = e.mundo.jogador;
        const x = j.transformacao.x, alvo = e.inimigos.criar('piranha', x, 350, 1, 1, 0);
        alvo.estado = submersa ? 'submerso' : 'ataque'; alvo.invulneravel = .08;
        prepararQueda(j, x, alvo.transformacao.y - B.alcancePogo - 3);
        e.hash.reconstruir(e.inimigos.pool.itens);
        tocarControle(e.entrada, A.pogo); avancarCombate(e, C.passo);
        atualizarFisica(j, e.mundo, C.passo, e.eventos); e.combate.resolverGolpes(e);
        exigir((j.corpo.vy === -B.quiquePogo) === !submersa && alvo.vida === alvo.vidaMaxima);
      }
    });
    teste('Pisão normal derrota apenas inimigos pisáveis', () => {
      for (const tipo of ['macaco','cobra']) {
        const e = engineCombate(), j = e.mundo.jogador, x = j.transformacao.x;
        const alvo = e.inimigos.criar(tipo, x, 448, 1, 1, 0);
        e.hash.reconstruir(e.inimigos.pool.itens); prepararQueda(j, x, alvo.transformacao.y - 2);
        atualizarFisica(j, e.mundo, C.passo, e.eventos); e.combate.resolverGolpes(e);
        if (tipo === 'macaco') exigir(!alvo.ativo && j.corpo.vy === -B.quique && sessao.vidas === 3);
        else exigir(alvo.ativo && alvo.vida === alvo.vidaMaxima && sessao.vidas === 2);
      }
    });
    teste('Espinhos aceitam pogo no topo, mas ainda ferem no pisão e na lateral', () => {
      for (const caso of ['pogo','pisao','lateral']) {
        const e = engineCombate(), j = e.mundo.jogador;
        const p = e.mundo.perigos.find(perigo => perigo.tipo === 'espinhos');
        const base = caso === 'lateral' ? p.y + B.toleranciaPogo + 3 : p.y - 2;
        prepararQueda(j, p.x + 4, base);
        if (caso !== 'pisao') tocarControle(e.entrada, A.pogo);
        e.atualizar(C.passo);
        if (caso === 'pogo') exigir(j.corpo.vy === -B.quiquePogo && sessao.vidas === 3);
        else exigir(sessao.vidas === 2, 'Contato com espinhos: ' + caso);
      }
    });
    teste('Pogo interrompe a subida e tem prioridade sobre planar', () => {
      const e = engineCombate(), j = e.mundo.jogador;
      j.corpo.noChao = true;
      tocarControle(e.entrada, A.pogo); avancarCombate(e, C.passo);
      exigir(j.combate.ataque === 0);
      e.atributos.podePlanar = true; j.corpo.noChao = false; j.transformacao.y -= 100; j.corpo.vy = -200;
      e.entrada.pressionar(A.planar); tocarControle(e.entrada, A.pogo);
      e.atualizar(C.passo);
      exigir(j.combate.tipoAtaque === 'pogo' && !j.planando && j.corpo.vy >= B.velocidadePogo);
    });
    teste('Projétil acerta jogador e se desativa',()=>{const e=engineTeste();e.carregarFase(1);const t=e.mundo.jogador.transformacao,p=e.projeteis.atirar(t.x+12,t.y+19,0,0);e.projeteis.atualizar(e,C.passo);exigir(!p.ativo&&sessao.vidas===2);});
    teste('Dash perfeito antecipa uma investida já iniciada mesmo ao esquivar para longe', () => {
      const e = engineCombate(), j = e.mundo.jogador, sons = [];
      e.atributos.podeDash = true; e.audio = { tocar(tipo) { sons.push(tipo); } };
      const alvo = e.inimigos.criar('cobra', j.transformacao.x + 50, 448, 1, 1, 0);
      alvo.estado = 'aviso'; alvo.espera = C.passo / 2; alvo.direcaoAtaque = -1;
      e.atualizar(C.passo);
      exigir(alvo.estado === 'ataque' && alvo.corpo.vx < 0);
      const x = j.transformacao.x;
      j.controle.direcao = -1; tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
      exigir(j.transformacao.x < x && alvo.estado === 'atordoado' && sessao.vidas === 3);
      exigir(alvo.espera === B.atordoamentoDashPerfeito - C.passo);
      exigir(j.combate.esperaDash === B.recargaDashPerfeito && sons.includes('dashPerfeito'));
      exigir(e.aviso.texto === 'DASH PERFEITO!' && e.particulas.pool.itens.filter(p => p.ativo && p.cor === B.corDashPerfeito).length === B.particulasDashPerfeito);
      j.combate.dash = 0; j.transformacao.x = alvo.transformacao.x;
      e.combate.resolverGolpes(e);
      exigir(sessao.vidas === 3, 'Contato com inimigo atordoado pelo dash');
      const espera = alvo.espera;
      e.ferirInimigo(alvo, 1, j.transformacao.x);
      exigir(alvo.espera === espera, 'Um acerto comum cortou o atordoamento');
      const passos = Math.round(B.atordoamentoDashPerfeito / C.passo);
      for (let i = 2; i < passos; i++) atualizarIA(e, C.passo);
      exigir(alvo.atordoadoPeloDash && alvo.estado === 'atordoado');
      atualizarIA(e, C.passo); exigir(!alvo.atordoadoPeloDash && alvo.estado === 'patrulha');
    });
    teste('Recarga do dash perfeito bloqueia novo dash por pelo menos 0,3 s', () => {
      const e = engineCombate(), j = e.mundo.jogador;
      e.atributos.podeDash = true;
      const alvo = e.inimigos.criar('cobra', j.transformacao.x + 40, 448, 1, 1, 0);
      alvo.estado = 'ataque'; alvo.espera = .5; alvo.corpo.vx = -310;
      tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
      exigir(alvo.atordoadoPeloDash && j.combate.esperaDash === B.recargaDashPerfeito);
      const passos = Math.ceil(.3 / C.passo);
      for (let i = 1; i < passos; i++) {
        tocarControle(e.entrada, A.dash); avancarCombate(e, C.passo);
        exigir(e.corrida.esquivas === 1 && j.combate.esperaDash > 0);
      }
      tocarControle(e.entrada, A.dash); avancarCombate(e, C.passo);
      exigir(e.corrida.esquivas === 2 && j.combate.esperaDash === e.atributos.recargaDash);
    });
    teste('Motor de áudio tem notas próprias para o dash perfeito', () => {
      const audio = new MotorAudio(), notas = [];
      audio.contexto = { state: 'running', currentTime: 0 };
      audio.nota = frequencia => notas.push(frequencia);
      audio.tocar('dashPerfeito');
      exigir(notas.length === 2 && notas[0] === 740 && notas[1] === 1980);
      audio.tocar('dash');
      exigir(notas.length === 4 && notas[0] !== notas[2] && notas[1] !== notas[3]);
    });
    teste('Dash comum não atordoa patrulha, aviso ou ataque fora da janela iminente', () => {
      const casos = [
        { tipo: 'macaco', estado: 'patrulha', distancia: 8, vx: 0 },
        { tipo: 'cobra', estado: 'aviso', distancia: 12, vx: 0 },
        { tipo: 'cobra', estado: 'ataque', distancia: 48, vx: -310 },
        { tipo: 'cobra', estado: 'ataque', distancia: 3, vx: 310 }
      ];
      for (const caso of casos) {
        const e = engineCombate(), j = e.mundo.jogador;
        e.atributos.podeDash = true;
        const t = j.transformacao, alvo = e.inimigos.criar(caso.tipo, t.x + t.largura + caso.distancia, 448, 1, 1, 0);
        alvo.estado = caso.estado; alvo.espera = caso.estado === 'aviso' ? .04 : .5;
        alvo.direcaoAtaque = caso.vx > 0 ? 1 : -1; alvo.corpo.vx = caso.vx;
        tocarControle(e.entrada, A.dash);
        for (let i = 0; i < Math.ceil(B.janelaDashPerfeito / C.passo); i++) e.atualizar(C.passo);
        exigir(j.combate.dash > 0 && j.combate.esperaDash > B.recargaDashPerfeito);
        exigir(!alvo.atordoadoPeloDash && sessao.vidas === 3, 'Contato durante ' + caso.estado);
      }
    });
    teste('Previsão do dash descarta investida bloqueada por parede ou que acaba antes do impacto', () => {
      for (const parede of [true, false]) {
        const e = engineCombate(), j = e.mundo.jogador, t = j.transformacao;
        e.atributos.podeDash = true;
        t.x = t.anteriorX = 3 * C.tile - t.largura;
        const alvo = e.inimigos.criar('cobra', 4 * C.tile, 448, 1, 1, 0);
        alvo.estado = 'ataque'; alvo.espera = parede ? .5 : 2 * C.passo;
        alvo.direcaoAtaque = -1; alvo.corpo.vx = -310;
        const solido = e.mundo.solido;
        if (parede) e.mundo.solido = (x, y) => x === 3 && y === 13 || solido(x, y);
        tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
        exigir(!alvo.atordoadoPeloDash && j.combate.esperaDash === e.atributos.recargaDash);
      }
    });
    teste('Dash prevê o mergulho do besouro e o salto da piranha', () => {
      for (const tipo of ['besouro', 'piranha']) {
        const e = engineCombate(), j = e.mundo.jogador, t = j.transformacao;
        e.atributos.podeDash = true;
        const alvo = e.inimigos.criar(tipo, t.x, 510, 1, 1, 0);
        if (tipo === 'piranha') {
          alvo.idade = .19; atualizarIA(e, C.passo);
          prepararQueda(j, alvo.transformacao.x, alvo.transformacao.y - 16);
        } else {
          alvo.transformacao.x = t.x + t.largura + 12; alvo.transformacao.y = t.y - 14;
          alvo.estado = 'ataque'; alvo.espera = .5; alvo.direcaoAtaque = -1;
        }
        tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
        exigir(alvo.atordoadoPeloDash && j.combate.esperaDash === B.recargaDashPerfeito, 'Ataque de ' + tipo);
      }
    });
    teste('Projétil do xamã permite dash perfeito com redução de movimento', () => {
      const e = engineCombate(), j = e.mundo.jogador, sons = [];
      e.atributos.podeDash = true; e.perfil.opcoes.movimento = false;
      e.audio = { tocar(tipo) { sons.push(tipo); } };
      const alvo = e.inimigos.criar('xama', j.transformacao.x + 40, 448, 1, 1, 0);
      alvo.estado = 'aviso'; e.atualizar(C.passo);
      const tiro = e.projeteis.pool.itens.find(p => p.ativo);
      exigir(tiro?.autor === alvo);
      tocarControle(e.entrada, A.dash);
      e.atualizar(C.passo);
      exigir(!tiro.ativo && alvo.atordoadoPeloDash && j.combate.esperaDash === B.recargaDashPerfeito && sessao.vidas === 3);
      exigir(sons.includes('dashPerfeito') && !e.particulas.pool.itens.some(p => p.ativo && p.cor === B.corDashPerfeito));
      e.ferirInimigo(alvo, 1, j.transformacao.x, false, 'finalizador'); exigir(e.hitstop === 0);
    });
    teste('Pedra sem autor e projétil de inimigo reciclado não recarregam o dash', () => {
      const e = engineCombate(), j = e.mundo.jogador, t = j.transformacao;
      e.atributos.podeDash = true;
      const antigo = e.inimigos.criar('xama', t.x + 200, 448, 1, 1, 0);
      const x = t.x + t.largura - C.folgaDano + 18, y = t.y + t.altura / 2;
      const teia = e.projeteis.atirar(x, y, -245, 0, 'teia', true, 1, 0, 0, 0, antigo);
      e.inimigos.pool.limpar();
      const novo = e.inimigos.criar('macaco', t.x + 200, 448, 1, 1, 0);
      exigir(antigo === novo && teia.geracaoAutor !== novo.geracao);
      const pedra = e.projeteis.atirar(x, y, -245, 0, 'pedra');
      tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
      exigir(!teia.ativo && !pedra.ativo && !novo.atordoadoPeloDash && j.combate.esperaDash === e.atributos.recargaDash && sessao.vidas === 3);
    });
    teste('Projétil ainda em aviso ou alcançado apenas pelo dash não dá parry', () => {
      for (const aviso of [true, false]) {
        const e = engineCombate(), j = e.mundo.jogador, t = j.transformacao;
        e.atributos.podeDash = true;
        const alvo = e.inimigos.criar('xama', t.x + 200, 448, 1, 1, 0);
        const x = t.x + t.largura + (aviso ? 18 : 60), y = t.y + t.altura / 2;
        const tiro = e.projeteis.atirar(x, y, -245, 0, 'teia', true, 1, 0, aviso ? C.passo : 0, 0, alvo);
        tocarControle(e.entrada, A.dash);
        for (let i = 0; i < Math.ceil(B.janelaDashPerfeito / C.passo); i++) e.atualizar(C.passo);
        exigir(!tiro.ativo && !alvo.atordoadoPeloDash && j.combate.esperaDash > B.recargaDashPerfeito && sessao.vidas === 3);
      }
    });
    teste('Dash perfeito neutraliza só a primeira ameaça que atingiria o jogador', () => {
      const e = engineCombate(), j = e.mundo.jogador, t = j.transformacao;
      e.atributos.podeDash = true;
      const cobra = e.inimigos.criar('cobra', t.x + t.largura + 27, 448, 1, 1, 0);
      cobra.estado = 'ataque'; cobra.espera = .5; cobra.direcaoAtaque = -1; cobra.corpo.vx = -310;
      const xama = e.inimigos.criar('xama', t.x + 200, 448, 1, 1, 0);
      const tiro = e.projeteis.atirar(t.x + t.largura + 14, t.y + t.altura / 2, -245, 0, 'teia', true, 1, 0, 0, 0, xama);
      tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
      exigir(!tiro.ativo && xama.atordoadoPeloDash && !cobra.atordoadoPeloDash && j.combate.esperaDash === B.recargaDashPerfeito);
    });
    teste('Dash perfeito interrompe a investida do guardião e ele volta a avisar', () => {
      const e = engineCombate(3), b = e.chefe, j = e.mundo.jogador, t = j.transformacao;
      e.atributos.podeDash = true;
      b.estado = 'investida'; b.espera = .5; b.corpo.vx = -350;
      t.x = t.anteriorX = b.transformacao.x - t.largura - 8;
      tocarControle(e.entrada, A.dash); e.atualizar(C.passo);
      exigir(b.atordoadoPeloDash && b.estado === 'atordoado' && b.corpo.vx === 0 && j.combate.esperaDash === B.recargaDashPerfeito);
      const passos = Math.round(B.atordoamentoDashPerfeito / C.passo);
      for (let i = 2; i < passos; i++) atualizarChefe(e, C.passo);
      exigir(b.atordoadoPeloDash);
      atualizarChefe(e, C.passo); exigir(!b.atordoadoPeloDash && b.estado === 'aviso');
    });
    teste('Guardiões aceitam finalizador e pogo, além do pisão anterior', () => {
      for (const caso of ['combo','pogo','pisao']) {
        const e = engineCombate(3), j = e.mundo.jogador, b = e.chefe;
        const alvo = b.transformacao, vida = b.vida;
        b.estado = 'aviso';
        if (caso === 'combo') {
          j.transformacao.x = alvo.x - j.transformacao.largura - 5; j.corpo.noChao = true;
          j.combate.golpeCombo = B.golpesCombo - 1; j.combate.janelaCombo = B.janelaCombo;
          tocarControle(e.entrada, A.atacar); avancarCombate(e, C.passo);
          e.combate.resolverGolpes(e);
          exigir(vida - b.vida === e.danoAtual() * B.danoComboFinal && e.hitstop === B.hitstopComboFinal);
        } else {
          prepararQueda(j, alvo.x + 8, alvo.y - 2);
          if (caso === 'pogo') { tocarControle(e.entrada, A.pogo); avancarCombate(e, C.passo); }
          atualizarFisica(j, e.mundo, C.passo, e.eventos); e.combate.resolverGolpes(e);
          exigir(j.corpo.vy === (caso === 'pogo' ? -B.quiquePogo : -B.quique) && b.vida < vida && sessao.vidas === 3);
        }
      }
    });
    teste('Guardião limita dano do pogo por 0,35 s e mantém o quique', () => {
      const e = engineCombate(3, true), j = e.mundo.jogador, b = e.chefe;
      b.estado = 'aviso'; b.espera = 1;
      function pogar() {
        prepararQueda(j, b.transformacao.x + 8, b.transformacao.y - 2);
        j.combate.esperaAtaque = 0;
        tocarControle(e.entrada, A.pogo); avancarCombate(e, C.passo);
        atualizarFisica(j, e.mundo, C.passo, e.eventos); e.combate.resolverGolpes(e);
        exigir(j.corpo.vy === -B.quiquePogo && sessao.vidas === 3);
      }
      const vidaInicial = b.vida;
      pogar();
      const vidaAposPogo = b.vida;
      exigir(vidaAposPogo < vidaInicial && b.esperaPogo === B.recargaPogoChefe);
      const passos = Math.round(B.recargaPogoChefe / C.passo);
      const metade = Math.floor(passos / 2);
      for (let i = 0; i < metade; i++) atualizarChefe(e, C.passo);
      exigir(b.invulneravel === 0 && b.esperaPogo > 0);
      pogar(); exigir(b.vida === vidaAposPogo && j.combate.acertos === 1);
      exigir(e.ferirChefe(e.danoAtual()), 'O intervalo do pogo não bloqueia outros golpes');
      const vidaAposCorte = b.vida;
      for (let i = metade; i < passos; i++) atualizarChefe(e, C.passo);
      exigir(b.esperaPogo === 0);
      pogar(); exigir(b.vida < vidaAposCorte && j.combate.acertos === 2);
    });
    teste('Chefe possui três fases de vida',()=>{const e=engineTeste();e.carregarFase(3);e.mundo.jogador.transformacao.x=450;atualizarChefe(e,C.passo);exigir(e.chefe.fase===1&&e.chefe.estado==='aviso');e.chefe.vida=e.chefe.vidaMaxima*.5;atualizarChefe(e,C.passo);exigir(e.chefe.fase===2);e.chefe.vida=e.chefe.vidaMaxima*.2;atualizarChefe(e,C.passo);exigir(e.chefe.fase===3);});
    teste('Portal do chefe fica selado até a derrota',()=>{const e=engineTeste();e.carregarFase(3);exigir(!e.concluirFase());e.chefe.estado='recuperando';e.ferirChefe(100000);exigir(!e.chefe.ativo&&e.corrida.chefeVencido&&e.concluirFase());});
    teste('Pausa congela IA, projéteis, buffs e temporizadores',()=>{const e=engineTeste();e.carregarFase(3);e.mundo.jogador.animacao.invulneravel=1;e.projeteis.atirar(500,100,90,0);e.particulas.emitir(e.mundo.jogador,3);e.agir('pausa');const foto=()=>JSON.stringify([e.mundo,e.camera,e.chefe,e.inimigos.pool.itens,e.projeteis.pool.itens,e.particulas.pool.itens,e.comboTempo,e.hitstop]);const antes=foto();for(let i=0;i<120;i++)e.atualizar(C.passo);exigir(antes===foto());});
    teste('Sprites do protagonista acompanham repouso, passos, salto, queda e planar', () => {
      const j = engineCombate().mundo.jogador;
      j.corpo.noChao = true;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.parado);
      j.animacao.tempo = C.intervaloPiscada - C.duracaoPiscada / 2;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.piscando);
      j.corpo.vx = C.velocidade;
      for (let i = 0; i < QUADROS.passos; i++) {
        j.animacao.tempo = (i + .5) / C.animacaoFrequencia;
        exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.primeiroPasso + i);
      }
      j.corpo.noChao = false; j.corpo.vy = -C.impulso;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.pulando);
      j.corpo.vy = C.quedaMaxima;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.caindo);
      j.planando = true;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.planando);
    });
    teste('Sprites distinguem os três golpes, pogo, dash, dano e comemoração', () => {
      const j = engineCombate().mundo.jogador, c = j.combate;
      c.ataque = B.duracaoAtaque; c.tipoAtaque = 'corte';
      for (let golpe = 1; golpe <= B.golpesCombo; golpe++) {
        c.golpeCombo = golpe;
        exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.primeiroGolpe + golpe - 1);
      }
      c.tipoAtaque = 'pogo';
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.pogo);
      c.dash = B.duracaoDash;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.dash);
      j.animacao.flash = C.passo;
      exigir(quadroDoHeroi(j, E.JOGANDO) === QUADROS.dano);
      exigir(quadroDoHeroi(j, E.FASE_CONCLUIDA) === QUADROS.vitoria);
    });
    teste('A primeira trilha ensina em movimento e a pausa congela o tempo', () => {
      const e=engineTeste();e.agir('jogar');
      const t=e.mundo.jogador.transformacao, inicio=t.x;
      exigir(e.mundo.fase.dicas.some(d=>inicio>=d.de&&inicio<d.ate&&d.toque&&d.teclado));
      e.entrada.pressionar(A.direita);
      for(let i=0;i<12;i++)e.atualizar(C.passo);
      exigir(t.x>inicio&&e.mundo.tempo>0);
      e.agir('pausa');const tempo=e.mundo.tempo;
      for(let i=0;i<60;i++)e.atualizar(C.passo);
      exigir(e.mundo.tempo===tempo&&e.estados.atual===E.PAUSADO);
      e.agir('continuar');e.atualizar(C.passo);exigir(e.mundo.tempo>tempo);
    });
    teste('100 reinícios não multiplicam eventos nem preservam projéteis',()=>{const e=engineTeste();for(let i=0;i<100;i++){e.carregarFase(1);e.projeteis.atirar(100,100,50,0);}e.carregarFase(1);exigir(e.projeteis.pool.itens.every(p=>!p.ativo)&&e.eventos.ouvintes.get('dano').length===1&&sessao.vidas===3);});
    teste('Loop limita atraso e mantém passo de 60 Hz',()=>{let passos=0,alpha=-1;const l=new LoopPrincipal(dt=>{exigir(dt===C.passo);passos++;},a=>{alpha=a;});l.avancar(5);exigir(passos===6&&alpha>=0&&alpha<1);});
    teste('RNG e pool mantêm sequência e capacidade',()=>{const a=new Aleatorio(1),b=new Aleatorio(1);for(let i=0;i<100;i++)exigir(a.proximo()===b.proximo());const p=new Pool(2,()=>({ativo:false}));const n=p.obter();p.obter();exigir(p.obter()===null);n.ativo=false;exigir(p.obter()===n);});
    teste('Máquina de estados rejeita transição inválida',()=>{const m=new MaquinaEstados(new BarramentoEventos());exigir(!m.mudar(E.FIM_DE_JOGO)&&m.mudar(E.JOGANDO)&&m.mudar(E.PAUSADO));});
    teste('Golpe preserva a posição, o checkpoint, o XP e os poderes',()=>{const e=engineTeste();poderes(e,{forca:2});const cp=e.mundo.checkpoints[0],j=e.mundo.jogador;j.transformacao.x=cp.x;j.transformacao.y=410;e.atualizarPerigos(C.passo);j.transformacao.x+=150;const nivel=e.perfil.nivel;e.ferirJogador('inimigo');exigir(j.transformacao.x===cp.x+150&&e.mundo.respawnX===cp.x&&e.perfil.poderes.forca===2&&e.perfil.nivel===nivel);});
    teste('Coração cheio fica na trilha e só é colhido quando cura',()=>{
      const e=engineTeste();e.carregarFase(1);
      const item=e.mundo.itens.find(i=>i.tipo==='coracao'),t=e.mundo.jogador.transformacao;
      t.x=item.x-12;t.y=item.y-19;e.atualizarItens(C.passo);exigir(item.ativo);
      sessao.vidas--;e.atualizarItens(C.passo);exigir(!item.ativo&&sessao.vidas===e.atributos.coracoes);
    });
    teste('Avisa sem ferir e só causa dano de contato quando inicia o bote',()=>{
      const e=engineCombate(),j=e.mundo.jogador,t=j.transformacao;
      const cobra=e.inimigos.criar('cobra',t.x,t.y+t.altura,2,1,3);
      e.hash.reconstruir(e.inimigos.pool.itens);cobra.estado='aviso';e.combate.resolverContatos(e,j);
      exigir(sessao.vidas===3);cobra.estado='ataque';e.combate.resolverContatos(e,j);exigir(sessao.vidas===2);
    });
    teste('Um projétil que apenas roça a borda visual passa pelo personagem',()=>{
      const e=engineCombate(),t=e.mundo.jogador.transformacao;
      const p=e.projeteis.atirar(t.x+t.largura,t.y+12,0,0,'teia');
      p.x=t.x+t.largura-1;
      e.projeteis.atualizar(e,C.passo);exigir(p.ativo&&sessao.vidas===3);
      p.x-=C.folgaDano;e.projeteis.atualizar(e,C.passo);exigir(!p.ativo&&sessao.vidas===2);
    });
    teste('Guarda alta reduz repetição aérea e abre na recuperação',()=>{
      const e=engineCombate(3),b=e.chefe;b.estado='aviso';
      function acertar(tipo){b.invulneravel=0;const antes=b.vida;e.ferirChefe(10,tipo);return antes-b.vida;}
      for(let i=0;i<B.aereosParaGuarda;i++)exigir(acertar('pisao')===10);
      exigir(acertar('pisao')===10*B.fatorGuardaAlta);b.estado='recuperando';
      exigir(acertar('pisao')===10*B.bonusRecuperacaoChefe&&b.aereosSeguidos===0);
    });
    teste('A chegada também registra quem pousa além do portal aberto',()=>{
      const e=engineTeste();e.carregarFase(15);
      e.chefe.estado='recuperando';e.ferirChefe(e.chefe.vidaMaxima);
      const t=e.mundo.jogador.transformacao;t.x=e.mundo.portalX+50;t.y=e.mundo.portalY-t.altura;e.atualizar(C.passo);
      exigir(e.estados.atual===E.FASE_CONCLUIDA);
    });
    teste('As três estrelas da trilha inicial são alcançáveis sem dano ou melhorias',()=>{
      const e=engineTeste();e.agir('jogar');const j=e.mundo.jogador;
      const saltos=[294,548,922,1224,1456,1945,2248];let proximo=0,segurar=0;
      e.entrada.pressionar(A.direita);
      for(let quadro=0;quadro<900&&e.estados.atual===E.JOGANDO;quadro++){
        if(j.corpo.noChao&&j.transformacao.x>=saltos[proximo]){
          e.entrada.pressionar(A.pular);segurar=29;proximo++;
        }
        if(segurar===0)e.entrada.soltar(A.pular);else segurar--;
        if(quadro%12===0)e.entrada.soltar(A.atacar);
        if(quadro%12===1)e.entrada.pressionar(A.atacar);
        e.atualizar(C.passo);
      }
      exigir(e.estados.atual===E.FASE_CONCLUIDA&&e.corrida.estrelas===3&&e.corrida.danos===0);
    });
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
