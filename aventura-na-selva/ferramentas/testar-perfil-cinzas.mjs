import assert from 'node:assert/strict';
import { novoPerfil, validar, carregarPerfil, salvarPerfil, CHAVE } from '../src/cinzas/perfil.js';

const antigo = { versao:3, iniciada:true, nivel:8, xp:46, moedas:226, fase:5, ciclo:2,
  concluidas:[true,true,true,true], estrelas:[2,3,0,1,2], aprendidas:{duplo:true,dash:true},
  poderes:{escudo:2}, melhorias:{resistencia:2}, opcoes:{som:false,volume:.4,movimento:false}, totais:{mortes:7} };
const dados=new Map([['aventura-selva-jornada-v3',JSON.stringify(antigo)]]);
const armazenamento={getItem:k=>dados.get(k)??null,setItem:(k,v)=>dados.set(k,v)};
const p=carregarPerfil(armazenamento);
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
assert(dados.get(CHAVE));assert.equal(validar({...antigo,versao:2}).nivel,8);
const v=validar({...novoPerfil(),equipadas:['eco','eco'],compradas:['eco','lixo','eco'],estrelas:{1:['s2','s2','lixo']},ecos:-40});
assert.deepEqual(v.equipadas,['eco',null]);assert.deepEqual(v.estrelas[1],['s2']);assert.equal(v.ecos,0);
assert.throws(()=>validar({versao:14}));assert(!salvarPerfil(null,p));
console.log('Saves v2/v3, estrelas, compras, mancha, conflitos e validação do perfil passaram.');
