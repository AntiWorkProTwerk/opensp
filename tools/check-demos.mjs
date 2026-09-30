import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {demos} from '../src/lib/demos/index.ts';
import {assertPublicText, journeySlugs} from './check-journey.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const expectedSlugs = ['first-change', ...journeySlugs];
const progressSamples = [0, .1, .25, .4, .5, .65, .8, .92, .99, 1];
const canvas = {width: 480, height: 320};
const tokenNames = ['Ink', 'Paper', 'Surface', 'Muted', 'Line'];
const nativeTypes = {rect: 'rectangle', ellipse: 'ellipse', path: 'path', text: 'text'};
const epsilon = .00001;
const nativePathTolerance = .01;

function nonempty(value, context, maximum = 2000) {
  assert(typeof value === 'string' && value.trim().length && value.length <= maximum, `${context}: expected nonempty text of at most ${maximum} characters`);
}

function finite(value, context) {
  assert(Number.isFinite(value), `${context}: expected a finite number`);
}

function point(x, y, context) {
  finite(x, `${context}.x`);
  finite(y, `${context}.y`);
  assert(x >= -epsilon && x <= canvas.width + epsilon && y >= -epsilon && y <= canvas.height + epsilon, `${context}: point (${x}, ${y}) leaves the 480 × 320 canvas`);
}

// Preserve subpath starts and closes while converting every straight segment to
// absolute M/L/Z coordinates. Control points and arcs need a separate verifier.
export function canonicalPath(data, context = 'path', offsetX = 0, offsetY = 0) {
  nonempty(data, context, 20000);
  finite(offsetX, `${context} x offset`);
  finite(offsetY, `${context} y offset`);
  const tokens = data.match(/[a-zA-Z]|[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi) || [];
  assert.equal(data.replace(/[a-zA-Z]|[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi, '').replace(/[\s,]/g, ''), '', `${context}: invalid path syntax`);
  assert(tokens[0] === 'M' || tokens[0] === 'm', `${context}: a path must begin with a move`);
  const segments = [];
  let command, index = 0, x = 0, y = 0, startX = 0, startY = 0;
  while (index < tokens.length) {
    if (/^[a-z]$/i.test(tokens[index])) command = tokens[index++];
    assert(command && /^[MLHVZ]$/i.test(command), `${context}: unsupported path command ${command}; extend the bounds verifier before using it`);
    const upper = command.toUpperCase(), relative = command !== upper;
    if (upper === 'Z') {
      x = startX; y = startY;
      segments.push({command: 'Z', x: x + offsetX, y: y + offsetY});
      command = undefined; continue;
    }
    const arity = upper === 'M' || upper === 'L' ? 2 : 1;
    const args = tokens.slice(index, index + arity).map(Number);
    assert.equal(args.length, arity, `${context}: incomplete path command`);
    args.forEach((argument, i) => finite(argument, `${context} argument ${i}`));
    index += arity;
    if (upper === 'M' || upper === 'L') {
      x = (relative ? x : 0) + args[0]; y = (relative ? y : 0) + args[1];
      if (upper === 'M') { startX = x; startY = y; command = relative ? 'l' : 'L'; }
    } else if (upper === 'H') x = (relative ? x : 0) + args[0];
    else y = (relative ? y : 0) + args[0];
    segments.push({command: upper === 'M' ? 'M' : 'L', x: x + offsetX, y: y + offsetY});
  }
  return segments;
}

function checkPath(data, context, offsetX = 0, offsetY = 0) {
  const segments = canonicalPath(data, context, offsetX, offsetY);
  segments.forEach(segment => point(segment.x, segment.y, context));
  return segments;
}

export function compareNativePath(mark, shape, context = mark.id) {
  assert(mark.type === 'path' && shape.type === 'path', `${context}: path comparison requires two paths`);
  assert(Array.isArray(shape.pathOrigin) && shape.pathOrigin.length === 2, `${context}: missing native global path origin`);
  shape.pathOrigin.forEach((value, index) => finite(value, `${context} native path origin ${index}`));
  finite(shape.x, `${context} native x`);
  finite(shape.y, `${context} native y`);
  const expected = checkPath(mark.d, `${context} model path`, mark.x, mark.y);
  const actual = checkPath(shape.d, `${context} native path`, shape.x - shape.pathOrigin[0], shape.y - shape.pathOrigin[1]);
  assert.deepEqual(actual.map(segment => segment.command), expected.map(segment => segment.command), `${context}: native path segment topology differs`);
  for (const [index, segment] of expected.entries()) for (const axis of ['x', 'y']) {
    assert(Math.abs(actual[index][axis] - segment[axis]) <= nativePathTolerance, `${context}: native path point ${index} ${axis} differs (${actual[index][axis]} versus ${segment[axis]})`);
  }
  return expected.length;
}

function checkValues(values, controls, context) {
  assert(values && typeof values === 'object' && !Array.isArray(values), `${context}: expected a numeric state object`);
  Object.entries(values).forEach(([key, value]) => finite(value, `${context}.${key}`));
  for (const control of controls) {
    if (control.kind === 'action') continue;
    const value = values[control.id];
    finite(value, `${context}.${control.id}`);
    if (control.kind === 'choice') assert(control.options.some(option => option.value === value), `${context}.${control.id}: state is not an available choice`);
    else {
      assert(value >= control.min && value <= control.max, `${context}.${control.id}: state is outside the range`);
      const steps = (value - control.min) / (control.step ?? 1);
      assert(Math.abs(steps - Math.round(steps)) < epsilon, `${context}.${control.id}: state is off the step grid`);
    }
  }
}

function checkControls(demo) {
  assert(Array.isArray(demo.controls) && demo.controls.length > 0, `${demo.slug}: controls are missing`);
  const ids = new Set();
  for (const control of demo.controls) {
    nonempty(control.id, `${demo.slug} control ID`, 80);
    assert(/^[a-z][a-z0-9-]*$/.test(control.id) && !ids.has(control.id), `${demo.slug}: duplicate or invalid control ID ${control.id}`);
    ids.add(control.id);
    nonempty(control.label, `${demo.slug}/${control.id} label`, 80);
    assert(['range', 'choice', 'action'].includes(control.kind), `${demo.slug}/${control.id}: unsupported control kind`);
    if (control.kind === 'range') {
      [control.min, control.max, control.step ?? 1].forEach((n, i) => finite(n, `${demo.slug}/${control.id} range field ${i}`));
      assert(control.max > control.min && (control.step ?? 1) > 0, `${demo.slug}/${control.id}: invalid range`);
      const count = (control.max - control.min) / (control.step ?? 1);
      assert(Math.abs(count - Math.round(count)) < epsilon && count <= 1000, `${demo.slug}/${control.id}: unbounded or misaligned range`);
    } else if (control.kind === 'choice') {
      assert(Array.isArray(control.options) && control.options.length >= 2, `${demo.slug}/${control.id}: expected at least two choices`);
      const options = new Set();
      for (const option of control.options) {
        nonempty(option.label, `${demo.slug}/${control.id} choice label`, 80);
        finite(option.value, `${demo.slug}/${control.id} choice value`);
        assert(!options.has(option.value), `${demo.slug}/${control.id}: duplicate choice value`);
        options.add(option.value);
      }
    } else assert.equal(typeof demo.act, 'function', `${demo.slug}: action controls need an action handler`);
  }
  checkValues(demo.initial, demo.controls, `${demo.slug}.initial`);
}

function controlStates(demo) {
  let states = [{...demo.initial}];
  for (const control of demo.controls) {
    if (control.kind === 'action') continue;
    const values = control.kind === 'choice' ? control.options.map(option => option.value)
      : Array.from({length: Math.round((control.max - control.min) / (control.step ?? 1)) + 1}, (_, i) => control.min + i * (control.step ?? 1));
    assert(states.length * values.length <= 10000, `${demo.slug}: control product is too large for exhaustive validation`);
    states = states.flatMap(state => values.map(value => ({...state, [control.id]: value})));
  }
  return states;
}

function checkMark(mark, context) {
  nonempty(mark.id, `${context}.id`, 100);
  assert(/^[a-z][a-z0-9-]*$/.test(mark.id), `${context}: invalid mark ID`);
  assert(Object.hasOwn(nativeTypes, mark.type), `${context}: unsupported mark type`);
  for (const key of ['x', 'y', 'w', 'h']) finite(mark[key], `${context}.${key}`);
  assert(mark.w > 0 && mark.h >= 0, `${context}: invalid dimensions`);
  point(mark.x, mark.y, context);
  point(mark.x + mark.w, mark.y + mark.h, context);
  if (mark.opacity !== undefined) assert(Number.isFinite(mark.opacity) && mark.opacity >= 0 && mark.opacity <= 1, `${context}: invalid opacity`);
  if (mark.fill !== undefined) assert(tokenNames.includes(mark.fill), `${context}: unknown fill token`);
  if (mark.stroke !== undefined) assert(['Ink', 'Muted', 'Line'].includes(mark.stroke), `${context}: unknown stroke token`);
  if (mark.type === 'text') {
    assert(typeof mark.text === 'string' && mark.text.length <= 64 && !/[\r\n]/.test(mark.text), `${context}: SVG text must stay a short single-line label`);
    finite(mark.size, `${context}.size`);
    assert(mark.size >= 10 && mark.size <= 64 && mark.h >= mark.size, `${context}: invalid diagram type size or height`);
  } else if (mark.type === 'path') checkPath(mark.d, `${context}.d`, mark.x, mark.y);
}

function pureFrame(demo, values, progress) {
  const before = structuredClone(values);
  const result = demo.frame(values, progress);
  assert.deepEqual(values, before, `${demo.slug}: frame mutated its input`);
  assert.deepEqual(demo.frame(values, progress), result, `${demo.slug}: frame is not deterministic`);
  assert.deepEqual(values, before, `${demo.slug}: repeated frame mutated its input`);
  return result;
}

function checkFrame(demo, values, progress, topology) {
  const result = pureFrame(demo, values, progress);
  nonempty(result.readout, `${demo.slug} readout`);
  assert(Array.isArray(result.marks) && result.marks.length > 0, `${demo.slug}: frame has no marks`);
  assert.deepEqual(result.marks.map(mark => `${mark.id}:${mark.type}`), topology, `${demo.slug}: mark IDs, order or types change across states`);
  result.marks.forEach(mark => checkMark(mark, `${demo.slug}/${mark.id}`));
  assertPublicText(JSON.stringify(result), `${demo.slug} frame`);
  return result;
}

export function checkModels() {
  assert.equal(demos.length, 17, 'Expected exactly seventeen guide demonstrations');
  assert.equal(new Set(demos.map(demo => demo.slug)).size, 17, 'Demo slugs must be unique');
  assert.deepEqual(demos.map(demo => demo.slug).sort(), expectedSlugs.slice().sort(), 'Demo coverage must match every published guide');
  let frames = 0, states = 0, actionCalls = 0;
  const details = [];
  for (const demo of demos) {
    for (const field of ['title', 'prompt', 'caption', 'fallback']) nonempty(demo[field], `${demo.slug}.${field}`);
    assertPublicText(JSON.stringify({title: demo.title, prompt: demo.prompt, caption: demo.caption, fallback: demo.fallback}), `${demo.slug} copy`);
    checkControls(demo);
    const poster = pureFrame(demo, {...demo.initial}, 1);
    const topology = poster.marks.map(mark => `${mark.id}:${mark.type}`);
    assert.equal(new Set(poster.marks.map(mark => mark.id)).size, poster.marks.length, `${demo.slug}: duplicate mark ID`);
    const baseStates = controlStates(demo), seen = new Map();
    for (const state of [demo.initial, ...baseStates]) seen.set(JSON.stringify(state), {...state});
    const actions = demo.controls.filter(control => control.kind === 'action');
    const actionChanges = new Map(actions.map(control => [control.id, false]));
    let frontier = [...seen.values()];
    // Three actions cover confirmation/cancellation and reset after a committed
    // change. Enumerate each action at every state, including guarded no-ops.
    for (let depth = 0; depth < 3 && actions.length; depth++) {
      const next = [];
      for (const state of frontier) for (const control of actions) {
        const before = structuredClone(state), outcome = demo.act(state, control.id);
        assert.deepEqual(state, before, `${demo.slug}/${control.id}: action mutated its input`);
        assert.deepEqual(demo.act(state, control.id), outcome, `${demo.slug}/${control.id}: action is not deterministic`);
        assert.deepEqual(state, before, `${demo.slug}/${control.id}: repeated action mutated its input`);
        checkValues(outcome, demo.controls, `${demo.slug}/${control.id} result`);
        if (JSON.stringify(pureFrame(demo, outcome, 1)) !== JSON.stringify(pureFrame(demo, state, 1))) actionChanges.set(control.id, true);
        const key = JSON.stringify(outcome);
        if (!seen.has(key)) { seen.set(key, outcome); next.push(outcome); }
        actionCalls++;
      }
      frontier = next;
      assert(seen.size <= 10000, `${demo.slug}: action exploration exceeded its bound`);
    }
    for (const [id, changes] of actionChanges) assert(changes || /reset|recreate/.test(id), `${demo.slug}/${id}: action never changes the rendered result in the explored states`);
    for (const control of demo.controls.filter(control => control.kind !== 'action')) {
      const groups = new Map();
      for (const state of baseStates) {
        const otherValues = {...state}; delete otherValues[control.id];
        const key = JSON.stringify(otherValues);
        if (!groups.has(key)) groups.set(key, new Set());
        groups.get(key).add(JSON.stringify(pureFrame(demo, state, 1)));
      }
      assert([...groups.values()].some(results => results.size > 1), `${demo.slug}/${control.id}: control never changes the rendered result`);
    }
    const animated = progressSamples.map(progress => JSON.stringify(pureFrame(demo, {...demo.initial}, progress)));
    assert(new Set(animated).size > 1, `${demo.slug}: progress has no visual or explanatory effect`);
    for (const state of seen.values()) for (const progress of progressSamples) {
      checkFrame(demo, state, progress, topology); frames++;
    }
    states += seen.size;
    details.push({slug: demo.slug, states: seen.size, marks: topology.length});
  }
  return {demos: demos.length, states, frames, actionCalls, details};
}

function descendants(shape) {
  return [shape, ...(shape.children || []).flatMap(descendants)];
}

function readNative(snapshotPath) {
  assert(fs.existsSync(snapshotPath), 'Missing native demo-components.json. Export the real Penpot mains before running the complete check; --models-only does not verify design delivery.');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  assert.equal(snapshot.source?.kind, 'native-component-api-export', 'Demo snapshot must identify a native component API export');
  nonempty(snapshot.source.fileId, 'Native source file ID');
  nonempty(snapshot.source.pageId, 'Native source page ID');
  assert(Array.isArray(snapshot.components), 'Native component list is missing');
  assert.equal(snapshot.components.length, 17, 'Expected seventeen native demonstration mains');
  assert.equal(new Set(snapshot.components.map(component => component.id)).size, 17, 'Native component IDs must be unique');
  return snapshot;
}

function nativeComponent(snapshot, demo) {
  const matches = snapshot.components.filter(component => component.name === `Demo: ${demo.slug}`);
  assert.equal(matches.length, 1, `${demo.slug}: expected one exported Demo: <slug> main`);
  const native = matches[0];
  assert.equal(native.path, 'OpenSP / Demonstrations', `${demo.slug}: incorrect native library path`);
  nonempty(native.id, `${demo.slug} native component ID`);
  nonempty(native.mainId, `${demo.slug} native main ID`);
  assert.equal(native.shape?.id, native.mainId, `${demo.slug}: export does not identify its real main shape`);
  assert.equal(native.shape.type, 'board', `${demo.slug}: expected an editable native board`);
  assert(Math.abs(native.shape.width - canvas.width) < .01 && Math.abs(native.shape.height - canvas.height) < .01, `${demo.slug}: native main must use the 480 × 320 diagram canvas`);
  return native;
}

export function checkNativePaths(snapshotPath = path.join(root, 'design/penpot/demo-components.json')) {
  const snapshot = readNative(snapshotPath);
  let paths = 0, segments = 0, firstPath;
  for (const demo of demos) {
    const native = nativeComponent(snapshot, demo);
    const children = descendants(native.shape).slice(1);
    const marks = pureFrame(demo, {...demo.initial}, 1).marks.filter(mark => mark.type === 'path');
    assert.equal(children.filter(shape => shape.type === 'path').length, marks.length, `${demo.slug}: native path count differs`);
    for (const mark of marks) {
      const matches = children.filter(shape => shape.name === mark.id);
      assert.equal(matches.length, 1, `${demo.slug}/${mark.id}: expected one native path`);
      segments += compareNativePath(mark, matches[0], `${demo.slug}/${mark.id}`);
      paths++;
      firstPath ||= {mark, shape: matches[0]};
    }
  }
  // This changes one coordinate in a cloned real export, never the saved file.
  // It guards against regressing to type/name-only native path validation.
  assert(firstPath, 'The native snapshot has no paths to exercise');
  const altered = {...firstPath.shape, d: firstPath.shape.d.replace(/^(\s*[Mm]\s*)([-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?)/i,
    (_, prefix, coordinate) => prefix + (Number(coordinate) + 1))};
  assert.notEqual(altered.d, firstPath.shape.d, 'The one-point path probe must change the native data');
  assert.throws(() => compareNativePath(firstPath.mark, altered, 'one-point regression probe'), /native path point .* differs/, 'An altered native point must be rejected');
  return {components: snapshot.components.length, paths, segments, alteredPointRejected: true, tolerance: nativePathTolerance};
}

export function checkNative(snapshotPath = path.join(root, 'design/penpot/demo-components.json')) {
  const snapshot = readNative(snapshotPath);
  let marks = 0, paths = 0, pathSegments = 0;
  for (const demo of demos) {
    const native = nativeComponent(snapshot, demo);
    const children = descendants(native.shape).slice(1);
    const poster = pureFrame(demo, {...demo.initial}, 1);
    const expectedNames = poster.marks.map(mark => mark.id).sort();
    assert.deepEqual(children.map(shape => shape.name).sort(), expectedNames, `${demo.slug}: native mark names differ from the initial poster`);
    for (const mark of poster.marks) {
      const shape = children.find(child => child.name === mark.id);
      assert.equal(shape.type, nativeTypes[mark.type], `${demo.slug}/${mark.id}: native shape type differs`);
      for (const key of ['x', 'y', 'width', 'height']) finite(shape[key], `${demo.slug}/${mark.id} native ${key}`);
      if (mark.type !== 'path') {
        for (const [nativeKey, markKey] of [['x', 'x'], ['y', 'y'], ['width', 'w'], ['height', 'h']]) assert(Math.abs(shape[nativeKey] - mark[markKey]) < .1, `${demo.slug}/${mark.id}: native ${nativeKey} differs from its poster`);
      } else {
        pathSegments += compareNativePath(mark, shape, `${demo.slug}/${mark.id}`);
        paths++;
      }
      if (mark.type === 'text') {
        if (mark.text === '') assert(typeof shape.text === 'string' && shape.text.trim() === '', `${demo.slug}/${mark.id}: an empty model label must remain whitespace-only in Penpot`);
        else assert.equal(shape.text, mark.text, `${demo.slug}/${mark.id}: native poster text differs`);
        assert(Math.abs(shape.fontSize - mark.size) < .1, `${demo.slug}/${mark.id}: native type size differs`);
      }
      assert(Math.abs((shape.opacity ?? 1) - (mark.opacity ?? 1)) < .01, `${demo.slug}/${mark.id}: native opacity differs`);
      marks++;
    }
  }
  return {components: snapshot.components.length, marks, paths, pathSegments};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const known = new Set(['--models-only', '--native-paths-only']);
  for (const argument of process.argv.slice(2)) assert(known.has(argument), `Unknown argument: ${argument}`);
  assert(!(process.argv.includes('--models-only') && process.argv.includes('--native-paths-only')), 'Choose either --models-only or --native-paths-only');
  const models = checkModels();
  if (process.argv.includes('--native-paths-only')) {
    console.log(JSON.stringify({models, nativePaths: checkNativePaths(), scope: 'models-and-native-paths-only; other native fields unverified'}, null, 2));
  } else {
    const native = process.argv.includes('--models-only') ? null : checkNative();
    const pathRegression = native ? checkNativePaths() : null;
    console.log(JSON.stringify({models, native, pathRegression, scope: native ? 'models-and-native-posters' : 'models-only; native delivery unverified'}, null, 2));
  }
}
