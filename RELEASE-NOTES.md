0.4.7 fixes excess vertical space around multiline display equations in Live Preview lists, quotes and indented blocks. Hidden TeX rows no longer retain editor line height; original Markdown prefixes and source bytes remain intact.

Editable equation source retains normal text size without Markdown heading dividers or fold indicators, including matrices with a standalone equals sign and lines ending in Markdown hard-break spaces. Ordinary surrounding headings retain their styling.

Up/Down navigation enters equations when movement lands on list indentation, including displays with prose after the closing delimiter. Regression checks cover nested and ordered lists, tasks, callouts, blank rows, surrounding prose, source preservation and Minimal heading dividers.

Desktop GitHub/BRAT beta, tested on macOS/Obsidian 1.13.7. Update through BRAT using DicksonKam/latex-standard-delimiters, or replace main.js, manifest.json and styles.css together while preserving data.json. Reload the plugin after replacing files; the running plugin can otherwise retain an older version and stylesheet. Mobile, other operating systems and Community directory submission remain outside this release’s verification scope.
