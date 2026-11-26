/** Eventos síncronos; assine/desassine fora de uma emissão. Sem cópias por quadro. */
class BarramentoEventos {
  constructor() { this.ouvintes = new Map(); }
  ao(nome, funcao) {
    if (!this.ouvintes.has(nome)) this.ouvintes.set(nome, []);
    const lista = this.ouvintes.get(nome);
    lista.push(funcao);
    return () => { const i = lista.indexOf(funcao); if (i >= 0) lista.splice(i, 1); };
  }
  emitir(nome, dados) {
    const lista = this.ouvintes.get(nome);
    if (!lista) return;
    for (let i = 0; i < lista.length; i++) lista[i](dados);
  }
  limpar() { this.ouvintes.clear(); }
}

export { BarramentoEventos };
