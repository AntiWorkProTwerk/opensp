# SP panel geometry

The owner requested the missing knob and effects surrounds, and a wider screen
whose sides follow the circular opening. The reference is Roland's
[front-on product photograph](https://static.roland.com/products/sp-404mk2/images/img_product_sp-404mk2_02.jpg),
linked from its [SP-404MKII product page](https://www.roland.com/global/products/sp-404mk2/).
This remains a simplified monochrome diagram, not a measured CAD drawing.
The photograph is a reference; it is not bundled with the website.

## Shared parts

`SP / Knob surround` is the capsule-shaped rail behind VOLUME and CTRL 1–3.
`SP / Effects surround` is the curved-sided housing behind the six staggered
effect buttons and circular display. Both are native main components in
Assets → Components → SP, nested as linked instances inside `Instrument`.
Existing knobs, buttons, pads and the Display keep their component identities.

Canonical coordinates below are relative to the 400×570 Instrument. They are
design units, not hardware measurements.

| Part | Position | Size |
| --- | --- | --- |
| Knob surround | 56, 43 | 288×50 |
| Effects surround | 60, 111 | 280×112 |
| Effect buttons | 72, 117 | 256×99 |
| Display | 134, 101 | 132×132 |

The Display's 130-unit outer circle is unchanged. Its inner opening is a
122-unit circle at 5, 5. The 122×61 screen is centered at 5, 35.5, reaching
the opening's full diameter. The circular mask hides the rectangular corners.
The source screen remains 128×64 and scales uniformly; it is never stretched
to fill a circle. Screen content near the corners can sit behind the rim.

## Penpot and browser contract

The native `OLED viewport / circular clip` is a mask group. Its **first** child,
`OLED circular aperture`, supplies the mask. Putting the aperture last painted
a white circle over the content; the final group uses the correct ordering.
`SPPart` exports that relationship as `maskId` and renders an SVG clip path.
The separate browser player derives its matching CSS ellipse from those same
exported bounds. Playback controls retain their full keyboard/touch target.

`complete-sp-parts.js` records the guarded one-time installation. Do not rerun
it on an existing library. `fit-sp-parts.js` registers bounded propagation
helpers: prepare on each affected page, then drain batches of at most 20 shapes.
New native children did not inherit older instance scale/theme overrides, and
reparenting the screen replaced the guide's content override. The fit restores
only the affected parts, preserves links and reinstates the Menu title screen
on guide pages. It does not rebuild the page or change its copy.

The current library exports 14 SP definitions including the R3 screen.
Homepage instances use R3; guide instances use Menu title screen. Historical
unlinked SVG studies and old `.penpot` archives retain their original geometry.
Pull both production and guide snapshots after changes, inspect all eight
current desktop/mobile theme instances, and run `tests/sp-parts.spec.ts` with
the full browser suite. There is no automatic Penpot/code synchronization.
