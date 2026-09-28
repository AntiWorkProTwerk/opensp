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

`opensp-components-checkpoint.penpot` is the latest saved-work checkpoint,
exported on 2026-09-28 after recovering the unresponsive editor. ZIP integrity
and its contents were checked: six pages, 22 active components, 10 colors and
15 typography styles. Deleted historical component records are also retained.
SHA256: `f937b9cb08af381d149ee404e9719153ec706c03ec5900ad52c276bed6d7887c`.

It includes the imported homepage study, SP components and Design system page.
The SP main assembly uses nested component instances. The new linked homepage
assembly did not save; shared-update propagation remains unverified. A temporary
typography compatibility sample is still on the homepage canvas. This snapshot
preserves that state rather than claiming the migration is finished.

## Migration scripts

The JavaScript files here record staged operations through Penpot's official
plugin API. They are experimental session scripts, not an idempotent build or
an automatic sync pipeline. They depend on the original file IDs, active page
and in-memory `storage.ds` state. Do not run them against an imported snapshot
without inspecting its IDs and contents first.

`foundations.js` recorded the initial unsupported system-font attempt;
`native-helpers.js` subsequently applies the owner-approved Arimo and Cousine.
`migrate-sp.js` and `website-components.js` produced the saved component assets.
`homepage-linked.js` was the attempted batch when the editor hung. Preserve it
as evidence; split and diagnose it before any retry. It is not a verified
homepage generator. `inspect-components.js` is read-only.

[penpot-call.mjs](../../tools/penpot-call.mjs) calls the locally running official
MCP server without browser credentials. The tested server was npm
`@penpot/mcp@2.15.4`, which warns about the app's newer 2.18.1 version.
Chrome and Penpot permissions must be approved by the owner. The connector
must be open and connected in the intended file before sending commands.
