# Changes

## 0.3.2 — beta

- Declare desktop-only support in the manifest.
- Document GitHub/BRAT distribution; community listing and mobile certification are outside scope.
- Rendering code and preference storage remain identical to tested 0.3.1.

## 0.3.1 — beta

- Searchable declarative settings preserve existing preferences.
- Invalid source colors display validation feedback.
- Add structured bug reports and a distinct compatibility test fixture.
- Retest all 195 actual-app checks on the new binary.

## 0.3.0 — verified local release candidate

- Touch taps reveal equation source; scrolling, cancellations and long presses retain native behavior.
- IME composition suppresses editing previews and marker replacement widgets until commit.
- Vim normal mode shows original math source so native j/k/count motions retain logical lines. Insert mode restores rendering.
- Separate CSS namespace prevents styling the upstream renderer's elements.
- Automatic/Off renderer choice, persistent preferences and understandable rendering status.
- Long editing previews stay contained and horizontally scrollable.
- Expanded checks cover actual upstream renderer handoff, SwiftLaTeX engine coexistence, independent panes and desktop popouts.
- Minimum Obsidian version is the verified baseline, 1.13.7; earlier releases have not been tested.

Real mobile and OS IME evidence remains outstanding. SwiftLaTeX PDF/SVG compilation and Quick Latex standard-delimiter shortcuts are not certified. See the compatibility, platform and verification reports for exact scope.

## 0.2.0

Parser/comment recovery, source coloring and editing previews, vertical navigation, Extended MathJax coexistence, dynamic known-renderer conflict detection, bounded caches and source-preservation checks. Archived locally with 19 unit and 118 actual-app assertions.
