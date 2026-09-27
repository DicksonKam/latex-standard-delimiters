# Desktop test facilities and scope

The current test machine is macOS, with Obsidian 1.13.7. Its installed keyboard sources include ABC and Apple Cangjie. Availability of an input method is not proof of composition compatibility. Synthetic composition events are separately reported and must not be described as real OS IME evidence.

No Windows or Linux desktop Obsidian environment has been identified for this milestone. A Linux container or Node unit-test runner is not desktop Obsidian evidence. Other desktop environments remain unverified until actual app results are collected.

## Reproduce app checks

Use a disposable vault named TestVault. Follow README.md for fixtures, isolated plugin copies and theme prerequisites. Copy fixtures/Containers.md as Containers.md. Set window.lsdTestScriptsPath to the current absolute scripts directory and window.lsdTestHostVersion to the displayed host version; run scripts/run-runtime-suite.js through that vault’s developer Console. Check suite version/hashes against the candidate. Never run these scripts in a personal vault.

## Real input-method procedure

Use a disposable note containing an equation with a text command. Record the original source and active keyboard source. Focus inside the text-command braces, activate the installed input method and generate composition with actual key presses. Check candidate display, cancellation, commit, preview suppression/update, selections and undo. Restore the note and original keyboard source, and record actual composition events and resulting source separately from synthetic tests. Do not claim a pass based merely on inserted Unicode text or direct typeText/paste operations.
