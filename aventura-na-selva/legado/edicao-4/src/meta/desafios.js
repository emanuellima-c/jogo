const TIPOS = {
  limpo: { nome: 'Intocável', texto: 'Conclua sem sofrer dano.', validar: r => r.danos === 0 },
  estrelas: { nome: 'Explorador', texto: 'Encontre as 3 Estrelas da Selva.', validar: r => r.estrelas === 3 },
  tempo: { nome: 'Passos ligeiros', texto: 'Conclua dentro do tempo-alvo.', validar: (r, f) => r.tempo <= f.tempoAlvo },
  cacador: { nome: 'Guardião da trilha', texto: 'Derrote todos os inimigos da fase.', validar: (r, f) => r.eliminados >= f.inimigos.length && r.chefeVencido },
  moedas: { nome: 'Tesouro verde', texto: 'Colete pelo menos 80% das moedas.', validar: (r, f) => r.moedas >= Math.ceil(f.totalMoedas * .8) },
  quedas: { nome: 'Pés firmes', texto: 'Chegue ao portal sem cair.', validar: r => r.quedas === 0 }
};
function desafiosDaFase(fase) { return fase.desafios.map(id => TIPOS[id]); }
function avaliarDesafios(perfil, fase, corrida) {
  let mascara = perfil.desafios[fase.numero - 1], novos = 0;
  const resultados = desafiosDaFase(fase).map((d, i) => {
    const cumprido = d.validar(corrida, fase), novo = cumprido && !(mascara & (1 << i));
    if (novo) { mascara |= 1 << i; novos++; }
    return { nome: d.nome, texto: d.texto, cumprido, novo };
  });
  perfil.desafios[fase.numero - 1] = mascara;
  return { resultados, xp: novos * (40 + fase.numero * 5), novos };
}
function notaDaFase(corrida, fase) {
  const valor = corrida.estrelas * 2 + Number(corrida.danos === 0) * 2 + Number(corrida.tempo <= fase.tempoAlvo) * 2;
  return valor >= 9 ? 'S' : valor >= 6 ? 'A' : valor >= 3 ? 'B' : 'C';
}

export { desafiosDaFase, avaliarDesafios, notaDaFase };
