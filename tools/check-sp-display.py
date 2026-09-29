"""Verify screen assets and browser lifecycle without touching an SP."""
import argparse
import functools
import gzip
import hashlib
import http.server
import json
from pathlib import Path
import threading
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'design/assets/screens/antiworkprotwerk-r3'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', required=True)
    parser.add_argument('--screenshots', type=Path)
    args = parser.parse_args()
    sequence = json.loads((ASSETS / 'manifest.json').read_text())
    for name in ['sprite', 'poster']:
        assert hashlib.sha256((ASSETS / sequence[name]).read_bytes()).hexdigest() == sequence[name + 'Sha256']
    sprite = Image.open(ASSETS / 'sprite.png').convert('L')
    assert sprite.size == (1024, 512)
    for frame, expected in enumerate(sequence['frameSha256']):
        x, y = frame % 8 * 128, frame // 8 * 64
        assert hashlib.sha256(sprite.crop((x, y, x + 128, y + 64)).tobytes()).hexdigest() == expected
    assert Image.open(ASSETS / 'poster.png').tobytes() == sprite.crop((0, 0, 128, 64)).tobytes()
    player_bytes = len(gzip.compress((ROOT / 'design/components/sp-display.js').read_bytes()))
    assert player_bytes < 4000

    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/design/studies/home.html'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=args.browser)
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='no-preference')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(url)
            screen = page.locator('sp-display').first
            button = screen.locator('button')
            page.wait_for_function('document.querySelector("sp-display").dataset.state === "playing"')
            page.wait_for_function('Number(document.querySelector("sp-display").dataset.frame) > 0')
            button.click()
            assert screen.get_attribute('data-state') == 'paused'
            phase = screen.get_attribute('data-frame')
            page.wait_for_timeout(160)
            assert phase == screen.get_attribute('data-frame')
            button.focus()
            page.keyboard.press('Enter')
            assert screen.get_attribute('data-state') == 'playing'
            screen.evaluate('(s)=>s.seek(63)')
            page.wait_for_timeout(120)
            assert 0 <= int(screen.get_attribute('data-frame')) < 5
            page.locator('footer').scroll_into_view_if_needed()
            page.wait_for_function('document.querySelector("sp-display").dataset.state === "suspended"')
            phase = screen.get_attribute('data-frame')
            page.wait_for_timeout(140)
            assert phase == screen.get_attribute('data-frame')
            screen.scroll_into_view_if_needed()
            page.wait_for_function('document.querySelector("sp-display").dataset.state === "playing"')
            # Deterministic page-visibility event test; no claim of physical background-tab timing.
            page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"))')
            assert screen.get_attribute('data-state') == 'suspended'
            assert screen.evaluate('(s)=>s.timer===null')
            page.evaluate('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"))')
            assert screen.get_attribute('data-state') == 'playing'
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_function('document.querySelector("sp-display").dataset.state === "paused"')
            button.click()  # Explicit playback remains available with reduced motion.
            assert screen.get_attribute('data-state') == 'playing'
            screen.evaluate('(s)=>{s.pause();s.seek(0)}')
            for width in [320, 390, 768, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.evaluate('scrollTo(0,0)')
                for theme in ['light', 'dark']:
                    page.locator('[data-theme-picker]').select_option(theme)
                    bounds, target = screen.bounding_box(), button.bounding_box()
                    assert abs(bounds['width'] / bounds['height'] - 2) < .01
                    assert target['width'] >= 44 and target['height'] >= 44
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                    assert screen.evaluate('(s)=>getComputedStyle(s).backgroundColor') == 'rgb(0, 0, 0)'
                    assert screen.locator('image').get_attribute('x') == '0'
                    if args.screenshots and width in [390, 1440]:
                        args.screenshots.mkdir(parents=True, exist_ok=True)
                        page.screenshot(path=str(args.screenshots / f'home-r3-{width}-{theme}.png'), full_page=True)
            screen.evaluate('(s)=>{s.removeAttribute("loop");s.play();s.seek(63)}')
            screen.scroll_into_view_if_needed()
            page.wait_for_function('document.querySelector("sp-display").dataset.state === "paused"')
            assert screen.get_attribute('data-frame') == '63'
            screen.evaluate('(s)=>{s.pause();s.seek(17)}')
            assert screen.locator('image').get_attribute('x') == '-128'
            assert screen.locator('image').get_attribute('y') == '-128'
            screen.evaluate('(s)=>{const parent=s.parentElement;s.remove();parent.append(s)}')
            page.wait_for_function('document.querySelector("sp-display").dataset.ready === "true"')
            assert screen.get_attribute('data-state') == 'paused'
            # Another guide can reuse the player with its own timing and state.
            page.evaluate('''() => {
                const first=document.querySelector('sp-display');
                const second=first.cloneNode(true);
                second.id='second-screen';second.removeAttribute('autoplay');
                second.setAttribute('durations',JSON.stringify(Array(64).fill(80)));
                second.style.cssText='position:fixed;top:10px;left:10px;width:128px;z-index:2';
                document.body.append(second);
            }''')
            second = page.locator('#second-screen')
            page.wait_for_function('document.querySelector("#second-screen").loaded === true')
            second.evaluate('(s)=>s.seek(8)')
            assert second.get_attribute('data-frame') == '8'
            assert screen.get_attribute('data-frame') == '0'
            assert second.evaluate('(s)=>s.duration') == 5120
            second.evaluate('(s)=>{window.detachedScreen=s;s.play();s.remove()}')
            assert page.evaluate('window.detachedScreen.timer === null && window.detachedScreen.controller === null')
            assert not errors, errors
            context.close()

            reduced = browser.new_context(reduced_motion='reduce')
            rp = reduced.new_page(); rp.goto(url)
            rp.wait_for_selector('sp-display[data-ready=true]')
            assert rp.locator('sp-display').get_attribute('data-frame') == '0'
            assert rp.locator('sp-display').get_attribute('data-state') == 'paused'
            reduced.close()

            failed = browser.new_context()
            failed.route('**/sprite.png', lambda route: route.abort())
            fp = failed.new_page(); fp.goto(url)
            fp.wait_for_selector('sp-display[data-state=error]')
            assert fp.locator('.screen-poster').is_visible()
            assert not fp.locator('sp-display button').is_visible()
            failed.close()

            nojs = browser.new_context(java_script_enabled=False)
            np = nojs.new_page(); np.goto(url)
            assert np.locator('.screen-poster').is_visible()
            assert not np.locator('sp-display button').is_visible()
            assert np.locator('h1').text_content() == 'OpenSP'
            nojs.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print(f'PASS: 64 exact frame hashes; {player_bytes} byte gzip player; 8 size/theme checks; keyboard/touch control, wrap, seek, non-loop, reduced motion, offscreen/visibility suspension, reconnection, failed asset and no-JS poster.')


if __name__ == '__main__':
    main()
