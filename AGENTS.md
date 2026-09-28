# Website design and components

For all OpenSP website work, use the `penpot-design-system` skill and read
[docs/design-language.md](docs/design-language.md) for the shared Penpot file,
assets, and current design status. The website stack has not been selected;
these rules apply regardless of the eventual framework.

For design work in Penpot, also use the globally installed `impeccable` skill
(`<user-profile>/.agents/skills/impeccable/SKILL.md`). Apply its typography,
layout and review guidance to the native components, then check matching desktop
and mobile views in both themes. Read the
[Teenage Engineering reference notes](docs/references/teenage-engineering.md)
first. The owner's chosen fonts, monochrome palette and monospaced section labels
take precedence over generic aesthetic defaults in the skill.

- Always use the shared Penpot assets and native reusable components. Build
  layouts with linked instances of named main components, including nested SP
  parts. Do not substitute detached copies, flattened images, or repeated SVG
  imports for components that need shared updates.
- Check Assets before creating anything. If a needed component is missing,
  create and clearly name its main component, then reuse linked instances.
  Keep responsive, theme, and interaction differences in shared variants or
  documented overrides that preserve the underlying component link.
- Make shared changes in the main component and propagate them to every
  affected instance. Verify desktop/mobile views and light/dark themes before
  calling the change complete. Do not patch individual copies to hide drift.
- When the stack is chosen, map Penpot components and tokens to shared code
  components and assets with a documented source mapping. All website uses
  must consume those shared definitions so one update reaches every use.
  Update and verify both Penpot and code; automatic synchronization is not
  currently configured and must not be assumed.
- Existing unlinked studies are migration work. Convert reused parts to linked
  components before extending those studies or using them in production.
  Preserve historical snapshots and record migration status in the design docs.
