import assert from 'node:assert/strict';
import { BALANCO, GOLPES_INIMIGOS } from '../src/cinzas/ajustes.js';
import { centro, posicionar } from '../src/cinzas/fisica.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { novoPerfil } from '../src/cinzas/perfil.js';

const entrada={x:220,y:205};
const piso={id:'patio',x:0,y:205,w:450,h:70,tipo:'terra'};
const fase={id:1,largura:450,entrada,saida:{x:421,y:205},pisos:[piso],santuarios:[{id:'inicio',...entrada}],
  espinhos:[],moedas:[],estrelas:[],portas:[],atalhos:[],dicas:[]};

function ensaiar(modo,quantidade){
  const perfil=novoPerfil();
  perfil.opcoes.modo=modo;
  const inimigos=[236,244].slice(0,quantidade).map((x,indice)=>({
    id:'vigia-'+indice,piso:piso.id,tipo:'vigia',x,y:piso.y,min:155,max:295
  }));
  const jogo=new Jogo(perfil,{},[{...fase,inimigos}]);
  jogo.carregar(1);
  jogo.heroi.vida=10000;
  const ultimosAvisos=new Map();
  const avisos=[];
  let simultaneos=0,flanco=false;
  for(let quadro=0;quadro<820;quadro++){
    posicionar(jogo,jogo.heroi,entrada);
    jogo.atualizar(BALANCO.passo);
    const ameacando=jogo.inimigos.filter(inimigo=>['aviso','impacto'].includes(inimigo.estado));
    simultaneos=Math.max(simultaneos,ameacando.length);
    flanco||=jogo.inimigos.some(inimigo=>centro(inimigo)<entrada.x-4);
    for(const inimigo of ameacando){
      const anterior=ultimosAvisos.get(inimigo.id);
      if(inimigo.estado==='aviso'&&anterior?.numero!==inimigo.sequenciaAtaques){
        const golpe=GOLPES_INIMIGOS[inimigo.ataqueId];
        const [minimo,maximo]=golpe.limitesAviso;
        assert(inimigo.duracao>=minimo&&inimigo.duracao<=maximo);
        const aviso={id:inimigo.id,numero:inimigo.sequenciaAtaques,duracao:inimigo.duracao,quadro,combo:inimigo.golpeEncadeado};
        ultimosAvisos.set(inimigo.id,aviso);
        avisos.push(aviso);
      }else if(inimigo.estado==='impacto'){
        assert.equal(anterior?.numero,inimigo.sequenciaAtaques,'Todo impacto passou por seu próprio aviso');
        assert((quadro-anterior.quadro)*BALANCO.passo+1e-8>=anterior.duracao,'Impacto espera o aviso inteiro');
      }
    }
  }
  return {simultaneos,flanco,avisos};
}

const normal=ensaiar('normal',2);
assert.equal(normal.simultaneos,1);
assert(normal.flanco);
assert.equal(new Set(normal.avisos.map(aviso=>aviso.id)).size,2);
assert.deepEqual(ensaiar('normal',2),normal);
const solo=ensaiar('normal',1);
assert(solo.avisos.some(aviso=>aviso.combo));
assert(new Set(solo.avisos.map(aviso=>aviso.duracao)).size>2);
const relaxado=ensaiar('relaxado',1);
assert(relaxado.avisos.every(aviso=>!aviso.combo));
assert.equal(new Set(relaxado.avisos.map(aviso=>aviso.duracao)).size,1);
assert(ensaiar('desafio',1).avisos.filter(aviso=>aviso.combo).length>solo.avisos.filter(aviso=>aviso.combo).length);

console.log('Pressão verificada: flanco no piso, turnos, combos com avisos completos e variação determinística.');
