# Mobile beta test

Use a new disposable vault. Install BRAT, add DicksonKam/latex-standard-delimiters, choose Latest version and enable the plugin. Copy fixtures/Mobile.md into the vault. Preserve an untouched copy so edits can be compared. Do not run desktop developer scripts on your phone or personal vault.

## First pass

1. Open Mobile in Reading View and Live Preview. Confirm complete equations render and the inline code stays literal.
2. Tap the J equation. Check that its source has one underscore and both delimiters; type/change the subscript, then undo. Repeat with the inline fraction. Confirm the preview follows complete edits.
3. Select source with touch handles. Copy, paste, undo and redo; check for lost or duplicated delimiters. In Source mode, confirm original text remains visible.
4. Swipe across the long equation preview. It should scroll horizontally without moving the caret. Vertical swipes and long presses should retain normal editor behavior.
5. Using your usual keyboard/IME, compose text in the composition equation, cancel composition, finish it and switch apps briefly. Watch for lost/duplicated characters and focus jumps.
6. Rotate the device and test light/dark mode. Toggle editing previews and a custom command color, close/reopen Obsidian and check persistence. Restore the fixture text.

This first pass does not cover the entire platform checklist. Follow MOBILE-CHECKLIST.md for Extended MathJax, large notes, embeds, repeated enable/disable and other combinations.

## Report results

Device and OS:
Obsidian version:
Plugin version:
Theme and keyboard/IME:
Other enabled plugins:
Passed steps:
Failed steps and minimal reproduction:
Source preserved after restoring intentional edits:

Report iOS and Android separately. Leave untested items as untested; do not turn this template into a pass report without running the checks.
