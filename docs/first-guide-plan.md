# First guide: our first change on the SP

Status: implemented and reviewed; release uses the Pages deployment workflow.
Route: `/guides/first-change/`. Mode: Read.

The owner chose the existing side-contents layout and requested a complete
Penpot design before publication. Extend the field-manual study and the current
native component library. This is a Penpot-first vector workflow; generated
raster mockups would not replace the requested editable source.

## Direction contract

THESIS: Follow the investigation from two update files to one changed menu title.
Every section answers a question that changed the next experiment.

OWN-WORLD: Existing monochrome OpenSP system, regular Arimo, Cousine navigation,
thin rules and linked SP parts. No new palette or decorative card system.

STORY: Files, runtime memory, decompiled drawing code, the oversized first goal,
the bounded title experiment, offline checks, then the owner's hardware result.

FIRST VIEWPORT: Shared header; a narrow left contents rail; title and short
introduction in the reading column; the accurate SP beside a legible menu-title
comparison. Mobile puts a collapsible index above the article and stacks figures.

FORM: Owner-selected field-manual study A, extended with meaningful interactive
figures. No concept seed: the source layout and direction were explicitly chosen.
The signature interaction compares the two titles and highlights the relevant
instrument controls without pretending to communicate with hardware.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Content and evidence

The article ends with the September 22 menu-title result. R1, R2 and R3 are later
chapters, not the first visual change. See [the source ledger](first-guide-sources.md).
Use short, genuine IDA excerpts with omissions marked; do not fabricate an IDA
screenshot. Screen diagrams reproduce the title only, with schematic surroundings.
No device screenshot or installed-image hash exists for this milestone.

## Required checks

Verify linked native Penpot components, all four responsive/theme designs, matching
browser geometry, contents anchors, reader-controlled animations, reduced motion,
no-JavaScript reading, keyboard access, accessibility, the script budget, and live
deployment identity. Include the reviewed Penpot snapshot with the release.

## Review result

The independent finish review requested four corrections: stale native dark
geometry, title spacing, an unnecessary hero label, and navigation glyphs.
The corrected native light boards supplied fresh linked dark copies. Final
exports now agree on the reading hierarchy; the website uses a vector contents
toggle and a plain return link. The reviewer scored all four corrections
resolved with a `ship` disposition. That verdict covers the correction list.

All 42 browser tests pass locally, including eight widths in both themes,
keyboard controls, the actual SHIFT/pad sequence, reduced motion and reading
without JavaScript. Four guide Axe checks pass. The conservative generated-plus-
inline script total is 3,518 bytes gzip. Penpot snapshots and direct PNG exports
are committed as design evidence; only the static build is deployed.

A subsequent initial-load audit caught the mobile index collapsing after first
paint. Moving its initial state to parser time reduced simulated-mobile CLS
from 0.238 to 0.00014. A regression test checks the initial state with deferred
modules removed. The corrected Lighthouse result is a local lab measurement,
not a physical-phone or field result.
