# OpenSP design language

Tool: **Penpot**, connected through the signed-in Canary UI on 2026-09-28.
The **OpenSP** file is in Personal Projects / Drafts. **Page 1** now contains
three proposed editorial layouts, a component/state sheet and a modular panel
sheet. The owner expanded the blank-start request to design exploration.
The corrected diagrams were visually checked in Penpot and persisted through
reload. They are imported vector groups, not a published native component library.
The second page, **Mobile - light and dark**, adds six mobile compositions.
Native snapshots are committed in [design/penpot](../design/penpot/README.md).

[Open the OpenSP canvas](https://design.penpot.app/#/workspace?team-id=a5ac146a-5787-80fa-8008-b51846f04474&file-id=24d9d841-759d-81bc-8008-b518bc70d8b3&page-id=24d9d841-759d-81bc-8008-b518bc70d8b4).
Access requires the owner's Penpot account; this is not a public sharing link.

## Penpot and repository-owned tokens

[Penpot design tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/)
support named colors, typography, spacing, dimensions, borders and shadows,
including aliases, sets, themes and JSON import/export in DTCG format.
Use the visual canvas to compare directions, then export agreed values into
this repository. Import/export is a file workflow; automatic GitHub syncing
has not been established for this setup.

For collaboration directly in the website, we can also build a browser style
guide here: swatches, type specimens, spacing, buttons, cards and article
examples. The owner reviews the real rendered design, and agreed changes
become versioned tokens and CSS.

## Next together

Choose parts from the [local review page](../design/studies/index.html):
A field manual, B lab journal, C guided walkthrough, D shared states, E panel parts.
The public homepage remains blank. These are proposals, not approved styling.
Keep agreed design values as
exported JSON in `design/tokens.json` when we have actual tokens to export;
retain this document for rationale and usage rules. Build the browser style
guide after choosing the first direction. No palette or font is approved yet.

## Reference-led studies / September 28

- [Teenage Engineering EP–133 guide](https://teenage.engineering/guides/ep-133):
  numbered sections, hardware-first diagrams and generous whitespace.
- [Bartosz Ciechanowski](https://ciechanow.ski/mechanical-watch/): interactive
  illustrations explaining cause and effect alongside the narrative.
- [Red Blob Games](https://www.redblobgames.com/grids/hexagons/): readable
  technical prose combined with explorable diagrams.

The first SP drawing incorrectly rearranged the physical controls. The owner
flagged this. The replacement follows the panel illustration and control lists
on pp. 6–11 of [Roland's reference manual](https://static.roland.com/assets/media/pdf/SP-404MK2_v4_reference_eng02_W.pdf).
It restores the circular display bezel, flanking effect buttons, lower VALUE
knob and control rows, left four-column pad grid and right performance column.
Shapes and proportions are simplified, not measured CAD; display content is invented.

The owner requested composition from parts. [panel.py](../design/studies/panel.py)
provides separate enclosure, knob body/indicator, display bezel/screen, effect
buttons, record/edit controls, banks, individual pads and performance buttons.
Named SVG groups allow independent states/animation. The browser study connects
pad selection, CTRL 1, display, play/pause/reset and manual steps; it has no
hardware connection or sound. Pointer/keyboard, mobile width, SVG IDs and
JavaScript smoke checks pass with [check_studies.py](../design/studies/check_studies.py).
Generate with `python design/studies/build_studies.py`. Fonts are preliminary
system-font studies. SVG import is manual; there is no automatic Penpot sync.

## Mobile and themes

The [responsive article review](../design/studies/mobile.html) provides three
switchable layouts with actual reflow, not scaled-down desktop screenshots.
On mobile, contents collapse, captions replace margin notes, columns stack,
and the guided direction presents one explanation at a time. Full-size pad
selection, previous/next, and knob controls supplement the small panel targets.
All three [390px compositions](../design/studies/mobile-concepts.svg) have light
and dark variants in Penpot. Desktop illustrations also have dark SVG variants.

[theme.css](../design/studies/theme.css) uses semantic paper/surface/ink/muted/line
values; dark paper is charcoal, text is off-white, and the OLED stays dark.
Light/Dark/System selection is keyboard-accessible, persists locally, and reacts
to OS changes in System mode. Motion is opt-in and honors reduced motion.
The values are implementation proposals, not exported Penpot design tokens.

Smoke checks cover 30 width/layout/theme combinations at 320, 390, 430, 768 and
1280px, overflow, pad selection, step navigation, theme persistence and system
changes. The public `site/` remains unchanged; these are repository review files.

## Previously considered alternative: Figma with Tokens Studio

[Tokens Studio](https://docs.tokens.studio/token-storage/remote/) supports
remote token storage, including GitHub, alongside a visual Figma workflow.
This is a useful option if the owner already prefers Figma. Account connection,
plan requirements and plugin installation have not been configured here.

## What we should codify together

1. Personality and visual references: what the project should feel like.
2. Colors, typography, spacing, layout widths, borders and motion.
3. Reusable elements: navigation, journal entries, milestone cards and evidence labels.
4. Editorial rules: voice, captions, and clear distinctions between proposals,
   emulator results and physical hardware observations.

Keep the rationale in a design-language document, values in a token file,
and visible examples in a browser style guide. Tokens encode the repeatable
values; examples and prose explain how to use them. These are proposed next
steps, not an implemented design system.
