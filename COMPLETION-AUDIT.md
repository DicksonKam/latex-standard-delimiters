# Desktop 0.4.0 completion audit

Status: in progress

Local verification: complete

Scope: desktop GitHub/BRAT beta. Mobile and Community directory publication are excluded by owner instruction.

Container support: parser/source projection preserves original document offsets, Markdown prefixes and line boundaries while supplying cleaned TeX to MathJax. The 27 unit tests pass. The expanded 33-assertion actual-app container test passes, including click reveal, visible original source, ArrowUp, selections, clipboard, undo/redo, multiple cursors and Reading View. A real native mouse click also revealed a single equation caret and its editing preview. Native callout selection correction has guards for edits, composition, unrelated selections and unload.

Full editing/compatibility/performance/lifecycle gate: all 239 assertions pass across 17 actual-Obsidian suites on 1.13.7. suite-report.json binds version 0.4.0 and JavaScript/CSS hashes; individual reports were checked against the final JavaScript hash before copying. The clean npm run check passes 27 unit tests, version consistency, type checking and build, with zero lint errors and three documented DOM-creation advisories. Named plugin load orders, rendering ownership, preferences, rapid previews, synthetic composition, multiple panes, native popout, Vim, themes and unload cleanup retain their scoped coverage. The 1,000-equation benchmark restores exact source over 40 edit dispatches (mean 14.71 ms, max 24.50 ms); this is synchronous update cost, not end-to-end keyboard latency.

Desktop/IME inventory: macOS Obsidian 1.13.7 is available. Installed Cangjie was activated but automated input produced Latin text without composition events; os-ime-attempt-report.json explicitly records an unverified real IME result and restored fixture/input source. Windows/Linux evidence remains unavailable and must remain documented. Synthetic composition checks are separate evidence.

Delivery gate: version-bound reports, current documentation/examples, local packaging, GitHub CI, public 0.4.0 release and independent downloadable-asset checksum verification remain pending. Historical BRAT upgrade/recovery reports do not establish a 0.4.0 upgrade.

Main vault is outside the test workflow. Production contains no note-write APIs; developer tests exercise and restore disposable TestVault fixtures. The goal remains active until current evidence establishes all required deliverables.
