// Exercita a mesma simulação usada no navegador. O piloto só pode ler a sala e enviar controles.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FASES } from '../src/cinzas/fases.js';
import { Jogo } from '../src/cinzas/jogo.js';
import { atualizarPisos, movimentar } from '../src/cinzas/fisica.js';
import { atualizarAmbiente } from '../src/cinzas/ambiente.js';
import { novoPerfil } from '../src/cinzas/perfil.js';
import * as ajustes from '../src/cinzas/ajustes.js';

const { BALANCO, GOLPES_INIMIGOS, TECNICAS } = ajustes;

const obrigatorias = {3:'movel',4:'fragil',5:'movel',8:'movel',9:'fragil',13:'fragil'};
const fasesAmpliadas = new Set([1, 2]);
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
    if(fasesAmpliadas.has(f.id)){
      assert(f.largura>=2500&&f.largura<=3500, 'Largura fora da meta em '+f.nome);
      const pisosPrincipais=f.pisos.filter(piso=>f.rotas.principal.includes(piso.id));
      for(const material of ['movel','fragil']){
        assert(pisosPrincipais.some(piso=>piso.tipo===material), 'Falta piso '+material+' em '+f.nome);
      }
      assert(f.espinhos.length>0&&f.inimigos.length>=4, 'Faltam perigos ou encontros em '+f.nome);
      const chamas=f.santuarios.map(santuario=>santuario.x);
      assert(chamas.length>=3, 'Falta santuário na ampliação de '+f.nome);
      // A primeira pausa ainda faz parte do tutorial. Depois dela, o intervalo é de cerca de 1.200 px.
      for(let i=1;i<chamas.length;i++){
        const distancia=chamas[i]-chamas[i-1];
        assert(distancia>0&&distancia<=1320&&(i===1||distancia>=1080), 'Santuários mal espaçados em '+f.nome);
      }
      assert(f.saida.x-chamas.at(-1)<=1320, 'Portal longe do último santuário em '+f.nome);
    }
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
const motorLocal={Jogo,atualizarPisos,movimentar,atualizarAmbiente,BALANCO,GOLPES_INIMIGOS,TECNICAS};
const centro=h=>h.x+h.w/2;
const pe=h=>h.y+h.h;
const piso=(j,id)=>j.pisos.find(p=>p.id===id);
const limitar=(n,a,b)=>Math.max(a,Math.min(b,n));
const esperar=()=>{};
function guiar(h,x){
  const distancia=x-centro(h), frenagem=h.vx*Math.abs(h.vx)/2500;
  return Math.abs(distancia-frenagem)<1.3?0:Math.sign(distancia-frenagem);
}

function espinhosNoPiso(piso,espinhos){
  return espinhos.filter(espinho=>Math.abs(espinho.y+espinho.h-piso.y)<=3&&
    espinho.x>=piso.x&&espinho.x+espinho.w<=piso.x+piso.w);
}

function alvoDePouso(piso,espinhos,lado,meiaLargura){
  const meio=centro(piso);
  const obstaculo=espinhos.find(espinho=>meio+meiaLargura>espinho.x&&meio-meiaLargura<espinho.x+espinho.w);
  if(!obstaculo)return meio;
  const limite=lado>0?obstaculo.x:obstaculo.x+obstaculo.w;
  const borda=lado>0?piso.x:piso.x+piso.w;
  return (borda+limite)/2;
}

// Experimenta partidas e durações do salto num modelo local da geometria, sem tocar na sessão.
// A saída é sempre uma lista de comandos. O jogo real aplica inimigos, danos e recompensas.
function planejarPulo(j,destino,motor){
  const {atualizarPisos,movimentar,atualizarAmbiente,BALANCO}=motor;
  const dt=BALANCO.passo;
  const de=piso(j,j.heroi.pisoId),para=piso(j,destino);
  if(!de||!para)return null;
  const lado=Math.sign(centro(para)-centro(de))||1, desce=para.y-de.y>12;
  const proximo=lado>0?de.w-5:5;
  const espinhosDoPouso=espinhosNoPiso(para,j.fase.espinhos);
  const pousoRelativo=alvoDePouso(para,espinhosDoPouso,lado,j.heroi.w/2)-para.x;
  const relativo=limitar(centro(j.heroi)-de.x,2,de.w-2);
  const partidas=[relativo, proximo, de.w/2, limitar(proximo-lado*24,3,de.w-3),limitar(proximo-lado*42,3,de.w-3),
    limitar(centro(para)-de.x-lado*68,3,de.w-3),limitar(proximo-lado*65,3,de.w-3)];
  const inicio=Math.min(de.x,para.x),fim=Math.max(de.x+de.w,para.x+para.w);
  const vapor=j.ambiente?.zonas.some(zona=>zona.tipo==='vapor'&&zona.x<fim&&zona.x+zona.w>inicio);
  const sincronizar=vapor||de.tipo==='movel'||para.tipo==='movel'||para.tipo==='fragil'||para.estado==='ausente';
  const pausas=sincronizar?[0,18,37,62,98,145,210]:[0];
  const duracoes=desce?[0,60,12,3]:[60,21,9];
  const dadosOrigem=new Map(j.pisos.map((p,i)=>[p.id,i]));
  for(const pausa of pausas)for(const saida of new Set(partidas.map(n=>Math.round(n))))for(const duracao of duracoes){
    const modos=desce?[0,lado,-lado]:[0];
    for(const desvio of modos){
      const h={...j.heroi,seguro:{...j.heroi.seguro}}, terreno=j.pisos.map(p=>({...p}));
      const simulacao={heroi:h,pisos:terreno,fase:j.fase,tempo:j.tempo,perfil:j.perfil,
        portaAberta:p=>j.portaAberta(p),efeito:esperar,emitirSom:esperar};
      let atingiuPerigo=false;
      if(j.ambiente?.zonas.length){
        simulacao.ambiente={...j.ambiente,zonas:j.ambiente.zonas.map(zona=>({...zona}))};
        simulacao.receberGolpe=()=>{atingiuPerigo=true;return true;};
      }
      const a=terreno[dadosOrigem.get(de.id)],b=terreno[dadosOrigem.get(destino)],comandos=[];
      function avancar(entrada){
        comandos.push(entrada);simulacao.tempo+=dt;atualizarAmbiente(simulacao,dt);
        atualizarPisos(simulacao,dt);movimentar(simulacao,dt,entrada);
      }
      for(let q=0;q<pausa&&h.pisoId===de.id;q++)avancar({eixo:0});
      for(let q=0;q<170&&h.pisoId===de.id&&Math.abs(centro(h)-a.x-saida)>3;q++){
        avancar({eixo:guiar(h,a.x+saida)});
      }
      if(h.pisoId!==de.id||atingiuPerigo)continue;
      let fora=desvio===0;
      for(let q=0;q<100;q++){
        const borda=desvio>0?a.x+a.w:a.x;
        const alem=desvio>0?centro(h)>borda+h.w/2:centro(h)<borda-h.w/2;
        if(alem&&pe(h)>a.y+1)fora=true;
        const alvo=fora?b.x+pousoRelativo:borda+desvio*(h.w/2+10);
        avancar({eixo:guiar(h,alvo),pulo:q===0&&duracao>0,seguraPulo:q<duracao});
        if(atingiuPerigo)break;
        if(h.pisoId===destino && centro(h)>=b.x-2 && centro(h)<=b.x+b.w+2 &&
          !espinhosDoPouso.some(espinho=>h.x+h.w>espinho.x&&h.x<espinho.x+espinho.w))
          return comandos;
        if(q>7&&h.noChao&&h.pisoId!==de.id)break;
        if(h.y>290 || (q>10 && h.noChao && h.pisoId===de.id && duracao>0))break;
      }
    }
  }
  return null;
}

class InterrupcaoTravessia extends Error {
  constructor(causa,mensagem){
    super(mensagem);
    this.causa=causa;
  }
}

class Travessia {
  constructor(perfil,tipo,registro=null,{
    motor=motorLocal,lerCombate,limitarRetencaoSalto,usarSantuarios=false,limiteQuadros=Infinity
  }={}){
    this.perfil=perfil;this.tipo=tipo;this.quadros=0;this.acoes={saltos:0,esquivas:0,ataques:0,curas:0};this.registro=registro;
    this.motor=motor;this.dt=motor.BALANCO.passo;this.lerCombate=lerCombate;
    this.limitarRetencaoSalto=limitarRetencaoSalto;
    this.usarSantuarios=usarSantuarios;this.limiteQuadros=limiteQuadros;this.dano=0;
    this.j=new motor.Jogo(perfil,{evento:(tipo,dados)=>{if(tipo==='morte')this.ultimaMorte=dados;}});
  }
  passo(entrada={}){
    if(this.quadros>=this.limiteQuadros)throw new InterrupcaoTravessia('tempo','Limite de tempo em '+this.etapa);
    this.quadros++;
    if(entrada.pulo)this.acoes.saltos++;
    if(entrada.esquiva)this.acoes.esquivas++;
    if(entrada.leve||entrada.pesado)this.acoes.ataques++;
    if(entrada.cura)this.acoes.curas++;
    if(entrada.talento)this.acoes.talentos=(this.acoes.talentos??0)+1;
    this.registro?.(entrada);
    const j=this.j,vida=j.heroi.vida;
    j.atualizar(this.dt,entrada);
    const h=j.heroi;
    this.dano+=Math.max(0,vida-h.vida);
    if(process.env.RASTRO && this.quadros%8===0){
      this.rastro??=[];this.rastro.push([this.etapa,Math.round(centro(h)),Math.round(pe(h)),h.vida,h.acao,h.pisoId,...j.inimigos.filter(i=>i.estado!=='morto'&&Math.abs(centro(i)-centro(h))<100).map(i=>[i.id,i.estado,Math.round(centro(i)),Math.round(pe(i))])]);if(this.rastro.length>34)this.rastro.shift();
    }
    if(h.vida<=0&&process.env.RASTRO)console.log(JSON.stringify(this.rastro));
    if(h.vida<=0)throw new InterrupcaoTravessia('morte','Morte F'+j.fase.id+' em '+this.etapa+' · '+JSON.stringify({x:centro(h),y:pe(h),perda:this.ultimaMorte}));
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
    throw new InterrupcaoTravessia('navegacao','Não caminhou até x='+x+' em F'+this.j.fase.id+' · '+this.etapa+' · '+centro(h)+' / '+h.pisoId);
  }
  lutar(i,base){
    const j=this.j,h=j.heroi;
    this.etapa='combate '+i.id;
    for(let q=0;q<2250 && i.estado!=='morto';q++){
      if(h.noChao&&h.pisoId!==base.id){
        this.irPiso(base.id);
        this.etapa='combate '+i.id;
      }
      const dx=centro(i)-centro(h),dist=Math.abs(dx),dir=Math.sign(dx)||h.dir;
      const margem=Math.min(28,base.w*.30);
      const alvo=limitar(centro(i)-dir*(i.w/2+5),base.x+margem,base.x+base.w-margem);
      const chefe=i.tipo==='chefe';
      const aviso=i.estado==='aviso'&&!i.transicao;
      const segundoTalho=chefe&&i.estado==='impacto'?this.motor.GOLPES_INIMIGOS[i.ataqueId]?.janelas?.[1]:null;
      const leitura=this.lerCombate?.(j,i);
      const ameaca=leitura?.ameaca??(aviso&&(chefe||i.tempo/i.duracao>.68)||segundoTalho!=null);
      const proxImpacto=leitura?.proxImpacto??((aviso&&i.duracao-i.tempo<.145)||
        (segundoTalho!=null&&i.tempo>=segundoTalho-.12&&i.tempo<segundoTalho));
      const grande=i.tipo==='chefe'||i.tipo==='elite'||i.tipo==='mini';
      const livre=h.acao==='livre'&&h.noChao;
      const aereo=i.arquetipo==='voador';
      const colado=dist<i.w/2+30;
      const alturaAteInimigo=pe(h)-pe(i);
      const margemSegura=centro(h)>base.x+margem-2&&centro(h)<base.x+base.w-margem+2;
      const perigo=ameaca&&i.campos?.find(campo=>centro(h)>campo.x-9&&centro(h)<campo.x+campo.w+9&&pe(h)>campo.y-campo.altura);
      let eixo=guiar(h,alvo),leve=false,pesado=false,cura=false,esquiva=false,pulo=false;
      if(livre&&perigo){
        const destinos=[perigo.x-14,perigo.x+perigo.w+14].filter(x=>x>=base.x+margem&&x<=base.x+base.w-margem&&
          !i.campos.some(campo=>x>campo.x-9&&x<campo.x+campo.w+9)).sort((a,b)=>Math.abs(a-centro(h))-Math.abs(b-centro(h)));
        if(destinos.length)eixo=guiar(h,destinos[0]);
        if(proxImpacto){
          if(perigo.altura<=18)pulo=true;
          else if(h.vigor>=23){esquiva=true;eixo=eixo||dir;}
        }
      }else if(livre&&proxImpacto&&dist<73&&h.vigor>=23){
        eixo=dir*(leitura?.sentido??1);const fim=centro(h)+eixo*60;
        if(fim<base.x+9||fim>base.x+base.w-9)eixo=-eixo;
        esquiva=true;
      }else if(livre&&h.vida<=h.vidaMax*(leitura?.curaVida??.48)&&h.frascos>0&&
        (leitura?.aberturaLida??true)&&((i.estado==='recuperacao'&&i.duracao-i.tempo>(leitura?.curaJanela??.67))||dist>90)){
        cura=true;eixo=0;
      }else if(livre&&aereo&&colado&&alturaAteInimigo>28&&margemSegura&&!ameaca&&h.vigor>=14){
        pulo=true;
      }else if(h.acao==='livre'&&(h.noChao||aereo)&&colado&&margemSegura&&(!aereo||alturaAteInimigo<34)&&!ameaca&&(leitura?.aberturaLida??true)){
        eixo=dir;
        const guarda=i.arquetipo==='escudo'&&i.estado!=='recuperacao'&&i.estado!=='aberto';
        const abertura=i.estado==='aberto'||i.estado==='recuperacao'||i.transicao||i.estado==='patrulha';
        const tempoParaPesado=!chefe||i.estado==='aberto'||i.estado==='recuperacao'&&i.duracao-i.tempo>.48;
        if(h.vigor>=29&&(guarda||abertura)&&tempoParaPesado&&(!grande||h.vigor>=42||i.vida<48)){pesado=true;}
        else if(h.vigor>=(grande?40:14))leve=true;
        else eixo=0;
      }else if(colado&&margemSegura)eixo=0;
      if(proxImpacto&&(esquiva||pulo))leitura?.consumir();
      this.passo({eixo,leve,pesado,cura,esquiva,pulo,seguraPulo:pulo||!h.noChao});
    }
    if(i.estado!=='morto')throw new InterrupcaoTravessia('tempo','Não venceu '+i.id+' em F'+j.fase.id);
    for(let q=0;q<66&&h.acao!=='livre';q++)this.passo();
    if(h.pisoId!==base.id)this.irPiso(base.id);
  }
  limparEncontro(base){
    const j=this.j;
    for(const d of j.fase.inimigos){
      if(d.piso&&d.piso!==base.id)continue;
      if(!d.piso&&(d.x<base.origemX||d.x>base.origemX+base.w||d.y>base.origemY+2||d.y<base.origemY-65))continue;
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
      if(a){
        for(const s of espinhosNoPiso(a,j.fase.espinhos)){
          const alem=lado>0?s.x+s.w+18:s.x-18;
          if((alem-centro(h))*lado>2 && (centro(b)-alem)*lado>0) this.irX(alem);
        }
      }
      const fita=planejarPulo(j,destino,this.motor);
      if(!fita)throw new InterrupcaoTravessia('navegacao','Sem salto básico em F'+j.fase.id+' · '+this.etapa+' · x='+Math.round(centro(h))+' y='+Math.round(pe(h)));
      let retencao=Infinity;
      for(const comando of fita){
        if(comando.pulo)retencao=this.limitarRetencaoSalto?.()??Infinity;
        const soltarCedo=comando.seguraPulo&&retencao--<=0;
        this.passo(soltarCedo?{...comando,seguraPulo:false}:comando);
        if(h.pisoId===destino)return;
      }
    }
    throw new InterrupcaoTravessia('navegacao','Imprecisão de percurso F'+j.fase.id+' · '+this.etapa);
  }
  usar(objeto,tipo){
    this.etapa=tipo+' '+objeto.id;
    this.irX(objeto.x);
    if(this.j.alvoInteracao()?.tipo!==tipo)throw new InterrupcaoTravessia('navegacao','Interação '+this.etapa+' F'+this.j.fase.id);
    this.passo({interagir:true});
  }
  visitar(pisoId,explorar){
    const j=this.j,base=piso(j,pisoId);
    this.irPiso(pisoId);
    if(explorar||this.usarSantuarios){
      for(const s of j.fase.santuarios){
        if(!explorar&&s===j.fase.santuarios[0])continue;
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
  executar(fase,explorar,retomar=false){
    const j=this.j;
    this.etapa=retomar?'retorno ao santuário':'início';
    if(retomar)assert(j.renascer(),'Retomada pela interface do jogo');
    else{
      j.carregar(fase.id);this.santuarios=new Set();this.segredos=new Set();
    }
    if(explorar){
      this.irX(fase.bento.x);
      for(const t of this.motor.TECNICAS)if(j.perfil.liberada>=t.fase && j.perfil.ecos>=t.preco && !j.perfil.compradas.includes(t.id))
        assert(j.comprar(t.id));
      for(const s of fase.rotas.segredos)if(j.perfil.compradas.includes(s.tecnica))assert(j.equipar(s.tecnica,0));
    }
    const trilha=fase.rotas.principal;
    const inicio=retomar?trilha.indexOf(j.heroi.pisoId):0;
    assert(inicio>=0,'Santuário fora da trilha principal em F'+fase.id);
    for(let pos=inicio;pos<trilha.length;pos++){
      const id=trilha[pos];
      this.visitar(id,explorar);
      if(explorar){
        this.segredo(id);
        for(const d of fase.rotas.desvios.filter(r=>r.origem===id)){
          for(const passo of d.caminho)this.irPiso(passo);
          this.irX(fase.estrelas.find(s=>s.id===d.estrela).x);
          assert(j.perfil.estrelas[fase.id].includes(d.estrela),'Coleta '+d.estrela+' em F'+fase.id);
          const origem=d.caminho.at(-1);
          this.segredo(origem);
          for(const relicario of fase.rotas.relicarios.filter(r=>r.origem===origem)){
            this.irPiso(relicario.piso);this.limparEncontro(piso(j,relicario.piso));
            const miniChefe=fase.inimigos.find(inimigo=>inimigo.piso===relicario.piso&&inimigo.reliquia);
            assert(j.perfil.amuletos.includes(miniChefe.reliquia),'Relíquia '+miniChefe.reliquia);
            this.irPiso(origem);
          }
          for(const passo of d.volta)this.irPiso(passo);
          this.visitar(d.retorno,true);
          this.segredo(d.retorno);
          pos=trilha.indexOf(d.retorno);
        }
      }
    }
    this.usar(fase.saida,'saida');
    if(!j.concluida||!j.perfil.concluidas.includes(fase.id))throw new InterrupcaoTravessia('navegacao','Portal de '+fase.nome);
    if(explorar){
      assert.equal(j.perfil.estrelas[fase.id].length,3);
      assert.equal(j.perfil.atalhos[fase.id].length,fase.atalhos.length);
      assert.equal(this.santuarios.size,fase.santuarios.length);
      assert.equal(this.segredos.size,fase.rotas.segredos.filter(s=>j.perfil.compradas.includes(s.tecnica)).length);
    }
  }
}

function percorrerComoClasse(classe,fases){
  const perfil=novoPerfil();
  perfil.classe=classe.id;
  perfil.nivel=classe.nivelInicial;
  const piloto=new Travessia(perfil,classe.nome,entrada=>{
    assert(!entrada.t1&&!entrada.t2,'O kit básico não usa gravuras');
  },{usarSantuarios:true});
  let guardioes=0;
  for(const fase of fases){
    const inicioQuadros=piloto.quadros, inicioMortes=perfil.mortes;
    let retomar=false;
    for(;;){
      try{
        piloto.executar(fase,false,retomar);
        break;
      }catch(erro){
        if(!(erro instanceof InterrupcaoTravessia)||erro.causa!=='morte'||perfil.mortes-inicioMortes>=4)throw erro;
        retomar=true;
      }
    }
    assert.equal(piloto.j.heroi.classe.id,classe.id,'Classe ativa no simulador');
    const guardiao=fase.inimigos.find(inimigo=>inimigo.tipo==='chefe');
    if(guardiao){
      assert(perfil.chefes[fase.id].includes(guardiao.id),'Guardião derrotado com '+classe.nome+' em F'+fase.id);
      guardioes++;
    }
    const segundos=Math.ceil((piloto.quadros-inicioQuadros)*piloto.dt);
    console.log(`${classe.nome} · F${fase.id} · ${fase.nome} · ${perfil.mortes-inicioMortes} mortes · ${segundos} s`);
  }
  assert.equal(perfil.concluidas.length,fases.length);
  if(fases.length===15)assert.equal(guardioes,5);
  assert.equal(perfil.compradas.length,0,'Gravuras compradas');
  assert(perfil.equipadas.every(id=>id===null),'Gravuras equipadas');
  assert(perfil.amuletosEquipados.every(id=>id===null),'Amuletos equipados');
  console.log(`${classe.nome} · ${perfil.concluidas.length} fases · ${guardioes} guardiões · ${perfil.mortes} mortes · kit básico`);
}

function executarCli(){
  verificarDesenho();
  const isolada=Number(process.argv.find(p=>/^--fase=/.test(p))?.slice(7)||0);
  const fases=FASES.filter(fase=>!isolada||fase.id===isolada);
  const todasClasses=process.argv.includes('--classes');
  const classePedida=process.argv.find(arg=>arg.startsWith('--classe='))?.slice(9);
  if(todasClasses||classePedida!==undefined){
    assert(!(todasClasses&&classePedida!==undefined),'Use --classes ou --classe=id');
    assert(!process.argv.includes('--basico')&&!process.argv.includes('--explorar'),'Escolha uma única modalidade de travessia');
    const jogaveis=Object.values(ajustes.CLASSES??{}).filter(classe=>classe.id!=='herdeiro');
    assert(jogaveis.length>=7,'Dados das sete classes jogáveis ausentes');
    const classes=todasClasses?jogaveis:jogaveis.filter(classe=>classe.id===classePedida);
    assert(classes.length,'Classe desconhecida: '+classePedida);
    assert(fases.length,'Fase inexistente: '+isolada);
    for(const classe of classes)percorrerComoClasse(classe,fases);
    return;
  }
  const tipos=process.argv.includes('--basico')?['básico']:process.argv.includes('--explorar')?['explorador']:['básico','explorador'];
  for(const tipo of tipos){
    const perfil=novoPerfil(),piloto=new Travessia(perfil,tipo);
    for(const f of fases){
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
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)executarCli();

export { Travessia, InterrupcaoTravessia };
