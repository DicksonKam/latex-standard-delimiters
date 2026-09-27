# Contributing

Use Node 24, npm ci and npm run check. Keep Obsidian and CodeMirror imports external to the plugin bundle. Do not rewrite notes to implement rendering. Use a disposable vault for integration checks; developer scripts intentionally manipulate fixture editors and plugin settings. Never run them against a personal vault.

Report bugs through the issue template, with a minimal invented Markdown example and relevant versions. Compatibility claims should name the plugin versions and behaviors actually checked. Synthetic composition and narrow desktop panes do not establish real IME/mobile support.

Follow RELEASING.md for beta releases. Release assets must all come from the same version. Published tags/assets must remain unchanged. Actual-app verification and device evidence are separate from GitHub CI.
