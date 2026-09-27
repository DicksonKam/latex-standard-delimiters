Beta 0.4.0 adds multiline display equations inside Markdown lists and callouts. The plugin preserves your original standard delimiters, Markdown prefixes and note text. Click an equation to edit its colored source with an updating MathJax preview; Up/Down enters standalone display equations.

This release fixes native callout source reveal and caret selection. Container regression checks cover raw copy/paste, undo/redo, selections, multiple cursors, navigation and Reading View. The final binary passed 27 unit tests and 239 actual-Obsidian assertions across 17 suites. Verification scope and downloadable-asset evidence are recorded in VERIFICATION.md and the release reports.

Desktop GitHub/BRAT beta, tested on macOS with Obsidian 1.13.7. Windows/Linux and real OS IME composition remain unverified. Container continuation lines retain their layout, so spacing can differ from native dollar math. Named-plugin coexistence checks have a documented scope; universal compatibility is not claimed. Mobile and Community Plugins listing are outside scope.

Install or update using BRAT, repository DicksonKam/latex-standard-delimiters. For manual installation, use main.js, manifest.json and styles.css from the same release and preserve data.json. The original MIT license and author attribution remain included.
