"""Generate original, editable SVG concept sheets. No third-party artwork."""
from pathlib import Path
from html import escape
import re
from panel import device, parts_sheet
from mobile import compositions, dark_svg

ROOT = Path(__file__).parent
def text(x,y,s,size=20,font='Arial',fill='#111',weight='normal'):
    return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" fill="{fill}">{escape(s)}</text>'
def rect(x,y,w,h,fill='white',stroke='#111',sw=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x,y,x2,y2,stroke='#111',sw=1):
    return f'<path d="M{x} {y}L{x2} {y2}" fill="none" stroke="{stroke}" stroke-width="{sw}"/>'
def lines(x,y,ss,size=22,font='Arial',leading=34):
    return ''.join(text(x,y+i*leading,s,size,font) for i,s in enumerate(ss))
def label(x,y,s): return text(x,y,s,13,'Courier New')
def shell(title,sub):
    return rect(0,0,1200,1500)+label(52,43,title)+label(52,68,sub)+line(52,91,1148,91)+text(52,136,'opensp',30,weight='bold')+label(800,130,'JOURNAL     GUIDES     ABOUT')+line(52,159,1148,159)
def footer(s): return line(52,1433,1148,1433)+label(52,1463,s)+label(923,1463,'CONCEPT / 28.09.26')

a=shell('A / FIELD MANUAL','PRECISE. INDEXED. AN INSTRUMENT MANUAL FOR DEVELOPERS.')
a+=label(52,222,'GUIDE 001 / INPUTS')+text(284,233,'From a pad press',64)+text(284,304,'to an event.',64)
a+=lines(286,365,['Sixteen pads. One readable story. Follow an input','from the surface of the instrument to the screen.'],22)
a+=label(52,329,'ON THIS PAGE')+lines(52,368,['01  The surface','02  The signal','03  The result'],16,'Courier New',32)
a+=line(284,414,1148,414)+label(286,448,'01 / THE SURFACE')+label(908,448,'ILLUSTRATIVE DIAGRAM')
a+=device(349,489,.89)
a+=line(492,549,924,579)+label(941,582,'01 / TURN')+lines(941,613,['A single marker','shows rotation.'],16,leading=24)
a+=line(576,640,920,712)+label(938,716,'02 / READ')+lines(938,747,['The display is its','own live layer.'],16,leading=24)
a+=line(444,818,920,867)+label(938,872,'03 / PRESS')+lines(938,903,['Black fill marks','the active pad.'],16,leading=24)
a+=label(52,1069,'FIG. 01')+lines(284,1069,['The instrument stays recognizable. Everything that does not','help explain this step recedes into the background.'],20,leading=30)
a+=line(284,1132,1148,1132)+text(284,1190,'02  Make the state visible',32)
a+=lines(284,1237,['Put the explanation next to the thing that changes. Use the','same names in the prose, diagram and code example.'],21)
a+=rect(284,1321,864,64,'#f2f2f2','none')+text(304,1360,'onPad(1)  →  activePad = 1  →  render()',18,'Courier New')
a+=footer('SELECT FOR: GUIDES / REFERENCE / LONG TECHNICAL WRITEUPS')

b=shell('B / LAB JOURNAL','EDITORIAL. QUIET. THE JOURNEY TAKES THE LEAD.')
b+=label(52,225,'FIELD NOTES / NO. 001')+label(855,225,'DESIGN SAMPLE / 6 MIN')
b+=text(138,336,'Learning to listen',80,'Georgia')+text(138,430,'to the machine.',80,'Georgia')
b+=lines(144,497,['A record of small questions, careful experiments,','and the moments when an instrument answers back.'],26,'Georgia',39)
b+=line(144,600,1056,600)+label(144,635,'OPENSP JOURNAL')+label(829,635,'ILLUSTRATIVE COPY')
b+=device(137,695,.82,6,-10)+text(594,739,'Start with what',38,'Georgia')+text(594,786,'you can observe.',38,'Georgia')
b+=lines(594,846,['A control moves. A value changes. Before','we tell a bigger story, we need a clear','way to describe that small exchange.'],23,'Georgia',36)
b+=lines(594,994,['The visual is part of the explanation,','not a decorative image between','paragraphs. Read, try, and compare.'],23,'Georgia',36)
b+=line(594,1135,1056,1135)+label(594,1169,'MARGIN NOTE / 01')+lines(594,1205,['Observation and interpretation should','look different on the page.'],19,leading=29)
b+=line(144,1320,1056,1320)+label(144,1356,'NEXT ENTRY')+text(594,1360,'Naming what changes  →',26,'Georgia')+footer('SELECT FOR: NARRATIVE / MILESTONES / PROJECT ESSAYS')

c=shell('C / GUIDED WALKTHROUGH','A PINNED INSTRUMENT. ONE ACTION AT A TIME.')
c+=label(52,222,'INTERACTIVE GUIDE / 001')+text(52,303,'Read it. Try it. See it.',64)
c+=text(54,357,'Small steps, with the instrument beside you.',24)
c+=line(52,402,1148,402)+label(52,442,'LIVE FIGURE / STAYS IN VIEW')+label(684,442,'STEP 02 / 04')
c+=device(99,492,1.12,1,60)
c+=rect(684,488,464,184,'#111','#111')+label(710,520,'')+text(710,531,'02 / PRESS A PAD',15,'Courier New','white')
c+=text(710,577,'Watch the surface',29,'Arial','white')+text(710,616,'and screen agree.',29,'Arial','white')
c+=lines(684,728,['The pad fills in when selected.','The screen names the input.','Two views of the same state.'],23,leading=36)
c+=rect(684,850,104,43)+text(702,878,'PAD 01',16,'Courier New')+text(806,879,'→',25)+rect(850,850,164,43)+text(865,878,'SCREEN',16,'Courier New')
c+=line(684,937,1148,937)+label(684,973,'NEXT / TURN CTRL 1')+lines(684,1019,['Rotation becomes a value.','A stable layout makes the','small change easy to see.'],22,leading=35)
c+=rect(99,1174,449,62)+text(119,1213,'▶  PLAY',17,'Courier New')+label(279,1212,'01 — 02 — 03 — 04')
c+=label(99,1272,'MANUAL STEPS / PAUSE / REDUCED MOTION')+label(684,1272,'ON MOBILE: FIGURE ABOVE EACH STEP')
c+=footer('SELECT FOR: WALKTHROUGHS / CAUSE AND EFFECT / LIVE DEMONSTRATIONS')

d=shell('D / COMPONENTS + STATES','MIX THESE PARTS. NO PALETTE OR TYPE SYSTEM IS APPROVED YET.')
d+=label(52,215,'01 / TYPE HIERARCHY')+text(52,283,'A clear signal.',48)+text(54,330,'Section titles / 28–32 px',28)+text(54,373,'Reading text / 18–22 px, generous leading.',20)+label(54,411,'MONO FOR LABELS, VALUES AND CODE — NOT BODY COPY')
d+=label(683,215,'02 / EVIDENCE, NOT DECORATION')+rect(683,244,465,57)+label(701,279,'OBSERVED / DEVICE RESULT')+rect(683,316,465,57,'#111')+text(701,351,'MODEL / NOT A HARDWARE RESULT',14,'Courier New','white')+line(683,410,1148,410)+label(701,440,'OPEN QUESTION / NEEDS VERIFICATION')
d+=line(52,480,1148,480)+label(52,520,'03 / CONTROL STATES')
for i,(state,pad,angle) in enumerate([('IDLE',0,-35),('PRESS / PAD 01',1,-35),('TURN / CTRL 1',1,65),('RELEASE',0,65)]):
    d+=device(55+i*281,550,.54,pad,angle)+label(55+i*281,895,state)
d+=line(52,939,1148,939)+label(52,979,'04 / ANATOMY OF A WALKTHROUGH')
d+=text(52,1033,'Action',30)+text(418,1033,'Visible response',30)+text(832,1033,'Explanation',30)
d+=label(52,1077,'PRESS PAD 01')+label(418,1077,'FILL + SCREEN LABEL')+label(832,1077,'WHY THE STATE CHANGED')
d+=line(230,1025,376,1025)+line(710,1025,790,1025)
d+=rect(52,1130,1096,91,'#f2f2f2','none')+text(75,1166,'const state = { pad: 1, knob: 64, screen: "PAD 01" };',19,'Courier New')+text(75,1200,'render(state);  // one source of truth for every visible layer',18,'Courier New')
d+=lines(52,1280,['Motion explains a change. It does not loop in the background.','Offer pause, replay and direct step selection. Never depend on color alone.'],22)
d+=footer('PROPOSAL ONLY / SCREEN CONTENT AND MOTION ARE ILLUSTRATIVE')

def svg(body,w=1200,h=1500):
    counts={}
    def unique(match):
        name=match[1]; counts[name]=counts.get(name,0)+1
        return ' id="'+name+(f'-instance-{counts[name]}' if counts[name]>1 else '')+'"'
    body=re.sub(r' id="([^"]+)"',unique,body)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'
e=parts_sheet()
for name,body in [('a-field-manual',a),('b-lab-journal',b),('c-walkthrough',c),('d-components',d),('e-panel-parts',e)]:
    (ROOT/f'{name}.svg').write_text(svg(body),encoding='utf-8')
sheet=''.join(f'<g id="{name}" transform="translate({i*1260} 0)">{body}</g>' for i,(name,body) in enumerate([('A-field-manual',a),('B-lab-journal',b),('C-walkthrough',c),('D-components',d),('E-panel-parts',e)]))
(ROOT/'concepts.svg').write_text(svg(sheet,6240,1500),encoding='utf-8')
(ROOT/'instrument.svg').write_text(svg(device(active=0),400,570),encoding='utf-8')
template=(ROOT/'preview.template.html').read_text(encoding='utf-8')
template=re.sub(r'src="([a-e]-[^\"]+)\.svg"',r'src="\1.svg" data-light="\1.svg" data-dark="\1-dark.svg"',template)
(ROOT/'index.html').write_text(template.replace('{{INSTRUMENT}}',svg(device(active=0),400,570)),encoding='utf-8')
mobile=compositions(text,rect,line,lines,label)
mobile_sheet=''
for i,(name,body) in enumerate(mobile):
    light=svg(body,390,1320)
    (ROOT/f'{name}.svg').write_text(light,encoding='utf-8')
    (ROOT/f'{name}-dark.svg').write_text(dark_svg(light),encoding='utf-8')
    mobile_sheet+=f'<g transform="translate({i*430} 0)">{body}</g>'
    # Keep all shapes native to the composed SVG rather than embed bitmap previews.
    dark_body=dark_svg(svg(body,390,1320)).split('>',1)[1].rsplit('</svg>',1)[0]
    mobile_sheet+=f'<g transform="translate({i*430} 1400)">{dark_body}</g>'
(ROOT/'mobile-concepts.svg').write_text(svg(mobile_sheet,1250,2720),encoding='utf-8')
for name in ['a-field-manual','b-lab-journal','c-walkthrough','d-components','e-panel-parts']:
    (ROOT/f'{name}-dark.svg').write_text(dark_svg((ROOT/f'{name}.svg').read_text(encoding='utf-8')),encoding='utf-8')
mobile_template=(ROOT/'mobile.template.html').read_text(encoding='utf-8')
interaction=template.split('<script>')[-1].split('</script>')[0]
options=''.join(f'<option value="{n}">Pad {n:02}</option>' for n in range(1,17))
(ROOT/'mobile.html').write_text(mobile_template.replace('{{INSTRUMENT}}',svg(device(active=0),400,570)).replace('{{INTERACTION}}',interaction).replace('{{PAD_OPTIONS}}',options),encoding='utf-8')
print('Generated desktop/mobile light and dark SVGs, contact sheets and interactive review pages.')
