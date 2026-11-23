import assert from 'node:assert/strict';
import { BALANCO, GOLPES_INIMIGOS, GUARDIOES, TIPOS } from '../src/cinzas/ajustes.js';
import { avisoDoGolpe, desenharInimigo, DESENHOS_CRIATURAS } from '../src/cinzas/atores-pixel.js';
import { atualizarAmbiente, criarAmbiente, desenharAmbiente, desenharZona, MARCAS_AMBIENTE, TIPOS_AMBIENTE } from '../src/cinzas/ambiente.js';
import { TIMBRES } from '../src/cinzas/som.js';
import { duracaoAviso } from '../src/cinzas/inimigos.js';
import { amostrasDeInimigo } from './amostras-leitura-cinzas.mjs';

function gravarDesenho(desenhar){
  const marcas=[];
  const tela={globalAlpha:1,fillRect(...medidas){marcas.push(medidas);},save(){},restore(){},translate(){},scale(){},
    drawImage(){marcas.push(['atlas']);}};
  desenhar(tela);
  return marcas;
}

const novos=['escavador','cuspidor','ressonante','sineiro','miragem','areeiro','cristalino','patinador','fornalha','fagulheiro'];
const silhuetas=new Set();
for(const tipo of novos){
  const desenho=DESENHOS_CRIATURAS[tipo];
  assert.equal(typeof desenho,'function',tipo+' tem desenho registrado');
  assert(TIPOS[tipo].arquetipo,tipo+' pertence ao elenco de biomas');
  const {fase,amostras}=amostrasDeInimigo(tipo);
  const poses=new Set();
  for(const pose of amostras){
    const inimigo={...pose.inimigo,flash:0};
    const forma=gravarDesenho(tela=>desenho(tela,inimigo,0,0,false,true));
    assert(forma.length>0,tipo+' desenha a pose '+pose.estado);
    assert(!forma.some(([origem])=>origem==='atlas'),tipo+' usa geometria própria');
    poses.add(JSON.stringify(forma));
    if(pose.estado==='aviso')silhuetas.add(JSON.stringify(forma));
    const partida={fase,inimigos:[inimigo]};
    const integrado=gravarDesenho(tela=>desenharInimigo(tela,inimigo,partida,{},null,pose.tempo,true,{},true));
    assert(integrado.length>=1,tipo+' aparece no desenho do jogo');
    assert(!integrado.some(([origem])=>origem==='atlas'),tipo+' não cai no atlas de outro tipo');
  }
  assert.equal(poses.size,3,tipo+' distingue preparo, impacto e recuperação sem contar a cor');
}
assert.equal(silhuetas.size,novos.length,'Geometria própria das dez criaturas no preparo');

for(const [id,golpe] of Object.entries(GOLPES_INIMIGOS)){
  const [minimo,maximo]=golpe.limitesAviso;
  assert(minimo>0&&minimo<=golpe.aviso&&golpe.aviso<=maximo,id+' tem limites válidos');
  const comum=avisoDoGolpe(id),alto=avisoDoGolpe(id,true);
  assert(comum.forma&&alto.forma===comum.forma,id+' conserva a forma no alto contraste');
  assert.equal(alto.imparavel,!!golpe.imparavel,id+' conserva o sinal de aparo');
  assert.equal(alto.marca,golpe.imparavel?'serrilha':'diamante');
  assert.equal(alto.aviso,golpe.aviso);
  assert(alto.espessura>=comum.espessura&&alto.espessura>0&&alto.cor,id+' continua visível');
  for(const modo of Object.keys(BALANCO.dificuldade)){
    const {fase,amostras}=amostrasDeInimigo('chefe',{golpe:id,fase:4,etapa:3,modo});
    const {inimigo,tempo}=amostras[0];
    assert.equal(inimigo.ataqueId,id);
    assert(inimigo.duracao>=minimo&&inimigo.duracao<=maximo,id+' avisa no intervalo em '+modo);
    assert.equal(inimigo.imparavel,!!golpe.imparavel);
    const partida={fase,inimigos:[inimigo]};
    const visivel=gravarDesenho(tela=>{
      desenharAmbiente(tela,partida,true);
      desenharInimigo(tela,inimigo,partida,null,null,tempo,true,{},true);
    });
    const patrulha={...inimigo,estado:'patrulha'};
    const semAviso=gravarDesenho(tela=>{
      desenharAmbiente(tela,{fase,inimigos:[patrulha]},true);
      desenharInimigo(tela,patrulha,partida,null,null,tempo,true,{},true);
    });
    assert(visivel.length>semAviso.length,id+' emite primitivas de aviso em alto contraste');
  }
}

for(const [fase,guardiao] of Object.entries(GUARDIOES)){
  for(const etapa of guardiao.etapas){
    for(const ataque of etapa.padrao){
      const golpe=GOLPES_INIMIGOS[ataque];
      for(const modo of Object.values(BALANCO.dificuldade)){
        const [minimo,maximo]=golpe.limitesAviso;
        for(const desvio of [-1,0,1]){
          const fator=modo.aviso*(1+desvio*modo.variacaoAviso);
          const efetivo=duracaoAviso(golpe,fator,etapa.aviso);
          assert(efetivo>=minimo&&efetivo<=maximo,`Aviso de ${ataque} na F${fase}`);
        }
      }
    }
  }
}

const padroes=new Set(),timbres=new Set();
for(const [tipo,config] of Object.entries(TIPOS_AMBIENTE)){
  assert.equal(typeof MARCAS_AMBIENTE[config.padrao],'function');
  const timbre=TIMBRES[config.som];
  assert(timbre&&timbre.slice(0,3).every(numero=>numero>0));
  timbres.add(JSON.stringify(timbre));

  const zona={tipo,x:40,y:120,w:152,dir:1,progresso:.47};
  const geometria=estado=>gravarDesenho(tela=>desenharZona(tela,{...zona,estado},true));
  const estados=['quieto','aviso','ativo'].map(geometria);
  assert(estados.every(estado=>estado.length>0),tipo+' visível em todos os estados');
  assert.equal(new Set(estados.map(estado=>JSON.stringify(estado))).size,3,tipo+' sinaliza a mudança de estado');
  padroes.add(JSON.stringify(estados[1]));

  const sons=[];
  const jogo={ambiente:criarAmbiente({ambientes:[zona]}),heroi:{x:100,y:94,w:14,h:26},inimigos:[],
    emitirSom:som=>sons.push(som),tempo:config.periodo-config.ativo-config.aviso/2};
  atualizarAmbiente(jogo,BALANCO.passo);
  atualizarAmbiente(jogo,BALANCO.passo);
  assert.deepEqual(sons,[config.som],tipo+' emite o próprio aviso uma vez por ciclo');
}
assert.equal(padroes.size,5);
assert.equal(timbres.size,5);
console.log(`Leitura verificada por dados: ${novos.length} criaturas, ${Object.keys(GOLPES_INIMIGOS).length} golpes em alto contraste e ${padroes.size} perigos.`);
