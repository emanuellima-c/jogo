/* Inicialização com diagnóstico. Scripts locais permitem abrir a pasta por duplo clique. */
(function () {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const aviso = document.getElementById('inicializacao');
  const palco = document.getElementById('palco');
  let encerrada = false;
  let falhou = false;

  function mostrarErro(erro) {
    if (encerrada || falhou) return;
    falhou = true;
    aviso.hidden = false;
    aviso.setAttribute('role', 'alert');
    aviso.textContent = 'Não foi possível abrir o jogo. Extraia o ZIP inteiro e mantenha index.html, iniciar.js e as pastas css, src e compat juntos. Depois reabra index.html. Detalhe: ' + (erro?.message || String(erro));
    palco.setAttribute('aria-busy', 'false');
    palco.dataset.inicializacao = 'erro';
  }
  const aoErro = evento => mostrarErro(evento.error || new Error(evento.message || 'Erro ao carregar um arquivo.'));
  const aoRejeitar = evento => mostrarErro(evento.reason);
  window.addEventListener('error', aoErro);
  window.addEventListener('unhandledrejection', aoRejeitar);

  function carregarScript(caminho) {
    return new Promise((resolver, rejeitar) => {
      const script = document.createElement('script');
      let terminou = false;
      const concluir = erro => {
        if (terminou) return;
        terminou = true;
        clearTimeout(limite);
        script.onload = script.onerror = null;
        if (erro) rejeitar(erro); else resolver();
      };
      const limite = setTimeout(() => concluir(new Error('Tempo esgotado: ' + caminho)), 15000);
      script.src = new URL(caminho, base).href;
      script.async = false;
      script.onload = () => concluir();
      script.onerror = () => concluir(new Error('Arquivo não encontrado ou bloqueado: ' + caminho));
      document.head.appendChild(script);
    });
  }

  async function iniciar() {
    aviso.textContent = 'Preparando sua aventura…';
    palco.dataset.inicializacao = 'carregando';
    if (location.protocol === 'file:') {
      // Cada arquivo de src possui uma cópia executável separada em compat.
      // Somente as declarações são carregadas; main é iniciado quando todas chegam.
      const fabricas = Object.create(null), cache = Object.create(null);
      const registro = {
        arquivos: [],
        registrar(id, fabrica) {
          if (fabricas[id]) throw new Error('Módulo duplicado: ' + id);
          fabricas[id] = fabrica;
        },
        usar(id) {
          if (cache[id]) return cache[id];
          if (!fabricas[id]) throw new Error('Módulo ausente: ' + id);
          const exports = Object.create(null);
          cache[id] = exports;
          try { fabricas[id](exports, registro.usar); }
          catch (erro) { delete cache[id]; throw erro; }
          return exports;
        }
      };
      globalThis.AventuraModulos = registro;
      await carregarScript('compat/manifesto.js');
      if (!registro.arquivos.length) throw new Error('A lista de arquivos do jogo está vazia.');
      await Promise.all(registro.arquivos.map(carregarScript));
      if (falhou) return;
      registro.usar('src/main.js');
    } else {
      // Live Server e hospedagens continuam usando os módulos ES originais.
      await import(new URL('src/main.js', base).href);
    }
    if (falhou) return;
    encerrada = true;
    aviso.hidden = true;
    palco.setAttribute('aria-busy', 'false');
    palco.dataset.inicializacao = 'pronto';
    window.removeEventListener('error', aoErro);
    window.removeEventListener('unhandledrejection', aoRejeitar);
  }
  iniciar().catch(mostrarErro);
})();
