# 0.4.1 callout patch verification audit

Status: locally verified; publication pending

Local verification: complete

Confirmed defects: Markdown parsed underscores in internal source-mapping markers together with underbrace subscripts; native callout rendering waited for a two-second periodic scan. The patch uses Markdown-neutral markers and a per-editor insertion observer with frame/observer cleanup on unload. Embedded ownership and in-flight work are deduplicated; ambiguous partial mappings stay literal rather than rendering a lookalike parenthesis expression. Production does not write note source.

28 unit tests, lint/type checking/build and 258 actual-Obsidian assertions across 18 suites pass on macOS/Obsidian 1.13.7. Final suite hashes bind the tested bundle/CSS. The exact reported Euler examples render in Live Preview and Reading View; the even/odd underbraces were visually inspected. Four warm callout mounts took 49–71 ms on this machine. Existing title/table literal-text, navigation, editing, compatibility, lifecycle and source-preservation checks pass.

Publication gate: package current hash-bound evidence; push CI-verified 0.4.1; inspect/publish the draft; independently compare downloaded assets and ZIP. Keep published 0.4.0 immutable. Main vault remains outside test writes. Desktop cross-platform and real OS IME evidence remain unverified; mobile and Community directory publication remain out of scope.
