// Gerado a partir de src/cinzas/entrada.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/cinzas/entrada.js", function (exports, usar) {
"use strict";
const TECLAS={
  ArrowLeft:'esq',KeyA:'esq',ArrowRight:'dir',KeyD:'dir',Space:'pulo',ArrowUp:'pulo',KeyW:'pulo',
  KeyJ:'leve',KeyX:'leve',KeyK:'pesado',KeyZ:'pesado',ShiftLeft:'esquiva',ShiftRight:'esquiva',KeyL:'esquiva',
  KeyE:'interagir',KeyF:'cura',KeyQ:'t1',KeyR:'t2'
};

class EntradaCinzas {
  constructor(emPartida,atalho) {
    this.fontes=new Map();this.pulsos=new Set();this.toque=window.matchMedia('(any-pointer: coarse)').matches;
    this.botoes=[...document.querySelectorAll('[data-controle]')];
    window.addEventListener('keydown',e=>{
      if(e.code!=='Escape'&&/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
      if(['Escape','KeyP','KeyM'].includes(e.code)){
        if(!e.repeat){e.preventDefault();atalho(e.code);}return;
      }
      if(!emPartida()||!TECLAS[e.code]||e.metaKey||e.ctrlKey||e.altKey)return;
      e.preventDefault();this.toque=false;if(!e.repeat)this.apertar('k'+e.code,TECLAS[e.code]);
    });
    window.addEventListener('keyup',e=>{
      const chave='k'+e.code;if(this.fontes.has(chave)){e.preventDefault();this.soltar(chave);}
    });
    for(const botao of this.botoes){
      botao.addEventListener('pointerdown',e=>{
        if(!emPartida()||e.button!==0)return;e.preventDefault();this.toque=true;
        botao.setPointerCapture(e.pointerId);this.apertar('t'+e.pointerId,botao.dataset.controle);
      });
      for(const tipo of ['pointerup','pointercancel','lostpointercapture'])
        botao.addEventListener(tipo,e=>this.soltar('t'+e.pointerId));
      botao.addEventListener('contextmenu',e=>e.preventDefault());
    }
  }
  ativa(acao){for(const valor of this.fontes.values())if(valor===acao)return true;return false;}
  apertar(chave,acao){
    if(!this.ativa(acao))this.pulsos.add(acao);
    this.fontes.set(chave,acao);this.pintar();
  }
  soltar(chave){if(this.fontes.delete(chave))this.pintar();}
  pintar(){for(const b of this.botoes)b.classList.toggle('ativo',this.ativa(b.dataset.controle));}
  limpar(){this.fontes.clear();this.pulsos.clear();this.pintar();}
  ler(){
    const a={eixo:Number(this.ativa('dir'))-Number(this.ativa('esq')),seguraPulo:this.ativa('pulo'),
      seguraT1:this.ativa('t1'),seguraT2:this.ativa('t2')};
    for(const pulso of this.pulsos)a[pulso]=true;this.pulsos.clear();return a;
  }
}
Object.defineProperty(exports, "EntradaCinzas", { enumerable: true, get: () => EntradaCinzas });
});
