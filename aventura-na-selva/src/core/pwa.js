function oferecerInstalacao(janela, botao, ajuda) {
  let pedido = null;
  botao.hidden = janela.matchMedia('(display-mode: standalone)').matches || janela.navigator.standalone === true;
  janela.addEventListener('beforeinstallprompt', evento => {
    evento.preventDefault();
    pedido = evento;
  });
  janela.addEventListener('appinstalled', () => {
    pedido = null;
    botao.hidden = true;
    ajuda.hidden = true;
  });
  botao.addEventListener('click', async () => {
    if (!pedido) { ajuda.hidden = !ajuda.hidden; return; }
    const atual = pedido;
    pedido = null;
    botao.disabled = true;
    try {
      ajuda.hidden = true;
      await atual.prompt();
    } catch {
      ajuda.hidden = false;
    } finally {
      botao.disabled = false;
    }
  });
}

function oferecerAtualizacao(janela, servico, registro, botao) {
  let atualizando = false;
  const mostrar = () => { botao.hidden = !servico.controller || !registro.waiting; };
  mostrar();
  registro.addEventListener('updatefound', () => {
    registro.installing?.addEventListener('statechange', mostrar);
  });
  botao.addEventListener('click', () => {
    if (!registro.waiting) return;
    atualizando = true;
    botao.disabled = true;
    registro.waiting.postMessage('ATUALIZAR');
  });
  servico.addEventListener('controllerchange', () => {
    if (atualizando) janela.location.reload();
    else mostrar();
  });
}

function iniciarPwa(janela = window, documento = document) {
  if (!janela.isSecureContext || !['http:', 'https:'].includes(janela.location.protocol)) return;
  if (!documento.querySelector('link[rel="manifest"]')) {
    const link = documento.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    documento.head.appendChild(link);
  }
  const servico = janela.navigator.serviceWorker;
  if (!servico) return;
  const painel = documento.getElementById('painelPwa');
  const estado = documento.getElementById('estadoPwa');
  painel.hidden = false;
  oferecerInstalacao(janela, documento.getElementById('instalarJogo'), documento.getElementById('ajudaPwa'));
  return servico.register('./service-worker.js', { updateViaCache: 'none' }).then(registro => {
    oferecerAtualizacao(janela, servico, registro, documento.getElementById('atualizarJogo'));
    const instalando = registro.installing;
    instalando?.addEventListener('statechange', () => {
      if (!registro.active && instalando.state === 'redundant') {
        estado.textContent = 'Modo offline indisponível nesta abertura';
      }
    });
    return servico.ready;
  }).then(() => {
    estado.textContent = 'Pronto para jogar offline';
  }).catch(() => {
    estado.textContent = 'Modo offline indisponível nesta abertura';
  });
}

export { iniciarPwa };
