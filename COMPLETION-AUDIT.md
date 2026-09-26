# Reliability milestone completion audit — 0.3.0

Status: complete

Editing/navigation and source preservation: navigation/runtime/editing-preview/beta-audit reports verify arrows, boundaries, selections, raw clipboard, undo/redo, delimiter edits, adjacent/multiline source, mode switches and source invariance. Input-comfort and composition-ownership reports verify synthetic touch routing and composition lifecycle; the real-device/OS-IME gap is explicitly retained in MOBILE-CHECKLIST.md. Vim report verifies native j/k and counted motions with normal-mode source visibility and unchanged source.

Preview comfort and layout: panes-comfort verifies independent active previews, long-equation scrolling, containment, caret/source stability, malformed MathJax errors and repeated reloads. Popout report verifies actual separate-document reading/live rendering and coloring. Theme-narrow verifies the actual Minimal stylesheet in light/dark classes at 360px width. These are scoped observations, not all-theme/all-device claims.

Coexistence and ownership: compatibility and typing-compatibility reports verify Extended MathJax 0.4.1 load orders, macros/chemistry and Quick Latex 2.6.5 native helpers. Upstream-coexistence uses actual original-source renderer 1.0.4 and verifies pause/handoff/source preservation without preferences writes. Swift-coexistence verifies 0.6.0 engine initialization and standard math using an offline endpoint, excluding full compilation. Composition-ownership verifies Automatic/Off, persistence and status. Production does not change other plugins' settings or convert notes.

Typing integration: TYPING-INTEGRATION.md records the installed assistant's multiple dollar assumptions and a concrete shared-context interface approach. It explains why a predicate monkey-patch is insufficient and does not promise unsupported snippets. No external message or contribution was sent.

Platform/API/minimum: PLATFORM-AUDIT.md records production host/browser dependencies and absence of Node/Electron/network or note-write APIs. The declared minimum is tested Obsidian 1.13.7; older runtime support is unverified. Mobile remains intended with an explicit real-device checklist and missing evidence. The Vim class convention and Markdown-container assumptions are documented.

Performance/lifecycle: beta-audit covers 100/500/1000-equation selection measurements and unload/reload cleanup. Edit-performance covers 40 insertion/deletion dispatches in a 76,780-character note, preserving source and one active preview; exact timings and measurement boundaries are in VERIFICATION.md. Cached parser/formatting analysis and bounded reading caches remain in production.

Final gate: npm run check passes 19 unit tests, TypeScript, versions and production build with zero lint errors and documented advisory warnings. All 195 actual-app assertions pass across 15 suites. suite-report.json records 0.3.0, observed host 1.13.7 and matching main.js/styles.css hashes. The package-release script verifies that evidence, required suites, archive integrity and archived binary/version consistency before writing release/source ZIPs and release-verification.json. Those artifacts are the delivery gate; goal completion follows actual archive verification.

User main-vault files remain untouched. Existing 0.2.0 archives remain available. This audit covers the local reliability milestone; subsequent GitHub publication is documented in RELEASING.md. Universal compatibility is not claimed. Remaining limitations are explicit in the verification/compatibility/device documents rather than silently counted as tested.
