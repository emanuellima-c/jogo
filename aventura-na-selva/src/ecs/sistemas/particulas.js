import { CONFIG as C } from '../../core/configuracoes.js';
import { Pool } from '../../core/pool.js';
import { Aleatorio } from '../../core/aleatorio.js';

class SistemaParticulas {
  constructor() {
    this.pool = new Pool(C.particulas, () => ({ ativo: false, x: 0, y: 0, anteriorX: 0, anteriorY: 0,
      vx: 0, vy: 0, vida: 0, duracao: 1, tamanho: 2, tipo: 0, direcao: 1, cor:'#ffe1a0' }));
    this.rng = new Aleatorio(C.seed);
    this.espera = 0; this.esperaRastro = 0;
  }
  emitir(jogador, quantidade) {
    const t = jogador.transformacao;
    for (let i = 0; i < quantidade; i++) {
      const p = this.pool.obter();
      if (!p) break;
      p.tipo = 0;
      p.x = p.anteriorX = t.x + t.largura / 2;
      p.y = p.anteriorY = t.y + t.altura;
      p.vx = this.rng.entre(-80, 80); p.vy = this.rng.entre(-110, -30);
      p.duracao = p.vida = this.rng.entre(C.duracaoPoeira / 2, C.duracaoPoeira);
      p.tamanho = this.rng.entre(2, 5);
    }
  }
  emitirBrilho(x,y,quantidade=8){
    for(let i=0;i<quantidade;i++){
      const p=this.pool.obter();if(!p)break;p.tipo=2;p.x=p.anteriorX=x;p.y=p.anteriorY=y;
      p.vx=this.rng.entre(-100,100);p.vy=this.rng.entre(-130,25);p.duracao=p.vida=.5;p.tamanho=this.rng.entre(2,4);p.cor='#ffe99b';
    }
  }
  atualizar(jogador, dt) {
    this.espera -= dt; this.esperaRastro -= dt;
    if (Math.abs(jogador.corpo.vx) > C.velocidade / 2 && this.esperaRastro <= 0) {
      const p = this.pool.obter(), t = jogador.transformacao;
      if (p) {
        p.tipo = 1; p.x = p.anteriorX = t.x + t.largura / 2;
        p.y = p.anteriorY = t.y + t.altura; p.vx = p.vy = 0;
        p.duracao = p.vida = C.duracaoRastro; p.direcao = jogador.controle.direcao;
      }
      this.esperaRastro = C.intervaloRastro;
    }
    if (jogador.corpo.noChao && Math.abs(jogador.corpo.vx) > C.velocidade / 2 && this.espera <= 0) {
      this.emitir(jogador, 1); this.espera = C.intervaloPoeira;
    }
    for (let i = 0; i < this.pool.itens.length; i++) {
      const p = this.pool.itens[i];
      if (!p.ativo) continue;
      p.vida -= dt;
      if (p.vida <= 0) { p.ativo = false; continue; }
      p.anteriorX = p.x; p.anteriorY = p.y;
      if (p.tipo !== 1) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += C.gravidade / 5 * dt; }
    }
  }
  limpar() { this.pool.limpar(); this.rng.reiniciar(C.seed); this.espera = 0; this.esperaRastro = 0; }
}

export { SistemaParticulas };
