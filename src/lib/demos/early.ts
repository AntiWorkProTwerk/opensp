import { action, choose, circle, line, path, range, rect, text } from './types.ts';
import type { Demo, Mark, Values } from './types.ts';

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const progressOf = (value: number) => clamp(Number.isFinite(value) ? value : 0, 0, 1);
const valueOf = (values: Values, key: string, fallback: number, low: number, high: number) =>
  clamp(Number.isFinite(values[key]) ? values[key] : fallback, low, high);
const arrow = (id: string, x: number, y: number): Mark => path(id, `M${x - 7} ${y - 5}L${x} ${y}L${x - 7} ${y + 5}`);

const route: Demo = {
  slug: 'pad-information',
  title: 'Which path reaches the panel?',
  prompt: 'Compare a direct renderer test with the screen that the owner actually used. Change the build, then follow the highlighted route.',
  caption: 'Conceptual route diagram with invented sample data. R1’s route defect and the later wrong-build report were separate findings.',
  fallback: 'R1: the direct renderer test reaches the custom panel, but the current screen reaches only the stock drawing. R2: the current screen draws stock content, then the custom panel. Neither route test identifies the installed build.',
  initial: { build: 0, entry: 1 },
  controls: [choose('build', 'Build', ['R1', 'R2']), choose('entry', 'Start the check at', ['Direct renderer test', 'Current screen'])],
  frame(values, progress) {
    const build = Math.round(valueOf(values, 'build', 0, 0, 1));
    const entry = Math.round(valueOf(values, 'entry', 1, 0, 1));
    const p = progressOf(progress);
    const direct = entry === 0;
    const reaches = direct || build === 1;
    // Keep the entire marker outside the entry box and its fitted label.
    const x = direct ? 172 + 66 * p : p < .5 ? 172 + 66 * p * 2 : build ? 444 : 238;
    const y = direct ? 236 : p < .5 ? 81 : build ? 110 + 90 * (p - .5) * 2 : 81;
    const customOpacity = reaches ? 1 : .4;
    const marks: Mark[] = [
      line('top-route', 164, 81, 80),
      { ...path('overlay-route', 'M444 110V204'), opacity: build && !direct ? 1 : .22 },
      { ...line('direct-route', 164, 236, 80), opacity: direct ? 1 : .22 },
      { ...arrow('top-arrow', 239, 81), opacity: direct ? .22 : 1 },
      { ...path('overlay-arrow', 'M439 195L444 202L449 195'), opacity: build && !direct ? 1 : .22 },
      { ...arrow('direct-arrow', 239, 236), opacity: direct ? 1 : .22 },
      rect('current-box', 24, 52, 140, 58, direct ? 'Paper' : 'Surface', direct ? 'Line' : 'Ink'),
      text('current-label', 'Current screen', 34, 69, 128, 15),
      rect('stock-box', 244, 52, 212, 58, direct ? 'Paper' : 'Surface'),
      text('stock-label', 'Stock drawing', 262, 69, 180, 18),
      rect('direct-box', 24, 208, 140, 58, direct ? 'Surface' : 'Paper', direct ? 'Ink' : 'Line'),
      text('direct-label', 'Direct test', 38, 225, 114, 16),
      { ...rect('panel-box', 244, 204, 212, 76, 'Surface', reaches ? 'Ink' : 'Line'), opacity: customOpacity },
      { ...text('panel-title', 'Dry kick', 260, 214, 178, 20), opacity: customOpacity },
      { ...text('panel-data', 'SRC 120.00 · LEN 1.25s', 260, 248, 178, 13), opacity: customOpacity },
      text('overlay-label', build ? 'Then overlay' : 'No active route', 248, 145, 184, 16),
      text('build-label', build ? 'R2' : 'R1', 24, 11, 90, 24),
      circle('route-pulse', x - 5, y - 5, 10),
      text('result', reaches ? 'Panel reached' : 'Custom panel missed', 24, 288, 432, 18),
    ];
    return { marks, readout: direct
      ? `${build ? 'R2' : 'R1'} direct test: the custom renderer is reached. This does not check the current screen’s route.`
      : build ? 'R2 current screen: stock drawing runs, then the information panel is reached.'
        : 'R1 current screen: stock drawing is reached, but the custom panel is missed.' };
  },
};

const phase: Demo = {
  slug: 'first-animation',
  title: 'The angle belongs to the widget',
  prompt: 'Advance the callback at phase 63. Try another pad or external mode, then return to pad 1. Recreating the widget resets its state.',
  caption: 'An illustrative state model, independent of time. The separate R3 replay uses the preserved renderer frames; this diagram does not recreate them.',
  fallback: 'A callback advances phase 63 to 0 on pad 1 outside external mode. Another pad or external mode holds the phase. Returning resumes it; recreating the widget initializes it to 0.',
  initial: { phase: 63, pad: 0, external: 0, callbacks: 0 },
  controls: [choose('pad', 'Selected pad', ['Pad 1', 'Other pad']), choose('external', 'External mode', ['Off', 'On']), action('tick', 'Advance callback'), action('recreate', 'Recreate widget')],
  act(values, actionId) {
    const current = Math.round(valueOf(values, 'phase', 63, 0, 63));
    if (actionId === 'recreate') return { ...values, phase: 0, callbacks: 0 };
    if (actionId === 'tick') return { ...values, phase: !values.pad && !values.external ? (current + 1) % 64 : current, callbacks: (values.callbacks || 0) + 1 };
    return { ...values };
  },
  frame(values, progress) {
    const current = Math.round(valueOf(values, 'phase', 63, 0, 63));
    const held = Boolean(values.pad || values.external);
    const p = progressOf(progress);
    const marks: Mark[] = [
      rect('memory', 24, 22, 208, 116, 'Surface', 'Ink'),
      text('memory-label', 'Widget-owned phase', 40, 32, 186, 17),
      text('phase-value', String(current).padStart(2, '0'), 40, 66, 100, 44),
      text('phase-limit', '/ 63', 138, 84, 72, 22),
      text('callback-label', 'Periodic callback', 260, 28, 190, 18),
      text('gate-label', held ? 'Hold this phase' : 'Advance by one', 260, 67, 192, 18),
      text('gate-reason', values.external ? 'External mode' : values.pad ? 'Other pad' : 'Pad 1 selected', 260, 101, 192, 16),
      { ...line('tick-route', 424, 151, -296), stroke: held ? 'Line' : 'Ink' },
      path('tick-arrow', 'M135 146L128 151L135 156'),
      { ...circle('tick-pulse', 419 - 286 * p, 146, 10), opacity: held ? 0 : 1 },
      text('strip-label', '64 positions; 63 wraps to 0', 24, 165, 432, 18),
      ...Array.from({ length: 64 }, (_, index): Mark => rect(`phase-${index}`, 48 + index % 16 * 24, 204 + Math.floor(index / 16) * 22, 20, 17, index === current ? 'Ink' : 'Paper', index === current ? 'Ink' : 'Line')),
      text('start', '0', 24, 201, 20, 14),
      text('end', '63', 436, 267, 24, 14),
      text('callbacks', `Callbacks tried: ${Math.round(valueOf(values, 'callbacks', 0, 0, 999999))}`, 24, 294, 432, 15),
    ];
    return { marks, readout: held ? `Phase ${current} is held because ${values.external ? 'external mode is on' : 'another pad is selected'}. The state remains owned by this widget.` : `Phase ${current}. The next callback advances to ${(current + 1) % 64}; recreating the widget resets it to 0. Callback count does not measure device frame rate.` };
  },
};

const capture: Demo = {
  slug: 'verified-capture',
  title: 'A valid checksum cannot identify the author',
  prompt: 'Inspect four invented notes. A replacement can pass every integrity check while its producing build remains unknown.',
  caption: 'Invented in-memory specimens, not the R5 capture format or captured firmware. No files are read or uploaded.',
  fallback: 'Original: valid. Truncated: length mismatch. Changed byte: CRC mismatch. Repacked replacement: valid. The producing build is unknown for all four specimens.',
  initial: { specimen: 3 },
  controls: [choose('specimen', 'Note specimen', ['Original', 'Truncated', 'Changed byte', 'Repacked replacement'])],
  frame(values, progress) {
    const specimen = Math.round(valueOf(values, 'specimen', 3, 0, 3));
    const p = progressOf(progress);
    const payload = specimen === 3 ? Array.from('a different invented note', c => c.charCodeAt(0)) : Array.from({ length: 32 }, (_, i) => specimen === 2 && i === 4 ? i ^ 1 : i);
    const lengthPass = specimen !== 1;
    const crcPass = specimen !== 2;
    const result = !lengthPass ? 'Length mismatch' : !crcPass ? 'CRC mismatch' : 'Valid note';
    const marks: Mark[] = [
      text('format', 'NOTE', 24, 12, 100, 22),
      text('specimen-title', ['Original', 'Truncated', 'Changed byte', 'Repacked replacement'][specimen], 146, 15, 310, 18),
      rect('header', 24, 58, 72, 102), rect('payload', 96, 58, 288, 102), rect('crc', 384, 58, 72, 102),
      text('header-label', 'Header', 30, 67, 62, 14), text('size', String(payload.length), 42, 98, 48, 26),
      text('size-unit', 'bytes', 39, 135, 52, 12), text('crc-label', 'CRC', 400, 67, 52, 16),
      text('crc-state', specimen === 1 ? 'Short' : specimen === 2 ? 'Old' : 'Agrees', 391, 111, 64, 13),
      ...Array.from({ length: 32 }, (_, index): Mark => ({ ...rect(`byte-box-${index}`, 108 + index % 8 * 33, 68 + Math.floor(index / 8) * 21, 29, 17, specimen === 2 && index === 4 ? 'Ink' : 'Paper'), opacity: index < payload.length ? 1 : .18 })),
      ...Array.from({ length: 32 }, (_, index): Mark => ({ ...text(`byte-${index}`, (payload[index] ?? 0).toString(16).padStart(2, '0').toUpperCase(), 112 + index % 8 * 33, 69 + Math.floor(index / 8) * 21, 23, 10), fill: specimen === 2 && index === 4 ? 'Paper' : 'Ink', opacity: index < payload.length ? 1 : 0 })),
      text('length-label', 'Length', 24, 182, 150, 18), text('length-state', lengthPass ? 'Matches' : 'Mismatch', 208, 182, 244, 18),
      text('crc-check-label', 'Checksum', 24, 218, 150, 18), text('crc-check-state', !lengthPass ? 'Not reached' : crcPass ? 'Matches payload' : 'Mismatch', 208, 218, 244, 18),
      line('origin-rule', 24, 252, 432), text('origin-label', 'Producing build', 24, 269, 188, 18), text('origin-state', 'Unknown', 256, 265, 196, 26),
      { ...rect('check-cursor', 190, p < .45 ? 182 : p < .8 ? 218 : 273, 4, 22, 'Ink', 'Ink'), opacity: 1 },
    ];
    return { marks, readout: `${['Original', 'Truncated', 'Changed byte', 'Repacked replacement'][specimen]}: ${result.toLowerCase()}. Producing build: unknown.${specimen === 3 ? ' Its checksum agrees with its replacement payload, so integrity passes without proving origin.' : ''}` };
  },
};

const boot: Demo = {
  slug: 'original-boot',
  title: 'What changed when SHIFT moved?',
  prompt: 'Compare the initial observation with SHIFT press and release. The changing counters describe different parts of the same received packet.',
  caption: 'Schematic comparison of the R7 photographs. Counts above the rule are deltas from the initial observation; movement and timing are illustrative.',
  fallback: 'Each SHIFT edge added one packet, four received bytes and four interrupt-handler entries. Across initial, press and release observations, transmit failures stayed at zero and the framing-error count stayed at one.',
  initial: { observation: 2 },
  controls: [choose('observation', 'Observation', ['Initial', 'SHIFT pressed', 'SHIFT released'])],
  frame(values, progress) {
    const target = Math.round(valueOf(values, 'observation', 2, 0, 2));
    const edges = Math.min(target, Math.floor(progressOf(progress) * (target + 1)));
    const amounts = [edges, edges * 4, edges * 4];
    const marks: Mark[] = [
      text('delta-heading', 'Change from initial observation', 24, 12, 432, 20),
      ...['Packets', 'Received bytes', 'Interrupt entries'].map((label, row): Mark => text(`counter-label-${row}`, label, 24, 66 + row * 48, 186, 17)),
      ...amounts.map((amount, row): Mark => text(`counter-value-${row}`, `+${amount}`, 207, 59 + row * 48, 52, 28)),
      ...Array.from({ length: 24 }, (_, index): Mark => {
        const row = Math.floor(index / 8);
        return rect(`counter-cell-${index}`, 270 + index % 8 * 23, 71 + row * 48, 18, 18, index % 8 < amounts[row] ? 'Ink' : 'Paper');
      }),
      line('error-rule', 24, 213, 432),
      text('tx-label', 'Transmit failures', 24, 229, 272, 18), text('tx-count', '0', 337, 224, 48, 26),
      text('error-label', 'Framing errors', 24, 269, 272, 18), text('error-count', '1', 337, 264, 48, 26),
      text('tx-unchanged', 'held', 391, 235, 66, 13), text('error-unchanged', 'held', 391, 275, 66, 13),
    ];
    return { marks, readout: `${['Initial observation', 'After SHIFT press', 'After SHIFT release'][edges]}: ${edges} added ${edges === 1 ? 'packet' : 'packets'}, ${edges * 4} added received bytes and ${edges * 4} added interrupt entries. Transmit failures remain 0; framing errors remain 1. This does not establish pad input or measured timing.` };
  },
};

const aliases: Demo = {
  slug: 'mapping-controls',
  title: 'Eight readings should not become eight presses',
  prompt: 'Play the two invented presses. Compare counting every matching slot with consuming only the accepted canonical slot.',
  caption: 'Invented aligned traces illustrate the documented DEL alias rule. They do not show the SP’s board wiring or scan timing.',
  fallback: 'Two presses appear on each of eight alias tracks. Counting every track produces sixteen press events; consuming canonical slot 4 produces two.',
  initial: { mode: 0 },
  controls: [choose('mode', 'Event rule', ['Count every alias', 'Use canonical slot 4'])],
  frame(values, progress) {
    const canonical = Math.round(valueOf(values, 'mode', 0, 0, 1)) === 1;
    const p = progressOf(progress);
    const presses = p >= .65 ? 2 : p >= .25 ? 1 : 0;
    const count = presses * (canonical ? 1 : 8);
    const x = 95 + 218 * p;
    const raised = p >= .25 && p < .4 || p >= .65 && p < .8;
    const marks: Mark[] = [
      text('tracks-label', 'Slot', 24, 8, 64, 16), text('presses-label', 'Two presses', 104, 8, 200, 18),
      ...Array.from({ length: 8 }, (_, row): Mark => text(`slot-${row}`, String(4 + row * 5), 30, 42 + row * 28, 40, 16)),
      ...Array.from({ length: 8 }, (_, row): Mark => {
        const y = 63 + row * 28;
        return { ...path(`track-${row}`, `M95 ${y}H149.5V${y - 14}H182.2V${y}H236.7V${y - 14}H269.4V${y}H313`), stroke: canonical && row > 0 ? 'Line' : 'Ink', opacity: canonical && row > 0 ? .45 : 1 };
      }),
      ...Array.from({ length: 8 }, (_, row): Mark => ({ ...path(`join-${row}`, `M313 ${63 + row * 28}L350 159H373`), opacity: canonical && row > 0 ? .15 : .7 })),
      ...Array.from({ length: 8 }, (_, row): Mark => ({ ...circle(`reading-${row}`, x - 3, 60 + row * 28 - (raised ? 14 : 0), 6), opacity: canonical && row > 0 ? .35 : 1 })),
      rect('event-box', 373, 110, 83, 104, 'Surface', 'Ink'),
      text('event-count', String(count), 389, 117, 66, 40),
      text('event-label', 'events', 386, 177, 66, 15),
      text('result', canonical ? 'Slot 4 contributes; seven aliases ignored' : 'Every alias contributes a duplicate', 24, 286, 432, 16),
    ];
    return { marks, readout: `${presses} ${presses === 1 ? 'invented press' : 'invented presses'} produced ${count} ${count === 1 ? 'event' : 'events'}. ${canonical ? 'Only slot 4 contributes; the seven observed aliases remain visible.' : 'All eight tracks contribute, multiplying each intended press by eight.'}` };
  },
};

const rawSamples = [4000, 3993, 3984, 3978, 3968, 3963, 3940];
const inputs: Demo = {
  slug: 'named-inputs',
  title: 'A new event can still look unchanged',
  prompt: 'Scrub the first 60 counts of this invented return sweep. Watch the raw reading, event anchor and visible outputs separately.',
  caption: 'Invented readings reproduce the existing exercise’s software layers. No shaft angle, physical timing or calibrated control response is represented.',
  fallback: 'With a 16-count gate, the sweep emits 3984 with 0% and 0 pixels, 3968 with 0% and 1 pixel, then 3940 with 1% and 1 pixel. A 64-count gate emits nothing during this 60-count return.',
  initial: { sample: 6, gate: 0 },
  controls: [range('sample', 'Return sample', 0, 6), choose('gate', 'Event gate', ['16 counts', '64 counts'])],
  frame(values, progress) {
    const selected = Math.round(valueOf(values, 'sample', 6, 0, 6));
    const sample = Math.min(selected, Math.floor(progressOf(progress) * (selected + 1)));
    const gate = Math.round(valueOf(values, 'gate', 0, 0, 1)) ? 64 : 16;
    let anchor = 4000;
    let events = 0;
    for (const raw of rawSamples.slice(0, sample + 1)) if (Math.abs(raw - anchor) >= gate) { anchor = raw; events++; }
    const raw = rawSamples[sample];
    const returned = 4000 - raw;
    const published = 4000 - anchor;
    const percent = Math.floor(published * 100 / 4000);
    const pixels = Math.floor(published * 128 / 4000);
    const marks: Mark[] = [
      text('zoom-label', 'Return from 4,000 · first 64 counts', 24, 8, 432, 18),
      text('raw-label', 'Raw reading', 24, 47, 220, 18), text('raw-value', String(raw), 344, 39, 112, 28),
      rect('raw-track', 24, 81, 432, 18, 'Paper'),
      { ...rect('raw-level', 24, 81, Math.max(.1, returned / 64 * 432), 18, 'Ink', 'Ink'), opacity: returned ? 1 : 0 },
      text('event-label', 'Event anchor', 24, 129, 220, 18), text('event-value', String(anchor), 344, 121, 112, 28),
      rect('event-track', 24, 163, 432, 18, 'Paper'),
      { ...rect('event-level', 24, 163, Math.max(.1, published / 64 * 432), 18, 'Ink', 'Ink'), opacity: published ? 1 : 0 },
      ...Array.from({ length: 5 }, (_, i): Mark => line(`raw-tick-${i}`, 24 + i * 108, 99, 0, 6)),
      ...Array.from({ length: 5 }, (_, i): Mark => line(`event-tick-${i}`, 24 + i * 108, 181, 0, 6)),
      text('count-start', '0', 24, 105, 40, 12), text('count-end', '64 counts', 377, 105, 78, 12),
      text('display-label', 'Visible output', 24, 217, 208, 18), text('display-percent', `${percent}%`, 344, 209, 112, 28),
      rect('pixel-track', 24, 252, 384, 22, 'Paper'),
      { ...rect('pixel-level', 24, 252, Math.max(.1, pixels * 3), 22, 'Ink', 'Ink'), opacity: pixels ? 1 : 0 },
      text('pixel-count', `${pixels} / 128 pixels`, 24, 283, 240, 16),
      text('event-count', `${events} ${events === 1 ? 'event' : 'events'}`, 310, 283, 145, 16),
    ];
    return { marks, readout: `Sample ${sample + 1} of 7: raw ${raw}, event anchor ${anchor}, ${percent}% and ${pixels} ${pixels === 1 ? 'pixel' : 'pixels'}. ${events} ${events === 1 ? 'event has' : 'events have'} passed the ${gate}-count gate.${events && percent === 0 && pixels === 0 ? ' An event occurred without changing either visible output.' : ''}` };
  },
};

export const earlyDemos: Demo[] = [route, phase, capture, boot, aliases, inputs];
