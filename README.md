# OpenSP

A home for documenting the SP-404MKII development journey.

Website: [opensp.fyi](https://opensp.fyi/), on GitHub Pages with Cloudflare DNS
and enforced HTTPS.

## Website

The production site uses Astro static output, reusable components derived from
the shared Penpot design, and the original AntiWorkProTwerk R3 frame animation.
It has no application server or site-wide framework hydration. Guide topics
remain unpublished previews; no firmware downloads are offered yet.

```powershell
npm ci
npm run dev
```

See [development.md](docs/development.md) for design pulls, content authoring,
tests and deployment. `npm run check`, `npm run build` and `npm test` run before
publishing. GitHub Actions deploys only `dist/` after the `main` checks pass.
`site/index.html` is the historical blank page, no longer the deployment source.
The [launch record](docs/deployment.md) includes live browser checks and mobile/
desktop Lighthouse reports.

## Shared design

Use the named Penpot assets and linked components. `npm run design:pull` reads
the approved native components and white desktop homepage into reviewable
snapshots; it does not publish them. See [design-language.md](docs/design-language.md)
and [the screen component contract](docs/sp-display.md).

The firmware project's narrative remains the editorial source; no research
artifacts or firmware binaries are included in the public site build. The R3
animation uses rendered pixel frames with their provenance recorded separately.
