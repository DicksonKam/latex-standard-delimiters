# Public-beta candidate milestone — completed

1. Parser/highlighter audit: 19 regression tests plus runtime comments, malformed math and Markdown-container checks. Fixed escaped runs, comment closers, incomplete recovery, frontmatter and scalable delimiters.
2. Editing/navigation: 36 navigation and seven live-update checks; audit covers raw clipboard, undo/redo, delimiter deletion, selection and multi-cursors. Preview toggle persists.
3. Compatibility: Extended MathJax both load orders and Quick Latex checked; dynamic upstream-ID guard pauses and resumes without disabling other plugins. Built-in light/dark checked. Untested combinations are explicit in VERIFICATION.md.
4. Performance/lifecycle: measured 100/500/1000-equation documents; escape scanning and document analysis cached. Runtime verifies source preservation, conflict restoration, reload and unload cleanup.
5. Delivery: final 0.2.0 binary has matching suite SHA256 and 118 passing actual-app checks. Release/source archives include reproducible fixtures/scripts and evidence. Main vault unchanged; external publication outside scope.
