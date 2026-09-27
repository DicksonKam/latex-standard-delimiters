# 0.4.1 callout patch verification audit

Status: complete — published desktop GitHub beta

Local verification: complete

Confirmed defects: Markdown parsed underscores in internal source-mapping markers together with underbrace subscripts; native callout rendering waited for a two-second periodic scan. The patch uses Markdown-neutral markers and a per-editor insertion observer with frame/observer cleanup on unload. Embedded ownership and in-flight work are deduplicated; ambiguous partial mappings stay literal rather than rendering a lookalike parenthesis expression. Production does not write note source.

28 unit tests, lint/type checking/build and 258 actual-Obsidian assertions across 18 suites pass on macOS/Obsidian 1.13.7. Final suite hashes bind the tested bundle/CSS. The exact reported Euler examples render in Live Preview and Reading View; the even/odd underbraces were visually inspected. Four warm callout mounts took 49–71 ms on this machine. Existing title/table literal-text, navigation, editing, compatibility, lifecycle and source-preservation checks pass.

Public 0.4.1 is published at https://github.com/DicksonKam/latex-standard-delimiters/releases/tag/0.4.1 from commit 1d995542ea8b4d8c0f9f9f1f7ece03860130628d. GitHub Checks run 36306535527 and Release run 36306574770 succeeded. The draft notes/assets were inspected before publication. Eight independent HTTPS asset/checksum/ZIP/attribution assertions pass in public-release-check-report.json. Published 0.4.0 remains immutable.

BRAT upgrade/recovery reports retain their historical tested versions; the 0.4.1 patch update has not been separately exercised through BRAT UI. Main vault remains outside test writes. Desktop cross-platform and real OS IME evidence remain unverified; mobile and Community directory publication remain out of scope.
