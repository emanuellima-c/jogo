import { CAMPANHA as B } from '../core/configuracoes.js';
/** Buckets e resultados com capacidade fixa; cada entidade ocupa todas as células tocadas. */
class SpatialHash {
  constructor(largura, altura, capacidade = B.inimigosMaximos) {
    this.colunas = Math.ceil(largura / B.celula); this.linhas = Math.ceil(altura / B.celula) + 4;
    this.cabecas = new Int32Array(this.colunas * this.linhas);
    this.proximos = new Int32Array(capacidade * 16); this.ids = new Int32Array(capacidade * 16);
    this.marcados = new Uint32Array(capacidade); this.resultados = new Int32Array(capacidade);
    this.geracao = 0; this.quantidade = 0; this.usados = 0;
  }
  reconstruir(inimigos) {
    this.cabecas.fill(-1); this.usados = 0;
    for (let id = 0; id < inimigos.length; id++) {
      const e = inimigos[id]; if (!e.ativo) continue; const t = e.transformacao;
      const x0 = Math.max(0, Math.floor(t.x / B.celula)), x1 = Math.min(this.colunas - 1, Math.floor((t.x + t.largura) / B.celula));
      const y0 = Math.max(0, Math.floor(t.y / B.celula)), y1 = Math.min(this.linhas - 1, Math.floor((t.y + t.altura) / B.celula));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const celula = y * this.colunas + x, i = this.usados++;
        if (i >= this.ids.length) throw new Error('Capacidade do spatial hash excedida.');
        this.ids[i] = id; this.proximos[i] = this.cabecas[celula]; this.cabecas[celula] = i;
      }
    }
  }
  consultar(x, y, largura, altura) {
    this.quantidade = 0; this.geracao = (this.geracao + 1) >>> 0;
    if (!this.geracao) { this.marcados.fill(0); this.geracao = 1; }
    const x0 = Math.max(0, Math.floor(x / B.celula)), x1 = Math.min(this.colunas - 1, Math.floor((x + largura) / B.celula));
    const y0 = Math.max(0, Math.floor(y / B.celula)), y1 = Math.min(this.linhas - 1, Math.floor((y + altura) / B.celula));
    for (let linha = y0; linha <= y1; linha++) for (let coluna = x0; coluna <= x1; coluna++) {
      for (let i = this.cabecas[linha * this.colunas + coluna]; i !== -1; i = this.proximos[i]) {
        const id = this.ids[i];
        if (this.marcados[id] === this.geracao) continue;
        this.marcados[id] = this.geracao; this.resultados[this.quantidade++] = id;
      }
    }
    return this.quantidade;
  }
}

export { SpatialHash };
