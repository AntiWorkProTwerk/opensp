# Design language: proposed workflow

Research date: 2026-09-28. No visual direction or tool has been selected yet.

## Recommendation: Penpot and repository-owned tokens

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

## Alternative: Figma with Tokens Studio

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
