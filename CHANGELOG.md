# 0.4.5

- Refresh cross-paragraph Reading View equations when any participating section changes, including external file updates and rapid edits.
- Cancel obsolete asynchronous renders and dispose DOM ownership before native paragraph updates; preserve paragraph structure and source.
- Add semantic editing regressions for operators, commands, undo/redo, delimiters, multiple panes and queued-refresh teardown. Require both the public 0.4.4 failing reproduction and current passing evidence in packaging.

# 0.4.4

- Render validated multiline list displays followed by punctuation or prose.
- Accept blank TeX rows inside list displays and render displays split across Reading View paragraphs.
- Bind cross-section mapping to exact source sections, preserve paragraph structure on unload, and add repeated/literal equation regression cases.

# Changes

## 0.4.3 — daily editing fixes

- Render multiline displays beside prose, punctuation or indentation in Live Preview without consuming surrounding text or line breaks.
- Strip validated callout prefixes from active previews even when display math shares a line with prose/punctuation.
- Add stateful displayed-equation identity tests and actual native keyboard/paste/undo evidence to release gates.

## 0.4.2 — stress testing and dense callout performance

- Map all equations in a rendered section with one marked Markdown template, removing quadratic dense-callout work.
- Add 40 adversarial cases repeated in both views, lifecycle/reload races, 1,000 edit dispatches and volume tests up to 250 equations in one callout.
- Add 7,000 deterministic generated parser/projection inputs and require passing current stress evidence for release packaging.
- Verify 31 unit tests and 1,173 actual-app assertions on the final bundle.

## 0.4.1 — callout rendering fixes

- Remove underscores from internal Markdown mapping markers so aligned equations with underbrace subscripts render inside callouts.
- React to native callout/table widget insertion instead of a two-second embedded-rendering poll.
- Deduplicate embedded render ownership and require unique partial mappings so literal parentheses remain literal.
- Add complex Euler callout correctness and warm-mount latency checks in Live Preview and Reading View.

## 0.4.0 — beta

- Project list/callout math to TeX while preserving original Markdown offsets and prefixes.
- Render multiline displays using content-only replacements and recover inactive callout bodies from their source.
- Extend vertical equation entry to container displays and map source colors around Markdown prefixes.
- Recognize ordered-list continuation math while retaining genuine indented-code exclusions.
- Fix callout click reveal and caret selection; add container-specific editing regression coverage.
- Verify 27 unit tests, 239 actual-app assertions, public assets and BRAT upgrade preservation.

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
