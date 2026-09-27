# Real-device verification checklist

Real iOS/Android testing is outstanding. Desktop pointer events, narrow panes and popout tests are not mobile certification. The plugin's production code uses Obsidian/CodeMirror and browser APIs; the Node/fs/crypto calls in developer scripts are not bundled. The API audit and minimum version are documented in PLATFORM-AUDIT.md; real-device evidence is still required.

Use a disposable vault and the release candidate when packaged. Record device model, OS, Obsidian version, plugin version, theme, keyboard/input method and enabled plugins. Keep a copy of fixture Markdown before testing and compare it afterward.

- Open Examples in Reading View and Live Preview; verify standard/native inline and display math and Extended MathJax custom macros.
- Tap rendered inline/display math. Confirm source appears once and the on-screen keyboard opens without misplaced caret or duplicate punctuation.
- Swipe horizontally in a long Comfort equation; confirm the preview scrolls and the editor caret stays put. Vertical swipes and long-press selections must not force source entry.
- Select source with touch handles, copy/paste, undo and redo. Confirm raw delimiters survive and selections do not spawn extra previews.
- Type using the usual keyboard and an IME. Compose text near commands, underscores, braces and closing delimiters; confirm no lost/duplicated characters or unexpected focus/scroll changes. Repeat with interrupted composition and switching apps.
- Rotate the device, resize available panes, change light/dark theme and reopen the note. Confirm previews stay contained and colors remain readable.
- Toggle editing previews and Automatic/Off rendering, restart Obsidian, and confirm settings persist. Repeatedly enable/disable the plugin; confirm raw note text is unchanged.
- Exercise a large note and note embeds/tables/callouts; record any delays or rendering omissions.

Pass means the observed interactions work and fixture source is preserved. Record failures with a minimal equation, reproduction steps and the above environment details. iOS and Android need separate results. SwiftLaTeX is desktop-only and is not a mobile prerequisite.
