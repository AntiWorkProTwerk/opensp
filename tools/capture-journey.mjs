import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';

const output = '.impeccable/review/journey';
const origin = 'http://127.0.0.1:4331';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome SxS/Application/chrome.exe') : undefined);
fs.mkdirSync(output, {recursive: true});
const astroPackage = JSON.parse(fs.readFileSync('node_modules/astro/package.json', 'utf8'));
const astroBin = path.join('node_modules/astro', astroPackage.bin.astro);
const server = spawn(process.execPath, [astroBin, 'preview', '--host', '127.0.0.1', '--port', '4331'], {
  windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', chunk => {serverLog += chunk;});
server.stderr.on('data', chunk => {serverLog += chunk;});
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw Error(`Preview exited: ${serverLog}`);
    try {ready = (await fetch(origin, {signal: AbortSignal.timeout(500)})).ok;} catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw Error('Preview did not start.');
  const build = JSON.parse(fs.readFileSync('dist/build-info.json', 'utf8'));
  const servedBuild = await (await fetch(`${origin}/build-info.json`)).json();
  if (JSON.stringify(servedBuild) !== JSON.stringify(build)) throw Error('Preview serves a different build.');
  browser = await chromium.launch({headless: true, executablePath});
  const captures = [];
  for (const width of [1440, 390]) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
    for (const [slug, label] of [['bootloader-boundaries', 'article'], ['', 'index'], ['first-animation', 'r3']]) {
      await page.goto(`${origin}/guides/${slug ? slug + '/' : ''}`);
      await page.getByLabel('Color theme', {exact: true}).selectOption(theme);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('h1').waitFor();
      if (label === 'r3') {
        await page.locator('journey-motion[data-media-ready="true"]').waitFor();
        await page.locator('.journey-timeline').scrollIntoViewIfNeeded();
      } else await page.evaluate(() => scrollTo(0, 0));
      const filename = `${label}-${width}-${theme}.png`;
      if (label === 'r3') await page.locator('.journey-timeline').screenshot({path: `${output}/${filename}`});
      else await page.screenshot({path: `${output}/${filename}`, fullPage: true});
      captures.push({filename, width, theme, route: `/guides/${slug ? slug + '/' : ''}`});
      console.log(filename);
    }
    await page.close();
  }
  fs.writeFileSync(`${output}/captures.json`, JSON.stringify({build, captures}, null, 2) + '\n');
} finally {
  await browser?.close();
  server.kill();
}
