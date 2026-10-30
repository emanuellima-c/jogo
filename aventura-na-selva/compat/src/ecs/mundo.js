// Gerado a partir de src/ecs/mundo.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/ecs/mundo.js", function (exports, usar) {
"use strict";
const { CONFIG: C } = usar("src/core/configuracoes.js");
const { criarJogador } = usar("src/entidades/jogador.js");
/** Converte os dados da fase uma vez. A grade consulta somente células próximas. */
function criarMundo(fase) {
  const linhas = fase.mapa.length, colunas = fase.mapa[0].length;
  const tiles = new Uint8Array(linhas * colunas);
  let inicioX = -1, inicioY = 0, portalX = -1, portalY = 0, inicios = 0, portais = 0;
  for (let y = 0; y < linhas; y++) {
    if (fase.mapa[y].length !== colunas) throw new Error('Mapa com linhas de tamanhos diferentes.');
    for (let x = 0; x < colunas; x++) {
      const simbolo = fase.mapa[y][x];
      if (!'.#PF'.includes(simbolo)) throw new Error('Símbolo desconhecido: ' + simbolo);
      if (simbolo === '#') tiles[y * colunas + x] = 1;
      if (simbolo === 'P') { inicioX = x * C.tile; inicioY = (y + 1) * C.tile - C.alturaJogador; inicios++; }
      if (simbolo === 'F') { portalX = x * C.tile; portalY = (y + 1) * C.tile; portais++; }
    }
  }
  if (inicios !== 1 || portais !== 1) throw new Error('A fase precisa de um início P e um portal F.');
  return {
    fase, tiles, colunas, linhas, largura: colunas * C.tile, altura: linhas * C.tile,
    inicioX, inicioY, portalX, portalY, jogador: criarJogador(inicioX, inicioY), tempo: 0,
    plataformas: (fase.plataformas || []).map(p => ({ ...p, origemX: p.x, origemY: p.y, anteriorX: p.x, anteriorY: p.y, direcao: 1, acionada: false, espera: 0, vy: 0 })),
    itens: (fase.itens || []).map((p, id) => ({ ...p, id, ativo: true, origemX: p.x, origemY: p.y, largura: 18, altura: 18 })),
    checkpoints: (fase.checkpoints || []).map(p => ({ ...p, aceso: false })),
    perigos: (fase.perigos || []).map(p => ({ ...p, espera: 0 })),
    respawnX: inicioX, respawnY: inicioY,
    solido(x, y) {
      if (y < 0 || y >= linhas) return false;
      if (x < 0 || x >= colunas) return true;
      return tiles[y * colunas + x] === 1;
    }
  };
}

Object.defineProperty(exports, "criarMundo", { enumerable: true, get: () => criarMundo });
});
