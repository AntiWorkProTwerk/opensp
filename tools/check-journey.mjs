import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export const journeySlugs = [
  'pad-information', 'first-animation', 'verified-capture', 'original-boot',
  'mapping-controls', 'named-inputs', 'usb-updates', 'keeping-the-updater',
  'partial-update', 'ram-loader', 'finding-audio', 'audio-stream',
  'original-sdk', 'bootloader-boundaries', 'pitch-correction', 'synth-design',
];
const root = fileURLToPath(new URL('../', import.meta.url));
const contentDir = path.join(root, 'src/content/journey');
const categories = ['Display', 'Controls', 'USB', 'Audio', 'SDK', 'Research'];
const privatePatterns = [
  /(?:[a-z]:[\\/]Users[\\/]|\/(?:Users|home)\/[^/\s]+\/)/i,
  /(?:design\.penpot\.app|penpot-mcp|localhost|127\.0\.0\.1|DPAPI)/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{24,})\b/,
  /(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*["'][^"'\s]{12,}["']/i,
];

export function assertPublicText(value, context) {
  for (const pattern of privatePatterns) assert(!pattern.test(value), `${context}: private data pattern found (value redacted)`);
}

const string = (value, field) => assert(typeof value === 'string' && value.trim().length > 0, `${field}: expected nonempty text`);
function textList(value, field, min = 1) {
  assert(Array.isArray(value) && value.length >= min, `${field}: expected at least ${min} entries`);
  value.forEach((entry, index) => string(entry, `${field}[${index}]`));
}
function fields(value, required, optional, field) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${field}: expected an object`);
  for (const key of required) assert(Object.hasOwn(value, key), `${field}: missing ${key}`);
  for (const key of Object.keys(value)) assert([...required, ...optional].includes(key), `${field}: unknown field ${key}`);
}

function validateChapter(chapter, filename, localSources) {
  const label = path.basename(filename);
  fields(chapter, ['slug', 'title', 'description', 'order', 'category', 'period', 'evidenceLabel', 'summary', 'timeline', 'sections', 'exercise', 'sources', 'limits'], [], label);
  for (const field of ['slug', 'title', 'description', 'period', 'evidenceLabel', 'summary']) string(chapter[field], `${label}.${field}`);
  assert.equal(path.basename(filename, '.json'), chapter.slug, `${label}: slug must match filename`);
  assert(journeySlugs.includes(chapter.slug), `${label}: chapter is not in the reviewed series`);
  assert(Number.isInteger(chapter.order) && chapter.order > 1, `${label}: order must follow first-change`);
  assert(categories.includes(chapter.category), `${label}: invalid category`);
  assertPublicText(JSON.stringify(chapter), label);

  const timeline = chapter.timeline;
  fields(timeline, ['kind', 'title', 'caption', 'duration', 'steps'], [], `${label}.timeline`);
  assert(['sequence', 'r3'].includes(timeline.kind), `${label}: invalid timeline kind`);
  assert.equal(timeline.kind === 'r3', chapter.slug === 'first-animation', `${label}: only the preserved R3 chapter uses renderer frames`);
  string(timeline.title, `${label}.timeline.title`);
  string(timeline.caption, `${label}.timeline.caption`);
  assert(Number.isFinite(timeline.duration) && timeline.duration >= 1000 && timeline.duration <= 120000, `${label}: duration must be milliseconds between 1000 and 120000`);
  assert(Array.isArray(timeline.steps) && timeline.steps.length >= 2, `${label}: timeline needs at least two states`);
  timeline.steps.forEach((step, index) => {
    fields(step, ['title', 'body', 'display'], [], `${label}.timeline.steps[${index}]`);
    string(step.title, `${label}.timeline.steps[${index}].title`);
    string(step.body, `${label}.timeline.steps[${index}].body`);
    textList(step.display, `${label}.timeline.steps[${index}].display`, 4);
    assert.equal(step.display.length, 4, `${label}: schematic screens need exactly four lines`);
  });

  assert(Array.isArray(chapter.sections) && chapter.sections.length >= 4 && chapter.sections.length <= 6, `${label}: expected four to six sections`);
  const ids = new Set(['exercise', 'evidence']);
  chapter.sections.forEach((section, index) => {
    const field = `${label}.sections[${index}]`;
    fields(section, ['id', 'title', 'short', 'paragraphs'], ['steps', 'checkpoint'], field);
    for (const key of ['id', 'title', 'short']) string(section[key], `${field}.${key}`);
    assert(/^[a-z][a-z0-9-]*$/.test(section.id), `${field}: invalid anchor`);
    assert(!ids.has(section.id), `${field}: duplicate or reserved anchor ${section.id}`);
    ids.add(section.id);
    textList(section.paragraphs, `${field}.paragraphs`);
    if (section.steps !== undefined) textList(section.steps, `${field}.steps`);
    if (section.checkpoint !== undefined) string(section.checkpoint, `${field}.checkpoint`);
  });

  fields(chapter.exercise, ['title', 'intro', 'code', 'expected', 'explanation'], [], `${label}.exercise`);
  for (const key of Object.keys(chapter.exercise)) string(chapter.exercise[key], `${label}.exercise.${key}`);
  assert(chapter.exercise.code.length < 20000, `${label}: exercise is unexpectedly large`);
  assert(Array.isArray(chapter.sources) && chapter.sources.length > 0, `${label}: missing evidence sources`);
  chapter.sources.forEach((source, index) => {
    const field = `${label}.sources[${index}]`;
    fields(source, ['title', 'path', 'evidence'], [], field);
    for (const key of ['title', 'path', 'evidence']) string(source[key], `${field}.${key}`);
    assert(!/^(?:[a-z]+:|\/|\\)/i.test(source.path) && !/[?#\r\n\\]/.test(source.path), `${field}: source must be a relative record path`);
    assert(!source.path.includes('/../') && !source.path.startsWith('../../'), `${field}: unexpected source traversal`);
    if (localSources) {
      const sourceRoot = fileURLToPath(new URL('../../sp404mk2/', import.meta.url));
      assert(fs.existsSync(path.resolve(sourceRoot, source.path)), `${field}: retained source is missing (${source.path})`);
    }
  });
  textList(chapter.limits, `${label}.limits`);
  if (chapter.category === 'Research') assert(/(?:not |no |unverified|untested|unfinished|propos|research|host|offline)/i.test(chapter.evidenceLabel + ' ' + chapter.limits.join(' ')), `${label}: research needs an explicit evidence limit`);
}

function frontmatterScalar(mdx, key) {
  const frontmatter = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(frontmatter, 'MDX entry has no frontmatter');
  const match = frontmatter[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  assert(match, `MDX entry has no ${key}`);
  const raw = match[1].trim();
  if (raw.startsWith('"')) return JSON.parse(raw);
  if (raw.startsWith("'")) return raw.slice(1, -1).replaceAll("''", "'");
  return raw;
}

export function checkJourney({partial = false, localSources = false, wrappers = true} = {}) {
  const files = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter(name => name.endsWith('.json')) : [];
  if (!partial) assert.deepEqual(files.map(name => name.slice(0, -5)).sort(), [...journeySlugs].sort(), 'Guide series must contain every reviewed chapter');
  const chapters = files.map(filename => {
    const chapter = JSON.parse(fs.readFileSync(path.join(contentDir, filename), 'utf8'));
    validateChapter(chapter, filename, localSources);
    const mdxPath = path.join(root, 'src/content/guides', `${chapter.slug}.mdx`);
    if (wrappers && (!partial || fs.existsSync(mdxPath))) {
      assert(fs.existsSync(mdxPath), `${chapter.slug}: missing MDX route`);
      const mdx = fs.readFileSync(mdxPath, 'utf8');
      assert.equal(frontmatterScalar(mdx, 'title'), chapter.title, `${chapter.slug}: title drift`);
      assert.equal(frontmatterScalar(mdx, 'description'), chapter.description, `${chapter.slug}: description drift`);
      assert.equal(Number(frontmatterScalar(mdx, 'order')), chapter.order, `${chapter.slug}: order drift`);
      assert.equal(frontmatterScalar(mdx, 'draft'), 'false', `${chapter.slug}: chapter remains a draft`);
      assert(mdx.includes('JourneyGuide') && mdx.includes(chapter.slug), `${chapter.slug}: wrapper does not use the shared guide`);
    }
    return chapter;
  });
  assert.equal(new Set(chapters.map(chapter => chapter.order)).size, chapters.length, 'Chapter orders must be unique');
  return chapters.sort((a, b) => a.order - b.order);
}

export function checkExercises(chapters) {
  const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  for (const chapter of chapters) {
    const result = spawnSync(python, ['-I', path.join(root, 'tools/check-journey-exercise.py')], {
      encoding: 'utf8', input: JSON.stringify({code: chapter.exercise.code, expected: chapter.exercise.expected}),
      windowsHide: true, timeout: 5000, maxBuffer: 1024 * 1024,
    });
    assert(!result.error, `${chapter.slug}: exercise could not run (${result.error?.code || 'unknown error'})`);
    assert.equal(result.status, 0, `${chapter.slug}: ${result.stderr || 'exercise failed'}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const chapters = checkJourney({partial: process.argv.includes('--partial'), localSources: process.argv.includes('--local-sources'), wrappers: !process.argv.includes('--content-only')});
  if (process.argv.includes('--exercises')) checkExercises(chapters);
  console.log(`Validated ${chapters.length} guide chapters${process.argv.includes('--exercises') ? ' and their Python exercise output' : ''}.`);
}
