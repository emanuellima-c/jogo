// Gerado a partir de src/cinzas/controles-ui.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/controles-ui.js", function (exports, usar) {
"use strict";
const { COMANDOS, nomeTecla, validarOpcoesEntrada } = usar("src/cinzas/entrada.js");
function opcoesEntrada(opcoes) {
  const preferencia = validarOpcoesEntrada(opcoes);
  const teclas = COMANDOS.map(([acao, nome]) => {
    const codigos = preferencia.teclas[acao];
    const quantidade = Math.min(3, codigos.length + 1);
    const botoes = Array.from({ length:quantidade }, (_, slot) => {
      const rotulo = codigos[slot] ? nomeTecla(codigos[slot]) : '+ tecla';
      return '<button type="button" data-acao="remapear" data-id="' + acao + '" data-slot="' + slot +
        '" aria-label="' + nome + ', tecla ' + (slot + 1) + ', ' + rotulo + '" aria-describedby="ajudaTeclas estadoControles">' +
        '<kbd aria-hidden="true">' + rotulo + '</kbd></button>';
    }).join('');
    return '<div class="linha-remapeamento" role="group" aria-label="' + nome + '"><span>' + nome + '</span>' + botoes + '</div>';
  }).join('');
  const posicoes = [
    ['espalhado', 'Junto às bordas'], ['central', 'Mais ao centro'], ['canhoto', 'Direção à direita']
  ].map(([id, nome]) => '<option value="' + id + '"' + (preferencia.toquePosicao === id ? ' selected' : '') + '>' + nome + '</option>').join('');
  const marcar = chave => preferencia[chave] ? ' checked' : '';

  return '<section class="opcoes-entrada" aria-labelledby="tituloControles"><h3 id="tituloControles">Controles e acessibilidade</h3>' +
    '<div class="grade-opcoes"><div>' +
    '<label class="op-linha" for="altoContraste">Avisos de alto contraste<input id="altoContraste" data-opcao-entrada="altoContraste" type="checkbox"' + marcar('altoContraste') + '></label>' +
    '<label class="op-linha" for="assistenciaPulo">Assistência ao salto<input id="assistenciaPulo" data-opcao-entrada="assistenciaPulo" aria-describedby="ajudaSalto" type="range" min="1" max="1.6" step=".1" value="' + preferencia.assistenciaPulo + '"></label>' +
    '<p id="ajudaSalto" class="ajuda-controles">Amplia o tempo para saltar ao sair de uma borda ou antes de pousar.</p>' +
    '<label class="op-linha" for="alternarSegurar">Alternar salto, carga e guarda<input id="alternarSegurar" data-opcao-entrada="alternarSegurar" type="checkbox"' + marcar('alternarSegurar') + '></label>' +
    '<p class="ajuda-controles">Na opção alternar, pressione uma vez para segurar o salto, o Quebra-Guarda ou a guarda do cavaleiro. Pressione outra vez para soltar.</p></div><div>' +
    '<label class="op-linha" for="toqueEscala">Tamanho dos botões<input id="toqueEscala" data-opcao-entrada="toqueEscala" type="range" min="1" max="1.25" step=".05" value="' + preferencia.toqueEscala + '"></label>' +
    '<label class="op-linha" for="toquePosicao">Posição no toque<select id="toquePosicao" data-opcao-entrada="toquePosicao">' + posicoes + '</select></label>' +
    '<label class="op-linha" for="haptico">Vibração no toque<input id="haptico" data-opcao-entrada="haptico" aria-describedby="ajudaHaptico" type="checkbox"' + marcar('haptico') + '></label>' +
    '<p id="ajudaHaptico" class="ajuda-controles">A vibração depende do navegador e do aparelho.</p></div></div>' +
    '<details class="detalhes-controles"><summary>Remapear teclado</summary>' +
    '<p id="ajudaTeclas">Selecione uma ação e pressione a tecla. Esc cancela. Delete remove uma tecla extra.</p>' +
    '<p id="estadoControles" role="status"></p>' +
    '<div class="mapa-teclas">' + teclas + '</div><button type="button" data-acao="restaurarTeclas">Restaurar teclas</button></details>' +
    '<details class="detalhes-controles"><summary>Gamepad</summary><p>Use o direcional ou o analógico esquerdo. A salta, B esquiva, X dá o golpe leve e Y dá o pesado. LB e RB ativam as técnicas. Pressione o analógico direito (R3) para usar o talento da classe. LT usa o frasco, RT interage e Start pausa. Nos menus, A confirma e B volta.</p></details></section>';
}

Object.defineProperty(exports, "opcoesEntrada", { enumerable: true, get: () => opcoesEntrada });
});
