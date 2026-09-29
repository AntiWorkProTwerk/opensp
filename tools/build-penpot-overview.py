"""Render an all-page Penpot overview from exact SVG exports, without changing the file."""
from pathlib import Path
from base64 import b64encode
from html import escape
import argparse
import json
import math
import re
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('source',type=Path)
parser.add_argument('--output',type=Path,default=Path('design/exports/opensp-all-pages.png'))
parser.add_argument('--browser',required=True)
args=parser.parse_args()
repo=Path(__file__).resolve().parents[1]
manifest=json.loads((args.source/'manifest.json').read_text(encoding='utf-8'))
pages={p['name']:p for p in manifest['pages']}
assert len(pages)==6, 'Review the montage layout if pages change'
fonts=''
for family,name,weight in [('Arimo','arimo-latin.woff2','400 700'),('Cousine','cousine-latin.woff2','400')]:
    data=b64encode((repo/'design/studies/fonts'/name).read_bytes()).decode()
    fonts+=f"@font-face{{font-family:{family};font-style:normal;font-weight:{weight};src:url(data:font/woff2;base64,{data}) format('woff2')}}"

def page(name,scale):
    p=pages[name]
    shapes=p['shapes']
    minx=min(s['x'] for s in shapes)
    miny=min(s['y'] for s in shapes)
    width=max(s['x']+s['width'] for s in shapes)-minx
    height=max(s['y']+s['height'] for s in shapes)-miny
    labels=36 if all(s['type']=='board' for s in shapes) else 0
    inner=[]
    for s in shapes:
        raw=(args.source/s['asset']).read_text(encoding='utf-8')
        assert raw.lstrip().startswith('<svg'),s['asset']
        tree=ET.fromstring(raw)
        for element in tree.iter():
            if element.tag.endswith('}image'):
                href=element.attrib.get('href',element.attrib.get('{http://www.w3.org/1999/xlink}href',''))
                assert not href.startswith(('https:','http:')), 'External image needs an embedded export'
        # SVG image documents cannot load external fonts. Embed the approved fonts.
        raw=re.sub(r'@font-face\s*\{[^}]*\}','',raw)
        raw=raw.replace('>',f'><style>{fonts}</style>',1)
        uri='data:image/svg+xml;base64,'+b64encode(raw.encode()).decode()
        x=(s['x']-minx)*scale
        y=(s['y']-miny+labels)*scale
        inner.append(f'<img alt="{escape(s["name"])}" src="{uri}" style="left:{x}px;top:{y}px;width:{s["width"]*scale}px;height:{s["height"]*scale}px">')
        if labels:
            label=s['name'].replace('Homepage / ','').replace('OpenSP / ','').replace('SP / ','')
            inner.append(f'<span class="board-label" style="left:{x}px;top:{y-28*scale}px;font-size:{15*scale}px">{escape(label)}</span>')
    return f'<section class="page"><h2>{escape(name)}</h2><div class="canvas" style="width:{width*scale}px;height:{(height+labels)*scale}px">'+''.join(inner)+'</div></section>'

document=f'''<!doctype html><html><head><meta charset="utf-8"><title>OpenSP / All Penpot pages</title>
<style>{fonts}
*{{box-sizing:border-box}}body{{margin:0;width:6400px;padding:80px;background:#e8e9ea;color:#111;font-family:Arimo,Arial,sans-serif}}
header{{display:flex;justify-content:space-between;align-items:end;margin-bottom:96px;border-bottom:2px solid #a4a7a7;padding-bottom:48px}}
h1{{font-size:96px;font-weight:400;letter-spacing:-2.4px;margin:0}}header p{{font:24px/1.6 Cousine,monospace;margin:0;text-align:right}}
h2{{font-size:44px;line-height:1.2;font-weight:400;letter-spacing:-.6px;margin:0 0 28px}}
.canvas{{position:relative;overflow:visible;margin:0 auto;background:#e8e9ea}}
.canvas img{{position:absolute;display:block}}.board-label{{position:absolute;line-height:1.2;color:#555;font-family:Cousine,monospace;white-space:nowrap}}
.top{{margin-bottom:96px}}.columns{{display:grid;grid-template-columns:3390px 2770px;gap:80px;align-items:start}}
.right{{display:grid;gap:80px}}footer{{font:22px/1.5 Cousine,monospace;border-top:2px solid #a4a7a7;margin-top:72px;padding-top:32px;display:flex;justify-content:space-between}}
</style></head><body><header><h1>OpenSP</h1><p>All Penpot pages<br>September 28, 2026</p></header>
<div class="top">{page('Desktop concepts',1)}</div>
<div class="columns">{page('Responsive comparisons',1)}<div class="right">
{page('Homepage',2770/3870)}{page('Mobile layouts',1.1)}{page('SP components',1.4)}{page('Design system',.9)}
</div></div><footer><span>6 pages / Visible artwork and reusable components</span><span>OpenSP design overview</span></footer></body></html>'''
args.output.parent.mkdir(parents=True,exist_ok=True)
htmlfile=args.output.with_suffix('.html')
htmlfile.write_text(document,encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=args.browser,headless=True)
    tab=browser.new_page(viewport={'width':6400,'height':1000},device_scale_factor=1.25)
    tab.goto(htmlfile.resolve().as_uri())
    tab.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)',timeout=60000)
    tab.evaluate('document.fonts.ready')
    assert tab.locator('.page').count()==6
    assert tab.locator('.canvas img').count()==sum(len(p['shapes']) for p in manifest['pages'])
    assert tab.evaluate('document.documentElement.scrollWidth===6400')
    # Allow the embedded font faces in each SVG document to finish drawing.
    tab.wait_for_timeout(1000)
    size=tab.evaluate('({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})')
    tab.screenshot(path=str(args.output),full_page=True,timeout=120000)
    tab.set_viewport_size({'width':1600,'height':math.ceil(size['height']*.25)})
    tab.evaluate("document.body.style.zoom='0.25'")
    tab.screenshot(path=str(args.output.with_name(args.output.stem+'-preview.png')),full_page=False,timeout=60000)
    browser.close()
manifest['overview']={'png':args.output.name,'width':round(size['width']*1.25),'height':round(size['height']*1.25),'pages':len(pages),'shapes':sum(len(p['shapes']) for p in manifest['pages']),'source':'Native Penpot SVG exports; hidden archives excluded'}
args.output.with_suffix('.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(manifest['overview']))
