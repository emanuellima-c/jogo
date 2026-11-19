// Gerado a partir de src/render/gerarSprites.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/gerarSprites.js", function (exports, usar) {
"use strict";
const { CAMPANHA: B, CONFIG: C, ESTADOS: E } = usar("src/core/configuracoes.js");
const { ATLAS_HEROI, RETRATO_HEROI } = usar("src/dados/arteHeroi.js");
const ATLAS = Object.freeze({ largura: 48, altura: 64, colunas: 4, quadros: 16, pe: 60, escala: 1 });
const QUADROS = Object.freeze({
  parado: 0, piscando: 1, primeiroPasso: 2, passos: 4,
  pulando: 6, caindo: 7, primeiroGolpe: 8, pogo: 11,
  dano: 12, dash: 13, planando: 14, vitoria: 15
});

function carregarImagem(url, nome) {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => rejeitar(new Error('Falha ao carregar ' + nome + '.'));
    imagem.src = url;
  });
}

async function carregarArteHeroi() {
  const [atlas, retrato, criaturas, ...paisagens] = await Promise.all([
    carregarImagem(ATLAS_HEROI, 'os sprites do protagonista'),
    carregarImagem(RETRATO_HEROI, 'o retrato do protagonista'),
    carregarImagem('arte/criaturas.png','os sprites das criaturas'),
    ...['mundo-01','mundo-02','mundo-03','mundo-04','mundo-05','descanso'].map(nome=>carregarImagem('arte/'+nome+'.webp','a paisagem '+nome))
  ]);
  if (atlas.naturalWidth !== ATLAS.largura * ATLAS.colunas ||
      atlas.naturalHeight !== ATLAS.altura * Math.ceil(ATLAS.quadros / ATLAS.colunas)) {
    throw new Error('A folha de sprites do protagonista tem dimensões inesperadas.');
  }
  return { atlas, retrato, criaturas, paisagens };
}

function quadroMovimento(jogador) {
  const c = jogador.corpo, tempo = jogador.animacao.tempo;
  if (!c.noChao) return c.vy < 0 ? QUADROS.pulando : QUADROS.caindo;
  if (Math.abs(c.vx) > C.animacaoVelocidadeMinima) {
    return QUADROS.primeiroPasso + Math.floor(tempo * C.animacaoFrequencia) % QUADROS.passos;
  }
  const piscou = tempo % C.intervaloPiscada >= C.intervaloPiscada - C.duracaoPiscada;
  return piscou ? QUADROS.piscando : QUADROS.parado;
}

function quadroDoHeroi(jogador, estado) {
  const combate = jogador.combate;
  if (estado === E.FASE_CONCLUIDA || estado === E.VITORIA) return QUADROS.vitoria;
  if (jogador.animacao.flash > 0) return QUADROS.dano;
  if (combate.dash > 0) return QUADROS.dash;
  if (combate.ataque > 0) {
    if (combate.tipoAtaque === 'pogo') return QUADROS.pogo;
    const golpe = Math.max(1, Math.min(B.golpesCombo, combate.golpeCombo));
    return QUADROS.primeiroGolpe + golpe - 1;
  }
  return jogador.planando ? QUADROS.planando : quadroMovimento(jogador);
}

function desenharSpriteHeroi(ctx, atlas, quadro) {
  const { largura, altura, colunas, pe, escala } = ATLAS;
  ctx.drawImage(atlas, quadro % colunas * largura, Math.floor(quadro / colunas) * altura, largura, altura,
    -largura * escala / 2, -pe * escala, largura * escala, altura * escala);
}

Object.defineProperty(exports, "ATLAS", { enumerable: true, get: () => ATLAS });
Object.defineProperty(exports, "QUADROS", { enumerable: true, get: () => QUADROS });
Object.defineProperty(exports, "carregarArteHeroi", { enumerable: true, get: () => carregarArteHeroi });
Object.defineProperty(exports, "quadroDoHeroi", { enumerable: true, get: () => quadroDoHeroi });
Object.defineProperty(exports, "desenharSpriteHeroi", { enumerable: true, get: () => desenharSpriteHeroi });
});
