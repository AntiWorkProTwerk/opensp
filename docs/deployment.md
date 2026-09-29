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

Production verification will record the deployed commit, Actions result and
live-domain checks here. `/build-info.json` identifies the deployed revision
and hashes. The [development guide](development.md) documents future releases.
