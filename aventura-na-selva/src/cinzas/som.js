import { MotorAudio } from '../audio/motorAudio.js';
import { frequencia } from '../audio/trilhas.js';

// Frequências e envelopes de síntese, em Hz e segundos. Os ataques emitem o impacto no quadro de contato.
const TIMBRES={
  pulo:[180,330,.09,'triangle'],pouso:[104,61,.07,'triangle'],pedra:[125,65,.15,'sawtooth'],
  leve:[165,265,.075,'triangle'],pesado:[109,67,.18,'triangle'],impacto:[214,62,.095,'sawtooth'],
  dano:[158,47,.19,'sawtooth'],esquiva:[260,117,.13,'triangle'],perfeito:[623,1180,.17,'sine'],
  vigor:[123,91,.085,'square'],cura:[416,829,.33,'sine'],retorno:[587,1174,.15,'triangle'],
  quebra:[190,48,.26,'sawtooth'],aparo:[989,1480,.18,'square'],estocada:[210,740,.14,'triangle'],
  pisada:[96,38,.33,'triangle'],eco:[880,523,.19,'sine'],aviso:[252,315,.13,'triangle'],
  ruptura:[141,51,.24,'square'],guarda:[330,220,.13,'square'],estrela:[698,1397,.34,'sine'],
  moeda:[880,1174,.12,'sine'],descanso:[261,523,.44,'triangle'],atalho:[196,392,.27,'triangle'],
  morte:[130,55,.65,'triangle'],recuperar:[392,784,.37,'sine'],compra:[523,784,.21,'triangle'],
  vitoria:[392,987,.52,'triangle'],chefe:[110,82,.45,'sawtooth'],menu:[349,466,.08,'triangle'],
  erro:[147,104,.11,'triangle'],treino:[330,659,.18,'triangle'],ponte:[130,78,.16,'square']
};
const TEMAS=[
  [0,7,-1,10,7,-1,3,-1,0,5,-1,7,-1,3,-1,-1],
  [0,-1,3,7,-1,8,-1,-1,3,2,-1,0,-1,-1,7,-1],
  [0,-1,1,7,-1,8,5,-1,0,-1,3,1,-1,5,-1,-1],
  [0,7,-1,14,-1,10,-1,-1,5,-1,7,2,-1,3,-1,-1],
  [0,-1,6,-1,7,3,-1,-1,1,-1,6,5,-1,3,-1,-1]
];
class Som extends MotorAudio {
  constructor(){super();this.tema='';this.definirTema('menu');}
  definirTema(id){
    if(id===this.tema)return;
    this.tema=id;this.passo=0;this.pararVozes();
    const n=Number(String(id).replace('fase',''))||1,regiao=Math.min(4,Math.floor((n-1)/3));
    this.trilha={raiz:[50,48,46,52,45][regiao],melodia:TEMAS[regiao],bpm:68+(n%3)*4};
    if(id==='oficina'||id==='descanso')this.trilha={raiz:52,bpm:62,melodia:[0,-1,4,-1,7,-1,11,-1,7,-1,2,-1,4,-1,-1,-1]};
    if(id==='menu')this.trilha={raiz:50,bpm:58,melodia:TEMAS[1]};
    if(this.contexto)this.proximaNota=this.contexto.currentTime+.04;
  }
  agendar(){
    const ctx=this.contexto;if(!ctx||ctx.state!=='running'||this.pausado||!this.ligado)return;
    const t=this.trilha,pulso=30/t.bpm;
    if(this.proximaNota<ctx.currentTime-.1)this.proximaNota=ctx.currentTime+.025;
    while(this.proximaNota<ctx.currentTime+.12){
      const i=this.passo%16,n=t.melodia[i],em=this.proximaNota;
      if(n>=0)this.nota(frequencia(t.raiz+n+12),pulso*1.8,'sine',.027,em);
      if(i%4===0)this.nota(frequencia(t.raiz+(i<8?0:5)-12),pulso*3.5,'triangle',.042,em);
      if(i===6||i===14)this.nota(113,.14,'triangle',.025,em);
      this.passo++;this.proximaNota+=pulso;
    }
  }
  tocar(id){
    if(!this.contexto||!this.ligado||this.contexto.state!=='running')return;
    const [a,b,t,onda]=TIMBRES[id]||TIMBRES.menu,agora=this.contexto.currentTime;
    this.nota(a,t,onda,id==='menu'?.027:.065,agora);
    this.nota(b,t*.75,'sine',.049,agora+t*.29);
    if(['estrela','vitoria','descanso','recuperar','cura','eco'].includes(id)){
      this.nota(b*1.5,t*.68,'sine',.027,agora+t*.61);
    }
  }
}
export { Som };
