# 0.4.0 — dependable desktop editing (complete)

- Multiline list/callout displays preserve source and Markdown structure, with mapped colors and live previews.
- 27 unit tests and 239 assertions across 17 actual-Obsidian suites pass on the final binary. Real native click and Up-arrow entry were visually verified in TestVault.
- Named-plugin coexistence, large-note editing, ownership/lifecycle, clipboard, selections and pane/popout checks retain their documented scope.
- macOS/Obsidian 1.13.7 verified; Windows/Linux and real OS IME remain explicitly unverified. The Cangjie automation attempt produced no composition events.
- Public GitHub beta 0.4.0 is published; independent asset/ZIP checks pass. Actual BRAT 0.3.1 → 0.4.0 preserves preferences and notes.

See COMPLETION-AUDIT.md for evidence. Main vault stayed outside testing. Mobile and Community directory publication are outside scope.

# Editing correctness and evidence — active

The next GitHub beta must fix the confirmed stale Reading View result when only the closing paragraph of a cross-section equation changes. Preserve Markdown exactly and retain native MathJax/plugin coexistence.

Acceptance evidence:
- A permanent actual-Obsidian regression fails against 0.4.4 before the fix and passes on the final build without reopening the note.
- Incremental edits to opening, middle and closing sections, delimiter removal/recovery, undo/redo and multiple Reading View panes produce current equations. Verify operators/commands as well as numbers.
- Renderer teardown and asynchronous work cannot restore stale content or modify unrelated paragraphs; source and disk preservation are checked explicitly.
- Review the final implementation separately from writing it. Record remaining limits and the distinct scenarios tested; repeated assertions are supporting evidence, not completeness claims.
- Run relevant unit, runtime, native input and performance gates on the final artifact; publish and independently verify the GitHub beta assets.

Mobile and Community directory submission remain outside scope. Main-vault writes are prohibited. Completion requires current evidence for each item above; until then the milestone remains active.

The 0.4.5 editing-correctness milestone is complete. See COMPLETION-AUDIT.md for current requirement evidence and REVIEW-MILESTONE.md for corrections and limits.
