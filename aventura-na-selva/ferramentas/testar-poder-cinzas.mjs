import assert from 'node:assert/strict';
import {
  ATRIBUTOS, BALANCO, CLASSES, CURVA_FASES, MAXIMO_ATRIBUTO, MINIMO_ATRIBUTO, NIVEL_MAXIMO, TIPOS, GUARDIOES
} from '../src/cinzas/ajustes.js';
import { novoPerfil } from '../src/cinzas/perfil.js';
import { AMULETOS } from '../src/cinzas/progresso.js';
import {
  atributosParaNivel, custoAcumulado, custoNivel, dadosHeroi, danoEscalado, eficaciaGravura, escalaInimigo,
  fatorRecompensa, indicePoder, multiplicadorResistencia, nivelDosAtributos, pontosEfetivos, retratoPoder
} from '../src/cinzas/poder.js';

function perfilNoNivel(classe,nivel,estrategia){
  return {...novoPerfil(),classe,nivel,atributos:atributosParaNivel(classe,nivel,estrategia)};
}

for(const [id,meta] of Object.entries(ATRIBUTOS)){
  const ganho=valor=>pontosEfetivos(id,valor+1)-pontosEfetivos(id,valor);
  for(let valor=MINIMO_ATRIBUTO;valor<MAXIMO_ATRIBUTO;valor++)assert(ganho(valor)>0,id);
  for(const corte of meta.limites)assert(ganho(corte)<ganho(corte-1),id);
}

for(const classe of Object.values(CLASSES)){
  assert.equal(nivelDosAtributos(classe.atributosIniciais),classe.nivelInicial);
  const base=perfilNoNivel(classe.id,classe.nivelInicial);
  const atributos=Object.keys(base.atributos);
  for(const estrategia of ['equilibrada','especializada','concentrada','mal-construida']){
    assert.equal(nivelDosAtributos(atributosParaNivel(classe.id,99,estrategia)),99);
    const perfil=perfilNoNivel(classe.id,classe.nivelInicial+16,estrategia);
    const anterior=dadosHeroi(perfil);
    const ip=indicePoder(perfil);
    assert.equal(indicePoder(structuredClone(perfil)),ip);
    for(const id of atributos){
      const ascendente={...perfil,nivel:perfil.nivel+1,atributos:{...perfil.atributos,[id]:perfil.atributos[id]+1}};
      const depois=dadosHeroi(ascendente);
      assert.equal(depois.nivel,anterior.nivel+1);
      assert(indicePoder(ascendente)>ip,classe.id+' · '+id);
      assert(depois.vidaMax>=anterior.vidaMax&&depois.vigorMax>=anterior.vigorMax);
      for(const golpe of [classe.leve,classe.pesado,BALANCO.golpe.quebra,BALANCO.golpe.estocada]){
        assert(danoEscalado(golpe,depois.atributos)>=danoEscalado(golpe,anterior.atributos));
      }
    }
  }
  const ipBasico=indicePoder(base);
  for(const amuleto of AMULETOS){
    assert(indicePoder({...base,amuletosEquipados:[amuleto.id]})>=ipBasico,amuleto.id);
  }
  const equipado={...base,equipadas:['estocada','aparo']};
  const melhorado={...equipado,gravuras:{estocada:3,aparo:3},frascoNivel:3};
  assert(indicePoder(equipado)>ipBasico);
  assert(indicePoder(melhorado)>indicePoder(equipado));
}

const custosDeReferencia=new Map([[0,0],[5,50],[10,127],[20,387],[40,1454],[60,3488],[80,6778],[99,11334]]);
for(const [nivel,custo] of custosDeReferencia)assert.equal(custoAcumulado(nivel),custo,'Custo acumulado no nível '+nivel);
for(let nivel=0;nivel<NIVEL_MAXIMO;nivel++){
  assert(custoNivel(nivel+1)>custoNivel(nivel));
  assert.equal(custoAcumulado(nivel,nivel+1),custoNivel(nivel));
}
assert.equal(custoNivel(NIVEL_MAXIMO),Infinity);

function forcaHeroi(perfil){
  const dados=dadosHeroi(perfil);
  return dados.vidaMax/(1-dados.reducaoDano)*danoEscalado(dados.classe.pesado,dados.atributos);
}

for(const [id,curva] of Object.entries(CURVA_FASES)){
  const fase=Number(id);
  const tipos=Object.keys(TIPOS).filter(tipo=>tipo!=='boneco'&&(tipo!=='chefe'||GUARDIOES[fase]));
  const abaixo=perfilNoNivel('herdeiro',Math.max(0,curva.nivelAlvo-6));
  const alvo=perfilNoNivel('herdeiro',curva.nivelAlvo);
  const acima=perfilNoNivel('herdeiro',curva.nivelAlvo+10);
  const nivelPara=perfil=>retratoPoder(perfil,fase);
  const tipo=GUARDIOES[fase]?'chefe':'vigia';
  const forcaRelativa=perfil=>{
    const oposicao=escalaInimigo(fase,nivelPara(perfil),tipo);
    return forcaHeroi(perfil)/(oposicao.vida*oposicao.dano);
  };
  assert(forcaRelativa(abaixo)<forcaRelativa(alvo)&&forcaRelativa(alvo)<forcaRelativa(acima),'Ganho líquido em F'+fase);
  for(const modo of Object.keys(BALANCO.dificuldade)){
    for(const ciclo of [1,2,6,12]){
      for(const perfil of [abaixo,alvo,acima,perfilNoNivel('cavaleiro',NIVEL_MAXIMO)]){
        const retrato=nivelPara({...perfil,opcoes:{modo},ciclo});
        for(const ficha of tipos){
          const npc=escalaInimigo(fase,retrato,ficha);
          assert.deepEqual(npc,escalaInimigo(fase,structuredClone(retrato),ficha));
          assert(npc.nivel>=retrato.piso&&npc.nivel<=retrato.teto,'Escala fora da faixa em F'+fase);
          assert(npc.vida>0&&npc.dano>0&&npc.postura>0&&npc.ritmo>0);
        }
      }
    }
  }
  const retrato=nivelPara(alvo);
  const comum=escalaInimigo(fase,retrato,'vigia');
  const mini=escalaInimigo(fase,retrato,'mini');
  assert(mini.nivel>comum.nivel);
  if(GUARDIOES[fase])assert(escalaInimigo(fase,retrato,'chefe').nivel>mini.nivel);
  const equipada={...alvo,equipadas:['aparo'],amuletosEquipados:['dente-do-vigia']};
  const maiorPoder=nivelPara(equipada).maiorPoder;
  const removida={...alvo,maiorPoder};
  assert.equal(nivelPara(removida).maiorPoder,maiorPoder);
  assert.deepEqual(escalaInimigo(fase,nivelPara(removida),tipo),escalaInimigo(fase,nivelPara(equipada),tipo));
}

assert.equal(fatorRecompensa(10,10),1);
assert(fatorRecompensa(3,10)<1&&fatorRecompensa(17,10)>1);
assert(fatorRecompensa(0,99)>.4&&fatorRecompensa(99,0)<1.4);
assert(multiplicadorResistencia(TIPOS.cristalino.resistencias,'fogo')>1);
assert(multiplicadorResistencia(TIPOS.cristalino.resistencias,'fisico')<1);
const baixo=atributosParaNivel('despojado',0);
assert(eficaciaGravura(BALANCO.golpe.quebra,baixo)<1&&danoEscalado(BALANCO.golpe.quebra,baixo)>0);

console.log('Soft caps, custos, IP, limites por fase, resistências e ganho líquido em 15 fases verificados.');
