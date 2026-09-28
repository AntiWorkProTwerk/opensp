"""Individual editable vector sources for native Penpot components.

Import each, name it as below, and Create component (Ctrl+K) in Penpot.
Generating SVGs alone does not create Penpot assets or linked instances.
"""
from pathlib import Path
from panel import display, knob, pad, button, enclosure, pads, effects, control_buttons, performance_buttons, device

ROOT=Path(__file__).parent/'components'
ROOT.mkdir(exist_ok=True)
PARTS=[
 ('Display',display(),(134,101,132,132)),
 ('Knob',knob('knob',30,40,20,'CTRL 1'),(8,10,44,52)),
 ('Pad - idle',pad(1,0,0),(0,0,46,39)),
 ('Pad - active',pad(1,0,0,True),(0,0,46,39)),
 ('Button',button('button',0,0,46,39,['HOLD'],7),(0,0,46,39)),
 ('Enclosure',enclosure(),(17,-1,366,572)),
 ('Pad grid',pads(),(60,346,222,191)),
 ('Effect buttons',effects(),(72,120,256,99)),
 ('Control section',control_buttons(),(60,229,287,105)),
 ('Performance buttons',performance_buttons(),(292,346,48,191)),
 ('Instrument',device(active=0),(0,0,400,570)),
]
for name,body,(x,y,w,h) in PARTS:
    body=body.replace(' role="button"','').replace(' tabindex="0"','')
    source=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><g transform="translate({-x} {-y})">{body}</g></svg>'
    (ROOT/(name.lower().replace(' ','-')+'.svg')).write_text(source,encoding='utf-8')
print(f'Generated {len(PARTS)} component sources.')
