// Gerado a partir de src/cinzas/ambiente.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/ambiente.js", function (exports, usar) {
"use strict";
const { GOLPES_INIMIGOS } = usar("src/cinzas/ajustes.js");
const { centro, pe } = usar("src/cinzas/fisica.js");
const { fios, linha, tinta } = usar("src/cinzas/formas.js");
const LUZ_PERIGO='#fff9e5';
const CONTORNO_PERIGO='#231d2a';
const TIPOS_AMBIENTE = {
  vento:{nome:'Rajada',periodo:5.4,aviso:.78,ativo:1.65,arrasto:24,
    padrao:'setas',som:'aviso-rajada',cor:'#b5e0a1',corAltoContraste:LUZ_PERIGO},
  corrente:{nome:'Correnteza',periodo:5.8,aviso:.88,ativo:1.9,arrasto:28,
    padrao:'ondas',som:'aviso-correnteza',cor:'#84d9ea',corAltoContraste:LUZ_PERIGO},
  areia:{nome:'Areia movediça',periodo:5.6,aviso:.84,ativo:1.45,velocidade:.68,
    padrao:'graos',som:'aviso-areia',cor:'#edbe7b',corAltoContraste:LUZ_PERIGO},
  gelo:{nome:'Gelo escorregadio',periodo:5.9,aviso:.88,ativo:2.4,freio:.26,
    padrao:'fraturas',som:'aviso-gelo',cor:'#b1ebf8',corAltoContraste:LUZ_PERIGO},
  vapor:{nome:'Vapor',periodo:5.3,aviso:1.08,ativo:.55,dano:9,
    padrao:'jatos',som:'aviso-vapor',cor:'#f5a676',corAltoContraste:LUZ_PERIGO}
};

function criarAmbiente(fase){
  const zonas=(fase.ambientes||[]).map((zona,indice)=>({
    ...zona,atraso:.37*indice,estado:'quieto',progresso:0,tocou:false,soou:false
  }));
  return {zonas,arrasto:0,velocidade:1,freio:1};
}

function dentro(heroi, zona, altura){
  return heroi.x+heroi.w-2>zona.x&&heroi.x+2<zona.x+zona.w&&pe(heroi)>zona.y-altura&&heroi.y<zona.y+3;
}

function atualizarAmbiente(jogo, dt){
  const ambiente=jogo.ambiente;
  if(!ambiente)return;
  ambiente.arrasto=0;
  ambiente.velocidade=1;
  ambiente.freio=1;
  if(jogo.emTreino)return;
  const heroi=jogo.heroi;
  for(const zona of ambiente.zonas){
    const tipo=TIPOS_AMBIENTE[zona.tipo];
    const tempo=(jogo.tempo+zona.atraso)%tipo.periodo;
    const acende=tipo.periodo-tipo.ativo, avisa=acende-tipo.aviso;
    const proximo=tempo>=acende?'ativo':tempo>=avisa?'aviso':'quieto';
    if(proximo!==zona.estado){
      zona.estado=proximo;
      if(proximo!=='ativo')zona.tocou=false;
      zona.soou=false;
    }
    zona.progresso=proximo==='ativo'?(tempo-acende)/tipo.ativo:proximo==='aviso'?(tempo-avisa)/tipo.aviso:0;
    if(proximo==='aviso'&&!zona.soou&&Math.abs(centro(heroi)-zona.x-zona.w/2)<94&&Math.abs(pe(heroi)-zona.y)<63){
      zona.soou=true;
      jogo.emitirSom(tipo.som);
    }
    if(zona.estado!=='ativo'||!dentro(heroi,zona,zona.tipo==='vento'?38:10))continue;
    if(tipo.arrasto)ambiente.arrasto+=tipo.arrasto*zona.dir;
    if(tipo.velocidade)ambiente.velocidade=Math.min(ambiente.velocidade,tipo.velocidade);
    if(tipo.freio)ambiente.freio=Math.min(ambiente.freio,tipo.freio);
    if(tipo.dano&&!zona.tocou&&jogo.receberGolpe(tipo.dano,centro(heroi)<zona.x+zona.w/2?-1:1)){
      zona.tocou=true;
    }
  }
  for(const inimigo of jogo.inimigos||[]){
    if(inimigo.estado!=='impacto'&&inimigo.estado!=='recuperacao')continue;
    const golpe=GOLPES_INIMIGOS[inimigo.ataqueId];
    if(golpe?.atrito&&inimigo.campos.some(campo=>dentro(heroi,campo,12))){
      ambiente.velocidade=Math.min(ambiente.velocidade,golpe.atrito);
    }
  }
}

// Cada perigo tem um motivo próprio. As formas continuam distintas com uma só cor.
const MARCAS_AMBIENTE={
  setas(tela,zona,cor,traco,progresso){
    const {x,y,w,estado}=zona;
    const sentido=zona.dir<0?-1:1;
    const altura=estado==='ativo'?11:estado==='aviso'?8:5;
    const deslocamento=estado==='ativo'?Math.round(progresso*4)*sentido:0;
    for(let ponto=x+8;ponto<=x+w-9;ponto+=12){
      const ponta=ponto+deslocamento, meio=y-altura;
      linha(tela,cor,ponta-sentido*6,meio,ponta,meio,traco);
      fios(tela,cor,[ponta-sentido*3,meio-3,ponta,meio,ponta-sentido*3,meio+3],traco);
      if(estado==='ativo')linha(tela,cor,ponta-sentido*6,meio+4,ponta-sentido*2,meio+4,traco);
    }
  },
  ondas(tela,zona,cor,traco,progresso){
    const {x,y,w,estado}=zona;
    const sentido=zona.dir<0?-1:1;
    const cheias=estado==='quieto'?1:2;
    const avanco=estado==='ativo'?Math.round(progresso*6):0;
    for(let camada=0;camada<cheias;camada++){
      const nivel=y-5-camada*5;
      const deslocamento=camada?2:0;
      for(let passo=3;passo<=w-6;passo++){
        const fase=(passo+deslocamento-avanco+12)%8;
        const px=sentido>0?x+passo:x+w-passo-traco;
        tinta(tela,cor,px,nivel-Math.min(fase,7-fase),1,traco);
      }
    }
    if(estado!=='quieto'){
      const ponta=sentido>0?x+w-3:x+3;
      fios(tela,cor,[ponta-sentido*3,y-9,ponta,y-6,ponta-sentido*3,y-3],traco);
    }
  },
  graos(tela,zona,cor,traco,progresso){
    const {x,y,w,estado}=zona;
    const afunda=estado==='ativo'?Math.floor(progresso*4):0;
    for(let centro=x+8;centro<=x+w-9;centro+=14){
      tinta(tela,cor,centro-4,y-5,traco,traco);
      tinta(tela,cor,centro+3,y-5,traco,traco);
      tinta(tela,cor,centro,y-3,traco,traco);
      if(estado==='quieto')continue;
      fios(tela,cor,[centro-3,y-11+afunda,centro,y-8+afunda,centro+3,y-11+afunda],traco);
      if(estado==='ativo')tinta(tela,cor,centro,y-15+afunda,traco,traco);
    }
  },
  fraturas(tela,zona,cor,traco,progresso){
    const {x,y,w,estado}=zona;
    const altura=estado==='ativo'?11+Math.floor(progresso*3):estado==='aviso'?9:5;
    for(let fissura=x+8;fissura<=x+w-9;fissura+=15){
      fios(tela,cor,[fissura-5,y-2,fissura+1,y-5,fissura-2,y-7,fissura+3,y-altura],traco);
      if(estado!=='quieto')linha(tela,cor,fissura+1,y-5,fissura+5,y-6,traco);
    }
  },
  jatos(tela,zona,cor,traco,progresso){
    const {x,y,w,estado}=zona;
    const altura=estado==='ativo'?19+Math.round(Math.sin(progresso*Math.PI)*6):estado==='aviso'?12:4;
    for(let respiro=x+8;respiro<=x+w-9;respiro+=14){
      linha(tela,cor,respiro-4,y-3,respiro+4,y-3,traco);
      linha(tela,cor,respiro,y-5,respiro,y-altura,traco);
      if(estado!=='quieto'){
        tinta(tela,cor,respiro-3,y-altura-2,3,traco);
        tinta(tela,cor,respiro+1,y-altura-4,3,traco);
      }
      if(estado==='ativo'){
        linha(tela,cor,respiro-3,y-6,respiro-3,y-altura+5,traco);
        linha(tela,cor,respiro+3,y-6,respiro+3,y-altura+5,traco);
      }
    }
  }
};

function desenharZona(tela,zona,altoContraste=false,animar=true){
  const {x,y,w,estado}=zona;
  const tipo=TIPOS_AMBIENTE[zona.tipo];
  const cor=altoContraste?tipo.corAltoContraste:tipo.cor;
  const traco=altoContraste?2:1;
  const alpha=tela.globalAlpha;
  tinta(tela,CONTORNO_PERIGO,x,y-2,w,3);
  if(estado==='quieto'){
    for(let ponto=x+3;ponto<=x+w-5;ponto+=6)tinta(tela,cor,ponto,y-1,2,1);
  }else{
    tinta(tela,cor,x,y-1,w,traco);
    if(estado==='aviso'){
      tinta(tela,cor,x,y-5,traco,4);
      tinta(tela,cor,x+w-traco,y-5,traco,4);
    }
  }
  tela.globalAlpha=alpha*(altoContraste?1:estado==='quieto'?.67:.94);
  const desenharMarca=MARCAS_AMBIENTE[tipo.padrao];
  const progresso=animar?(zona.progresso??0):.5;
  if(altoContraste)desenharMarca(tela,zona,CONTORNO_PERIGO,traco+1,progresso);
  desenharMarca(tela,zona,cor,traco,progresso);
  tela.globalAlpha=alpha;
}

function desenharCampos(tela, inimigo, altoContraste, esquerda, direita){
  const aviso=inimigo.estado==='aviso'&&!inimigo.transicao;
  const recupera=inimigo.estado==='recuperacao'&&GOLPES_INIMIGOS[inimigo.ataqueId]?.atrito;
  if(!aviso&&inimigo.estado!=='impacto'&&!recupera)return;
  const golpe=GOLPES_INIMIGOS[inimigo.ataqueId];
  const fatal=golpe.imparavel;
  const cor=fatal?(altoContraste?'#ff5959':'#f08377'):(altoContraste?'#fff4ad':'#eac186');
  for(const {x,y,w,altura} of inimigo.campos){
    if(x+w<esquerda||x>direita)continue;
    const topo=y-altura;
    // Os limites da marca coincidem com a zona de contato.
    tela.globalAlpha=aviso===true?.18:.32;
    tinta(tela,cor,x,topo,w,altura);
    tela.globalAlpha=1;
    const espessura=altoContraste?2:1;
    linha(tela,'#22181f',x,y,x+w,y,3);
    linha(tela,cor,x,y-1,x+w,y-1,espessura);
    linha(tela,cor,x,topo,x,y,espessura);
    linha(tela,cor,x+w,topo,x+w,y,espessura);
    if(golpe.sinal==='queda')linha(tela,cor,x,topo,x+w,topo,espessura);
    for(let p=x+5;p<x+w-3;p+=12){
      const fim=golpe.sinal==='queda'?(aviso?topo+6:y-8):y-1;
      fios(tela,cor,fatal?[p-3,fim,p,fim-4,p+3,fim]:[p-3,fim-4,p,fim,p+3,fim-4]);
    }
  }
}

function desenharAmbiente(tela, jogo, altoContraste=false, esquerda=-Infinity, direita=Infinity, reduzido=false){
  if(jogo.emTreino)return;
  if(jogo.ambiente){
    for(const zona of jogo.ambiente.zonas){
      if(zona.x+zona.w>=esquerda&&zona.x<=direita)desenharZona(tela,zona,altoContraste,!reduzido);
    }
  }
  for(const inimigo of jogo.inimigos){
    if(jogo.fase.id===4&&inimigo.guardiao&&inimigo.estado!=='morto'){
      const y=inimigo.pisoY??pe(inimigo);
      const cor=altoContraste?'#fff1a4':'#ddb780';
      for(const x of [inimigo.min,inimigo.max]){
        tinta(tela,'#523e42',x-3,y-13,7,13);
        tinta(tela,cor,x-4,y-14,9,2);
        tinta(tela,cor,x,y-10,1,8);
      }
    }
    if(inimigo.campos?.length)desenharCampos(tela,inimigo,altoContraste,esquerda,direita);
  }
}
Object.defineProperty(exports, "TIPOS_AMBIENTE", { enumerable: true, get: () => TIPOS_AMBIENTE });
Object.defineProperty(exports, "MARCAS_AMBIENTE", { enumerable: true, get: () => MARCAS_AMBIENTE });
Object.defineProperty(exports, "criarAmbiente", { enumerable: true, get: () => criarAmbiente });
Object.defineProperty(exports, "atualizarAmbiente", { enumerable: true, get: () => atualizarAmbiente });
Object.defineProperty(exports, "desenharAmbiente", { enumerable: true, get: () => desenharAmbiente });
Object.defineProperty(exports, "desenharZona", { enumerable: true, get: () => desenharZona });
Object.defineProperty(exports, "desenharCampos", { enumerable: true, get: () => desenharCampos });
});
