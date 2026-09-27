# Verification — 0.3.1

Verified on macOS in Obsidian 1.13.7, in a disposable TestVault. Main-vault note/plugin files were not modified. Production never writes Markdown; developer scripts deliberately edit disposable fixtures/preferences and restore them. The minimum app version matches this tested host. Older versions may work, but support is not claimed.

Final npm run check passed: version consistency, zero lint errors, 19 parser/tokenizer regression tests, TypeScript and production build. Three advisory warnings remain for native DOM constructors that deliberately use the target document. Settings now use declarative definitions and were checked through global search, invalid/valid color input and preview toggling; see settings-ui-report.json. Node 23.9.0 was used locally; supported Node 22/24 is recommended for development.

All 195 final actual-app assertions passed across 15 suites. suite-report.json binds plugin version, observed host version, main.js SHA256 and styles.css SHA256 to the run. Individual JSON reports contain exact assertions:

- Navigation 36; baseline runtime 28; live editing preview updates seven; parser/container/selection/clipboard/undo/conflict/performance/lifecycle audit 31.
- Quick Latex typing compatibility seven and shared Extended MathJax compatibility nine, including both load orders, custom macros/chemistry, native math and source preservation.
- Synthetic pointer routing seven and composition/ownership 13, covering tap/swipe/cancel/long press, composition preview suppression/commit, Automatic/Off, status and persistence.
- Split-pane comfort 11, actual upstream renderer handoff 12, actual desktop popout eight and SwiftLaTeX engine/coexistence eight.
- Built-in Vim seven, repeated-edit performance four and actual Minimal/narrow-editor checks seven.

Source preservation is explicitly checked in editing, copy/paste, undo/redo, delimiter deletion, source/reading switches, multiple panes/popouts, plugin handoff/reloads and large notes. Duplicate source markers are prevented for the known upstream renderer; CSS uses separate lsd-math names. Unknown competing renderer IDs are not universally detected.

The final edit benchmark used 76,780 characters and 1,000 equations, with 40 insertion/deletion dispatches. Mean was 16.44 ms; maximum 32.20 ms. These are synchronous dispatch/decoration/viewport-DOM timings on this machine, not end-to-end keyboard latency or complete-document typesetting. They show that large-note edits cost more than caret movement; no latency guarantee is made. Source returned exactly to its original text and one active preview remained. The separate beta audit records 100/500/1000-note caret measurements; its open timings include a fixed wait and are not latency claims.

Minimal's actual stylesheet was loaded in the test document with a 360px editor. In light/dark classes a 3,919px equation scrolled within a 315px preview without changing source. Token visibility and containment were checked; contrast for every preset or custom color was not certified.

The first synthetic composition harness left CodeMirror composing after blur without compositionend; it now commits before switching views, and production does not assume blur alone commits. The first upstream Reading View assertion counted a hidden editor along with the reading DOM; it now scopes to the active view. A developer Console import error occurred after an earlier run; host-version reporting now uses the observed window version, and the complete corrected suite was rerun successfully.

Remaining limits: real iOS/Android and OS IME evidence is outstanding; synthetic desktop events and narrow panes are not mobile certification. MOBILE-CHECKLIST.md gives real-device procedures. SwiftLaTeX checks initialize the embedded engine using an offline package endpoint and verify coexistence; full TeX/PDF/SVG compilation is not tested. Quick Latex shortcuts are not extended to standard delimiters. Vim normal-mode source visibility uses a host DOM convention, not a guaranteed public API; arbitrary mappings/macros need further tests. Inline math remains single-line, and list/callout-prefixed multiline displays remain unsupported in Live Preview. Color highlighting is a tokenizer, not a TeX compiler. Exporters bypassing Obsidian's DOM do not automatically support the syntax.

See COMPATIBILITY.md, PLATFORM-AUDIT.md and TYPING-INTEGRATION.md for boundaries. Actual-app evidence was collected before GitHub publication. Replacement of other plugins and universal stability certification are not claimed.

## Beta installation and recovery

BRAT 1.3.0 installed public 0.3.0 in a separate clean vault. An actual BRAT upgrade to public 0.3.1 preserved nondefault colors, preview preference, rendering mode and both fixture notes. A deliberate broken local bundle failed to load while BRAT remained usable; selecting public 0.3.0 recovered the plugin with preferences/source intact, and selecting Latest restored 0.3.1. See brat-update-report.json and brat-recovery-report.json. This tests load-failure recovery, not arbitrary application crashes.

Community eligibility remains unresolved: current directory policy requires qualifying approval for this derivative. COMMUNITY-SUBMISSION.md records the policy and remaining gates. This beta is not a submitted or approved Community plugin.
