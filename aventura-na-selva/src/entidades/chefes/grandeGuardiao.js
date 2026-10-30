import { criarJogador } from '../jogador.js';
import { CHEFES } from '../../dados/inimigos.js';
import { CONFIG as C, CAMPANHA as B } from '../../core/configuracoes.js';
import { resolverX, resolverY } from '../../ecs/sistemas/colisao.js';

class Seletor {
  constructor(filhos) { this.filhos = filhos; }
  executar(contexto) {
    for (let i = 0; i < this.filhos.length; i++) {
      const resultado = this.filhos[i].executar(contexto);
      if (resultado) return resultado;
    }
    return null;
  }
}
class Ramo {
  constructor(condicao, acao) { this.condicao = condicao; this.acao = acao; }
  executar(contexto) { return this.condicao(contexto) ? this.acao(contexto) : null; }
}
// Árvore de comportamento: ataques desbloqueados por fase de vida e distância.
const ARVORE = new Seletor([
  new Ramo(b => b.fase >= 2 && b.distancia < 100 && b.dados.ataques.indexOf('salto') >= 0 && b.dados.ataques.indexOf('salto') < b.fase, () => 'salto'),
  new Ramo(b => b.fase === 3 && b.contador % 4 === 3, b => b.dados.ataques[2]),
  new Ramo(() => true, b => b.dados.ataques[b.contador % b.fase])
]);
function criarChefe(mundo, perfil) {
  if (!mundo.fase.chefe) return null;
  const b = criarJogador(mundo.largura - 320, 448 - 86);
  b.tipo = 'chefe'; b.transformacao.largura = 92; b.transformacao.altura = 86;
  Object.assign(b, { ativo: true, dados: CHEFES[mundo.fase.mundo], vida: 0, vidaMaxima: 0,
    estado: 'dormindo', fase: 1, espera: 1, ataqueAtual: 'tiros', contador: 0, distancia: 0,
    invulneravel: 0, ultimoGolpe: -1, alvoX: 0, direcaoAtaque: -1, avisoFase: 1 });
  b.vida = b.vidaMaxima = Math.round((B.vidaChefe + mundo.fase.mundo * B.vidaPorMundo) * (1 + (perfil.ciclo - 1) * .3));
  b.corpo.noChao = true;
  return b;
}
function preparar(b, engine) {
  const p = engine.mundo.jogador.transformacao;
  b.distancia = Math.abs(p.x - b.transformacao.x);
  b.ataqueAtual = ARVORE.executar(b); b.estado = 'aviso';
  b.espera = Math.max(.65, B.avisoChefe - (b.fase - 1) * .1);
  b.alvoX = Math.max(340, Math.min(engine.mundo.largura - 180, p.x));
  b.direcaoAtaque = p.x < b.transformacao.x ? -1 : 1;
  b.controle.direcao = b.direcaoAtaque; b.corpo.vx = 0;
}
function executarAtaque(b, engine) {
  const t = b.transformacao, centroX = t.x + t.largura / 2;
  b.contador++;
  if (b.ataqueAtual === 'tiros') {
    const quantidade = b.fase + 1;
    for (let i = 0; i < quantidade; i++) engine.tiroMirado(centroX, t.y + 28, b.dados.tipo === 'aranha' ? 'teia' : 'coco', 245 + b.fase * 25, (i - (quantidade - 1) / 2) * .16);
    b.estado = 'recuperando'; b.espera = B.recuperacaoChefe;
  } else if (b.ataqueAtual === 'chuva') {
    for (let i = -b.fase; i <= b.fase; i++) {
      const x = Math.max(350, Math.min(engine.mundo.largura - 100, b.alvoX + i * 100));
      engine.projeteis.atirar(x, -20, 0, 40, 'pedra', true, 1, 900, .85 + Math.abs(i) * .12);
    }
    b.estado = 'recuperando'; b.espera = 1.5;
  } else if (b.ataqueAtual === 'invocar') {
    let vivos = 0;
    for (let i = 0; i < engine.inimigos.pool.itens.length; i++) if (engine.inimigos.pool.itens[i].ativo) vivos++;
    for (let i = 0; i < Math.max(0, Math.min(b.fase + 1, 5 - vivos)); i++)
      engine.inimigos.criar(i % 2 ? 'macaco' : 'besouro', t.x - 90 - i * 75, i % 2 ? 448 : 280, engine.mundo.fase.numero, engine.perfil.ciclo, b.contador + i, false);
    b.estado = 'recuperando'; b.espera = 1.8;
  } else if (b.ataqueAtual === 'investida') {
    b.estado = 'investida'; b.espera = .7; b.corpo.vx = b.direcaoAtaque * (330 + b.fase * 25);
  } else {
    b.estado = 'saltando'; b.corpo.vy = -700;
    b.corpo.vx = b.ataqueAtual === 'tremor' ? 0 : (b.alvoX - t.x) / .7;
    b.corpo.vx = Math.max(-430, Math.min(430, b.corpo.vx)); b.corpo.noChao = false;
  }
  engine.som('chefe');
}
function atualizarChefe(engine, dt) {
  const b = engine.chefe; if (!b?.ativo) return;
  const t = b.transformacao, m = engine.mundo;
  t.anteriorX = t.x; t.anteriorY = t.y;
  b.invulneravel = Math.max(0, b.invulneravel - dt);
  b.fase = b.vida / b.vidaMaxima > .66 ? 1 : b.vida / b.vidaMaxima > .33 ? 2 : 3;
  if (b.fase !== b.avisoFase) { b.avisoFase = b.fase; engine.notificar(b.dados.nome + ' · FASE ' + b.fase, '#ffb56f'); }
  if (b.estado === 'dormindo') {
    if (m.jogador.transformacao.x > 300) { preparar(b, engine); engine.notificar(b.dados.nome, '#ffce70'); }
    return;
  }
  b.espera -= dt * engine.atributos.ritmoInimigo;
  if (b.estado === 'aviso') { if (b.espera <= 0) executarAtaque(b, engine); }
  else if (b.estado === 'recuperando') { b.corpo.vx = 0; if (b.espera <= 0) preparar(b, engine); }
  else if (b.estado === 'investida') {
    if (b.espera <= 0) { b.estado = 'recuperando'; b.espera = 1; b.corpo.vx = 0; }
  }
  const estava = b.corpo.noChao;
  b.corpo.vy = Math.min(C.quedaMaxima, b.corpo.vy + C.gravidade * dt);
  t.x += b.corpo.vx * dt; resolverX(b, m);
  t.x = Math.max(340, Math.min(m.largura - 150, t.x));
  b.corpo.noChao = false; t.y += b.corpo.vy * dt; resolverY(b, m);
  if (b.estado === 'saltando' && b.corpo.noChao && !estava) {
    b.estado = 'recuperando'; b.espera = 1.1; b.corpo.vx = 0;
    engine.camera.abalar(); engine.particulas.emitir(b, 18);
    for (let direcao = -1; direcao <= 1; direcao += 2)
      engine.projeteis.atirar(t.x + t.largura / 2, 437, direcao * (250 + b.fase * 40), 0, 'tremor');
    if (b.fase === 3 && b.ataqueAtual === 'tremor') {
      engine.projeteis.atirar(m.jogador.transformacao.x + 12, -30, 0, 0, 'pedra', true, 1, 1000, 1);
    }
  }
  // A arena fecha durante o combate, mas permite respawn fora dela.
  if (m.jogador.transformacao.x > 300 && m.jogador.transformacao.x < 322) m.jogador.transformacao.x = 322;
}

export { criarChefe, atualizarChefe };
