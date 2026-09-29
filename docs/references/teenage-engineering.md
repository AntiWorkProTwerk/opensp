# Teenage Engineering reference notes

Reviewed September 28, 2026. These are visual references for OpenSP, not a
specification copied from Teenage Engineering.

## What to borrow

The [EP-133 guide](https://teenage.engineering/guides/ep-133) separates the
instrument name, description and guide metadata across aligned columns. A large
instrument drawing has room around it. The contents use a numbered hierarchy,
with short labels and nested subsections. These patterns suit an index of
technical walkthroughs.

The [OP-1 product page](https://teenage.engineering/products/op-1) lets the
instrument dominate. Its introductory headline is regular-weight sans serif,
with open space separating text from imagery. OpenSP should retain that
restraint while keeping Releases and Guides easy to find.

The [OP-1 guide index](https://teenage.engineering/guides/op-1) uses a broad rule
to separate the index from preceding material, then groups links into aligned
columns. The EP-133 guide's introductory metadata also shares a horizontal grid.
This informed a side-by-side OpenSP proposal. The owner preferred the earlier
stacked grouping, which is now restored: release preview below copy, guide
descriptions below titles. The reference does not prescribe OpenSP's layout.

Browser inspection at 1440px reported `te-20, Unicode, sans-serif` for the sampled
site navigation, at 16px/24px and CSS weight 100. This is a reported CSS value,
not a license or a recommendation to copy the font. No TE fonts or artwork are
included in this repository.

## OpenSP decisions

- Use the approved Arimo for headings and reading text. Use Cousine for the
  eyebrow, Releases/Guides navigation, section labels and metadata.
  The monospace choice follows the owner's preferred original OpenSP labels;
  it is not a claim that TE uses monospace everywhere.
- Keep the exact owner-supplied OpenSP wording from `design/studies/home-copy.json`,
  including the updated open-source eyebrow. The section labels read
  `RELEASES` and `GUIDES`: the owner asked
  to remove the numeric prefixes while keeping their existing typography.
- Use regular weight and modest tracking. Hero: 76px desktop, 48px mobile;
  section description: 32px; body: 20px desktop, 18px mobile; labels: 13px;
  navigation: 14px. Display tracking stops at -0.025em.
- Align desktop section copy to one consistent reading column. Start from
  64px outer margins, a 272px index column and a 48px column gap. Mobile uses
  24px margins and a single reading column.
- Use an 8px spacing rhythm with 4px half-steps: 4px between guide title and caption,
  16–24px within groups, 32px around the hero and above the desktop release preview.
  Avoid position transforms that leave empty layout space behind.
- Let the hero height follow the dominant SP drawing: 440px wide on desktop,
  320px on mobile, clamped to available width. Stack the hero at 720px so its
  copy is not squeezed beside the instrument. Keep 104px desktop disclosure
  headers and stacked guide descriptions; mobile headers are now 128px to show
  the owner's full section descriptions. Enlarging
  the hero moves these sections down without changing their internal spacing.
- Keep the accurate, sharp-line SP panel. Its display, knobs, pads and control
  sections remain linked parts of the Instrument component. Do not flatten it.
- Keep both content sections collapsible and the two navigation links centered.
  Preserve keyboard access and theme selection. The owner hid the homepage
  preview notice; the repository still identifies sample links as design studies.
- Dark mode uses the same hierarchy and spacing, with off-white text on charcoal.
  Do not add gradients, shadows, decorative cards or an accent color in this pass.

## Reuse and checks

Update shared typography assets and component mains before assembling pages.
Responsive geometry and theme colors may be documented instance overrides;
component links must survive. Check desktop and mobile together in light and
dark. The Penpot canvas is the visual source; the browser study checks reflow
and disclosure behavior. No automatic Penpot/code synchronization is configured.
