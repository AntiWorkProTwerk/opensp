# Build and publish OpenSP

OpenSP uses Astro 7.3.5 static output, GitHub Pages and Cloudflare DNS. There is
no application server or database. Svelte is reserved for future walkthroughs
that need substantial state; the homepage does not load a framework runtime.

## Local work

Use the Node version in `.node-version` and the committed npm lockfile.

```powershell
npm ci
npm run dev
```

The development server listens on localhost. `npm run build` creates `dist/`
and checks the initial JavaScript budget. `npm run preview` serves that built
output. Only `dist/` is deployed; the research tools, design archives and local
connector credentials are not website assets. `site/` is the historical blank
site and is no longer the deployment source.

## Penpot to production

Keep the signed-in OpenSP editor tab active with its hosted MCP connector.
If the connector reports a missing heartbeat, focus the workspace tab rather
than the separate View-mode tab. The connection instructions are in
[penpot-connection.md](penpot-connection.md).

```powershell
npm run design:pull
npm run design:tokens
git diff -- design/penpot/production.json design/penpot/homepage.json design/studies/home-copy.json src/styles/tokens.css
```

The pull reads native SP component mains, their visible linked instances,
library colors and typography. It then reads the approved white desktop
homepage's text, line breaks and guide topics. Hidden archives are excluded.
Review the diff: pulling is an explicit update, not a background sync or a
promise that any Penpot edit is ready to publish. It updates the existing
`home-copy.json` shared by the review prototype and production.

`production.json` is an API snapshot of real Penpot library assets. The token
mapper turns those assets into CSS variables; it is not an exported DTCG token
file. CI uses the committed snapshots and does not connect to Penpot. No private
connection key belongs in git or GitHub Actions secrets for this static build.

| Penpot source | Production component |
| --- | --- |
| Navigation, Wordmark, Primary links, Theme selector | `SiteHeader.astro` |
| Hero copy | Shared homepage JSON and `index.astro` |
| Section header, Release content/card, Guide row | `Section.astro`, `GuideRow.astro`, homepage slots |
| Footer | `SiteFooter.astro` |
| SP component mains and nested parts | `SPPart.astro`, `SPInstrument.astro` |
| Screen content slot and R3 poster | `SPDisplay.astro` and the shared frame player |

Page text is semantic HTML with responsive CSS. The instrument is inline SVG
rendered from exported native geometry, with named `data-part` and
`data-component` groups. Its screen is a separate reusable player. No full-page
image or manually redrawn instrument is used. Fonts are self-hosted Arimo and
Cousine, with their licenses retained under `design/studies/fonts/`.

The shape renderer currently supports the exported board/group, rectangle,
ellipse, path and text types. Before introducing masks, rotated shapes,
gradients or effects in Penpot, extend and visually verify that renderer.
Compare the finished homepage against both Penpot sizes and both themes after
each pull. Native interactions still need semantic browser implementations.

## Content and interaction

The homepage preserves the owner's wording. Its guide rows are explicitly
unpublished previews until an approved MDX guide is available. Add guides under
`src/content/guides/`; their schema defaults to `draft: true`. Published guides
get static routes, shared typography and homepage links. Never populate a
release download with an unverified firmware artifact.

Normal links and browser history remain native. Cross-document view transitions
last 120 ms where supported and are disabled for reduced motion. Future guide
links opt into hover/intent prefetching. There is no Astro ClientRouter or
cross-route hydration. Theme selection persists locally and follows system
changes when set to System.

The [display contract](sp-display.md) covers source fidelity, swapping sequences,
pause/seek and reduced motion. The homepage replay uses the preserved R3 trace,
with its original omissions and timing uncertainty. No browser talks to the SP.

## Checks and deployment

```powershell
npm run check
npm run build
npm run test:install
npm test
```

Playwright checks eight widths in both themes, the native component structure,
keyboard navigation, disclosures, theme persistence, playback lifecycle,
JavaScript-disabled and failed-media fallbacks. Axe checks desktop/mobile in
both themes. Build checks reject private design references and unexpected
source artifacts, verify asset paths, and cap generated JavaScript plus inline
homepage scripts at 15 KiB gzip. This conservative launch budget covers all
built scripts; revisit the accounting when a guide introduces an isolated
Svelte bundle. These checks do not establish real-user Core Web Vitals.

`.github/workflows/pages.yml` runs install, type checks, build and browser tests
on pull requests and pushes. A successful `main` build uploads only `dist/` and
deploys through GitHub's Pages environment using its short-lived OIDC token.
The deployment job alone has Pages write permission. Dependabot proposes npm
and Actions updates; nothing auto-merges.

The first npm Dependabot job reached GitHub's PR-creation service, which returned
HTTP 500. Its follow-up error-reporting endpoint also failed. GitHub rejected a
retry of that dynamic run. The failed maintenance job
is separate from the successful build/deployment jobs; the next scheduled update
check remains enabled. No dependency PR was merged and production is unaffected.

Deployments require a user request or a clearly authorized release task. Commit
the reviewed source/design snapshot, push `main`, watch the workflow, then check
the live homepage, screen assets, mobile/theme behavior and HTTPS redirects.
`/build-info.json` identifies the deployed commit and artifact/design hashes.
For rollback, revert the release commit through a new reviewed commit and let
the same pipeline redeploy. Never force-reset the shared branch.

Cloudflare remains DNS-only. GitHub's certificate now covers `opensp.fyi` and
`www.opensp.fyi`, with HTTPS enforcement enabled. The stuck initial certificate
was restarted by removing and immediately restoring the same custom-domain
setting, following GitHub's documented procedure; DNS was unchanged.
[Certificate provisioning](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https),
[Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

Known build notice: Astro/MDX currently emits a Rolldown warning for
`use astro:head-inject` while compiling the empty draft. Type checks and the
static build pass; that draft has no public route. Verify MDX asset propagation
when adding the first published guide, rather than suppressing the warning.
