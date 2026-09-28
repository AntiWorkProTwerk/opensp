# OpenSP design language

Tool: **Penpot**, selected for setup on 2026-09-28. The browser is at the
account login screen; the OpenSP project/file has not been created yet.
Visual direction remains open.

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

## Workspace to create after sign-in

Create an **OpenSP** project with one file, **OpenSP Design Language**.
Organize the file into four pages:

- **Direction**: references, moodboards and agreed principles.
- **Foundations**: color, typography, spacing, layout and motion decisions.
- **Components**: navigation, article cards, buttons and evidence labels.
- **Page studies**: homepage and a journey entry at desktop/mobile sizes.

Record the Penpot file link here once created. Keep agreed design values as
exported JSON in `design/tokens.json` when we have actual tokens to export;
retain this document for rationale and usage rules. Build the browser style
guide after choosing the first direction. No palette or font is approved yet.

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
