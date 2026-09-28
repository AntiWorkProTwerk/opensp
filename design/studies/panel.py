"""Original modular SP-404MKII top-panel drawing.

Placement reference: Roland v4 reference manual, pp. 6–11.
Simplified orthographic geometry, not measured CAD. Screen content is a demo.
Every physical part is a named SVG group, with separate animated layers.
"""
from html import escape

def group(name, body, extra=''):
    return f'<g id="{name}" data-part="{name}" {extra}>{body}</g>'

def box(x,y,w,h,fill='white',sw=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="#111" stroke-width="{sw}"/>'

def caption(x,y,s,size=6,fill='#111'):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial" font-size="{size}" fill="{fill}">{escape(s)}</text>'

def button(name,x,y,w,h,labels,size=5.5):
    body=box(x,y,w,h)
    for i,label in enumerate(labels):
        body+=caption(x+w/2,y+h/2+2+(i-(len(labels)-1)/2)*7,label,size)
    return group(name,body)

def knob(name,cx,cy,r,label,angle=-35):
    body=caption(cx,cy-r-7,label,7)
    body+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="white" stroke="#111" stroke-width="1.4"/>'
    body+=group(name+'-indicator',f'<path d="M{cx} {cy}V{cy-r+4}" stroke="#111" stroke-width="2"/>',f'transform="rotate({angle} {cx} {cy})"')
    return group(name,body)

def display(active=0):
    bezel=group('display-bezel','<circle cx="200" cy="167" r="65" fill="white" stroke="#111" stroke-width="1.5"/>')
    screen=box(145,139,110,62,'#111')
    screen+=caption(200,153,'INPUT / DEMO',6,'white')
    screen+=f'<text id="screen-value" x="151" y="177" font-family="Courier New" font-size="13" fill="white">{"PAD %02d" % active if active else "READY"}</text>'
    screen+='<path id="wave" d="M151 188h12l5 -7 5 14 5 -10 5 3h66" fill="none" stroke="white"/>'
    return group('display',bezel+group('screen-content',screen))

def effects():
    body=''
    for side,x,names in [('left',73,[('filter-drive',['FILTER +','DRIVE']),('resonator',['RESONATOR']),('delay',['DELAY'])]),('right',284,[('isolator',['ISOLATOR']),('djfx-looper',['DJFX','LOOPER']),('mfx',['MFX'])])]:
        for i,(name,labels) in enumerate(names):
            body+=button('fx-'+name,x,121+i*35,43,28,labels,6)
    return group('effect-buttons',body)

def control_buttons():
    left=''
    for row,names in enumerate([[('pattern-select',['PATTERN','SELECT']),('pattern-edit',['PATTERN','EDIT']),('record-setting',['RECORD','SETTING'])],[('del',['DEL']),('rec',['REC']),('resample',['RESAMPLE'])],[('exit',['EXIT']),('copy',['COPY']),('remain',['REMAIN'])]]):
        for col,(name,labels) in enumerate(names):
            left+=button(name,61+col*38,248+row*33,29,21,labels,4.8)
    right=''
    for i,(name,labels) in enumerate([('start-end',['START /','END']),('pitch-speed',['PITCH /','SPEED']),('mark',['MARK'])]):
        right+=button(name,185+i*38,248,28,21,labels,4.8)
    right+=knob('value',322,253,13,'VALUE')
    for i,(name,labels) in enumerate([('bpm-sync',['BPM','SYNC']),('gate',['GATE']),('loop',['LOOP']),('reverse',['REVERSE']),('roll',['ROLL'])]):
        right+=button(name,177+i*32,281,26,20,labels,4.6)
    for i,label in enumerate(['A/F','B/G','C/H','D/I','E/J','SHIFT']):
        right+=button('bank-'+label.replace('/','-').lower() if i<5 else 'shift',177+i*28,314,21,19,[label],5)
    return group('control-section',group('record-edit-buttons',left)+group('sample-bank-buttons',right))

def pad(number,x,y,active=False):
    body=box(x,y,46,39,'#111' if active else 'white',1.2)
    body+=caption(x+36,y+12,str(number),10,'white' if active else '#111')
    return group(f'pad-{number}',body,f'class="pad" role="button" tabindex="0" aria-label="Pad {number}" data-pad="{number}"')

def pads(active=0):
    body=''.join(pad(i+1,61+i%4*58,347+i//4*50,i+1==active) for i in range(16))
    return group('pad-grid',body)

def performance_buttons():
    body=''
    for i,(name,labels) in enumerate([('bus-fx',['BUS FX']),('hold',['HOLD']),('ext-source',['EXT','SOURCE']),('sub-pad',['SUB PAD'])]):
        body+=button(name,293,347+i*50,46,39,labels,7)
    return group('performance-buttons',body)

def enclosure():
    body=box(18,0,364,570,sw=1.6)+box(27,17,346,536,sw=.7)
    body+=caption(98,33,'OPENSP',10)+caption(283,33,'SP-404MKII',10)
    for x in [51,350]:
        for y in [31,541]: body+=f'<circle cx="{x}" cy="{y}" r="4" fill="white" stroke="#111" stroke-width=".8"/>'
    return group('enclosure',body)

def device(x=0,y=0,scale=1,active=1,angle=25):
    parts=enclosure()
    parts+=group('top-knobs',''.join(knob(name,cx,68,20,label,angle if name=='ctrl-1' else -35) for name,cx,label in [('volume',83,'VOLUME'),('ctrl-1',161,'CTRL 1'),('ctrl-2',239,'CTRL 2'),('ctrl-3',317,'CTRL 3')]))
    parts+=display(active)+effects()+control_buttons()+pads(active)+performance_buttons()
    return group('instrument',parts,f'transform="translate({x} {y}) scale({scale})"')

def parts_sheet():
    body=box(0,0,1200,1500)+caption(600,56,'E / PANEL PARTS — SP-404MKII',30)
    body+=caption(600,91,'Reusable vector parts / referenced to Roland panel descriptions, pp. 6–11',16)
    body+=device(73,161,1.5,1)
    items=[('DISPLAY / bezel + screen',display(1),'translate(840 238) scale(1.3) translate(-200 -167)'),('KNOB / body + indicator',knob('part-ctrl-1',161,68,20,'CTRL 1',45),'translate(840 474) scale(2) translate(-161 -68)'),('PAD / body + number',pad(1,0,0,True),'translate(795 656) scale(2)'),('PERFORMANCE / separate buttons',performance_buttons(),'translate(794 843) scale(1) translate(-293 -347)')]
    for label,part,transform in items:
        body+=group('part-study-'+label.split('/')[0].strip().lower(),part,f'transform="{transform}"')
    for yy,label in [(361,items[0][0]),(557,items[1][0]),(779,items[2][0]),(1080,items[3][0])]: body+=caption(882,yy,label,14)
    body+=caption(600,1175,'ASSEMBLY',16)
    for i,s in enumerate(['enclosure  /  top-knobs  /  display  /  effect-buttons','control-section  /  pad-grid  /  performance-buttons','Animate named indicators, screen content and pad states independently.','Layout matches the hardware; curves, labels and dimensions are simplified.','Display content is illustrative, not a hardware readout.']): body+=caption(600,1220+i*39,s,19)
    return body
