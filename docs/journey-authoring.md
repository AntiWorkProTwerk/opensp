# Guide series authoring

Chapter copy lives in `src/content/journey/<slug>.json`. The responsive guide,
Penpot layouts and curated evidence record consume that source. MDX entries
contain only route metadata and the shared component invocation; validation
checks that their title, description and order agree with the JSON.

Use this chapter shape:

```ts
{
  slug: string,
  title: string,
  description: string,
  order: number,
  category: 'Display' | 'Controls' | 'USB' | 'Audio' | 'SDK' | 'Research',
  period: string,
  evidenceLabel: string,
  summary: string,
  timeline: {
    kind: 'sequence' | 'r3',
    title: string,
    caption: string,
    duration: number, // milliseconds
    steps: Array<{
      title: string,
      body: string,
      display: [string, string, string, string] // concise schematic screen lines
    }>
  },
  sections: Array<{
    id: string,
    title: string,
    short: string,
    paragraphs: string[],
    steps?: string[],
    checkpoint?: string
  }>,
  exercise: {
    title: string,
    intro: string,
    code: string, // standalone Python 3, standard library only
    expected: string,
    explanation: string
  },
  sources: Array<{title: string, path: string, evidence: string}>,
  limits: string[]
}
```

Write connected explanations with four to six sections. Explain the important
steps and the failed assumptions; do not turn the page into a list of build
numbers. Keep dates and measurements traceable to focused hardware or test
reports. Source paths identify retained project records, not public download
links. Public evidence must say when the underlying record is not published.

Exercises operate on invented in-memory data only. They accept no device, network
or firmware input and write no files. State the expected output and test it.
They reproduce an engineering check, not a hardware installation. Do not publish
security-bypass steps, exploit reproduction, flash commands, private captures,
credentials or personal paths. Research chapters must not imply a released SDK,
working instrument feature or verified recovery path.

Timeline screens are explicitly schematic. The R3 chapter may replay the
preserved original renderer trace with its existing provenance and unmeasured
timing caveat. Native Penpot poster instances share the same copy; browser motion
uses the common autoplay, pause, seek and reduced-motion behavior.

## Chapter demonstrations

The current local increment adds a distinct demonstration to each of the
seventeen guides. Shared models live in `src/lib/demos/`; `types.ts` defines the
contract. Each model supplies its title, prompt, evidence caption, static
explanation, numeric initial state and semantic control definitions. Its pure
`frame(values, progress)` returns named vector marks and a text result.
An optional `act(values, action)` returns a new state without mutating its input.

Keep the 480 × 320 canvas, mark IDs, order and types stable across every state.
Geometry and short labels explain the mechanism; paragraphs belong in semantic
HTML. Use shared color tokens and identify invented values. Controls must change
a meaningful result, and each model must retain the chapter's evidence limits.
Never accept programs, firmware files, device input or network data.

Penpot holds seventeen `Demo: <slug>` diagram mains under
`OpenSP / Demonstrations`, plus Desktop/Mobile figure mains for each diagram
under `OpenSP / Demo figures` (thirty-four figure mains). Reuse their linked
instances across pages and themes. The native poster corresponds to
`frame(initial, 1)`; browser playback may start earlier. Inspect the existing
library before running a creation stage, and export actual mains with:

```powershell
node tools/design-demos.mjs export
node tools/design-demos.mjs export-figures
npm run test:demos
```

The exports write `design/penpot/demo-components.json` and the responsive
`demo-figures.json` archive. `ChapterDemo.astro`
renders that geometry through `SPPart`; `chapter-demo.ts` updates its named
marks and HTML controls. Server rendering may import the whole model registry.
Client code must dynamically select one of `early`, `systems` or `audio`, never
import the full registry. Preserve the static poster during delayed or failed
loads, autoplay once, pause offscreen/hidden, and keep keyboard, seek and
reduced-motion behavior intact.

`tools/design-demos.mjs` is a staged authoring tool, not a rebuild command.
Inspect saved mains before `create`; `place` skips completed migration markers
and rejects partial figures. After a timeout or tab crash, inspect the saved
page before retrying. The optional `OPENSP_PENPOT_TIMEOUT_MS` accepts
5,000..180,000 ms (default 60,000); increasing it does not prove a request failed
or make repeating a write safe. To export the current Guide series page without
visiting component mains, use
`node tools/pull-journey-design.mjs --articles-only --layouts-only`.

`tools/check-demos.mjs` checks chapter coverage, numeric controls, deterministic
frames/actions, stable topology, bounds, publication text and the exported
native posters. It explores finite control combinations and bounded action
sequences; it does not prove physical behavior or replace visual inspection.
Native path checks normalize global coordinates back into the diagram and
compare their line segments with the model. The `--native-paths-only` diagnostic
checks that subset and cannot replace the default full native check.
`npm run test:demos -- --models-only` omits native checks and cannot establish
design delivery. Browser tests separately cover controls and playback.

The original timeline remains in a closed milestone disclosure on later
non-R3 pages. R3 keeps its original replay inline and adds its demonstration
within the article. All 64 later-guide layouts and the four first-guide layouts
now contain their linked figure, nested diagram and Animation timeline. Native
tests check component identity, shared copy, placement and text bounds in both
themes at both sizes. Preserve historical figures when migrating and verify
every affected layout after export.

## Native authoring and export

Inspect the live file before creating layouts. The authoring script is staged,
not an idempotent rebuild: it refuses to overwrite existing chapter boards.
Load the current shared copy with `node tools/design-journey.mjs load` and
prepare missing mains with `node tools/design-journey.mjs prepare`. Run
`node tools/design-journey.mjs chapter <slug>` for each new chapter, then
`node tools/design-journey.mjs index` for the guide index. Each stage creates
desktop/mobile layouts in both themes using linked components.
The first guide's index description comes from its existing MDX metadata; its
article introduction is intentionally different. The other index entries use
the chapter JSON, whose metadata is checked against MDX.

`node tools/design-journey.mjs align-index` reapplies the mobile index overrides
and that first description on the existing Guide index page. It keeps the linked
rows, hides mobile numbers and adds the home link. Two separate width-change
requests refresh Penpot's cached line wrapping, then restore the exact widths.
Check rendered text and bounds afterward, not just the shape dimensions.

Use `npm run design:pull-journey` after authoring. It snapshots five Journey
mains, the article layouts and the four index layouts. Review the exported
copy and component links before building. `--components-only`, `--articles-only`
and `--index-only` support partial exports during authoring; none proves
the whole series is ready. The existing series tests cover sixty-four article layouts
and four index layouts, with shared copy and named component links preserved.
Exports retain each text shape's `textBounds`. Penpot documents this as the box
covering the text even when it overflows its selection rectangle. The native
tests compare those bounds with the allocated reading-text boxes; screenshots
still need visual review for spacing, hierarchy and instrument geometry.

Penpot rejects cloning a shape from an inactive page and adding children to
a component instance. Create an Asset instance on the active page, keep
responsive size overrides, and put variable evidence text in the component's
existing field. After a failed operation, inspect what persisted before retrying.
If an interrupted `begin` completed its introduction and timeline but no article
sections, `node tools/design-journey.mjs resume-sections <slug>` can continue
that active board. Its guard refuses a different chapter or a board whose
sections have already started. Do not use it without inspecting the live state.
