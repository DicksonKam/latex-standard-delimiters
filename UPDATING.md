# Updates and recovery

## Normal beta updates

Install BRAT 1.1.0 or newer, add DicksonKam/latex-standard-delimiters and choose Latest version. BRAT updates from published GitHub releases. A frozen version intentionally stays on its selected release. The current verified path updated public 0.3.1 → 0.4.0 using BRAT 1.3.0 and Obsidian 1.13.7 on macOS, preserving notes and preferences after re-enable. See brat-040-update-report.json.

Keep data.json: it contains your colors, editing preview preference and rendering mode. Manual updates require replacing main.js, manifest.json and styles.css together from one release. Do not mix files from different versions or delete the entire plugin folder to update.

## If an update will not load

In a disposable vault, we rehearsed a broken local bundle, then recovered through the following BRAT path. No broken public release was uploaded.

1. Open Obsidian Settings → BRAT.
2. Beside DicksonKam/latex-standard-delimiters, choose Change version.
3. Select a previous known-good release (0.3.0 was tested), leave Enable after installing selected and apply Change version.
4. Confirm rendering/settings work. This freezes that version; use Change version → Latest version when ready to receive updates again.

The rehearsal verified that BRAT remained usable, the earlier bundle loaded, colors/preview/rendering preferences survived and fixture Markdown was unchanged. It covers a plugin bundle load failure, not every crash or storage/network failure.

If Obsidian cannot open, close it and move the plugin folder out of .obsidian/plugins temporarily. Keep a backup of data.json. Reopen Obsidian and reinstall a known-good release, restoring your preferences only after installation. This app-wide emergency procedure has not been exercised here; see Obsidian’s troubleshooting documentation if other plugins or startup failures are involved.

See brat-update-report.json and brat-recovery-report.json for recorded evidence.
