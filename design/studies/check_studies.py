"""Review-page smoke checks; use --browser with an installed Chromium binary."""
from pathlib import Path
import argparse
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

root=Path(__file__).parent
parser=argparse.ArgumentParser()
parser.add_argument('--browser',required=True)
args=parser.parse_args()
for path in root.glob('*.svg'):
    tree=ET.parse(path)
    ids=[n.attrib['id'] for n in tree.iter() if 'id' in n.attrib]
    assert len(ids)==len(set(ids)),path
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=args.browser,headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    page.on('pageerror',lambda err: errors.append(str(err)))
    page.goto((root/'index.html').as_uri())
    assert page.locator('.pad').count()==16
    assert page.locator('#display-bezel').count()==1
    assert page.locator('#performance-buttons > g').count()==4
    page.locator('#pad-7').click()
    assert page.locator('#screen-value').text_content()=='PAD 07'
    page.locator('#pad-2').focus()
    page.keyboard.press('Enter')
    assert page.locator('#screen-value').text_content()=='PAD 02'
    page.locator('#knob').fill('96')
    page.locator('#knob').dispatch_event('input')
    assert page.locator('#screen-value').text_content()=='CTRL 1 096'
    assert '161 68' in page.locator('#ctrl-1-indicator').get_attribute('transform')
    page.locator('#reset').click()
    assert page.locator('#screen-value').text_content()=='READY'
    page.locator('#play').click()
    page.wait_for_timeout(1700)
    assert page.locator('#screen-value').text_content()=='PAD 01'
    page.locator('#play').click()
    assert page.locator('#play').text_content()=='Play sequence'
    page.emulate_media(reduced_motion='reduce')
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#pad-16').click()
    assert page.locator('#screen-value').text_content()=='PAD 16'
    assert not errors,errors
    browser.close()
print('PASS: SVG unique IDs; 16 pads; bezel; 4 right-side controls; pointer/keyboard; knob/screen; reset/play/pause; mobile width; no JS errors.')

