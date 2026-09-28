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
    assert page.locator('#effect-buttons > g').count()==6
    assert page.locator('#fx-filter-drive > path').get_attribute('d')=='M83 121h43L116 149H73Z'
    assert page.locator('#fx-isolator > path').get_attribute('d')=='M274 121h43L327 149H284Z'
    assert page.locator('#fx-delay > path').get_attribute('d')=='M73 191h43L126 219H83Z'
    assert page.locator('#fx-mfx > path').get_attribute('d')=='M284 191h43L317 219H274Z'
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
    page.goto((root/'mobile.html').as_uri())
    for width in [320,390,430,768,1280]:
        page.set_viewport_size({'width':width,'height':900})
        for direction in ['field','journal','walkthrough']:
            page.locator(f'[data-layout="{direction}"]').click()
            for theme in ['light','dark']:
                page.locator('[data-theme-picker]').select_option(theme)
                assert page.locator('html').get_attribute('data-theme')==theme
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,direction,theme)
    page.set_viewport_size({'width':390,'height':844})
    page.locator('#reset').click()
    page.locator('#next').click()
    assert page.locator('#screen-value').text_content()=='PAD 01'
    assert page.locator('.step:visible').count()==1
    page.locator('#pad-picker').select_option('16')
    assert page.locator('#screen-value').text_content()=='PAD 16'
    assert page.locator('#pad-picker').bounding_box()['height']>=44
    page.reload()
    assert page.locator('html').get_attribute('data-theme')=='dark'
    page.locator('[data-theme-picker]').select_option('system')
    page.emulate_media(color_scheme='light')
    assert page.locator('html').get_attribute('data-theme')=='light'
    page.emulate_media(color_scheme='dark')
    page.wait_for_timeout(100)
    assert page.locator('html').get_attribute('data-theme')=='dark'
    assert not errors,errors
    page.goto((root/'desktop.html').as_uri())
    page.set_viewport_size({'width':1440,'height':1000})
    for study in ['a-field-manual','b-lab-journal','c-walkthrough','d-components','e-panel-parts']:
        page.locator(f'[data-study="{study}"]').click()
        for theme in ['light','dark']:
            page.locator('[data-theme-picker]').select_option(theme)
            expected=study+('-dark' if theme=='dark' else '')+'.svg'
            assert page.locator('#study').get_attribute('src')==expected
            page.wait_for_function('document.querySelector("#study").complete && document.querySelector("#study").naturalWidth === 1200')
    assert not errors,errors
    page.goto((root/'home.html').as_uri())
    for width in [320,390,768,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for theme in ['light','dark']:
            page.locator('[data-theme-picker]').select_option(theme)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            nav=page.locator('nav[aria-label="Main navigation"]')
            assert nav.locator('a').all_text_contents()==['Releases','Guides']
            bounds=nav.bounding_box()
            assert abs(bounds['x']+bounds['width']/2-width/2)<2,(width,bounds)
    page.locator('nav a[href="#releases"]').click()
    for section in ['releases','guides']:
        summary=page.locator(f'#{section} summary')
        summary.click()
        assert not page.locator(f'#{section}').evaluate('(el)=>el.open')
        assert not page.locator(f'#{section} .section-body').is_visible()
        summary.focus()
        page.keyboard.press('Enter')
        assert page.locator(f'#{section}').evaluate('(el)=>el.open')
        page.keyboard.press('Space')
        assert not page.locator(f'#{section}').evaluate('(el)=>el.open')
        page.locator(f'nav a[href="#{section}"]').click()
        assert page.locator(f'#{section}').evaluate('(el)=>el.open')
    assert page.locator('.cta,.method,figcaption').count()==0
    page.locator('nav a[href="#releases"]').click()
    assert page.url.endswith('#releases')
    page.locator('nav a[href="#guides"]').click()
    assert page.url.endswith('#guides')
    assert page.locator('.instrument [tabindex]').count()==0
    assert not errors,errors
    browser.close()
print('PASS: SVG IDs, interactions, 30 responsive combinations, 10 desktop theme views, 8 homepage/theme widths with centered navigation, persistence/system theme, no JS errors.')

