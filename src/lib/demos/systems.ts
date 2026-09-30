import { action, choose, circle, line, path, range, rect, text } from './types.ts';
import type { Demo, Mark, Values } from './types.ts';

const bound = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const integer = (values: Values, key: string, high: number, fallback = 0) =>
  Math.round(bound(values[key] ?? fallback, 0, high));
const visible = (mark: Mark, show: boolean): Mark => ({ ...mark, opacity: show ? 1 : 0 });
const dim = (mark: Mark, active: boolean): Mark => ({ ...mark, opacity: active ? 1 : 0.3 });
const paperText = (id: string, value: string, x: number, y: number, w: number, size = 20): Mark =>
  ({ ...text(id, value, x, y, w, size), fill: 'Paper' });
const cross = (id: string, x: number, y: number, size: number): Mark =>
  path(id, `M${x} ${y}l${size} ${size}m${-size} 0l${size} ${-size}`);

const evidence: Demo = {
  slug: 'usb-updates',
  title: 'What does this result prove?',
  prompt: 'Choose an evidence checkpoint. Watch memory, storage and the running program change separately.',
  caption: 'Illustrative evidence model. Example identities and timing are invented; no USB operation occurs.',
  fallback: 'RAM verification proves receipt. Storage readback proves the checked storage result. A matching fresh identity is still needed to establish a new boot.',
  initial: { checkpoint: 4, identity: 0 },
  controls: [
    choose('checkpoint', 'Evidence checkpoint', ['RAM only', 'Preflight rejected', 'Storage readback', 'Separate status', 'Fresh boot']),
    choose('identity', 'Identity after restart', ['example-new', 'example-old']),
  ],
  frame(values, progress) {
    const checkpoint = integer(values, 'checkpoint', 4, 4);
    const oldIdentity = integer(values, 'identity', 1) === 1;
    const p = bound(progress);
    const ram = bound(p * 3);
    const storage = checkpoint >= 2 ? bound(p * 3 - 1) : 0;
    const restarted = checkpoint === 4 && p >= 0.92;
    const confirmed = restarted && !oldIdentity;
    const status = checkpoint >= 3 && p >= 0.76;
    const marks: Mark[] = [
      text('ram-label', 'RAM', 20, 64, 108, 18),
      text('storage-label', 'STORAGE', 20, 140, 110, 18),
      text('runtime-label', 'RUNNING', 20, 230, 110, 18),
      text('ram-result', ram === 1 ? 'Receipt checked' : 'Receiving example bytes', 140, 96, 310, 16),
      text('storage-result', checkpoint === 1 ? 'Preflight stopped the write' : storage === 1 ? 'Readback checked' : 'No storage result', 140, 172, 315, 16),
      rect('runtime', 140, 225, 308, 45, confirmed ? 'Ink' : 'Surface', 'Ink'),
      { ...text('runtime-identity', confirmed ? 'example-new' : 'example-old', 157, 232, 273, 20), fill: confirmed ? 'Paper' : 'Ink' },
      path('connection', 'M457 82V157M452 151l5 6 5-6'),
      visible(cross('preflight-stop', 447, 112, 20), checkpoint === 1 && ram === 1),
      visible(circle('status-check', 425, 194, 10, 'Ink'), status),
      text('status-label', status ? 'Separate status agrees' : 'Status remains a separate check', 140, 194, 280, 15),
      text('verdict', confirmed ? 'NEW BOOT CONFIRMED' : restarted ? 'OLD IDENTITY: STOP' : 'BOOT STILL UNPROVEN', 20, 282, 435, 18),
    ];
    for (let i = 0; i < 8; i++) {
      marks.push(rect(`ram-byte-${i}`, 140 + i * 39, 62, 35, 28, ram >= (i + 1) / 8 ? 'Ink' : 'Surface'));
      marks.push(rect(`stored-byte-${i}`, 140 + i * 39, 138, 35, 28, storage >= (i + 1) / 8 ? 'Ink' : 'Surface'));
    }
    const readout = confirmed
      ? 'The example target has a matching fresh identity after the storage and status checks.'
      : restarted
        ? 'The old identity is still present. Completed storage checks do not prove that the target booted.'
        : checkpoint === 1
          ? 'Preflight rejected the write. No persistent change is shown.'
          : checkpoint >= 2
            ? 'The storage result can be checked while the old program is still running. Boot evidence is separate.'
            : 'The bytes reached RAM. This establishes neither installation nor execution.';
    return { marks, readout };
  },
};

const packages: Demo = {
  slug: 'keeping-the-updater',
  title: 'The writer lives inside a package',
  prompt: 'Replace the application, then inspect the startup path. The outgoing writer does not transfer itself into the new package.',
  caption: 'Component-ownership diagram of the recorded packages. This is not a boot or installation procedure.',
  fallback: 'R16B contains its USB writer. R3 replaces that application and has no R16B writer. The tested A1 + B1 package includes separate application and writer paths within APP1.',
  initial: { target: 1, startup: 1 },
  controls: [
    choose('target', 'Replacement package', ['R3', 'A1 + B1']),
    choose('startup', 'Inspect a startup path', ['Application', 'Writer']),
  ],
  frame(values, progress) {
    const wrapped = integer(values, 'target', 1, 1) === 1;
    const writerPath = integer(values, 'startup', 1, 1) === 1;
    const p = bound(progress);
    const targetX = 288 - (1 - p) * 40;
    const available = !writerPath || wrapped;
    const marks: Mark[] = [
      text('source-heading', 'OUTGOING', 24, 26, 180, 16),
      text('target-heading', 'AFTER RESTART', 284, 26, 190, 16),
      { ...rect('source-package', 24, 66, 172, 190, 'Paper', 'Ink'), opacity: 0.55 },
      text('source-name', 'R16B', 40, 82, 140, 24),
      dim(rect('source-application', 40, 125, 140, 48, 'Surface'), false),
      dim(text('source-app-label', 'Application', 49, 137, 128, 17), false),
      dim(rect('source-writer', 40, 192, 140, 48, 'Ink', 'Ink'), false),
      dim(paperText('source-writer-label', 'USB writer', 49, 204, 128, 17), false),
      path('replacement-arrow', 'M209 150H263m-9-8 9 8-9 8'),
      rect('target-package', targetX, 66, 168, 190, 'Paper', 'Ink'),
      text('target-name', wrapped ? 'A1 + B1' : 'R3', targetX + 16, 82, 140, 24),
      rect('target-app', targetX + 16, 125, 136, 48, !writerPath ? 'Ink' : 'Surface', 'Ink'),
      { ...text('target-app-label', wrapped ? 'A1 application' : 'R3 sampler', targetX + 23, 139, 125, 14), fill: !writerPath ? 'Paper' : 'Ink' },
      rect('target-writer', targetX + 16, 192, 136, 48, wrapped && writerPath ? 'Ink' : 'Paper', wrapped ? 'Ink' : 'Line'),
      { ...text('target-writer-label', wrapped ? 'B1 writer' : 'No writer', targetX + 23, 204, 125, 17), fill: wrapped && writerPath ? 'Paper' : 'Ink' },
      visible(cross('missing-writer', targetX + 134, 177, 13), writerPath && !wrapped),
      path('selected-route', `M${targetX - 10} 280V${writerPath ? 216 : 149}H${targetX + 8}m-6-5 6 5-6 5`),
      text('ownership-label', 'APP1 COMPONENTS', 24, 274, 218, 16),
      text('startup-result', available ? writerPath ? 'Writer available' : 'Application starts' : 'Writer absent', 273, 283, 198, 18),
    ];
    return { marks, readout: wrapped
      ? writerPath ? 'The tested wrapped application retains B1. Its later fresh writer startup was checked separately from the A1 screen.' : 'A1 normal startup checks the application. It does not, by itself, prove that B1 is still available.'
      : writerPath ? 'R3 replaced the package that supplied R16B’s writer. That outgoing component is absent after restart.' : 'The owner reported R3 working. Its application success did not preserve R16B’s updater.' };
  },
};

const budgets: Demo = {
  slug: 'partial-update',
  title: 'Where the allowance runs out',
  prompt: 'Change the cost of each fictional job. Compare a shared allowance with a fresh, bounded allowance per job.',
  caption: 'Invented work units, not flash timing or device progress. Cleanup has its own bounded allowance.',
  fallback: 'Three jobs costing four units each exhaust a shared allowance of ten after two jobs. Ten units per job admits all three. A job costing eleven is rejected; successful cleanup does not erase that failure.',
  initial: { cost: 4 },
  controls: [range('cost', 'Work units per job', 1, 12)],
  frame(values, progress) {
    const cost = Math.round(bound(values.cost ?? 4, 1, 12));
    const p = bound(progress);
    const sharedCount = Math.min(3, Math.floor(10 / cost));
    const perCount = cost <= 10 ? 3 : 0;
    const elapsedJobs = Math.min(3, Math.floor(p * 3 + 1e-7));
    const sharedDone = Math.min(sharedCount, elapsedJobs);
    const perDone = Math.min(perCount, elapsedJobs);
    const marks: Mark[] = [
      text('cost-equation', `3 jobs × ${cost} units`, 24, 20, 280, 23),
      text('limit', 'LIMIT 10', 337, 23, 120, 17),
      text('shared-label', 'SHARED', 24, 90, 100, 17),
      text('bounded-label', 'PER JOB', 24, 190, 110, 17),
      line('shared-track', 138, 104, 302),
      line('per-track', 138, 204, 302),
      text('shared-count', `${sharedDone}/3 complete`, 141, 143, 205, 16),
      text('per-count', `${perDone}/3 complete`, 141, 243, 205, 16),
      text('first-error', sharedCount < 3 ? 'FIRST FAILURE RETAINED' : 'ALL JOBS WITHIN BOUNDS', 24, 284, 308, 16),
      text('cleanup', sharedCount < 3 && p === 1 ? 'Cleanup: 3/4' : '', 337, 284, 127, 16),
    ];
    for (let i = 0; i < 3; i++) {
      const x = 139 + i * 110;
      const attempted = p * 3 >= i + 0.25;
      const sharedFailed = i === sharedCount && sharedCount < 3 && attempted;
      const perFailed = i === 0 && perCount === 0 && attempted;
      marks.push(rect(`shared-job-${i}`, x, 76, 80, 54, i < sharedDone ? 'Ink' : 'Paper', 'Ink'));
      marks.push({ ...text(`shared-number-${i}`, `${i + 1}`, x + 28, 85, 32, 24), fill: i < sharedDone ? 'Paper' : 'Ink' });
      marks.push(visible(cross(`shared-failure-${i}`, x + 11, 86, 31), sharedFailed));
      marks.push(rect(`per-job-${i}`, x, 176, 80, 54, i < perDone ? 'Ink' : 'Paper', 'Ink'));
      marks.push({ ...text(`per-number-${i}`, `${i + 1}`, x + 28, 185, 32, 24), fill: i < perDone ? 'Paper' : 'Ink' });
      marks.push(visible(cross(`per-failure-${i}`, x + 11, 186, 31), perFailed));
    }
    const spent = Math.min(sharedDone * cost, 10);
    const activeFraction = p === 1 ? 0 : (p * 3) % 1;
    const perRemaining = perCount === 0 ? 0 : p === 1 ? 10 : 10 - Math.min(cost, activeFraction * cost);
    for (let i = 0; i < 10; i++) {
      marks.push(rect(`shared-fuel-${i}`, 341 + i * 11, 147, 8, 9, i < 10 - spent ? 'Ink' : 'Surface'));
      marks.push(rect(`per-fuel-${i}`, 341 + i * 11, 247, 8, 9, i < perRemaining ? 'Ink' : 'Surface'));
    }
    return { marks, readout: cost > 10
      ? 'Each job exceeds its ten-unit limit. Both models reject the job. The separate three-unit cleanup fits its four-unit allowance, while the original failure stays recorded.'
      : `The shared allowance completes ${sharedCount} of three jobs; a separate ten-unit allowance completes all three. Each inner operation still has a finite bound.` };
  },
};

const ownership: Demo = {
  slug: 'ram-loader',
  title: 'One buffer has one owner',
  prompt: 'Inspect a stage of the fictional handoff, then ask whether the normal writer may use the same buffer.',
  caption: 'Ownership model only. It receives no program and performs no execution, reset or device operation.',
  fallback: 'RAM admission closes the normal writer route. Sealing retains RAM ownership. A recorded fresh return restores the writer. Cancellation requires a reset before writer ownership can return.',
  initial: { stage: 2, tried: 0 },
  controls: [
    choose('stage', 'Inspect ownership', ['Writer idle', 'RAM admitted', 'Sealed', 'Fresh return', 'Cancelled']),
    action('try-writer', 'Try writer access'),
  ],
  act(values, actionId) { return actionId === 'try-writer' ? { ...values, tried: 1 } : { ...values }; },
  frame(values, progress) {
    const stage = integer(values, 'stage', 4, 2);
    const p = bound(progress);
    const writerOwns = stage === 0 || stage === 3;
    const cancelled = stage === 4;
    const points = [[78, 73], [390, 73], [390, 246], [78, 246]];
    const end = stage === 4 ? 2 : stage;
    const distance = bound(p * end, 0, 3);
    const segment = Math.min(2, Math.floor(distance));
    const fraction = distance - segment;
    const from = points[segment];
    const to = points[segment + 1];
    const tokenX = from[0] + (to[0] - from[0]) * fraction;
    const tokenY = from[1] + (to[1] - from[1]) * fraction;
    const marks: Mark[] = [
      path('ownership-route', 'M78 73H390V246H78V73'),
      text('writer-label', 'WRITER', 24, 23, 145, 18),
      text('ram-label', 'RAM MODE', 325, 23, 150, 18),
      text('return-label', 'FRESH RETURN', 24, 271, 193, 17),
      text('sealed-label', cancelled ? 'CANCELLED' : 'SEALED', 325, 271, 144, 17),
      circle('writer-node', 65, 60, 26, 'Paper'),
      circle('ram-node', 377, 60, 26, 'Paper'),
      circle('sealed-node', 377, 233, 26, 'Paper'),
      circle('return-node', 65, 233, 26, 'Paper'),
      rect('shared-buffer', 142, 113, 186, 103, 'Surface', 'Ink'),
      text('buffer-label', 'SHARED BUFFER', 160, 129, 161, 17),
      text('owner-label', cancelled ? 'LOCKED' : writerOwns ? 'WRITER OWNS' : 'RAM OWNS', 160, 172, 166, 20),
      circle('owner-token', tokenX - 10, tokenY - 10, 20, 'Ink'),
      visible(cross('cancel-cross', 376, 232, 28), cancelled),
      visible(path('writer-request', 'M85 100L135 130m-9-1 9 1-4-8'), values.tried === 1),
      visible(cross('request-rejected', 100, 100, 20), values.tried === 1 && !writerOwns),
      text('access-result', values.tried === 1 ? writerOwns ? 'Access accepted' : 'Access rejected' : cancelled ? 'Reset required' : 'Exclusive ownership', 141, 225, 202, 16),
    ];
    return { marks, readout: cancelled
      ? 'The cancelled model keeps the writer closed. Clearing a message cannot establish safe buffer ownership; a fresh reset is required.'
      : writerOwns
        ? stage === 3 ? 'This selected state includes the matching returned result and a fresh writer check. A launch acknowledgment alone cannot establish it.' : 'The normal writer owns the staging buffer. RAM admission must transfer that ownership before another service uses it.'
        : 'RAM mode owns the buffer, including after sealing. A simultaneous normal writer request is rejected.' };
  },
};

const journal: Demo = {
  slug: 'bootloader-boundaries',
  title: 'Complete does not mean confirmed',
  prompt: 'Commit or damage a fictional candidate record. Track which record is selected and which image remains confirmed.',
  caption: 'Fictional in-memory journal. This models neither a physical storage failure nor an independent recovery route.',
  fallback: 'An incomplete candidate record is ignored. A complete candidate record can be selected while A remains confirmed. A damaged newest record falls back to the old valid record.',
  initial: { record: 2 },
  controls: [choose('record', 'Candidate record', ['Absent', 'Incomplete', 'Committed', 'Checksum damaged'])],
  frame(values, progress) {
    const state = integer(values, 'record', 3, 2);
    const p = bound(progress);
    const committed = state >= 2 && p >= 0.9;
    const valid = state === 2 && committed;
    const written = state > 0;
    const marks: Mark[] = [
      text('sequence-heading', 'SEQ', 44, 20, 65, 16),
      text('confirmed-heading', 'CONFIRMED', 126, 20, 136, 16),
      text('candidate-heading', 'CANDIDATE', 271, 20, 127, 16),
      text('commit-heading', 'COMMIT', 388, 20, 86, 16),
      rect('old-record', 32, 63, 426, 65, 'Paper', 'Ink'),
      rect('new-record', 32, 160, 426, 65, 'Paper', valid ? 'Ink' : 'Line'),
      text('old-sequence', '1', 47, 76, 55, 28),
      text('old-confirmed', 'A', 163, 76, 70, 28),
      text('old-candidate', '-', 312, 76, 60, 28),
      rect('old-commit', 410, 82, 23, 23, 'Ink', 'Ink'),
      visible(text('new-sequence', '2', 47, 173, 55, 28), written && p >= 0.1),
      visible(text('new-confirmed', 'A', 163, 173, 70, 28), written && p >= 0.35),
      visible(text('new-candidate', 'B', 312, 173, 60, 28), written && p >= 0.6),
      rect('new-commit', 410, 179, 23, 23, committed ? 'Ink' : 'Paper', 'Ink'),
      visible(cross('bad-checksum', 303, 175, 33), state === 3 && p >= 0.9),
      path('record-selection', `M8 ${valid ? 192 : 95}H25m-7-6 7 6-7 6`),
      text('old-state', valid ? 'Earlier valid record' : 'Selected valid record', 32, 132, 320, 15),
      text('new-state', state === 0 ? 'No candidate record' : state === 1 || !committed ? 'Incomplete: ignored' : valid ? 'Selected; candidate still pending' : 'Checksum mismatch: ignored', 32, 229, 421, 15),
      text('confirmed-label', 'CONFIRMED IMAGE', 32, 280, 238, 18),
      text('confirmed-value', 'A', 312, 269, 75, 34),
    ];
    return { marks, readout: valid
      ? 'Record 2 is complete and selected. It still names A as confirmed and B only as a candidate. Metadata commitment does not establish a successful trial.'
      : state === 3
        ? 'The fictional checksum rejects the newest record; the old valid record still names A. This accidental-corruption check is not authentication or a recovery guarantee.'
        : 'The old complete record names A. An absent or incomplete candidate record cannot replace that evidence.' };
  },
};

const sampleSets = [[0, -1, 1, 256], [-40000, -1, 1, 40000], [-32768, 32767, -32769, 32768]];
const packing: Demo = {
  slug: 'original-sdk',
  title: 'Watch the bytes stay inside their contract',
  prompt: 'Choose samples and a destination capacity. Follow one value through clipping and little-endian output.',
  caption: 'Generic signed 16-bit model with invented samples. These eight bytes are not an SP transmit-frame definition.',
  fallback: 'The samples -40000, -1, 1 and 40000 produce 00 80 ff ff 01 00 ff 7f after clipping. Insufficient capacity leaves every sentinel byte unchanged.',
  initial: { samples: 1, capacity: 0, selected: 1 },
  controls: [
    choose('samples', 'Sample set', ['Ordinary', 'Outside the range', 'At the boundaries']),
    choose('capacity', 'Declared output capacity', ['8 bytes', '3 bytes']),
    range('selected', 'Follow sample', 1, 4),
  ],
  frame(values, progress) {
    const samples = sampleSets[integer(values, 'samples', 2, 1)];
    const capacity = integer(values, 'capacity', 1) === 0 ? 8 : 3;
    const selected = Math.round(bound((values.selected ?? 1) - 1, 0, 3));
    const p = bound(progress);
    const enough = capacity === 8;
    const raw = samples[selected];
    const clipped = bound(raw, -32768, 32767);
    const sampleX = (value: number) => 40 + (value + 40000) / 80000 * 400;
    const clipProgress = enough ? bound((p - 0.15) / 0.4) : 0;
    const pointerX = sampleX(raw + (clipped - raw) * clipProgress);
    const bytes = samples.flatMap(sample => {
      const value = bound(sample, -32768, 32767);
      return [value & 255, (value >> 8) & 255];
    });
    const marks: Mark[] = [
      text('minimum', '-32,768', 38, 13, 145, 17),
      text('maximum', '32,767', 336, 13, 125, 17),
      line('sample-axis', 40, 66, 400),
      line('low-bound', sampleX(-32768), 45, 0, 40),
      line('high-bound', sampleX(32767), 45, 0, 40),
      circle('sample-pointer', pointerX - 6, 60, 12, 'Ink'),
      text('clipping-result', enough ? `${raw} becomes ${clipped}` : 'Capacity check stops here', 100, 84, 346, 19),
      text('input-label', 'INPUT', 24, 122, 112, 16),
      text('output-label', 'BYTES', 24, 184, 112, 16),
      rect('left-guard', 8, 211, 12, 41, 'Surface', 'Ink'),
      rect('right-guard', 460, 211, 12, 41, 'Surface', 'Ink'),
      path('capacity-bracket', `M32 269v9h${capacity * 53 - 8}v-9`),
      text('capacity-label', `${capacity} writable bytes`, 32, 287, 235, 16),
      text('packing-result', enough ? 'LOW BYTE FIRST' : 'UNCHANGED', 287, 287, 180, 16),
    ];
    for (let i = 0; i < 4; i++) {
      marks.push(text(`sample-${i}`, `${samples[i]}`, 35 + i * 106, 151, 104, 18));
      marks.push(dim(line(`sample-link-${i}`, 80 + i * 106, 180, 0, 26), i === selected));
    }
    for (let i = 0; i < 8; i++) {
      const ready = enough && p >= 0.55 + (Math.floor(i / 2) + 1) * 0.1;
      const focused = Math.floor(i / 2) === selected;
      marks.push(rect(`byte-${i}`, 32 + i * 53, 211, 45, 41, ready && focused ? 'Ink' : 'Paper', i < capacity ? 'Ink' : 'Line'));
      marks.push({ ...text(`byte-value-${i}`, ready ? bytes[i].toString(16).padStart(2, '0') : 'a5', 39 + i * 53, 219, 36, 20), fill: ready && focused ? 'Paper' : 'Ink' });
    }
    return { marks, readout: enough
      ? `Four signed values need eight bytes. The selected input ${raw} clips to ${clipped}; its low byte is written first. Guard cells remain unchanged.`
      : 'Eight output bytes are required, but the declared capacity is three. Validation rejects the entire call before assignment. All sentinel and guard cells remain unchanged.' };
  },
};

export const systemsDemos: Demo[] = [evidence, packages, budgets, ownership, journal, packing];
