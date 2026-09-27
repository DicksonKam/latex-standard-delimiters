# Repeatable stress testing

Run developer scripts only in the disposable work/TestVault, never a personal vault. The scripts deliberately write Stress.md, StressLifecycle.md and StressVolume.md. They restore the original active view and check the supplied fixtures remain unchanged. Editing dispatches and lifecycle events are synthetic; this does not certify every OS, input method or third-party plugin.

In the Obsidian developer Console, set window.lsdTestScriptsPath to this repository's absolute scripts directory and window.lsdTestHostVersion to the displayed host version. After the normal runtime suite, run:

```js
await eval(require("node:fs").readFileSync(window.lsdTestScriptsPath + "/run-stress-suite.js", "utf8"))
```

The daily editing suite verifies numeric glyph identities after edits/undo, deleted/recovered delimiters, moves between Markdown structures, actual folded-state transitions, repeated vertical entry and same-note editor/Reading View updates. It checks active callout previews for leaked Markdown quote glyphs. Scripted events are labeled as scripted.

Native keyboard checks are separate: evaluate native-daily-keyboard-setup.js in TestVault, close DevTools and press Down, Right, type 9, undo, redo, Backspace, paste the literal LaTeX command \alpha_2, then undo. Open DevTools and evaluate native-daily-keyboard-finish.js. The report checks trusted input events and exact source, including caret entry and paste. This narrow native desktop sequence does not certify all input methods or callout gestures.

The suite rejects overlapping developer runs and binds reports to the installed main.js hash. Keep the disposable window foreground. No main-vault files or preferences are used.

The rendering matrix exercises 40 cases through three cycles in both views: identical equations, literal lookalikes, Markdown emphasis, underbraces, nested callouts/titles, folds, tables within callouts, escaped pipes, code/fences, native dollars, frontmatter, incomplete delimiters, marker collisions and CRLF. A plugin-disabled control distinguishes Obsidian's CRLF normalization on save from plugin source changes.

Lifecycle stress performs 30 rapid note/view-switching rounds, including 10 unload/reload races, and 1,000 edit dispatches. It checks exact equation counts, literal text, source restoration and uncaught errors. Owned embedded-child counts are observations, not a heap-leak proof.

Volume tests render 25, 100 and 250 underbrace equations in a single callout in both views. The warm 2.5-second limit catches the observed quadratic mapping regression on the tested machine; slower machines or cold MathJax loading can require separate timing analysis. The baseline 0.4.1 report is retained separately from candidate evidence.

npm test also runs 7,000 deterministic generated inputs: mixed protected Markdown, quote/list source projection and malformed delimiter recovery. Fixed seeds make failures reproducible. These tests assert expected math, preserved offsets and nonoverlapping ranges, not just absence of crashes.

## Boundary suite

`boundary-stress-check.js` mounts 31 layouts twice in Live Preview and Reading View, verifies numeric glyph identity in inactive and active math, rechecks identity after exiting source, checks editor/disk bytes and captured errors, and verifies blank-row paragraph restoration on unload. Coverage includes list suffix punctuation/prose, ordered/nested/task/quoted lists, adjacent displays, identical blank-row equations, literal lookalikes and Unicode. Selection actions are synthetic. The suite uses only disposable work/TestVault and is required by packaging. Cross-section rendering waits for source-bound sections to mount; both ends must mount within the bounded retry period, otherwise the equation stays literal. Long offscreen or virtualized equations are not certified.
