"""Mobile design compositions at a 390px viewport; shared modular instrument."""
from panel import device
import xml.etree.ElementTree as ET

def dark_svg(source):
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    root=ET.fromstring(source)
    def recolor(node,screen=False):
        screen=screen or node.get('data-part')=='screen-content'
        if not screen:
            for key in ('fill','stroke'):
                value=node.get(key)
                if value in ('white','#fff','#ffffff'):node.set(key,'#151617')
                elif value in ('#111','#171717'):node.set(key,'#eeefec')
                elif value in ('#f2f2f2','#f4f4f2'):node.set(key,'#292c2e')
        for child in node:recolor(child,screen)
    recolor(root)
    return ET.tostring(root,encoding='unicode')

def compositions(text,rect,line,lines,label):
    def base(tag):
        return rect(0,0,390,1320)+text(22,39,'opensp',24,weight='bold')+text(284,36,'MENU  +',12,'Courier New')+line(22,61,368,61)+label(22,95,tag)
    a=base('A / MOBILE FIELD MANUAL')+lines(22,158,['From a pad','press to an event.'],36,leading=42)
    a+=lines(22,242,['Sixteen pads. One readable story.','Follow the input, step by step.'],18,leading=29)
    a+=line(22,308,368,308)+label(22,336,'IN THIS ARTICLE                 +')+line(22,355,368,355)
    a+=label(22,396,'01 / THE SURFACE')+device(57,420,.69,1)
    a+=lines(22,853,['FIG. 01 / The active pad and display','are two views of the same state.'],14,leading=23)
    a+=line(22,923,368,923)+text(22,969,'Make the state visible.',27)
    a+=lines(22,1011,['Keep the explanation beside the change.','On a narrow screen, margin notes','become short captions below the figure.'],17,leading=28)
    a+=rect(22,1121,346,96,'#f2f2f2','none')+lines(38,1156,['onPad(1);','render(state);'],16,'Courier New',28)+label(22,1278,'NEXT / THE SIGNAL              →')
    b=base('B / MOBILE LAB JOURNAL')+lines(22,164,['Learning to listen','to the machine.'],35,'Georgia',44)
    b+=lines(22,257,['Small questions, careful experiments,','and the moments when an','instrument answers back.'],20,'Georgia',31)
    b+=line(22,362,368,362)+label(22,390,'FIELD NOTES / NO. 001 / 6 MIN')+device(69,426,.63,6,-10)
    b+=text(22,838,'Start with what',29,'Georgia')+text(22,877,'you can observe.',29,'Georgia')
    b+=lines(22,930,['A control moves. A value changes.','Before we tell a bigger story, we','need a clear way to describe that','small exchange.'],20,'Georgia',33)
    b+=line(22,1082,368,1082)+label(22,1117,'MARGIN NOTE / 01')+lines(22,1154,['Observation and interpretation','should look different on the page.'],18,leading=28)+label(22,1278,'NEXT ENTRY                     →')
    c=base('C / MOBILE GUIDED WALKTHROUGH')+lines(22,155,['Read it. Try it.','See it.'],38,leading=44)
    c+=label(22,248,'STEP 02 / 04     • ILLUSTRATIVE')+device(104,272,.46,1)
    c+=rect(22,561,346,48)+label(43,591,'PAUSE                    REPLAY')
    c+=rect(22,645,346,151,'#111')+text(40,679,'02 / PRESS A PAD',13,'Courier New','white')+text(40,722,'Watch the surface',25,'Arial','white')+text(40,758,'and screen agree.',25,'Arial','white')
    c+=lines(22,842,['The pad fills in when selected.','The display names the input.'],18,leading=29)
    c+=rect(22,929,164,48)+label(38,959,'← PREVIOUS')+rect(202,929,166,48)+label(236,959,'NEXT →')
    c+=label(22,1022,'SELECT A PAD')+rect(22,1041,346,48)+text(38,1072,'Pad 01                            ˅',16)
    c+=label(22,1132,'CTRL 1 / 096')+line(28,1175,364,1175,sw=2)+rect(274,1164,22,22,'#111')
    c+=lines(22,1252,['Full-size controls supplement the diagram.','One explanation at a time; no sticky overlay.'],13,leading=23)
    return [('mobile-a-manual',a),('mobile-b-journal',b),('mobile-c-guide',c)]
