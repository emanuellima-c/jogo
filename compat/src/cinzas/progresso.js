// Gerado a partir de src/cinzas/progresso.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/progresso.js", function (exports, usar) {
"use strict";
// Bônus fracionários se somam ao multiplicador. Vida, vigor e cura usam valores absolutos.
const AMULETOS = [
  {id:'dente-do-vigia',nome:'Dente do Vigia',origem:'mini-chefe',
    efeito:'Pesados causam 28% mais dano e leves causam 14% menos dano.',bonus:{danoPesado:.28,danoLeve:-.14}},
  {id:'asa-de-cristal',nome:'Asa de Cristal',origem:'mini-chefe',
    efeito:'Gravuras custam 20% menos vigor. Vigor máximo −16.',bonus:{custoTecnica:-.20,vigor:-16}},
  {id:'garra-do-fosso',nome:'Garra do Fosso',origem:'mini-chefe',
    efeito:'Dano em inimigos em recuperação +24%. Esquiva custa 20% mais vigor.',bonus:{danoRecuperacao:.24,custoEsquiva:.20}},
  {id:'olho-da-geada',nome:'Olho da Geada',origem:'mini-chefe',
    efeito:'O aparo ganha 0,05 s de proteção. Dano recebido +18%.',bonus:{janelaAparo:.05,danoRecebido:.18}},
  {id:'pavio-de-escoria',nome:'Pavio de Escória',origem:'mini-chefe',
    efeito:'Ataques no ar causam 30% mais dano. Regeneração de vigor −15%.',bonus:{danoAereo:.30,regeneracao:-.15}},
  {id:'folha-dupla',nome:'Folha Dupla',origem:'desvio',fase:1,estrela:'s3',
    efeito:'Esquiva perfeita restaura 10 de vigor. Vida máxima −16.',bonus:{vigorEsquiva:10,vida:-16}},
  {id:'fragmento-lunar',nome:'Fragmento Lunar',origem:'desvio',fase:5,estrela:'s2',
    efeito:'Vida máxima +18. Frascos recuperam 12 de vida a menos.',bonus:{vida:18,cura:-12}},
  {id:'bussola-dunas',nome:'Bússola das Dunas',origem:'desvio',fase:8,estrela:'s3',
    efeito:'Esquiva custa 22% menos vigor. Golpes leves causam 17% menos dano.',bonus:{custoEsquiva:-.22,danoLeve:-.17}},
  {id:'fio-da-neve',nome:'Fio da Neve',origem:'desvio',fase:11,estrela:'s2',
    efeito:'Dano recebido −16%. Regeneração de vigor −12%.',bonus:{danoRecebido:-.16,regeneracao:-.12}},
  {id:'vidro-sulfurico',nome:'Vidro Sulfúrico',origem:'desvio',fase:14,estrela:'s3',
    efeito:'Dano infligido e recebido +18%.',bonus:{dano:.18,danoRecebido:.18}},
  {id:'fivela-do-rancho',nome:'Fivela do Rancho',origem:'loja',fase:2,preco:12,
    efeito:'Vigor máximo +18. Regeneração de vigor −16%.',bonus:{vigor:18,regeneracao:-.16}},
  {id:'gota-de-resina',nome:'Gota de Resina',origem:'loja',fase:3,preco:16,
    efeito:'Frascos recuperam mais 14 de vida. Dano recebido +12%.',bonus:{cura:14,danoRecebido:.12}},
  {id:'cinzel-de-bento',nome:'Cinzel de Bento',origem:'loja',fase:4,preco:20,
    efeito:'Pesado custa 25% menos vigor. Leve custa 22% mais vigor.',bonus:{custoPesado:-.25,custoLeve:.22}},
  {id:'no-de-cobre',nome:'Nó de Cobre',origem:'loja',fase:7,preco:25,
    efeito:'Vigor regenera 23% mais rápido. Vigor máximo −20.',bonus:{regeneracao:.23,vigor:-20}},
  {id:'perola-da-varzea',nome:'Pérola da Várzea',origem:'loja',fase:10,preco:30,
    efeito:'Sem cargas no frasco, dano +25%. Frascos recuperam 8 de vida a menos.',bonus:{danoSemFrasco:.25,cura:-8}}
];

const GRAVURAS = {
  retorno:{
    2:{preco:12,efeito:'O primeiro acerto do contra-ataque devolve 9 de vigor.'},
    3:{preco:24,efeito:'O corte abre a guarda de inimigos comuns protegidos.'}
  },
  aparo:{
    2:{preco:16,efeito:'O aparo bem-sucedido devolve 12 de vigor.'},
    3:{preco:28,efeito:'O aparo bem-sucedido também habilita o Corte de Retorno.'}
  },
  quebra:{
    2:{preco:18,efeito:'O golpe totalmente carregado também alcança atrás do herói.'},
    3:{preco:32,efeito:'Rachar a guarda de um escudo devolve 14 de vigor.'}
  },
  estocada:{
    2:{preco:22,efeito:'A ponta atravessa escudos comuns e abre a defesa.'},
    3:{preco:36,efeito:'Após acertar, a esquiva pode interromper a recuperação.'}
  },
  pisada:{
    2:{preco:27,efeito:'O impacto também abre a guarda de inimigos com escudo.'},
    3:{preco:44,efeito:'Pousar sobre uma ponte rachada renova o tempo antes da queda.'}
  },
  eco:{
    2:{preco:30,efeito:'O herói fica protegido durante o impacto do avanço no ar.'},
    3:{preco:48,efeito:'Permite um segundo avanço no mesmo salto, em sentido oposto ao primeiro.'}
  }
};

const FRASCOS = [
  null,
  {efeito:'Duas cargas por descanso.'},
  {preco:18,efeito:'Cura concluída também recupera 18 de vigor.'},
  {preco:35,efeito:'Três cargas por descanso.'}
];

const porId = new Map(AMULETOS.map(amuleto => [amuleto.id, amuleto]));

function amuletoPorId(id) {return porId.get(id);}
function slotsAmuletos(perfil) {return perfil.ciclo>1 || perfil.concluidas.includes(15) ? 3 : 2;}
function bonusEstrela(fase,estrela) {
  return AMULETOS.find(item=>item.origem==='desvio' && item.fase===fase && item.estrela===estrela)?.id;
}
function obterAmuleto(perfil,id) {
  if(!porId.has(id) || perfil.amuletos.includes(id))return false;
  perfil.amuletos.push(id);
  return true;
}
function comprarAmuleto(perfil,id) {
  const item=porId.get(id);
  if(item?.origem!=='loja' || perfil.liberada<item.fase || perfil.ecos<item.preco || !obterAmuleto(perfil,id))return false;
  perfil.ecos-=item.preco;
  return true;
}
function equiparAmuleto(perfil,id,slot) {
  if(!Number.isInteger(slot) || slot<0 || slot>=slotsAmuletos(perfil) || (id!==null && !perfil.amuletos.includes(id)))return false;
  const anterior=perfil.amuletosEquipados.indexOf(id);
  if(id && anterior>=0)perfil.amuletosEquipados[anterior]=perfil.amuletosEquipados[slot];
  perfil.amuletosEquipados[slot]=id;
  return true;
}
function nivelGravura(perfil,id) {return perfil.gravuras?.[id] || 1;}
function melhorarGravura(perfil,id) {
  if(!perfil.compradas.includes(id) || !Object.hasOwn(GRAVURAS,id))return false;
  const nivel=nivelGravura(perfil,id)+1, melhoria=GRAVURAS[id][nivel];
  if(!melhoria || perfil.ecos<melhoria.preco)return false;
  perfil.ecos-=melhoria.preco;
  perfil.gravuras[id]=nivel;
  return true;
}
function melhorarFrasco(perfil) {
  const melhoria=FRASCOS[perfil.frascoNivel+1];
  if(!melhoria || perfil.ecos<melhoria.preco)return false;
  perfil.ecos-=melhoria.preco;
  perfil.frascoNivel++;
  return true;
}
function modificadorAtivo(perfil,id) {
  return perfil.ciclo>1 && perfil.modificadores?.includes(id);
}
function atributos(perfil) {
  const valores={
    vida:0,vigor:0,cura:0,janelaAparo:0,vigorEsquiva:0,
    regeneracao:1,custoLeve:1,custoPesado:1,custoEsquiva:1,custoTecnica:1,
    dano:1,danoLeve:1,danoPesado:1,danoAereo:1,danoRecuperacao:1,danoSemFrasco:1,danoRecebido:1
  };
  for(const id of perfil.amuletosEquipados || []){
    const bonus=porId.get(id)?.bonus;
    if(bonus)for(const [chave,valor] of Object.entries(bonus))valores[chave]+=valor;
  }
  return valores;
}

Object.defineProperty(exports, "AMULETOS", { enumerable: true, get: () => AMULETOS });
Object.defineProperty(exports, "GRAVURAS", { enumerable: true, get: () => GRAVURAS });
Object.defineProperty(exports, "FRASCOS", { enumerable: true, get: () => FRASCOS });
Object.defineProperty(exports, "amuletoPorId", { enumerable: true, get: () => amuletoPorId });
Object.defineProperty(exports, "slotsAmuletos", { enumerable: true, get: () => slotsAmuletos });
Object.defineProperty(exports, "bonusEstrela", { enumerable: true, get: () => bonusEstrela });
Object.defineProperty(exports, "obterAmuleto", { enumerable: true, get: () => obterAmuleto });
Object.defineProperty(exports, "comprarAmuleto", { enumerable: true, get: () => comprarAmuleto });
Object.defineProperty(exports, "equiparAmuleto", { enumerable: true, get: () => equiparAmuleto });
Object.defineProperty(exports, "nivelGravura", { enumerable: true, get: () => nivelGravura });
Object.defineProperty(exports, "melhorarGravura", { enumerable: true, get: () => melhorarGravura });
Object.defineProperty(exports, "melhorarFrasco", { enumerable: true, get: () => melhorarFrasco });
Object.defineProperty(exports, "modificadorAtivo", { enumerable: true, get: () => modificadorAtivo });
Object.defineProperty(exports, "atributos", { enumerable: true, get: () => atributos });
});
