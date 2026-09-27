# Desktop 0.4.0 completion audit

Status: complete

Local verification: complete

Scope: desktop GitHub/BRAT beta. Mobile and Community directory publication are excluded by owner instruction.

Container support: parser/source projection preserves original document offsets, Markdown prefixes and line boundaries while supplying cleaned TeX to MathJax. The 27 unit tests pass. The expanded 33-assertion actual-app container test passes, including click reveal, visible original source, ArrowUp, selections, clipboard, undo/redo, multiple cursors and Reading View. A real native mouse click also revealed a single equation caret and its editing preview. Native callout selection correction has guards for edits, composition, unrelated selections and unload.

Full editing/compatibility/performance/lifecycle gate: all 239 assertions pass across 17 actual-Obsidian suites on 1.13.7. suite-report.json binds version 0.4.0 and JavaScript/CSS hashes; individual reports were checked against the final JavaScript hash before copying. The clean npm run check passes 27 unit tests, version consistency, type checking and build, with zero lint errors and three documented DOM-creation advisories. Named plugin load orders, rendering ownership, preferences, rapid previews, synthetic composition, multiple panes, native popout, Vim, themes and unload cleanup retain their scoped coverage. The 1,000-equation benchmark restores exact source over 40 edit dispatches (mean 14.71 ms, max 24.50 ms); this is synchronous update cost, not end-to-end keyboard latency.

Desktop/IME inventory: macOS Obsidian 1.13.7 is available. Installed Cangjie was activated but automated input produced Latin text without composition events; os-ime-attempt-report.json explicitly records an unverified real IME result and restored fixture/input source. Windows/Linux evidence remains unavailable and must remain documented. Synthetic composition checks are separate evidence.

Delivery gate: GitHub Checks passed for release commit 52f9cd9b1bc178254f4aec2ba64bb75c0e30d92b (run 36303446677). Release workflow run 36303485518 generated the inspected draft, published as public prerelease 0.4.0. Independent unauthenticated downloads match the verified main.js, manifest.json and styles.css bytes; checksums and ZIP integrity/retained attribution pass (public-release-check-report.json). Local installation/source ZIPs also pass package-release.py integrity/hash checks. Current release notes, changelog, fixtures and actual 0.4.0 screenshot document behavior and limits. Numeric version metadata matches throughout.

BRAT update gate: actual BRAT UI updated the clean disposable vault from public 0.3.1 to 0.4.0. All nine checks pass: runtime version, exact saved preference bytes, loaded custom colors/preview/Off settings, two fixture hashes, installed JS/CSS bytes, manifest fields and re-enable preservation (brat-040-update-report.json). BRAT reformats JSON whitespace; every manifest key/value matches. Historical broken-bundle recovery remains explicitly historical.

Main vault is outside the test workflow. Production contains no note-write APIs; developer tests exercise and restore disposable TestVault fixtures. All explicit milestone deliverables are established by the scoped current evidence above; untested platforms/real IME remain documented as required, without simulated passes.
