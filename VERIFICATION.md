# Verification — 0.4.0

Desktop GitHub beta candidate, tested on macOS in Obsidian 1.13.7 using a disposable TestVault. Mobile and Community directory publication are outside scope. Production does not write Markdown or change another plugin’s settings. Developer scripts intentionally exercise and restore disposable fixtures/preferences.

npm run check passes 27 unit tests, version consistency, TypeScript and build, with zero lint errors and three owner-document DOM creation advisories. The final actual-app suite records 239 passing assertions across 17 suites. suite-report.json records host/version and binds the JavaScript/CSS hashes to the run. Container editing checks cover list/callout rendering, original source visibility, selection, previews, typing, undo/redo, ArrowUp and Reading View. Variant checks include ordered-list continuations, nested quotes and quoted lists.

The existing suites recheck native math, comments/malformed delimiters, selections/multiple cursors, clipboard, undo/redo, rapid preview updates, composition lifecycle, rendering ownership, panes/popouts, embeds, reload/unload cleanup, Vim, named math plugins, preferences, themes and source preservation. Synthetic pointer/composition events are explicitly synthetic.

Source projection removes only recognized container prefixes from the TeX sent to MathJax. Editor replacement ranges preserve Markdown prefixes and line boundaries, while colors map back to original source spans. Native inactive callout bodies use source recovery through the attached editor widget. Ambiguous DOM source mappings remain literal; unrecognized container syntax is retained in projected TeX rather than silently stripped. Container continuation lines remain in the editor layout, so their spacing can differ from native dollar display math.

## Performance

The final candidate benchmark used 76,780 characters and 1,000 equations, with 40 insertion/deletion dispatches. Mean 14.71 ms; maximum 24.50 ms. These are synchronous dispatch/decoration/viewport-DOM measurements on this machine, not end-to-end keyboard latency or full-document typesetting. Exact source was restored and one active preview remained. Minimal stylesheet/narrow-pane checks cover light/dark classes and horizontally scrolling long previews; they do not certify every theme or custom color’s contrast.

## Desktop and IME evidence

Windows/Linux desktop Obsidian evidence remains unavailable. The installed Cangjie method was activated, but the automation keypress inserted Latin text without any composition events. That attempt does not prove real IME composition support. The fixture and ABC keyboard source were restored; os-ime-attempt-report.json records the observations. Synthetic composition lifecycle checks pass separately. See DESKTOP-TESTING.md for a manual real-input procedure.

## Compatibility limits

Extended MathJax 0.4.1 shared macros/chemistry and both load orders pass. Quick Latex 2.6.5 native-dollar helpers coexist; standard-delimiter snippets are not added. SwiftLaTeX 0.6.0 engine initialization/coexistence is checked with a loopback-only package endpoint, without full PDF/SVG compilation. Upstream renderer 1.0.4 handoff passes for its known ID; arbitrary competing renderers are not universally detected. Vim normal-mode visibility uses an observed host DOM convention; arbitrary mappings/macros remain unverified.

Inline math remains single-line. Coloring is a tokenizer, not a TeX compiler. Exporters bypassing Obsidian’s rendered DOM do not automatically support standard delimiters. Older hosts than 1.13.7, arbitrary Markdown extensions and universal stability are not certified.

## Updates

Historical BRAT install/upgrade/recovery evidence is in brat-update-report.json and brat-recovery-report.json: public 0.3.0 → 0.3.1 preserved nondefault preferences and fixture bytes; a broken local bundle was recovered through a version rollback, then Latest. This is historical recovery evidence, not a claimed 0.4.0 upgrade test. Keep data.json when replacing plugin files, and use files from one release. See UPDATING.md.

Public 0.4.0 assets were independently downloaded and match the tested JavaScript, manifest and CSS exactly; checksums and ZIP/license attribution pass (public-release-check-report.json). Actual BRAT 1.3.0 updated the clean disposable vault from 0.3.1 to 0.4.0, preserving saved preference bytes, loaded custom colors/preview/Off settings, and both fixture notes after re-enable. BRAT reformats manifest JSON; every parsed field remains identical. See brat-040-update-report.json.
