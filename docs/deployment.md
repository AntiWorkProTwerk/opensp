# Homepage deployment

September 28, 2026. The production homepage uses the approved native Penpot
snapshot, Astro static HTML and the original R3 screen replay. GitHub Actions
builds and tests it before deploying `dist/` to GitHub Pages.

Cloudflare DNS remains unchanged and DNS-only. GitHub's custom-domain certificate
is approved for `opensp.fyi` and `www.opensp.fyi`; HTTPS enforcement is enabled.

Local checks passed: Astro reports no errors, warnings or hints; 21 Playwright
tests pass, including accessibility checks in both themes on desktop/mobile.
The initial build contains 3,063 bytes of JavaScript gzip, including inline
scripts. There is no homepage framework hydration. These are build and browser
lab results, not physical-mobile or real-user measurements.

## Production verification

The homepage deployed through the
[Pages workflow](https://github.com/AntiWorkProTwerk/opensp/actions/workflows/pages.yml).
The live `/build-info.json` matched the deployed revision and local homepage/design
hashes. All 21 Playwright tests also passed against `https://opensp.fyi/`.
Subsequent documentation and repository-privacy changes leave the homepage and
design artifacts unchanged. Use the current build record and workflow run for
the active revision.
HTTP and `https://www.opensp.fyi/` return 301 redirects to the HTTPS apex.
The icon, sitemap, animation assets and custom 404 page load successfully.

Lighthouse 13.5.0 tested the live domain with Headless Chrome 151 on Windows.
Both runs scored 100 for performance, accessibility, best practices and SEO.

| Lab run | FCP | LCP | Blocking time | Layout shift |
| --- | --- | --- | --- | --- |
| Mobile, simulated throttling, 4× CPU slowdown | 1.1 s | 1.1 s | 0 ms | 0 |
| Desktop preset | 0.3 s | 0.3 s | 0 ms | 0 |

The [mobile report](reports/launch-mobile.lighthouse.json) was captured at
2026-09-29 00:07:11 UTC; the [desktop report](reports/launch-desktop.lighthouse.json)
at 00:08:20 UTC (September 28 locally). Both saved reports have no runtime error
or run warnings. The CLI exited with a Windows `EPERM` while removing its
temporary browser directory after saving each report; this cleanup failure is
separate from the recorded audit results. The mobile report still notes GitHub
Pages' cache lifetime and render-blocking/dependency-chain opportunities.
No real-user Core Web Vitals or physical-phone measurements are available.

`/build-info.json` identifies the current deployed revision and artifact hashes.
The [development guide](development.md) documents future releases.
