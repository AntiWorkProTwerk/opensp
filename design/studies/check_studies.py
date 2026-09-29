"""Review-page smoke checks; use --browser with an installed Chromium binary."""
from pathlib import Path
import argparse
import json
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

root=Path(__file__).parent
home_copy=json.loads((root/'home-copy.json').read_text(encoding='utf-8'))
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
    home_widths=[320,390,430,600,601,720,721,768,1000,1001,1440,1920]
    for width in home_widths:
        page.set_viewport_size({'width':width,'height':900})
        for theme in ['light','dark']:
            page.locator('[data-theme-picker]').select_option(theme)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            nav=page.locator('nav[aria-label="Main navigation"]')
            assert nav.locator('a').all_text_contents()==['Releases','Guides']
            assert page.locator('.section-label').all_text_contents()==['RELEASES','GUIDES']
            assert page.locator('.eyebrow').text_content()==home_copy['eyebrow']
            assert page.locator('.intro').all_text_contents()==[home_copy['intro'],home_copy['repository']]
            assert page.locator('.release-body>p').text_content()==home_copy['releaseBody']
            assert page.locator('.section-description').all_text_contents()==[home_copy['releasesHeading'],home_copy['guidesHeading']]
            assert all(page.locator('.section-description').nth(i).is_visible() for i in range(2))
            assert page.locator('.status').text_content()==home_copy['releaseStatus']
            assert page.locator('footer span').all_text_contents()==[home_copy['footerProject'],home_copy['footerPage']]
            assert page.locator('.preview-note').count()==0
            assert page.locator('.section-label').first.evaluate("el=>getComputedStyle(el).fontFamily.startsWith('Cousine') && getComputedStyle(el).fontSize==='13px'")
            bounds=nav.bounding_box()
            assert abs(bounds['x']+bounds['width']/2-width/2)<2,(width,bounds)
            assert nav.locator('a').first.evaluate("el=>getComputedStyle(el).fontFamily.startsWith('Cousine')")
            assert page.locator('h1').evaluate("el=>getComputedStyle(el).fontFamily.startsWith('Arimo')")
            assert nav.locator('a').first.bounding_box()['height']>=44
            instrument=page.locator('.instrument').bounding_box()
            assert abs(instrument['height']/instrument['width']-570/400)<.001
            assert instrument['x']>=0 and instrument['x']+instrument['width']<=width
            copy=page.locator('.hero-copy').bounding_box()
            if width>720:
                assert copy['width']>=280
                assert instrument['x']>=copy['x']+copy['width']
            else:
                assert instrument['y']>=copy['y']+copy['height']
            assert page.locator('#releases').bounding_box()['y']>=instrument['y']+instrument['height']+31
            if width==1440:
                assert abs(instrument['width']-440)<.1
                assert page.locator('#releases').bounding_box()['y']<790
                assert page.locator('#guides').bounding_box()['y']<1140
            if width==390:
                assert abs(instrument['width']-320)<.1
                assert page.locator('#releases').bounding_box()['y']<960
                assert page.locator('#guides').bounding_box()['y']<1400
            title_box=page.locator('.guide .title').first.bounding_box()
            description_box=page.locator('.guide .description').first.bounding_box()
            assert description_box['y']>=title_box['y']+title_box['height']
    assert page.evaluate("document.fonts.check('14px Cousine') && document.fonts.check('20px Arimo')")
    # A 1440px screen at 200% browser zoom has a 720px CSS viewport.
    page.set_viewport_size({'width':720,'height':450})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.guide .title').first.evaluate("el=>el.textContent='A longer guide title that wraps naturally onto several lines'")
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.reload()
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
print(f'PASS: SVG IDs, interactions, 30 responsive combinations, 10 desktop theme views, {len(home_widths)*2} homepage/theme widths, dominant SP sizing and aspect ratio, shared fonts, touch targets, zoom-equivalent and long-title reflow, centered navigation, persistence/system theme, no JS errors.')

