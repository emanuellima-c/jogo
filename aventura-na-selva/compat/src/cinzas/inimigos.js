// Gerado a partir de src/cinzas/inimigos.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/inimigos.js", function (exports, usar) {
"use strict";
const { BALANCO: B, GOLPES_INIMIGOS: G, GUARDIOES, TIPOS } = usar("src/cinzas/ajustes.js");
const { centro, limitar, pe, sobrepoe } = usar("src/cinzas/fisica.js");
const PADROES={vigia:['corte'],lanceiro:['estocada'],voador:['mergulho'],escudo:['varredura','corte'],elite:['estocada','martelo','investida'],boneco:['corte','estocada','martelo']};
function criarInimigo(d,fase,perfil,derrotados=[]){
  const tipo=TIPOS[d.tipo],guardiao=d.tipo==='chefe'?(GUARDIOES[fase.id]||GUARDIOES[4]):null;
  const largura=guardiao?.w||tipo.w,altura=guardiao?.h||tipo.h;
  const piso=d.y;const y=d.tipo==='voador'?piso-altura/2:piso-altura;
  const vida=Math.round((guardiao?.vida||tipo.vida)*(d.tipo==='boneco'?1:1+.10*Math.min(5,perfil.ciclo-1)));
  const morto=perfil.chefes[fase.id].includes(d.id)||derrotados.includes(d.id);
  return {...d,w:largura,h:altura,x:d.x-largura/2,y,origemX:d.x,origemY:y,
    min:d.min??d.x-30,max:d.max??d.x+30,dir:-1,rumo:-1,vidaMax:vida,vida:morto?0:vida,
    estado:morto?'morto':'patrulha',faseChefe:1,indice:0,tempo:0,relogio:0,espera:.35,
    avisoProgresso:0,imparavel:false,flash:0,atingiu:false,postura:0,ataqueId:'corte',ataqueNome:'Talho',
    guardiao,transicao:false,recente:0,atacouAgora:false,nome:d.nome||({vigia:'Vigia do cipó',lanceiro:'Lanceiro da trilha',
      voador:'Mariposa ferreira',escudo:'Guardião da casca',elite:'Sentinela ancestral',chefe:'Guardião',boneco:'Aprendiz de madeira'})[d.tipo]};
}
function estado(i,novo,duracao){
  i.estado=novo;i.tempo=0;i.duracao=duracao;i.avisoProgresso=0;
}
function abrirGuarda(i,duracao){estado(i,'aberto',duracao);i.postura=0;i.imparavel=false;}
function deslocar(j,i,x){
  const novo=limitar(x,i.min,i.max);
  if(i.tipo!=='voador'&&i.tipo!=='boneco'&&!j.pisos.some(p=>p.estado!=='ausente'&&novo>=p.x+1&&novo<=p.x+p.w-1&&Math.abs(p.y-pe(i))<6))return false;
  i.x=novo-i.w/2;return true;
}
function iniciarAtaque(j,i){
  const h=j.heroi,op=B.dificuldade[j.perfil.opcoes.modo]||B.dificuldade.normal;
  const padrao=i.guardiao?(i.faseChefe===2?i.guardiao.furia:i.guardiao.normal):PADROES[i.tipo];
  i.ataqueId=padrao[i.indice++%padrao.length];
  const golpe=G[i.ataqueId];
  i.ataqueNome=golpe.nome;i.imparavel=!!golpe.imparavel;
  i.dir=centro(h)>=centro(i)?1:-1;i.atingiu=false;
  i.alvoX=limitar(centro(h),i.min-14,i.max+14);i.alvoY=h.y+h.h*.64-i.h/2;
  i.partidaX=i.x;i.partidaY=i.y;
  estado(i,'aviso',golpe.aviso*op.aviso*(i.faseChefe===2?.91:1));
  j.emitirSom('aviso');j.efeito('aviso',centro(i),i.y-3,i.dir);
}
function patrulhar(j,i,dt){
  const h=j.heroi,t=TIPOS[i.tipo],cx=centro(i),dx=centro(h)-cx;
  const vertical=Math.abs(pe(h)-pe(i));
  const alcanca=vertical<=(i.tipo==='voador'?109:i.tipo==='chefe'||i.tipo==='elite'?58:44);
  if(i.tipo==='voador')i.y=i.origemY+Math.sin(i.relogio*2.2)*5;
  if(alcanca&&Math.abs(dx)<=t.visao+i.w*.15&&i.espera<=0){iniciarAtaque(j,i);return;}
  if(i.tipo==='boneco')return;
  const aproximar=alcanca&&Math.abs(dx)<t.visao+38;
  const dir=aproximar?Math.sign(dx)||i.dir:i.rumo;i.dir=dir;
  const destino=cx+dir*t.vel*(aproximar?1:.55)*dt;
  if(Math.abs(destino-cx)>.01&&!deslocar(j,i,destino)||destino<=i.min||destino>=i.max)i.rumo=-dir;
}
function disparar(j,i,g){
  if(!g.onda)return;
  const teia=i.ataqueId==='teia',y=teia?i.y+i.h*.5:pe(i)-9;
  j.projeteis.push({x:centro(i)+i.dir*i.w*.5-5,y,w:teia?10:12,h:teia?5:9,dir:i.dir,vel:g.onda,vida:1.8,autor:i,tipo:teia?'teia':'onda',imparavel:!!g.imparavel});
}
function tocaAlvo(i,h,g){
  const d=centro(h)-centro(i),frente=d*i.dir;
  return frente>=-i.w*.5-h.w*.5+2 && frente<=i.w*.5+h.w*.5+g.alcance &&
    h.y+h.h-2>i.y-g.altura && h.y+3<pe(i)+g.altura;
}
function janelaDupla(i){return i.tempo<.16?1:i.tempo>.31?2:0;}
function impacto(j,i,dt){
  const g=G[i.ataqueId],h=j.heroi;
  if(i.ataqueId==='mergulho'){
    const t=limitar(i.tempo/i.duracao,0,1);
    i.x=i.partidaX+(i.alvoX-i.w/2-i.partidaX)*t;i.y=i.partidaY+(i.alvoY-i.partidaY)*t;
  }else if(g.avanco)deslocar(j,i,centro(i)+i.dir*g.avanco*dt);
  if(i.ataqueId==='duplo'){
    const janela=janelaDupla(i);
    if(!janela||janela===i.ultimoTalho)return;
    if(tocaAlvo(i,h,g)){i.ultimoTalho=janela;j.impactoInimigo(i);}
  }else if(!i.atingiu&&(i.tipo==='voador'?sobrepoe(i,h,1):tocaAlvo(i,h,g))){
    i.atingiu=true;j.impactoInimigo(i);
  }
}
function atualizarInimigo(j,i,dt){
  if(i.estado==='morto')return;
  const cx=centro(i);i.relogio+=dt;i.flash=Math.max(0,i.flash-dt);
  if(Math.abs(cx-centro(j.heroi))>320&&i.estado==='patrulha')return;
  i.tempo+=dt;i.espera=Math.max(0,i.espera-dt);
  if(i.tipo==='chefe'&&i.vida<=i.vidaMax*.5&&i.faseChefe===1&&i.estado!=='impacto'){
    i.faseChefe=2;i.indice=0;i.transicao=true;i.ataqueNome='Segunda vigília';i.imparavel=false;
    estado(i,'aviso',.96);j.emitirSom('chefe');j.efeito('chefe',cx,i.y,-1);return;
  }
  if(i.estado==='patrulha'){patrulhar(j,i,dt);return;}
  if(i.estado==='aviso'){
    i.avisoProgresso=limitar(i.tempo/i.duracao,0,1);
    if(i.tempo<i.duracao)return;
    if(i.transicao){i.transicao=false;iniciarAtaque(j,i);return;}
    const golpe=G[i.ataqueId];
    estado(i,'impacto',golpe.impacto);i.ultimoTalho=0;disparar(j,i,golpe);impacto(j,i,dt);return;
  }
  if(i.estado==='impacto'){
    impacto(j,i,dt);
    if(i.estado==='impacto'&&i.tempo>=i.duracao){estado(i,'recuperacao',G[i.ataqueId].recupera);i.imparavel=false;}
    return;
  }
  if(i.tipo==='voador'&&i.estado==='recuperacao'){
    i.y+=(i.origemY-i.y)*Math.min(1,dt*3.5);
    const x=limitar(centro(i),i.min,i.max);
    i.x+=(x-i.w/2-i.x)*Math.min(1,dt*4);
  }
  if(i.tempo>=i.duracao){
    estado(i,'patrulha',0);i.espera=i.tipo==='chefe'?.18:.4;i.imparavel=false;
  }
}
function atualizarProjeteis(j,dt){
  for(let n=j.projeteis.length-1;n>=0;n--){
    const p=j.projeteis[n];p.x+=p.dir*p.vel*dt;p.vida-=dt;
    const tocou=sobrepoe(j.heroi,p,1);
    if(tocou)j.impactoInimigo(p.autor,p.imparavel);
    if(tocou||p.vida<=0||p.autor.estado==='morto')j.projeteis.splice(n,1);
  }
}
Object.defineProperty(exports, "criarInimigo", { enumerable: true, get: () => criarInimigo });
Object.defineProperty(exports, "abrirGuarda", { enumerable: true, get: () => abrirGuarda });
Object.defineProperty(exports, "atualizarInimigo", { enumerable: true, get: () => atualizarInimigo });
Object.defineProperty(exports, "atualizarProjeteis", { enumerable: true, get: () => atualizarProjeteis });
});
