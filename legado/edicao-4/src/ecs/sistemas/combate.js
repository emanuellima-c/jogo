import { ACOES as A, CAMPANHA as B, CONFIG as C } from '../../core/configuracoes.js';
import { limitarPosicaoChefe } from '../../entidades/chefes/grandeGuardiao.js';
import { cancelarAtaque } from '../../entidades/jogador.js';
import { corpo, controle, transformacao } from '../componentes.js';
import { resolverX, resolverY, sobrepoe } from './colisao.js';
import { posicionarPiranha } from './ia.js';

function veioDeCima(t, alvo, tolerancia) {
  return t.anteriorY + t.altura <= (alvo.anteriorY ?? alvo.y) + tolerancia;
}
function pisou(jogador, alvo, tolerancia) {
  return jogador.corpo.vy > 0 && veioDeCima(jogador.transformacao, alvo, tolerancia);
}
function alcancaTopo(t, alvo, alcance) {
  return veioDeCima(t, alvo, B.toleranciaPogo) && t.y < alvo.y + alvo.altura &&
    t.y + t.altura + alcance >= alvo.y && t.x < alvo.x + alvo.largura && t.x + t.largura > alvo.x;
}
function quicar(jogador, topo, impulso) {
  const t = jogador.transformacao;
  t.y = Math.min(t.y, topo - t.altura);
  jogador.corpo.vy = -impulso; jogador.corpo.noChao = false;
  jogador.controle.coyote = 0; jogador.controle.cortouPulo = true;
  jogador.planando = false;
}
function atualizarTemposDeCombate(c, dt) {
  c.esperaAtaque = Math.max(0, c.esperaAtaque - dt);
  c.esperaRepeticao = Math.max(0, c.esperaRepeticao - dt);
  c.bufferAtaque = Math.max(0, c.bufferAtaque - dt);
  c.ataque = Math.max(0, c.ataque - dt);
  c.janelaCombo = Math.max(0, c.janelaCombo - dt);
  c.esperaDash = c.esperaDash <= dt + Number.EPSILON ? 0 : c.esperaDash - dt;
  c.dash = Math.max(0, c.dash - dt);
  if (c.ataque === 0) c.tipoAtaque = '';
  if (c.janelaCombo === 0) c.golpeCombo = 0;
}
function tempoRestanteDoAtaque(alvo, ritmo) {
  if (alvo.estado === 'investida') return alvo.espera / ritmo;
  if (alvo.estado === 'saltando') return Infinity;
  if (alvo.estado !== 'ataque') return 0;
  return alvo.tipo === 'piranha' ? Infinity : alvo.espera;
}
function avancarPrevisaoCorporal(previsto, atacante, mundo, ritmo, dt, tempo) {
  const t = previsto.transformacao, c = previsto.corpo;
  if (atacante.tipo === 'piranha') return posicionarPiranha(t, atacante, atacante.idade + tempo * ritmo);
  const vx = c.vx;
  t.x += vx * dt;
  if (atacante.tipo === 'besouro') { t.y += c.vy * dt; return true; }
  resolverX(previsto, mundo);
  if (atacante.tipo === 'tatu' && vx !== 0 && c.vx === 0) return false;
  if (atacante.tipo === 'chefe') t.x = limitarPosicaoChefe(t.x, mundo);
  c.vy = Math.min(C.quedaMaxima, c.vy + C.gravidade * dt);
  c.noChao = false; t.y += c.vy * dt; resolverY(previsto, mundo);
  return atacante.estado !== 'saltando' || !c.noChao;
}

/** A caixa do golpe é reutilizada. Cada inimigo recebe o mesmo golpe uma vez. */
class SistemaCombate {
  constructor() {
    this.caixa = { x: 0, y: 0, largura: 0, altura: 0 };
    this.atorPrevisto = { transformacao: transformacao(0, 0), corpo: corpo(), controle: controle() };
  }

  atualizarJogador(engine, dt) {
    const j = engine.mundo.jogador, c = j.combate, a = engine.atributos;
    atualizarTemposDeCombate(c, dt);
    if (!c.escudo && a.recargaEscudo) {
      c.esperaEscudo -= dt;
      if (c.esperaEscudo <= 0) { c.escudo = true; engine.notificar('Escudo recarregado', '#83caff'); }
    }
    if (engine.entrada.consumir(A.dash) && a.podeDash && c.esperaDash === 0) {
      cancelarAtaque(c);
      c.dash = B.duracaoDash; c.esperaDash = a.recargaDash; c.numeroGolpe++;
      engine.corrida.esquivas++; engine.som('dash');
      this.resolverDashPerfeito(engine, dt);
    }
    if (c.dash > 0) {
      j.corpo.vx = j.controle.direcao * B.velocidadeDash;
      if (c.dash > B.duracaoDash / 2) j.corpo.vy = 0;
    } else this.atualizarAtaques(engine, j);
  }
  lerPedidoDeAtaque(entrada, j) {
    const ataque = entrada.consumir(A.atacar);
    const botaoPogo = entrada.consumir(A.pogo);
    const pogo = !j.corpo.noChao && (botaoPogo || ataque && entrada.ativa(A.abaixo));
    if (!ataque && !pogo) return;
    j.combate.pedidoPogo = pogo; j.combate.bufferAtaque = B.bufferAtaque;
  }
  atualizarAtaques(engine, j) {
    const c = j.combate, entrada = engine.entrada;
    this.lerPedidoDeAtaque(entrada, j);
    if (c.esperaAtaque > 0) return;
    if (c.bufferAtaque > 0) {
      c.bufferAtaque = 0;
      this.iniciarGolpe(engine, j, c.pedidoPogo, true);
    } else if (c.esperaRepeticao === 0 && entrada.ativa(A.atacar)) {
      this.iniciarGolpe(engine, j, false, false);
    }
  }
  iniciarGolpe(engine, j, pogo, encadear) {
    const c = j.combate, a = engine.atributos;
    if (pogo && j.corpo.noChao) return;
    if (pogo) {
      cancelarAtaque(c); c.tipoAtaque = 'pogo';
      j.corpo.vy = Math.max(j.corpo.vy, B.velocidadePogo);
      j.controle.cortouPulo = true;
    } else this.prepararCorte(j, encadear);
    const rapido = c.golpeCombo > 0 && c.golpeCombo < B.golpesCombo;
    c.ataque = rapido ? B.duracaoAtaqueRapido : B.duracaoAtaque;
    c.esperaRepeticao = a.intervaloAtaque;
    c.esperaAtaque = Math.max(c.ataque, a.intervaloAtaque * (rapido ? B.intervaloComboRapido : 1));
    c.numeroGolpe++;
    engine.som('ataque');
    if (a.onda && !pogo) this.emitirOnda(engine, j);
  }
  prepararCorte(j, encadear) {
    const c = j.combate;
    c.golpeCombo = encadear && c.golpeCombo < B.golpesCombo ? c.golpeCombo + 1 : 1;
    c.janelaCombo = B.janelaCombo;
    c.tipoAtaque = j.corpo.noChao ? 'corte' : 'aereo';
  }
  emitirOnda(engine, j) {
    const t = j.transformacao, direcao = j.controle.direcao, onda = engine.atributos.onda;
    const finalizador = j.combate.golpeCombo === B.golpesCombo;
    const dano = engine.danoAtual() * (.45 + Math.min(2, onda * .15)) * (finalizador ? B.danoComboFinal : 1);
    const p = engine.projeteis.atirar(t.x + t.largura / 2 + direcao * 24, t.y + 17,
      direcao * B.velocidadeOnda, 0, 'onda', false, dano, 0, 0, Math.floor(onda / 3));
    if (p && finalizador) p.tipoGolpe = 'finalizador';
  }
  resolverGolpes(engine) {
    const j = engine.mundo.jogador, c = j.combate;
    if (c.tipoAtaque === 'pogo') this.resolverPogo(engine, j);
    else if (c.ataque > 0 || c.dash > 0 && engine.atributos.sombra) this.resolverCorte(engine, j);
    this.resolverContatos(engine, j);
  }
  prepararCaixaCorte(j, alcance) {
    const t = j.transformacao, caixa = this.caixa, margem = B.margemAtaque;
    caixa.x = j.controle.direcao > 0 ? t.x : t.x - alcance; caixa.y = t.y - margem;
    caixa.largura = t.largura + alcance;
    caixa.altura = t.altura + 2 * margem + (j.combate.tipoAtaque === 'aereo' ? B.alcanceAereo : 0);
  }
  resolverCorte(engine, j) {
    const c = j.combate, a = engine.atributos, t = j.transformacao;
    const caixa = this.caixa;
    const finalizador = c.golpeCombo === B.golpesCombo;
    const tipoGolpe = finalizador ? 'finalizador' : '';
    const multiplicador = finalizador ? B.danoComboFinal : 1;
    const danoSombra = c.dash > 0 ? .7 + a.sombra * .3 : 1;
    this.prepararCaixaCorte(j, a.alcance);
    engine.hash.consultar(caixa.x, caixa.y, caixa.largura, caixa.altura);
    for (let k = 0; k < engine.hash.quantidade; k++) {
      const e = engine.inimigos.pool.itens[engine.hash.resultados[k]];
      if (!e.ativo || e.ultimoGolpe === c.numeroGolpe || !sobrepoe(caixa, e.transformacao)) continue;
      e.ultimoGolpe = c.numeroGolpe;
      engine.ferirInimigo(e, engine.danoAtual() * multiplicador * danoSombra, t.x, true, tipoGolpe);
    }
    this.cortarChefe(engine, c.numeroGolpe, multiplicador, tipoGolpe);
  }
  cortarChefe(engine, numeroGolpe, multiplicador, tipoGolpe) {
    const b = engine.chefe;
    if (!b?.ativo || b.ultimoGolpe === numeroGolpe || !sobrepoe(this.caixa, b.transformacao)) return;
    b.ultimoGolpe = numeroGolpe;
    if (engine.ferirChefe(engine.danoAtual() * multiplicador, tipoGolpe)) engine.processarAcerto();
  }
  resolverPogo(engine, j) {
    const t = j.transformacao;
    if (t.y <= t.anteriorY) return;
    const alcance = j.corpo.noChao ? 0 : B.alcancePogo;
    const alvo = this.alvoDoPogo(engine, t, alcance);
    const topo = this.topoDoPogo(engine.mundo, alcance, alvo?.transformacao.y ?? Infinity);
    if (topo === Infinity) return;
    quicar(j, topo, B.quiquePogo);
    j.combate.ataque = 0; j.combate.tipoAtaque = '';
    if (alvo?.transformacao.y !== topo) return;
    if (alvo === engine.chefe) {
      if (engine.ferirChefe(engine.danoAtual(), 'pogo')) engine.processarAcerto();
    } else engine.ferirInimigo(alvo, engine.danoAtual(), t.x, true, 'pogo');
  }
  alvoDoPogo(engine, t, alcance) {
    const b = engine.chefe;
    let alvo = b?.ativo && b.estado !== 'dormindo' && alcancaTopo(t, b.transformacao, alcance) ? b : null;
    engine.hash.consultar(t.x, t.y, t.largura, t.altura + alcance);
    for (let k = 0; k < engine.hash.quantidade; k++) {
      const e = engine.inimigos.pool.itens[engine.hash.resultados[k]];
      if (!e.ativo || e.estado === 'submerso' || e.transformacao.y >= (alvo?.transformacao.y ?? Infinity)) continue;
      if (alcancaTopo(t, e.transformacao, alcance)) alvo = e;
    }
    return alvo;
  }
  topoDoPogo(mundo, alcance, topo) {
    const t = mundo.jogador.transformacao;
    for (let i = 0; i < mundo.perigos.length; i++) {
      const perigo = mundo.perigos[i];
      if (perigo.tipo === 'espinhos' && perigo.y < topo && alcancaTopo(t, perigo, alcance)) topo = perigo.y;
    }
    return topo;
  }
  preverImpactoCorporal(atacante, engine, dt) {
    if (!atacante?.ativo) return Infinity;
    const mundo = engine.mundo, ritmo = engine.atributos.ritmoInimigo;
    const alvo = mundo.jogador.transformacao, origem = atacante.transformacao;
    const restante = tempoRestanteDoAtaque(atacante, ritmo);
    if (restante <= dt || sobrepoe(origem, alvo, C.folgaDano)) return Infinity;
    const previsto = this.atorPrevisto, t = previsto.transformacao, c = previsto.corpo;
    t.x = origem.x; t.y = origem.y; t.largura = origem.largura; t.altura = origem.altura;
    c.vx = atacante.corpo.vx; c.vy = atacante.corpo.vy; previsto.controle.direcao = atacante.controle.direcao;
    if (atacante.tipo === 'besouro') {
      c.vx = atacante.direcaoAtaque * B.velocidadeMergulhoBesouro; c.vy = B.quedaMergulhoBesouro;
    }
    for (let tempo = dt; tempo <= B.janelaDashPerfeito && tempo < restante; tempo += dt) {
      if (!avancarPrevisaoCorporal(previsto, atacante, mundo, ritmo, dt, tempo)) break;
      if (sobrepoe(t, alvo, C.folgaDano)) return tempo;
    }
    return Infinity;
  }
  resolverDashPerfeito(engine, dt) {
    if (dt <= 0) return;
    // A previsão usa a posição atual do jogador. O deslocamento do dash não cria a ameaça.
    let alvo = engine.chefe, projetil = null, primeiro = this.preverImpactoCorporal(alvo, engine, dt);
    const inimigos = engine.inimigos.pool.itens, projeteis = engine.projeteis.pool.itens;
    for (let i = 0; i < inimigos.length; i++) {
      const tempo = this.preverImpactoCorporal(inimigos[i], engine, dt);
      if (tempo < primeiro) { primeiro = tempo; alvo = inimigos[i]; }
    }
    for (let i = 0; i < projeteis.length; i++) {
      const tempo = engine.projeteis.preverImpacto(projeteis[i], engine.mundo, dt);
      if (tempo < primeiro) { primeiro = tempo; projetil = projeteis[i]; alvo = projetil.autor; }
    }
    if (primeiro === Infinity) return;
    if (projetil) projetil.ativo = false;
    this.aplicarDashPerfeito(engine, alvo);
  }
  aplicarDashPerfeito(engine, alvo) {
    const j = engine.mundo.jogador, c = j.combate;
    c.esperaDash = B.recargaDashPerfeito;
    alvo.estado = 'atordoado'; alvo.espera = B.atordoamentoDashPerfeito;
    alvo.atordoadoPeloDash = true; alvo.corpo.vx = 0;
    engine.som('dashPerfeito');
    engine.notificar('DASH PERFEITO!', B.corDashPerfeito);
    if (!engine.semMovimento()) {
      const t = j.transformacao;
      engine.particulas.emitirBrilho(t.x + t.largura / 2, t.y + t.altura / 2, B.particulasDashPerfeito, B.corDashPerfeito);
    }
  }
  resolverContatos(engine, j) {
    const t = j.transformacao;
    engine.hash.consultar(t.x, t.y, t.largura, t.altura);
    for (let k = 0; k < engine.hash.quantidade; k++) {
      const e = engine.inimigos.pool.itens[engine.hash.resultados[k]], et = e.transformacao;
      if (!e.ativo || e.estado === 'submerso' || !sobrepoe(t, et)) continue;
      if (e.dados.pisa && pisou(j, et, B.toleranciaPisao)) {
        engine.ferirInimigo(e, e.vidaMaxima * 2, t.x, true);
        quicar(j, et.y, B.quique);
      } else if (e.estado!=='aviso' && e.estado!=='atordoado' && e.estado!=='recuo' && sobrepoe(et,t,C.folgaDano) && engine.ferirJogador('inimigo', e)) return;
    }
    this.resolverContatoChefe(engine, j);
  }
  resolverContatoChefe(engine, j) {
    const b = engine.chefe, t = j.transformacao;
    if (!b?.ativo || b.estado === 'dormindo' || !sobrepoe(t, b.transformacao)) return;
    if (pisou(j, b.transformacao, B.toleranciaPisaoChefe)) {
      engine.ferirChefe(engine.danoAtual() * B.danoPisaoChefe,'pisao');
      quicar(j, b.transformacao.y, B.quique);
    } else if ((b.estado==='investida' || b.estado==='saltando') && sobrepoe(b.transformacao,t,C.folgaDano)) engine.ferirJogador('chefe',b);
  }
}

export { SistemaCombate };
