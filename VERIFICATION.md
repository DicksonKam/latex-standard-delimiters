# Verification — 0.4.4

Desktop GitHub beta, tested on macOS in Obsidian 1.13.7 using a disposable TestVault. Mobile and Community directory publication are outside scope. Production does not write Markdown or change another plugin’s settings. Developer scripts intentionally exercise and restore disposable fixtures/preferences.

npm run check passes 35 unit tests including 7,000 seeded generated inputs, version consistency, TypeScript and build, with zero lint errors and four owner-document DOM creation advisories. The final 18-suite runtime run passes all 258 assertions and the five stress suites pass 1,749 more, totaling 2,007 assertions, with nine additional trusted native keyboard/paste/undo checks passing. The daily suite verifies actual numeric glyph identities across edits, undo, structure moves, folding and two-pane updates. These native checks cover the recorded macOS sequence, not every platform or IME. The production bundle and CSS hashes are recorded in suite-report.json. The added Euler suite checks aligned underbrace subscripts and the align corollary inside callouts, four warm mount times, Reading View and exact fixture preservation.

The existing suites recheck native math, comments/malformed delimiters, selections/multiple cursors, clipboard, undo/redo, rapid preview updates, composition lifecycle, rendering ownership, panes/popouts, embeds, reload/unload cleanup, Vim, named math plugins, preferences, themes and source preservation. Synthetic pointer/composition events are explicitly synthetic.

Source projection removes only recognized container prefixes from the TeX sent to MathJax. Editor replacement ranges preserve Markdown prefixes and line boundaries, while colors map back to original source spans. Native inactive callout bodies use source recovery through the attached editor widget. Ambiguous DOM source mappings remain literal; unrecognized container syntax is retained in projected TeX rather than silently stripped. Container continuation lines remain in the editor layout, so their spacing can differ from native dollar display math.

## Performance

The final candidate benchmark used 76,780 characters and 1,000 equations, with 40 insertion/deletion dispatches. Mean 16.27 ms; maximum 39.90 ms. These are synchronous dispatch/decoration/viewport-DOM measurements on this machine, not end-to-end keyboard latency or full-document typesetting. Exact source was restored and one active preview remained. Minimal stylesheet/narrow-pane checks cover light/dark classes and horizontally scrolling long previews; they do not certify every theme or custom color’s contrast.

The original Euler callout regression still passes on the optimized binary. New stress evidence covers 40 adversarial cases across 240 settled mounts, 30 rapid lifecycle/view-switch rounds with 10 reload races, 1,000 edit dispatches and dense callouts. The 0.4.1 baseline (stress-volume-041-baseline-report.json) measured 250 equations at 10.11 s in Live Preview and 20.16 s in Reading View. Final 0.4.4 measured 406.6 ms and 800.0 ms respectively; correctness and a warm 2.5-second regression limit passed at 25, 100 and 250 equations. These are local warm mount/typesetting times, not guarantees for every device or cold engine initialization. Source equality for CRLF uses a plugin-disabled control proving the host normalizes line endings on save. No captured uncaught lifecycle/rendering errors occurred. Embedded-child counts are observations, not proof of absence of memory leaks. See STRESS-TESTING.md.

## Desktop and IME evidence

Windows/Linux desktop Obsidian evidence remains unavailable. The installed Cangjie method was activated, but the automation keypress inserted Latin text without any composition events. That attempt does not prove real IME composition support. The fixture and ABC keyboard source were restored; os-ime-attempt-report.json records the observations. Synthetic composition lifecycle checks pass separately. See DESKTOP-TESTING.md for a manual real-input procedure.

## Compatibility limits

Extended MathJax 0.4.1 shared macros/chemistry and both load orders pass. Quick Latex 2.6.5 native-dollar helpers coexist; standard-delimiter snippets are not added. SwiftLaTeX 0.6.0 engine initialization/coexistence is checked with a loopback-only package endpoint, without full PDF/SVG compilation. Upstream renderer 1.0.4 handoff passes for its known ID; arbitrary competing renderers are not universally detected. Vim normal-mode visibility uses an observed host DOM convention; arbitrary mappings/macros remain unverified.

Inline math remains single-line. Coloring is a tokenizer, not a TeX compiler. Exporters bypassing Obsidian’s rendered DOM do not automatically support standard delimiters. Older hosts than 1.13.7, arbitrary Markdown extensions and universal stability are not certified.

## Updates

Historical BRAT install/upgrade/recovery evidence is in brat-update-report.json and brat-recovery-report.json: public 0.3.0 → 0.3.1 preserved nondefault preferences and fixture bytes; a broken local bundle was recovered through a version rollback, then Latest. This is historical recovery evidence, not a claimed 0.4.0 upgrade test. Keep data.json when replacing plugin files, and use files from one release. See UPDATING.md.

Public 0.4.4 assets were independently downloaded and compared byte-for-byte with the tested build. All eight checksum/ZIP/attribution/manifest checks pass in public-release-check-report.json. GitHub release packaging validates current hash-bound runtime, stress and native keyboard evidence. BRAT update/recovery reports retain their historical tested versions; a 0.4.4 patch update has not been separately exercised through BRAT UI.

The 565-assertion boundary suite checks 31 layouts twice across both views, active/inactive numeric identities, exact source and paragraph text restoration on unload. Cross-section rendering uses exact source-bound mounted sections and ignores only template-level paragraph separator whitespace. Per-text-fragment replacement preserves parent structures. Both ends must mount during a bounded retry period; long offscreen/virtualized equations remain unverified and may stay literal.
