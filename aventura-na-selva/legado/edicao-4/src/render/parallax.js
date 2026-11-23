import { CONFIG as C } from '../core/configuracoes.js';
import { pintarPrimeiroPlano } from './paisagens.js';

class Parallax {
  constructor(paisagens){this.paisagens=paisagens;this.mundo=-1;}
  preparar(numero,descanso){
    const imagem=this.paisagens[descanso?5:numero];
    if(this.imagem!==imagem){
      this.imagem=imagem;
      this.fundo=document.createElement('canvas');
      this.fundo.width=imagem.naturalWidth;this.fundo.height=imagem.naturalHeight;
      const c=this.fundo.getContext('2d',{alpha:false});
      c.drawImage(imagem,0,0);
      c.fillStyle='#22213c55';c.fillRect(0,0,this.fundo.width,this.fundo.height);
    }
    if(this.mundo!==numero){this.mundo=numero;this.relevo=pintarPrimeiroPlano(numero);}
  }
  desenhar(ctx,cameraX,largura,limite){
    const panorama=Math.max(largura+100,760);
    const deslocamento=Math.round((panorama-largura)*Math.min(1,cameraX/Math.max(1,limite)));
    ctx.drawImage(this.fundo,-deslocamento,0,panorama,C.altura);
    const x=-((Math.round(cameraX*.24/2)*2)%C.largura);
    ctx.drawImage(this.relevo,x,0,C.largura,C.altura);
    if(x)ctx.drawImage(this.relevo,x+C.largura,0,C.largura,C.altura);
  }
}
export { Parallax };
