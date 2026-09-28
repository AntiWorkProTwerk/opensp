# Native Penpot snapshots

`opensp-desktop.penpot` is the native export downloaded from the OpenSP file
on 2026-09-28 before mobile/dark studies. It contains the five desktop/vector
study sheets. ZIP integrity was checked; no linked libraries are required.

Import a `.penpot` file from Penpot's project dashboard to restore a snapshot.
This is a manual export, not automatic cloud synchronization. Editable SVG
sources and the browser review are in `../studies/`.

`opensp-mobile-dark.penpot` is the subsequent complete snapshot: desktop studies
plus a second page, **Mobile - light and dark**, containing all three mobile
directions in both themes.

`opensp-responsive-themes.penpot` is the earlier responsive snapshot. It retains
those two pages and adds **Desktop + mobile - themes**: adjacent desktop/mobile
article layouts in light/dark, followed by component and panel-part theme pairs.

`opensp-components-checkpoint.penpot` is the earlier recovery checkpoint,
exported on 2026-09-28 after recovering the unresponsive editor. ZIP integrity
and its contents were checked: six pages, 22 active components, 10 colors and
15 typography styles. Deleted historical component records are also retained.
SHA256: `f937b9cb08af381d149ee404e9719153ec706c03ec5900ad52c276bed6d7887c`.

It includes the imported homepage study, SP components and Design system page.
The SP main assembly uses nested component instances. The new linked homepage
assembly did not save; shared-update propagation remains unverified. A temporary
typography compatibility sample is still on the homepage canvas. This snapshot
preserves that state rather than claiming the migration is finished.

`opensp-homepage-refined.penpot` is the first linked-homepage snapshot, exported on 2026-09-28
through the official hosted MCP session and Penpot's Download file command.
It contains six pages, 23 active components, 10 colors and 15 typography styles.
The Homepage page has four native boards: desktop/mobile in light/dark, arranged
as adjacent pairs. Each board has 11 linked top-level instances, with nested SP
parts. The imported homepage and compatibility sample remain hidden archives.
ZIP integrity, component links and the saved 1.6 body leading passed inspection.
SHA256: `b2f979cd3617a2c745fde80367c373a040c990e0ffb51b706a18cea1c7e4cbda`.

Shared Navigation tracking was verified in all four live boards. The
[connection notes](../../docs/penpot-connection.md) describe theme-override
and paragraph-leading limitations; the export does not imply automatic code sync.
The older article concept pages remain unlinked studies.
The live canvas and local previews subsequently dropped the `01 /` and `02 /`
section-label prefixes, keeping the typography unchanged. This snapshot
predates that text-only edit; `unprefix-sections.js` records the scoped migration.

`opensp-homepage-compact.penpot` preserves the intermediate layout, exported on 2026-09-28.
It includes the plain RELEASES/GUIDES labels, tighter hero, narrower label rail,
side-by-side desktop release information and aligned guide rows. Desktop boards
are 1440×1184; mobile boards are 390×1456. ZIP inspection confirmed those sizes,
all 11 linked roots per board and the 23-component / 10-color / 15-typography
library. Live checks found 54 nested SP component heads per board and no UI text
overflow. Historical snapshots are unchanged.
SHA256: `b6d4c7bf31172e16fd801576ea0fa659d57e61eaa6f62018be10e57e9b8701ce`.

`opensp-homepage-stacked.penpot` is the latest snapshot, exported on 2026-09-28.
At the owner's request, it restores only the earlier sections: preview below
release copy, guide descriptions below titles, and the wider label rail.
The compact hero, navigation, SP drawing and typography remain unchanged.
Desktop boards are 1440×1340; mobile boards are 390×1484. ZIP integrity and saved
board sizes passed inspection. All four live boards retain 11 linked roots and
54 nested SP component heads, with no measured UI text overflow.
SHA256: `866d1c869e8aacd1b4aec7a348182a12ace08375756f742e8e09f69622794479`.

## Migration scripts

The JavaScript files here record staged operations through Penpot's official
plugin API. They are experimental session scripts, not an idempotent build or
an automatic sync pipeline. They depend on the original file IDs, active page
and in-memory helper state. Do not run them against an imported snapshot
without inspecting its IDs and contents first.

`foundations.js` recorded the initial unsupported system-font attempt;
`native-helpers.js` subsequently applies the owner-approved Arimo and Cousine.
`migrate-sp.js` and `website-components.js` produced the saved component assets.
`homepage-linked.js` was the attempted batch when the editor hung. Preserve it
as evidence; split and diagnose it before any retry. It is not a verified
homepage generator. `inspect-components.js` is read-only. `refine-home.js`
provides the bounded helpers used for the first linked homepage; it skips hidden
archive trees during scaling and theme changes. `sync-home-leading.js` copies
shared typography leading to the component mains and homepage instances.
`compact-home.js` contains the intermediate geometry and responsive overrides.
The current `restore-sections.js` overrides its sections while protecting the
hero, navigation and SP. Load it on Homepage before editing the four section
mains, then apply it to the existing boards. Read the connection notes before
using these helpers; rerunning the compact script would undo this restoration.

[penpot-call.mjs](../../tools/penpot-call.mjs) now defaults to the official hosted
MCP connection using a Windows-encrypted credential outside the repository.
It replaces the local `@penpot/mcp@2.15.4` connector, which warned about the
app's newer 2.18.1 version. Follow the connection notes before sending commands;
confirm the intended file and page, and leave browser permissions to the owner.
