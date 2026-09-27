# Releases and updates

Use Node 24 and npm ci. Run npm run check. Before a beta release, exercise the changed behavior in a disposable Obsidian vault, update VERIFICATION.md and compatibility evidence, and record outstanding platform checks honestly. GitHub CI runs static checks and unit tests; it cannot replace the actual-app suite.

Update package.json, package-lock.json, manifest.json, versions.json, CHANGELOG.md and RELEASE-NOTES.md together. Commit to main, wait for Checks to pass, then push a numeric tag matching manifest.version exactly, such as 0.3.1 (no v prefix). The Release workflow repeats checks, validates the tag, builds from the lockfile and creates a draft marked as a pre-release with main.js, manifest.json, styles.css, checksums and a ZIP. Review the draft assets before publishing. Never move published tags or replace published release assets; fix problems in a new version. To retry a failed draft creation, inspect/delete only the incomplete draft and rerun its workflow.

BRAT beta users can receive updates from published GitHub releases. Manual installations require replacing the three plugin files from the same release; preserve data.json. Distribution targets GitHub Releases and BRAT. Community Plugins submission and mobile certification are outside the current scope.
