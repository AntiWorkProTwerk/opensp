# Website stack decision

Approved by the owner September 28, 2026. Use Astro static output for OpenSP, with
shared content/components and JavaScript only for features that need it.
No application server or database is needed for the proposed informational site.
The production stack is now implemented. Follow [the build and deployment
workflow](development.md) and [deployment record](deployment.md).

## Comparison

| Option | Performance model | Fit for OpenSP |
| --- | --- | --- |
| Astro | Static HTML; opt-in interactive islands | Preferred for articles plus interactive instrument diagrams. |
| Eleventy / Hugo | Static output with site-authored browser behavior | Can deliver equally lean pages; Astro's component integrations suit the planned walkthroughs. |
| SvelteKit static adapter | Prerendered HTML; hydration and client routing by default | Good for a more app-like experience. CSR can be disabled per route to omit client JavaScript. |
| Qwik | Resumability avoids replaying the full component tree during hydration | Worth considering for a complex interactive app; not needed for these mostly static pages. |
| Next.js / Nuxt | Static generation plus app-oriented client behavior | Capable, but their additional application features do not address a current requirement. |

Primary references: [Astro islands](https://docs.astro.build/en/concepts/islands/),
[Eleventy](https://www.11ty.dev/docs/single-page-applications/),
[Hugo](https://gohugo.io/about/features/),
[SvelteKit static output](https://svelte.dev/docs/kit/adapter-static),
[SvelteKit page options](https://svelte.dev/docs/kit/page-options),
[Qwik](https://qwik.dev/docs/concepts/resumable/),
[Next.js](https://nextjs.org/docs/app/guides/static-exports),
[Nuxt](https://nuxt.com/docs/4.x/guide/concepts/rendering).

This is a workload-based choice, not a measured speed ranking. Identical HTML,
CSS, scripts and assets served identically do not become faster because a
different generator produced them. HTTP Archive's real-site comparisons include
different content and constraints; they cannot establish the fastest framework
for this page. No matched OpenSP framework benchmark was run.
[HTTP Archive methodology](https://discuss.httparchive.org/t/new-dashboard-the-core-web-vitals-technology-report/2178),
[rendering tradeoffs](https://web.dev/articles/rendering-on-the-web).

The current release index lists Astro 7.3, published September 3, 2026. Astro 7's
Rust compiler and Vite 8 improve builds; those results are not visitor load-time
measurements. Pin a stable patch and compatible integrations when implementing.
Avoid experimental features without a measured need.
[7.3 release](https://astro.build/blog/astro-730/),
[7.0 release](https://astro.build/blog/astro-7/).

## One content source, one responsive site

Use shared homepage data and Markdown/MDX content collections. One homepage
template adapts through CSS; light/dark themes change semantic variables. The
current review prototype reads owner-supplied wording from
`design/studies/home-copy.json`. This is not automatic Penpot synchronization.
[Astro content collections](https://docs.astro.build/en/guides/content-collections/).

Penpot main-component changes can propagate to linked copies unless overrides
intervene. Editing a copy does not update all other copies. Use the main, or
deliberately Update main component from an edited copy. Do not push mobile
geometry into a desktop main accidentally.
[Penpot components](https://help.penpot.app/user-guide/design-systems/components/).

Penpot supplies SVG assets, HTML/CSS snippets and exported design tokens. We
still implement semantic, responsive code components and their behavior. Map
each shared design component to a named code component; keep the SP's screen,
knobs and pads separately addressable. Translate approved tokens into CSS
variables and check both themes. No complete site exporter or two-way live sync
is configured in this project.
[Inspect/export](https://help.penpot.app/user-guide/dev-tools/),
[tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/).

## Delivery and interaction

Serve built HTML through static hosting. The workflow now builds/tests Astro
and uploads only `dist/` to GitHub Pages. `site/` preserves the original blank page.
Cloudflare DNS alone is not Cloudflare hosting. If moving hosting, Cloudflare
Static Assets can serve the output without a Worker script. No migration was
performed; Cloudflare remains the DNS provider. [GitHub Pages](https://docs.astro.build/en/guides/deploy/github/),
[Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/).

Start with normal links, selective intent-based prefetching and brief native
cross-document view transitions where supported. Preserve ordinary navigation
elsewhere and honor reduced motion. Astro's optional ClientRouter is available
if cross-route state or persistent media becomes necessary, but introduces
script-lifecycle work. Do not delay navigation just to play an animation.
[Prefetch](https://docs.astro.build/en/guides/prefetch/),
[transitions](https://docs.astro.build/en/guides/view-transitions/).

Use CSS/SVG animation first. Add a Svelte island only when a walkthrough needs
substantial state, and load it only where used. Pause off-screen motion. Keep
explanatory text usable before JavaScript, self-host the approved fonts and
reserve media dimensions. [Svelte integration](https://docs.astro.build/en/guides/integrations-guide/svelte/).

The reusable [SP display](sp-display.md) uses original pixel frames and a small
framework-independent player, now composed in `SPDisplay.astro` without
hydrating the homepage. Native Penpot geometry feeds `SPPart.astro` and the
shared Instrument wrapper.

Proposed budgets, not achieved results: homepage JavaScript at most 15 KiB gzip,
no content-fetch request before first paint, and no animation-induced layout
shift. Test cold/warm navigation, keyboard focus, history restoration, touch
and animation frame timing on real mobile hardware. Standard good Core Web
Vitals thresholds at the 75th percentile are LCP 2.5s, INP 200ms and CLS 0.1;
aim below them and report measured conditions.
[Web Vitals](https://web.dev/articles/vitals).
