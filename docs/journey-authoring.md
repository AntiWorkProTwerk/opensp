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
copy and component links before building. `--components-only` and
`--articles-only` and `--index-only` support partial exports during authoring; none proves
the whole series is ready. The full tests require sixty-four article layouts
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
