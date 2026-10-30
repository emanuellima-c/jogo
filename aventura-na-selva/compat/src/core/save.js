// Gerado a partir de src/core/save.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/core/save.js", function (exports, usar) {
"use strict";
const { CONFIG } = usar("src/core/configuracoes.js");
const { criarPerfil } = usar("src/meta/progressao.js");
const { PODER_POR_ID } = usar("src/dados/poderes.js");
const CHAVE = 'aventura-selva-jornada-v3';
const CHAVE_ANTIGA = 'aventura-selva-campanha-v2';
const inteiro = (v, min, max, padrao) => Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : padrao;
/** Valida campos individualmente. Saves inválidos nunca entram diretamente na simulação. */
function validarPerfil(dado) {
  const p = criarPerfil();
  if (!dado || typeof dado !== 'object' || ![2,3].includes(dado.versao)) return p;
  p.legado = dado.versao === 2 || dado.legado === true;
  p.iniciada = dado.iniciada === true || dado.versao === 2;
  p.nivel = inteiro(dado.nivel, 1, 99, 1); p.xp = inteiro(dado.xp, 0, 100000, 0);
  p.fase = inteiro(dado.fase, 1, 15, 1); p.ciclo = inteiro(dado.ciclo, 1, 999, 1);
  p.seed = inteiro(dado.seed, 1, 4294967295, p.seed); p.recorde = inteiro(dado.recorde, 0, 999999999, 0);
  for (const id in PODER_POR_ID) if (dado.poderes?.[id] > 0) p.poderes[id] = inteiro(dado.poderes[id], 1, 1000000, 1);
  for (let i = 0; i < 15; i++) {
    p.concluidas[i] = dado.concluidas?.[i] === true;
    p.desafios[i] = inteiro(dado.desafios?.[i], 0, 7, 0); p.estrelas[i] = inteiro(dado.estrelas?.[i], 0, 3, 0);
    p.tempos[i] = Number.isFinite(dado.tempos?.[i]) ? Math.max(0, Math.min(36000, dado.tempos[i])) : 0;
  }
  // Só a sequência realmente concluída desbloqueia a fase seguinte.
  let desbloqueada = 1;
  while (desbloqueada < 15 && p.concluidas[desbloqueada - 1]) desbloqueada++;
  p.fase = Math.min(p.fase, desbloqueada);
  for (const chave in p.totais) p.totais[chave] = inteiro(dado.totais?.[chave], 0, 999999999, 0);
  p.opcoes.som = dado.opcoes?.som !== false; p.opcoes.movimento = dado.opcoes?.movimento !== false;
  if (['normal', 'relaxado', 'desafio'].includes(dado.opcoes?.modo)) p.opcoes.modo = dado.opcoes.modo;
  if (Array.isArray(dado.ranking)) p.ranking = dado.ranking.filter(r => r && Number.isFinite(r.pontos) && Number.isFinite(r.tempo)).slice(0, 10).map(r => ({ pontos: inteiro(r.pontos, 0, 999999999, 0), tempo: Math.max(0, r.tempo), fase: inteiro(r.fase, 1, 15, 1), nota: ['S','A','B','C'].includes(r.nota) ? r.nota : 'C', ciclo: inteiro(r.ciclo, 1, 999, 1) }));
  p.moedas = inteiro(dado.moedas ?? dado.totais?.moedas,0,999999999,0);
  p.opcoes.volume = Number.isFinite(dado.opcoes?.volume) ? Math.max(0,Math.min(1,dado.opcoes.volume)) : .65;
  for (const id of ['pulo','velocidade','resistencia']) p.melhorias[id] = inteiro(dado.melhorias?.[id],0,100,0);
  for (const id of ['duplo','dash','planar']) p.aprendidas[id] = dado.aprendidas?.[id] === true;
  if (p.legado) { p.aprendidas.dash = true; if (p.poderes.duplo) p.aprendidas.duplo = true; }
  p.consumiveis.escudo = dado.consumiveis?.escudo === true;
  p.consumiveis.ima = inteiro(dado.consumiveis?.ima,0,120,0);
  const pendente = dado.pendente;
  function validarPresente(t) {
    if (!t || !Number.isInteger(t.fase) || t.fase < 1 || t.fase > 15 || !Array.isArray(t.opcoes)) return null;
    const ciclo = inteiro(t.ciclo,1,p.ciclo,p.ciclo);
    if (ciclo === p.ciclo && !p.concluidas[t.fase-1]) return null;
    const opcoes = [...new Set(t.opcoes)].filter(id => PODER_POR_ID[id]).slice(0,3);
    return opcoes.length === 3 ? { fase:t.fase, ciclo, opcoes } : null;
  }
  p.pendente = validarPresente(pendente);
  const vistos = new Set(p.pendente ? [p.pendente.ciclo + ':' + p.pendente.fase] : []);
  if (Array.isArray(dado.presentes)) for (const t of dado.presentes.slice(0,15000)) {
    const v = validarPresente(t), chave = v ? v.ciclo + ':' + v.fase : '';
    if (v && !vistos.has(chave)) { p.presentes.push(v); vistos.add(chave); }
  }
  const d = dado.descanso;
  if (d && Number.isInteger(d.fase) && d.fase >= 1 && d.fase <= 15 && p.concluidas[d.fase-1]) p.descanso = {fase:d.fase,proxima:Math.min(16,d.fase+1),vidas:inteiro(d.vidas,1,10,3)};
  else if (dado.versao === 2 && p.pendente) p.descanso = {fase:p.pendente.fase,proxima:p.pendente.fase+1,vidas:3};
  return p;
}
function carregarPerfil(armazenamento) {
  try {
    const texto = armazenamento?.getItem(CHAVE) || armazenamento?.getItem(CHAVE_ANTIGA);
    if (texto) return validarPerfil(JSON.parse(texto));
  } catch { /* JSON inválido ou armazenamento bloqueado: perfil limpo. */ }
  const p = criarPerfil(); p.recorde = lerRecorde(armazenamento); return p;
}
function salvarPerfil(armazenamento, perfil) {
  try { armazenamento.setItem(CHAVE, JSON.stringify(perfil)); return true; } catch { return false; }
}
// Compatibilidade com o recorde da edição M1.
function lerRecorde(armazenamento) {
  try {
    const d = JSON.parse(armazenamento.getItem(CONFIG.chaveSave));
    const v = typeof d === 'number' ? d : d?.versao === 1 ? d.recorde : 0;
    return Number.isSafeInteger(v) && v >= 0 ? v : 0;
  } catch { return 0; }
}
function salvarRecorde(armazenamento, recorde) {
  try { armazenamento.setItem(CONFIG.chaveSave, JSON.stringify({ versao: 1, recorde })); return true; } catch { return false; }
}

Object.defineProperty(exports, "validarPerfil", { enumerable: true, get: () => validarPerfil });
Object.defineProperty(exports, "carregarPerfil", { enumerable: true, get: () => carregarPerfil });
Object.defineProperty(exports, "salvarPerfil", { enumerable: true, get: () => salvarPerfil });
Object.defineProperty(exports, "lerRecorde", { enumerable: true, get: () => lerRecorde });
Object.defineProperty(exports, "salvarRecorde", { enumerable: true, get: () => salvarRecorde });
});
