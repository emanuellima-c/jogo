// Gerado a partir de src/entidades/inimigos/gerenciador.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/entidades/inimigos/gerenciador.js", function (exports, usar) {
"use strict";
const { Pool } = usar("src/core/pool.js");
const { CAMPANHA: B } = usar("src/core/configuracoes.js");
const { criarInimigoVazio, ativarInimigo } = usar("src/entidades/inimigos/fabrica.js");
class GerenciadorInimigos {
  constructor() {
    this.pool = new Pool(B.inimigosMaximos, criarInimigoVazio);
    for (let i = 0; i < this.pool.itens.length; i++) this.pool.itens[i].id = i;
  }
  criar(tipo, x, y, fase, ciclo, seed, origem = true) {
    const e = this.pool.obter();
    if (e) ativarInimigo(e, tipo, x, y, fase, ciclo, seed, origem);
    return e;
  }
  preparar(fase, perfil) {
    this.pool.limpar();
    for (let i = 0; i < fase.inimigos.length; i++) {
      const d = fase.inimigos[i]; this.criar(d.tipo, d.x, d.y, fase.numero, perfil.ciclo, fase.seed + i);
    }
  }
}

Object.defineProperty(exports, "GerenciadorInimigos", { enumerable: true, get: () => GerenciadorInimigos });
});
