// Gerado a partir de src/ecs/sistemas/combate.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/sistemas/combate.js", function (exports, usar) {
"use strict";
const { ACOES: A, CAMPANHA: B } = usar("src/core/configuracoes.js");
const { sobrepoe } = usar("src/ecs/sistemas/colisao.js");
/** A caixa do golpe é reutilizada. Cada inimigo recebe o mesmo golpe uma vez. */
class SistemaCombate {
  constructor() { this.caixa = { x: 0, y: 0, largura: 0, altura: 0 }; }
  atualizarJogador(engine, dt) {
    const j = engine.mundo.jogador, c = j.combate, a = engine.atributos, t = j.transformacao;
    c.esperaAtaque = Math.max(0, c.esperaAtaque - dt); c.ataque = Math.max(0, c.ataque - dt);
    c.esperaDash = Math.max(0, c.esperaDash - dt); c.dash = Math.max(0, c.dash - dt);
    if (!c.escudo && a.recargaEscudo) {
      c.esperaEscudo -= dt;
      if (c.esperaEscudo <= 0) { c.escudo = true; engine.notificar('Escudo recarregado', '#83caff'); }
    }
    if (engine.entrada.consumir(A.dash) && a.podeDash && c.esperaDash === 0) {
      c.dash = B.duracaoDash; c.ataque = 0; c.esperaDash = a.recargaDash; c.numeroGolpe++;
      engine.corrida.esquivas++; engine.som('dash');
    }
    if (c.dash > 0) {
      j.corpo.vx = j.controle.direcao * B.velocidadeDash;
      if (c.dash > B.duracaoDash / 2) j.corpo.vy = 0;
    }
    if (engine.entrada.ativa(A.atacar) && c.esperaAtaque === 0 && c.dash === 0) {
      c.ataque = B.duracaoAtaque; c.esperaAtaque = a.intervaloAtaque; c.numeroGolpe++; engine.som('ataque');
      if (a.onda) {
        const dano = engine.danoAtual() * (.45 + Math.min(2, a.onda * .15));
        engine.projeteis.atirar(t.x + t.largura / 2 + j.controle.direcao * 24, t.y + 17,
          j.controle.direcao * B.velocidadeOnda, 0, 'onda', false, dano, 0, 0, Math.floor(a.onda / 3));
      }
    }
  }
  resolverGolpes(engine) {
    const j = engine.mundo.jogador, c = j.combate, a = engine.atributos, t = j.transformacao;
    if (c.ataque > 0 || c.dash > 0 && a.sombra) {
      const caixa = this.caixa, direcao = j.controle.direcao;
      caixa.x = direcao > 0 ? t.x : t.x - a.alcance; caixa.y = t.y - 7;
      caixa.largura = t.largura + a.alcance; caixa.altura = t.altura + 14;
      engine.hash.consultar(caixa.x, caixa.y, caixa.largura, caixa.altura);
      for (let k = 0; k < engine.hash.quantidade; k++) {
        const e = engine.inimigos.pool.itens[engine.hash.resultados[k]];
        if (!e.ativo || e.ultimoGolpe === c.numeroGolpe || !sobrepoe(caixa, e.transformacao)) continue;
        e.ultimoGolpe = c.numeroGolpe;
        const dano = engine.danoAtual() * (c.dash > 0 ? .7 + a.sombra * .3 : 1);
        engine.ferirInimigo(e, dano, t.x, true);
      }
      const b = engine.chefe;
      if (b?.ativo && b.ultimoGolpe !== c.numeroGolpe && sobrepoe(caixa, b.transformacao)) {
        b.ultimoGolpe = c.numeroGolpe; engine.ferirChefe(engine.danoAtual()); engine.processarAcerto();
      }
    }
    // Stomp usa a base do quadro anterior para distinguir cima e lateral.
    engine.hash.consultar(t.x - 5, t.y - 10, t.largura + 10, t.altura + 20);
    for (let k = 0; k < engine.hash.quantidade; k++) {
      const e = engine.inimigos.pool.itens[engine.hash.resultados[k]], et = e.transformacao;
      if (!e.ativo || e.estado === 'submerso' || !sobrepoe(t, et)) continue;
      if (e.dados.pisa && j.corpo.vy > 0 && t.anteriorY + t.altura <= et.anteriorY + 16) {
        engine.ferirInimigo(e, e.vidaMaxima * 2, t.x, true); j.corpo.vy = -B.quique;
        t.y = et.y - t.altura; j.controle.coyote = 0;
      } else engine.ferirJogador('inimigo', e);
    }
    const b = engine.chefe;
    if (b?.ativo && b.estado !== 'dormindo' && sobrepoe(t, b.transformacao)) {
      if (j.corpo.vy > 0 && t.anteriorY + t.altura <= b.transformacao.anteriorY + 20) {
        engine.ferirChefe(engine.danoAtual() * 1.8); j.corpo.vy = -B.quique; t.y = b.transformacao.y - t.altura;
      } else engine.ferirJogador('chefe');
    }
  }
}

Object.defineProperty(exports, "SistemaCombate", { enumerable: true, get: () => SistemaCombate });
});
