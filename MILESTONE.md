# 0.4.0 — dependable desktop editing (in progress)

1. List/callout multiline displays: implementation and 27 unit tests pass; actual-app container probe renders both and preserves source. All 33 expanded container editing checks pass; real native mouse click verified.
2. Editing audit: selection, source visibility, multiple cursors, clipboard, undo/redo, malformed input and rapid previews pass in the final candidate-bound suite.
3. Coexistence/performance/lifecycle: 239 actual-app assertions across 17 suites pass on the final binary, including named plugins, large-note edits, panes/popout and cleanup.
4. Desktop/IME facilities: macOS Obsidian 1.13.7 and installed Cangjie input method identified. Automated Cangjie attempt did not produce real composition; retain that unverified limit. Windows/Linux desktop evidence unavailable so far.
5. Delivery: update version-bound reports, examples and known limits; publish verified 0.4.0 GitHub assets and confirm checksums. No candidate has been published.

Production must not write Markdown or change other plugins’ settings. Tests run in disposable TestVault fixtures. Main vault is outside the test workflow. Mobile and Community directory publication are out of scope. Completion must be established by current evidence, not this checklist.
