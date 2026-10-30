// Gerado a partir de src/render/interfaceBase.js. Edite o original e execute npm run preparar.
globalThis.AventuraModulos.registrar("src/render/interfaceBase.js", function (exports, usar) {
"use strict";
const { ESTADOS: E } = usar("src/core/configuracoes.js");
const { FASES, MUNDOS } = usar("src/fases/campanha.js");
const { PODERES, PODER_POR_ID, RARIDADES } = usar("src/dados/poderes.js");
const { estatisticas, xpNecessario } = usar("src/meta/progressao.js");
const { desafiosDaFase } = usar("src/meta/desafios.js");
function formatarTempo(tempo) { return Math.floor(tempo / 60) + ':' + String(Math.floor(tempo % 60)).padStart(2, '0'); }
const estrelas = n => '★'.repeat(n) + '☆'.repeat(3 - n);
class Interface {
  constructor(aoAgir) {
    this.palco = document.getElementById('palco'); this.telas = document.getElementById('telas');
    this.paineis = document.querySelectorAll('[data-tela]'); this.cache = Object.create(null); this.elementos = {};
    for (const id of ['pontos','vidas','combo','nivel','xp','xpTexto','mundo','fase','estrelas','progresso','nomeFase','tempo','estadoEscudo','dash','chefeHud','nomeChefe','faseChefe','vidaChefe','aviso','avisoSave']) this.elementos[id] = document.getElementById(id);
    this.pausa = document.getElementById('botaoPausa'); this.abortar = new AbortController();
    this.palco.addEventListener('click', evento => {
      const botao = evento.target.closest('[data-acao]');
      if (botao && !botao.disabled) aoAgir(botao.dataset.acao, botao.dataset.valor);
      else if (evento.target === this.pausa && !this.pausa.disabled) aoAgir('pausa');
    }, { signal: this.abortar.signal });
  }
  texto(id, valor) { if (this.cache[id] !== valor) { this.elementos[id].textContent = valor; this.cache[id] = valor; } }
  trocarTela(estado, sessao, mundo, engine) {
    this.palco.dataset.estado = estado; this.telas.hidden = estado === E.JOGANDO;
    for (const painel of this.paineis) painel.hidden = painel.dataset.tela !== estado;
    this.pausa.disabled = estado !== E.JOGANDO;
    const p = engine.perfil;
    if (estado === E.MENU) {
      const quantidade = Object.keys(p.poderes).length;
      document.getElementById('resumoPerfil').innerHTML = `<strong>Nível ${p.nivel}</strong><p>${p.xp} / ${xpNecessario(p.nivel)} XP<br>${quantidade} habilidades · Expedição ${p.ciclo}<br>${p.concluidas.filter(Boolean).length}/15 fases · ${p.estrelas.reduce((a,b)=>a+b,0)}/45 estrelas</p>`;
      document.getElementById('botaoJogar').textContent = p.pendente ? 'Escolher poder pendente →' : 'Continuar · fase ' + p.fase + ' →';
    } else if (estado === E.MAPA) this.montarMapa(engine);
    else if (estado === E.PERSONAGEM) this.montarPersonagem(p);
    else if (estado === E.DESAFIOS) this.montarDesafios(p);
    else if (estado === E.OPCOES) this.montarOpcoes(p);
    else if (estado === E.RECOMPENSA) this.montarCartas(p);
    else if (estado === E.FASE_CONCLUIDA) this.montarResultado(engine);
    else if (estado === E.FIM_DE_JOGO) document.getElementById('pontuacaoFinal').textContent = 'Fase ' + mundo.fase.numero + ' · ' + sessao.pontos + ' pontos · Herói nível ' + p.nivel;
    else if (estado === E.VITORIA) {
      document.getElementById('resumoVitoria').innerHTML = `<p>Expedição ${p.ciclo} concluída. Você chegou ao nível <b>${p.nivel}</b>, reuniu <b>${Object.keys(p.poderes).length} habilidades</b> e encontrou <b>${p.estrelas.reduce((a,b)=>a+b,0)}/45 estrelas</b>.</p><p>Na nova expedição, os inimigos ficam mais fortes e cada fase volta a oferecer um poder. Seu nível e suas habilidades continuam com você.</p>`;
    }
    const alvo = estado === E.JOGANDO ? document.getElementById('jogo') : this.telas.querySelector('section:not([hidden]) button');
    alvo?.focus({ preventScroll: true });
  }
  montarMapa(engine) {
    const p = engine.perfil, liberada = engine.faseDesbloqueada();
    document.getElementById('mapaFases').innerHTML = MUNDOS.map((m, mundo) => `<div class="fases-mundo"><h3>${mundo+1}. ${m.nome}</h3><div class="grade-fases">${FASES.slice(mundo*3,mundo*3+3).map(f => {
      const concluida = p.concluidas[f.numero-1], bloqueada = f.numero > liberada;
      return `<button data-acao="fase" data-valor="${f.numero}" class="botao-fase ${concluida?'concluida':''} ${p.fase===f.numero?'atual':''}" ${bloqueada?'disabled':''}><span>${bloqueada?'🔒':f.chefe?'♛':'↗'} FASE ${f.numero}</span><b>${f.nome}</b><small>${estrelas(p.estrelas[f.numero-1])}${p.tempos[f.numero-1]?' · '+formatarTempo(p.tempos[f.numero-1]):''}</small></button>`;
    }).join('')}</div></div>`).join('');
  }
  montarPersonagem(p) {
    const a = estatisticas(p);
    document.getElementById('tituloPersonagem').textContent = 'Aventureiro · nível ' + p.nivel;
    const atributos = [['Dano',a.dano.toFixed(1)],['Corações',a.coracoes],['Velocidade',Math.round(a.velocidade)],['Chance crítica',Math.round(a.critico*100)+'%'],['Intervalo de ataque',a.intervaloAtaque.toFixed(2)+' s'],['Saltos no ar',a.saltosExtras]];
    document.getElementById('atributos').innerHTML = atributos.map(([nome,valor])=>`<div class="atributo">${nome}<strong>${valor}</strong></div>`).join('');
    const possuidos = PODERES.filter(h => p.poderes[h.id]);
    document.getElementById('inventario').innerHTML = possuidos.length ? possuidos.map(h=>`<article class="poder-adquirido" style="--cor:${RARIDADES[h.raridade].cor}"><b>${h.icone} ${h.nome}</b><small>${RARIDADES[h.raridade].nome} · nível ${p.poderes[h.id]}</small><p>${h.descricao}</p></article>`).join('') : '<p>Conclua sua primeira fase para escolher uma habilidade permanente.</p>';
  }
  montarDesafios(p) {
    document.getElementById('listaDesafios').innerHTML = FASES.map(f => `<div class="grupo-desafios"><h3>${f.numero}. ${f.nome}</h3>${desafiosDaFase(f).map((d,i)=>`<div class="linha-desafio ${p.desafios[f.numero-1]&(1<<i)?'feito':''}">${p.desafios[f.numero-1]&(1<<i)?'✓':'○'} ${d.nome}<small>${d.texto}${f.desafios[i]==='tempo'?' Alvo: '+formatarTempo(f.tempoAlvo)+'.':''} +${40+f.numero*5} XP na primeira conclusão.</small></div>`).join('')}</div>`).join('');
    document.getElementById('ranking').innerHTML = p.ranking.length ? p.ranking.map((r,i)=>`<div class="linha-ranking"><b>${i+1}</b><span>Fase ${r.fase} · ${r.pontos} pts<br>${formatarTempo(r.tempo)} · Expedição ${r.ciclo}</span><b>${r.nota}</b></div>`).join('') : '<p>Suas melhores fases aparecerão aqui.</p>';
  }
  montarOpcoes(p) {
    document.getElementById('opcoes').innerHTML = `<button data-acao="som">Som <b>${p.opcoes.som?'Ligado':'Desligado'}</b></button><button data-acao="movimento">Efeitos de movimento <b>${p.opcoes.movimento?'Ligados':'Reduzidos'}</b></button><h3>Modo da próxima tentativa</h3>${[['normal','Normal · equilíbrio'],['relaxado','Relaxado · 5 corações, inimigos mais lentos'],['desafio','Desafio · 1 coração, +25% XP']].map(([id,nome])=>`<button data-acao="modo" data-valor="${id}" class="${p.opcoes.modo===id?'modo-ativo':''}">${nome}</button>`).join('')}<small>A mudança de modo vale ao entrar ou recomeçar uma fase. O nível e os poderes são compartilhados entre os modos. O ajuste de movimento do sistema também é respeitado.</small>`;
  }
  montarCartas(p) {
    document.getElementById('cartasPoderes').innerHTML = (p.pendente?.opcoes || []).map((id,i)=> {
      const h = PODER_POR_ID[id], raridade = RARIDADES[h.raridade], nivel = p.poderes[id] || 0;
      return `<button class="carta" style="--cor:${raridade.cor}" data-acao="poder" data-valor="${id}"><span class="raridade">${i+1} · ${raridade.nome.toUpperCase()}</span><span class="icone">${h.icone}</span><b>${h.nome}</b><span class="descricao-poder">${h.descricao}</span><span class="nivel-poder">${nivel?'APRIMORAR · '+nivel+' → '+(nivel+1):'NOVA HABILIDADE · NÍVEL 1'}<br>Obter e seguir →</span></button>`;
    }).join('');
  }
  montarResultado(engine) {
    const r = engine.resultado; if (!r) return;
    document.getElementById('resultado').innerHTML = `<span class="resultado-nota">${r.nota}</span><h2>Trilha concluída!</h2><div class="resultado-estrelas">${estrelas(r.estrelas)}</div><div class="resumo-resultado"><span>${formatarTempo(r.tempo)}<br>TEMPO</span><span>${r.pontos} pts<br>PONTOS</span><span>+${r.xp} XP<br>EXPERIÊNCIA</span></div>${r.desafios.map(d=>`<div class="linha-desafio ${d.cumprido?'feito':''}">${d.cumprido?'✓':'○'} ${d.nome}${d.novo?' · bônus recebido':''}</div>`).join('')}<p style="margin-top:12px">${r.primeira?'Uma nova evolução permanente está esperando.':'Fase repetida: experiência recebida. O poder desta fase já foi escolhido nesta expedição.'}</p>`;
    document.getElementById('botaoAvancar').textContent = engine.perfil.pendente ? 'Escolher 1 entre 3 poderes →' : engine.mundo.fase.numero===15 ? 'Ver vitória →' : 'Próxima fase →';
  }
  atualizar(sessao, m, estado, engine) {
    const p = engine.perfil, c = m.jogador.combate;
    if (this.cache.pontosNumero !== sessao.pontos) { this.texto('pontos',String(sessao.pontos).padStart(6,'0')); this.cache.pontosNumero = sessao.pontos; }
    if (this.cache.vidasNumero !== sessao.vidas) {
      this.texto('vidas',sessao.vidas ? '♥'.repeat(sessao.vidas) : '—');
      this.elementos.vidas.setAttribute('aria-label',sessao.vidas+' corações'); this.cache.vidasNumero = sessao.vidas;
    }
    if (this.cache.nivelNumero !== p.nivel) { this.texto('nivel','HERÓI · NÍVEL '+p.nivel); this.cache.nivelNumero = p.nivel; }
    this.elementos.xp.max = xpNecessario(p.nivel); this.elementos.xp.value = p.xp;
    if (this.cache.xpNumero !== p.xp || this.cache.xpNivel !== p.nivel) { this.texto('xpTexto',p.xp+' / '+xpNecessario(p.nivel)+' XP'); this.cache.xpNumero=p.xp; this.cache.xpNivel=p.nivel; }
    if (this.cache.faseNumero !== m.fase.numero) {
      this.texto('fase','FASE '+String(m.fase.numero).padStart(2,'0')+' / 15'); this.texto('nomeFase',m.fase.nome);
      this.texto('mundo',MUNDOS[m.fase.mundo].nome.toUpperCase()); this.cache.faseNumero=m.fase.numero;
    }
    if (this.cache.estrelasNumero !== engine.corrida.estrelas) { this.texto('estrelas',estrelas(engine.corrida.estrelas)); this.cache.estrelasNumero=engine.corrida.estrelas; }
    if (this.cache.comboNumero !== engine.combo) { this.texto('combo','×'+engine.combo); this.cache.comboNumero=engine.combo; }
    const segundo = Math.floor(m.tempo); if (this.cache.segundo !== segundo) { this.texto('tempo',formatarTempo(segundo)); this.cache.segundo=segundo; }
    this.elementos.progresso.value = Math.max(0,Math.min(1,(m.jogador.transformacao.x-m.inicioX)/(m.portalX-m.inicioX)));
    this.elementos.dash.value = 1-c.esperaDash/engine.atributos.recargaDash;
    const escudo = c.escudo ? '⬡ ESCUDO PRONTO' : engine.atributos.recargaEscudo ? '⬡ '+Math.ceil(c.esperaEscudo)+' s' : '⬡ SEM ESCUDO';
    this.texto('estadoEscudo',escudo);
    const chefe = engine.chefe, mostrarChefe = estado===E.JOGANDO && chefe?.ativo && chefe.estado!=='dormindo';
    this.elementos.chefeHud.hidden = !mostrarChefe;
    if (mostrarChefe) { this.texto('nomeChefe',chefe.dados.nome); this.texto('faseChefe','FASE '+chefe.fase+'/3'); this.elementos.vidaChefe.value=chefe.vida/chefe.vidaMaxima; }
    const texto = estado===E.JOGANDO && engine.aviso.tempo>0 ? engine.aviso.texto : '';
    this.texto('aviso',texto); this.elementos.aviso.style.color=engine.aviso.cor;
    this.elementos.avisoSave.hidden=engine.saveDisponivel;
  }
  mostrarTestes(relatorio) { const c=document.getElementById('relatorioTestes'); c.hidden=false; c.textContent=relatorio.texto+'\n\nClique em Continuar para fechar.'; }
  ocultarTestes() { document.getElementById('relatorioTestes').hidden=true; }
  destruir() { this.abortar.abort(); }
}

Object.defineProperty(exports, "formatarTempo", { enumerable: true, get: () => formatarTempo });
Object.defineProperty(exports, "Interface", { enumerable: true, get: () => Interface });
});
