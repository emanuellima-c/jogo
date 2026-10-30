import { Aleatorio } from '../core/aleatorio.js';
const PROVAS = {
  duplo: { nome: 'Passos do Céu', habilidade: 'Pulo duplo', tipo: 'sequencia', fase: 1, dificuldade: 1, descricao: 'Memorize e repita quatro símbolos luminosos.' },
  dash: { nome: 'Ecos do Vento', habilidade: 'Dash', tipo: 'memoria', fase: 3, dificuldade: 2, descricao: 'Encontre quatro pares sem deixar as cartas confundirem você.' },
  planar: { nome: 'Mapa das Correntes', habilidade: 'Planar', tipo: 'pecas', fase: 6, dificuldade: 3, descricao: 'Reconstrua o mapa com seis peças. Arraste ou selecione e toque no destino.' }
};
const SIMBOLOS = ['☀', '▲', '◆', '☾', '✿', 'ϟ'];
/** Estado puro dos puzzles: nenhuma dependência de DOM, áudio ou relógio real. */
class Puzzle {
  constructor(id, seed, tentativa = 0) {
    if (!PROVAS[id]) throw new Error('Prova desconhecida.');
    this.id = id; this.dados = PROVAS[id]; this.rng = new Aleatorio(seed + tentativa * 97);
    this.tentativa = tentativa; this.versao = 1; this.status = 'jogando'; this.feedback = '';
    this.recompensado = false; this.tempo = 0; this.cursor = 0; this.luz = -1; this.selecionada = -1;
    this.espera = 0; this.erros = 0; this.abertas = []; this.encontradas = []; this.encaixadas = [];
    if (this.dados.tipo === 'sequencia') {
      this.sequencia = Array.from({length: 4}, () => Math.floor(this.rng.proximo() * 4));
      this.status = 'observando'; this.feedback = 'Observe. Os símbolos vão acender um por vez.';
    } else if (this.dados.tipo === 'memoria') {
      this.cartas = this.embaralhar([0,1,2,3,0,1,2,3]); this.encontradas = Array(8).fill(false);
      this.feedback = 'Abra duas cartas e procure os quatro pares.';
    } else {
      this.ordem = this.embaralhar([0,1,2,3,4,5]); this.encaixadas = Array(6).fill(false);
      this.feedback = 'Compare com o mapa. Arraste as peças ou toque numa peça e no espaço.';
    }
  }
  embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) { const j = Math.floor(this.rng.proximo() * (i + 1)); [lista[i],lista[j]] = [lista[j],lista[i]]; }
    return lista;
  }
  atualizar(dt) {
    if (this.status === 'observando') {
      this.tempo += dt;
      const indice = Math.floor(Math.max(0, this.tempo - .5) / .85);
      const luz = this.tempo >= .5 && indice < this.sequencia.length && (this.tempo - .5) % .85 < .58 ? this.sequencia[indice] : -1;
      if (luz !== this.luz) { this.luz = luz; this.versao++; }
      if (this.tempo >= .5 + this.sequencia.length * .85) { this.status = 'jogando'; this.luz = -1; this.feedback = 'Sua vez! Repita a sequência.'; this.versao++; }
    }
    if (this.espera > 0) {
      this.espera = Math.max(0, this.espera - dt);
      if (this.espera < .00001) { this.espera = 0; this.abertas.length = 0; this.versao++; }
    }
  }
  simbolo(indice) {
    if (this.dados.tipo !== 'sequencia' || this.status !== 'jogando') return false;
    if (indice !== this.sequencia[this.cursor]) {
      this.erros++; this.status = 'erro'; this.feedback = 'Esse símbolo saiu da ordem. Tente novamente: não custa moedas.'; this.versao++; return false;
    }
    this.cursor++; this.feedback = 'Certo! ' + this.cursor + '/' + this.sequencia.length; this.versao++;
    if (this.cursor === this.sequencia.length) this.vencer();
    return true;
  }
  carta(indice) {
    if (this.dados.tipo !== 'memoria' || this.status !== 'jogando' || this.espera || !Number.isInteger(indice) || indice < 0 || indice >= this.cartas.length || this.encontradas[indice] || this.abertas.includes(indice)) return false;
    this.abertas.push(indice); this.versao++;
    if (this.abertas.length === 2) {
      const [a,b] = this.abertas;
      if (this.cartas[a] === this.cartas[b]) { this.encontradas[a] = this.encontradas[b] = true; this.feedback = 'Par encontrado!'; this.abertas.length = 0; if (this.encontradas.every(Boolean)) this.vencer(); }
      else { this.erros++; this.espera = .85; this.feedback = 'São diferentes. Observe e tente outro par.'; }
    }
    return true;
  }
  selecionar(indice) {
    if (this.dados.tipo !== 'pecas' || this.status !== 'jogando' || !Number.isInteger(indice) || indice < 0 || indice >= 6 || this.encaixadas[indice]) return false;
    this.selecionada = indice; this.feedback = 'Peça selecionada. Escolha um espaço no mapa.'; this.versao++; return true;
  }
  encaixar(peca, destino) {
    if (this.dados.tipo !== 'pecas' || this.status !== 'jogando' || !Number.isInteger(peca) || !Number.isInteger(destino) || peca < 0 || peca >= 6 || destino < 0 || destino >= 6 || this.encaixadas[peca] || this.encaixadas[destino]) return false;
    if (peca !== destino) { this.erros++; this.feedback = 'A paisagem ainda não se encaixa. Compare com a referência.'; this.versao++; return false; }
    this.encaixadas[peca] = true; this.selecionada = -1; this.feedback = 'Encaixe perfeito!'; this.versao++;
    if (this.encaixadas.every(Boolean)) this.vencer();
    return true;
  }
  vencer() { this.status = 'vitoria'; this.feedback = 'Você entendeu o caminho! Habilidade aprendida para sempre.'; this.versao++; }
}

export { PROVAS, SIMBOLOS, Puzzle };
