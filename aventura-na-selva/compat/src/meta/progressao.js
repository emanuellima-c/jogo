// Gerado a partir de src/meta/progressao.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/meta/progressao.js", function (exports, usar) {
"use strict";
const { PODERES, PODER_POR_ID, RARIDADES } = usar("src/dados/poderes.js");
const { Aleatorio } = usar("src/core/aleatorio.js");
function criarPerfil() {
  return {
    versao: 3, nivel: 1, xp: 0, poderes: {}, fase: 1, ciclo: 1, seed: 20261030,
    concluidas: Array(15).fill(false), desafios: Array(15).fill(0), estrelas: Array(15).fill(0),
    tempos: Array(15).fill(0), pendente: null, presentes: [], descanso: null, moedas: 0, iniciada: false, legado: false,
    aprendidas: { duplo:false, dash:false, planar:false }, melhorias: { pulo:0, velocidade:0, resistencia:0 },
    consumiveis: { escudo:false, ima:0 }, recorde: 0, ranking: [],
    totais: { mortes: 0, inimigos: 0, moedas: 0, chefes: 0, fases: 0 },
    opcoes: { som: true, volume:.65, movimento: true, modo: 'normal' }
  };
}
function xpNecessario(nivel) { return 70 + nivel * 35 + nivel * nivel * 8; }
/** XP transborda entre níveis; poderes são independentes do nível do personagem. */
function ganharXP(perfil, quantidade) {
  perfil.xp += Math.max(0, Math.floor(quantidade));
  let niveis = 0;
  while (perfil.nivel < 99 && perfil.xp >= xpNecessario(perfil.nivel)) {
    perfil.xp -= xpNecessario(perfil.nivel); perfil.nivel++; niveis++;
  }
  if (perfil.nivel === 99) perfil.xp = Math.min(perfil.xp, xpNecessario(99) - 1);
  return niveis;
}
function estatisticas(perfil) {
  const p = perfil.poderes, n = id => p[id] || 0, modo = perfil.opcoes.modo, m = perfil.melhorias || {}, aprendidas = perfil.aprendidas || {};
  return {
    coracoes: modo === 'desafio' ? 1 : Math.min(10, (modo === 'relaxado' ? 5 : 3) + n('vigor') + (m.resistencia || 0) + Math.floor((perfil.nivel - 1) / 5)),
    dano: 16 * (1 + (perfil.nivel - 1) * .07 + n('forca') * .15),
    velocidade: Math.min(375, 278 * (1 + n('botas') * .035 + (m.velocidade || 0) * .03)),
    impulso: Math.min(760, 650 * (1 + n('impulso') * .025 + (m.pulo || 0) * .025)),
    alcance: Math.min(170, 54 + n('alcance') * 8), ima: Math.min(300, 42 + n('alcance') * 22),
    intervaloAtaque: Math.max(.17, .42 / (1 + n('ritmo') * .1)),
    critico: Math.min(.6, .03 + n('critico') * .08),
    saltosExtras: aprendidas.duplo || perfil.legado && n('duplo') ? Math.max(1, Math.min(2, Math.ceil(n('duplo') / 3))) : 0,
    podeDash: !!(aprendidas.dash || perfil.legado), podePlanar: !!aprendidas.planar,
    protecao: Math.min(3.5,1.5 + (m.resistencia || 0) * .12),
    recargaEscudo: n('escudo') ? Math.max(6, 18 / (1 + n('escudo') * .14)) : 0,
    seiva: n('sangue') ? Math.max(2, 8 - n('sangue')) : 0,
    onda: n('onda'), espinhos: n('espinhos'), sombra: n('sombra'),
    recargaDash: Math.max(1.3, 3.2 / (1 + n('sombra') * .15)),
    fenix: n('fenix') ? 1 + Math.floor((n('fenix') - 1) / 4) : 0,
    tempestade: n('tempestade'), furia: n('furia'),
    ritmoInimigo: modo === 'relaxado' ? .75 : modo === 'desafio' ? 1.12 : 1,
    bonusXP: modo === 'desafio' ? 1.25 : 1
  };
}
/** Três IDs distintos; chefes garantem ao menos uma opção épica ou lendária. */
function sortearPoderes(perfil, fase) {
  const rng = new Aleatorio(perfil.seed ^ Math.imul(fase, 73856093) ^ Math.imul(perfil.ciclo, 19349663));
  const escolhidos = [], disponiveis = PODERES.filter(p => (p.id !== 'duplo' || perfil.aprendidas?.duplo || perfil.legado) && (p.id !== 'sombra' || perfil.aprendidas?.dash || perfil.legado));
  for (let i = 0; i < 3; i++) {
    let candidatas = disponiveis;
    if (i === 0 && fase % 3 === 0) candidatas = disponiveis.filter(p => p.raridade === 'epica' || p.raridade === 'lendaria');
    else if (rng.proximo() < .4) {
      const repetidas = disponiveis.filter(p => perfil.poderes[p.id]);
      if (repetidas.length) candidatas = repetidas;
    }
    let total = 0;
    for (const p of candidatas) total += RARIDADES[p.raridade].peso;
    let sorteio = rng.proximo() * total, escolhido = candidatas[candidatas.length - 1];
    for (const p of candidatas) { sorteio -= RARIDADES[p.raridade].peso; if (sorteio < 0) { escolhido = p; break; } }
    escolhidos.push(escolhido.id); disponiveis.splice(disponiveis.indexOf(escolhido), 1);
  }
  return escolhidos;
}
function escolherPoder(perfil, id) {
  if (!PODER_POR_ID[id] || !perfil.pendente?.opcoes.includes(id)) return false;
  perfil.poderes[id] = (perfil.poderes[id] || 0) + 1;
  perfil.pendente = null;
  return true;
}
function novaExpedicao(perfil) {
  perfil.ciclo++; perfil.fase = 1; perfil.descanso = null;
  perfil.concluidas.fill(false); perfil.desafios.fill(0); perfil.estrelas.fill(0); perfil.tempos.fill(0);
}

Object.defineProperty(exports, "criarPerfil", { enumerable: true, get: () => criarPerfil });
Object.defineProperty(exports, "xpNecessario", { enumerable: true, get: () => xpNecessario });
Object.defineProperty(exports, "ganharXP", { enumerable: true, get: () => ganharXP });
Object.defineProperty(exports, "estatisticas", { enumerable: true, get: () => estatisticas });
Object.defineProperty(exports, "sortearPoderes", { enumerable: true, get: () => sortearPoderes });
Object.defineProperty(exports, "escolherPoder", { enumerable: true, get: () => escolherPoder });
Object.defineProperty(exports, "novaExpedicao", { enumerable: true, get: () => novaExpedicao });
});
