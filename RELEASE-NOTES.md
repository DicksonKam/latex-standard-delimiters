0.4.6 fixes oversized or italicized LaTeX source in Live Preview when Markdown interprets equation rows as headings or emphasis. Commands and standalone equals signs retain normal editor typography and token coloring; surrounding Markdown headings keep their styling.

Two command-palette actions help inspect pasted equations: “Diagnose selected equation” shows exact source, context and MathJax validation; “Preview equation repair” offers an explicit, undoable repair for missing outer bracket delimiter backslashes. Applying a repair requires an unchanged open note and a successful preview. Ordinary rendering does not modify Markdown.

Diagnostics warn about leading square-bracket expressions after aligned/gathered, which MathJax can consume as optional alignment arguments. This is a TeX ambiguity, not a renderer repair: group a literal bracket expression in braces. Corrected matrix examples are included in the repository.

Desktop GitHub/BRAT beta, tested on macOS/Obsidian 1.13.7. Update through BRAT using DicksonKam/latex-standard-delimiters, or replace main.js, manifest.json and styles.css together while preserving data.json. MIT license and upstream attribution are included. Mobile, other operating systems and Community directory submission remain outside this release’s verification scope.
