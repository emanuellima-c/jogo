import { BALANCO as B, GOLPES_INIMIGOS, GUARDIOES, TIPOS, dificuldadeDoPerfil } from './ajustes.js';
import { centro, limitar, pe, sobrepoe } from './fisica.js';
import { hash } from './formas.js';
import { escalaInimigo, fatorRecompensa } from './poder.js';

const PADROES = {
  vigia:['corte'],
  lanceiro:['estocada'],
  voador:['mergulho'],
  escudo:['varredura','corte'],
  elite:['estocada','martelo','investida'],
  boneco:['corte','estocada','martelo']
};
const NOMES = {
  vigia:'Vigia do cipó', lanceiro:'Lanceiro da trilha', voador:'Mariposa ferreira',
  escudo:'Guardião da casca', elite:'Sentinela ancestral', chefe:'Guardião', boneco:'Aprendiz de madeira'
};
const reservaDeProjeteis = new WeakMap();

function criarInimigo(definicao, fase, perfil, derrotados=[], retrato=null){
  const tipo = TIPOS[definicao.tipo];
  const guardiao = definicao.tipo==='chefe' ? GUARDIOES[fase.id]||GUARDIOES[4] : null;
  const w = guardiao?.w||tipo.w, h = guardiao?.h||tipo.h;
  const arquetipo = tipo.arquetipo||definicao.tipo;
  const y = definicao.y-(arquetipo==='voador'?h/2:h);
  const escala = fase.curva&&retrato&&definicao.tipo!=='boneco' ? escalaInimigo(fase,retrato,tipo,guardiao) : null;
  const vida = escala?.vida??guardiao?.vida??tipo.vida;
  const posturaBase = guardiao?.postura??(arquetipo==='escudo'?B.combate.postura:0);
  const ritmo = escala?.ritmo??1;
  const premio = escala ? fatorRecompensa(escala.nivel,retrato.nivel) : 1;
  const morto = perfil.chefes[fase.id].includes(definicao.id)||derrotados.includes(definicao.id);
  return {
    ...definicao,w,h,x:definicao.x-w/2,y,arquetipo,cor:tipo.cor,origemX:definicao.x,origemY:y,
    min:definicao.min??definicao.x-30,max:definicao.max??definicao.x+30,
    dir:-1,rumo:-1,vidaMax:vida,vida:morto?0:vida,estado:morto?'morto':'patrulha',
    nivel:escala?.nivel??null,resistencias:escala?.resistencias??{},tipoDano:escala?.tipoDano??tipo.tipoDano??'fisico',
    dano:escala?.dano??guardiao?.dano??tipo.dano,posturaMax:posturaBase*(escala?.postura??1),ritmo,
    ecos:Math.round(tipo.ecos*premio),xp:Math.round(tipo.xp*premio),
    faseChefe:1,indice:0,tempo:0,relogio:0,espera:.35,campos:[],ladoArena:0,
    avisoProgresso:0,imparavel:false,flash:0,atingiu:false,postura:0,ataqueId:'corte',ataqueNome:'Talho',
    janelaGasta:false,indicouOuro:false,danoOuro:0,ouroAte:0,
    sequenciaAtaques:0,golpeEncadeado:false,encadeamentos:0,limiteEncadeamentos:ritmo<=.94?2:1,
    sementeAviso:hash(`${fase.id}:${perfil.ciclo}:${definicao.id}`),
    guardiao,transicao:false,intangivel:false,nome:definicao.nome||NOMES[definicao.tipo]
  };
}

function estado(inimigo, novo, duracao){
  inimigo.estado=novo;
  inimigo.tempo=0;
  inimigo.duracao=duracao;
  inimigo.avisoProgresso=0;
  inimigo.intangivel=false;
}

function abrirGuarda(inimigo, duracao){
  estado(inimigo,'aberto',duracao);
  inimigo.postura=0;
  inimigo.imparavel=false;
}

function janelaOuro(inimigo, incluirAviso=false){
  const janela=inimigo.guardiao?.janela;
  if(!janela||inimigo.faseChefe!==3||inimigo.transicao||inimigo.janelaGasta||inimigo.ataqueId!==janela.golpe)return null;
  return inimigo.estado===janela.momento||(incluirAviso&&inimigo.estado==='aviso')?janela:null;
}

function deslocar(jogo, inimigo, x){
  const destino=limitar(x,inimigo.min,inimigo.max);
  if(inimigo.arquetipo!=='voador'&&inimigo.tipo!=='boneco'&&!jogo.pisos.some(piso=>
    piso.estado!=='ausente'&&destino>=piso.x+1&&destino<=piso.x+piso.w-1&&Math.abs(piso.y-pe(inimigo))<6))return false;
  inimigo.x=destino-inimigo.w/2;
  return true;
}

function pisoDoInimigo(jogo, inimigo){
  return jogo.pisos.find(piso=>piso.id===inimigo.piso)||
    jogo.pisos.find(piso=>inimigo.origemX>=piso.x&&inimigo.origemX<=piso.x+piso.w&&Math.abs(piso.y-inimigo.origemY-inimigo.h)<6);
}

function marcarCampos(jogo, inimigo, golpe){
  inimigo.campos.length=0;
  if(!golpe.campo)return;
  const piso=pisoDoInimigo(jogo,inimigo);
  const borda=piso?.x??inimigo.min-14, largura=piso?.w??inimigo.max-inimigo.min+28;
  const y=piso?.y??pe(inimigo);
  function marcar(inicio,larguraCampo){
    larguraCampo=Math.min(largura,larguraCampo);
    const x=limitar(inicio,borda,borda+largura-larguraCampo);
    inimigo.campos.push({x,y,w:larguraCampo,altura:golpe.altura});
  }
  const alvo=limitar(centro(jogo.heroi),borda,borda+largura);
  if(golpe.campo==='flanco'){
    inimigo.alvoX=limitar(alvo+inimigo.dir*21,inimigo.min,inimigo.max);
    marcar(inimigo.alvoX-golpe.alcance,golpe.alcance*2);
  }else if(golpe.campo==='faixa'){
    const lado=inimigo.ladoArena++%2;
    marcar(borda+largura*lado*.5,largura*.46);
  }else if(golpe.campo==='duplo'){
    marcar(alvo-golpe.alcance*2,44);
    marcar(alvo+16,44);
  }else if(golpe.campo==='fornalhas'){
    const cobertura=inimigo.guardiao?.etapas[inimigo.faseChefe-1]?.cobertura;
    if(inimigo.ladoArena++%2){
      const faixa=largura*(cobertura??.50)/2;
      marcar(borda,faixa);
      marcar(borda+largura-faixa,faixa);
    }else{
      const faixa=largura*(cobertura??.44);
      marcar(borda+(largura-faixa)/2,faixa);
    }
  }else{
    const centroMarcado=golpe.movimento ? inimigo.alvoX : alvo;
    marcar(centroMarcado-golpe.alcance,golpe.alcance*2);
  }
}

function ataqueImitado(inimigo){
  if(inimigo.ultimaAcao==='pesado'||inimigo.ultimaAcao==='quebra')return 'repique';
  if(inimigo.ultimaAcao==='estocada'||inimigo.ultimaAcao==='eco')return 'estocada';
  if(inimigo.ultimaAcao==='pisada')return 'martelo';
  return 'corte';
}

function fatorAviso(inimigo, modo){
  // A abertura de cada encontro apresenta o tempo nominal do golpe. O aviso
  // seguinte já nasce com uma duração sorteada, fixa até o quadro de impacto.
  if(inimigo.sequenciaAtaques===1||!modo.variacaoAviso||inimigo.tipo==='boneco')return modo.aviso;
  inimigo.sementeAviso=(Math.imul(inimigo.sementeAviso,1664525)+1013904223)>>>0;
  const desvio=2*inimigo.sementeAviso/4294967296-1;
  return modo.aviso*(1+desvio*modo.variacaoAviso);
}

function duracaoAviso(golpe,fator,cadencia){
  const [minimo,maximo]=golpe.limitesAviso;
  return limitar(golpe.aviso*fator*cadencia,minimo,maximo);
}

function iniciarAtaque(jogo, inimigo, modo, encadeado=false){
  const heroi=jogo.heroi;
  const etapa=inimigo.guardiao?.etapas[inimigo.faseChefe-1];
  const padrao=inimigo.padrao||etapa?.padrao||TIPOS[inimigo.tipo].padrao||PADROES[inimigo.tipo];
  const temAtaqueDeCiclo=etapa&&inimigo.faseChefe>1&&jogo.perfil.ciclo>1;
  const indice=encadeado?-1:inimigo.indice++%(padrao.length+Number(!!temAtaqueDeCiclo));
  const ataque=encadeado?TIPOS[inimigo.tipo].encadeia:indice===padrao.length?inimigo.guardiao.ciclo:padrao[indice];
  inimigo.sequenciaAtaques++;
  inimigo.golpeEncadeado=encadeado;
  inimigo.encadeamentos=encadeado?inimigo.encadeamentos+1:0;
  inimigo.ataqueId=ataque==='imitar'?ataqueImitado(inimigo):ataque;
  const golpe=GOLPES_INIMIGOS[inimigo.ataqueId];
  inimigo.ataqueNome=(ataque==='imitar'?'Eco · ':'')+golpe.nome;
  inimigo.imparavel=!!golpe.imparavel;
  inimigo.dir=centro(heroi)>=centro(inimigo)?1:-1;
  inimigo.atingiu=false;
  inimigo.janelaGasta=false;
  inimigo.alvoX=limitar(centro(heroi),inimigo.min-14,inimigo.max+14);
  if(golpe.movimento)inimigo.alvoX=limitar(inimigo.alvoX,inimigo.min,inimigo.max);
  inimigo.alvoY=heroi.y+heroi.h*.64-inimigo.h/2;
  inimigo.partidaX=inimigo.x;
  inimigo.partidaY=inimigo.y;
  marcarCampos(jogo,inimigo,golpe);
  const cadencia=etapa?.aviso??[1,.94,.89][inimigo.faseChefe-1];
  estado(inimigo,'aviso',duracaoAviso(golpe,fatorAviso(inimigo,modo),cadencia));
  jogo.emitirSom('aviso');
  jogo.efeito('aviso',centro(inimigo),inimigo.y-3,inimigo.dir);
  const janela=janelaOuro(inimigo,true);
  if(janela&&!inimigo.indicouOuro){
    inimigo.indicouOuro=true;
    jogo.evento('janelaAnunciada',janela.tecnica);
  }
}

function aliadoNoTurno(jogo, inimigo, grupo){
  if(!grupo||inimigo.tipo==='boneco')return null;
  const alvo=centro(jogo.heroi);
  if(Math.abs(centro(inimigo)-alvo)>grupo.raio)return null;
  const altura=pe(inimigo);
  for(const aliado of jogo.inimigos){
    if(aliado===inimigo||aliado.transicao||(aliado.estado!=='aviso'&&aliado.estado!=='impacto'))continue;
    if(aliado.piso!==inimigo.piso&&aliado.arquetipo!=='voador'&&inimigo.arquetipo!=='voador')continue;
    if(Math.abs(centro(aliado)-alvo)<=grupo.raio&&Math.abs(pe(aliado)-altura)<=grupo.altura)return aliado;
  }
  return null;
}

function moverParaFlanco(jogo, inimigo, aliado, grupo, dt){
  const heroi=centro(jogo.heroi), x=centro(inimigo);
  const ladoAliado=Math.sign(centro(aliado)-heroi)||-aliado.dir;
  const alvo=limitar(heroi-ladoAliado*grupo.distanciaFlanco,inimigo.min,inimigo.max);
  if((alvo-heroi)*ladoAliado>=0)return false;
  const velocidade=TIPOS[inimigo.tipo].vel*grupo.velocidadeFlanco;
  const passo=limitar(alvo-x,-velocidade*dt,velocidade*dt);
  const moveu=deslocar(jogo,inimigo,x+passo);
  if(moveu)inimigo.dir=Math.sign(passo)||ladoAliado;
  return moveu;
}

function veAlturaDoHeroi(inimigo, heroi){
  const tipo=inimigo.tipo;
  const limite=inimigo.arquetipo==='voador'?109:tipo==='mini'?32:tipo==='chefe'||tipo==='elite'?58:44;
  return Math.abs(pe(heroi)-pe(inimigo))<=limite;
}

function patrulhar(jogo, inimigo, dt, modo){
  const heroi=jogo.heroi, tipo=TIPOS[inimigo.tipo];
  const x=centro(inimigo), distancia=centro(heroi)-x;
  const lado=Math.sign(distancia)||inimigo.dir;
  const alcanca=veAlturaDoHeroi(inimigo,heroi);
  if(inimigo.arquetipo==='voador')inimigo.y=inimigo.origemY+Math.sin(inimigo.relogio*2.2)*5;
  const aliado=alcanca?aliadoNoTurno(jogo,inimigo,modo.grupo):null;
  if(alcanca&&Math.abs(distancia)<=tipo.visao+inimigo.w*.15&&inimigo.espera<=0){
    if(!aliado){
      iniciarAtaque(jogo,inimigo,modo);
      return;
    }
    if(moverParaFlanco(jogo,inimigo,aliado,modo.grupo,dt))return;
  }
  if(inimigo.tipo==='boneco')return;
  const aproximar=alcanca&&Math.abs(distancia)<tipo.visao+38;
  const dir=aproximar?lado:inimigo.rumo;
  inimigo.dir=dir;
  const destino=x+dir*tipo.vel*(aproximar?1:.55)*dt;
  if(Math.abs(destino-x)>.01&&!deslocar(jogo,inimigo,destino)||destino<=inimigo.min||destino>=inimigo.max)inimigo.rumo=-dir;
}

function preparaCombo(inimigo, modo){
  return modo.combo&&TIPOS[inimigo.tipo].encadeia&&inimigo.encadeamentos<inimigo.limiteEncadeamentos&&
    inimigo.indice>=modo.combo.aCada&&inimigo.indice%modo.combo.aCada===0;
}

function adquirirProjetil(jogo){
  return reservaDeProjeteis.get(jogo)?.pop()??{};
}

function devolverProjetil(jogo,projetil){
  let reserva=reservaDeProjeteis.get(jogo);
  if(!reserva){reserva=[];reservaDeProjeteis.set(jogo,reserva);}
  projetil.autor=null;projetil.golpe=null;
  if(reserva.length<20)reserva.push(projetil);
}

function limparProjeteis(jogo){
  for(const projetil of jogo.projeteis)devolverProjetil(jogo,projetil);
  jogo.projeteis.length=0;
}

function disparar(jogo, inimigo, golpe){
  if(!golpe.onda)return;
  const teia=inimigo.ataqueId==='teia', tipo=golpe.projetil||(teia?'teia':'onda');
  const y=teia||golpe.projetil?inimigo.y+inimigo.h*.53:pe(inimigo)-9;
  const projetil=adquirirProjetil(jogo);
  projetil.x=centro(inimigo)+inimigo.dir*inimigo.w*.5-5;
  projetil.y=y;
  projetil.w=teia?10:12;
  projetil.h=golpe.projetil?5:teia?5:9;
  projetil.dir=inimigo.dir;
  projetil.vel=golpe.onda;
  projetil.queda=golpe.queda||0;
  projetil.vy=golpe.queda?-12:0;
  projetil.vida=golpe.projetil?1.1:1.8;
  projetil.autor=inimigo;
  projetil.tipo=tipo;
  projetil.imparavel=!!golpe.imparavel;
  jogo.projeteis.push(projetil);
}

function dispararDoHeroi(jogo,golpe,acao){
  const h=jogo.heroi,dados=golpe.projetil,projetil=adquirirProjetil(jogo);
  projetil.x=centro(h)-dados.largura/2;
  projetil.y=h.y+h.h*.5-dados.altura/2;
  projetil.w=dados.largura;
  projetil.h=dados.altura;
  projetil.dir=h.dir;
  projetil.vel=dados.velocidade;
  projetil.vida=dados.alcance/dados.velocidade;
  projetil.tipo=dados.tipo;
  projetil.golpe=golpe;
  projetil.acao=acao;
  projetil.aereo=!h.noChao;
  jogo.projeteis.push(projetil);
}

function realocarNoCampo(jogo, inimigo, golpe){
  if(golpe.movimento==='emergir'){
    deslocar(jogo,inimigo,inimigo.alvoX);
    if(golpe.campo==='flanco')inimigo.dir=Math.sign(centro(jogo.heroi)-centro(inimigo))||inimigo.dir;
  }
}

function tocaAlvo(inimigo, heroi, golpe){
  const frente=(centro(heroi)-centro(inimigo))*inimigo.dir;
  return frente>=-inimigo.w*.5-heroi.w*.5+2&&frente<=inimigo.w*.5+heroi.w*.5+golpe.alcance&&
    pe(heroi)-2>inimigo.y-golpe.altura&&heroi.y+3<pe(inimigo)+golpe.altura;
}

function tocaCampo(campo, heroi){
  return heroi.x+heroi.w-2>campo.x&&heroi.x+2<campo.x+campo.w&&pe(heroi)>campo.y-campo.altura&&heroi.y<campo.y+3;
}

function impacto(jogo, inimigo, dt){
  const golpe=GOLPES_INIMIGOS[inimigo.ataqueId], heroi=jogo.heroi;
  const progresso=limitar(inimigo.tempo/inimigo.duracao,0,1);
  if(inimigo.ataqueId==='mergulho'){
    inimigo.x=inimigo.partidaX+(inimigo.alvoX-inimigo.w/2-inimigo.partidaX)*progresso;
    inimigo.y=inimigo.partidaY+(inimigo.alvoY-inimigo.partidaY)*progresso;
  }else if(golpe.movimento==='salto'){
    const x=inimigo.partidaX+(inimigo.alvoX-inimigo.w/2-inimigo.partidaX)*progresso;
    inimigo.x=x;
    inimigo.y=inimigo.partidaY-Math.sin(progresso*Math.PI)*31;
    if(progresso<.78)return;
  }else if(golpe.avanco){
    deslocar(jogo,inimigo,centro(inimigo)+inimigo.dir*golpe.avanco*dt);
    if(golpe.contraforte&&((inimigo.dir<0&&centro(inimigo)<=inimigo.min+.1)||(inimigo.dir>0&&centro(inimigo)>=inimigo.max-.1))){
      abrirGuarda(inimigo,.96);
      jogo.efeito('ruptura',centro(inimigo),pe(inimigo)-4,inimigo.dir);
      jogo.emitirSom('ruptura');
      return;
    }
  }
  if(golpe.projetil)return;
  const janelas=golpe.janelas;
  if(janelas){
    const janela=inimigo.tempo<janelas[0]?1:inimigo.tempo>janelas[1]?2:0;
    if(janela&&janela!==inimigo.ultimoTalho&&tocaAlvo(inimigo,heroi,golpe)){
      inimigo.ultimoTalho=janela;
      jogo.impactoInimigo(inimigo);
    }
  }else{
    if(inimigo.atingiu)return;
    const atingiu=golpe.campo?inimigo.campos.some(campo=>tocaCampo(campo,heroi)):
      inimigo.arquetipo==='voador'?sobrepoe(inimigo,heroi,1):tocaAlvo(inimigo,heroi,golpe);
    if(atingiu){
      inimigo.atingiu=true;
      jogo.impactoInimigo(inimigo);
    }
  }
}

function naAreaDoGuardiao(inimigo,heroi){
  return Math.abs(centro(inimigo)-centro(heroi))<167&&Math.abs(pe(inimigo)-pe(heroi))<70;
}

function atualizarVigilia(jogo, inimigo){
  if(!inimigo.guardiao)return false;
  if(!inimigo.apresentado&&naAreaDoGuardiao(inimigo,jogo.heroi)){
    inimigo.apresentado=true;
    jogo.evento('dica',inimigo.guardiao.entrada);
    jogo.efeito('chefe',centro(inimigo),inimigo.y,-1);
  }
  const proxima=inimigo.guardiao.etapas[inimigo.faseChefe];
  if(!proxima||inimigo.vida>inimigo.vidaMax*proxima.ate||inimigo.transicao||
    (inimigo.faseChefe===2&&(inimigo.indice===0||inimigo.estado==='aviso'))||inimigo.estado==='impacto')return false;
  inimigo.faseChefe++;
  inimigo.indice=0;
  inimigo.transicao=true;
  inimigo.ataqueNome=inimigo.faseChefe===2?'Segunda vigília':'Terceira vigília';
  inimigo.imparavel=false;
  inimigo.campos.length=0;
  estado(inimigo,'aviso',.96);
  jogo.emitirSom('chefe');
  jogo.efeito('chefe',centro(inimigo),inimigo.y,-1);
  return true;
}

function atualizarQueimadura(jogo,inimigo,dt){
  const queimadura=inimigo.queimadura;
  queimadura.tempo-=dt;
  if(queimadura.tempo>1e-8)return;
  queimadura.tempo+=queimadura.intervalo;
  inimigo.vida=Math.max(0,inimigo.vida-queimadura.dano);
  inimigo.flash=.10;
  jogo.efeito('queimadura',centro(inimigo),inimigo.y+inimigo.h*.45);
  if(--queimadura.pulsos===0||inimigo.vida===0)inimigo.queimadura=null;
  if(inimigo.vida===0)jogo.derrotar(inimigo);
}

function atualizarInimigo(jogo, inimigo, dt){
  if(inimigo.estado==='morto')return;
  if(inimigo.queimadura){
    atualizarQueimadura(jogo,inimigo,dt);
    if(inimigo.estado==='morto')return;
  }
  inimigo.relogio+=dt;
  inimigo.flash=Math.max(0,inimigo.flash-dt);
  const distancia=Math.abs(centro(inimigo)-centro(jogo.heroi));
  if(distancia>320&&inimigo.estado==='patrulha')return;
  inimigo.tempo+=dt;
  inimigo.espera=Math.max(0,inimigo.espera-dt);
  if(inimigo.tipo==='ressonante'&&distancia<110&&GOLPES_IMITAVEIS.has(jogo.heroi.acao)){
    inimigo.ultimaAcao=jogo.heroi.acao;
  }
  if(atualizarVigilia(jogo,inimigo))return;
  const modo=dificuldadeDoPerfil(jogo.perfil);
  if(inimigo.estado==='patrulha'){
    patrulhar(jogo,inimigo,dt,modo);
    return;
  }
  // Aviso fixa a direção e as zonas de ataque. O impacto só começa depois da janela inteira.
  if(inimigo.estado==='aviso'){
    inimigo.avisoProgresso=limitar(inimigo.tempo/inimigo.duracao,0,1);
    inimigo.intangivel=!inimigo.transicao&&inimigo.tipo==='escavador'&&inimigo.avisoProgresso>.30;
    if(inimigo.tempo<inimigo.duracao)return;
    if(inimigo.transicao){
      if(aliadoNoTurno(jogo,inimigo,modo.grupo))return;
      inimigo.transicao=false;
      iniciarAtaque(jogo,inimigo,modo);
      return;
    }
    const golpe=GOLPES_INIMIGOS[inimigo.ataqueId];
    estado(inimigo,'impacto',golpe.impacto);
    inimigo.ultimoTalho=0;
    realocarNoCampo(jogo,inimigo,golpe);
    disparar(jogo,inimigo,golpe);
    impacto(jogo,inimigo,dt);
    return;
  }
  if(inimigo.estado==='impacto'){
    impacto(jogo,inimigo,dt);
    if(inimigo.estado==='impacto'&&inimigo.tempo>=inimigo.duracao){
      const etapa=inimigo.guardiao?.etapas[inimigo.faseChefe-1];
      const ritmo=inimigo.tipo==='boneco'?1:inimigo.guardiao?(etapa?.recuperacao??1):modo.recuperacaoPatrulha;
      const recuperacao=preparaCombo(inimigo,modo)?modo.combo.recuperacao:GOLPES_INIMIGOS[inimigo.ataqueId].recupera*ritmo;
      estado(inimigo,'recuperacao',recuperacao*inimigo.ritmo);
      inimigo.imparavel=false;
    }
    return;
  }
  if(inimigo.arquetipo==='voador'&&inimigo.estado==='recuperacao'){
    inimigo.y+=(inimigo.origemY-inimigo.y)*Math.min(1,dt*3.5);
    const x=limitar(centro(inimigo),inimigo.min,inimigo.max);
    inimigo.x+=(x-inimigo.w/2-inimigo.x)*Math.min(1,dt*4);
  }
  if(inimigo.tempo>=inimigo.duracao){
    // Um golpe encadeado passa pelo aviso completo. Perder o alvo ou ceder a
    // iniciativa a outro inimigo encerra a sequência na recuperação atual.
    if(inimigo.estado==='recuperacao'&&preparaCombo(inimigo,modo)&&veAlturaDoHeroi(inimigo,jogo.heroi)&&
      distancia<=TIPOS[inimigo.tipo].visao&&!aliadoNoTurno(jogo,inimigo,modo.grupo)){
      iniciarAtaque(jogo,inimigo,modo,true);
      return;
    }
    estado(inimigo,'patrulha',0);
    const pausa=inimigo.guardiao?.pausa??(inimigo.tipo==='boneco'?.4:modo.pausaPatrulha);
    inimigo.espera=pausa*inimigo.ritmo;
    inimigo.imparavel=false;
    inimigo.campos.length=0;
  }
}
const GOLPES_IMITAVEIS = new Set(['leve','pesado','quebra','estocada','eco','pisada']);

function alvoDoProjetil(inimigos,projetil,xAnterior){
  const esquerda=Math.min(xAnterior,projetil.x),direita=Math.max(xAnterior,projetil.x)+projetil.w;
  let primeiro=null;
  for(const alvo of inimigos){
    if(alvo.estado==='morto'||alvo.intangivel||alvo.x>=direita||alvo.x+alvo.w<=esquerda||
      alvo.y>=projetil.y+projetil.h||pe(alvo)<=projetil.y)continue;
    if(!primeiro||(projetil.dir>0?alvo.x<primeiro.x:alvo.x+alvo.w>primeiro.x+primeiro.w))primeiro=alvo;
  }
  return primeiro;
}

function atualizarProjeteis(jogo, dt, impactoProjetilHeroi){
  for(let numero=jogo.projeteis.length-1;numero>=0;numero--){
    const projetil=jogo.projeteis[numero];
    const xAnterior=projetil.x;
    projetil.x+=projetil.dir*projetil.vel*(projetil.golpe?Math.min(dt,projetil.vida):dt);
    projetil.vida-=dt;
    let apagar=projetil.vida<=0;
    if(projetil.golpe){
      const alvo=alvoDoProjetil(jogo.inimigos,projetil,xAnterior);
      if(alvo){impactoProjetilHeroi(jogo,alvo,projetil);apagar=true;}
    }else{
      projetil.y+=(projetil.vy||0)*dt;
      projetil.vy=(projetil.vy||0)+(projetil.queda||0)*dt;
      const tocou=sobrepoe(jogo.heroi,projetil,1);
      if(tocou)jogo.impactoInimigo(projetil.autor,projetil.imparavel,projetil);
      apagar=apagar||tocou||projetil.autor.estado==='morto';
    }
    if(apagar){
      jogo.projeteis.splice(numero,1);
      devolverProjetil(jogo,projetil);
    }
  }
}
export { criarInimigo, abrirGuarda, duracaoAviso, janelaOuro, naAreaDoGuardiao, atualizarInimigo, dispararDoHeroi, atualizarProjeteis, limparProjeteis };
