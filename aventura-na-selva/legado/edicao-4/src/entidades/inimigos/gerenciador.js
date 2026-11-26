import { Pool } from '../../core/pool.js';
import { CAMPANHA as B } from '../../core/configuracoes.js';
import { criarInimigoVazio, ativarInimigo } from './fabrica.js';
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

export { GerenciadorInimigos };
