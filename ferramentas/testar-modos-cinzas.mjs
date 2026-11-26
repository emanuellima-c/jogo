import assert from 'node:assert/strict';
import { novoPerfil, validar } from '../src/cinzas/perfil.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { posicionar } from '../src/cinzas/fisica.js';
import { desafioDoDia, validarRecordes, registrarProva, gravarFantasma, posicaoFantasma,
  desbloquear, cicloEmAndamento, iniciarCiclo } from '../src/cinzas/modos.js';

const dia=desafioDoDia(new Date('2026-11-19T00:00:00Z'));
assert.deepEqual(dia,desafioDoDia(new Date('2026-11-18T23:30:00-03:00')));
assert.equal(dia.chave,'2026-11-19');
assert.notEqual(dia.seed,desafioDoDia(new Date('2026-11-20T00:00:00Z')).seed);
assert([1,2,3,5,6,8,9,11,13,14].includes(dia.fase));

const perfil=novoPerfil();
assert.equal(iniciarCiclo(perfil,[]),false);
perfil.concluidas=Array.from({length:15},(_,indice)=>indice+1);
perfil.liberada=15;
perfil.chefes[15]=['gorila'];
perfil.coletas[15]=['eco-1','v:gorila'];
perfil.estrelas[15]=['s1'];
perfil.amuletos=['folha-dupla'];
perfil.atalhos[1]=['cipo'];
perfil.ecos=46;
assert(iniciarCiclo(perfil,['sem-frascos','sem-frascos','vigor-curto','desconhecido']));
assert(cicloEmAndamento(perfil));
assert.equal(iniciarCiclo(perfil,[]),false);
assert.deepEqual([perfil.ciclo,perfil.cicloAte,perfil.fase,perfil.ecos],[2,1,1,46]);
assert.deepEqual(perfil.modificadores,['sem-frascos','vigor-curto']);
assert.equal(perfil.concluidas.length,15);
assert.deepEqual(perfil.chefes[15],[]);
assert.deepEqual(perfil.coletas[15],['eco-1']);
assert.deepEqual(perfil.estrelas[15],['s1']);
assert.deepEqual(perfil.amuletos,['folha-dupla']);
assert.deepEqual(perfil.atalhos[1],['cipo']);
assert.equal(desbloquear(perfil,'novo-ciclo'),null);

for(const ms of [800,710,720,735,850,900,720,780]){
  registrarProva(perfil,dia,ms);
}
assert.deepEqual(perfil.recordes.diarios[dia.chave],[710,720,735,780,800]);
const crono={tipo:'crono',fase:1}, trilha=[];
gravarFantasma(trilha,0,30,220);
gravarFantasma(trilha,50,35,220);
gravarFantasma(trilha,150,60,200);
assert.deepEqual(trilha,[[0,30,220],[150,60,200]]);
assert.deepEqual(posicaoFantasma(trilha,75),{x:45,y:210});
assert.equal(posicaoFantasma(trilha,151),null);
assert(registrarProva(perfil,crono,900,trilha));
assert.equal(registrarProva(perfil,crono,1000,[]),false);
assert.deepEqual(validar(perfil).recordes,perfil.recordes);
assert.deepEqual(validarRecordes({cronos:{1:{ms:150,trilha:[[0,5,8],[50,'x',7],[120,20,20],[115,3,4],[151,5,6]]}}}),
  {cronos:{1:{ms:150,trilha:[[0,5,8],[120,20,20]]}},diarios:{}});

perfil.cicloAte=15;
const jogo=new Jogo(perfil);
jogo.carregar(15);
for(const inimigo of jogo.inimigos)if(inimigo.obrigatorio)jogo.derrotar(inimigo);
assert.equal(iniciarCiclo(perfil,[]),false,'Derrotar o último guardião ainda deixa o portal por atravessar.');
posicionar(jogo,jogo.heroi,jogo.fase.saida);
assert(jogo.concluir());
assert.equal(cicloEmAndamento(validar(perfil)),false);
assert(iniciarCiclo(perfil,[]));

console.log('Semente diária UTC, ranking local, fantasma, conquistas e continuidade do novo ciclo passaram.');
