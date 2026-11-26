"""Matrizes de pixels dos Santuários. Requer Pillow apenas para redesenhar os PNGs."""
import math
from pathlib import Path
from PIL import Image, ImageDraw

SAIDA = Path(__file__).resolve().parents[1] / "arte" / "cinzas"
TINTA = "#171824"
FERRO = "#49566a"
ACO = "#8babb2"
FIO = "#d5efe3"
OURO = "#d79750"
LIMAO = "#f6ce78"
PELE = "#c98d71"
LUZ = "#f2bf89"


class Pincel:
    def __init__(self, imagem, x=0, y=0, escala=1):
        self.d = ImageDraw.Draw(imagem)
        self.x, self.y, self.k = x, y, escala

    def ponto(self, x, y):
        return (round(self.x+x*self.k), round(self.y+y*self.k))

    def pol(self, cor, p):
        self.d.polygon([self.ponto(*xy) for xy in p], fill=cor)

    def lin(self, cor, p, largura=1):
        self.d.line([self.ponto(*xy) for xy in p], fill=cor, width=max(1,round(largura*self.k)))

    def ret(self, cor, x, y, w, h):
        a,b=self.ponto(x,y); c,d=self.ponto(x+w,y+h)
        if c>a and d>b: self.d.rectangle((a,b,c-1,d-1),fill=cor)

    def el(self, cor, x, y, w, h):
        a,b=self.ponto(x,y); c,d=self.ponto(x+w,y+h)
        if c>a and d>b: self.d.ellipse((a,b,c-1,d-1),fill=cor)

    def matriz(self, padrao, paleta, x, y):
        for r, linha in enumerate(padrao):
            for coluna, v in enumerate(linha):
                if v in paleta: self.ret(paleta[v],x+coluna,y+r,1,1)


CABECA = [
    "....oocccco.....",
    "...occWWWwcco...",
    "..ocWWWhwWWWco..",
    ".ocWWhwccchhWco.",
    ".ochWhccpsssfc..",
    "ochWhcpfllfllsc.",
    "ochWccffklfkkfc.",
    ".chccppflffflfo.",
    ".ocffpfwwfllfso.",
    "..offswcwwwwso..",
    "...ocsCWcscwwc..",
    "....ocCWWWWWco..",
    ".....ocCWhWco...",
    ".......occco....",
]
ROSTO={"o":TINTA, "c":"#424153", "C":"#858b97", "W":"#e0daca",
       "w":"#abb3b4","h":"#f9ebca","p":"#936456","s":"#af7a65","f":PELE,"l":LUZ,"k":"#3a3240"}
HEROIS=["livre","corrida","salto","queda","leve","pesado","esquiva","cura",
        "dano","retorno","quebra","aparo","estocada","pisada","eco","morto","descanso"]
QUADROS=[4,6,2,2,6,6,6,5,3,6,6,5,5,5,5,5,4]
HW, HH, HX, HY = 84,54,36,48


def espada(b, mao, ponta, runa=False):
    x,y=mao; u,v=ponta
    tam=math.hypot(u-x,v-y) or 1; a=(u-x)/tam; d=(v-y)/tam
    n=(-d,a)
    def p(fr,lat):
        return (x+a*fr+n[0]*lat, y+d*fr+n[1]*lat)
    b.pol(TINTA,[p(2,2),p(tam-5,1.8),p(tam+1,-.5),p(tam-7,-2.5),p(2,-3)])
    b.pol("#69bfb2" if runa else ACO,[p(3,1),p(tam-4,.8),p(tam,-.8),p(tam-7,-2),p(3,-2)])
    b.lin("#c3ffe6" if runa else FIO,[p(6,-1.8),p(tam-6,-1.8),p(tam,-.8)])
    b.lin("#467a76" if runa else FERRO,[p(4,1.2),p(tam-6,.5)])
    b.lin(TINTA,[p(3,-4),p(1,4)],3)
    b.lin(OURO,[p(3,-4),p(2,-1),p(1,3),p(0,4)],2)
    b.lin(LIMAO,[p(3,-4),p(2,-2)])
    b.lin(TINTA,[p(-4,0),p(1,0)],3)
    b.ret(OURO,*p(-5,-.5),2,2)


def perna(b,anca,joelho,pe,atras=False):
    fundo="#252a3a" if atras else "#303b51"; luz="#3a4557" if atras else "#526075"
    b.lin(TINTA,[anca,joelho,pe],6);b.lin(fundo,[anca,joelho,pe],4)
    b.lin(luz,[(anca[0]-1,anca[1]),(joelho[0]-1,joelho[1])],1)
    x,y=pe;b.pol(TINTA,[(x-2,y-2),(x+1,y-2),(x+4,y),(x+4,y+2),(x-3,y+2)])
    b.lin("#8a7170",[(x,y),(x+2,y)])


def braco(b,ombro,cotovelo,mao,atras=False):
    b.lin(TINTA,[ombro,cotovelo,mao],6)
    b.lin("#32384a" if atras else "#46536a",[ombro,cotovelo,mao],4)
    if not atras: b.lin("#647589",[(ombro[0]-1,ombro[1]),(cotovelo[0]-1,cotovelo[1])])
    x,y=mao;b.ret("#c8baaa",x-2,y-2,3,3);b.ret("#956455",x-1,y-1,4,3);b.ret(LUZ,x,y-1,2,1)


def heroi(im,acao,i):
    # O pé permanece preso ao pivô da célula até a pose pedir suspensão.
    b=Pincel(im,HX,HY)
    if acao=="morto" and i>=2:
        queda=Image.new("RGBA",(HW,HH));heroi(queda,"dano",2)
        corpo=queda.crop((15,5,70,50)).rotate(-45 if i==2 else -84, resample=Image.Resampling.NEAREST,expand=True)
        im.alpha_composite(corpo,(HX-corpo.width//2,HY-corpo.height+2));return
    passo=i*math.tau/6;delta=round(math.sin(passo)*7)
    bob=0;incl=0;pe1=(-4,-2);pe2=(4,-2);j1=(-4,-7);j2=(4,-7)
    modo=acao
    if acao=="corrida":
        pe1=(-3+delta,-2-round(max(0,-math.cos(passo))*4))
        pe2=(3-delta,-2-round(max(0,math.cos(passo))*5))
        j1=(-2+round(delta*.5),-6);j2=(3-round(delta*.5),-8)
        bob=i%3==0;incl=2
    elif acao in ("salto","queda","pisada","eco"):
        pe1=(-7,-5-i%2);pe2=(5,-4)
        j1=(-9,-10);j2=(7,-9)
        if acao=="queda":pe2=(6,-1);j2=(5,-5)
        if acao=="pisada" and i>=2: j1=(-3,-6);j2=(3,-7);pe1=(-3,-1);pe2=(4,-1)
        if acao=="eco":pe1=(-12,-5);pe2=(-6,-3);j1=(-8,-8);incl=4
    elif acao in ("pesado","quebra","leve","retorno","estocada","aparo"):
        pe1=(-6,-2);pe2=(6,-2);j1=(-6,-6);j2=(6,-7)
        if acao in ("retorno","estocada") and 2<=i<=3:
            pe1=(-12,-2);pe2=(9,-2);j1=(-8,-6);j2=(9,-5);incl=4;bob=3
        else: incl=-2 if i<2 else 2 if i<4 else 0
    elif acao=="dano" or acao=="morto": incl=-4;pe1=(-6,-2);pe2=(5,-3);bob=2
    elif acao=="descanso": bob=5;pe1=(-7,-2);pe2=(6,-2);j1=(-9,-4);j2=(6,-5)
    elif acao=="livre": bob=int(i==2)
    if acao=="esquiva":
        pose=Image.new("RGBA",(HW,HH));p=Pincel(pose,HX,HY-8)
        p.pol(TINTA,[(-12,-8),(-7,-17),(2,-18),(10,-12),(12,-4),(8,3),(-3,4)])
        p.pol("#384659",[(-11,-7),(-6,-16),(1,-16),(9,-11),(10,-5),(7,1),(-4,2)])
        p.matriz(CABECA,ROSTO,-3,-23)
        p.pol("#216159",[(-9,-14),(-3,-10),(7,-8),(6,-5),(-2,-6),(-11,-10)])
        p.lin(OURO,[(-9,-13),(-3,-9),(6,-7)])
        p.lin("#a0b5b4",[(-10,-6),(8,-3)],2)
        rota=pose.crop((HX-17,HY-35,HX+18,HY+1)).rotate(-i*58, resample=Image.Resampling.NEAREST,expand=True)
        box=rota.getbbox();rota=rota.crop(box);im.alpha_composite(rota,(HX-rota.width//2,HY-rota.height));return
    def pt(x,y):return (x+incl, y+bob)
    ombro=pt(1,-20); mao=pt(7,-14);cot=pt(5,-16);ponta=pt(24,-23)
    traz=pt(-7,-14);ct=pt(-6,-18)
    if acao=="corrida":
        mao=pt(6-delta//2,-13);cot=pt(4-delta//2,-16);ponta=pt(22-delta//2,-19)
        traz=pt(-6+delta//2,-14)
    elif acao in ("salto","queda"):mao=pt(7,-20 if acao=="salto" else -14);ponta=pt(16,-37 if acao=="salto" else -3)
    elif acao in ("leve","retorno","pesado","quebra","aparo","estocada"):
        if acao in ("pesado","quebra"): armas=[((-3,-22),(-17,-37)),((-4,-24),(-21,-38)),((4,-26),(13,-46)),((12,-15),(35,-12)),((9,-9),(28,0)),((5,-13),(20,-19))]
        elif acao=="retorno":armas=[((-4,-18),(-20,-24)),((4,-23),(1,-43)),((11,-20),(35,-26)),((13,-15),(36,-9)),((6,-11),(21,-3)),((5,-13),(23,-18))]
        elif acao=="estocada":armas=[((-4,-16),(-18,-9)),((2,-18),(20,-18)),((14,-18),(40,-18)),((13,-18),(38,-19)),((5,-15),(25,-18))]
        elif acao=="aparo":armas=[((4,-12),(13,-29)),((7,-20),(2,-39)),((8,-22),(16,-40)),((8,-19),(27,-28)),((6,-15),(24,-20))]
        else:armas=[((1,-20),(-11,-33)),((4,-24),(1,-42)),((9,-20),(29,-31)),((11,-14),(33,-12)),((8,-11),(25,-7)),((6,-15),(22,-22))]
        (ax,ay),(px,py)=armas[i];mao=pt(ax,ay);ponta=pt(px,py);cot=pt(ax//2-1,ay+3)
        if acao in ("pesado","quebra"):traz=(mao[0]-2,mao[1]+3);ct=pt(-6,-16)
    elif acao=="dano" or acao=="morto": mao=pt(8,-12);ponta=pt(21,-2);traz=pt(-11,-19)
    elif acao=="pisada":mao=pt(6,-11);ponta=pt(7,-1 if i<2 else 1);traz=pt(-9,-19)
    elif acao=="eco": mao=pt(8,-19);ponta=pt(22,-27);traz=pt(-11,-15)
    elif acao=="cura":mao=pt(5,-22-i%3);cot=pt(8,-17);traz=pt(-7,-12)
    perna(b,pt(-2,-10),j1,pe1,True);perna(b,pt(2,-11),j2,pe2)
    braco(b,pt(-3,-21),ct,traz,True)
    # Bainha e casaca longa recortada, lapelas e faixa diagonal verde-ouro.
    b.lin(TINTA,[pt(-3,-13),pt(-12,-5)],4);b.lin("#806252",[pt(-3,-13),pt(-12,-5)],2)
    capa=-11-(3 if acao in ("corrida","eco","estocada") else 0)
    b.pol(TINTA,[pt(-3,-25),pt(4,-24),pt(7,-19),pt(5,-15),pt(6,-8),pt(1,-8),pt(-2,-10),pt(capa,-7),pt(-8,-13),pt(-7,-21)])
    b.pol("#30364b",[pt(-4,-23),pt(3,-23),pt(6,-19),pt(3,-15),pt(4,-9),pt(0,-10),pt(-3,-12),pt(capa+2,-9),pt(-6,-14),pt(-6,-21)])
    b.pol("#46576b",[pt(-5,-23),pt(-2,-22),pt(-3,-17),pt(-6,-13),pt(-8,-11),pt(-5,-18)])
    b.pol("#d9ccad",[pt(-1,-24),pt(5,-23),pt(2,-16)])
    b.pol("#8b524e",[pt(2,-22),pt(3,-21),pt(2,-18),pt(1,-20)])
    b.pol("#1e6e60",[pt(-5,-23),pt(-2,-24),pt(5,-14),pt(5,-10),pt(2,-12)])
    b.lin("#e8b559",[pt(-4,-23),pt(-1,-19),pt(5,-12)])
    b.ret("#dbae6e",*pt(-4,-13),2,1);b.lin("#699087",[pt(-6,-18),pt(-7,-15)])
    # Perfil três quartos; os brancos quentes da barba distinguem o protagonista à noite.
    b.matriz(CABECA,ROSTO,*pt(-6,-36))
    if acao=="livre" and i==3:b.lin("#69494b",[pt(2,-30),pt(3,-30)])
    if acao=="cura":
        b.el("#3d3438",mao[0]-2,mao[1]-6,6,8);b.el("#bc703d",mao[0]-1,mao[1]-5,4,5);b.ret("#ffce7e",mao[0],mao[1]-5,2,2)
        b.ret("#a3b5a1",mao[0],mao[1]-7,2,2)
    else: espada(b,mao,ponta,acao in ("retorno","eco","aparo","estocada"))
    braco(b,ombro,cot,mao)


def atlas_heroi():
    atlas=Image.new("RGBA",(HW*6,HH*len(HEROIS)))
    for r,nome in enumerate(HEROIS):
        for i in range(QUADROS[r]):
            q=Image.new("RGBA",(HW,HH));heroi(q,nome,i);atlas.alpha_composite(q,(HW*i,HH*r))
    atlas.save(SAIDA/"heroi.png",optimize=True)

CW,CH,CX,CY=108,72,49,65
TIPOS=["vigia","lanceiro","voador","escudo","elite","onca","aranha","fossil","colosso","gorila","boneco"]


def placa(b, pontos,cor,clara):
    b.pol(TINTA,pontos)
    centro=(sum(x for x,y in pontos)/len(pontos),sum(y for x,y in pontos)/len(pontos))
    dentro=[(x+(centro[0]-x)*.14,y+(centro[1]-y)*.14) for x,y in pontos]
    b.pol(cor,dentro);b.lin(clara,dentro[:max(2,len(dentro)//2)])


def membro(b, pontos,l,cor,luz):
    b.lin(TINTA,pontos,l+2);b.lin(cor,pontos,l)
    b.lin(luz,[(x-1,y-1) for x,y in pontos[:-1] or pontos],max(1,l//3))


def olho(b,x,y,cor="#fbcc80"):
    b.ret(TINTA,x-1,y-1,5,3);b.ret(cor,x,y,3,1);b.ret("#fff0b6",x+2,y,1,1)


def garra(b,x,y,dir=1):
    for i in range(3):b.lin("#d6c3a9",[(x+i*2,y),(x+dir*(i+2),y+2)])


def jaguar(b,pose,passo,ataque,baixo):
    # Capuz de orelhas e coroa de presa; cicatrizes e máscara quebram a massa dourada.
    agacha=3 if baixo else 0;avance=6 if ataque else 0
    def p(x,y):return(x+avance,y+agacha)
    trilha=[(-9,-19),(-19,-18),(-25,-24),(-24,-30),(-20,-32)]
    membro(b,trilha,4,"#a76043","#d09359")
    b.lin("#483640",[(-24,-26),(-22,-27)],3)
    for x,delta in [(-10,passo),(10,-passo)]:
        membro(b,[(x,-14),(x-3,-6),(x+delta,-2)],7,"#9d573b","#bf8051")
        b.pol("#49343c",[(x+delta-4,-3),(x+delta+2,-3),(x+delta+6,0),(x+delta-4,0)]);garra(b,x+delta, -2)
    placa(b,[p(-17,-22),p(-10,-31),p(2,-33),p(14,-25),p(12,-12),p(1,-8),p(-12,-12)],"#bc7546","#e0a660")
    b.pol("#e2a859",[p(-9,-27),p(1,-30),p(9,-23),p(3,-15),p(-4,-14)])
    for x,y in [(-12,-21),(-8,-25),(-10,-15),(-4,-27),(0,-14),(5,-18)]:
        b.ret("#604047",*p(x,y),3,2);b.ret("#a96843",*p(x+1,y),1,1)
    om=p(-3,-26);co=p(-14,-17);ma=p(-13,-9);membro(b,[om,co,ma],6,"#ab6542","#d79252")
    ao=p(7,-27);cot=p(15 if not ataque else 23,-21 if not ataque else -19);pun=p(12 if not ataque else 34,-13 if not ataque else -20)
    membro(b,[ao,cot,pun],7,"#bc794e","#edb66b");garra(b,*pun)
    placa(b,[p(-10,-29),p(-9,-36),p(-5,-38),p(-1,-34),p(6,-35),p(11,-38),p(14,-35),p(12,-30),p(16,-26),p(12,-20),p(3,-22),p(-5,-25)],"#c87d46","#ecba6d")
    b.pol("#6c4644",[p(-7,-34),p(-6,-37),p(-3,-34)]);b.ret("#64434a",*p(9,-35),3,3)
    b.lin("#4c4144",[p(-5,-31),p(3,-30),p(4,-28)],2)
    olho(b,*p(3,-30));b.ret("#fff0b6",*p(10,-30),2,1)
    b.pol("#e6b679",[p(5,-26),p(14,-28),p(16,-25),p(11,-22),p(5,-23)])
    b.ret("#483341",*p(12,-27),4,2);b.lin("#4b3541",[p(7,-23),p(12,-24)])
    b.pol("#fff0c0",[p(7,-23),p(10,-23),p(8,-18)]);b.pol("#d7c196",[p(12,-24),p(14,-25),p(13,-20)])
    for x in [-7,-2,3]:b.pol("#ddaa62",[p(x,-34),p(x+1,-39-(x%3)),p(x+3,-34)])
    b.lin("#76b5a0",[p(-8,-24),p(-4,-20),p(3,-19),p(7,-21)],2)


def aranha(b,pose,passo,ataque,baixo):
    y=3 if baixo else 0
    chao=-1 if not ataque else -4
    for lado in [-1,1]:
        for i in range(4):
            raiz=(lado*(3+i),-14+y)
            arco=(lado*(13+i*3),-31+i*4+y+(passo if i%2 else -passo))
            ponta=(lado*(18+i*4)+(3 if ataque and lado>0 else 0),chao-i%2*2)
            meio=(lado*(18+i*3),-20+i*3+y)
            membro(b,[raiz,arco,meio,ponta],3,"#67465e" if i%2 else "#8c5866","#c6947c")
            b.ret("#e4bd82",arco[0]-1,arco[1],2,2)
    placa(b,[(-18,-26+y),(-12,-34+y),(0,-35+y),(10,-29+y),(10,-18+y),(-2,-12+y),(-12,-17+y)],"#62475d","#ae7882")
    b.pol("#876074",[(-14,-26+y),(-8,-32+y),(-2,-33+y),(6,-27+y),(2,-23+y),(-6,-24+y)])
    for x,y2 in [(-12,-28),(-7,-30),(-2,-29),(3,-26)]:b.lin("#d89981",[(x,y2+y),(x+2,y2+y+3)])
    placa(b,[(-3,-23+y),(5,-27+y),(14,-23+y),(17,-17+y),(13,-10+y),(3,-10+y),(-3,-15+y)],"#785163","#be8882")
    for xx,yy in [(4,-21),(9,-22),(13,-20),(7,-18),(12,-17)]:b.ret("#ffd17c",xx,yy+y,2,2)
    b.pol("#e0b893",[(2,-13+y),(5,-14+y),(7,-8+y),(4,-6+y)])
    b.pol("#e0b893",[(12,-14+y),(15,-15+y),(14,-9+y),(11,-6+y)])
    if ataque:b.lin("#bba5bc",[(14,-17+y),(22,-20+y),(26,-18+y)],1)


def fossil(b,pose,passo,ataque,baixo):
    y=3 if baixo else 0; inc=4 if ataque else 0
    for k,(x,h) in enumerate([(-19,10),(-13,19),(-6,25),(0,30)]):
        b.el(TINTA,x-5,-h+y,17,h+2);b.el("#816957",x-4,-h+1+y,14,h)
        b.pol("#bfa57c",[(x-4,-h+5+y),(x+3,-h+1+y),(x+8,-h+5+y),(x+7,-h+7+y),(x+2,-h+4+y),(x-3,-h+8+y)])
        b.lin("#4b4346",[(x+7,-h+8+y),(x+5,-h+13+y),(x+6,-h+17+y)],2)
        b.pol("#a29179",[(x-4,-h+3+y),(x-7,-h-5+y),(x,-h+y)])
    def p(x,v):return(x+inc,v+y)
    placa(b,[p(-11,-29),p(-7,-38),p(1,-44),p(12,-43),p(18,-37),p(25,-34),p(22,-30),p(8,-28),p(-2,-23)],"#aa9578","#decb9d")
    b.pol("#d0bc91",[p(-8,-34),p(-4,-38),p(6,-42),p(12,-40),p(16,-36),p(7,-37),p(1,-34)])
    b.pol("#483e46",[p(3,-36),p(9,-38),p(10,-35),p(5,-32),p(1,-32)])
    olho(b,*p(5,-35),"#7be2d2");b.ret("#51414a",*p(15,-34),3,2)
    for i in range(4):
        x=8+i*4;b.pol("#e4dcb6",[p(x,-30),p(x+3,-31),p(x+1,-25-i%2)])
    placa(b,[p(-1,-23),p(9,-25),p(21,-26 if not ataque else -20),p(16,-21 if not ataque else -16),p(4,-18),p(-4,-18)],"#967963","#c3aa85")
    for x in [-4,1,6]:b.lin("#d7c18a",[p(x,-23),p(x+3,-19),p(x+6,-16)],2)
    b.lin("#79bbb0",[p(-11,-16),p(-7,-18),p(-3,-16),p(0,-18)])
    if ataque: b.ret("#a4f6d6",*p(10,-24),8,1)


def gigante(b,pose,passo,ataque,baixo,gorila):
    y=3 if baixo else 0;des=3 if ataque else 0
    esq,med,luz=("#483242","#72505c","#a96b66") if gorila else ("#384752","#5d7681","#91abb2")
    brilho="#ffaa68" if gorila else "#8fe6d5"
    def p(x,v):return(x+des,v+y)
    for x,d in [(-10,passo),(8,-passo)]:
        membro(b,[(x,-15),(x-2,-8),(x+d,-3)],9,esq,med)
        placa(b,[(x+d-5,-6),(x+d+2,-5),(x+d+6,-2),(x+d+7,0),(x+d-6,0)],med,luz)
    placa(b,[p(-15,-34),p(-6,-39),p(7,-39),p(17,-31),p(13,-17),p(7,-10),p(-7,-11),p(-14,-20)],med,luz)
    b.pol(esq,[p(-12,-27),p(-5,-24),p(1,-26),p(9,-23),p(6,-13),p(-6,-14)])
    if gorila:
        for xx,yy in [(-8,-32),(-5,-29),(-10,-28),(2,-29),(9,-26)]:
            b.lin(luz,[p(xx,yy),p(xx+1,yy+4)])
        b.lin("#e18b62",[p(-10,-34),p(-6,-28),p(-2,-27),p(-1,-23)])
    else:
        for xx,yy in [(-13,-35),(3,-34),(-8,-22),(6,-19)]:
            b.lin("#35424f",[p(xx,yy),p(xx+5,yy+3),p(xx+4,yy+6)],2)
        b.pol(brilho,[p(-6,-30),p(-2,-33),p(2,-29),p(-2,-24)])
    for l in [-1,1]:
        xx=l*12; cot=l*(22 if gorila else 17); pun=l*(24 if gorila else 20)
        topo=-31;ymo=-16;yf=-5
        if ataque and l>0:cot=25;pun=35;ymo=-23;yf=-20
        elif baixo and l>0:cot=17;pun=20;ymo=-32;yf=-38
        membro(b,[p(xx,topo),p(cot,ymo),p(pun,yf)],10 if gorila else 9,med,luz)
        placa(b,[p(xx-5,-36),p(xx+4,-37),p(xx+8,-31),p(xx+5,-25),p(xx-3,-26),p(xx-7,-30)],med,luz)
        placa(b,[p(pun-6,yf-3),p(pun-2,yf-6),p(pun+5,yf-3),p(pun+7,yf+2),p(pun+3,yf+6),p(pun-5,yf+5)],esq,med)
        b.lin(brilho,[p(cot-2,ymo-2),p(cot,ymo+2),p(cot-1,ymo+5)])
    if gorila:
        placa(b,[p(-3,-37),p(-3,-44),p(4,-48),p(12,-45),p(14,-39),p(17,-36),p(14,-30),p(4,-31)],"#55404d","#a36e68")
        b.pol("#896363",[p(4,-38),p(12,-40),p(16,-36),p(14,-32),p(6,-32),p(2,-34)])
        olho(b,*p(5,-40),"#ffb360");b.ret("#362b39",*p(11,-37),3,2)
        b.pol("#efd0a4",[p(11,-32),p(14,-33),p(13,-29)])
        for x in [-5,-1,3]:b.pol("#a4605a",[p(x,-43),p(x+1,-50-x%3),p(x+3,-44)])
    else:
        placa(b,[p(-7,-39),p(-6,-47),p(-2,-51),p(9,-50),p(14,-45),p(12,-37),p(6,-33),p(-3,-34)],med,luz)
        b.pol("#35434f",[p(-4,-45),p(9,-46),p(12,-44),p(6,-40),p(-3,-41)])
        b.lin(brilho,[p(-3,-43),p(2,-43),p(3,-42),p(9,-44)],2)
        b.lin("#a8b9ba",[p(6,-39),p(5,-35)])
        for x in [-7,2,8]:b.pol("#688c9c",[p(x,-49),p(x+1,-55),p(x+4,-50)])


def menor(b,tipo,pose,passo,ataque,baixo):
    y=2 if baixo else 0
    if tipo=="voador":
        flap=[1,0,-4,-7,1,3,4,0,0,-3,1,3][pose]; desloc=4 if ataque else 0
        for l in [-1,1]:
            asa=[(l*2,-12),(l*6,-19+flap),(l*18,-23+flap*2),(l*17,-15+flap*2),(l*13,-7+flap),(l*10,-10+flap),(l*5,-6)]
            placa(b,asa,"#695270","#b58b99");b.lin("#c29694",[(l*4,-12),(l*12,-17+flap),(l*15,-18+flap)])
            b.ret("#d1b377",l*12,-13+flap,2,2)
        placa(b,[(-4+desloc,-18),(0+desloc,-21),(5+desloc,-18),(6+desloc,-10),(1+desloc,-4),(-3+desloc,-9)],"#4d4357","#827084")
        olho(b,desloc+1,-16,"#ffb881");b.lin("#e2b773",[(desloc,-13),(desloc+2,-9)],2)
        b.lin("#a6b29c",[(desloc-1,-19),(desloc-4,-23)]);b.lin("#a6b29c",[(desloc+3,-19),(desloc+6,-23)]);return
    if tipo=="boneco":
        b.ret(TINTA,-3,-28,6,28);b.ret("#94674e",-2,-25,3,25);b.ret("#c79f63",-2,-24,1,19)
        membro(b,[(-9,-19),(7,-19),(12,-24 if baixo else -17)],3,"#87624d","#bd966c")
        placa(b,[(-7,-23),(1,-25),(7,-21),(6,-11),(0,-7),(-7,-10)],"#947251","#cbaa76")
        for k in range(3):b.lin("#dbc394",[(-7,-19+k*3),(5,-18+k*3)])
        b.el(TINTA,-5,-33,12,11);b.el("#b89362",-4,-32,10,9);b.lin("#55454b",[(-3,-28),(4,-27)])
        b.ret("#76c7ab",1,-28,2,2);return
    esq,med,luz={
       "vigia":("#3f4840","#657055","#a6aa79"),"lanceiro":("#444457","#746480","#bea18c"),
       "escudo":("#3d4a49","#677163","#b0ac83"),"elite":("#474153","#716075","#bd8888")}[tipo]
    grande=tipo=="elite";topo=-25 if not grande else -31
    def p(x,v):return(x+(2 if ataque else 0),v+y)
    for x,d in [(-5,passo),(4,-passo)]:
        membro(b,[p(x,-12),(x-2,-7),(x+d,-2)],4 if not grande else 6,esq,med)
        b.ret(TINTA,x+d-2,-2,7,3);b.ret(luz,x+d+2,-1,2,1)
    placa(b,[p(-8,topo),p(-2,topo-3),p(6,topo),p(7,-13),p(4,-7),p(-3,-10),p(-10,-8),p(-7,-15)],med,luz)
    b.pol(esq,[p(-7,topo+4),p(-1,topo+7),p(-4,-10),p(-9,-9)])
    if tipo=="vigia":
        b.lin("#bc8659",[p(-4,-21),p(4,-15)],2)
        placa(b,[p(-7,-24),p(-6,-30),p(-2,-32),p(4,-30),p(8,-27),p(5,-22),p(0,-20)],"#92785a","#c8a478")
        b.pol("#513f44",[p(-6,-29),p(-3,-31),p(-1,-26)]);olho(b,*p(2,-26),"#efc37e")
        b.pol("#d5aa77",[p(3,-23),p(7,-23),p(5,-19)])
        b.lin("#919368",[p(-5,-29),p(-8,-33),p(-13,-32)],2)
        x,y2=p(13 if ataque else 6,-14 if not baixo else -24)
        membro(b,[p(4,-23),p(9,-18),(x,y2)],4,med,luz);espada(b,(x,y2),(x+(18 if ataque else 10),y2-(3 if ataque else 14)))
    elif tipo=="lanceiro":
        placa(b,[p(-6,-26),p(-8,-33),p(-3,-35),p(3,-33),p(8,-30),p(6,-25),p(2,-22)],"#6b6679","#b7a590")
        b.pol("#b9a276",[p(3,-28),p(12,-27),p(7,-24),p(2,-25)])
        olho(b,*p(1,-30),"#baf0d4")
        for x in [-8,-5,-2]:b.lin("#a78183",[p(x,-32),p(x-4,-37+(x%2))],2)
        eixo=-15 if ataque else -12;xx=10 if ataque else 0
        b.lin(TINTA,[p(xx-12,eixo+4),p(xx+23,eixo-4)],3)
        b.lin("#b58e65",[p(xx-12,eixo+4),p(xx+23,eixo-4)])
        b.pol(ACO,[p(xx+18,eixo-3),p(xx+30,eixo-7),p(xx+24,eixo-2),p(xx+19,eixo)])
        b.lin(FIO,[p(xx+20,eixo-4),p(xx+30,eixo-7)])
        membro(b,[p(3,-21),p(5,-15),p(xx+4,eixo+1)],3,med,luz);membro(b,[p(-4,-20),p(-5,-14),p(xx-3,eixo+2)],3,med,luz)
    elif tipo=="escudo":
        placa(b,[p(-10,-20),p(-12,-27),p(-6,-31),p(0,-33),p(7,-30),p(9,-24),p(4,-21)],"#788275","#b4b391")
        b.lin(esq,[p(-8,-27),p(-2,-26),p(2,-30)],2);olho(b,*p(3,-27),"#f0c078")
        membro(b,[p(-5,-20),p(-8,-14),p(-10,-10)],4,med,luz)
        espada(b,p(-8,-12),p(-4,-26))
        xx=6+(4 if ataque else 0);placa(b,[p(xx,-28),p(xx+7,-26),p(xx+9,-21),p(xx+8,-9),p(xx+3,-4),p(xx-3,-10),p(xx-5,-22)],"#7f7157","#dfb778")
        b.lin("#554c49",[p(xx-2,-22),p(xx+2,-11),p(xx+5,-20)],2);b.ret("#d8b67c",*p(xx+1,-19),3,3)
    elif grande:
        placa(b,[p(-9,-26),p(-11,-35),p(-6,-38),p(-4,-44),p(-1,-37),p(6,-38),p(10,-42),p(9,-34),p(12,-29),p(6,-25)],"#786571","#c69c85")
        b.pol("#554451",[p(-5,-34),p(7,-35),p(10,-30),p(4,-27),p(-3,-29)])
        olho(b,*p(3,-32),"#ffb176")
        b.lin("#d59b71",[p(-8,-25),p(-2,-21),p(4,-22)],2)
        ctl=p(9 if not ataque else 15,-18 if not baixo else -28);h=p(10 if not ataque else 21,-14 if not baixo else -33)
        membro(b,[p(4,-26),ctl,h],6,med,luz)
        espada(b,h,(h[0]+(25 if ataque else 10),h[1]-(1 if ataque else 24)))


def atlas_criaturas():
    atlas=Image.new("RGBA",(CW*12,CH*len(TIPOS)))
    for r,tipo in enumerate(TIPOS):
        for i in range(12):
            q=Image.new("RGBA",(CW,CH));b=Pincel(q,CX,CY)
            passo=[0,2,0,-2,0,0,3,-2,1,0,0,0][i];baixo=i in (4,5,9,10);ataque=i in (6,7)
            if tipo=="onca":jaguar(b,i,passo,ataque,baixo)
            elif tipo=="aranha":aranha(b,i,passo,ataque,baixo)
            elif tipo=="fossil":fossil(b,i,passo,ataque,baixo)
            elif tipo in ("colosso","gorila"):gigante(b,i,passo,ataque,baixo,tipo=="gorila")
            else:menor(b,tipo,i,passo,ataque,baixo)
            atlas.alpha_composite(q,(i*CW,r*CH))
    atlas.save(SAIDA/"criaturas.png",optimize=True)

MANTO="#32656a"
MANTO_L="#57918c"
TECIDO="#26414d"
VIOLETA="#685161"
BRONZE="#875c49"
BENTO_PELE="#a86952"
BENTO_LUZ="#da9668"
LANTERNA="#8af2d7"


def cristal(b,x,y,escala=1):
    def p(a,c):return(x+a*escala,y+c*escala)
    b.pol(TINTA,[p(0,-6),p(4,-3),p(4,3),p(0,7),p(-4,4),p(-4,-3)])
    b.pol("#4b908e",[p(0,-5),p(3,-2),p(3,3),p(0,6),p(-3,3),p(-3,-2)])
    b.pol("#7cdcbe",[p(0,-5),p(1,1),p(0,5),p(-2,2),p(-2,-2)])
    b.lin("#daffe2",[p(0,-4),p(1,-1),p(0,2)])
    b.lin("#ceaa66",[p(-3,3),p(0,6),p(3,3)])
    b.ret("#edcf84",*p(-2,-5),4*escala,escala)


def bento_quadro(q,i):
    b=Pincel(q,29,52);t=i%4;saud=4<=i<8;grav=i>=8
    incl=2 if grav else 0;bob=1 if t in (1,2) and not saud else 0
    def p(x,y):return (x+incl,y+bob)
    # Botas, rolo de ferramentas e camadas assimétricas da capa.
    b.ret(TINTA,-8,-6,6,7);b.ret(TINTA,3,-6,9,7);b.lin("#b68b68",[(-7,-2),(-4,-2)]);b.ret("#ab7c56",8,-2,3,1)
    placa(b,[p(-12,-31),p(-17,-28),p(-17,-16),p(-13,-12),p(-7,-14),p(-6,-25)],"#5c4b48","#a67e59")
    for tx,top,cor in [(-17,-36,"#ac9a83"),(-15,-38,ACO),(-11,-35,"#bf9472")]:
        b.lin(TINTA,[p(tx,top),p(tx+1,-20)],3);b.lin(cor,[p(tx,top),p(tx+1,-23)])
    b.lin(OURO,[p(-17,-24),p(-11,-23)],2)
    placa(b,[p(-9,-27),p(-6,-33),p(4,-33),p(9,-29),p(9,-21),p(14,-7),p(11,-3),p(3,-6),p(-1,-3),p(-6,-5),p(-13,-3),p(-11,-16)],MANTO,MANTO_L)
    b.pol(TECIDO,[p(-8,-26),p(-4,-24),p(-7,-12),p(-5,-6),p(-10,-5),p(-11,-11)])
    b.pol("#427877",[p(2,-30),p(6,-28),p(7,-19),p(11,-8),p(5,-8),p(1,-14)])
    b.lin("#d0a568",[p(-11,-8),p(-7,-9),p(-3,-7),p(1,-8),p(6,-7),p(10,-6)])
    for x,yy in [(-8,-10),(-3,-10),(6,-10)]:b.ret("#9db19a",*p(x,yy),2,1)
    b.pol("#835948",[p(-8,-30),p(-5,-31),p(8,-14),p(6,-12)])
    b.ret(OURO,*p(-2,-24),3,3);b.ret(TINTA,*p(-1,-23),1,1)
    placa(b,[p(2,-17),p(10,-17),p(12,-12),p(9,-9),p(3,-10)],BRONZE,"#c39a68")
    b.ret(LIMAO,*p(6,-15),2,2)
    # Barba curta com madeixas de prata. Os aros à frente da aba são a marca de Bento.
    placa(b,[p(-6,-38),p(-1,-42),p(7,-39),p(9,-34),p(11,-32),p(8,-29),p(6,-26),p(1,-25),p(-5,-28)],BENTO_PELE,BENTO_LUZ)
    b.pol("#443841",[p(-5,-32),p(-1,-30),p(3,-31),p(9,-32),p(8,-27),p(4,-24),p(0,-25),p(-4,-28)])
    b.lin("#b0a293",[p(-3,-29),p(-1,-27),p(1,-27)])
    b.lin("#d1ba91",[p(1,-31),p(4,-32),p(6,-31),p(8,-32)])
    b.ret(BENTO_LUZ,*p(4,-34),6,2)
    for x in [-3,4]:
        b.el(TINTA,*p(x,-37),7,6);b.el(OURO,*p(x,-37),6,5);b.ret("#36505a",*p(x+1,-36),4,3);b.ret("#b4e1cb",*p(x+2,-36),2,1)
    b.ret("#d5b572",*p(2,-35),3,1)
    placa(b,[p(-12,-36),p(-7,-40),p(-6,-45),p(-1,-47),p(4,-45),p(6,-40),p(10,-40),p(13,-37),p(7,-35),p(0,-36),p(-7,-34)],TECIDO,MANTO_L)
    b.pol(MANTO,[p(-6,-40),p(-5,-44),p(-1,-46),p(4,-44),p(5,-40)])
    b.lin(OURO,[p(-8,-39),p(0,-40),p(7,-39)])
    b.lin("#efca79",[p(-10,-36),p(-4,-37)])
    b.pol("#a16967",[p(-4,-41),p(-8,-47),p(-7,-50),p(-4,-47),p(-2,-42)])
    mao=p(12,-23 if not saud else -32-(t%3)*2)
    cot=p(9,-18 if not saud else -25)
    if grav:mao=p(13+t%2,-20-t%3);cot=p(10,-20)
    membro(b,[p(4,-27),cot,mao],5,MANTO,MANTO_L)
    b.ret("#b77756",mao[0]-1,mao[1]-1,4,3);b.ret("#e0a874",mao[0],mao[1]-1,2,1)
    if saud: b.lin(BENTO_LUZ,[(mao[0]+1,mao[1]),(mao[0]+3,mao[1]-3)],2)
    if grav:
        b.lin("#b7c3bb",[(mao[0]+1,mao[1]-1),(mao[0]+6,mao[1]+5)],2)
        b.ret("#f0bc72",mao[0],mao[1]-3,2,3)
    # Potência de cor concentrada no cristal pendurado.
    lx=-13+(1 if t in (1,2) else 0);ly=-13+(t%2)
    b.lin(TINTA,[p(-7,-22),p(-11,-22),p(lx,-18)],2);b.lin(OURO,[p(-9,-22),p(lx,-18)])
    cristal(b,*p(lx,ly),.86)


def atlas_bento():
    atlas=Image.new("RGBA",(60*4,56*3))
    for i in range(12):
        q=Image.new("RGBA",(60,56));bento_quadro(q,i);atlas.alpha_composite(q,((i%4)*60,(i//4)*56))
    atlas.save(SAIDA/"bento.png",optimize=True)


def retrato_bento():
    q=Image.new("RGB",(108,108),"#192631");b=Pincel(q)
    # Nicho da oficina atrás da figura.
    b.pol("#23343e",[(0,0),(61,0),(78,32),(70,75),(42,108),(0,108)])
    b.pol("#304348",[(0,5),(14,0),(41,0),(12,18),(0,48)])
    for x,yy,hh in [(4,21,24),(10,13,22),(92,23,36),(99,16,28)]:
        b.lin("#455b59",[(x,yy),(x,yy+hh)]);b.ret("#668276",x-1,yy,3,1)
    b.pol("#21323d",[(75,0),(108,0),(108,80),(98,65),(95,26)])
    # Pergaminhos e buris por trás de seu ombro.
    for x,y0,y1 in [(7,47,89),(10,55,93),(16,44,84)]:
        b.lin(TINTA,[(x,y0),(x+6,y1)],4);b.lin("#99a49a",[(x,y0),(x+4,y1-10)],2)
        b.lin("#d7c099",[(x,y0),(x+1,y0+4)])
    placa(b,[(-3,108),(1,83),(12,72),(25,66),(41,67),(87,69),(99,78),(109,101),(109,108)],TECIDO,MANTO_L)
    b.pol("#376969",[(5,106),(11,83),(22,74),(31,75),(19,88),(15,106)])
    b.pol("#477b75",[(29,72),(41,68),(74,72),(87,81),(72,89),(46,84),(33,93),(20,93)])
    b.lin("#78a193",[(9,87),(17,79),(25,77),(26,78)],2);b.lin("#8ba88e",[(30,88),(37,79),(44,77)],2)
    b.pol("#27545b",[(37,81),(47,79),(60,83),(79,79),(91,83),(80,94),(60,98),(49,107),(40,107)])
    for x,y in [(15,94),(22,82),(71,95),(83,87),(89,101),(8,102)]:b.lin("#508981",[(x,y),(x+3,y-2),(x+5,y-2)],2)
    placa(b,[(18,74),(26,71),(67,106),(62,108),(54,108)],"#87594a","#c19467")
    placa(b,[(32,84),(37,81),(47,88),(42,94)],OURO,LIMAO);b.pol("#635052",[(35,85),(37,84),(44,88),(41,91)])
    # Volumes do cabelo e pele iluminada à direita do retrato.
    placa(b,[(22,43),(27,26),(47,15),(68,19),(81,30),(83,45),(87,56),(82,73),(71,84),(49,87),(29,76),(19,60)],"#493e47","#817078")
    placa(b,[(32,37),(45,29),(64,29),(76,35),(80,47),(77,55),(84,59),(82,65),(78,65),(73,75),(62,81),(45,77),(35,70),(31,61),(26,55)],BENTO_PELE,"#d29672")
    b.pol("#c18361",[(38,39),(51,34),(67,33),(75,38),(77,47),(69,51),(62,58),(53,54),(40,58),(34,52)])
    b.pol("#d7986e",[(54,38),(64,34),(73,37),(76,45),(67,49),(61,46),(56,46)])
    b.pol("#8f5d52",[(35,49),(43,50),(42,57),(40,62),(35,60),(32,54)])
    b.pol("#b37555",[(49,54),(55,53),(55,58),(50,63),(43,64),(43,60)])
    b.pol("#d6966a",[(63,46),(68,47),(68,52),(72,57),(77,59),(76,62),(68,64),(59,60),(59,57)])
    b.lin("#f0b278",[(66,52),(67,57),(72,59)],2);b.lin("#89564d",[(60,61),(64,62),(66,61)])
    b.el("#9a6355",23,49,11,17);b.el("#c38363",25,50,8,12);b.lin("#87534b",[(26,54),(29,53),(31,56),(28,60)])
    # Grosses costeletas e barba irregular em mechas.
    b.pol("#493d43",[(30,54),(34,57),(36,63),(42,67),(51,66),(60,63),(67,66),(77,64),(78,70),(74,77),(70,81),(62,83),(56,87),(50,85),(44,85),(39,80),(34,79),(31,73),(28,67)])
    b.pol("#705556",[(32,61),(36,68),(42,71),(44,76),(53,79),(58,84),(49,81),(43,82),(39,77),(34,75)])
    b.pol("#90736b",[(41,70),(48,73),(55,75),(61,73),(68,75),(71,71),(76,69),(74,75),(68,80),(61,80),(57,82),(49,77),(43,77)])
    for x,y,dx in [(30,55,0),(31,60,1),(34,70,2),(40,76,2),(48,78,4),(67,77,4),(59,81,3),(70,72,3)]:
        b.lin("#a98c77",[(x,y),(x+dx,y+2)])
    b.pol("#d0b897",[(42,64),(50,61),(58,62),(62,64),(65,62),(73,62),(76,64),(72,66),(66,65),(63,67),(58,66),(52,64),(46,67),(41,67)])
    b.lin("#4d3b40",[(54,69),(61,70),(65,69),(70,68)])
    b.lin("#bb8770",[(57,71),(62,72),(66,71)])
    # Verres asymétriques en laiton. Les yeux se lisent sous les reflets.
    b.lin("#483a3e",[(25,47),(36,49),(44,49)],3);b.lin("#d0a36a",[(25,47),(40,50)],2)
    for x,y,w,h in [(36,43,20,16),(61,42,17,14)]:
        b.el(TINTA,x-1,y-1,w+2,h+2);b.el("#bb8853",x,y,w,h);b.el("#71675e",x+2,y+2,w-4,h-4)
        b.el("#706861",x+3,y+3,w-6,h-6)
        b.pol("#7b9990",[(x+3,y+5),(x+8,y+2),(x+13,y+3),(x+6,y+7),(x+3,y+9)])
        b.lin("#f2c47a",[(x+2,y+4),(x+5,y+1),(x+w-6,y),(x+w-3,y+2)],2)
        b.lin("#e2b276",[(x+4,y+h-3),(x+7,y+h-2),(x+w-5,y+h-3)])
        b.lin("#c4d2b0",[(x+4,y+5),(x+6,y+4)],2)
        b.lin("#413b3e",[(x+8,y+7),(x+11,y+6),(x+w-4,y+7)],2);b.ret("#f3d39b",x+11,y+6,2,1)
    b.lin("#483c3e",[(54,48),(58,45),(63,47)],4);b.lin("#e6b36b",[(55,47),(58,45),(62,46)],2)
    # Chapéu de viagem, forro tijolo, pluma e várias costuras interrompidas.
    placa(b,[(9,42),(17,36),(24,31),(27,17),(35,7),(50,5),(63,7),(69,14),(74,27),(89,28),(98,32),(92,37),(78,41),(60,40),(47,39),(33,41),(20,46),(10,46)],"#294850","#719284")
    b.pol("#3f686b",[(25,31),(30,17),(37,11),(49,8),(60,10),(65,14),(68,25),(51,23),(39,27)])
    b.pol("#4b7773",[(30,24),(35,15),(43,12),(55,10),(61,12),(62,15),(48,16),(37,23)])
    b.pol("#344e55",[(55,16),(63,14),(66,20),(68,25),(58,27),(49,28)])
    b.pol("#957059",[(23,31),(39,24),(54,22),(69,23),(72,27),(53,27),(38,31),(23,36)])
    b.lin(OURO,[(24,31),(40,25),(54,24),(67,24)],2)
    b.lin("#e6bd7d",[(33,29),(40,26),(51,25)])
    b.pol(MANTO,[(12,42),(25,34),(42,29),(58,27),(79,29),(89,29),(94,32),(86,34),(69,34),(53,33),(38,35),(23,40)])
    b.lin("#7f9b86",[(14,42),(26,36),(42,31),(54,29),(68,29)])
    b.pol("#705354",[(17,43),(35,36),(54,33),(71,35),(89,34),(80,38),(65,39),(48,37),(32,40),(22,44)])
    b.lin("#c39570",[(20,43),(29,40),(37,38)])
    placa(b,[(27,31),(20,19),(19,7),(24,10),(29,16),(33,22),(33,28)],"#9d6660","#d49b72")
    b.lin("#f1bc79",[(24,12),(27,23),(32,30)]);b.lin("#6d5153",[(24,20),(27,22)]);b.ret(LIMAO,32,28,3,3)
    # Lanterna na frente. O pináculo e a corrente unem retrato e sprite.
    b.lin("#171c29",[(89,61),(89,68),(86,71),(86,78)],3);b.lin("#c09664",[(89,63),(90,67),(86,72),(86,77)])
    b.pol("#293c43",[(78,78),(84,73),(89,73),(96,78),(95,92),(88,99),(80,95),(76,88)])
    b.pol("#406664",[(79,81),(84,76),(89,76),(94,81),(93,91),(88,96),(80,91)])
    cristal(b,86,85,1.58);b.lin("#e9bb72",[(78,79),(85,76),(93,79)]);b.ret("#facf83",85,98,4,2)
    q.save(SAIDA/"retrato.png",optimize=True)


if __name__=="__main__":
    SAIDA.mkdir(parents=True,exist_ok=True)
    atlas_heroi();atlas_criaturas();atlas_bento();retrato_bento()
