import assert from 'node:assert/strict';
import { Jogo } from '../src/cinzas/jogo.js';
import { BALANCO, TECNICAS } from '../src/cinzas/ajustes.js';
import { novoPerfil } from '../src/cinzas/perfil.js';

const passo=1/60;
const piso={id:'base',x:0,y:202,w:390,h:75,tipo:'terra'};
const f={id:1,nome:'Pátio de ensaio',regiao:0,largura:512,entrada:{x:40,y:202},saida:{x:350,y:202},pisos:[piso],espinhos:[],moedas:[{id:'fio',x:165,y:191,valor:3}],estrelas:[{id:'s1',x:195,y:191,nome:'Luz'}],inimigos:[{id:'sentinela',tipo:'escudo',x:260,y:202,min:226,max:315},{id:'protetor',tipo:'chefe',x:330,y:202,min:300,max:366}],santuarios:[{id:'inicio',x:40,y:202}],atalhos:[{id:'escada',x:280,y:202,paraX:70,paraY:202}],portas:[{x:367,y:202,alvos:['protetor']}],bento:{x:98,y:202},treino:{x:125,y:202},dicas:[]};
function ensaio(fase=f,perfil=novoPerfil()){
  const eventos=[],sons=[],guardados=[];
  const jogo=new Jogo(perfil,{som:id=>sons.push(id),evento:(id,dado)=>eventos.push([id,dado]),salvar:p=>guardados.push(structuredClone(p))},[fase]);
  jogo.carregar(1,true);
  return {jogo,eventos,sons,guardados};
}
function rodar(jogo,n,acao={}){for(let i=0;i<n;i++)jogo.atualizar(passo,acao);}
function noPiso(jogo,x){const h=jogo.heroi;h.x=x-h.w/2;h.y=202-h.h;h.noChao=true;h.vx=h.vy=0;}
let total=0;
function caso(nome,teste){teste();console.log('✓ '+nome);total++;}
caso('Golpe leve prepara, acerta uma vez e termina em recuperação',()=>{
 const {jogo}=ensaio({...f,inimigos:[{id:'vigia',tipo:'vigia',x:150,y:202,min:150,max:150}]});noPiso(jogo,128);
 const alvo=jogo.inimigos[0],antes=alvo.vida,v=jogo.heroi.vigor;
 jogo.atualizar(passo,{leve:true});assert.equal(jogo.heroi.etapa,'preparo');assert.equal(alvo.vida,antes);assert(jogo.heroi.vigor<v);
 rodar(jogo,9);assert(alvo.vida<antes);const depois=alvo.vida;rodar(jogo,4);assert.equal(alvo.vida,depois);rodar(jogo,7);assert.equal(jogo.heroi.etapa,'recuperacao');
});
caso('O vigor limita os ataques e a esquiva; salto básico continua disponível',()=>{
 const {jogo}=ensaio();jogo.heroi.vigor=0;jogo.atualizar(passo,{pesado:true});assert.equal(jogo.heroi.acao,'livre');
 jogo.atualizar(passo,{esquiva:true});assert.equal(jogo.heroi.acao,'livre');
 jogo.atualizar(passo,{pulo:true,seguraPulo:true});assert(jogo.heroi.vy<0);rodar(jogo,120);assert(jogo.heroi.vigor>40);
});
caso('Cura requer tempo e pode ser interrompida',()=>{
 const {jogo}=ensaio();const h=jogo.heroi;h.vida=34;const antes=h.frascos;
 jogo.atualizar(passo,{cura:true});assert.equal(h.vida,34);assert.equal(h.frascos,antes-1);
 rodar(jogo,10);jogo.receberGolpe(6,1);rodar(jogo,56);assert.equal(h.vida,28);
 jogo.atualizar(passo,{cura:true});rodar(jogo,60);assert(h.vida>28);
});
caso('Compra e dois espaços de gravação sobrevivem à recarga',()=>{
 const p=novoPerfil();p.ecos=250;p.liberada=15;const {jogo}=ensaio(f,p);noPiso(jogo,98);
 for(const t of TECNICAS)assert(jogo.comprar(t.id),t.id);
 const saldo=p.ecos;assert(!jogo.comprar('aparo'));assert.equal(p.ecos,saldo);assert.equal(p.compradas.length,6);
 assert(jogo.equipar('quebra',0));assert(jogo.equipar('eco',1));assert(jogo.equipar('aparo',0));assert.deepEqual(p.equipadas,['aparo','eco']);
 const {jogo:novo}=ensaio(f,structuredClone(p));assert.deepEqual(novo.perfil.equipadas,['aparo','eco']);
});
caso('Queda, nova morte e coleta da mancha gravam saldo e posição juntos',()=>{
 const {jogo,guardados}=ensaio();const p=jogo.perfil,h=jogo.heroi;p.ecos=31;noPiso(jogo,120);rodar(jogo,2);h.y=360;jogo.atualizar(passo,{});
 assert.equal(p.ecos,0);assert.equal(p.mancha.valor,31);assert(Math.abs(p.mancha.x-120)<5);assert.equal(p.mancha.y,202);
 assert.equal(guardados.at(-1).mancha.valor,31);jogo.renascer();p.ecos=9;noPiso(jogo,143);rodar(jogo,2);jogo.heroi.y=360;jogo.atualizar(passo,{});assert.equal(p.mancha.valor,9);
 const {jogo:novo}=ensaio(f,structuredClone(p));assert.equal(novo.perfil.mancha.valor,9);noPiso(novo,novo.perfil.mancha.x);novo.atualizar(passo,{interagir:true});
 assert.equal(novo.perfil.mancha,null);assert.equal(novo.perfil.ecos,9);novo.atualizar(passo,{interagir:true});assert.equal(novo.perfil.ecos,9);
});
caso('Itens e estrelas somente pagam uma vez entre descanso e recarga',()=>{
 const {jogo}=ensaio();noPiso(jogo,165);jogo.atualizar(passo,{});const moedas=jogo.perfil.ecos;
 noPiso(jogo,195);jogo.atualizar(passo,{});assert.deepEqual(jogo.perfil.estrelas[1],['s1']);const saldo=jogo.perfil.ecos;assert(saldo>=moedas);
 noPiso(jogo,40);jogo.descansar();noPiso(jogo,165);jogo.atualizar(passo,{});noPiso(jogo,195);jogo.atualizar(passo,{});assert.equal(jogo.perfil.ecos,saldo);
});
caso('Passo do Eco só funciona uma vez antes de tocar o chão',()=>{
 const p=novoPerfil();p.compradas=['eco'];p.equipadas=['eco',null];const {jogo}=ensaio(f,p);const h=jogo.heroi;
 jogo.atualizar(passo,{pulo:true,seguraPulo:true});rodar(jogo,3,{seguraPulo:true});jogo.atualizar(passo,{t1:true,seguraPulo:true});assert.equal(h.acao,'eco');
 rodar(jogo,14);const v=h.vigor;jogo.atualizar(passo,{t1:true});assert.notEqual(h.acao,'eco');assert(h.vigor>=v);
});
function armado(id,tipo='vigia'){
 const p=novoPerfil();p.compradas=[id];p.equipadas=[id,null];
 return ensaio({...f,inimigos:[{id:'alvo',tipo,x:155,y:202,min:155,max:155}]},p);
}
caso('Esquiva tem preparação vulnerável, invulnerabilidade curta e recuperação vulnerável',()=>{
 for(const [quadros,seguro] of [[1,false],[6,true],[17,false]]){
  const {jogo}=armado('retorno');noPiso(jogo,120);const h=jogo.heroi,i=jogo.inimigos[0];
  jogo.atualizar(passo,{esquiva:true,eixo:1});rodar(jogo,quadros);const antes=h.vida;
  jogo.impactoInimigo(i);assert.equal(h.vida===antes,seguro,'quadro '+quadros);assert.equal(h.retorno>0,seguro);
 }
});
caso('Corte de Retorno exige esquiva no impacto, consome a janela e o vigor',()=>{
 const {jogo}=armado('retorno','elite');noPiso(jogo,110);const h=jogo.heroi,i=jogo.inimigos[0];
 jogo.atualizar(passo,{t1:true});assert.equal(h.acao,'livre');
 jogo.atualizar(passo,{esquiva:true});rodar(jogo,5);jogo.impactoInimigo(i);rodar(jogo,17);
 noPiso(jogo,130);h.dir=1;const v=h.vigor,vida=i.vida;
 jogo.atualizar(passo,{t1:true});assert.equal(h.acao,'retorno');assert.equal(h.retorno,0);assert(h.vigor<v);rodar(jogo,9);assert(i.vida<vida-30);
});
caso('Aparo exige direção e janela. O sinal vermelho anuncia um ataque que atravessa',()=>{
 for(const [quadros,vermelho,direcao,defende] of [[0,false,1,false],[5,false,1,true],[17,false,1,false],[5,true,1,false],[5,false,-1,false]]){
  const {jogo}=armado('aparo','elite');noPiso(jogo,130);const h=jogo.heroi,i=jogo.inimigos[0];h.dir=direcao;
  jogo.atualizar(passo,{t1:true});rodar(jogo,quadros);const vida=h.vida;jogo.impactoInimigo(i,vermelho);
  assert.equal(h.vida===vida,defende);assert.equal(i.estado==='aberto',defende);
 }
});
caso('Guarda frontal resiste ao leve; flanco, recuperação e carga oferecem aberturas reais',()=>{
 function dano(acao,flanco,recupera){
  const {jogo}=armado('quebra','escudo');const i=jogo.inimigos[0],h=jogo.heroi;
  noPiso(jogo,flanco?177:132);h.dir=flanco?-1:1;i.dir=-1;i.estado=recupera?'recuperacao':'aviso';i.tempo=0;i.duracao=2;
  const v=i.vida;jogo.atualizar(passo,{[acao]:true});rodar(jogo,acao==='t1'?29:9);return {dano:v-i.vida,i,h};
 }
 const bloqueado=dano('leve',false,false);assert(bloqueado.dano>0&&bloqueado.dano<8);
 assert(dano('leve',true,false).dano>15);assert(dano('leve',false,true).dano>20);
 const aberto=dano('t1',false,false);assert.equal(aberto.i.estado,'aberto');assert(aberto.dano>=40);
});
caso('Carga e golpe pesado errados expõem o herói durante a recuperação',()=>{
 const {jogo}=armado('quebra','escudo');const h=jogo.heroi;noPiso(jogo,40);
 jogo.atualizar(passo,{t1:true,seguraT1:true});rodar(jogo,38,{seguraT1:true});assert.equal(h.etapa,'preparo');
 rodar(jogo,12);assert.equal(h.etapa,'recuperacao');jogo.atualizar(passo,{esquiva:true});assert.equal(h.acao,'quebra');
 rodar(jogo,32);jogo.atualizar(passo,{pesado:true});rodar(jogo,29);assert.equal(h.etapa,'recuperacao');
 jogo.atualizar(passo,{leve:true});assert.equal(h.acao,'pesado');assert(h.vigor<h.vigorMax-25);
});
caso('Estocada cobre distância e acerta uma única vez; errar deixa uma abertura',()=>{
 const {jogo}=armado('estocada','elite');noPiso(jogo,95);const h=jogo.heroi,i=jogo.inimigos[0],x=h.x;
 jogo.atualizar(passo,{t1:true,eixo:1});rodar(jogo,20);assert(h.x>x+9);assert.equal(i.vida,i.vidaMax-BALANCO.golpe.estocada.dano);
 rodar(jogo,4);assert.equal(h.etapa,'recuperacao');assert.equal(i.vida,i.vidaMax-BALANCO.golpe.estocada.dano);
});
caso('Pisada quebra somente laje selada e conserva o piso aberto após recarregar',()=>{
 const p=novoPerfil();p.compradas=['pisada'];p.equipadas=['pisada',null];
 const fase={...f,pisos:[piso,{id:'lacre',x:78,y:163,w:52,h:9,tipo:'selado'}],inimigos:[]};
 const {jogo}=ensaio(fase,p),h=jogo.heroi;noPiso(jogo,104);
 jogo.atualizar(passo,{pulo:true,seguraPulo:true});rodar(jogo,20,{seguraPulo:true});assert(h.y+h.h<163);
 jogo.atualizar(passo,{t1:true});rodar(jogo,20);assert.equal(jogo.pisos[1].estado,'ausente');
 assert.deepEqual(p.selados[1],['lacre']);assert.equal(jogo.pisos[0].estado,'inteiro');
 const {jogo:retoma}=ensaio(fase,structuredClone(p));assert.equal(retoma.pisos[1].estado,'ausente');
});
caso('Descanso restaura cura e reativa comuns mantendo os dois selos, chefe, atalho e estrelas',()=>{
 const {jogo}=ensaio(),p=jogo.perfil;
 noPiso(jogo,280);jogo.atualizar(passo,{interagir:true});assert.deepEqual(p.atalhos[1],['escada']);
 noPiso(jogo,195);jogo.atualizar(passo,{});jogo.derrotar(jogo.inimigos[0]);jogo.derrotar(jogo.inimigos[1]);const saldo=p.ecos;
 noPiso(jogo,40);jogo.heroi.vida=6;jogo.heroi.frascos=0;assert(jogo.descansar());
 assert.equal(jogo.heroi.vida,jogo.heroi.vidaMax);assert.equal(jogo.heroi.frascos,BALANCO.vida.frascos);
 assert.equal(jogo.inimigos[0].estado,'patrulha');assert.equal(jogo.inimigos[1].estado,'morto');
 assert(jogo.portaAberta({alvos:['sentinela','protetor']}));jogo.derrotar(jogo.inimigos[0]);assert.equal(p.ecos,saldo);
 assert.deepEqual(p.estrelas[1],['s1']);noPiso(jogo,70);jogo.atualizar(passo,{interagir:true});assert(Math.abs(jogo.heroi.x+jogo.heroi.w/2-280)<1);
});
caso('Treino prévio permite praticar uma técnica sem mexer na compra nem perder ecos',()=>{
 const {jogo}=armado('retorno');noPiso(jogo,98);const h=jogo.heroi,p=jogo.perfil;h.vida=32;h.frascos=1;p.ecos=8;
 assert(jogo.treinar('aparo'));assert.equal(jogo.tecnicasAtivas[0],'aparo');assert(!p.compradas.includes('aparo'));
 jogo.atualizar(passo,{t1:true});assert.equal(jogo.heroi.acao,'aparo');jogo.receberGolpe(900,1);assert(jogo.heroi.vida>0);assert.equal(p.ecos,8);
 assert(jogo.treinar());assert.equal(jogo.heroi.vida,32);assert.equal(jogo.heroi.frascos,1);assert.deepEqual(jogo.tecnicasAtivas,['retorno',null]);
});
caso('Travessia fora do alcance da porta ou com guardião vivo não completa a fase',()=>{
 const fase={...f,inimigos:[{...f.inimigos[1],obrigatorio:true}]};const {jogo}=ensaio(fase);
 assert(!jogo.concluir());noPiso(jogo,348);assert(!jogo.concluir());jogo.derrotar(jogo.inimigos[0]);assert(jogo.concluir());assert(!jogo.concluir());assert.deepEqual(jogo.perfil.concluidas,[1]);
});
caso('Uma ponte escurece e cede sob pressão, reaparecendo após o intervalo',()=>{
 const ponte={id:'tabua',x:75,y:160,w:50,h:9,tipo:'fragil'},fase={...f,pisos:[piso,ponte],inimigos:[]};
 const {jogo}=ensaio(fase);const h=jogo.heroi;h.x=91;h.y=160-h.h;h.noChao=true;h.pisoId='tabua';
 rodar(jogo,12);assert.equal(jogo.pisos[1].estado,'racha');assert(jogo.pisos[1].aviso>0);
 rodar(jogo,55);assert.equal(jogo.pisos[1].estado,'ausente');assert(h.y+h.h>160);
 rodar(jogo,210);assert.equal(jogo.pisos[1].estado,'inteiro');
});
caso('Leitura de telegráficos e aberturas derrota os cinco guardiões com o conjunto básico no nível 1',()=>{
 function duelar(id,lerAtaque){
  const p=novoPerfil(),arena={...f,id,largura:590,pisos:[{...piso,w:590}],entrada:{x:165,y:202},
    moedas:[],estrelas:[],portas:[],santuarios:[{id:'inicio',x:165,y:202}],inimigos:[{id:'guardiao',tipo:'chefe',x:228,y:202,min:100,max:515}]};
  const j=new Jogo(p,{},[arena]);j.carregar(id);const h=j.heroi,i=j.inimigos[0];
  let esquivas=0,vigilia=false,ultimasInstrucoes=null;
  for(let n=0;n<1700&&h.vida>0&&i.vida>0;n++){
   const dx=i.x+i.w/2-h.x-h.w/2,dist=Math.abs(dx),dir=Math.sign(dx),e={};
   if(dist>23)e.eixo=dir;
   if(h.acao==='livre'){
    if(lerAtaque&&i.estado==='aviso'&&i.duracao-i.tempo<.12&&h.vigor>=23){e.esquiva=true;e.eixo=dir;esquivas++;}
    else if(lerAtaque&&h.vida<56&&h.frascos&&['recuperacao','aberto'].includes(i.estado)){e.cura=true;}
    else if(lerAtaque&&dist<45&&['aberto','recuperacao'].includes(i.estado)&&h.vigor>49){e.pesado=true;e.eixo=dir;}
    else if(dist<34&&h.vigor>=(lerAtaque?37:14)&&(!lerAtaque||i.estado==='patrulha'||i.estado==='recuperacao'&&i.duracao-i.tempo>.35)){e.leve=true;e.eixo=dir;}
   }
   j.atualizar(passo,e);
   if(i.estado==='aviso'&&i.transicao){vigilia=true;ultimasInstrucoes=i.ataqueNome;}
  }
  return {heroi:h.vida,chefe:i.vida,esquivas,vigilia,ultimasInstrucoes};
 }
 for(const fase of [4,7,10,12,15]){
  const resultado=duelar(fase,true);assert.equal(resultado.chefe,0,'fase '+fase);assert(resultado.heroi>0&&resultado.esquivas>0);assert(resultado.vigilia);assert.equal(resultado.ultimasInstrucoes,'Segunda vigília');
 }
 const repeticao=duelar(15,false);assert.equal(repeticao.heroi,0);assert(repeticao.chefe>0);
});
caso('Saltar após a borda e antecipar a entrada de salto antes de pousar',()=>{
 const {jogo}=ensaio({...f,inimigos:[],pisos:[{...piso,w:100},{...piso,id:'destino',x:143,w:205}]});const h=jogo.heroi;
 noPiso(jogo,96);rodar(jogo,13,{eixo:1});assert(!h.noChao);jogo.atualizar(passo,{eixo:1,pulo:true,seguraPulo:true});assert(h.vy<0);
 let antecipou=false,saltou=false;
 for(let n=0;n<85;n++){
   const antecipar=!antecipou&&h.vy>0&&h.y+h.h>=191;
   jogo.atualizar(passo,{eixo:1,pulo:antecipar,seguraPulo:true});
   if(antecipar)antecipou=true;
   if(antecipou&&h.vy<0){saltou=true;break;}
 }
 assert(antecipou&&saltou);
});
caso('Morrer de mãos vazias substitui uma mancha anterior e não cria valor',()=>{
 const {jogo}=ensaio();const p=jogo.perfil;p.ecos=19;jogo.morrer(true);assert.equal(p.mancha.valor,19);
 jogo.renascer();assert.equal(p.ecos,0);jogo.morrer(true);assert.equal(p.mancha,null);
 const {jogo:novo}=ensaio(f,structuredClone(p));assert.equal(novo.perfil.mancha,null);assert.equal(novo.perfil.ecos,0);
});
console.log(total+' verificações de combate e persistência passaram.');
