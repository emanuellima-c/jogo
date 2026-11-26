// Simula primeiras tentativas com as regras e a física do jogo.
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { InterrupcaoTravessia, Travessia } from './testar-trilhas-cinzas.mjs';

const NIVEIS = {4:2,7:3,10:4,12:5,15:6};
const NIVEIS_FASES = [0,1,1,1,2,2,2,3,3,3,4,4,5,5,5,6];
const LIMITE = 65;
const LIMITE_FASE = 160;
const SEMENTE = 50601;
const PERFIS_PILOTO = {
  veterano: {reacaoMin:.20,variacao:.15,erro:.24,antecedencia:.12,cedo:.22,tarde:.16,precisao:.075,recua:.32,apara:true,curaJanela:.72,curaVida:.48},
  mediano: {reacaoMin:.30,variacao:.15,erro:.35,antecedencia:.067,cedo:.27,tarde:.20,precisao:.045,recua:.25,apara:false,curaJanela:.49,curaVida:.53,lePiso:true},
  novato: {reacaoMin:.45,variacao:.20,erro:.50,antecedencia:.067,cedo:.30,tarde:.23,precisao:.10,recua:.18,apara:false,curaJanela:.19,curaVida:.53,lePiso:true}
};
const PERFIS_TRAVESSIA = {
  mediano:{...PERFIS_PILOTO.mediano,retencaoMin:.13,retencaoVariacao:.14},
  veterano:{...PERFIS_PILOTO.veterano,retencaoMin:.25,retencaoVariacao:.15}
};
const JANELAS = {
  4:{tecnica:'aparo',golpe:'contraforte',momento:'impacto'},
  7:{tecnica:'quebra',golpe:'seda',momento:'recuperacao'},
  10:{tecnica:'estocada',golpe:'trilho',momento:'recuperacao'},
  12:{tecnica:'pisada',golpe:'fragmentos',momento:'recuperacao'},
  15:{tecnica:'eco',golpe:'fornalhas',momento:'impacto'}
};
const centro = ator => ator.x+ator.w/2;
const limitar = (numero,minimo,maximo) => Math.max(minimo,Math.min(maximo,numero));

async function carregarMotor(fonte){
  const raiz=fonte?pathToFileURL(path.resolve(fonte)+path.sep):new URL('../src/',import.meta.url);
  const modulo=nome=>import(new URL('cinzas/'+nome+'.js',raiz));
  const [{FASES},{Jogo},{novoPerfil},{BALANCO,GUARDIOES,GOLPES_INIMIGOS,TECNICAS,CLASSES,CURVA_FASES},
    {atualizarPisos,movimentar},{atualizarAmbiente}]=
    await Promise.all(['fases','jogo','perfil','ajustes','fisica','ambiente'].map(modulo));
  return {FASES,Jogo,novoPerfil,BALANCO,GUARDIOES,GOLPES_INIMIGOS,TECNICAS,CLASSES,CURVA_FASES,
    atualizarPisos,movimentar,atualizarAmbiente,modulo};
}
function aleatorio(semente){
  let estado=semente>>>0;
  return ()=>{
    estado=(estado+0x6d2b79f5)|0;
    let valor=Math.imul(estado^(estado>>>15),estado|1);
    valor^=valor+Math.imul(valor^(valor>>>7),valor|61);
    return ((valor^(valor>>>14))>>>0)/4294967296;
  };
}
function sortearTentativa(semente,fase,indice){
  return aleatorio(semente^Math.imul(fase+1,0x9e3779b9)^Math.imul(indice+1,0x85ebca77));
}
function janelaDaArena(motor,fase){
  return motor.GUARDIOES[fase].janela??JANELAS[fase];
}
function tempoDeReacao(tempo,piloto){
  return tempo+piloto.perfil.reacaoMin+piloto.sortear()*piloto.perfil.variacao;
}
function iniciarLeitura(tempo,chefe,piloto,restante=chefe.duracao){
  const {perfil,sortear}=piloto;
  const reconhecer=tempoDeReacao(tempo,piloto);
  const errou=sortear()<perfil.erro;
  const erroTiming=errou?(sortear()<.5?-perfil.cedo:perfil.tarde):(sortear()-.5)*perfil.precisao;
  const impacto=tempo+restante;
  return {
    reconhecer,errou,impacto,erroTiming,defender:Math.max(reconhecer,impacto-perfil.antecedencia+erroTiming),
    eixo:sortear()<perfil.recua?-1:1,aparar:sortear()<.45&&perfil.apara,usada:false
  };
}
function respostaDourada(jogo,chefe,piloto,{distancia,direcao,eixo,livre,BALANCO}){
  const janela=piloto.janela,heroi=jogo.heroi,tempo=jogo.tempo,leitura=piloto.leitura;
  if(!janela||chefe.faseChefe!==3||chefe.ataqueId!==janela.golpe||piloto.usouTecnica||chefe.janelaGasta)return;
  const custo=BALANCO.golpe[janela.tecnica].vigor;
  if(heroi.vigor<custo||heroi.acao!=='livre')return;
  if(janela.momento==='impacto'){
    if(!leitura||leitura.usada||leitura.errou||tempo<leitura.reconhecer)return;
    const restante=leitura.impacto-tempo;
    if(janela.tecnica==='aparo'){
      if(livre&&distancia<56&&restante<=.11+leitura.erroTiming&&restante>=-.02){
        piloto.usouTecnica=true;leitura.usada=true;
        return {eixo:direcao,t1:true};
      }
      return;
    }
    const horizontal=centro(heroi);
    const noCampo=chefe.campos.some(campo=>horizontal>campo.x&&horizontal<campo.x+campo.w);
    if(!noCampo){
      // Ao ler a faixa, procura a borda que permite cruzá-la dentro do aviso.
      let ateFaixa=Infinity;
      for(const campo of chefe.campos){
        const borda=limitar(horizontal,campo.x+8,campo.x+campo.w-8);
        if(Math.abs(borda-horizontal)<Math.abs(ateFaixa))ateFaixa=borda-horizontal;
      }
      if(livre&&restante>.32&&Math.abs(ateFaixa)<Math.min(55,(restante-.22)*110))return {eixo:Math.sign(ateFaixa)};
      return;
    }
    if(livre&&restante<=.14+leitura.erroTiming&&restante>=.065)return {eixo:direcao,pulo:true};
    if(!heroi.noChao&&restante<=.065&&restante>=-.045){
      piloto.usouTecnica=true;leitura.usada=true;
      return {eixo:direcao,t1:true};
    }
    return;
  }
  if(chefe.estado!==janela.momento||tempo<piloto.reconheceAbertura)return;
  const abertura=chefe.duracao-chefe.tempo;
  const golpe=BALANCO.golpe[janela.tecnica];
  const alcance=golpe.alcance+chefe.w/2+heroi.w/2+(golpe.avanco?16:0);
  if(distancia>alcance)return;
  if(janela.tecnica==='pisada'){
    if(livre&&abertura>.40)return {eixo,pulo:true};
    if(heroi.noChao||abertura<.23)return;
  }else if(!livre||abertura<golpe.preparo+.06)return;
  piloto.usouTecnica=true;
  return {eixo:direcao,t1:true};
}
function lerFaixa(chefe,heroi,piloto,tempo,livre){
  const leitura=piloto.leitura;
  if(piloto.saltoDefensivo>tempo&&!heroi.noChao)return {seguraPulo:true};
  if(!piloto.perfil.lePiso||!leitura||leitura.usada||tempo<leitura.reconhecer||!chefe.campos.length)return;
  const faixa=chefe.campos.find(campo=>heroi.x+heroi.w-2>campo.x&&heroi.x+2<campo.x+campo.w);
  // Um vão entre as marcas continua livre. Nas faixas baixas e compridas, o salto preserva espaço.
  if(!faixa&&!leitura.errou)return {eixo:0};
  if(!faixa||faixa.altura>18||faixa.w<80||!livre)return;
  if(piloto.janela?.tecnica==='eco'&&piloto.janela.golpe===chefe.ataqueId&&chefe.faseChefe===3&&!leitura.errou)return;
  const pularEm=Math.max(leitura.reconhecer,leitura.impacto-.17+leitura.erroTiming);
  if(tempo>=pularEm&&tempo<pularEm+.10){
    piloto.saltoDefensivo=leitura.impacto+.10;
    leitura.usada=true;
    return {pulo:true,seguraPulo:true};
  }
}
function golpeDisponivel(heroi,tipo){
  const golpe=heroi.classe[tipo];
  return heroi.recursoClasse<(golpe.recurso??0)?golpe.semRecurso:golpe;
}
function alcanceDeAtaque(heroi,chefe,golpe){
  if(!golpe)return 0;
  return golpe.projetil?.alcance??(heroi.w/2+chefe.w/2+golpe.alcance);
}
function custoDeAcao(heroi,tipo,base){
  return Math.round(base*(heroi.atributos[tipo]??1));
}
function pilotar(jogo,chefe,piso,piloto,BALANCO){
  const heroi=jogo.heroi,tempo=jogo.tempo;
  const delta=centro(chefe)-centro(heroi),distancia=Math.abs(delta),direcao=Math.sign(delta)||heroi.dir;
  const lerKit=piloto.lerKitClasse;
  const leve=lerKit?golpeDisponivel(heroi,'leve'):null;
  const pesado=lerKit?golpeDisponivel(heroi,'pesado'):null;
  const talento=lerKit?heroi.classe.talento:null;
  const rolamento=lerKit?heroi.classe.esquiva??BALANCO.esquiva:BALANCO.esquiva;
  const custoEsquiva=lerKit?custoDeAcao(heroi,'custoEsquiva',rolamento.custo):rolamento.custo;
  const aviso=chefe.estado==='aviso'&&!chefe.transicao;
  if(aviso&&!piloto.emAviso){
    piloto.leitura=iniciarLeitura(tempo,chefe,piloto);
    piloto.usouTecnica=false;
  }
  piloto.emAviso=aviso;
  if(!aviso&&chefe.estado!=='impacto')piloto.leitura=null;
  if(chefe.estado!==piloto.ultimoEstado){
    piloto.ultimoEstado=chefe.estado;
    piloto.reconheceAbertura=tempoDeReacao(tempo,piloto);
  }
  const leitura=piloto.leitura;
  const percebido=aviso&&tempo>=leitura.reconhecer;
  const livre=heroi.acao==='livre'&&heroi.noChao;
  const margem=17;
  const distanciaPreferida=leve?.projetil?Math.min(76,leve.projetil.alcance*.58):chefe.w/2+12;
  const posicao=limitar(centro(chefe)-direcao*distanciaPreferida,piso.x+margem,piso.x+piso.w-margem);
  const erroX=posicao-centro(heroi)-heroi.vx*Math.abs(heroi.vx)/2500;
  let eixo=Math.abs(erroX)>3?Math.sign(erroX):0;

  if(percebido&&distancia<86)eixo=0;
  const tecnica=respostaDourada(jogo,chefe,piloto,{distancia,direcao,eixo,livre,BALANCO});
  if(tecnica)return tecnica;
  const faixa=lerFaixa(chefe,heroi,piloto,tempo,livre);
  if(faixa)return faixa;
  if(talento?.segurar&&heroi.acao==='guarda'&&tempo<piloto.guardaAte)return {eixo:direcao,seguraTalento:true};
  const aparar=leitura?.aparar&&!chefe.imparavel&&distancia<60&&heroi.vigor>=BALANCO.golpe.aparo.vigor;
  const defenderEm=aparar?Math.max(leitura.reconhecer,leitura.impacto-.12+leitura.erroTiming):leitura?.defender;
  if(livre&&leitura&&!leitura.usada&&(aviso||chefe.estado==='impacto')&&distancia<91&&
    tempo>=defenderEm&&tempo<defenderEm+.10){
    leitura.usada=true;
    if(aparar)return {eixo:direcao,t1:true};
    if(talento?.segurar&&!chefe.imparavel&&distancia<60&&heroi.vigor>=custoEsquiva){
      piloto.guardaAte=tempo+.24;
      return {eixo:direcao,seguraTalento:true};
    }
    if(heroi.vigor>=custoEsquiva){
      let esquiva=direcao*leitura.eixo;
      const deslocamento=lerKit?rolamento.velocidade*(rolamento.preparo+rolamento.impacto):60;
      const destino=centro(heroi)+esquiva*deslocamento;
      if(destino<piso.x+margem||destino>piso.x+piso.w-margem)esquiva=-esquiva;
      return {eixo:esquiva,esquiva:true};
    }
  }
  if(!livre||percebido)return {eixo};
  const vulneravel=chefe.estado==='recuperacao'||chefe.estado==='aberto';
  const abertura=vulneravel?chefe.duracao-chefe.tempo:0;
  if(vulneravel&&tempo<piloto.reconheceAbertura)return {eixo};
  if(talento&&!talento.segurar&&heroi.recursoClasse>=(talento.recurso??0)&&
    heroi.vigor>=custoDeAcao(heroi,'custoTecnica',talento.vigor)){
    const podeCurar=talento.cura&&heroi.vida<heroi.vidaMax*.70&&abertura>talento.preparo+.05;
    const podeAtacar=talento.dano&&abertura>talento.preparo+.07&&distancia<alcanceDeAtaque(heroi,chefe,talento)-2;
    if(podeCurar||podeAtacar)return {eixo:direcao,talento:true};
  }
  // Os pilotos menos experientes também tentam curar em aberturas que podem se fechar antes do gole.
  if(heroi.vida<heroi.vidaMax*piloto.perfil.curaVida&&heroi.frascos>0&&(abertura>piloto.perfil.curaJanela||distancia>92))return {cura:true};
  if(piloto.janela?.tecnica==='quebra'&&abertura>.57&&distancia<chefe.w/2+27&&heroi.vigor>=47){
    return {eixo:direcao,t1:true};
  }
  if(piloto.janela?.tecnica==='estocada'&&abertura>.36&&distancia>=chefe.w/2+23&&distancia<chefe.w/2+52&&heroi.vigor>=40){
    return {eixo:direcao,t1:true};
  }
  if(lerKit){
    if(tempo<piloto.proximoAtaque||chefe.estado==='impacto')return {eixo};
    const podeAtacar=(golpe,custo)=>golpe&&distancia<alcanceDeAtaque(heroi,chefe,golpe)-2&&
      heroi.vigor>=custoDeAcao(heroi,custo,golpe.vigor)+custoEsquiva;
    if(podeAtacar(pesado,'custoPesado')&&abertura>pesado.preparo+(pesado.projetil?distancia/pesado.projetil.velocidade:.13)){
      piloto.proximoAtaque=tempo+.25+piloto.sortear()*.22;
      return {eixo:direcao,pesado:true};
    }
    if(podeAtacar(leve,'custoLeve')){
      piloto.proximoAtaque=tempo+.25+piloto.sortear()*.22;
      return {eixo:direcao,leve:true};
    }
    return {eixo};
  }
  if(distancia<chefe.w/2+24&&heroi.vigor>=39&&tempo>=piloto.proximoAtaque&&chefe.estado!=='impacto'){
    piloto.proximoAtaque=tempo+.25+piloto.sortear()*.22;
    if(abertura>.44&&heroi.vigor>=46)return {eixo:direcao,pesado:true};
    return {eixo:direcao,leve:true};
  }
  return {eixo};
}
function simularDuelo(motor,fase,nomePiloto,{
  indice=0,semente=SEMENTE,modo='normal',limite=LIMITE,tecnica='padrao',configurarPerfil,lerKitClasse=false
}={}){
  const {Jogo,novoPerfil,BALANCO}=motor;
  const perfilPiloto=PERFIS_PILOTO[nomePiloto];
  assert(perfilPiloto,'Piloto desconhecido: '+nomePiloto);
  const alvo=fase.inimigos.find(inimigo=>inimigo.tipo==='chefe');
  const piso=fase.pisos.find(superficie=>alvo.x>=superficie.x&&alvo.x<superficie.x+superficie.w&&alvo.y===superficie.y);
  assert(piso,'Arena sem piso associado em F'+fase.id);
  const entrada={x:Math.max(piso.x+20,alvo.x-79),y:piso.y};
  const arena={...fase,entrada,inimigos:[alvo],moedas:[],estrelas:[]};
  const perfil=novoPerfil();
  perfil.nivel=NIVEIS[fase.id];perfil.liberada=fase.id;perfil.opcoes.modo=modo;
  const janela=tecnica==='com'?janelaDaArena(motor,fase.id):null;
  const equipada=janela?.tecnica??((tecnica==='padrao'&&perfilPiloto.apara)?'aparo':null);
  perfil.compradas=equipada?[equipada]:[];
  perfil.equipadas=[equipada,null];
  configurarPerfil?.(perfil,fase,{indice,semente,piloto:nomePiloto});
  let janelas=0,dano=0;
  const jogo=new Jogo(perfil,{evento:nome=>{if(nome==='janelaOuro')janelas++;}},[arena]);
  jogo.carregar(fase.id);
  const nivel=perfil.nivel,mortesAntes=perfil.mortes;
  const chefe=jogo.inimigos[0],piloto={
    perfil:{...perfilPiloto,apara:equipada==='aparo'},janela,lerKitClasse,guardaAte:0,
    sortear:sortearTentativa(semente,fase.id,indice),
    emAviso:false,leitura:null,proximoAtaque:0,ultimoEstado:null,reconheceAbertura:0,usouTecnica:false,saltoDefensivo:0
  };
  while(jogo.tempo<limite&&jogo.heroi.vida>0&&chefe.estado!=='morto'){
    const vida=jogo.heroi.vida;
    jogo.atualizar(BALANCO.passo,pilotar(jogo,chefe,piso,piloto,BALANCO));
    dano+=Math.max(0,vida-jogo.heroi.vida);
  }
  const venceu=chefe.estado==='morto'&&jogo.heroi.vida>0;
  const mortes=perfil.mortes-mortesAntes;
  return {venceu,nivel,mortes,tempo:Math.min(limite,jogo.tempo),dano,esgotou:!venceu&&mortes===0,janelas};
}
function compararTecnica(fase,sem,com){
  let vitoriasSem=0,vitoriasCom=0,paresVencedores=0,tempoSem=0,tempoCom=0;
  for(let indice=0;indice<sem.length;indice++){
    const basico=sem[indice],gravura=com[indice];
    vitoriasSem+=Number(basico.venceu);
    vitoriasCom+=Number(gravura.venceu);
    if(!basico.venceu||!gravura.venceu)continue;
    paresVencedores++;
    tempoSem+=basico.tempo;
    tempoCom+=gravura.tempo;
  }
  return {fase,ganhoVitoria:100*(vitoriasCom-vitoriasSem)/sem.length,paresVencedores,
    reducaoTempoPareado:tempoSem?100*(tempoSem-tempoCom)/tempoSem:null};
}
function validarEnsaio(motor,{semente,tentativas,modo,limite,pilotos}){
  assert(Number.isInteger(tentativas)&&tentativas>0&&tentativas<=1000,'Use 1–1000 tentativas');
  assert(Number.isInteger(semente),'Use uma semente inteira');
  assert(Number.isFinite(limite)&&limite>0,'Use um limite de tempo positivo');
  assert(Object.hasOwn(motor.BALANCO.dificuldade,modo),'Modo desconhecido');
  assert(pilotos.every(nome=>Object.hasOwn(PERFIS_PILOTO,nome)),'Use veterano, mediano ou novato');
}
function medirDuelos(motor,{
  semente=SEMENTE,tentativas=200,modo='normal',limite=LIMITE,fases=Object.keys(NIVEIS).map(Number),
  pilotos=Object.keys(PERFIS_PILOTO),tecnica='ambas',configurarPerfil,lerKitClasse=false
}={}){
  validarEnsaio(motor,{semente,tentativas,modo,limite,pilotos});
  assert(fases.every(id=>Object.hasOwn(NIVEIS,id)),'Use fases de guardião');
  assert(['ambas','com','sem','padrao'].includes(tecnica),'Use ambas, com, sem ou padrao');
  const resultados=[],comparacoes=[];
  for(const fase of motor.FASES.filter(fase=>fases.includes(fase.id))){
    for(const piloto of pilotos){
      const condicoes=tecnica==='ambas'?(piloto==='mediano'?['sem','com']:['padrao']):[tecnica];
      const pareadas={};
      for(const condicao of condicoes){
        if(condicao==='com'&&piloto==='novato')continue;
        const total={vitorias:0,semDano:0,mortes:0,tempo:0,tempoVitoria:0,dano:0,esgotadas:0,janelas:0,vitoriasComJanela:0};
        const duelos=condicoes.length===2?(pareadas[condicao]=[]):null;
        let nivel;
        for(let indice=0;indice<tentativas;indice++){
          const duelo=simularDuelo(motor,fase,piloto,{indice,semente,modo,limite,tecnica:condicao,configurarPerfil,lerKitClasse});
          duelos?.push(duelo);
          nivel??=duelo.nivel;
          total.vitorias+=Number(duelo.venceu);
          total.semDano+=Number(duelo.venceu&&duelo.dano===0);
          total.mortes+=duelo.mortes;
          total.tempo+=duelo.tempo;
          total.tempoVitoria+=duelo.venceu?duelo.tempo:0;
          total.dano+=duelo.dano;
          total.esgotadas+=Number(duelo.esgotou);
          total.janelas+=duelo.janelas;
          total.vitoriasComJanela+=Number(duelo.venceu&&duelo.janelas>0);
        }
        resultados.push({
          fase:fase.id,guardiao:fase.inimigos.find(inimigo=>inimigo.tipo==='chefe').nome,nivel,
          piloto,tecnica:condicao==='com'?janelaDaArena(motor,fase.id).tecnica:(condicao==='padrao'&&PERFIS_PILOTO[piloto].apara?'aparo':null),
          vitorias:total.vitorias,vitoriasSemDano:total.semDano,taxaVitoria:100*total.vitorias/tentativas,mortes:total.mortes/tentativas,
          tempoMedio:total.tempo/tentativas,tempoVitoria:total.vitorias?total.tempoVitoria/total.vitorias:null,
          danoMedio:total.dano/tentativas,esgotadas:total.esgotadas,janelas:total.janelas,vitoriasComJanela:total.vitoriasComJanela
        });
      }
      if(condicoes.length===2)comparacoes.push(compararTecnica(fase.id,pareadas.sem,pareadas.com));
    }
  }
  return {semente,tentativas,modo,limite,resultados,comparacoes};
}

function leitorDeCombate(perfil,sortear){
  const observacoes=new WeakMap();
  const piloto={perfil,sortear};
  return (jogo,inimigo)=>{
    const estado=inimigo.estado,agora=jogo.tempo;
    let observacao=observacoes.get(inimigo);
    if(!observacao||observacao.estado!==estado){
      const aviso=estado==='aviso'&&!inimigo.transicao;
      const abertura=estado==='recuperacao'||estado==='aberto';
      const leitura=aviso?iniciarLeitura(agora,inimigo,piloto,inimigo.duracao-inimigo.tempo):
        estado==='impacto'?observacao?.leitura:null;
      observacao={
        estado,leitura,abertura:abertura?tempoDeReacao(agora,piloto):agora,
        sentido:leitura?.eixo??1,curaVida:perfil.curaVida,curaJanela:perfil.curaJanela,
        consumir(){leitura.usada=true;}
      };
      observacoes.set(inimigo,observacao);
    }
    const leitura=observacao.leitura;
    observacao.ameaca=Boolean(leitura&&agora>=leitura.reconhecer);
    observacao.proxImpacto=Boolean(leitura&&!leitura.usada&&agora>=leitura.defender&&agora<leitura.defender+.10);
    observacao.aberturaLida=agora>=observacao.abertura;
    return observacao;
  };
}

function simularFase(motor,fase,nomePiloto,{
  indice=0,semente=SEMENTE,modo='normal',limite=LIMITE_FASE,maxMortes=4,configurarPerfil
}={}){
  const perfilPiloto=PERFIS_TRAVESSIA[nomePiloto]??PERFIS_PILOTO[nomePiloto];
  assert(perfilPiloto,'Piloto desconhecido: '+nomePiloto);
  const perfil=motor.novoPerfil();
  perfil.nivel=NIVEIS_FASES[fase.id];perfil.liberada=fase.id;perfil.opcoes.modo=modo;
  configurarPerfil?.(perfil,fase,{indice,semente,piloto:nomePiloto});
  const nivel=perfil.nivel,mortesAntes=perfil.mortes;
  const sortear=sortearTentativa(semente,fase.id,indice);
  const sortearSalto=sortearTentativa(semente+1,fase.id,indice);
  const limitarRetencaoSalto=()=>{
    if(!perfilPiloto.retencaoMin||sortearSalto()>=perfilPiloto.erro)return Infinity;
    return Math.ceil((perfilPiloto.retencaoMin+sortearSalto()*perfilPiloto.retencaoVariacao)/motor.BALANCO.passo);
  };
  const travessia=new Travessia(perfil,nomePiloto,null,{
    motor,lerCombate:leitorDeCombate(perfilPiloto,sortear),usarSantuarios:true,
    limitarRetencaoSalto,
    limiteQuadros:Math.floor(limite/motor.BALANCO.passo)
  });
  let retomar=false,venceu=false,interrupcao=null;
  while(true){
    try{
      travessia.executar(fase,false,retomar);
      venceu=true;break;
    }catch(erro){
      if(!(erro instanceof InterrupcaoTravessia))throw erro;
      if(erro.causa!=='morte'||perfil.mortes-mortesAntes>=maxMortes){
        interrupcao={causa:erro.causa,detalhe:erro.message};
        break;
      }
      retomar=true;
    }
  }
  return {venceu,nivel,mortes:perfil.mortes-mortesAntes,tempo:travessia.quadros*travessia.dt,dano:travessia.dano,interrupcao};
}

function medirFases(motor,{
  semente=SEMENTE,tentativas=200,modo='normal',limite=LIMITE_FASE,maxMortes=4,
  fases=motor.FASES.filter(fase=>!fase.inimigos.some(inimigo=>inimigo.tipo==='chefe')).map(fase=>fase.id),
  pilotos=['mediano'],configurarPerfil
}={}){
  validarEnsaio(motor,{semente,tentativas,modo,limite,pilotos});
  assert(Number.isInteger(maxMortes)&&maxMortes>0,'Use um limite positivo de mortes');
  assert(fases.every(id=>motor.FASES.some(fase=>fase.id===id&&!fase.inimigos.some(inimigo=>inimigo.tipo==='chefe'))),'Use fases comuns');
  const resultados=[];
  for(const fase of motor.FASES.filter(fase=>fases.includes(fase.id))){
    for(const piloto of pilotos){
      const total={conclusoes:0,semMortes:0,mortes:0,tempo:0,dano:0};
      const interrupcoes={};
      let nivel;
      for(let indice=0;indice<tentativas;indice++){
        const tentativa=simularFase(motor,fase,piloto,{indice,semente,modo,limite,maxMortes,configurarPerfil});
        nivel??=tentativa.nivel;
        total.conclusoes+=Number(tentativa.venceu);
        total.semMortes+=Number(tentativa.venceu&&tentativa.mortes===0);
        total.mortes+=tentativa.mortes;total.tempo+=tentativa.tempo;total.dano+=tentativa.dano;
        if(tentativa.interrupcao){
          const {causa,detalhe}=tentativa.interrupcao;
          const resumo=interrupcoes[causa]??={quantidade:0,exemplo:detalhe};
          resumo.quantidade++;
        }
      }
      resultados.push({
        fase:fase.id,nome:fase.nome,nivel,piloto,conclusoes:total.conclusoes,semMortes:total.semMortes,
        taxaConclusao:100*total.conclusoes/tentativas,taxaSemMortes:100*total.semMortes/tentativas,
        mortes:total.mortes/tentativas,tempoMedio:total.tempo/tentativas,danoMedio:total.dano/tentativas,
        desistencias:tentativas-total.conclusoes,interrupcoes
      });
    }
  }
  return {semente,tentativas,modo,limite,maxMortes,resultados};
}

async function executar(){
  const argumento=nome=>process.argv.find(arg=>arg.startsWith('--'+nome+'='))?.slice(nome.length+3);
  const comuns=process.argv.includes('--comuns');
  const opcoes={
    tentativas:Number(argumento('tentativas')??200),semente:Number(argumento('semente')??SEMENTE),
    modo:argumento('modo')??'normal',fases:argumento('fase')?.split(',').map(Number),
    pilotos:argumento('piloto')?.split(','),
    limite:argumento('limite')===undefined?undefined:Number(argumento('limite'))
  };
  const motor=await carregarMotor(argumento('fonte'));
  const resultado=comuns?medirFases(motor,{...opcoes,maxMortes:Number(argumento('max-mortes')??4)}):
    medirDuelos(motor,{...opcoes,tecnica:argumento('tecnica')??'ambas'});
  if(process.argv.includes('--json')){
    console.log(JSON.stringify(resultado,null,2));
    return;
  }
  const {modo,semente,tentativas,limite,resultados,comparacoes,maxMortes}=resultado;
  if(comuns){
    console.log(`Fases comuns · ${modo} · semente ${semente} · ${tentativas} jornadas por combinação`);
    console.log(`Cada jornada começa no nível indicado, com kit básico e santuários disponíveis. Até ${maxMortes} mortes ou ${limite} s simulados.`);
    console.table(resultados.map(item=>({
      fase:item.fase,nome:item.nome,nível:item.nivel,piloto:item.piloto,
      'sem morrer':item.taxaSemMortes.toFixed(1)+'%','conclusões':item.taxaConclusao.toFixed(1)+'%',
      'mortes/jornada':item.mortes.toFixed(2),'tempo geral (s)':item.tempoMedio.toFixed(1),
      dano:item.danoMedio.toFixed(1),desistências:item.desistencias,
      'falhas de navegação':item.interrupcoes.navegacao?.quantidade??0
    })));
    return;
  }
  console.log(`Arenas reais · ${modo} · semente ${semente} · ${tentativas} primeiras tentativas por combinação`);
  console.log('Reação em ms e erros de timing: veterano 200–350/24%, mediano 300–450/35%, novato 450–650/50%.');
  console.log(`Tempo geral inclui mortes e tentativas que chegam ao limite de ${limite} s. Dano em pontos de vida.`);
  console.table(resultados.map(item=>({
    fase:item.fase,guardião:item.guardiao,nível:item.nivel,piloto:item.piloto,gravura:item.tecnica??'—',
    vitórias:item.taxaVitoria.toFixed(1)+'%','mortes/tent.':item.mortes.toFixed(2),
    'tempo geral (s)':item.tempoMedio.toFixed(1),'vitória (s)':item.tempoVitoria?.toFixed(1)??'—',
    dano:item.danoMedio.toFixed(1),'vitórias sem dano':item.vitoriasSemDano,limite:item.esgotadas,'janelas de ouro':item.janelas
  })));
  if(comparacoes.length){
    console.log('Vantagem da gravura no mediano. O tempo compara sementes vencidas nas duas condições.');
    console.table(comparacoes.map(item=>({fase:item.fase,'ganho de vitória (pp)':item.ganhoVitoria.toFixed(1),
      'pares vencidos':item.paresVencedores,'redução de tempo (%)':item.reducaoTempoPareado?.toFixed(1)??'—'})));
  }
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)await executar();

export { NIVEIS, NIVEIS_FASES, PERFIS_PILOTO, carregarMotor, medirDuelos, medirFases, simularDuelo, simularFase };
