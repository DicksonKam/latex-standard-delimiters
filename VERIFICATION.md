# Verification — 0.4.6

The candidate passes npm run check: 47 tests including 7,000 deterministic generated inputs, version consistency, TypeScript and build; lint has zero errors and four existing DOM-creation warnings. Actual macOS/Obsidian 1.13.7 checks in disposable TestVault pass 26 diagnostic/repair assertions, five trusted native command-palette/Apply/undo assertions 23 computed source-typography assertions and 22 matrix comparisons with independent required-glyph/operator checks. The four new reports bind to the candidate main.js hash. They cover editor/disk preservation, stale proposals, MathJax errors, code exclusions and dialog unload. The prior candidate reproduces seven typography failures in source-typography-baseline-report.json; the fixed candidate passes. This is a pre-fix candidate baseline, not a new released-build baseline. Matrix fixtures group the leading bracket expression to avoid the optional-argument ambiguity, and independently require its brackets and bold r. The original raw-bracket source triggers a diagnostic warning and is left unchanged.

The full 0.4.6 release gates were refreshed on October 5, 2026: 18 runtime suites (258 assertions), six stress suites (1,943 assertions), nine trusted daily keyboard checks, six trusted cross-section checks, eight trusted queued-popout closure checks and 20 large-note refresh/scroll checks all pass against the current bundle. Six visible refresh samples averaged 165.1 ms, maximum 205.8 ms on this Mac. The source typography, matrix and diagnostic reports add 76 focused assertions. Counts include repetitions and certify only the named scenarios. The main vault remains on 0.4.5; tests and candidate installation are confined to disposable TestVault. Rendering semantics are unchanged; explicit Apply is the only new note-writing action.

The scripted popout test reproduced an in-memory edit that did not autosave; activating the editor and using its public API did not resolve that harness behavior. reading-revision-popout-first-attempt-report.json preserves the initial failure. The release gate now requires trusted native keyboard input followed by immediate queued popout closure and exact disk persistence, which passed. The scripted variant writes a separate report and cannot satisfy that gate. SwiftLaTeX startup fetches the public TeX Live package index even with the loopback TeX-package endpoint.

The following 0.4.5 evidence is historical; current 0.4.6 counts and timings above supersede it.

Public 0.4.6 was published after both GitHub workflows passed. All eight independent unauthenticated public-asset checks pass: JavaScript/manifest/CSS byte equality, checksum verification, ZIP integrity/attribution and desktop release identity. The release tag points to the tested 5693542 implementation.

# Verification — 0.4.5

Desktop GitHub beta, tested on macOS in Obsidian 1.13.7 using a disposable TestVault. Mobile and Community directory publication are outside scope. Production does not write Markdown or change another plugin’s settings. Developer scripts intentionally exercise and restore disposable fixtures/preferences.

npm run check passes 35 tests including 7,000 seeded inputs, version consistency, TypeScript and build, with zero lint errors and four DOM creation advisories. The current build passes 18 runtime suites (258 assertions), six stress suites (1,943 assertions), nine trusted daily keyboard checks and six trusted cross-section keyboard checks. Counts include repetitions; they are evidence for the named scenarios, not a comprehensive daily-use guarantee. Reports identify the tested bundle hash.

The public 0.4.4 baseline reproduces a stale Reading View equation after editing its closing paragraph. Current semantic regressions cover opening/middle/closing edits, operators/commands, delimiter removal/recovery, undo/redo, rapid and external updates, multiple panes, mixed inline/display content and disable/re-enable without reopening. The 200-paragraph refresh probe passes source preservation, scroll stability and three repeated offscreen returns; six visible updates averaged 151.9 ms, maximum 159.3 ms on this Mac. Two consecutive queued-popout-close probes passed, including natural disk persistence. These timings use scripted editor changes, not OS input latency. Native typing/undo/redo is checked separately.

The existing suites recheck native math, comments/malformed delimiters, selections/multiple cursors, clipboard, undo/redo, rapid preview updates, composition lifecycle, rendering ownership, panes/popouts, embeds, reload/unload cleanup, Vim, named math plugins, preferences, themes and source preservation. Synthetic pointer/composition events are explicitly synthetic.

Source projection removes only recognized container prefixes from the TeX sent to MathJax. Editor replacement ranges preserve Markdown prefixes and line boundaries, while colors map back to original source spans. Native inactive callout bodies use source recovery through the attached editor widget. Ambiguous DOM source mappings remain literal; unrecognized container syntax is retained in projected TeX rather than silently stripped. Container continuation lines remain in the editor layout, so their spacing can differ from native dollar display math.

## Performance

The 0.4.4 benchmark used 76,780 characters and 1,000 equations, with 40 insertion/deletion dispatches. Mean 16.27 ms; maximum 39.90 ms. These are synchronous dispatch/decoration/viewport-DOM measurements on this machine, not end-to-end keyboard latency or full-document typesetting. Exact source was restored and one active preview remained. Minimal stylesheet/narrow-pane checks cover light/dark classes and horizontally scrolling long previews; they do not certify every theme or custom color’s contrast.

The original Euler callout regression still passes on the optimized binary. New stress evidence covers 40 adversarial cases across 240 settled mounts, 30 rapid lifecycle/view-switch rounds with 10 reload races, 1,000 edit dispatches and dense callouts. The 0.4.1 baseline (stress-volume-041-baseline-report.json) measured 250 equations at 10.11 s in Live Preview and 20.16 s in Reading View. Historical 0.4.4 measured 406.6 ms and 800.0 ms respectively; correctness and a warm 2.5-second regression limit passed at 25, 100 and 250 equations. These are local warm mount/typesetting times, not guarantees for every device or cold engine initialization. Source equality for CRLF uses a plugin-disabled control proving the host normalizes line endings on save. No captured uncaught lifecycle/rendering errors occurred. Embedded-child counts are observations, not proof of absence of memory leaks. See STRESS-TESTING.md.

## Desktop and IME evidence

Windows/Linux desktop Obsidian evidence remains unavailable. The installed Cangjie method was activated, but the automation keypress inserted Latin text without any composition events. That attempt does not prove real IME composition support. The fixture and ABC keyboard source were restored; os-ime-attempt-report.json records the observations. Synthetic composition lifecycle checks pass separately. See DESKTOP-TESTING.md for a manual real-input procedure.

## Compatibility limits

Extended MathJax 0.4.1 shared macros/chemistry and both load orders pass. Quick Latex 2.6.5 native-dollar helpers coexist; standard-delimiter snippets are not added. SwiftLaTeX 0.6.0 engine initialization/coexistence is checked with a loopback-only package endpoint, without full PDF/SVG compilation. Upstream renderer 1.0.4 handoff passes for its known ID; arbitrary competing renderers are not universally detected. Vim normal-mode visibility uses an observed host DOM convention; arbitrary mappings/macros remain unverified.

Inline math remains single-line. Coloring is a tokenizer, not a TeX compiler. Exporters bypassing Obsidian’s rendered DOM do not automatically support standard delimiters. Older hosts than 1.13.7, arbitrary Markdown extensions and universal stability are not certified.

## Updates

Historical BRAT install/upgrade/recovery evidence is in brat-update-report.json and brat-recovery-report.json: public 0.3.0 → 0.3.1 preserved nondefault preferences and fixture bytes; a broken local bundle was recovered through a version rollback, then Latest. This is historical recovery evidence, not a claimed 0.4.0 upgrade test. Keep data.json when replacing plugin files, and use files from one release. See UPDATING.md.

Historical public 0.4.4 assets were independently downloaded and compared byte-for-byte with the tested build. All eight checksum/ZIP/attribution/manifest checks pass in public-release-check-report.json. GitHub release packaging validates current hash-bound runtime, stress and native keyboard evidence. BRAT update/recovery reports retain their historical tested versions; a 0.4.4 patch update has not been separately exercised through BRAT UI.

The 565-assertion boundary suite checks 31 layouts twice across both views, active/inactive numeric identities, exact source and paragraph text restoration on unload. Cross-section rendering uses exact source-bound mounted sections and ignores only template-level paragraph separator whitespace. Per-text-fragment replacement preserves parent structures. Both ends must mount during a bounded retry period. A view-owned coordinator restores cached remounted sections; three return-from-offscreen cycles pass. Arbitrarily long equations whose ends never mount together remain unverified and may stay literal.

Public 0.4.5 assets were independently downloaded after publication and match the tested build byte for byte. All eight public-asset checks pass. The current requirement audit is complete; remaining platform/input/plugin limits above remain explicit.

## Historical local equation layout candidate — 2026-10-11

The local candidate passes 47 unit tests (including the existing 7,000 seeded inputs), lint with four existing warnings, typechecking and build. Actual Obsidian 1.13.7 tests pass 102 layout checks plus 103 existing container, navigation and typography checks. Real Up/Down input also enters the compact list equation with source preserved. The exact list example has a 27px gap between the rendered display and following text in Reading View.

The main vault was still running 0.4.5 despite its 0.4.6 folder on disk. After backing up and updating only plugin files and reloading its manifests, the existing note’s equals row and token both measure 16px, matching editor text; the heading border measures 0px and source remains unchanged. Appearance settings were not changed. The candidate is installed locally but has not been published.

Evidence: `validation/equation-layout-2026-10-11.json`. The first callout harness attempt lacked document focus; the focused run passes. The initial Reading View geometry assertion used the paragraph bounds, which included the equation itself; the corrected text-range measurement passes. Duplicate native-event listener records are retained and explicitly do not count as additional tests. Full release gates and mobile certification remain outside this patch verification.

## 0.4.7 release verification — 2026-10-11

The versioned 0.4.7 candidate passes 47 unit tests, lint/typecheck/build, 18 runtime suites (258 checks), six stress suites (1,943 checks), 102 equation layout checks, 26 repair diagnostics, 22 matrix checks, 23 typography checks and 20 reading performance checks. Native keyboard (9), split-pane editing (6), queued popout closure (8), repair/undo (5) and list Up/Down (2 trusted events) also pass. Reports bind the tested bundle and, where applicable, stylesheet hashes; packaging requires current evidence including the new layout suite.

The first runtime attempt failed SwiftLaTeX startup amid core database errors. Reloading TestVault cleared those errors; SwiftLaTeX startup/coexistence passed on retry. Stress initially began during vault indexing and the incremental autosave/refresh checks failed; the focused repeat passed without source forcing. First-attempt failures remain in validation. A reused native keyboard fixture restored its prior caret after opening; explicitly resetting its starting caret yielded nine passing checks, and setup now waits for host selection restoration. These are verification environment corrections, not silent relabeling of failed evidence. Mobile and other operating systems remain unverified.

Public 0.4.7 was published after Checks #23 and Release #11 succeeded for dbb8250. Independent unauthenticated downloads pass eight asset checks in public-release-check-report.json. The installed files in both vaults match the public candidate; both running manifests report 0.4.7. Main-vault source and plugin preferences remain unchanged after reload.
