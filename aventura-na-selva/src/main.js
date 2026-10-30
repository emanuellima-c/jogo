import { Entrada } from './core/entrada.js';
import { Engine } from './core/engine.js';
import { exporEstadoGlobal, sessao } from './core/estado.js';
import { Interface } from './render/interface.js';
import { Renderizador } from './render/renderizador.js';
import { MotorAudio } from './audio/motorAudio.js';
import { TelaCheia } from './core/telaCheia.js';
import { validarPerfil } from './core/save.js';
import { executarTestes } from './debug/testes.js';

// Ponto de entrada: os sistemas são importados como módulos ES, sem bibliotecas externas.
exporEstadoGlobal();
let armazenamento=null;
try{armazenamento=window.localStorage;}catch{}
let engine;
const entrada=new Entrada(),audio=new MotorAudio();
function autotestes(){
  const r=executarTestes();interfaceUsuario.mostrarTestes(r);return r;
}
function aoAgir(acao,valor){
  if(!engine)return;
  if(acao==='testes'){autotestes();return;}
  if(acao==='fecharTestes'){interfaceUsuario.ocultarTestes();return;}
  if(acao==='exportar'){
    engine.salvar();const blob=new Blob([JSON.stringify(engine.perfil,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='aventura-na-selva-progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if(acao==='importar'){document.getElementById('importarSave').click();return;}
  engine.agir(acao,valor);
}
const interfaceUsuario=new Interface(aoAgir);
const renderizador=new Renderizador(document.getElementById('jogo'));
engine=new Engine(entrada,interfaceUsuario,renderizador,armazenamento,window.matchMedia('(prefers-reduced-motion: reduce)').matches,audio);
engine.telaCheia=new TelaCheia(document.getElementById('palco'),ativo=>{
  const botao=document.getElementById('botaoTelaCheia');botao.textContent=ativo?'⤢':'⛶';botao.setAttribute('aria-label',ativo?'Sair da tela cheia':'Entrar em tela cheia');botao.setAttribute('aria-pressed',String(ativo));
});
audio.configurar(engine.perfil.opcoes.som,engine.perfil.opcoes.volume);audio.definirTema('menu');
const iniciarAudio=()=>audio.iniciar();
window.addEventListener('pointerdown',iniciarAudio,{once:true});window.addEventListener('keydown',iniciarAudio,{once:true});
function falhar(e){engine.loop.parar();const caixa=document.getElementById('erro');caixa.hidden=false;caixa.textContent='A aventura foi interrompida. Recarregue a página. Detalhe: '+(e.error?.message||e.reason?.message||e.message||'erro desconhecido');}
window.addEventListener('error',falhar);window.addEventListener('unhandledrejection',falhar);
window.addEventListener('blur',()=>engine.suspender());window.addEventListener('focus',()=>engine.retomarFoco());
document.addEventListener('visibilitychange',()=>document.hidden?engine.suspender():engine.retomarFoco());
window.addEventListener('pagehide',()=>{engine.salvar();engine.loop.parar();audio.pausar(true);});
window.addEventListener('pageshow',()=>{engine.loop.iniciar();});
document.getElementById('importarSave').addEventListener('change',async e=>{
  const arquivo=e.target.files?.[0];if(!arquivo)return;
  try{
    if(arquivo.size>1000000)throw new Error('O arquivo de progresso é grande demais.');
    const bruto=JSON.parse(await arquivo.text());if(!bruto||![2,3].includes(bruto.versao))throw new Error('Esse não é um save compatível.');
    const novo=validarPerfil(bruto);engine.perfil=novo;engine.descanso=null;sessao.recorde=novo.recorde;
    engine.carregarFase(novo.fase,false);audio.configurar(novo.opcoes.som,novo.opcoes.volume);engine.salvar();engine.mostrar('MENU');
  }catch(erro){document.getElementById('opcoes').insertAdjacentHTML('beforeend','<p id="erroImportacao" role="alert"></p>');document.getElementById('erroImportacao').textContent='Não foi possível importar: '+erro.message;}
  e.target.value='';
});
if(new URLSearchParams(location.search).get('test')==='1')autotestes();
engine.loop.iniciar();
