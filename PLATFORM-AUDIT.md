# API changes — 0.4.6

Rendering still preserves note bytes and uses the host MathJax engine. Two editor commands add diagnosis and an optional delimiter repair. The diagnostic is read-only; clicking Apply performs one editor.replaceRange operation for the reviewed selection and supports undo. A whole-note snapshot guard rejects stale proposals. Production still has no Node/Electron imports, network requests or telemetry. The older audit below describes the released 0.4.4 renderer before this explicit editor action existed.

# Platform and API audit — 0.4.4 beta

Desktop-only by owner decision, with isDesktopOnly=true. Production imports Obsidian, CodeMirror and local parser/highlighting/source-projection modules. It has no Node/Electron, network, telemetry or note-write APIs. It reads hidden vault plugin configuration for the known renderer guard and saves only its own preferences. Node APIs appear solely in developer scripts.

DOM rendering uses the target document; actual desktop popout checks pass. Shared MathJax is supplied by Obsidian, with Extended MathJax coexistence tested. Container mapping preserves original offsets and uses public editor DOM-position facilities for native callout bodies; ambiguous mappings fail closed. Callout source reveal also uses Obsidian’s native edit-block-button control and observes its block-selection transaction; intervening document edits, composition, unrelated selections and unload cancel correction. These host DOM conventions require future-version rechecks. Built-in Vim source visibility uses the observed cm-vimMode class, a host convention requiring recheck on future Obsidian versions.

The verified host is macOS/Obsidian 1.13.7. Windows/Linux desktop behavior and real OS IME composition remain unverified. The installed Cangjie automation attempt produced plain Latin input without composition events and is not a pass. See DESKTOP-TESTING.md, VERIFICATION.md and exact JSON reports. Mobile and Community directory admission are outside scope.
