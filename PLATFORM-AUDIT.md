# Platform and API audit — working release candidate

Production imports are Obsidian, CodeMirror state/view/language and local parser/highlighter modules. There are no Node.js, Electron, filesystem or network imports in the production plugin. The compiled file requires host-provided modules only. Developer runtime scripts use Node APIs and are separate files, not bundled. The manifest remains isDesktopOnly=false. This is an architectural compatibility statement, not a real-device test result.

Public host facilities used include renderMath/finishRenderMath/loadMathJax, Markdown post-processors/render children, editorLivePreviewField, editor extensions, plugin preferences, workspace events/options, MarkdownView and vault adapter reads. Note contents are never written by production code. Browser facilities include DOM ranges/tree walking, pointer events, animation frames, microtasks and MutationObserver. DOM elements and observers use their target document where needed; actual desktop popouts passed.

CodeMirror uses state fields/effects/facets, decorations/widgets, keymaps, ViewPlugin, syntax trees, composing, moveVertically, findFromDOM and posAtDOM. findFromDOM was introduced in CodeMirror view 6.0.0 in June 2022, rather than being a recent 6.38-only feature. See https://codemirror.net/docs/changelog/. Obsidian 1.5.0 dates to November 2023: https://obsidian.md/changelog/2023-11-20-desktop-v1.5.0/.

These dates do not establish the whole plugin's minimum runtime version. The 0.3.0 candidate declares 1.13.7, matching the tested baseline. The previous 1.5.0 minimum was not runtime verified. Older versions may work, but support is not claimed until tested. Compiling against current API types alone is insufficient proof.

Vim normal-mode source visibility uses the observed cm-vimMode class on the scroller. It does not read private Vim state or intercept Vim keys, but the DOM indicator is a host convention rather than a guaranteed public API. Seven built-in Vim checks pass, including counted motion. Future host changes require rerunning the suite; if the indicator disappears, source visibility may no longer activate.

Embedded table/title rendering uses source sections plus known Markdown container structure. Ambiguous table mappings fail closed. This guards source association rather than guaranteeing every possible Markdown renderer integration. Shared MathJax behavior was tested with Extended MathJax 0.4.1; native math is left to Obsidian.

Remaining device evidence: real iOS/Android, operating-system IME input and manual touch selection/keyboard interactions. MOBILE-CHECKLIST.md gives a reproducible manual procedure. Synthetic pointer/composition events and desktop narrow panes must not be represented as real mobile certification.
