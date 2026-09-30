# Guide series source ledger

The series continues [the first-change guide](../src/content/guides/first-change.mdx),
whose [separate ledger](first-guide-sources.md) records the menu-title experiment.
The sixteen chapters below cover the later display, input, USB, audio and SDK
milestones, followed by research still in progress on September 29, 2026.

Each chapter's JSON is the shared copy source for its responsive page, Penpot
posters and curated evidence section. Its `sources` entries retain the full
record list and the scope of each claim. The table names a focused starting
record, not every test behind a chapter.

## Coverage map

Record paths in code refer to the adjacent `sp404mk2` research workspace unless
another workspace is named. They are identifiers, not website download links.
The private reports, raw captures and firmware images are not published with
these guides. The chapter links below point to files in this repository.

| Chapter source | Coverage and evidence boundary | Focused retained record |
| --- | --- | --- |
| [Pad information](../src/content/journey/pad-information.json) | R1's missed route, R2 correction and owner-confirmed panel; separate from the wrong-build incident. | `custom_firmware/pad_info_r2/HARDWARE_RESULT.md` |
| [First animation](../src/content/journey/first-animation.json) | R3's owned phase and redraw path; original renderer trace plus owner report, without measured device timing. | `custom_firmware/spin_r3/HARDWARE_RESULT.md` |
| [Verified capture](../src/content/journey/verified-capture.json) | R4 task failure, R5 stack correction and checked capture; integrity does not identify its producing build. | `analysis/hardware/boot_r5_7f91251c2edd/README.md` |
| [Original boot](../src/content/journey/original-boot.json) | R6's delayed screen and R7's startup, SHIFT and shutdown observations; stock resident/APP0 retained. | `custom_firmware/original_r7/HARDWARE_RESULT.md` |
| [Mapping controls](../src/content/journey/mapping-controls.json) | Owner-labeled takes, the corrected checklist and DEL aliases; pressure and encoder calibration remain open. | `analysis/hardware/r12b_completed_20260922/README.md` |
| [Named inputs](../src/content/journey/named-inputs.json) | Compiled replay, live identity and endpoint measurements; improved event delay did not resolve reported knob feel. | `analysis/hardware/knob_r15_return_20260922T235004Z/README.md` |
| [USB updates](../src/content/journey/usb-updates.json) | R9 RAM verification through R11 flash/readback and reboot identity; each establishes a different stage. | `custom_firmware/original_r11/HARDWARE_RESULT.md` |
| [Keeping the updater](../src/content/journey/keeping-the-updater.json) | Full-size R16B update and B1's retained writer; neither establishes independent resident recovery. | `analysis/hardware/usb_b1_a1_20260924T0442Z/README.md` |
| [Partial update](../src/content/journey/partial-update.json) | R30's interrupted APP1 write and recovery to R27; corrected Writer B remains an offline result. | `analysis/hardware/provider_r30_20260925/README.md` |
| [RAM loader](../src/content/journey/ram-loader.json) | R37 upload, execution, reset and updater return; one bounded original program, not cold-boot recovery. | `analysis/hardware/loader_r37/README.md` |
| [Finding audio](../src/content/journey/finding-audio.json) | Fixed RX patterns, invalid comparisons and owner-reported A1 correlation; activity alone is not sound. | `custom_firmware/audio_tap_a1/HARDWARE_RESULT.md` |
| [Audio stream](../src/content/journey/audio-stream.json) | R38 through R41 and the false-timeout correction; sustained silent streaming does not establish audibility. | `analysis/hardware/audio_r41_20260926T191908Z/README.md` |
| [Original SDK](../src/content/journey/original-sdk.json) | Isolated original TX/RX code and compiled tests; no released SDK or physical audio qualification. | `sdk/build/standalone_verification.json` |
| [Bootloader boundaries](../src/content/journey/bootloader-boundaries.json) | Offline update and interruption models; independent entry and full resident restore remain unverified. | `RECOVERY_QUALIFICATION.md` |
| [Pitch correction](../src/content/journey/pitch-correction.json) | Original DSP tests and synthetic algorithm comparisons; no live SP effect. | `sp404mk2-autotune/evidence/at2_research/README.md` in the adjacent autotune workspace |
| [Synth design](../src/content/journey/synth-design.json) | Penpot concepts and bounded stock CPU contracts; no installable synth or device-audio result. | `sp404mk2-synth/docs/STOCK_INTEGRATION.md` in the adjacent synth workspace |

## Evidence and chronology

Use the focused record for the claim being edited:

1. Hardware-result reports and their linked captures establish the recorded
   device observation. Attribute owner reports to the owner; a supplied-package
   hash is not an installed-image readback.
2. Frozen manifests and verification reports establish the exact build and
   bounded test result. Preserve their original pre-device-test status and link
   later hardware evidence separately.
3. Version-scoped implementation contracts explain how a result was obtained.
   Read their test limitations before translating an implementation into a claim.
4. `STORY.md`, `DOCUMENTATION.md` and `RESEARCH_NOTE.md` orient further work.
   They do not override a focused report with a broader success statement.

When records conflict, return to the cited artifact or capture and resolve the
conflict explicitly. A later success does not erase an earlier failed build,
missed measurement or corrected owner observation. Historical chapters describe
their milestone; research chapters describe a dated, incomplete investigation.
Neither should imply that every past candidate is a current release.

## Publication limits and checks

The Python exercises use invented in-memory data and standard-library code.
They accept no device, network or firmware input and write no files. Their
assertions and exact expected outputs reproduce small engineering checks, not
installation procedures. The site supplies no firmware downloads, flash commands,
security-bypass instructions or exploit reproduction.

Timeline screens are schematic. R3 alone replays the preserved original renderer
frames, with stock UI omissions and the unmeasured 50 ms preview interval stated
beside playback. Browser animation is not hardware footage or a live test.

`tools/check-journey.mjs` checks the chapter schema, route metadata, publication
privacy patterns and exercise output. Its optional local-source check confirms
that retained record paths exist; it does not verify the truth of every claim.
Factual review still compares the prose with the cited evidence.
