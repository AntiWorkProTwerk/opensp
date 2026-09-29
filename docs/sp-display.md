# Reusable SP display

The [homepage review](../design/studies/home.html) plays AntiWorkProTwerk inside
the SP. Its 128×64 content is independent of the circular bezel and the rest of
the instrument. Desktop, mobile and both themes use the same sequence.
The production homepage uses the same player through `SPDisplay.astro`.
`SPInstrument.astro` positions it from the exported Penpot OLED content slot,
while `SPPart.astro` renders the bezel and instrument geometry.

## The R3 source

The owner confirmed the `ASCII SPIN3!` animation worked in
[R3's hardware report](../../sp404mk2/custom_firmware/spin_r3/HARDWARE_RESULT.md).
The website uses all 64 frames from the preserved compiled-renderer pixel trace,
not a newly drawn approximation or a video capture. The original files and
firmware packages remain untouched.

The trace omits the stock font, the bottom `AntiWorkProTwerk` caption, header and
surrounding UI. Playback assumes 50 ms per frame, or 3.2 seconds per revolution,
matching the original preview. Physical timing was not measured. Preserve these
limitations when using the animation as historical evidence.

[The manifest](../design/assets/screens/antiworkprotwerk-r3/manifest.json) records
provenance, timing, source SHA256, asset hashes and all 64 decoded-frame hashes.
The lossless sprite is 9,870 bytes; the first-frame PNG is 300 bytes.
The trace's `width:36,height:14` describe its character grid; the pixel surface
is 128×64. The importer checks both pixel bounds and the pinned source hash.

```powershell
python tools/import-sp-screen.py ../sp404mk2/custom_firmware/build/spin_r3/frames.json
python design/studies/home.py
```

## Design and code mapping

| Part | Penpot | Browser source |
| --- | --- | --- |
| Bezel and OLED window | Existing `SP / Display` main | `SPPart.astro` and `SPInstrument.astro`; `panel.py` in the review prototype |
| Screen content | `SP / Screens / AntiWorkProTwerk R3` | Sequence manifest, poster and sprite |
| Playback | Poster plus usage note | `design/components/sp-display.js` and `.css` |

The screen main is `88ef66de-c84d-8075-8008-b5cd51dfbbdb`. Its poster is one
editable compound pixel path inside a 128×64 board, with shared `OLED black`
and `OLED pixel` colors. A linked instance occupies the Display's named
`OLED content slot`. Both colors stay fixed across page themes.

Penpot documents delayed board navigation and dissolve/slide/push transitions.
These are useful for UI flows. This design uses a static poster there; actual
screen-frame playback is tested in the browser. Animated GIF/video support was
not established for this file, and no animated Penpot export is claimed.
[Penpot prototyping reference](https://help.penpot.app/user-guide/prototyping-testing/prototyping/).

`design/penpot/setup-screen.js` records the one-time creation. Inject
`poster-path.json` into its `const poster = __POSTER__;` declaration before
execution. Do not rerun it against the existing main. For another screen, make a
named main under `SP/Screens`, then swap the linked content slot. Keep the bezel
and Instrument links intact.

Newly inserted children did not inherit the homepage instances' earlier scale
overrides. Run `fit-screen-slots.js` separately on SP components and Homepage
after insertion or replacement. It derives the slot from each existing OLED
window and preserves the 2:1 aspect ratio. `verify-screen-slots.js` checks all
four homepage views. They now each have 55 linked nested SP component heads.
The previous native archive predates this change; the live file is current.

## Using another sequence

Keep a sequence's frames in one lossless, row-major sprite and include a static
poster. For real captures, record their origin, capture date/build, crop and
actual frame durations; do not invent missing screen contents or timing.
Use the same 128×64 viewport with no stretching, smoothing or theme recoloring.
The manifest supplies `id`, `title`, `description`, dimensions, `frameCount`,
`columns`, `frameMs`, `loop`, `sprite` and `poster`. Optional `durations` contains
one millisecond duration per frame, each at least 16 ms. The accessible description
must identify what that particular sequence shows.

The build-time helper `design/components/sp_display.py` accepts a manifest and
asset URL, producing `<sp-display>` markup for the review prototype. The production
`src/components/SPDisplay.astro` wrapper emits that same markup and imports the
shared CSS/player; the entire page needs no hydration. Pass a sequence with its
asset URLs to reuse it in a guide. Astro fingerprints the homepage's imported
poster and sprite assets.
Static content is already present before the script runs. Animation changes only
the sprite's SVG crop. The pause control covers the screen and stays at least
44 CSS pixels high on small layouts.

Each player has independent `play()`, `pause()` and zero-based `seek(frame)`
methods. A walkthrough can pause and seek in response to a pad or guide step.
The default autoplay stops offscreen and while the page is hidden. Reduced
motion starts on the poster; a deliberate Play action is still available.
A later reduced-motion preference change pauses playback. Asset failure or
disabled JavaScript leaves the poster and page usable. No device connection,
audio, framework runtime or animation library is involved.
[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API),
[page visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API),
[reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Verification

Production checks run through `npm run check`, `npm run build` and `npm test`.
They cover both themes, responsive sizing, disclosures, playback lifecycle and
accessibility. See [development.md](development.md) for the deployment checks.

Run `tools/check-sp-display.py --browser <Chromium executable>` and the existing
`design/studies/check_studies.py --browser <Chromium executable>`.
The checks cover all 64 frame hashes, playback controls, timing wrap, seek,
non-loop completion, reduced motion, offscreen/visibility suspension, reconnect,
failed assets and no-JavaScript fallback. The new component was checked at four
widths in both themes; the homepage's existing 24 width/theme checks also pass.
Browser screenshots and native desktop/mobile exports were visually inspected.
No physical mobile-device performance or full-screen hardware capture is claimed.
