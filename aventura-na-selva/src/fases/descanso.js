// Pequena praça segura: faz parte do cenário e pode ser percorrida normalmente.
function criarFaseDescanso(origem, mundo) {
  const largura=52, mapa=Array.from({length:17},(_,y)=> y>=14?'#'.repeat(largura):'.'.repeat(largura));
  mapa[13]='.'.repeat(10)+'P'+'.'.repeat(35)+'F'+'.'.repeat(5);
  return {numero:origem,mundo,nome:'Praça dos Caminhos',descanso:true,cidade:true,chefe:false,seed:9000+origem,
    mapa,plataformas:[],itens:[],inimigos:[],perigos:[],checkpoints:[],buracos:[],predios:[],desafios:[],totalMoedas:0,tempoAlvo:99999};
}

export { criarFaseDescanso };
