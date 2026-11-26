import { ESTADOS as E } from './configuracoes.js';
const TRANSICOES={
  [E.MENU]:[E.JOGANDO,E.MAPA,E.PERSONAGEM,E.DESAFIOS,E.OPCOES,E.AJUDA,E.SAIU],
  [E.JOGANDO]:[E.PAUSADO,E.FASE_CONCLUIDA,E.FIM_DE_JOGO,E.LOJA,E.VITORIA],
  [E.PAUSADO]:[E.JOGANDO,E.MENU,E.OPCOES],
  [E.LOJA]:[E.JOGANDO,E.PUZZLE,E.MENU,E.OPCOES],
  [E.PUZZLE]:[E.LOJA,E.MENU],
  [E.FASE_CONCLUIDA]:[E.JOGANDO,E.VITORIA,E.MENU],
  [E.FIM_DE_JOGO]:[E.JOGANDO,E.MENU],
  [E.VITORIA]:[E.JOGANDO,E.MAPA,E.PERSONAGEM,E.MENU],
  [E.MAPA]:[E.JOGANDO,E.MENU],
  [E.PERSONAGEM]:[E.MENU], [E.DESAFIOS]:[E.MENU],
  [E.OPCOES]:[E.MENU,E.PAUSADO,E.LOJA], [E.AJUDA]:[E.MENU], [E.SAIU]:[E.MENU]
};
class MaquinaEstados {
  constructor(eventos){this.atual=E.MENU;this.eventos=eventos;}
  mudar(proximo){if(!TRANSICOES[this.atual]?.includes(proximo))return false;this.atual=proximo;this.eventos.emitir('estadoAlterado',proximo);return true;}
}

export { MaquinaEstados };
