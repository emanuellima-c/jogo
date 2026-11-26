/** Ajuste proporcional independente da Fullscreen API; funciona também no modo janela. */
function enquadrar(largura,altura,proporcao=16/9) {
  const w = Math.max(1,Math.min(largura,altura*proporcao)); return {largura:w,altura:w/proporcao};
}
class TelaCheia {
  constructor(alvo,aoMudar) {
    this.alvo=alvo; this.aoMudar=aoMudar; this.expandida=false; this.pendente=false;
    this.atualizar=this.atualizar.bind(this); this.abortar=new AbortController();
    for(const evento of ['fullscreenchange','webkitfullscreenchange']) document.addEventListener(evento,this.atualizar,{signal:this.abortar.signal});
  }
  estaAtiva() { return !!(document.fullscreenElement || document.webkitFullscreenElement || this.expandida); }
  atualizar() { this.aoMudar?.(this.estaAtiva()); }
  async alternar() {
    if(this.pendente)return; this.pendente=true;
    try {
      const atual=document.fullscreenElement || document.webkitFullscreenElement;
      if(atual) {
        const sair=document.exitFullscreen || document.webkitExitFullscreen;
        if(sair)await sair.call(document);
      } else if(this.expandida) { this.expandida=false; this.alvo.classList.remove('tela-expandida'); }
      else {
        const entrar=this.alvo.requestFullscreen || this.alvo.webkitRequestFullscreen;
        if(entrar)await entrar.call(this.alvo);
        else { this.expandida=true; this.alvo.classList.add('tela-expandida'); }
      }
    } catch {
      // Alguns celulares bloqueiam a API. A área ainda ocupa toda a janela sem distorcer.
      this.expandida=!this.expandida; this.alvo.classList.toggle('tela-expandida',this.expandida);
    } finally { this.pendente=false; this.atualizar(); window.dispatchEvent(new Event('resize')); }
  }
  destruir(){this.abortar.abort();}
}

export { enquadrar, TelaCheia };
