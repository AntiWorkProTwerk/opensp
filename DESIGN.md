---
name: OpenSP
description: Monochrome field-manual design for the SP-404MKII project.
colors:
  paper: "#ffffff"
  ink: "#111111"
  muted: "#555555"
  line: "#888888"
  surface: "#f2f2f2"
  dark-paper: "#151617"
  dark-ink: "#eef0ec"
  dark-muted: "#b6b9b5"
  dark-line: "#636763"
  dark-surface: "#242628"
  oled-black: "#000000"
  oled-pixel: "#ffffff"
typography:
  hero:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "76px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-1.9px"
  hero-mobile:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-1.2px"
  article-title:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "60px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-1.5px"
  heading:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.64px"
  intro:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0px"
  body:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
  body-mobile:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
  caption:
    fontFamily: "Arimo, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  label:
    fontFamily: "Cousine, 'Courier New', monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.54
    letterSpacing: "0.26px"
  navigation:
    fontFamily: "Cousine, 'Courier New', monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.3px"
  code:
    fontFamily: "Cousine, 'Courier New', monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0px"
rounded:
  square: "0px"
spacing:
  half-step: "4px"
  step: "8px"
  detail-gap: "16px"
  mobile-gutter: "24px"
  group-gap: "32px"
  column-gap: "48px"
  page-gutter: "64px"
components:
  timeline-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0px"
  timeline-button-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  primary-navigation:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
    padding: "14px 0"
  theme-selector:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "8px"
  guide-row:
    textColor: "{colors.ink}"
    padding: "16px 0"
  release-preview:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "16px 24px"
---

# Design System: OpenSP

## Overview

**Creative North Star: "Field manual"**

OpenSP uses the owner's chosen field-manual direction: regular reading type,
monospaced navigation, open space and sharp instrument drawings. The Teenage
Engineering references inform the hierarchy and room around the hardware.
OpenSP keeps its own fonts, copy and component geometry.

The homepage and first guide share the same visual system. Penpot holds linked
main components and their instances; the static website renders semantic text
and exported SP geometry. [Design language](docs/design-language.md),
[reference notes](docs/references/teenage-engineering.md) and
[development](docs/development.md) record the approved direction and source map.

**Key Characteristics:**

- Monochrome surfaces and thin dividing rules.
- Arimo for reading, Cousine for navigation and technical labels.
- Reusable SP parts with separate display content.
- One responsive template and shared content for both themes.

## Colors

The palette uses white paper and dark ink in light mode, charcoal paper and
off-white ink in dark mode. There is no accent color.

### Neutral

Paper is the page and control background. Ink carries reading text, active
outlines and selected diagram cells. Muted carries captions and evidence notes;
line separates sections. Surface groups release previews, code and diagram steps.
The corresponding dark tokens retain those roles. OLED black and OLED pixel stay
fixed across themes.

**The semantic theme rule.** Use the existing `--paper`, `--ink`, `--muted`,
`--line` and `--soft` aliases so both themes inherit the same component structure.
The frontmatter component colors describe light mode; those aliases select the
dark counterparts in the website.

The color and type primitives come from
[production.json](design/penpot/production.json) through generated
[tokens.css](src/styles/tokens.css). Change shared assets in Penpot before pulling
and regenerating tokens. These API snapshots are not DTCG exports.

## Typography

Arimo and Cousine are self-hosted. Arimo's regular weight carries titles and
prose; the wordmark uses bold. Cousine separates navigation, code, filenames
and evidence labels from the reading text. Small lettering inside the SP drawing
belongs to the illustration and is not a reading-text size.

The frontmatter retains the shared asset names. The homepage hero scales between
its mobile and desktop sizes. Guide titles use the article-title role, step down
to 52px at 1200px, and use hero-mobile below 600px. Guide section headings become
28px below 600px. Body text uses body-mobile there; captions retain their size.
Guide paragraphs stop at 68ch and captions at 70ch. Contextual label sizes and
leading are specified in [guide.css](src/styles/guide.css).
Timeline clocks and byte-value annotations use 10–12px Cousine inside diagrams;
they never carry the only explanation of a step. Checkpoint instructions use
18px reading text, with 16px evidence notes. The instrument's 36px mobile title
and 15px code explanation are figure-specific overrides.

**The reading and labels rule.** Keep paragraphs in Arimo and functional labels
in Cousine. Use regular-weight headings and the established modest negative
tracking; do not introduce a second display face.

## Layout

The shared shell is at most 1440px wide. Its gutters change from page-gutter to
32px at 1100px, then mobile-gutter at 600px. Spacing follows an 8px rhythm with
4px half-steps; group and detail gaps are named in the frontmatter.

The desktop guide has a 272px contents rail, the shared column-gap and a reading
area at most 992px wide. At 1200px the rail becomes 192px and the gap 32px. At
900px the index moves above the article and becomes a native disclosure; the
article is capped at 760px. Below 600px its figures and index links stack.
Without JavaScript the contents remain expanded and usable.

The guide instrument is 400px wide on desktop and 300px below 600px, constrained
by available width. The homepage keeps its separate 440px/320px overrides and
stacks its hero at 720px. Guide sections have 80px separation, reduced to 64px on
mobile. Native board heights are composition snapshots, not fixed browser heights.

**The shared geometry rule.** Theme changes preserve layout. Responsive overrides
must retain the underlying Penpot component links.

## Elevation & Depth

The interface is flat. Thin rules, whitespace and surface fills group content;
there are no box shadows or gradients. Buttons gain a darker border and a surface
fill on hover. Links use underlines or a bottom border. Keyboard focus uses a
2px ink outline, offset 4px on guide buttons and 5px on shared links and selectors.

## Shapes

Controls and content containers have square corners. Interface rules are 1px;
the instrument retains the strokes and proportions in its native geometry.
Its circular bezel and knobs are hardware shapes, not a rounding rule for cards.
Navigation symbols use vector paths or CSS strokes.
The shared knob rail and effects housing follow the front-on panel reference.
The OLED spans the inner circular aperture; its 2:1 content is uniformly scaled
and clipped at the rim. [Panel geometry](docs/references/sp-panel.md) records
the native mains and their renderer mapping.

## Components

The five sidecar examples are existing website patterns: the former figure button, primary
navigation, theme selector, guide row and release preview. They introduce no new
input, chip or card family. The selector is a native select; its browser affordance
is preserved. Buttons have at least 44px height. Guide rows keep descriptions
below titles and use the existing inline SVG arrow only when linked.

The first guide's contents, paragraphs, headings, captions and figures map to
[guide-components.json](design/penpot/guide-components.json),
[first-guide-layouts.json](design/penpot/first-guide-layouts.json), the
[guide template](src/pages/guides/[...id].astro) and
[GuideFigure](src/components/guides/GuideFigure.astro). Native posters show a
representative state; semantic HTML implements disclosures and playback.
Code styling and native typography are explicitly mapped, not automatically synced.
The timeline replaces the former figure button: a 44px play/pause target,
1px seek line, keyboard-accessible range input and elapsed/duration clock.
Reader checkpoints group the important actions and expected observations beneath
each numbered section. Both are reusable guide patterns.

SPPart renders the shared native shapes; SPInstrument composes the instrument.
The 128×64 screen remains independent of its bezel and enclosure. The guide's
Menu title screen and the homepage's R3 sequence have separate sources and
provenance. Follow [the display contract](docs/sp-display.md) when swapping them.

Guide figures autoplay once when at least 20% visible, without looping. The
timeline supports pause and scrubbing; manual pause survives leaving and
re-entering the viewport. Playback suspends offscreen or while the page is hidden.
Reduced motion starts at the final state and permits explicit playback. Static
explanations remain available without scripts, with space reserved for controls
to avoid a layout jump. The homepage display has
its own documented autoplay and pause behavior. Cross-document transitions last
120ms where supported and are disabled for reduced motion.

## Do's and Don'ts

### Do:

- Do reuse linked Penpot mains, shared typography and semantic theme aliases.
- Do compare desktop and mobile in both themes after shared changes.
- Do keep reading text and static figures usable without JavaScript.
- Do identify reconstructed screens and preserve their provenance.

### Don't:

- Don't add accent colors, gradients, shadows or decorative card systems.
- Don't flatten the reusable SP assembly or redraw its screen bezel for new content.
- Don't treat a native poster as browser interaction or a device capture.
- Don't turn the existing homepage eyebrow into a default guide pattern.
