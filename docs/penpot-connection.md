# Penpot connection

Use the official hosted MCP connection. The owner approved switching on
September 28, 2026. The OpenSP file is connected through the existing Canary tab;
the old local plugin is closed and its server has been stopped.

The connection URL is stored outside git at
`%LOCALAPPDATA%/OpenSP/penpot-mcp.xml`, encrypted with Windows DPAPI for the current
user. The key was created with a 90-day expiry. Do not print, commit or include
the URL/key in screenshots. The clipboard was cleared after saving it.

The repository client defaults to hosted mode when that encrypted file exists:

```powershell
node tools/penpot-call.mjs list
node tools/penpot-call.mjs execute_code '=return penpot.currentPage.name;'
node tools/penpot-call.mjs penpot_api_info '{"type":"Text"}'
node tools/penpot-call.mjs export_shape '{"shapeId":"BOARD_ID","format":"png"}' --out C:/path/to/review.png
```

Keep the OpenSP tab active and its toolbar MCP indicator connected. If it is
disconnected, use the editor's MCP server menu to reconnect. Read-only inspection
must confirm the file and page before edits. A page switch is asynchronous;
confirm the new current page in the next call. Helper `storage` is session-local
and must be reloaded after reconnecting. Never rerun creation steps blindly.

`refine-home.js` loads bounded helper functions. Scaling and dark-theme work use
small queues, skipping hidden archived SVG trees. These are staged migration
tools, not an idempotent whole-file generator. Keep linked component instances.
`compact-home.js` holds the later, tighter homepage geometry. Its definitions
load without edits; run `mains()` on Design system, then `board(id)` on Homepage
and drain `scaleBatch()` before inspecting. Do not reload helpers or queue the
same board again while scaling remains pending. Component instances may regain
their qualified main name after Reset overrides; look up both the short name
and `OpenSP /` name. This was the cause of the first compact-layout lookup failure.

The owner subsequently restored the earlier stacked sections only.
`restore-sections.js` is the current section override: load it on Homepage to
capture the protected hero/navigation/SP state, run `mains()` on Design system,
then `board(id)` for each existing Homepage board. It checks that the protected
parts remain unchanged. Do not reload the helper between those steps or rerun
the superseded compact sections afterward.
Check text-bound coordinates as well as dimensions after repositioning. One dark
release heading retained its old rendered x coordinate after reload, although
the shape x was correct. Resizing its width by 1px, then restoring the original
width in a separate call, refreshed the bounds without changing its typography.

Use shared typography assets for global type changes. A Navigation asset
tracking change reached all four homepage boards. Editing the same text property
only in a component main did not reach dark copies with text-color overrides.
An intermediate nested Primary links instance also needed Reset overrides before
its main's edit reached light layouts. Do not detach instances to work around this.

Penpot 2.18.1 left paragraph `lineHeight` at 1.2 after `applyTypography`, even
though the referenced asset held 1.6. Changing the asset alone did not fix that
paragraph field. After editing typography, load `refine-home.js`, then run
`sync-home-leading.js` on Design system and Homepage in separate calls. It
propagates the asset values explicitly, preserving component, font and color
references. Verify bounds afterward. The four homepage text-overflow checks
passed after this correction.

## Why the local connector was replaced

The local npm connector identified itself as 2.15.4 while the app reported
2.18.1. Registry checks found `latest`/`stable` at 2.15.4 and `next` at 2.17.0;
there was no 2.18.x package. Even the 2.18.0 source tag retained a 2.17.0 MCP
package version. Do not change a version string merely to suppress a warning.

The hosted endpoint uses Streamable HTTP. An initial legacy SSE GET returned
HTTP 400; POST initialization and subsequent tool calls worked. The client
never needs browser cookies. `--local` explicitly selects the old localhost
endpoint for diagnostics, but starting that server is not needed for normal work.

[Official connection guide](https://github.com/penpot/penpot/blob/develop/docs/mcp/index.md)
and [published local package](https://www.npmjs.com/package/@penpot/mcp).
