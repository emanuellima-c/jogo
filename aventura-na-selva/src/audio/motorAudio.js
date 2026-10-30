import { criarTrilha, frequencia } from './trilhas.js';
const EFEITOS={pulo:[360,710,.1],moeda:[1050,1640,.08],ataque:[210,90,.09],dano:[180,52,.22],dash:[560,130,.14],chefe:[90,55,.2],vitoria:[520,1040,.3],nivel:[660,1320,.22],poder:[780,1560,.3],compra:[540,1080,.16],puzzle:[880,1760,.3],menu:[620,820,.055],erro:[160,110,.12]};
class MotorAudio {
  constructor(){this.contexto=null;this.mestre=null;this.ligado=true;this.volume=.65;this.tema='menu';this.trilha=criarTrilha('menu');this.passo=0;this.proximaNota=0;this.intervalo=0;this.pausado=false;this.vozes=new Set();}
  iniciar(){
    try{
      if(!this.contexto){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.contexto=new Audio();this.mestre=this.contexto.createGain();this.mestre.connect(this.contexto.destination);this.configurar(this.ligado,this.volume);this.proximaNota=this.contexto.currentTime+.04;this.intervalo=setInterval(()=>this.agendar(),35);}
      if(this.contexto.state==='suspended')this.contexto.resume().catch(()=>{});
    }catch{/* Navegadores sem áudio continuam com o jogo funcionando. */}
  }
  configurar(ligado,volume){this.ligado=!!ligado;this.volume=Math.max(0,Math.min(1,Number(volume)||0));if(this.mestre)this.mestre.gain.setTargetAtTime(this.ligado?this.volume:0,this.contexto.currentTime,.035);}
  definirTema(id){if(this.tema===id)return;this.tema=id;this.trilha=criarTrilha(id);this.passo=0;this.pararVozes();if(this.contexto)this.proximaNota=this.contexto.currentTime+.04;}
  pausar(valor){this.pausado=!!valor;if(valor)this.pararVozes();else if(this.contexto)this.proximaNota=Math.max(this.proximaNota,this.contexto.currentTime+.03);}
  nota(freq,duracao,onda,volume,quando){
    const ctx=this.contexto;if(!ctx||ctx.state!=='running'||!this.ligado||this.vozes.size>30)return;
    try{
      const osc=ctx.createOscillator(),ganho=ctx.createGain(),inicio=quando??ctx.currentTime;
      osc.type=onda;osc.frequency.setValueAtTime(freq,inicio);ganho.gain.setValueAtTime(.001,inicio);ganho.gain.exponentialRampToValueAtTime(Math.max(.002,volume),inicio+.008);ganho.gain.exponentialRampToValueAtTime(.001,inicio+duracao);
      osc.connect(ganho);ganho.connect(this.mestre);this.vozes.add(osc);osc.start(inicio);osc.stop(inicio+duracao+.02);
      osc.onended=()=>{osc.disconnect();ganho.disconnect();this.vozes.delete(osc);};
    }catch{}
  }
  agendar(){
    const ctx=this.contexto;if(!ctx||ctx.state!=='running'||this.pausado||!this.ligado)return;
    const t=this.trilha,pulso=60/t.bpm/2;
    if(this.proximaNota<ctx.currentTime-.2)this.proximaNota=ctx.currentTime+.03;
    let limite=0;
    while(this.proximaNota<ctx.currentTime+.13&&limite++<4){
      const indice=this.passo%16,nota=t.melodia[indice],quando=this.proximaNota;
      if(nota>=0)this.nota(frequencia(t.raiz+nota+12),pulso*.72,t.onda,.035,quando);
      if(indice%2===0)this.nota(frequencia(t.raiz-12+t.baixo[Math.floor(indice/4)]),pulso*1.6,'triangle',.052,quando);
      if(indice%4===0)this.nota(65,.08,'triangle',.045,quando);
      else if(indice%2===1)this.nota(1800,.018,'square',.008,quando);
      this.passo++;this.proximaNota+=pulso;
    }
  }
  tocar(tipo){
    if(!this.contexto||!this.ligado||this.contexto.state!=='running')return;
    const t=EFEITOS[tipo]||EFEITOS.moeda,ctx=this.contexto;
    this.nota(t[0],t[2],'triangle',tipo==='menu'?.028:.075,ctx.currentTime);
    if(tipo!=='menu')this.nota(t[1],t[2]*.65,'sine',.055,ctx.currentTime+t[2]*.3);
    if(tipo==='puzzle'||tipo==='vitoria'){this.nota(t[0]*1.25,.15,'square',.035,ctx.currentTime+.12);this.nota(t[0]*1.5,.2,'triangle',.06,ctx.currentTime+.25);}
  }
  pararVozes(){for(const voz of this.vozes){try{voz.stop();}catch{}}this.vozes.clear();}
  destruir(){if(this.intervalo)clearInterval(this.intervalo);this.intervalo=0;this.pararVozes();this.contexto?.close().catch(()=>{});}
}

export { MotorAudio };
