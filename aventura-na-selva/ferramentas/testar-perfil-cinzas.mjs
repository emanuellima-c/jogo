import assert from 'node:assert/strict';
import { Jogo } from '../src/cinzas/jogo.js';
import { centro, pe } from '../src/cinzas/fisica.js';
import { CLASSES } from '../src/cinzas/ajustes.js';
import { nivelDosAtributos } from '../src/cinzas/poder.js';
import { iniciarCiclo } from '../src/cinzas/modos.js';
import { novoPerfil, escolherClasse, validar, carregarPerfil, salvarPerfil, CHAVE, CHAVE_V6, CHAVE_V5 } from '../src/cinzas/perfil.js';

const antigo = { versao:3, iniciada:true, nivel:8, xp:46, moedas:226, fase:5, ciclo:2,
  concluidas:[true,true,true,true], estrelas:[2,3,0,1,2], aprendidas:{duplo:true,dash:true},
  poderes:{escudo:2}, melhorias:{resistencia:2}, opcoes:{som:false,volume:.4,movimento:false}, totais:{mortes:7} };
const dados=new Map([['aventura-selva-jornada-v3',JSON.stringify(antigo)]]);
const armazenamento={getItem:k=>dados.get(k)??null,setItem:(k,v)=>dados.set(k,v)};
const p=carregarPerfil(armazenamento);
assert.deepEqual([p.versao,p.classe],[7,'herdeiro']);
assert.deepEqual([nivelDosAtributos(p.atributos),p.refazerGratuito],[8,true]);
assert.deepEqual([p.fase,p.liberada,p.ecos,p.nivel,p.xp,p.mortes],[5,5,226,8,46,7]);
assert.deepEqual(p.estrelas[5],['s1','s2']);assert(p.compradas.includes('eco'));
assert.equal(p.legado.perfil.melhorias.resistencia,2);
assert(salvarPerfil(armazenamento,p));const outraAba=carregarPerfil(armazenamento);
p.ecos=0;p.mancha={fase:5,x:103.5,y:168,valor:226};
assert(salvarPerfil(armazenamento,p));assert(!salvarPerfil(armazenamento,outraAba));
const apos=carregarPerfil(armazenamento);assert.deepEqual([apos.ecos,apos.mancha.valor],[0,226]);
apos.ecos+=apos.mancha.valor;apos.mancha=null;assert(salvarPerfil(armazenamento,apos));
assert.deepEqual([carregarPerfil(armazenamento).ecos,carregarPerfil(armazenamento).mancha],[226,null]);
assert.equal(JSON.parse(dados.get('aventura-selva-jornada-v3')).moedas,226);
assert(dados.get(CHAVE));
const origemV2=JSON.stringify({...antigo,versao:2});
const migradoV2=carregarPerfil({getItem:chave=>chave==='aventura-selva-campanha-v2'?origemV2:null});
assert.deepEqual([migradoV2.versao,migradoV2.classe,migradoV2.nivel,migradoV2.ecos,migradoV2.fase],[7,'herdeiro',8,226,5]);
assert.deepEqual([nivelDosAtributos(migradoV2.atributos),migradoV2.refazerGratuito],[8,true]);
const v=validar({...novoPerfil(),equipadas:['eco','eco'],compradas:['eco','lixo','eco'],estrelas:{1:['s2','s2','lixo']},ecos:-40});
assert.deepEqual(v.equipadas,['eco',null]);assert.deepEqual(v.estrelas[1],['s2']);assert.equal(v.ecos,0);
assert.throws(()=>validar({versao:14}));assert(!salvarPerfil(null,p));

const trilhasOriginais = [
  {fase:1, santuario:{id:'vau',x:690,y:208}, seguro:{x:1240,y:92}},
  {fase:2, santuario:{id:'brejo',x:899,y:229}, seguro:{x:1351,y:107}}
];
for(const {fase,santuario,seguro} of trilhasOriginais){
  const salvo={
    versao:5,revisao:21,iniciada:true,fase,liberada:fase,santuario:{fase,id:santuario.id},
    nivel:4,ecos:3,xp:19,mortes:2,concluidas:fase===2?[1]:[],ciclo:2,
    compradas:['retorno','aparo'],equipadas:['aparo','retorno'],
    estrelas:{[fase]:['s3']},atalhos:{1:['cipo']},coletas:{1:['eco-1','v:vigia']},
    chefes:{4:['presas']},selados:{13:['tampa']},mancha:{...seguro,fase,valor:12},
    sessao:{fase,vida:64,frascos:1,derrotados:['vigia'],morto:false,seguro},
    opcoes:{som:false,volume:.4,movimento:false,modo:'desafio'}
  };
  const exportado=JSON.stringify(salvo);
  const arquivos=new Map([[CHAVE_V5,exportado]]);
  const disco={getItem:chave=>arquivos.get(chave),setItem:(chave,dados)=>arquivos.set(chave,dados)};
  const retomado=carregarPerfil(disco);
  assert.deepEqual([retomado.versao,retomado.classe],[7,'herdeiro']);
  assert.deepEqual([nivelDosAtributos(retomado.atributos),retomado.refazerGratuito],[4,true]);
  for(const campo of ['revisao','iniciada','fase','liberada','nivel','ecos','xp','mortes','concluidas','ciclo',
    'compradas','equipadas','santuario','mancha','sessao'])assert.deepEqual(retomado[campo],salvo[campo],campo);
  assert.equal(retomado.cicloAte,fase);
  assert.equal(retomado.frascoNivel,1);
  assert.deepEqual(retomado.coletas[1],salvo.coletas[1]);
  assert.deepEqual(retomado.atalhos[1],salvo.atalhos[1]);
  assert.deepEqual(retomado.chefes[4],salvo.chefes[4]);
  assert.deepEqual(retomado.selados[13],salvo.selados[13]);
  assert.deepEqual(retomado.amuletos,fase===1?['folha-dupla']:[]);
  for(const campo of ['som','volume','movimento','modo'])assert.equal(retomado.opcoes[campo],salvo.opcoes[campo]);
  assert(salvarPerfil(disco,retomado));
  assert.equal(arquivos.get(CHAVE_V5),exportado);
  assert.equal(JSON.parse(arquivos.get(CHAVE)).versao,7);
  assert.deepEqual(carregarPerfil(disco),retomado);
  const jogo=new Jogo(retomado);
  assert(jogo.carregar(fase,true));
  assert(jogo.heroi.noChao);
  assert.deepEqual([centro(jogo.heroi),pe(jogo.heroi),jogo.heroi.vida,jogo.heroi.frascos],[seguro.x,seguro.y,64,1]);
  assert.deepEqual(retomado.estrelas[fase],['s3']);
  assert(jogo.interagir());
  assert.equal(retomado.mancha,null);
  assert.equal(retomado.ecos,15);
  jogo.morrer(true);
  assert(jogo.renascer());
  assert.equal(retomado.santuario.id,santuario.id);
  assert.deepEqual([centro(jogo.heroi),pe(jogo.heroi)],[santuario.x,santuario.y]);
}
const arquivoV6={
  ...novoPerfil(),versao:6,iniciada:true,nivel:9,xp:33,ecos:91,amuletos:['fivela-do-rancho','gota-de-resina','cinzel-de-bento','falsificado'],
  amuletosEquipados:['fivela-do-rancho','fivela-do-rancho','cinzel-de-bento'],
  compradas:['aparo'],equipadas:['aparo',null],gravuras:{aparo:99,eco:3},frascoNivel:0,conquistas:['diario','diario','forjada'],
  modificadores:['sem-frascos','inventado'],opcoes:{tremor:-1,flash:18,teclas:{interagir:['KeyC']}},
  mancha:{fase:1,x:176,y:206,valor:22},sessao:{fase:1,vida:37,frascos:1,derrotados:[],seguro:{x:176,y:206},morto:false},
  recordes:{cronos:{1:{ms:400,trilha:[[0,5,8],[150,22,8]]}},diarios:{}}
};
for(const campo of ['classe','atributos','refazerGratuito','cinzasRefazer','cicloDaCinza','maiorPoder'])delete arquivoV6[campo];
const discoV6=new Map([[CHAVE_V6,JSON.stringify(arquivoV6)]]);
const armazenamentoV6={getItem:id=>discoV6.get(id),setItem:(id,valor)=>discoV6.set(id,valor)};
const importadoV6=carregarPerfil(armazenamentoV6);
assert.deepEqual([importadoV6.versao,importadoV6.classe],[7,'herdeiro']);
assert.deepEqual([nivelDosAtributos(importadoV6.atributos),importadoV6.refazerGratuito],[9,true]);
for(const campo of ['nivel','xp','ecos','compradas','equipadas','mancha','sessao','recordes']){
  assert.deepEqual(importadoV6[campo],arquivoV6[campo],campo);
}
assert.deepEqual(importadoV6.amuletosEquipados,['fivela-do-rancho',null,null]);
assert.deepEqual(importadoV6.gravuras,{aparo:3});
assert.equal(importadoV6.frascoNivel,1);
assert.deepEqual(importadoV6.conquistas,['diario']);
assert.deepEqual(importadoV6.modificadores,['sem-frascos']);
assert.deepEqual([importadoV6.opcoes.tremor,importadoV6.opcoes.flash],[0,1]);
assert.deepEqual(importadoV6.opcoes.teclas.interagir,['KeyC']);
assert(!importadoV6.opcoes.teclas.talento.includes('KeyC'));
assert(salvarPerfil(armazenamentoV6,importadoV6));
assert.deepEqual(carregarPerfil(armazenamentoV6),importadoV6);
assert.equal(discoV6.get(CHAVE_V6),JSON.stringify(arquivoV6));

const v7Anterior=validar({...arquivoV6,versao:7,classe:'feiticeiro',nivel:24});
assert.deepEqual([v7Anterior.classe,v7Anterior.nivel,nivelDosAtributos(v7Anterior.atributos),v7Anterior.refazerGratuito],
  ['feiticeiro',24,24,true]);
assert.equal(v7Anterior.xp,arquivoV6.xp);
v7Anterior.refazerGratuito=false;
v7Anterior.maiorPoder=42;
assert.deepEqual(validar(v7Anterior),v7Anterior,'O refazer consumido não retorna ao validar um perfil já normalizado');

const jornada=novoPerfil();
assert.equal(jornada.classe,null);
assert(!escolherClasse(jornada,'herdeiro'));
assert(escolherClasse(jornada,'despojado'));
assert.equal(jornada.nivel,CLASSES.despojado.nivelInicial);
assert.equal(jornada.refazerGratuito,false);
assert.deepEqual(validar(jornada),jornada);
assert(!escolherClasse(jornada,'ladino'));
Object.assign(jornada,{iniciada:true,nivel:18,atributos:{...jornada.atributos,folego:17,forca:17},xp:29,ecos:56,compradas:['eco'],equipadas:['eco',null],
  concluidas:Array.from({length:15},(_,indice)=>indice+1),liberada:15});
jornada.estrelas[1]=['s1'];jornada.amuletos=['folha-dupla'];
assert(!escolherClasse(jornada,'cavaleiro',true));
assert(iniciarCiclo(jornada,['vigor-curto']));
assert(escolherClasse(jornada,'cavaleiro',true));
assert.deepEqual([jornada.classe,jornada.nivel,jornada.xp,jornada.ecos],['cavaleiro',18,29,56]);
assert.deepEqual([jornada.equipadas,jornada.estrelas[1],jornada.amuletos],[['eco',null],['s1'],['folha-dupla']]);
assert.equal(validar(jornada).classe,'cavaleiro');
assert.equal(validar(jornada).nivel,18);
const cicloLegado=validar({versao:5,ciclo:2,concluidas:[15],liberada:15});
assert(cicloLegado.cicloConcluido);
assert(!validar({...cicloLegado,cicloConcluido:false}).cicloConcluido);
console.log('Migrações de atributos de v2/v3/v5/v6/v7, retomadas, inventário e troca de classe no novo ciclo passaram.');
