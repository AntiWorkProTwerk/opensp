"""Homepage review assets. Native linked Penpot layouts are maintained separately."""
from pathlib import Path
from html import escape
from base64 import b64encode
import re
import json
import sys
from textwrap import wrap
from panel import device
from mobile import dark_svg

ROOT = Path(__file__).parent
sys.path.insert(0,str(ROOT.parent/'components'))
from sp_display import screen_markup
SCREEN = ROOT.parent/'assets/screens/antiworkprotwerk-r3'
SEQUENCE = json.loads((SCREEN/'manifest.json').read_text(encoding='utf-8'))
POSTER = b64encode((SCREEN/'poster.png').read_bytes()).decode()
COPY = json.loads((ROOT/'home-copy.json').read_text(encoding='utf-8'))
def copy_lines(key,width):
    return wrap(COPY[key],width=width,break_long_words=False,break_on_hyphens=False)

def text(x, y, value, size=20, mono=False, weight='400', fill='#111', tracking=0):
    family='Cousine' if mono else 'Arimo'
    return f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" letter-spacing="{tracking}" fill="{fill}">{escape(value)}</text>'

def lines(x,y,values,size=20,leading=32):
    return ''.join(text(x,y+i*leading,v,size) for i,v in enumerate(values))

def label(x,y,value,size=13):return text(x,y,value,size,True,tracking=.26)
def rect(x,y,w,h,fill='white'):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'
def line(x,y,x2,y2):return f'<path d="M{x} {y}L{x2} {y2}" fill="none" stroke="#888"/>'
def arrow(x,y):return f'<path d="M{x} {y+14}l14 -14m-14 0h14v14" fill="none" stroke="#111" stroke-width="1.25"/>'
def panel(x,y,s):
    poster=f'<image x="145" y="142.5" width="110" height="55" href="data:image/png;base64,{POSTER}" style="image-rendering:pixelated"/>'
    return device(x,y,s,0,screen_content=poster)

fonts=''
for family,file in [('Arimo','arimo-latin.woff2'),('Cousine','cousine-latin.woff2')]:
    data=b64encode((ROOT/'fonts'/file).read_bytes()).decode()
    fonts+=f"@font-face{{font-family:{family};src:url(data:font/woff2;base64,{data}) format('woff2');font-weight:{'400 700' if family=='Arimo' else '400'}}}"

def svg(body,w,h):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><style>{fonts}</style>{body}</svg>'

rows=[('Meet the instrument','A visual map of the surface.'),('From a pad press to an event','Follow an input through the diagram.'),('Reading the project','How to read observations and open questions.')]
d=rect(0,0,1440,1592)
d+=text(64,53,'opensp',27,weight='700')+label(625,47,'Releases',14)+label(757,47,'Guides',14)+label(1270,47,'LIGHT / ○')+line(64,79,1376,79)
d+=label(64,158,COPY['eyebrow'])+text(62,252,COPY['title'],76,tracking=-1.9)
d+=lines(64,302,copy_lines('intro',43),22,32)
d+=text(64,398,COPY['repository'],22)+panel(856,112,1.10)
d+='<g transform="translate(0 285)">'
d+=line(64,488,1376,488)+label(64,540,'RELEASES')+text(384,542,COPY['releasesHeading'],32,tracking=-.64)+line(1348,536,1364,536)
d+=lines(384,612,copy_lines('releaseBody',89))
d+=rect(384,688,992,88,'#f2f2f2')+label(408,716,COPY['releaseStatus'])+text(408,747,COPY['releasePlaceholder'],16)
d+=line(64,832,1376,832)+label(64,884,'GUIDES')+text(384,886,COPY['guidesHeading'],32,tracking=-.64)+line(1348,880,1364,880)
for i,(title,desc) in enumerate(rows):
    y=936+i*88
    d+=line(384,y,1376,y)+label(384,y+37,f'{i+1:02}')+text(440,y+36,title,22)+text(440,y+67,desc,16,fill='#555')+arrow(1350,y+22)
d+=line(64,1235,1376,1235)+label(64,1275,COPY['footerProject'],12)+label(1318,1275,COPY['footerPage'],12)
d+='</g>'

m=rect(0,0,390,1904)+text(24,43,'opensp',27,weight='700')+label(286,40,'LIGHT / ○',12)
m+=label(100,84,'Releases',14)+label(232,84,'Guides',14)+line(24,103,366,103)
m+=label(24,144,COPY['eyebrow'],12)+text(23,210,COPY['title'],48,tracking=-1.2)
m+=lines(24,258,copy_lines('intro',41),18,29)
m+=lines(24,345,copy_lines('repository',39),18,29)+panel(35,416,.80)
m+=line(24,904,366,904)+label(24,946,'RELEASES')+line(342,942,358,942)
m+=lines(24,987,copy_lines('releasesHeading',29),22,28)
m+=lines(24,1054,copy_lines('releaseBody',36),18,29)
m+=rect(24,1200,342,104,'#f2f2f2')+label(44,1228,COPY['releaseStatus'])+lines(44,1261,copy_lines('releasePlaceholder',38),16,24)
m+=line(24,1344,366,1344)+label(24,1386,'GUIDES')+line(342,1382,358,1382)
m+=lines(24,1427,copy_lines('guidesHeading',25),22,28)
for i,(title,desc) in enumerate(rows):
    y=1472+i*96
    m+=line(24,y,366,y)+text(24,y+36,title,20)+arrow(344,y+22)
    ds=[desc] if i<2 else ['How to read observations','and open questions.']
    m+=lines(24,y+66,ds,16,24)
m+=line(24,1792,366,1792)+''.join(label(24,1830+i*20,t,13) for i,t in enumerate(copy_lines('footerProject',39)))+label(24,1882,COPY['footerPage'],13)

sheet=''
for name,body,w,h,x in [('home-desktop',d,1440,1592,0),('home-mobile',m,390,1904,1500)]:
    source=svg(body,w,h)
    (ROOT/f'{name}.svg').write_text(source,encoding='utf-8')
    dark=dark_svg(source).replace('#eeefec','#eef0ec').replace('#292c2e','#242628').replace('fill="#555"','fill="#b6b9b5"').replace('stroke="#888"','stroke="#636763"')
    (ROOT/f'{name}-dark.svg').write_text(dark,encoding='utf-8')
    # Each instrument has its own local ID namespace in the paired sheet.
    sheet+=f'<g transform="translate({x} 0)">{body}</g>'
    dark_body=dark.split('</style>',1)[1].rsplit('</svg>',1)[0]
    sheet+=f'<g transform="translate({x+1980} 0)">{dark_body}</g>'
sheet=re.sub(r' id="[^"]+"','',sheet)
(ROOT/'home-pairs.svg').write_text(svg(sheet,3870,1904),encoding='utf-8')

template=(ROOT/'home.template.html').read_text(encoding='utf-8')
for key,value in COPY.items():
    template=template.replace('{{'+key+'}}',escape(value))
illustration=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 570" aria-hidden="true">{device(0,0,1,0,screen_content="")}</svg>'
illustration=re.sub(r' role="button"| tabindex="0"','',illustration)
(ROOT/'home.html').write_text(template.replace('{{PANEL}}',illustration).replace('{{SCREEN}}',screen_markup(SEQUENCE,'../assets/screens/antiworkprotwerk-r3')),encoding='utf-8')
print('Generated homepage review assets; native Penpot components remain the visual source.')
