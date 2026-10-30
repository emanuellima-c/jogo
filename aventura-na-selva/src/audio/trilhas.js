// Melodias originais em graus de uma escala pentatônica: nenhum áudio externo.
const BASES = [
  {bpm:116,raiz:60,melodia:[0,2,4,7,9,7,4,2,0,4,2,7,4,2,0,-1]},
  {bpm:104,raiz:57,melodia:[0,3,7,10,7,3,5,7,0,5,3,10,7,5,3,-1]},
  {bpm:126,raiz:62,melodia:[0,1,5,7,8,7,5,1,0,5,8,12,8,7,5,-1]},
  {bpm:94,raiz:65,melodia:[0,4,7,11,7,4,2,4,0,7,4,2,11,7,4,-1]},
  {bpm:144,raiz:55,melodia:[0,3,6,7,10,7,6,3,0,6,7,12,10,7,3,-1]}
];
function criarTrilha(id) {
  if(id==='menu')return {id,bpm:132,raiz:60,melodia:[0,4,7,9,12,9,7,4,2,7,9,14,12,7,4,-1],baixo:[0,0,5,7],onda:'square'};
  if(id==='loja')return {id,bpm:96,raiz:62,melodia:[0,4,7,-1,9,7,4,-1,2,5,9,-1,7,5,2,-1],baixo:[0,5,2,7],onda:'triangle'};
  const numero=Math.max(1,Math.min(15,parseInt(String(id).replace('fase',''),10)||1));
  const mundo=Math.floor((numero-1)/3),local=(numero-1)%3,b=BASES[mundo];
  const melodia=b.melodia.map((n,i)=>n<0?-1:n+(local===1&&i%4===3?12:local===2&&i%3===0?7:0));
  return {id,bpm:b.bpm+local*6,raiz:b.raiz+(local===1?2:0),melodia,baixo:[0,5,3,7],onda:mundo===3?'triangle':'square'};
}
function frequencia(nota){return 440*2**((nota-69)/12);}

export { criarTrilha, frequencia };
