# 0.4.6 equation diagnostics and source typography audit

Local verification: complete

47 automated tests, including 7,000 deterministic inputs, and 2,320 actual-app assertions pass on the exact candidate bundle. This total includes repeated checks: 258 runtime, 1,943 stress, 20 refresh/scroll, 76 focused equation/source diagnostics and 23 native daily/cross-section/popout checks. Source and CSS hashes match the installed TestVault candidate. The release gate now requires trusted popout input and exact disk persistence; the earlier synthetic autosave failure is preserved and does not count as passing evidence.

Self-review: new commands, repair snapshot guards, modal cleanup, warning exclusions, source typography scope and semantic glyph checks were examined. No new renderer code was changed during release verification. Testing and plugin preference changes are confined to disposable TestVault. No main-vault width preference or plugin installation is changed by this release task.

Publication: local packaging, GitHub Checks #21 and Release #10 passed for 5693542. Public 0.4.6 is published; all eight independent public-asset checks pass in public-release-check-report.json. The release tag remains on the tested implementation.

Historical platform, IME and third-party compatibility limits remain explicit in VERIFICATION.md. This is a desktop GitHub beta, not universal stability certification.

# 0.4.5 editing correctness audit

Status: complete — desktop GitHub beta

Local verification: complete

- Released baseline: public 0.4.4 SHA256 ad9db8104895e4fe5a61609baa3390ef9ff559d30f52fe9bc3c9324a090c9dd2 reproduces the closing-section stale equation. Expected 3215, actual 3214; source contains the updated 5. Recorded in cross-section-baseline-report.json.
- Incremental correctness: final-bundle semantic regression is required for opening/middle/closing changes, operators, commands, delimiters, undo/redo, rapid edits, external updates and multiple Reading View panes.
- Lifecycle/source: require exact editor/disk preservation, paragraph restoration, canceled queued refreshes, pane closure and no captured runtime errors.
- Review: perform a separate final implementation review and record findings, corrections and remaining limits. This is a self-review pass, not external certification.
- Gates: current unit/lint/type/build, all runtime/stress suites, native keyboard evidence, performance checks, packaging, GitHub CI and independently downloaded public assets.

All writes are confined to disposable work/TestVault. Main vault, mobile and Community publication remain outside test scope. Large assertion counts are supporting evidence for named scenarios, not comprehensive coverage claims. A complete result requires current evidence for each item above.

Current evidence (Obsidian 1.13.7, macOS):
- Final bundle SHA256: 31395b9fd0eafeb04163b152905d3466e0de177761a6c9a0270f2e467dbbf415.
- Incremental correctness: cross-section-editing-report.json, 194 passing assertions including semantic MathJax references and exact source.
- Lifecycle/source: current semantic suite, queued popout closure and 20-check large-note scroll/remount/source probe pass.
- Native keyboard: native-daily-keyboard-report.json (9 passing checks), native-cross-section-report.json (6 passing checks with trusted events).
- Local gates: npm run check; 18 runtime suites (258 assertions); six stress suites (1,943 assertions); no recorded failures.
- Review: REVIEW-MILESTONE.md documents separate self-review, corrections and bounded coverage. It is not an independent reviewer certification.
- Publication: packaging passed; Checks #19 and Release #9 succeeded for fefffd3. Public 0.4.5 was published and independently downloaded; public-release-check-report.json records eight passing byte/checksum/ZIP/attribution/manifest checks. The release tag matches the tested implementation.

Requirement audit: baseline reproduction, implementation fixes, semantic edits/undo/delimiters/multiple panes, cleanup/source preservation, existing MathJax coexistence, separate self-review and evidence boundaries, all named local/native/performance gates, packaging, CI and public release verification are satisfied by the current reports. Universal stability and external reviewer certification are not claimed.
