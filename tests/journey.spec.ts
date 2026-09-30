import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync, readdirSync} from 'node:fs';
import first from '../src/content/first-change.json' with {type: 'json'};
import indexCopy from '../src/content/guide-index.json' with {type: 'json'};

type Chapter = {
  slug: string; title: string; description: string; order: number;
  period: string; evidenceLabel: string; summary: string;
  timeline: {kind: string; title: string; duration: number; caption: string; steps: {title: string; body: string; display: string[]}[]};
  sections: {id: string; title: string; short: string; paragraphs: string[]; checkpoint?: string}[];
  exercise: {title: string; intro: string; code: string; expected: string; explanation: string};
  sources: {title: string; path: string; evidence: string}[]; limits: string[];
};
const contentDir = new URL('../src/content/journey/', import.meta.url);
const chapters: Chapter[] = readdirSync(contentDir).filter(name => name.endsWith('.json'))
  .map(name => JSON.parse(readFileSync(new URL(name, contentDir), 'utf8')))
  .sort((a, b) => a.order - b.order);
const routes = [{slug: 'first-change', title: first.title}, ...chapters];
const firstIndexDescription = readFileSync(new URL('../src/content/guides/first-change.mdx', import.meta.url), 'utf8').match(/^description: (.+)$/m)![1].trim();
const sample = chapters.reduce((longest, chapter) => JSON.stringify(chapter).length > JSON.stringify(longest).length ? chapter : longest);
const route = (slug: string) => `/guides/${slug}/`;

test('all four native index layouts retain the full linked guide list', () => {
  const native = JSON.parse(readFileSync(new URL('../design/penpot/journey-index-layouts.json', import.meta.url), 'utf8')) as {
    boards: {mobile: boolean; dark: boolean; linkedComponents: {component: string}[]; text: {name: string; text: string; x: number; width: number; height: number; size: string; ink: {width: number; height: number}}[]}[];
  };
  expect(native.boards).toHaveLength(4);
  expect(new Set(native.boards.map(board => `${board.mobile}/${board.dark}`)).size).toBe(4);
  const normalize = (text: string) => text.replace(/[\u200b\u00ad]/g, '').replace(/\s+/g, ' ').trim();
  for (const board of native.boards) {
    const copy = board.text.map(item => normalize(item.text));
    expect(copy).toContain('Back to OpenSP');
    if(board.mobile){
      expect(board.text.filter(text=>text.name==='Index')).toHaveLength(0);
      for(const title of board.text.filter(text=>text.name==='Title')){
        expect(title.x).toBeCloseTo(24);
        expect(title.width).toBeCloseTo(310);
      }
    }
    for (const text of board.text.filter(text => Number(text.size) >= 11)) {
      expect(text.ink, `Index: ${text.name} needs native text bounds`).toBeTruthy();
      expect(text.ink.width, `Index: ${text.name} overflows horizontally`).toBeLessThanOrEqual(text.width + 2);
      expect(text.ink.height, `Index: ${text.name} overflows vertically`).toBeLessThanOrEqual(text.height + 2);
    }
    for (const value of [indexCopy.title, indexCopy.description, indexCopy.note]) expect(copy).toContain(normalize(value));
    for (const chapter of [{...first,description:firstIndexDescription}, ...chapters]) {
      expect(copy).toContain(normalize(chapter.title));
      expect(copy).toContain(normalize(chapter.description));
    }
    expect(board.linkedComponents.filter(link => link.component === 'Guide row')).toHaveLength(17);
  }
});

test('all 64 native layouts keep shared chapter copy and linked components', () => {
  const native = JSON.parse(readFileSync(new URL('../design/penpot/journey-layouts.json', import.meta.url), 'utf8')) as {
    boards: {id: string; name: string; width: number; height: number; slug: string; mobile: boolean; dark: boolean; source: string;
      linkedComponents: {component: string; componentId: string}[]; text: {name: string; text: string; width: number; height: number; size: string; ink: {width: number; height: number}}[]}[];
  };
  expect(native.boards).toHaveLength(64);
  expect(new Set(native.boards.map(board => board.id)).size).toBe(64);
  for (const chapter of chapters) {
    const variants = native.boards.filter(board => board.slug === chapter.slug);
    expect(variants).toHaveLength(4);
    expect(new Set(variants.map(board => `${board.mobile}/${board.dark}`)).size).toBe(4);
    for (const board of variants) {
      expect(board.width < 900).toBe(board.mobile);
      expect(board.height).toBeGreaterThan(0);
      expect(board.source).toContain(`${chapter.slug}.json`);
      const normalize = (text: string) => text.replace(/[\u200b\u00ad]/g, '').replace(/\s+/g, ' ').trim();
      const copy = board.text.map(item => normalize(item.text));
      expect(copy).not.toContain('Shared article reading text.');
      for (const text of board.text.filter(text => Number(text.size) >= 11)) {
        expect(text.ink, `${board.name}: ${text.name} needs native text bounds`).toBeTruthy();
        expect(text.ink.width, `${board.name}: ${text.name} overflows horizontally`).toBeLessThanOrEqual(text.width + 2);
        expect(text.ink.height, `${board.name}: ${text.name} overflows vertically`).toBeLessThanOrEqual(text.height + 2);
      }
      const finalStep = chapter.timeline.steps.at(-1)!;
      const required = [chapter.title, chapter.description, chapter.summary, chapter.timeline.title,
        finalStep.title, finalStep.body, chapter.exercise.title, chapter.exercise.intro,
        chapter.exercise.expected, chapter.exercise.explanation];
      for (const limit of chapter.limits) expect(copy.some(text => text.includes(normalize(limit)))).toBe(true);
      for (const section of chapter.sections) {
        required.push(section.title, ...section.paragraphs);
        if (section.checkpoint) required.push(section.checkpoint);
        for (const step of (section as typeof section & {steps?: string[]}).steps || []) expect(copy.some(text => text.includes(normalize(step)))).toBe(true);
      }
      for (const text of required) expect(copy).toContain(normalize(text));
      for (const link of board.linkedComponents) expect(link.componentId).toBeTruthy();
      const components = board.linkedComponents.map(link => link.component);
      expect(components).toContain('Instrument');
      expect(components).toContain('Animation timeline');
      expect(components).toContain(chapter.timeline.kind === 'r3' ? 'AntiWorkProTwerk R3' : 'Journey screen');
    }
  }
});

for (const [index, chapter] of chapters.entries()) {
  test(`${chapter.slug}: shared copy, metadata, links and evidence`, async ({page, request}) => {
    await page.setViewportSize({width: 320, height: 844});
    await page.emulateMedia({reducedMotion: 'reduce'});
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(route(chapter.slug));
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(`${chapter.title} / OpenSP`);
    await expect(page.locator('h1')).toHaveText(chapter.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', chapter.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://opensp.fyi${route(chapter.slug)}`);
    await expect(page.locator('.guide-period')).toContainText(chapter.period);
    await expect(page.locator('.journey-guide')).toContainText(chapter.summary);
    await expect(page.locator('.guide-section')).toHaveCount(chapter.sections.length + 2);
    for (const section of chapter.sections) {
      await expect(page.locator(`#${section.id} h2`)).toHaveText(section.title);
      for (const paragraph of section.paragraphs) await expect(page.locator(`#${section.id}`)).toContainText(paragraph);
      if (section.checkpoint) await expect(page.locator(`#${section.id}`)).toContainText(section.checkpoint);
    }
    const links = page.locator('.guide-contents nav a');
    expect(await links.evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute('href'))))
      .toEqual([...chapter.sections.map(section => `#${section.id}`), '#exercise', '#evidence']);
    const badAnchors = await links.evaluateAll(anchors => anchors.filter(anchor => !document.getElementById((anchor as HTMLAnchorElement).hash.slice(1))).map(anchor => anchor.textContent));
    expect(badAnchors).toEqual([]);
    const ids = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    await expect(page.locator('.guide-series-navigation [rel="prev"]')).toHaveAttribute('href', route(routes[index].slug));
    const next = routes[index + 2];
    if (next) await expect(page.locator('.guide-series-navigation [rel="next"]')).toHaveAttribute('href', route(next.slug));
    else await expect(page.locator('.guide-series-navigation [rel="next"]')).toHaveCount(0);
    await expect(page.locator('astro-island,a[href*="penpot"],a[href*="design/studies"]')).toHaveCount(0);
    if (chapter.timeline.kind !== 'r3') {
      const fields = ['Journey title', 'Journey line 1', 'Journey line 2', 'Journey footer'];
      for (const [fieldIndex, field] of fields.entries()) await expect(page.locator(`[data-menu-screen] [data-part="${field}"] text`)).toHaveText(chapter.timeline.steps.at(-1)!.display[fieldIndex]);
    }

    const evidenceResponse = await request.get(`/evidence/${chapter.slug}.json`);
    expect(evidenceResponse.ok()).toBe(true);
    const evidence = await evidenceResponse.json();
    expect(evidence.title).toBe(chapter.title);
    expect(evidence.period).toBe(chapter.period);
    expect(evidence.evidenceLabel).toBe(chapter.evidenceLabel);
    expect(evidence.sources).toEqual(chapter.sources.map(({title, evidence}) => ({title, evidence})));
    expect(evidence.limits).toEqual(chapter.limits);
    expect(evidence.publicationNote).toMatch(/(?:not public|not published|unpublished|private|retained)/i);
    for (const source of chapter.sources) expect(JSON.stringify(evidence)).not.toContain(source.path);
    const example = await request.get(`/examples/${chapter.slug}.py`);
    expect(example.ok()).toBe(true);
    expect((await example.text()).replaceAll('\r\n', '\n').trimEnd()).toBe(chapter.exercise.code.replaceAll('\r\n', '\n').trimEnd());
    await expect(page.locator(`a[href="/examples/${chapter.slug}.py"]`)).toHaveCount(1);
    await page.locator('.journey-code summary').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${chapter.slug}: 320px overflow`).toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) {
  test(`guide series ${width}px ${theme}`, async ({page}) => {
    await page.setViewportSize({width, height: 1000});
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto(route(sample.slug));
    await page.getByLabel('Color theme', {exact: true}).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const overflow = await page.evaluate(() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll('main *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(element => ({tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right}))}));
    expect(overflow.scrollWidth, `${sample.slug}: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(overflow.width);
    await expect(page.locator('journey-motion')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('journey-motion [data-seek]')).toHaveValue('1000');
    await page.locator('.journey-code summary').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.journey-code')).toContainText(sample.exercise.code);
    if (width !== 320) {
      const report = await new AxeBuilder({page}).analyze();
      expect(report.violations).toEqual([]);
      await page.screenshot({path: `test-results/journey-${width}-${theme}.png`, fullPage: true});
      await page.locator('.journey-timeline').screenshot({path: `test-results/journey-timeline-${width}-${theme}.png`});
    }
  });
}

test('series index and first chapter connect every published guide', async ({page, request}) => {
  await page.goto('/guides/');
  await expect(page.locator('h1')).toHaveText('Guides');
  for (const chapter of routes) await expect(page.locator(`main a[href="${route(chapter.slug)}"]`)).toHaveCount(1);
  expect((await request.get('/guides/meet-the-instrument/')).status()).toBe(404);
  await page.goto(route('first-change'));
  await expect(page.locator('.guide-series-navigation [rel="next"]')).toHaveAttribute('href', route(chapters[0].slug));
  await expect(page.locator('.guide-series-navigation [rel="prev"]')).toHaveCount(0);
});

test('all chapter text and exercises work without JavaScript', async ({browser}) => {
  test.setTimeout(90000);
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  const page = await context.newPage();
  for (const chapter of chapters) {
    await page.goto(route(chapter.slug));
    await expect(page.locator('h1')).toHaveText(chapter.title);
    await expect(page.locator('.guide-contents')).toHaveAttribute('open', '');
    await expect(page.locator('[data-timeline]:visible')).toHaveCount(0);
    await page.locator('.journey-step-log summary').click();
    for (const step of chapter.timeline.steps) await expect(page.locator('.journey-step-log')).toContainText(step.body);
    await page.locator('.journey-code summary').click();
    await expect(page.locator('.journey-code')).toContainText(chapter.exercise.code);
    await page.locator('.guide-contents a[href="#exercise"]').click();
    await expect(page.locator('#exercise')).toBeInViewport();
    const overflow = await page.evaluate(() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll('main *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(element => ({tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right}))}));
    expect(overflow.scrollWidth, `${chapter.slug}: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(overflow.width);
  }
  await context.close();
});

test('journey timeline supports keyboard seeking and explicit reduced-motion playback', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(route('usb-updates'));
  const motion = page.locator('journey-motion');
  const seek = motion.locator('[data-seek]');
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).not.toHaveAttribute('data-playing', 'true');
  await expect(seek).toHaveValue('1000');
  await seek.focus();
  await page.keyboard.press('Home');
  await expect(seek).toHaveValue('0');
  await expect(motion).toHaveAttribute('data-phase', '0');
  await page.keyboard.press('ArrowRight');
  await expect(seek).toHaveValue('10');
  await page.keyboard.press('End');
  await expect(seek).toHaveValue('1000');
  await expect(motion.locator('[data-journey-step][data-active]')).toHaveCount(1);
  await seek.fill('980');
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await expect(seek).toHaveValue('1000');
  await expect(motion).toHaveAttribute('data-playing', 'false');
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'paused');
  const button = await motion.locator('[data-toggle]').boundingBox();
  expect(button!.width).toBeGreaterThanOrEqual(44);
  expect(button!.height).toBeGreaterThanOrEqual(44);
});

test('journey autoplay pauses offscreen, when hidden and after a reader pause', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(route('usb-updates'));
  const motion = page.locator('journey-motion');
  const seek = motion.locator('[data-seek]');
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0);
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-playing', 'suspended');
  const away = await seek.inputValue();
  await page.waitForTimeout(200);
  await expect(seek).toHaveValue(away);
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));});
  await expect(motion).toHaveAttribute('data-playing', 'suspended');
  const hidden = await seek.inputValue();
  await page.waitForTimeout(200);
  await expect(seek).toHaveValue(hidden);
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange'));});
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'paused');
  const paused = await seek.inputValue();
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-playing', 'paused');
  await expect(seek).toHaveValue(paused);
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await expect(motion).toHaveAttribute('data-playing', 'paused');
});

test('journey mobile contents settles before deferred scripts', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.route(`**${route('usb-updates')}`, async intercept => {
    const response = await intercept.fetch();
    const html = (await response.text()).replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, '');
    await intercept.fulfill({response, body: html});
  });
  await page.goto(route('usb-updates'));
  await expect(page.locator('.guide-contents')).not.toHaveAttribute('open', '');
  await expect(page.locator('h1')).toBeInViewport();
});

test('original renderer replay scrubs preserved frames and labels its limits', async ({page}) => {
  const chapter = chapters.find(chapter => chapter.slug === 'first-animation')!;
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(route(chapter.slug));
  const motion = page.locator('journey-motion');
  await expect(motion).toHaveAttribute('data-media-ready', 'true');
  await expect(page.locator('.journey-timeline figcaption')).toContainText(chapter.timeline.caption);
  for (const [progress, frame] of [['0', '0'], ['500', '32'], ['1000', '63']]) {
    await motion.locator('[data-seek]').fill(progress);
    await expect(motion).toHaveAttribute('data-frame', frame);
  }
  await expect(motion).toHaveAttribute('data-playing', 'paused');
});

test('renderer replay keeps its original poster when the sprite fails', async ({page}) => {
  await page.route('**/sprite*.png', intercept => intercept.abort());
  await page.goto(route('first-animation'));
  await expect(page.locator('.journey-r3-poster')).toBeVisible();
  await expect(page.locator('journey-motion')).not.toHaveAttribute('data-media-ready', 'true');
  await expect(page.locator('journey-motion [data-toggle]')).toBeDisabled();
  await expect(page.locator('[data-media-error]')).toBeVisible();
  expect(await page.locator('.journey-r3-poster').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test('slow renderer media does not consume the animation before it loads', async ({page}) => {
  let release = () => {};
  const gate = new Promise<void>(resolve => {release = resolve;});
  await page.route('**/sprite*.png', async intercept => {await gate; await intercept.continue();});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(route('first-animation'), {waitUntil: 'domcontentloaded'});
  const motion = page.locator('journey-motion');
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-playing', 'suspended');
  await page.waitForTimeout(3400);
  await expect(motion).toHaveAttribute('data-intent', 'true');
  await expect(motion).not.toHaveAttribute('data-media-ready', 'true');
  await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>('journey-motion')!;
    const observer = new MutationObserver(() => {
      if (element.dataset.playing === 'true' && element.dataset.mediaReady === 'true') {
        (window as Window & {journeyFirstFrame?: number}).journeyFirstFrame = Number(element.dataset.frame);
        observer.disconnect();
      }
    });
    observer.observe(element, {attributes: true, attributeFilter: ['data-playing', 'data-frame', 'data-media-ready']});
  });
  release();
  await expect(motion).toHaveAttribute('data-media-ready', 'true');
  await expect.poll(() => page.evaluate(() => (window as Window & {journeyFirstFrame?: number}).journeyFirstFrame)).toBe(0);
  await expect(motion).toHaveAttribute('data-playing', 'true');
});

test('a reconnected timeline honors a reduced-motion change while detached', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(route('usb-updates'));
  const motion = page.locator('journey-motion');
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>('journey-motion')!;
    const marker = document.createComment('Timeline reconnect test');
    element.replaceWith(marker);
    (window as Window & {detachedJourney?: {element: HTMLElement; marker: Comment}}).detachedJourney = {element, marker};
  });
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.evaluate(() => {
    const state = window as Window & {detachedJourney?: {element: HTMLElement; marker: Comment}};
    state.detachedJourney!.marker.replaceWith(state.detachedJourney!.element);
    delete state.detachedJourney;
  });
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toHaveAttribute('data-intent', 'false');
  await expect(motion.locator('[data-seek]')).toHaveValue('1000');
  await expect(motion).not.toHaveAttribute('data-playing', 'true');
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'true');
  await motion.locator('[data-toggle]').click();
  await expect(motion).toHaveAttribute('data-playing', 'paused');
});

test('an early animation-frame timestamp cannot produce a negative phase', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const request = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => request(timestamp => callback(timestamp - 100));
    const invalid: string[] = [];
    (window as Window & {invalidGuidePhases?: string[]}).invalidGuidePhases = invalid;
    new MutationObserver(records => {
      for (const record of records) {
        const element = record.target as HTMLElement;
        if (element.matches('journey-motion,guide-motion') && Number(element.dataset.phase) < 0) invalid.push(element.tagName);
      }
    }).observe(document, {subtree: true, attributes: true, attributeFilter: ['data-phase']});
  });
  await page.emulateMedia({reducedMotion: 'no-preference'});
  for (const [slug, selector] of [['usb-updates', 'journey-motion'], ['first-change', 'guide-motion[data-mode="memory"]']]) {
    await page.goto(route(slug));
    const motion = page.locator(selector);
    await motion.scrollIntoViewIfNeeded();
    await expect(motion).toHaveAttribute('data-playing', 'true');
    await expect.poll(async () => Number(await motion.locator('[data-seek]').inputValue())).toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as Window & {invalidGuidePhases?: string[]}).invalidGuidePhases)).toEqual([]);
  }
  expect(errors).toEqual([]);
});
