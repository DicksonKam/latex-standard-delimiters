0.4.1 fixes the reported callout rendering bugs. Aligned equations with underbrace subscripts now render correctly: internal source-mapping markers no longer interfere with Markdown underscore parsing. Native callout widgets trigger rendering when inserted, removing the two-second polling delay.

The regression fixture includes the aligned Euler equation with even/odd underbraces and the multiline align corollary. Concurrent embedded passes are deduplicated, and ambiguous partial source mappings remain literal. Source remains unchanged.

Verified with 28 unit tests and 258 actual-Obsidian assertions in 18 suites. Four warm callout mounts took 49–71 ms on the tested machine, including note opening and Markdown/MathJax work; this is not a guarantee for every device. Verification scope and measured warm-mount times are recorded in euler-callout-report.json and VERIFICATION.md.

Desktop GitHub/BRAT beta, tested on macOS/Obsidian 1.13.7. Windows/Linux and real OS IME composition remain unverified. Update through BRAT, repository DicksonKam/latex-standard-delimiters, or replace main.js, manifest.json and styles.css from this release while preserving data.json. Retained MIT license and upstream attribution are included.
