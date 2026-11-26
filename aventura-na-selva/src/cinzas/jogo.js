import { FASES } from './fases.js';
import { ATRIBUTOS, BALANCO as B, CINZA_REFAZER, MAXIMO_ATRIBUTO, MINIMO_ATRIBUTO, NIVEL_MAXIMO, TECNICAS } from './ajustes.js';
import { limitar, centro, pe, sobrepoe, criarPisos, posicionar, atualizarPisos, movimentar } from './fisica.js';
import { criarHeroi, recalcularHeroi, atualizarAcao, resolverAcao, impactoInimigo, impactoProjetilHeroi, sofrer } from './combate.js';
import { criarInimigo, naAreaDoGuardiao, atualizarInimigo, atualizarProjeteis, limparProjeteis } from './inimigos.js';
import { criarAmbiente, atualizarAmbiente } from './ambiente.js';
import { bonusEstrela, obterAmuleto, comprarAmuleto, equiparAmuleto, melhorarGravura, melhorarFrasco } from './progresso.js';
import { desbloquear } from './modos.js';
import { cumprirObjetivo, reconhecerObjetivos } from './objetivos.js';
import { custoNivel, indicePoder, nivelDosAtributos, retratoPoder } from './poder.js';

const vazio=()=>{};
const idsAtributos=Object.keys(ATRIBUTOS);
function distancia(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function gravarId(array,id){if(array.includes(id))return false;array.push(id);return true;}

class Jogo {
  constructor(perfil,{salvar=vazio,som=vazio,evento=vazio}={},fases=FASES){
    this.perfil=perfil;this.fases=fases;this.salvar=salvar;this.emitirSom=som;this.evento=evento;
    this.fase=null;this.heroi=null;this.retrato=null;this.emTreino=false;this.concluida=false;this.tempo=0;this.projeteis=[];
  }
  get tecnicasAtivas(){return this.emTreino&&this.preview?[this.preview,this.perfil.equipadas[1]]:this.perfil.equipadas;}
  efeito(tipo,x,y,dir=1,intensidade=1){
    this.evento('efeito',{tipo,x,y,dir,intensidade});
    if(tipo==='perfeito'&&this.conquista('esquiva-precisa'))this.salvarSessao();
  }
  conquista(id){
    if(this.emTreino)return false;
    const item=desbloquear(this.perfil,id);
    if(item)this.evento('conquista',item.nome);
    return Boolean(item);
  }
  dicaCurta(texto){
    if(this.tempo-this.ultimaDica<1.05)return;
    this.ultimaDica=this.tempo;this.evento('dica',texto);
  }
  carregar(id,retomar=false){
    const fase=this.fases.find(f=>f.id===id);if(!fase)return false;
    const p=this.perfil,sessao=retomar&&p.sessao?.fase===id?p.sessao:null;
    this.fase=fase;this.tempo=0;this.ultimaDica=-10;this.dicasVistas=new Set();limparProjeteis(this);
    this.ambiente=criarAmbiente(fase);
    this.ultimaPoeira=0;
    this.viuMomento=false;
    this.emTreino=false;this.antesTreino=null;this.preview=null;this.concluida=false;
    const retomada=sessao&&!sessao.morto&&sessao.vida>0;
    // Uma retomada viva conserva o encontro que estava em curso.
    if(retomada&&sessao.retrato){
      this.retrato=Object.freeze({...sessao.retrato});
      this.registrarMaiorPoder();
    }else this.capturarRetrato();
    this.pisos=criarPisos(fase,p.selados[id]);this.heroi=criarHeroi(p);
    this.criarEncontros(retomada?sessao.derrotados:[]);
    const salvo=p.santuario?.fase===id&&fase.santuarios.find(s=>s.id===p.santuario.id);
    const santuario=retomar&&salvo?salvo:fase.santuarios[0];
    p.santuario={fase:id,id:santuario.id};
    let origem=retomar?santuario:fase.entrada;
    if(retomada){
      this.heroi.vida=limitar(sessao.vida,1,this.heroi.vidaMax);this.heroi.frascos=limitar(sessao.frascos,0,this.heroi.frascosMax);
      if(sessao.seguro&&this.pisos.some(s=>s.estado==='inteiro'&&!['movel','fragil','selado'].includes(s.tipo)&&
        sessao.seguro.x>=s.x+1&&sessao.seguro.x<s.x+s.w&&Math.abs(s.y-sessao.seguro.y)<2))origem=sessao.seguro;
    }
    p.iniciada=true;p.fase=id;posicionar(this,this.heroi,origem);
    this.heroi.seguro={x:origem.x,y:origem.y};
    reconhecerObjetivos(this);
    this.salvarSessao();return true;
  }
  capturarRetrato(){
    this.retrato=Object.freeze(retratoPoder(this.perfil,this.fase));
    this.perfil.maiorPoder=this.retrato.maiorPoder;
  }
  registrarMaiorPoder(){
    const p=this.perfil;
    p.maiorPoder=Math.max(p.maiorPoder??0,this.retrato?.maiorPoder??0,indicePoder(p));
  }
  criarEncontros(derrotados=[]){
    const ciclo=this.perfil.ciclo;
    const extras=ciclo>1?this.fase.inimigosCiclo||[]:[];
    this.inimigos=[...this.fase.inimigos,...extras]
      .filter(inimigo=>!inimigo.cicloMin||inimigo.cicloMin<=ciclo)
      .map(inimigo=>criarInimigo(inimigo,this.fase,this.perfil,derrotados,this.retrato));
  }
  salvarSessao(){
    if(!this.fase||this.emTreino||this.concluida)return;
    const h=this.heroi;
    this.perfil.sessao={fase:this.fase.id,vida:h.vida,frascos:h.frascos,morto:h.vida<=0,retrato:this.retrato,
      derrotados:this.inimigos.filter(i=>i.estado==='morto').map(i=>i.id),seguro:{...h.seguro}};
    this.salvar(this.perfil);
  }
  venceuEncontro(id){return this.perfil.coletas[this.fase.id].includes('v:'+id)||this.perfil.chefes[this.fase.id].includes(id);}
  portaAberta(porta){return porta.alvos.every(id=>this.venceuEncontro(id));}
  receberGolpe(valor,dir=-1,permitePostura=false){return sofrer(this,valor,dir,permitePostura);}
  impactoInimigo(i,imparavel,projetil){return impactoInimigo(this,i,imparavel,projetil);}
  morrer(queda){
    const h=this.heroi,p=this.perfil;
    if(h.acao==='morto'||this.emTreino)return;
    // O ponto seguro é sempre uma superfície estável, inclusive quando o impacto final foi no ar.
    const pos=h.seguro||this.fase.entrada;
    p.mancha=p.ecos>0?{fase:this.fase.id,x:pos.x,y:pos.y,valor:p.ecos}:null;
    p.ecos=0;p.mortes++;h.vida=0;h.vx=h.vy=0;h.acao='morto';h.etapa='livre';h.atingidos.clear();
    this.salvarSessao();this.emitirSom('morte');this.efeito('morte',centro(h),pe(h)-8);
    this.evento('morte',{queda,valor:p.mancha?.valor||0});
  }
  renascer(){
    if(!this.fase||this.heroi.acao!=='morto')return false;
    return this.carregar(this.fase.id,true);
  }
  ganharXP(valor){
    this.perfil.xp+=valor;
  }
  receberAmuleto(id){
    if(!id||!obterAmuleto(this.perfil,id))return false;
    this.conquista('primeiro-amuleto');
    if(this.perfil.amuletos.length>=15)this.conquista('colecao');
    this.emitirSom('estrela');
    this.evento('amuleto',id);
    return true;
  }
  derrotar(i,ecosCritico=0){
    if(i.estado==='morto')return;
    if(i.tipo==='boneco'){
      i.vida=i.vidaMax;i.estado='aberto';i.tempo=0;i.duracao=1.25;this.dicaCurta('Marca completa. O alvo já está pronto para outra prova.');return;
    }
    i.estado='morto';i.vida=0;i.imparavel=false;i.queimadura=null;
    const p=this.perfil,id=this.fase.id;
    if(['chefe','elite','mini'].includes(i.tipo))gravarId(p.chefes[id],i.id);
    if(i.reliquia)this.receberAmuleto(i.reliquia);
    if(gravarId(p.coletas[id],'v:'+i.id)){
      const extra=(this.heroi.classe.ecosExtra??0)+ecosCritico;
      p.ecos+=i.ecos+extra;this.ganharXP(i.xp);
      if(extra)this.efeito('eco-extra',centro(i),i.y);
    }
    if(i.tipo==='chefe')cumprirObjetivo(this,'duelo',i.id);
    if(i.tipo==='mini')cumprirObjetivo(this,'relicario',i.id);
    this.efeito('ruptura',centro(i),pe(i)-8);
    if(i.tipo==='chefe'){
      this.conquista('primeiro-guardiao');
      this.emitirSom('vitoria');this.dicaCurta(i.nome+' caiu. O selo está aberto.');
    }
    this.salvarSessao();
  }
  coletar(){
    const p=this.perfil,f=this.fase,h=this.heroi,ponto={x:centro(h),y:h.y+h.h*.49};
    let mudou=false;
    for(const item of f.moedas){
      if(p.coletas[f.id].includes(item.id)||distancia(ponto,item)>B.ambiente.alcanceItem)continue;
      p.coletas[f.id].push(item.id);p.ecos+=item.valor;mudou=true;
      this.emitirSom('moeda');this.efeito('moeda',item.x,item.y);
    }
    for(const estrela of f.estrelas){
      if(p.estrelas[f.id].includes(estrela.id)||distancia(ponto,estrela)>B.ambiente.alcanceEstrela)continue;
      p.estrelas[f.id].push(estrela.id);p.ecos+=B.premio.estrela;this.ganharXP(B.premio.xpEstrela);mudou=true;
      cumprirObjetivo(this,'estrela',estrela.id);
      this.emitirSom('estrela');this.efeito('estrela',estrela.x,estrela.y);this.evento('dica','Estrela · '+estrela.nome);
      this.receberAmuleto(bonusEstrela(f.id,estrela.id));
      const total=Object.values(p.estrelas).reduce((soma,estrelas)=>soma+estrelas.length,0);
      this.conquista('primeira-estrela');
      if(total>=15)this.conquista('quinze-estrelas');
      if(total>=45)this.conquista('quarenta-e-cinco');
    }
    if(mudou)this.salvarSessao();
  }
  alvoInteracao(){
    if(!this.fase||this.heroi.acao==='morto'||this.concluida)return null;
    if(this.emTreino)return {tipo:'treino',texto:'Encerrar treino'};
    const f=this.fase,p=this.perfil,h=this.heroi,ponto={x:centro(h),y:pe(h)};
    let melhor=null,menor=Infinity;
    function considerar(tipo,texto,alvo,limite=B.ambiente.alcanceInteracao,extremo='ida'){
      if(!alvo)return;const d=distancia(ponto,alvo);
      if(d<=limite&&d<menor){menor=d;melhor={tipo,texto,alvo,extremo};}
    }
    if(p.mancha?.fase===f.id&&distancia(ponto,p.mancha)<=22)return {tipo:'mancha',texto:'Recuperar '+p.mancha.valor+' ecos',alvo:p.mancha};
    for(const s of f.santuarios)considerar('santuario','Descansar no santuário',s);
    considerar('bento','Conversar com Bento',f.bento,29);
    considerar('treino','Treinar com o autômato',f.treino,22);
    for(const a of f.atalhos){
      const aberto=p.atalhos[f.id].includes(a.id);
      considerar('atalho',aberto?'Voltar pelo atalho':'Abrir atalho',a,24);
      if(aberto)considerar('atalho','Subir pelo atalho',{...a,x:a.paraX,y:a.paraY},24,'volta');
    }
    considerar('saida','Atravessar o portal',f.saida,31);
    return melhor;
  }
  interagir(){
    if(!this.heroi?.noChao&&!this.emTreino)return false;
    const o=this.alvoInteracao();if(!o)return false;
    const p=this.perfil,f=this.fase;
    if(o.tipo==='mancha'){
      const valor=p.mancha.valor;p.ecos+=valor;p.mancha=null;this.conquista('retomada');this.salvarSessao();
      this.emitirSom('recuperar');this.efeito('recuperar',centro(this.heroi),pe(this.heroi)-8);this.evento('dica',valor+' ecos recuperados.');return true;
    }
    if(o.tipo==='santuario')return this.descansar(o.alvo);
    if(o.tipo==='bento'){this.evento('oficina');return true;}
    if(o.tipo==='treino')return this.treinar();
    if(o.tipo==='saida')return this.concluir();
    const a=f.atalhos.find(atalho=>atalho.id===o.alvo.id);
    if(gravarId(p.atalhos[f.id],a.id)){
      cumprirObjetivo(this,'atalho',a.id);
      this.evento('dica','Atalho aberto · '+(a.nome||'Passagem de retorno'));
      this.conquista('primeiro-atalho');
      if(Object.values(p.atalhos).reduce((soma,atalhos)=>soma+atalhos.length,0)>=16)this.conquista('todos-atalhos');
    }else{
      const destino=o.extremo==='ida'?{x:a.paraX,y:a.paraY}:a;
      posicionar(this,this.heroi,destino);this.heroi.seguro={x:destino.x,y:destino.y};this.heroi.invul=.28;
    }
    this.salvarSessao();this.emitirSom('atalho');this.efeito('atalho',centro(this.heroi),pe(this.heroi));return true;
  }
  concluir(){
    if(this.concluida||this.emTreino||this.heroi.vida<=0||!this.perto(this.fase.saida,32))return false;
    if(this.inimigos.some(i=>i.obrigatorio&&!this.venceuEncontro(i.id))){
      this.dicaCurta('O selo espera a queda do seu guardião.');return false;
    }
    const f=this.fase,p=this.perfil;
    if(gravarId(p.concluidas,f.id)){p.ecos+=B.premio.fimFase;this.ganharXP(B.premio.xpFim);}
    p.liberada=Math.max(p.liberada,Math.min(15,f.id+1));p.fase=Math.min(15,f.id+1);p.sessao=null;
    if(p.ciclo>1){
      p.cicloAte=Math.max(p.cicloAte||1,p.fase);
      if(f.id===15)p.cicloConcluido=true;
    }
    if(p.concluidas.length===15)this.conquista('fim-da-jornada');
    const proxima=this.fases.find(outra=>outra.id===p.fase);
    if(proxima)p.santuario={fase:p.fase,id:proxima.santuarios[0].id};
    this.concluida=true;this.salvar(p);this.emitirSom('vitoria');this.evento('faseConcluida',f.id);return true;
  }
  descansar(objeto){
    if(!this.heroi||this.emTreino||this.concluida||this.heroi.vida<=0||!this.heroi.noChao)return false;
    const o=objeto||this.fase.santuarios.find(s=>distancia({x:centro(this.heroi),y:pe(this.heroi)},s)<=B.ambiente.alcanceInteracao);
    if(!o||!this.fase.santuarios.includes(o)||!this.perto(o,B.ambiente.alcanceInteracao))return false;
    const f=this.fase,p=this.perfil;
    cumprirObjetivo(this,'chama',o.id);
    p.santuario={fase:f.id,id:o.id};this.pisos=criarPisos(f,p.selados[f.id],this.tempo);limparProjeteis(this);
    this.capturarRetrato();this.criarEncontros();
    this.ambiente=criarAmbiente(f);
    this.heroi=criarHeroi(p);posicionar(this,this.heroi,o);this.heroi.seguro={x:o.x,y:o.y};
    this.conquista('fogo-amigo');
    this.salvarSessao();this.emitirSom('descanso');this.efeito('descanso',o.x,o.y);
    this.evento('descanso',o.nome||'Santuário');return true;
  }
  perto(ponto,alcance=35){
    return Boolean(ponto&&this.heroi&&distancia({x:centro(this.heroi),y:pe(this.heroi)},ponto)<=alcance);
  }
  podeInvestir(){
    const h=this.heroi;
    return Boolean(h&&h.vida>0&&h.noChao&&!this.emTreino&&!this.concluida&&
      !this.inimigos.some(i=>i.tipo==='chefe'&&i.estado!=='morto'&&naAreaDoGuardiao(i,h)));
  }
  podeMelhorarAtributos(){
    return this.podeInvestir()&&this.fase.santuarios.some(s=>this.perto(s,B.ambiente.alcanceInteracao));
  }
  elevarAtributo(id){
    if(!Object.hasOwn(ATRIBUTOS,id)||!this.podeMelhorarAtributos())return false;
    const p=this.perfil,{atributosBase,nivel}=this.heroi;
    const preco=custoNivel(nivel);
    if(nivel>=NIVEL_MAXIMO||atributosBase[id]>=MAXIMO_ATRIBUTO||p.ecos<preco)return false;
    p.ecos-=preco;
    p.atributos={...atributosBase,[id]:atributosBase[id]+1};
    p.nivel=nivel+1;
    recalcularHeroi(this.heroi,p);
    return this.salvarInvestimento();
  }
  refazerAtributos(distribuicao){
    if(!this.podeMelhorarAtributos()||!distribuicao||typeof distribuicao!=='object'||Array.isArray(distribuicao)||
      Object.keys(distribuicao).length!==idsAtributos.length)return false;
    const p=this.perfil,{atributosBase,nivel}=this.heroi;
    const gratuito=p.refazerGratuito===true;
    if(!gratuito&&!(p.cinzasRefazer>0))return false;
    if(!idsAtributos.every(id=>Object.hasOwn(distribuicao,id)&&Number.isInteger(distribuicao[id])&&
      distribuicao[id]>=MINIMO_ATRIBUTO&&distribuicao[id]<=MAXIMO_ATRIBUTO)||
      nivelDosAtributos(distribuicao)!==nivel||idsAtributos.every(id=>distribuicao[id]===atributosBase[id]))return false;
    p.atributos=Object.fromEntries(idsAtributos.map(id=>[id,distribuicao[id]]));
    p.nivel=nivel;
    if(gratuito)p.refazerGratuito=false;else p.cinzasRefazer--;
    recalcularHeroi(this.heroi,p);
    return this.salvarInvestimento();
  }
  podeComprarCinza(){
    const p=this.perfil,{preco,fase,estoque}=CINZA_REFAZER;
    return this.podeInvestir()&&this.perto(this.fase.bento,29)&&p.liberada>=fase&&p.ecos>=preco&&
      p.cicloDaCinza!==p.ciclo&&(p.cinzasRefazer??0)<estoque;
  }
  comprarCinza(){
    if(!this.podeComprarCinza())return false;
    const p=this.perfil;
    p.ecos-=CINZA_REFAZER.preco;
    p.cinzasRefazer=(p.cinzasRefazer??0)+1;
    p.cicloDaCinza=p.ciclo;
    return this.salvarInvestimento();
  }
  salvarInvestimento(){
    this.registrarMaiorPoder();
    this.salvarSessao();
    this.emitirSom('compra');
    return true;
  }
  comprar(id){
    const p=this.perfil,t=TECNICAS.find(t=>t.id===id);
    if(!t||!this.podeInvestir()||!this.perto(this.fase.bento)||p.compradas.includes(id)||p.liberada<t.fase||p.ecos<t.preco)return false;
    p.ecos-=t.preco;p.compradas.push(id);
    const livre=p.equipadas.indexOf(null);if(livre>=0)p.equipadas[livre]=id;
    this.conquista('primeira-gravura');
    if(p.compradas.length===TECNICAS.length)this.conquista('seis-gravuras');
    return this.salvarInvestimento();
  }
  investir(acao,id,slot){
    if(!this.podeInvestir())return false;
    const perfil=this.perfil;
    const emBento=this.perto(this.fase.bento);
    const emSantuario=this.fase.santuarios.some(santuario=>this.perto(santuario));
    let ok=false;
    if(acao==='equiparAmuleto'&&(emBento||emSantuario)){
      ok=equiparAmuleto(perfil,id||null,slot);
      if(ok)recalcularHeroi(this.heroi,perfil);
    }else if(emBento){
      if(acao==='comprarAmuleto'){
        ok=comprarAmuleto(perfil,id);
        if(ok){
          this.conquista('primeiro-amuleto');
          if(perfil.amuletos.length>=15)this.conquista('colecao');
        }
      }else if(acao==='melhorarGravura'){
        ok=melhorarGravura(perfil,id);
        if(ok&&perfil.gravuras[id]===3)this.conquista('gravura-mestra');
      }else if(acao==='melhorarFrasco'){
        ok=melhorarFrasco(perfil);
        if(ok){
          recalcularHeroi(this.heroi,perfil);
          if(perfil.frascoNivel===3)this.conquista('frasco-mestre');
        }
      }
    }
    return ok&&this.salvarInvestimento();
  }
  equipar(id,slot){
    const p=this.perfil;
    if(![0,1].includes(slot)||(id!==null&&!p.compradas.includes(id))||
      !(this.emTreino||this.podeInvestir()&&(this.perto(this.fase.bento)||this.fase.santuarios.some(s=>this.perto(s)))))return false;
    const outro=1-slot;
    if(id&&p.equipadas[outro]===id)p.equipadas[outro]=p.equipadas[slot];
    p.equipadas[slot]=id;
    this.registrarMaiorPoder();
    if(this.emTreino)this.salvar(p);else this.salvarSessao();
    return true;
  }
  treinar(tecnica){
    if(this.emTreino){
      limparProjeteis(this);
      this.heroi=this.antesTreino.heroi;this.inimigos=this.antesTreino.inimigos;this.projeteis=this.antesTreino.projeteis;
      this.emTreino=false;this.antesTreino=null;this.preview=null;
      posicionar(this,this.heroi,this.fase.bento);this.heroi.seguro={...this.fase.bento};this.salvarSessao();this.evento('oficina');return true;
    }
    if(!this.perto(this.fase.treino,32)&&!this.perto(this.fase.bento,32))return false;
    this.antesTreino={heroi:this.heroi,inimigos:this.inimigos,projeteis:this.projeteis};this.emTreino=true;
    this.preview=TECNICAS.some(t=>t.id===tecnica)?tecnica:null;
    this.heroi=criarHeroi(this.perfil);this.projeteis=[];
    const pos=this.fase.treino,piso=this.pisos.find(s=>s.estado!=='ausente'&&pos.x>=s.x&&pos.x<s.x+s.w&&Math.abs(s.y-pos.y)<4);
    this.quadra={x:piso?.x??pos.x-64,w:piso?.w??130,y:pos.y};
    const alvo=limitar(pos.x+16,this.quadra.x+33,this.quadra.x+this.quadra.w-16);
    posicionar(this,this.heroi,{x:alvo-37,y:pos.y});this.heroi.seguro={x:alvo-37,y:pos.y};
    this.inimigos=[criarInimigo({id:'alvo-de-bento',tipo:'boneco',x:alvo,y:pos.y,min:alvo,max:alvo},this.fase,this.perfil)];
    this.evento('dica','Treino da oficina · observe a arma do autômato. Interaja para voltar.');return true;
  }
  atualizar(dt,entrada={}){
    const h=this.heroi;
    if(!h||h.vida<=0||this.concluida||dt<=0)return;
    dt=Math.min(dt,.06);this.tempo+=dt;
    if(entrada.interagir&&this.interagir())return;
    atualizarPisos(this,dt);atualizarAcao(this,dt,entrada);
    if(!this.emTreino)atualizarAmbiente(this,dt);
    if(h.vida<=0)return;
    const pouso=movimentar(this,dt,entrada);resolverAcao(this,pouso);
    if(h.noChao&&h.acao==='livre'&&Math.abs(h.vx)>85&&this.tempo-this.ultimaPoeira>.13){
      this.ultimaPoeira=this.tempo;
      this.efeito('corrida',centro(h)-h.dir*4,pe(h),h.dir);
    }
    if(this.emTreino){
      h.x=limitar(h.x,this.quadra.x+1,this.quadra.x+this.quadra.w-h.w-1);
      if(h.y>B.vazio)posicionar(this,h,{x:this.quadra.x+this.quadra.w/2,y:this.quadra.y});
    }else{
      if(h.y>B.vazio){this.morrer(true);return;}
      for(const perigo of this.fase.espinhos)if(sobrepoe(h,perigo,2)){this.receberGolpe(B.vida.danoEspinhos,-h.dir);break;}
      if(h.vida<=0)return;
    }
    for(const inimigo of this.inimigos){atualizarInimigo(this,inimigo,dt);if(h.vida<=0)return;}
    atualizarProjeteis(this,dt,impactoProjetilHeroi);
    if(!this.emTreino&&h.vida>0){
      this.coletar();
      const cx=centro(h);
      for(const d of this.fase.dicas){
        if(!this.dicasVistas.has(d.x)&&Math.abs(cx-d.x)<24&&Math.abs(pe(h)-d.y)<48){
          this.dicasVistas.add(d.x);this.dicaCurta(d.texto);
        }
      }
      const momento=this.fase.momento;
      if(momento&&!this.viuMomento&&Math.abs(cx-momento.x)<32&&Math.abs(pe(h)-momento.y)<55){
        this.viuMomento=true;
        this.evento('momento',momento.nome+' · '+momento.texto);
      }
    }
  }
}
export { Jogo };
