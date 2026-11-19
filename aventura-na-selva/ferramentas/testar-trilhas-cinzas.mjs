// Exercita a mesma simulação usada no navegador. O piloto só pode ler a sala e enviar controles.
import assert from 'node:assert/strict';
import { FASES } from '../src/cinzas/fases.js';

const obrigatorias = {3:'movel',4:'fragil',5:'movel',8:'movel',9:'fragil',13:'fragil'};
function verificarDesenho(){
  assert.deepEqual(FASES.map(f=>f.id), Array.from({length:15}, (_,i)=>i+1));
  const nomesEstrelas=new Set();
  for(const f of FASES){
    const ids = new Set(f.pisos.map(p=>p.id));
    assert.equal(ids.size,f.pisos.length, 'Pisos duplicados em '+f.nome);
    assert.deepEqual(f.estrelas.map(e=>e.id), ['s1','s2','s3']);
    assert.equal(f.rotas.desvios.length,3);
    assert(f.rotas.principal.every(id=>ids.has(id)), f.nome);
    assert(f.rotas.principal.length>=8, 'Travessia curta em '+f.nome);
    for(const d of f.rotas.desvios){
      assert(ids.has(d.origem)&&ids.has(d.retorno)&&d.caminho.length>=2, f.nome);
      assert(d.caminho.every(id=>ids.has(id)), f.nome);
      nomesEstrelas.add(f.estrelas.find(e=>e.id===d.estrela).nome);
    }
    if(obrigatorias[f.id])assert(f.pisos.some(p=>p.tipo===obrigatorias[f.id]));
    assert(f.santuarios.length>=2);
    assert(f.atalhos.length>0);
    for(const porta of f.portas)assert(porta.alvos.every(id=>f.inimigos.some(e=>e.id===id)), f.nome);
    assert(f.moedas.length<=9, f.nome);
    const elevacoes=f.pisos.filter(p=>f.rotas.principal.includes(p.id)).map(p=>p.y);
    assert(Math.max(...elevacoes)-Math.min(...elevacoes)>=32,'Sem relevo em '+f.nome);
  }
  assert.equal(nomesEstrelas.size,45,'Cada marca de exploração deve ter uma identidade');
  const templo=FASES[4];
  assert.equal(templo.nome,'Templo dos Ecos');
  assert(templo.pisos.some(p=>p.tipo==='fragil')&&templo.inimigos.some(e=>e.tipo==='voador'));
  assert(FASES[14].inimigos.some(e=>e.tipo==='elite')&&FASES[14].inimigos.some(e=>e.tipo==='chefe'));
  console.log('Quinze plantas autorais com 45 desvios, totens, ligadores e encontros coerentes.');
}
verificarDesenho();

import { Jogo } from '../src/cinzas/jogo.js';
import { atualizarPisos, movimentar } from '../src/cinzas/fisica.js';
import { novoPerfil, validar } from '../src/cinzas/perfil.js';
import { TECNICAS } from '../src/cinzas/ajustes.js';

const dt=1/60;
const centro=h=>h.x+h.w/2;
const pe=h=>h.y+h.h;
const piso=(j,id)=>j.pisos.find(p=>p.id===id);
const limitar=(n,a,b)=>Math.max(a,Math.min(b,n));
const esperar=()=>{};
function guiar(h,x){
  const distancia=x-centro(h), frenagem=h.vx*Math.abs(h.vx)/2500;
  return Math.abs(distancia-frenagem)<1.3?0:Math.sign(distancia-frenagem);
}

// Experimenta partidas e durações do salto num modelo local da geometria, sem tocar na sessão.
// A saída é sempre uma lista de comandos. O jogo real aplica inimigos, danos e recompensas.
function planejarPulo(j,destino){
  const de=piso(j,j.heroi.pisoId),para=piso(j,destino);
  if(!de||!para)return null;
  const lado=Math.sign(centro(para)-centro(de))||1, desce=para.y-de.y>12;
  const frente=lado>0?de.w:0,proximo=lado>0?de.w-5:5;
  const relativo=limitar(centro(j.heroi)-de.x,2,de.w-2);
  const partidas=[relativo, proximo, de.w/2, limitar(proximo-lado*24,3,de.w-3),limitar(proximo-lado*42,3,de.w-3),
    limitar(centro(para)-de.x-lado*68,3,de.w-3),limitar(proximo-lado*65,3,de.w-3)];
  const pausas=de.tipo==='movel'||para.tipo==='movel'||para.tipo==='fragil'||para.estado==='ausente'?[0,18,37,62,98,145,210]:[0];
  const duracoes=desce?[0,60,12,3]:[60,21,9];
  const dadosOrigem=new Map(j.pisos.map((p,i)=>[p.id,i]));
  for(const pausa of pausas)for(const saida of new Set(partidas.map(n=>Math.round(n))))for(const duracao of duracoes){
    const modos=desce?[0,lado,-lado]:[0];
    for(const desvio of modos){
      const h={...j.heroi}, terreno=j.pisos.map(p=>({...p}));
      const simulacao={heroi:h,pisos:terreno,fase:j.fase,tempo:j.tempo,portaAberta:p=>j.portaAberta(p),efeito:esperar,emitirSom:esperar};
      const a=terreno[dadosOrigem.get(de.id)],b=terreno[dadosOrigem.get(destino)],comandos=[];
      function avancar(entrada){
        comandos.push(entrada);simulacao.tempo+=dt;atualizarPisos(simulacao,dt);movimentar(simulacao,dt,entrada);
      }
      for(let q=0;q<pausa&&h.pisoId===de.id;q++)avancar({eixo:0});
      for(let q=0;q<170&&h.pisoId===de.id&&Math.abs(centro(h)-a.x-saida)>3;q++){
        avancar({eixo:guiar(h,a.x+saida)});
      }
      if(h.pisoId!==de.id)continue;
      let fora=desvio===0;
      for(let q=0;q<100;q++){
        const borda=desvio>0?a.x+a.w:a.x;
        const alem=desvio>0?centro(h)>borda+h.w/2:centro(h)<borda-h.w/2;
        if(alem&&pe(h)>a.y+1)fora=true;
        const alvo=fora?centro(b):borda+desvio*(h.w/2+10);
        avancar({eixo:guiar(h,alvo),pulo:q===0&&duracao>0,seguraPulo:q<duracao});
        if(h.pisoId===destino && centro(h)>=b.x-2 && centro(h)<=b.x+b.w+2)
          return comandos;
        if(q>7&&h.noChao&&h.pisoId!==de.id)break;
        if(h.y>290 || (q>10 && h.noChao && h.pisoId===de.id && duracao>0))break;
      }
    }
  }
  return null;
}

class Travessia {
  constructor(perfil,tipo,registro=null){
    this.perfil=perfil;this.tipo=tipo;this.quadros=0;this.acoes={saltos:0,esquivas:0,ataques:0,curas:0};this.registro=registro;
    this.j=new Jogo(perfil,{evento:(tipo,dados)=>{if(tipo==='morte')this.ultimaMorte=dados;}});
  }
  passo(entrada={}){
    this.quadros++;
    if(entrada.pulo)this.acoes.saltos++;
    if(entrada.esquiva)this.acoes.esquivas++;
    if(entrada.leve||entrada.pesado)this.acoes.ataques++;
    if(entrada.cura)this.acoes.curas++;
    this.registro?.(entrada);
    this.j.atualizar(dt,entrada);
    const j=this.j,h=j.heroi;
    if(process.env.RASTRO && this.quadros%8===0){
      this.rastro??=[];this.rastro.push([this.etapa,Math.round(centro(h)),Math.round(pe(h)),h.vida,h.acao,h.pisoId,...j.inimigos.filter(i=>i.estado!=='morto'&&Math.abs(centro(i)-centro(h))<100).map(i=>[i.id,i.estado,Math.round(centro(i)),Math.round(pe(i))])]);if(this.rastro.length>34)this.rastro.shift();
    }
    if(h.vida<=0&&process.env.RASTRO)console.log(JSON.stringify(this.rastro));
    if(h.vida<=0)throw new Error('Morte F'+j.fase.id+' em '+this.etapa+' · '+JSON.stringify({x:centro(h),y:pe(h),perda:this.ultimaMorte}));
  }
  irX(x){
    const h=this.j.heroi;
    for(let t=0;t<330;t++){
      if(h.noChao&&Math.abs(centro(h)-x)<=2.5&&Math.abs(h.vx)<35)return;
      const eixo=guiar(h,x);
      const perigo=this.j.fase.espinhos.some(s=>{
        const distancia=eixo>0?s.x-centro(h):centro(h)-s.x-s.w;
        return eixo!==0&&Math.abs(s.y-pe(h))<=15&&distancia>=-4&&distancia<33;
      });
      this.passo({eixo,pulo:h.noChao&&perigo,seguraPulo:true});
    }
    assert.fail('Não caminhou até x='+x+' em F'+this.j.fase.id+' · '+this.etapa+' · '+centro(h)+' / '+h.pisoId);
  }
  lutar(i,base){
    const j=this.j,h=j.heroi;
    this.etapa='combate '+i.id;
    for(let q=0;q<2250 && i.estado!=='morto';q++){
      const dx=centro(i)-centro(h),dist=Math.abs(dx),dir=Math.sign(dx)||h.dir;
      const alvo=limitar(centro(i)-dir*(i.w/2+5),base.x+17,base.x+base.w-17);
      const ameaca=i.estado==='aviso'&&!i.transicao&&i.tempo/i.duracao>.68;
      const proxImpacto=i.estado==='aviso'&&!i.transicao&&i.duracao-i.tempo<.145;
      const grande=i.tipo==='chefe'||i.tipo==='elite';
      const livre=h.acao==='livre'&&h.noChao;
      const colado=dist<i.w/2+30;
      let eixo=guiar(h,alvo),leve=false,pesado=false,cura=false,esquiva=false;
      if(livre&&proxImpacto&&dist<73&&h.vigor>=23){
        eixo=dir;const fim=centro(h)+dir*60;
        if(fim<base.x+9||fim>base.x+base.w-9)eixo=-dir;
        esquiva=true;
      }else if(livre&&h.vida<=h.vidaMax*.48&&h.frascos>0&&
        ((i.estado==='recuperacao'&&i.duracao-i.tempo>.67)||dist>90)){
        cura=true;eixo=0;
      }else if(livre&&colado&&!ameaca){
        eixo=dir;
        const guarda=i.tipo==='escudo'&&i.estado!=='recuperacao'&&i.estado!=='aberto';
        const abertura=i.estado==='aberto'||i.estado==='recuperacao'||i.transicao||i.estado==='patrulha';
        if(h.vigor>=29&&(guarda||abertura)&&(!grande||h.vigor>=42||i.vida<48)){pesado=true;}
        else if(h.vigor>=(grande?40:14))leve=true;
        else eixo=0;
      }else if(colado)eixo=0;
      this.passo({eixo,leve,pesado,cura,esquiva});
    }
    assert.equal(i.estado,'morto','Não venceu '+i.id+' em F'+j.fase.id);
    for(let q=0;q<66&&h.acao!=='livre';q++)this.passo();
  }
  limparEncontro(base){
    const j=this.j;
    for(const d of j.fase.inimigos){
      if(d.x<base.origemX||d.x>base.origemX+base.w||d.y>base.origemY+2||d.y<base.origemY-65)continue;
      const i=j.inimigos.find(p=>p.id===d.id);
      if(i?.estado!=='morto')this.lutar(i,base);
    }
  }
  irPiso(destino){
    const j=this.j;
    if(j.heroi.pisoId===destino)return;
    for(let tent=0;tent<9;tent++){
      const h=j.heroi;
      for(let k=0;k<100&&(!h.noChao||h.acao!=='livre');k++)this.passo({eixo:0,seguraPulo:true});
      if(h.pisoId===destino)return;
      this.etapa=h.pisoId+' → '+destino;
      const a=piso(j,h.pisoId),b=piso(j,destino),lado=Math.sign(centro(b)-centro(h));
      for(const s of j.fase.espinhos){
        if(!a||Math.abs(s.y+s.h-a.y)>3||s.x<a.x||s.x+s.w>a.x+a.w)continue;
        const alem=lado>0?s.x+s.w+18:s.x-18;
        if((alem-centro(h))*lado>2 && (centro(b)-alem)*lado>0) this.irX(alem);
      }
      const fita=planejarPulo(j,destino);
      assert(fita,'Sem salto básico em F'+j.fase.id+' · '+this.etapa+' · x='+Math.round(centro(h))+' y='+Math.round(pe(h)));
      for(const comando of fita){
        this.passo(comando);
        if(h.pisoId===destino)return;
      }
    }
    assert.fail('Imprecisão de percurso F'+j.fase.id+' · '+this.etapa);
  }
  usar(objeto,tipo){
    this.etapa=tipo+' '+objeto.id;
    this.irX(objeto.x);
    assert.equal(this.j.alvoInteracao()?.tipo,tipo,'Interação '+this.etapa+' F'+this.j.fase.id);
    this.passo({interagir:true});
  }
  visitar(pisoId,explorar){
    const j=this.j,base=piso(j,pisoId);
    this.irPiso(pisoId);
    if(explorar){
      for(const s of j.fase.santuarios){
        if(s.x>=base.origemX&&s.x<=base.origemX+base.w&&s.y===base.origemY&&!this.santuarios.has(s.id)){
          this.usar(s,'santuario');this.santuarios.add(s.id);
          assert.equal(j.perfil.santuario.id,s.id);
        }
      }
    }
    this.limparEncontro(base);
    if(explorar){
      for(const a of j.fase.atalhos){
        if(a.x<base.origemX||a.x>base.origemX+base.w||a.y!==base.origemY||j.perfil.atalhos[j.fase.id].includes(a.id))continue;
        this.usar(a,'atalho');assert(j.perfil.atalhos[j.fase.id].includes(a.id));
        this.passo({interagir:true});assert(Math.abs(centro(j.heroi)-a.paraX)<2);
        this.passo({interagir:true});assert(Math.abs(centro(j.heroi)-a.x)<2);
      }
    }
  }
  passarComEco(destino){
    const j=this.j,h=j.heroi,a=piso(j,h.pisoId),b=piso(j,destino);
    const dir=Math.sign(centro(b)-centro(a));
    assert(j.tecnicasAtivas[0]==='eco'&&a);
    // Leva embalo até a borda e guarda o passo para a descida.
    for(let q=0;q<100&&h.vigor<25;q++)this.passo();
    const alvo=dir>0?a.x+a.w-1:a.x+1;
    for(let q=0;q<80&&(alvo-centro(h))*dir>1.5;q++)this.passo({eixo:dir});
    let usou=false;
    for(let q=0;q<120;q++){
      const t1=!usou&&h.vy>130&&!h.noChao;
      if(t1)usou=true;
      this.passo({eixo:guiar(h,centro(b)),pulo:q===0,seguraPulo:true,t1});
      if(h.pisoId===destino){assert(usou,'O vão do eco requer o deslocamento aéreo');return;}
    }
    assert.fail('Deslocamento do eco até '+destino+' em '+Math.round(centro(h)));
  }
  segredo(origem){
    const j=this.j,f=j.fase;
    const alvo=f.rotas.segredos.find(s=>s.origem===origem);
    if(!alvo||this.segredos.has(origem)||j.tecnicasAtivas[0]!==alvo.tecnica)return;
    const destino=piso(j,alvo.destino), item=f.moedas.find(e=>e.x>=destino.x&&e.x<=destino.x+destino.w&&Math.abs(destino.y-e.y)<=19);
    assert(item,'Recompensa do desvio '+alvo.destino);
    assert(!j.perfil.coletas[f.id].includes(item.id),'O prêmio especial já foi coletado na trilha normal');
    this.etapa='segredo '+alvo.tecnica;
    if(alvo.tecnica==='eco'){
      this.passarComEco(alvo.destino);this.irX(item.x);this.passarComEco(origem);
    }else{
      this.irPiso(alvo.selo);this.irX(centro(piso(j,alvo.selo)));
      for(let q=0;q<100&&j.heroi.vigor<31;q++)this.passo();
      this.passo({pulo:true,seguraPulo:true});
      for(let q=0;q<12;q++)this.passo({seguraPulo:true});
      this.passo({t1:true});
      for(let q=0;q<120 && (j.heroi.pisoId!==alvo.destino||j.heroi.acao!=='livre');q++)this.passo();
      assert.equal(j.heroi.pisoId,alvo.destino);assert(j.perfil.selados[f.id].includes(alvo.selo));
      this.irX(item.x);this.irPiso(origem);
    }
    assert(j.perfil.coletas[f.id].includes(item.id));
    this.segredos.add(origem);
  }
  executar(fase,explorar){
    const j=this.j;
    j.carregar(fase.id);this.santuarios=new Set();this.segredos=new Set();this.etapa='início';
    if(explorar){
      this.irX(fase.bento.x);
      for(const t of TECNICAS)if(j.perfil.liberada>=t.fase && j.perfil.ecos>=t.preco && !j.perfil.compradas.includes(t.id))
        assert(j.comprar(t.id));
      for(const s of fase.rotas.segredos)if(j.perfil.compradas.includes(s.tecnica))assert(j.equipar(s.tecnica,0));
    }
    const trilha=fase.rotas.principal;
    for(let pos=0;pos<trilha.length;pos++){
      const id=trilha[pos];
      this.visitar(id,explorar);
      if(explorar){
        this.segredo(id);
        for(const d of fase.rotas.desvios.filter(r=>r.origem===id)){
          for(const passo of d.caminho)this.irPiso(passo);
          this.irX(fase.estrelas.find(s=>s.id===d.estrela).x);
          assert(j.perfil.estrelas[fase.id].includes(d.estrela),'Coleta '+d.estrela+' em F'+fase.id);
          this.segredo(d.caminho.at(-1));
          for(const passo of d.volta)this.irPiso(passo);
          this.visitar(d.retorno,true);
          this.segredo(d.retorno);
          pos=trilha.indexOf(d.retorno);
        }
      }
    }
    this.usar(fase.saida,'saida');
    assert(j.concluida&&j.perfil.concluidas.includes(fase.id),'Portal de '+fase.nome);
    if(explorar){
      assert.equal(j.perfil.estrelas[fase.id].length,3);
      assert.equal(j.perfil.atalhos[fase.id].length,fase.atalhos.length);
      assert.equal(this.santuarios.size,fase.santuarios.length);
      assert.equal(this.segredos.size,fase.rotas.segredos.filter(s=>j.perfil.compradas.includes(s.tecnica)).length);
    }
  }
}
const isolada=Number(process.argv.find(p=>/^--fase=/.test(p))?.slice(7)||0);
const tipos=process.argv.includes('--basico')?['básico']:process.argv.includes('--explorar')?['explorador']:['básico','explorador'];
for(const tipo of tipos){
  const perfil=novoPerfil(),piloto=new Travessia(perfil,tipo);
  for(const f of FASES.filter(f=>!isolada||f.id===isolada)){
    piloto.executar(f,tipo==='explorador');
    console.log(tipo+' · F'+f.id+' · '+f.nome+' · '+perfil.estrelas[f.id].length+' estrelas · '+Math.ceil(piloto.j.tempo)+' s');
  }
  if(!isolada){
    assert.equal(perfil.concluidas.length,15);
    assert.equal(perfil.mortes,0);
    if(tipo==='explorador')assert.equal(perfil.compradas.length,6);
    else assert.equal(perfil.compradas.length,0);
  }
  console.log(tipo+' · nível '+perfil.nivel+' · '+JSON.stringify(piloto.acoes));
}
