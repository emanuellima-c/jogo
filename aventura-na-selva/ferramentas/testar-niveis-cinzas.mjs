import assert from 'node:assert/strict';
import { ATRIBUTOS, CINZA_REFAZER, TIPOS } from '../src/cinzas/ajustes.js';
import { FASES } from '../src/cinzas/fases.js';
import { posicionar } from '../src/cinzas/fisica.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { telaNivel } from '../src/cinzas/niveis-ui.js';
import { novoPerfil, validar } from '../src/cinzas/perfil.js';
import { atributosParaNivel, custoNivel, nivelDosAtributos } from '../src/cinzas/poder.js';

const perfil=validar({versao:7,classe:'cavaleiro',iniciada:true,nivel:12,ecos:430,xp:49,liberada:8});
const jogo=new Jogo(perfil);
assert(jogo.carregar(1));
const altar=jogo.fase.santuarios[0];
posicionar(jogo,jogo.heroi,altar);
assert(jogo.descansar(altar));
const primeiroRetrato={...jogo.retrato};
const niveisAntes=jogo.inimigos.map(inimigo=>inimigo.nivel);
const vidaAntes=jogo.heroi.vidaMax;
const nivelAntes=perfil.nivel, saldo=perfil.ecos;
const vitalidade=perfil.atributos.vitalidade;
const preco=custoNivel(nivelAntes);
const previa=telaNivel(perfil,'vitalidade',true);
assert(previa.includes(`Vitalidade ${vitalidade} → ${vitalidade+1}`));
assert(previa.includes('Vida máxima')&&previa.includes(`Evoluir · ${preco} ecos`));
assert(jogo.elevarAtributo('vitalidade'));
assert.equal(perfil.nivel,nivelAntes+1);
assert.equal(perfil.nivel,nivelDosAtributos(perfil.atributos));
assert.equal(perfil.ecos,saldo-preco);
assert.equal(perfil.xp,49);
assert(jogo.heroi.vidaMax>vidaAntes);
assert.deepEqual(jogo.retrato,primeiroRetrato);
assert.deepEqual(jogo.inimigos.map(inimigo=>inimigo.nivel),niveisAntes);
assert(!jogo.elevarAtributo('fabricado'));

const proposta={...perfil.atributos,vitalidade:perfil.atributos.vitalidade-1,forca:perfil.atributos.forca+1};
assert(perfil.refazerGratuito);
assert(jogo.refazerAtributos(proposta));
assert(!perfil.refazerGratuito);
assert(!jogo.refazerAtributos({...proposta,vitalidade:proposta.vitalidade+1,forca:proposta.forca-1}));
assert.deepEqual(perfil.atributos,proposta);

const retomado=validar(structuredClone(perfil));
const partidaRetomada=new Jogo(retomado);
assert(partidaRetomada.carregar(1,true));
assert(!retomado.refazerGratuito);
assert.deepEqual(partidaRetomada.retrato,primeiroRetrato);
assert(partidaRetomada.descansar());
assert.equal(partidaRetomada.retrato.nivel,nivelAntes+1);
assert(partidaRetomada.retrato.maiorPoder>=primeiroRetrato.maiorPoder);

posicionar(jogo,jogo.heroi,jogo.fase.bento);
const antesCinza=perfil.ecos;
assert(jogo.comprarCinza());
assert.equal(perfil.ecos,antesCinza-CINZA_REFAZER.preco);
assert.equal(perfil.cinzasRefazer,1);
assert.equal(perfil.cicloDaCinza,perfil.ciclo);
assert(!jogo.comprarCinza());
posicionar(jogo,jogo.heroi,altar);
assert(jogo.refazerAtributos({...proposta,forca:proposta.forca-1,vitalidade:proposta.vitalidade+1}));
assert.equal(perfil.cinzasRefazer,0);
posicionar(jogo,jogo.heroi,jogo.fase.bento);
assert(!jogo.comprarCinza(),'Consumir a cinza não repõe o estoque deste ciclo');

const arenaBase=FASES[3],santuario=arenaBase.santuarios[0];
const guardiao=arenaBase.inimigos.find(inimigo=>inimigo.tipo==='chefe');
const arena={...arenaBase,inimigos:[{...guardiao,x:santuario.x+24,y:santuario.y}]};
const legado=validar({versao:6,liberada:4,iniciada:true,nivel:7,ecos:200});
const luta=new Jogo(legado,{},[arena]);
luta.carregar(4);
posicionar(luta,luta.heroi,santuario);
luta.inimigos[0].estado='aviso';
const outraDistribuicao=atributosParaNivel('herdeiro',legado.nivel,'concentrada');
assert(!luta.elevarAtributo('folego'));
assert(!luta.refazerAtributos(outraDistribuicao));
assert(legado.refazerGratuito);

const rico=novoPerfil();
Object.assign(rico,{classe:'herdeiro',nivel:89,atributos:atributosParaNivel('herdeiro',89)});
const jornada=new Jogo(rico);
jornada.carregar(1);
const comum=jornada.inimigos.find(inimigo=>inimigo.tipo==='vigia');
assert(comum);
const premio=TIPOS[comum.tipo];
jornada.derrotar(comum);
assert(rico.ecos<premio.ecos&&rico.xp<premio.xp,'NPC muito abaixo do herói reduz os dois prêmios');
assert.equal(rico.nivel,89,'O XP de campo acumula sem elevar o nível');
assert.equal(Object.keys(rico.atributos).length,Object.keys(ATRIBUTOS).length);

for(const [classe,vermelho,interrompe] of [['cavaleiro',false,false],['cavaleiro',true,true],['despojado',false,true]]){
  const defensor=new Jogo({...novoPerfil(),classe});
  defensor.carregar(1);
  defensor.atualizar(1/60,{pesado:true});
  const antes=defensor.heroi.vida;
  defensor.impactoInimigo(defensor.inimigos.find(inimigo=>inimigo.tipo==='vigia'),vermelho);
  assert(defensor.heroi.vida<antes,'Postura sustenta o golpe sem anular dano');
  assert.equal(defensor.heroi.acao==='dano',interrompe);
}

console.log('Prévia, evolução, refazer único, retrato, bloqueio em chefes, postura e recompensas menores passaram.');
