import {test, expect, type Locator, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {demos} from '../src/lib/demos/index';
import type {Demo, Mark, Values} from '../src/lib/demos/types';

const slugs = [
  'first-change', 'pad-information', 'first-animation', 'verified-capture',
  'original-boot', 'mapping-controls', 'named-inputs', 'usb-updates',
  'keeping-the-updater', 'partial-update', 'ram-loader', 'finding-audio',
  'audio-stream', 'original-sdk', 'bootloader-boundaries', 'pitch-correction', 'synth-design',
];
const route = (slug: string) => `/guides/${slug}/`;
const earlySlugs = new Set(['pad-information', 'first-animation', 'verified-capture', 'original-boot', 'mapping-controls', 'named-inputs']);
const systemsSlugs = new Set(['usb-updates', 'keeping-the-updater', 'partial-update', 'ram-loader', 'bootloader-boundaries', 'original-sdk']);
const groupFor = (slug: string) => earlySlugs.has(slug) ? 'early' : systemsSlugs.has(slug) ? 'systems' : 'audio';
const findDemo = (slug: string): Demo => {
  const demo = demos.find(item => item.slug === slug);
  if (!demo) throw new Error(`Missing demonstration: ${slug}`);
  return demo;
};
const geometry = (marks: Mark[]) => marks.filter(mark => mark.type !== 'text').map(({type, x, y, w, h, d}) => ({type, x, y, w, h, d}));

async function openDemo(page: Page, slug: string) {
  await page.goto(route(slug));
  const element = page.locator(`chapter-demo[data-demo="${slug}"]`);
  await expect(element).toHaveAttribute('data-ready', 'true');
  await element.scrollIntoViewIfNeeded();
  return element;
}

async function expectOutcome(element: Locator, demo: Demo, values: Values, checkPaint = true) {
  const frame = demo.frame(values, 1);
  await expect(element.locator('[data-demo-result]')).toHaveText(frame.readout);
  if (!checkPaint) return;
  const painted = await element.locator('[data-demo-graphic] [data-part]').evaluateAll(groups => Object.fromEntries(groups.map(group => {
    const shape = group.firstElementChild!;
    return [group.getAttribute('data-part'), {
      transform: group.getAttribute('transform'), text: shape.textContent,
      d: shape.getAttribute('d'), width: shape.getAttribute('width'), height: shape.getAttribute('height'),
    }];
  })));
  for (const mark of frame.marks) {
    expect(painted[mark.id], `${demo.slug}/${mark.id}: missing painted native part`).toBeTruthy();
    expect(painted[mark.id].transform, `${demo.slug}/${mark.id}`).toBe(`translate(${mark.x} ${mark.y})`);
    if (mark.type === 'text') expect(painted[mark.id].text, `${demo.slug}/${mark.id}`).toBe(mark.text || '');
    else if (mark.type === 'path') expect(painted[mark.id].d, `${demo.slug}/${mark.id}`).toBe(mark.d);
    else if (mark.type === 'rect') {
      expect(Number(painted[mark.id].width), `${demo.slug}/${mark.id}`).toBeCloseTo(mark.w);
      expect(Number(painted[mark.id].height), `${demo.slug}/${mark.id}`).toBeCloseTo(mark.h);
    }
  }
}

async function expectActions(element: Locator, demo: Demo, values: Values) {
  for (const control of demo.controls.filter(control => control.kind === 'action')) {
    const button = element.locator(`[data-action="${control.id}"]`);
    if (demo.disabled?.(values, control.id)) await expect(button).toBeDisabled();
    else await expect(button).toBeEnabled();
  }
}

test('every published chapter has a distinct, deterministic demonstration', () => {
  expect(demos.map(demo => demo.slug).sort()).toEqual([...slugs].sort());
  const drawings = new Set<string>();
  for (const demo of demos) {
    for (const text of [demo.title, demo.prompt, demo.caption, demo.fallback]) expect(text.trim(), demo.slug).not.toBe('');
    expect(demo.controls.length, demo.slug).toBeGreaterThan(0);
    expect(new Set(demo.controls.map(control => control.id)).size).toBe(demo.controls.length);
    const original = structuredClone(demo.initial);
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const frame = demo.frame(demo.initial, progress);
      expect(frame).toEqual(demo.frame({...demo.initial}, progress));
      expect(frame.readout.trim(), demo.slug).not.toBe('');
      expect(frame.marks.length, demo.slug).toBeGreaterThan(0);
      expect(new Set(frame.marks.map(mark => mark.id)).size, demo.slug).toBe(frame.marks.length);
      const invalid = frame.marks.flatMap(mark => [
        ...([mark.x, mark.y, mark.w, mark.h].every(Number.isFinite) ? [] : [`${mark.id}: nonfinite bounds`]),
        ...(mark.w >= 0 && mark.h >= 0 ? [] : [`${mark.id}: negative size`]),
        ...(mark.type !== 'path' || typeof mark.d === 'string' && !/NaN|Infinity|undefined/.test(mark.d) ? [] : [`${mark.id}: invalid path`]),
      ]);
      expect(invalid, `${demo.slug} at ${progress}: invalid geometry`).toEqual([]);
    }
    expect(demo.initial, `${demo.slug}: frames must not mutate defaults`).toEqual(original);
    drawings.add(JSON.stringify(geometry(demo.frame(demo.initial, 1).marks)));
    for (const control of demo.controls) {
      if (control.kind === 'action') {
        expect(demo.act, `${demo.slug}/${control.id}: missing action handler`).toBeTruthy();
        const before = {...demo.initial};
        const next = demo.act!(before, control.id);
        expect(before, `${demo.slug}/${control.id}: action mutated its input`).toEqual(demo.initial);
        expect(demo.frame(next, 1).readout.trim()).not.toBe('');
      } else {
        expect(Number.isFinite(demo.initial[control.id]), `${demo.slug}/${control.id}: missing initial value`).toBe(true);
        if (control.kind === 'range') {
          expect(demo.initial[control.id], `${demo.slug}/${control.id}: default below minimum`).toBeGreaterThanOrEqual(control.min!);
          expect(demo.initial[control.id], `${demo.slug}/${control.id}: default above maximum`).toBeLessThanOrEqual(control.max!);
        }
        const choices = control.kind === 'choice' ? control.options!.map(option => option.value) : [control.min!, control.max!];
        for (const value of choices) expect(demo.frame({...demo.initial, [control.id]: value}, 1).readout.trim()).not.toBe('');
      }
    }
  }
  expect(drawings.size, 'Chapter diagrams should not reuse the same geometry with different labels').toBe(slugs.length);
});

const markText = (demo: Demo, values: Values, id: string, progress = 1) => {
  const mark = demo.frame(values, progress).marks.find(item => item.id === id);
  expect(mark, `${demo.slug}: missing ${id}`).toBeTruthy();
  return mark!.text;
};

test('record comparison distinguishes length, terminator and surrounding bytes', () => {
  const demo = findDemo('first-change');
  for (const [record, outcomes] of [
    [0, ['Preserved', 'Preserved', 'Preserved']],
    [1, ['Changed', 'Changed', 'Changed']],
    [2, ['Preserved', 'Changed', 'Preserved']],
    [3, ['Preserved', 'Preserved', 'Changed']],
  ] as const) {
    expect([0, 1, 2].map(index => markText(demo, {record}, `check-value-${index}`))).toEqual(outcomes);
  }
});

test('route and capture models preserve the evidence distinctions', () => {
  const route = findDemo('pad-information');
  expect(markText(route, {build: 0, entry: 1}, 'result')).toBe('Custom panel missed');
  expect(markText(route, {build: 0, entry: 0}, 'result')).toBe('Panel reached');
  expect(markText(route, {build: 1, entry: 1}, 'result')).toBe('Panel reached');
  const capture = findDemo('verified-capture');
  for (const specimen of [0, 1, 2, 3]) expect(markText(capture, {specimen}, 'origin-state')).toBe('Unknown');
  expect(markText(capture, {specimen: 1}, 'length-state')).toBe('Mismatch');
  expect(markText(capture, {specimen: 2}, 'crc-check-state')).toBe('Mismatch');
  expect(markText(capture, {specimen: 3}, 'crc-check-state')).toBe('Matches payload');
});

test('widget phase wraps, holds for another pad or external mode, and resets on recreation', () => {
  const demo = findDemo('first-animation');
  expect(demo.act!(demo.initial, 'tick').phase).toBe(0);
  const otherPad = demo.act!({...demo.initial, pad: 1}, 'tick');
  expect(otherPad.phase).toBe(63);
  expect(otherPad.callbacks).toBe(1);
  expect(demo.act!({...demo.initial, external: 1}, 'tick').phase).toBe(63);
  expect(demo.act!({...otherPad, pad: 0}, 'tick').phase).toBe(0);
  expect(demo.act!({...demo.initial, phase: 24, callbacks: 15}, 'recreate')).toMatchObject({phase: 0, callbacks: 0});
});

test('counter deltas and alias filtering do not turn one signal into several controls', () => {
  const boot = findDemo('original-boot');
  expect([0, 1, 2].map(row => markText(boot, {observation: 1}, `counter-value-${row}`))).toEqual(['+1', '+4', '+4']);
  expect([0, 1, 2].map(row => markText(boot, {observation: 2}, `counter-value-${row}`))).toEqual(['+2', '+8', '+8']);
  for (const observation of [0, 1, 2]) {
    expect(markText(boot, {observation}, 'tx-count')).toBe('0');
    expect(markText(boot, {observation}, 'error-count')).toBe('1');
  }
  const mapping = findDemo('mapping-controls');
  expect(markText(mapping, {mode: 0}, 'event-count')).toBe('16');
  expect(markText(mapping, {mode: 1}, 'event-count')).toBe('2');
  expect(markText(mapping, {mode: 0}, 'event-count', .3)).toBe('8');
  expect(markText(mapping, {mode: 1}, 'event-count', .3)).toBe('1');
});

test('raw, published and visible control values stay separate', () => {
  const demo = findDemo('named-inputs');
  const field = (sample: number, gate: number, id: string) => markText(demo, {sample, gate}, id);
  expect(field(2, 0, 'raw-value')).toBe('3984');
  expect(field(2, 0, 'event-value')).toBe('3984');
  expect(field(2, 0, 'event-count')).toBe('1 event');
  expect(field(2, 0, 'display-percent')).toBe('0%');
  expect(field(2, 0, 'pixel-count')).toBe('0 / 128 pixels');
  expect(field(6, 0, 'event-value')).toBe('3940');
  expect(field(6, 0, 'event-count')).toBe('3 events');
  expect(field(6, 0, 'display-percent')).toBe('1%');
  expect(field(6, 1, 'event-value')).toBe('4000');
  expect(field(6, 1, 'event-count')).toBe('0 events');
});

test('update evidence, package ownership and bounded work have distinct outcomes', () => {
  const usb = findDemo('usb-updates');
  for (const checkpoint of [0, 1, 2, 3]) expect(markText(usb, {checkpoint, identity: 0}, 'verdict')).toBe('BOOT STILL UNPROVEN');
  expect(markText(usb, {checkpoint: 4, identity: 0}, 'verdict')).toBe('NEW BOOT CONFIRMED');
  expect(markText(usb, {checkpoint: 4, identity: 1}, 'verdict')).toBe('OLD IDENTITY: STOP');
  const packages = findDemo('keeping-the-updater');
  expect(markText(packages, {target: 0, startup: 1}, 'startup-result')).toBe('Writer absent');
  expect(markText(packages, {target: 1, startup: 1}, 'startup-result')).toBe('Writer available');
  const work = findDemo('partial-update');
  expect(markText(work, {cost: 4}, 'shared-count')).toBe('2/3 complete');
  expect(markText(work, {cost: 4}, 'per-count')).toBe('3/3 complete');
  expect(markText(work, {cost: 11}, 'shared-count')).toBe('0/3 complete');
  expect(markText(work, {cost: 11}, 'per-count')).toBe('0/3 complete');
  expect(markText(work, {cost: 11}, 'first-error')).toBe('FIRST FAILURE RETAINED');
});

test('RAM ownership and a committed journal do not imply fresh recovery', () => {
  const ram = findDemo('ram-loader');
  for (const stage of [0, 3]) expect(markText(ram, {stage, tried: 1}, 'access-result')).toBe('Access accepted');
  for (const stage of [1, 2, 4]) expect(markText(ram, {stage, tried: 1}, 'access-result')).toBe('Access rejected');
  expect(markText(ram, {stage: 4, tried: 0}, 'owner-label')).toBe('LOCKED');
  const journal = findDemo('bootloader-boundaries');
  for (const record of [0, 1, 2, 3]) expect(markText(journal, {record}, 'confirmed-value')).toBe('A');
  expect(markText(journal, {record: 2}, 'new-state')).toBe('Selected; candidate still pending');
  expect(markText(journal, {record: 3}, 'new-state')).toBe('Checksum mismatch: ignored');
});

test('sample comparison and timer arithmetic expose their different failure modes', () => {
  const capture = findDemo('finding-audio');
  expect(markText(capture, {comparison: 0, loss: 0}, 'result')).toBe('4 adjacent changes');
  expect(markText(capture, {comparison: 1, loss: 0}, 'result')).toBe('0 same-position changes');
  expect(markText(capture, {comparison: 1, loss: 1}, 'result')).toBe('Comparison rejected');
  const timer = findDemo('audio-stream');
  expect(markText(timer, {order: 0, scenario: 0}, 'calculation')).toBe('100 - 101 = 255');
  expect(markText(timer, {order: 1, scenario: 0}, 'calculation')).toBe('102 - 99 = 3');
  expect(markText(timer, {order: 1, scenario: 2}, 'calculation')).toBe('140 - 99 = 41');
  expect(markText(timer, {order: 1, scenario: 2}, 'result')).toBe('TIMEOUT / age > 20');
  expect(markText(timer, {order: 1, scenario: 3}, 'calculation')).toBe('3 - 250 = 9');
  expect(markText(timer, {order: 1, scenario: 3}, 'result')).toBe('CONTINUE / age <= 20');
});

test('signed sample packing clips and rejects insufficient capacity before writing', () => {
  const demo = findDemo('original-sdk');
  const bytes = (capacity: number) => Array.from({length: 8}, (_, index) => markText(demo, {samples: 1, capacity, selected: 1}, `byte-value-${index}`));
  expect(bytes(0)).toEqual(['00', '80', 'ff', 'ff', '01', '00', 'ff', '7f']);
  expect(bytes(1)).toEqual(Array(8).fill('a5'));
  expect(markText(demo, {samples: 1, capacity: 0, selected: 1}, 'clipping-result')).toBe('-40000 becomes -32768');
  expect(markText(demo, {samples: 1, capacity: 0, selected: 4}, 'clipping-result')).toBe('40000 becomes 32767');
});

test('pitch selection computes a target while synth confirmation preserves its held take', () => {
  const pitch = findDemo('pitch-correction');
  expect(pitch.frame({frequency: 445, scale: 0}, 1).readout).toContain('MIDI 69.196. Target: A4, 440.00 Hz');
  expect(markText(pitch, {frequency: 445, scale: 0}, 'ratio')).toBe('Ratio 0.988764');
  expect(pitch.frame({frequency: 277, scale: 1}, 1).readout).toContain('Target: C#4, 277.18 Hz');
  expect(pitch.frame({frequency: 277, scale: 0}, 1).readout).toContain('Target: C4, 261.63 Hz');
  const synth = findDemo('synth-design');
  const cancel = synth.act!(synth.act!(synth.initial, 'initialize'), 'cancel');
  expect(cancel).toMatchObject({patch: 0, dirty: 1, take: 1, pending: 0});
  const initialize = synth.act!(synth.act!(synth.initial, 'initialize'), 'confirm');
  expect(initialize).toMatchObject({patch: 2, dirty: 0, take: 1, pending: 0});
  const stored = synth.act!(synth.act!(synth.initial, 'store'), 'confirm');
  expect(stored).toMatchObject({patch: 1, dirty: 0, take: 1, pending: 0});
  expect(synth.act!(stored, 'reset')).toEqual(synth.initial);
});

test('moving route markers keep clear of their result and value labels', () => {
  const collides = (a: Mark, b: Mark) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const collisions: string[] = [];
  const route = findDemo('pad-information');
  const timer = findDemo('audio-stream');
  for (let step = 0; step <= 100; step++) {
    const progress = step / 100;
    for (const build of [0, 1]) for (const entry of [0, 1]) {
      const marks = route.frame({build, entry}, progress).marks;
      const marker = marks.find(mark => mark.id === 'route-pulse')!;
      for (const label of marks.filter(mark => mark.type === 'text')) {
        if (collides(marker, label)) collisions.push(`pad-information ${build}/${entry} at ${progress}: ${label.id}`);
      }
    }
    for (const order of [0, 1]) for (const scenario of [0, 1, 2, 3]) {
      const marks = timer.frame({order, scenario}, progress).marks;
      const marker = marks.find(mark => mark.id === 'execution-cursor')!;
      for (const label of marks.filter(mark => ['first-name', 'first-value', 'second-name', 'second-value', 'interrupt-text'].includes(mark.id))) {
        if (collides(marker, label)) collisions.push(`audio-stream ${order}/${scenario} at ${progress}: ${label.id}`);
      }
    }
  }
  expect(collisions).toEqual([]);
});

test('all demonstrations retain exported native component identities', () => {
  const snapshot = JSON.parse(readFileSync(new URL('../design/penpot/demo-components.json', import.meta.url), 'utf8')) as {
    source: {kind: string; fileId: string};
    components: {id: string; mainId: string; name: string; shape: {width: number; height: number; children?: unknown[]}}[];
  };
  expect(snapshot.source.kind).toBe('native-component-api-export');
  expect(snapshot.source.fileId).toBe('24d9d841-759d-81bc-8008-b518bc70d8b3');
  const identities = new Set<string>();
  for (const slug of slugs) {
    const matches = snapshot.components.filter(component => component.name === `Demo: ${slug}`);
    expect(matches, slug).toHaveLength(1);
    const component = matches[0];
    expect(component.id, slug).toMatch(/^[\da-f-]{36}$/);
    expect(component.mainId, slug).toMatch(/^[\da-f-]{36}$/);
    expect(component.shape.width, slug).toBeGreaterThan(0);
    expect(component.shape.height, slug).toBeGreaterThan(0);
    expect(component.shape.children?.length, slug).toBeGreaterThan(0);
    identities.add(component.id);
  }
  expect(identities.size).toBe(slugs.length);
});

for (const slug of slugs) {
  test(`${slug}: demonstration renders and reader controls change its result`, async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.emulateMedia({reducedMotion: 'reduce'});
    const errors: string[] = [];
    const scriptRequests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (request.resourceType() === 'script') scriptRequests.push(new URL(request.url()).pathname);
    });
    const demo = findDemo(slug);
    const element = await openDemo(page, slug);
    const figure = page.locator('.chapter-demonstration');
    await expect(page.locator('chapter-demo')).toHaveCount(1);
    await expect(figure).toContainText(demo.title);
    await expect(figure).toContainText(demo.prompt);
    await expect(figure).toContainText(demo.caption);
    await expect(figure.locator('.demo-fallback')).toHaveText(demo.fallback);
    await expect(element.locator('svg[data-demo-graphic]')).toHaveCount(1);
    await expect(element.locator(`[data-component="Demo: ${slug}"]`)).toHaveCount(1);
    await expect(element).toHaveAttribute('data-native-component', /^[\da-f-]{36}$/);
    await expect(element.locator('[data-demo-result]')).toHaveAttribute('role', 'status');
    await expect(element.locator('[data-demo-seek]')).toHaveValue('1000');
    await expect(element).toHaveAttribute('data-playing', 'false');
    await expectOutcome(element, demo, demo.initial);
    await expectActions(element, demo, demo.initial);

    let values = {...demo.initial};
    for (const control of demo.controls) {
      if (control.kind === 'action') {
        const action = element.locator(`[data-action="${control.id}"]`);
        await expect(action).toHaveAccessibleName(control.label);
        if (demo.disabled?.(values, control.id)) await expect(action).toBeDisabled();
        else {
          await expect(action).toBeEnabled();
          await action.click();
          values = demo.act!(values, control.id);
        }
      } else {
        const value = control.kind === 'choice'
          ? control.options!.find(option => option.value !== values[control.id])!.value
          : values[control.id] === control.max ? control.min! : control.max!;
        if (control.kind === 'choice') {
          const input = element.locator(`[data-control="${control.id}"][data-value="${value}"]`);
          await expect(input).toHaveAccessibleName(control.options!.find(option => option.value === value)!.label);
          await input.click();
          await expect(input).toHaveAttribute('aria-pressed', 'true');
          await expect(element.locator(`[data-control="${control.id}"][aria-pressed="true"]`)).toHaveCount(1);
        } else {
          const input = element.locator(`[data-control="${control.id}"]`);
          await expect(input).toHaveAccessibleName(new RegExp(`^${control.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s+\\d+)?$`));
          await input.fill(String(value));
        }
        values[control.id] = value;
      }
      await expect(element).toHaveAttribute('data-playing', 'false');
      await expect(element).toHaveAttribute('data-intent', 'false');
      await expectOutcome(element, demo, values);
      await expectActions(element, demo, values);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug}: horizontal overflow`).toBe(true);
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
    expect(new Set(ids).size, `${slug}: duplicate DOM IDs`).toBe(ids.length);
    expect(scriptRequests.filter(path => /\/(early|systems|audio)\.[^/]+\.js$/.test(path)).map(path => path.match(/\/(early|systems|audio)\./)![1]), `${slug}: only its model group should load`).toEqual([groupFor(slug)]);
    expect(scriptRequests.filter(path => /\/ChapterDemo\.[^/]+\.js$/.test(path)), `${slug}: shared demonstration runtime`).toHaveLength(1);
    expect(errors).toEqual([]);
  });
}

test('synth confirmation states support keyboard actions and disable unavailable choices', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.emulateMedia({reducedMotion: 'reduce'});
  const element = await openDemo(page, 'synth-design');
  const demo = findDemo('synth-design');
  const action = (id: string) => element.locator(`[data-action="${id}"]`);
  let values = {...demo.initial};
  await expect(action('confirm')).toBeDisabled();
  await expect(action('cancel')).toBeDisabled();
  await expect(action('edit')).toBeEnabled();

  await action('edit').focus();
  await page.keyboard.press('Tab');
  await expect(action('store')).toBeFocused();
  await page.keyboard.press('Enter');
  values = demo.act!(values, 'store');
  await expect(action('edit')).toBeDisabled();
  await expect(action('confirm')).toBeEnabled();
  await expect(action('cancel')).toBeEnabled();
  await expectOutcome(element, demo, values);
  await page.keyboard.press('Tab');
  await expect(action('initialize')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(action('confirm')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(action('cancel')).toBeFocused();
  await page.keyboard.press('Space');
  values = demo.act!(values, 'cancel');
  await expect(action('edit')).toBeEnabled();
  await expect(action('confirm')).toBeDisabled();
  await expect(action('cancel')).toBeDisabled();
  await expect(element.locator('[data-part="patch-name"] text')).toHaveText('Example patch');
  await expect(element.locator('[data-part="patch-status"] text')).toHaveText('EDITED');
  await expectOutcome(element, demo, values);

  await action('initialize').focus();
  await page.keyboard.press('Enter');
  values = demo.act!(values, 'initialize');
  await expectActions(element, demo, values);
  await action('confirm').focus();
  await page.keyboard.press('Enter');
  values = demo.act!(values, 'confirm');
  await expect(element.locator('[data-part="patch-name"] text')).toHaveText('Init');
  await expect(element.locator('[data-part="patch-status"] text')).toHaveText('CLEAN');
  await expectOutcome(element, demo, values);
  await expectActions(element, demo, values);

  await action('store').focus();
  await page.keyboard.press('Enter');
  values = demo.act!(values, 'store');
  await action('confirm').focus();
  await page.keyboard.press('Space');
  values = demo.act!(values, 'confirm');
  await expect(element.locator('[data-part="patch-name"] text')).toHaveText('My patch');
  await expect(element.locator('[data-part="patch-status"] text')).toHaveText('CLEAN');
  await expectOutcome(element, demo, values);

  await action('reset').focus();
  await page.keyboard.press('Enter');
  await expectOutcome(element, demo, demo.initial);
  await expectActions(element, demo, demo.initial);
  await expect(element.locator('[data-part="take-label"] text')).toHaveText('HELD TAKE / phrase-1');
});

test('all 17 demonstrations retain a readable static result without JavaScript', async ({browser}) => {
  test.setTimeout(90000);
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  const page = await context.newPage();
  for (const slug of slugs) {
    const demo = findDemo(slug);
    await page.goto(route(slug));
    const element = page.locator(`chapter-demo[data-demo="${slug}"]`);
    const figure = page.locator('.chapter-demonstration');
    await expect(figure).toContainText(demo.title);
    await expect(figure).toContainText(demo.caption);
    await expect(figure.locator('.demo-fallback')).toHaveText(demo.fallback);
    await expect(element.locator('svg[data-demo-graphic]')).toBeVisible();
    await expect(element.locator('.demo-controls')).toBeHidden();
    await expect(element.locator('[data-demo-play]')).toBeHidden();
    await expect(element.locator('[data-demo-seek]')).toBeHidden();
    await expectOutcome(element, demo, demo.initial, false);
    const nativeText = await element.locator('[data-demo-graphic] [data-part]').evaluateAll(groups => Object.fromEntries(groups.map(group => [
      group.getAttribute('data-part'), group.querySelector(':scope > text')?.textContent,
    ])));
    for (const mark of demo.frame(demo.initial, 1).marks.filter(mark => mark.type === 'text')) {
      if (mark.text) expect(nativeText[mark.id], `${slug}/${mark.id}: static native text`).toBe(mark.text);
      else expect(['', ' '], `${slug}/${mark.id}: native empty-label placeholder`).toContain(nativeText[mark.id]);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug).toBe(true);
  }
  await context.close();
});

test('demonstration seeking and playback remain keyboard accessible with reduced motion', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.emulateMedia({reducedMotion: 'reduce'});
  const element = await openDemo(page, 'mapping-controls');
  const seek = element.locator('[data-demo-seek]');
  await expect(seek).toHaveValue('1000');
  await seek.focus();
  await page.keyboard.press('Home');
  await expect(seek).toHaveValue('0');
  await expect(element).toHaveAttribute('data-intent', 'false');
  await page.keyboard.press('ArrowRight');
  expect(Number(await seek.inputValue())).toBeGreaterThan(0);
  await page.keyboard.press('End');
  await expect(seek).toHaveValue('1000');
  const play = element.locator('[data-demo-play]');
  await play.focus();
  await page.keyboard.press('Space');
  await expect(element).toHaveAttribute('data-playing', 'true');
  await page.keyboard.press('Space');
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(element).toHaveAttribute('data-intent', 'false');
  const button = await play.boundingBox();
  expect(button!.width).toBeGreaterThanOrEqual(44);
  expect(button!.height).toBeGreaterThanOrEqual(44);
});

test('demonstrations autoplay once, suspend offscreen or hidden, and respect reader pause', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const element = await openDemo(page, 'usb-updates');
  const seek = element.locator('[data-demo-seek]');
  await expect(element).toHaveAttribute('data-playing', 'true');
  await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0);
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(element).toHaveAttribute('data-intent', 'true');
  const offscreen = await seek.inputValue();
  await page.waitForTimeout(200);
  await expect(seek).toHaveValue(offscreen);
  await element.evaluate(node => {
    const box = node.getBoundingClientRect();
    window.scrollTo({top: scrollY + box.top + box.height * .9, behavior: 'instant'});
  });
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(seek).toHaveValue(offscreen);
  await element.evaluate(node => {
    const box = node.getBoundingClientRect();
    window.scrollTo({top: scrollY + box.top + box.height * .7, behavior: 'instant'});
  });
  await expect(element).toHaveAttribute('data-playing', 'true');
  await element.scrollIntoViewIfNeeded();
  await expect(element).toHaveAttribute('data-playing', 'true');
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));});
  await expect(element).toHaveAttribute('data-playing', 'false');
  const hidden = await seek.inputValue();
  await page.waitForTimeout(200);
  await expect(seek).toHaveValue(hidden);
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange'));});
  await expect(element).toHaveAttribute('data-playing', 'true');
  await element.locator('[data-demo-play]').click();
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(element).toHaveAttribute('data-intent', 'false');
  const paused = await seek.inputValue();
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await element.scrollIntoViewIfNeeded();
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(seek).toHaveValue(paused);
  await element.locator('[data-demo-play]').click();
  await expect(element).toHaveAttribute('data-playing', 'true');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(element).toHaveAttribute('data-intent', 'false');
});

test('a completed demonstration stays completed when it enters the viewport again', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.emulateMedia({reducedMotion: 'reduce'});
  const element = await openDemo(page, 'usb-updates');
  const seek = element.locator('[data-demo-seek]');
  await seek.fill('990');
  await element.locator('[data-demo-play]').click();
  await expect(seek).toHaveValue('1000');
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(element).toHaveAttribute('data-intent', 'false');
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await element.scrollIntoViewIfNeeded();
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(seek).toHaveValue('1000');
});

test('a reconnected demonstration honors reduced motion and does not duplicate handlers', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const element = await openDemo(page, 'first-animation');
  await expect(element).toHaveAttribute('data-playing', 'true');
  await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>('chapter-demo')!;
    const marker = document.createComment('Demonstration reconnect test');
    element.replaceWith(marker);
    (window as Window & {detachedDemo?: {element: HTMLElement; marker: Comment}}).detachedDemo = {element, marker};
  });
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.evaluate(() => {
    const state = window as Window & {detachedDemo?: {element: HTMLElement; marker: Comment}};
    state.detachedDemo!.marker.replaceWith(state.detachedDemo!.element);
    delete state.detachedDemo;
  });
  await element.scrollIntoViewIfNeeded();
  await expect(element).toHaveAttribute('data-playing', 'false');
  await expect(element).toHaveAttribute('data-intent', 'false');
  await expect(element.locator('[data-demo-seek]')).toHaveValue('1000');
  await element.locator('[data-action="tick"]').click();
  await expect(element.locator('[data-part="phase-value"] text')).toHaveText('00');
  await expect(element.locator('[data-part="callbacks"] text')).toHaveText('Callbacks tried: 1');
});

test('a failed lazy model keeps the native poster and static explanation', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/_astro/systems.*.js', request => request.abort());
  await page.goto(route('usb-updates'));
  const element = page.locator('chapter-demo[data-demo="usb-updates"]');
  await expect(element).toHaveAttribute('data-load-error', 'true');
  await expect(element).not.toHaveAttribute('data-ready', 'true');
  await expect(element.locator('.demo-controls')).toBeHidden();
  await expect(element.locator('[data-demo-play]')).toBeHidden();
  await expect(element.locator('[data-demo-graphic]')).toBeVisible();
  await expectOutcome(element, findDemo('usb-updates'), findDemo('usb-updates').initial, false);
  await expect(page.locator('.demo-fallback')).toHaveText(findDemo('usb-updates').fallback);
  expect(errors).toEqual([]);
});

test('slow model loading preserves the poster and does not consume playback', async ({page}) => {
  let release = () => {};
  const gate = new Promise<void>(resolve => {release = resolve;});
  await page.route('**/_astro/systems.*.js', async request => {await gate; await request.continue();});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(route('usb-updates'), {waitUntil: 'domcontentloaded'});
  const element = page.locator('chapter-demo[data-demo="usb-updates"]');
  await element.scrollIntoViewIfNeeded();
  await expect(element).not.toHaveAttribute('data-ready', 'true');
  await expect(element.locator('.demo-controls')).toBeHidden();
  await expectOutcome(element, findDemo('usb-updates'), findDemo('usb-updates').initial, false);
  await page.waitForTimeout(700);
  await expect(element.locator('[data-demo-seek]')).toHaveValue('1000');
  release();
  await expect(element).toHaveAttribute('data-ready', 'true');
  await expect(element).toHaveAttribute('data-playing', 'true');
  await expect.poll(async () => Number(await element.locator('[data-demo-seek]').inputValue())).toBeLessThan(150);
  await expect.poll(async () => Number(await element.locator('[data-demo-seek]').inputValue())).toBeGreaterThan(0);
});

for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) {
  test(`demonstration controls and artwork fit ${width}px ${theme}`, async ({page}) => {
    await page.setViewportSize({width, height: 900});
    await page.emulateMedia({reducedMotion: 'reduce'});
    const element = await openDemo(page, 'pitch-correction');
    await page.getByLabel('Color theme', {exact: true}).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await element.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    const report = await new AxeBuilder({page}).include('chapter-demo').analyze();
    expect(report.violations).toEqual([]);
  });
}
