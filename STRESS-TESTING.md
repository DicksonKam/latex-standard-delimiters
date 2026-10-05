# 0.4.6 release refresh

All 18 runtime suites and six stress suites were rerun on the 0.4.6 bundle: 258 and 1,943 assertions respectively pass. The current hash-bound reports also include the new source typography/matrix/diagnostic checks and trusted native daily/cross-section edits. For queued popout closure, run native-reading-popout-setup.js, type 5 through native UI, then run native-reading-popout-finish.js. Its eight assertions require trusted input, a pending refresh, cleanup and natural disk autosave. The older scripted popout check does not reliably exercise host autosave and now writes a separate report; the retained first-attempt failure documents that limitation.

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

## Incremental correctness gate

Run `scripts/cross-section-editing-check.js` in disposable TestVault. It opens one editor and two Reading View panes for the same note and checks changes without reopening it. The reference is native host MathJax output; the signature includes operators, command glyphs and fraction/script/underbrace tree structure, not only equation counts or digits. It excludes pane-dependent layout styles, so it does not replace visual layout verification.

The required evidence distinguishes scenario coverage from repeated assertions. Every fix needs a released-build failing reproduction, a final-build passing regression, exact editor/disk preservation checks and a separate implementation review. Describe synthetic editor/keyboard dispatches as synthetic; retain native keyboard checks for actual input behavior. State known gaps instead of treating aggregate counts as proof of completeness.

For a cross-section fix, test opening, middle and closing edits, command/operator changes, delimiter removal/recovery, undo/redo, rapid changes, multiple panes, teardown and large-note cost. Reports must identify the exact bundle. The release cannot inherit a historical passing report as evidence for changed code.

Run `reading-revision-performance-check.js` separately while the native TestVault window is focused. It measures six warm Reading View changes on a 200-paragraph note, checks a local 1800ms upper bound, preserves the logical scroll anchor and verifies the newest equation after returning from offscreen. The measurement is host rendering after synthetic editor dispatch, not OS keyboard latency.

For `native-cross-section-setup.js`, drive actual typing of 9, Cmd-Z and Cmd-Shift-Z through the native UI; then run `native-cross-section-finish.js`. Trusted event capture checks Reading View updates and exact intended source. Re-enable checks in the semantic suite also run without manual refresh or reopening. Packaging requires current performance/scroll and native cross-section reports in addition to the original native daily keyboard probe.

## Reported matrix layouts (investigation pending)

Set lsdTestScriptsPath as above and evaluate scripts/matrix-rendering-check.js in disposable work/TestVault. It compares the cylindrical aligned and boxed-underbrace matrix examples against the host MathJax semantic tree in Reading View and Live Preview, including callouts, lists, one-space indentation, blank rows, and ordinary editing previews. The 22 checks pass on the 0.4.6 candidate, recorded in matrix-rendering-report.json. Two added pure regressions preserve exact projected TeX and check row-spacing brackets.

These fixtures reconstruct intended valid LaTeX from a formatted chat paste. The cylindrical fixture now groups its leading bracket expression and requires both bracket glyphs and bold r, in addition to comparing the host MathJax tree. Matching MathJax alone missed the optional-argument ambiguity. New screenshots and computed styles confirmed heading/emphasis leakage in active source. The main vault's running plugin is enabled and matches the 0.4.5 tested binary; it resides in a version-suffixed folder. The 0.4.6 candidate adds diagnosis and an explicit delimiter-loss repair; it does not claim to resolve the exact original note or to be a published release.

Examples-Matrices.md contains the reconstructed equations with standard display delimiters, double-backslash row breaks, and correct subscripts. Bare bracket blocks remain ordinary Markdown.

## Selected-equation diagnostics and repair (0.4.6 candidate)

Run equation-diagnostics-check.js separately in disposable TestVault. It creates distinct EquationDiagnostics-*.md notes so pending editor saves cannot race fixture replacement. Twenty-six assertions cover exact source previews, explicit delimiter-only Apply, scripted undo, newer-edit protection, code exclusions, MathJax errors, dialog teardown, and saved bytes. MathJax acceptance is a preview result, not a guarantee of mathematical correctness or of the original note’s rendering.

For native interaction, evaluate native-equation-diagnostics-setup.js, close DevTools, use Cmd-P to choose Preview equation repair, click Apply delimiter repair and press Cmd-Z. Evaluate native-equation-diagnostics-finish.js to record trusted events and exact editor/disk source. Five checks pass. The scripts restore the original leaf and leave only disposable test notes. Run these probes separately from other suites; their reports bind to the installed candidate bundle.

The twelve diagnostic/matrix unit tests exercise delimiter loss, byte-preserving proposals, CRLF/quote prefixes, blank-line selections, partial/multiple-block rejection, code/native-dollar exclusions and damaged row breaks. Rendering semantics remain unchanged: ordinary bare brackets are not implicitly converted to math. Release packaging also requires these current reports. This candidate has targeted verification, not refreshed full release-gate evidence.

## Source typography regression

Run source-typography-check.js separately in disposable TestVault. Twenty-three assertions check computed font size/weight/style, ordinary headings, inline math inside a heading, emphasis-like TeX, invisible blank rows, and editor/disk bytes. The pre-fix candidate fails seven style assertions; the fixed candidate passes all. The baseline is retained as source-typography-baseline-report.json. These checks cover the installed desktop theme, not every third-party stylesheet. The heading-like invalid-TeX fixture deliberately exercises source editing typography, not successful typesetting.

Source line decorations reset typography only on complete equation lines. Math source spans suppress Markdown emphasis/heading decoration while token colors and unmatched-brace feedback remain available. Surrounding prose/inline-heading line formatting remains unchanged. Diagnosis warns about suspicious optional arguments without changing the note; corrected examples group the literal bracket expression explicitly.
