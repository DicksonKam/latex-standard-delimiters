# 0.4.5 editing correctness audit

Status: local gates complete; public release verification pending — desktop GitHub beta

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
- Publication: packaging, GitHub CI and independent public-asset verification are still required.
