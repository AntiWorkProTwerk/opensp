# Guide series design review

The sixteen-chapter extension and guide index preserve OpenSP's approved field-manual design. Source inspection found no new palette, font family, decorative container system or instrument geometry. Arimo reading text, Cousine labels, semantic light/dark colors and sharp shared SP parts remain the basis of the pages. `DESIGN.md` and `.impeccable/design.json` were left unchanged.

## Source mapping

| Source | Extension use |
| --- | --- |
| [Production assets](../../design/penpot/production.json) and [generated tokens](../../src/styles/tokens.css) | Existing typography, theme colors and instrument geometry. |
| [Journey mains](../../design/penpot/journey-components.json) | Five native mains: Journey screen, sequence, sequence mobile, contents and navigation. Sequence components reuse Instrument and Animation timeline. |
| [Article layouts](../../design/penpot/journey-layouts.json) and [index layouts](../../design/penpot/journey-index-layouts.json) | Sixty-four article boards and four index boards retain component IDs, shared copy and text bounds. Each index has seventeen linked Guide rows. |
| [Guide template](../../src/pages/guides/[...id].astro) and [JourneyGuide](../../src/components/guides/JourneyGuide.astro) | Shared header, contents rail, reading sections, checkpoints, evidence and previous/next links. Mobile uses the existing contents disclosure. |
| [JourneyTimeline](../../src/components/guides/JourneyTimeline.astro) and [motion controller](../../src/scripts/journey-motion.ts) | Exported Journey screen inside SPInstrument; existing AnimationTimeline controls. Playback starts once in view, pauses offscreen or hidden, supports seeking and retains explicit pause. Reduced motion starts at the final state. |
| [Chapter JSON](../../src/content/journey/) and [index JSON](../../src/content/guide-index.json) | Shared narrative for browser/native authoring. The index uses existing GuideRow components and MDX metadata; the first guide's index description deliberately differs from its unchanged article introduction. |
| [Journey styles](../../src/styles/journey.css) | Local figure, exercise and series-navigation rules extend the existing guide layout and semantic theme aliases. |

Static explanations and the “Read every step” disclosure preserve the sequence without playback. Research chapters label their limits, and exercises use invented data without a device connection. The R3 figure imports its existing poster, sprite and [provenance manifest](../../design/assets/screens/antiworkprotwerk-r3/manifest.json). Its 64 frames come from the compiled renderer trace; 50 ms timing remains a preview assumption. No new raster asset was introduced.

## Evidence and limits

This documentation pass examined the project instructions, product and design documents, design sidecar, guide direction contract, authoring/export notes, shared routes and components, motion source, CSS, token output, snapshot structure, test assertions and capture manifest. The snapshot inventory contains five mains, sixty-four article layouts and four index layouts.

The supplied independent finish-review handoff returned **SHIP for local handoff**, with no material issues after opening twelve browser screenshots and eight native canvas captures. Browser review covered the full bootloader-boundaries article and index, plus the R3 timeline, at 1440px and 390px in both themes. Native review covered index openings and article timelines. Full native page exports timed out; those captures do not establish a full-page visual review of every native board.

The handoff reports passing copy, component-link and reading-bounds checks across all sixty-eight native layouts, and an earlier passing run of all 88 browser checks. Final regenerated build/test results were still pending when this report was prepared. This pass did not rerun tests, the context loader or detector, and did not independently open the screenshots. The capture manifest records 7,274 bytes gzip of JavaScript for the reviewed browser build, below the 15 KiB budget; it is a local measurement.

The single detector run reported zero primary findings and four font-size advisories in `journey.css`: 28px at line 6, 26px at line 61, 28px at line 67 and 12px at line 72. The finish reviewer accepted these as contextual figure/code overrides. They do not introduce new shared type tokens.

## Existing documentation drift

The sidecar still previews the former Figure button and refers to `figure-button`, while `DESIGN.md` defines `timeline-button` and the implementation uses AnimationTimeline. Its description of reader-started playback also predates the documented once-visible autoplay behavior. These discrepancies existed before this extension review.

The “Next together” section of [design-language.md](../design-language.md) still says that no production framework is installed and the public homepage is blank. Its opening section and the development guide describe the implemented Astro site. Those stale historical directions were left untouched. The root design documents also describe the homepage and first guide without the new series source mapping, which this report and the authoring contract provide.

This pass changed only this report. It made no browser, Penpot or device calls and no commit or deployment. The review records local design consistency and the supplied finish verdict; publication and live deployment identity remain outside its scope.

## Final verification

The implementing agent completed the final checks after the documentation pass:

- `npm run check`: 31 files, no errors, warnings or hints.
- `npm run build`: 20 static HTML pages, including all seventeen guides and their index; publication checks pass with 7,274 bytes gzip of JavaScript.
- `npm test -- --workers 3`: all 88 tests passed in 1.3 minutes, including shared copy and component checks for all sixty-eight native layouts, every chapter route and evidence/example endpoint, no-JavaScript reading, keyboard controls and playback lifecycle behavior.
- `node tools/capture-journey.mjs`: twelve fresh browser captures tied to the final local build. The implementing agent opened all twelve and found no new layout issues. Visual coverage and native-capture limits remain as stated above.

The final build's chapter-content SHA-256 is `3d3a281573dc80c0553df6fa395e003606507b6dc31b0160f611199dc0b6e7ba`; its article-layout hash is `9485b0baf52c37cd8877080a2ccc76c2251ef0e3b8d4da2ea7ff72855eb9ee28` and index-layout hash is `878090a901855abc61ec4ee59d513b4fec09c414cb0a4ee3eaf5399c48edb1a1`. The local capture manifest records the full build identity. Its commit field identifies the base revision, not a commit containing these uncommitted changes.

The coverage map in [the source ledger](../journey-sources.md) accounts for the later display, diagnostics, original boot, controls, USB, recovery, RAM execution, audio and SDK milestones, plus explicitly dated bootloader, pitch-correction and synth research. Each chapter has reading sections, a meaningful sequence, an offline exercise and evidence limits. Shared content feeds the responsive Astro template and native Penpot layouts. Research chapters do not claim that incomplete hardware work is a released feature.

This completes the local guide-series handoff. No commit, push or deployment was performed.
