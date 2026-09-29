# Penpot overview

[opensp-all-pages.png](opensp-all-pages.png) is one high-resolution overview of
all six visible Penpot pages. It includes the homepage, desktop concepts, mobile
layouts, responsive comparisons, SP components and the design system. Hidden
archive layers are excluded. Page layouts and artwork are preserved; labels and
spacing between pages belong to this overview only.
The September 28, 2026 export is 8,000×13,314 pixels and contains 32 visible
top-level items, including the imported multi-layout sheets.
It predates the owner's later homepage copy edits. Keep it as that checkpoint;
refresh from a new source directory to capture the current homepage.

The adjacent HTML is self-contained, including the native SVG exports and the
approved fonts. The JSON manifest records source page/shape IDs and dimensions.
The smaller preview PNG is for quick inspection. None of these files changes
the Penpot canvas or replaces its editable components.

To refresh from the connected OpenSP file:

```powershell
node tools/export-penpot-overview.mjs C:/path/to/fresh-export-directory
python tools/build-penpot-overview.py C:/path/to/fresh-export-directory --browser C:/path/to/chrome.exe
```

Use a fresh export directory after design changes. The export helper resumes
existing SVG files, so reusing an old directory can preserve stale artwork.
The build uses Chromium to render the original vectors into one PNG. It does
not enlarge low-resolution screenshots or generate replacement artwork.
