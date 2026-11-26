/** Capacidade fixa: se estiver cheio, descarta o efeito em vez de alocar durante o jogo. */
class Pool {
  constructor(capacidade, fabrica) {
    this.itens = Array.from({ length: capacidade }, fabrica);
    this.cursor = 0;
  }
  obter() {
    for (let i = 0; i < this.itens.length; i++) {
      const indice = (this.cursor + i) % this.itens.length;
      const item = this.itens[indice];
      if (!item.ativo) {
        item.ativo = true;
        this.cursor = (indice + 1) % this.itens.length;
        return item;
      }
    }
    return null;
  }
  limpar() {
    for (let i = 0; i < this.itens.length; i++) this.itens[i].ativo = false;
    this.cursor = 0;
  }
}

export { Pool };
