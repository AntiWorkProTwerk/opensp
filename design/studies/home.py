"""Homepage proposal, paired desktop/mobile and light/dark Penpot source."""
from pathlib import Path
from build_studies import text, rect, line, lines, label, svg
from panel import device
from mobile import dark_svg
ROOT=Path(__file__).parent

def panel(x,y,s):
    return device(x,y,s,0).replace('INPUT / DEMO','OPENSP').replace('READY','HELLO, SP.')

d=rect(0,0,1440,1440)
d+=text(64,57,'opensp',27,weight='bold')+text(619,54,'Releases',18)+text(733,54,'Guides',18)+label(1274,54,'LIGHT / ○')+line(64,89,1376,89)
d+=label(64,208,'AN INDEPENDENT SP-404MKII PROJECT')
d+=text(64,305,'OpenSP',76)
d+=lines(68,371,['An open set of firmware and guides','for the Sp-404MKII'],23,leading=36)
d+=panel(961,143,.70)
d+='<g transform="translate(0 -150)">'
d+=line(64,747,1376,747)+label(64,791,'01 / RELEASES')+text(424,802,'A record of what changes.',36)+text(1340,802,'−',28)
d+=lines(424,853,['Builds, release notes, and compatibility information.','A clear place to see what is ready and what is experimental.'],20,leading=32)
d+=rect(424,941,952,83,'#f2f2f2','none')+label(448,975,'RELEASE INDEX / PREVIEW')+text(448,1003,'Downloads and verified release details will appear here.',17)
d+=line(64,1081,1376,1081)+label(64,1125,'02 / GUIDES')+text(424,1136,'Understand it, one step at a time.',36)+text(1340,1136,'−',28)
for i,(name,desc) in enumerate([('Meet the instrument','A visual map of the surface.'),('From a pad press to an event','Follow an input through the diagram.'),('Reading the project','How to read observations and open questions.')]):
    yy=1190+i*87
    d+=line(424,yy,1376,yy)+label(424,yy+35,f'0{i+1}')+text(479,yy+37,name,23)+text(479,yy+64,desc,16)+text(1346,yy+38,'↗',24)
d+='</g>'+line(64,1380,1376,1380)+label(64,1417,'OPENSP / INDEPENDENT, COMMUNITY-MINDED')+label(1040,1417,'HOMEPAGE DESIGN / PREVIEW')

m=rect(0,0,390,1600)+text(22,40,'opensp',25,weight='bold')+label(302,37,'LIGHT ○')
m+=text(105,93,'Releases',18)+text(213,93,'Guides',18)+line(22,118,368,118)
m+=label(22,151,'AN INDEPENDENT SP-404MKII PROJECT')+text(22,220,'OpenSP',48)
m+=lines(22,288,['An open set of firmware and guides','for the Sp-404MKII'],18,leading=29)
m+=panel(92,372,.515)
m+='<g transform="translate(0 -260)">'
m+=line(22,968,368,968)+label(22,1005,'01 / RELEASES')+text(342,1015,'−',28)
m+=lines(22,1130,['Builds, release notes, and','compatibility information.'],18,leading=29)
m+=rect(22,1208,346,106,'#f2f2f2','none')+label(39,1242,'RELEASE INDEX / PREVIEW')+lines(39,1273,['Verified release details','will appear here.'],16,leading=24)
m+='</g><g transform="translate(0 -280)">'
m+=line(22,1360,368,1360)+label(22,1396,'02 / GUIDES')+text(342,1407,'−',28)
for i,(name,desc) in enumerate([('Meet the instrument','A visual map of the surface.'),('From a pad press to an event','Follow an input through the diagram.'),('Reading the project','Observations and open questions.')]):
    yy=1445+i*91
    m+=line(22,yy,368,yy)+text(22,yy+34,name,19)+text(22,yy+61,desc,15)+text(350,yy+35,'↗',18)
m+='</g>'+line(22,1510,368,1510)+label(22,1545,'OPENSP / INDEPENDENT PROJECT')+label(22,1571,'HOMEPAGE DESIGN / PREVIEW')

sheet=''
for name,body,w,h,x in [('home-desktop',d,1440,1440,0),('home-mobile',m,390,1600,1500)]:
    source=svg(body,w,h)
    (ROOT/f'{name}.svg').write_text(source,encoding='utf-8')
    dark=dark_svg(source)
    (ROOT/f'{name}-dark.svg').write_text(dark,encoding='utf-8')
    sheet+=f'<g transform="translate({x} 0)">{body}</g>'
    sheet+=f'<g transform="translate({x+1980} 0)">{dark.split(">",1)[1].rsplit("</svg>",1)[0]}</g>'
(ROOT/'home-pairs.svg').write_text(svg(sheet,3870,1600),encoding='utf-8')
template=(ROOT/'home.template.html').read_text(encoding='utf-8')
illustration=svg(panel(0,0,1),400,570)
# Homepage illustration is decorative, not an interactive pad grid.
import re
illustration=re.sub(r' role="button"| tabindex="0"','',illustration)
(ROOT/'home.html').write_text(template.replace('{{PANEL}}',illustration),encoding='utf-8')
print('Generated homepage desktop/mobile light/dark proposals and responsive preview.')
