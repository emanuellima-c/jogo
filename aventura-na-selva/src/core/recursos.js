/** Na edição portátil o mapa contém os mesmos recursos como URLs de dados. */
function arte(nome) {
  return globalThis.AventuraPortatil?.arte[nome] ?? ('arte/cinzas/' + nome);
}

export { arte };
