# First guide source ledger

Local evidence paths below refer to the adjacent research workspace. That
workspace is not part of the deployed website. Publish curated evidence rather
than copying research logs or full decompilation exports into the public repo.

| Claim | Source | Scope |
| --- | --- | --- |
| Research began September 15 with public firmware packages | `../sp404mk2/STORY.md`, sections 2–4; `firmware/v552/manifest.json` in that workspace | Preserved chronology and download manifest |
| APP0 and APP1 were preserved and hashed | Same manifest | Original local artifacts, not device readback |
| Runtime memory differs from the BIN's layout | `analysis/v552/memory_map.json`; `STORY.md`, section 3 | Static startup analysis, with CPU verification documented in the narrative |
| First full IDA export: 8,592 of 8,593 candidates | `analysis/v552/ida/full_export_summary.json` | Export statistics, not recovered original source |
| Utility title reaches a drawing call | `analysis/v552/ida/all_pseudocode.c`, `sub_8013E8B0`, lines 378110–378127 | Genuine excerpt; original inferred names retained |
| Original diagnostic monitor was built but not installed at this milestone | `STORY.md`, sections 7–8 | Offline work; no hardware result |
| Twelve title bytes changed; image size and APP0 unchanged | `custom_firmware/build/sd_poc/manifest.json` | Build-time result |
| Six menu selections, original and modified, passed twelve CPU cases | `custom_firmware/build/sd_poc/verification.json` | Instruction-level tests, not physical UI coverage |
| Owner reported the first visible result on September 22 | `custom_firmware/HARDWARE_RESULT.md` | Owner report; no independent screen capture or installed-image readback |

The exact owner reply was "it wokred". Preserve that spelling if quoted. The
provided candidate APP1 SHA-256 is
`1ed1cc8222ad7e92997b6f874cd3b3ed4fadf7b36bb10f27b9ba5111e3441c34`.
This identifies the supplied local file, not bytes read back from the instrument.

The later `PAD INFO R2!` and `ASCII SPIN3!` reports must not be used as evidence
for this earlier test. Its historical `UNVERIFIED` package name records the
pre-device-test state and is not silently relabeled.

## Public references

[Roland's update index](https://www.roland.com/global/support/by_product/sp-404mk2/updates_drivers/)
links to the official system program. The article describes the v5.52 snapshot
used in this project, without calling it the current release forever.

The [Teenage Engineering EP-133 guide](https://teenage.engineering/guides/ep-133)
remains a layout reference for concise sections, navigable contents and
instrument-led explanation. No TE fonts or artwork are copied.
