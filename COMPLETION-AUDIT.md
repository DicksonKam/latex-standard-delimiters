# 0.4.3 daily editing audit

Status: complete — desktop GitHub beta

Local verification: complete

Confirmed defects: multiline displays beside prose/punctuation/indentation were skipped in Live Preview. Quoted displays beside prose/punctuation leaked Markdown quote markers into active MathJax previews. The patch replaces content per line and projects only validated container prefixes while preserving source ranges and inconsistent-boundary fail-closed behavior. Production does not write note source.

Final gates: 33 unit tests including 7,000 generated inputs; original runtime suite plus daily identity checks and existing stress suites on final bundle; trusted native keyboard/paste/undo evidence; dense callout performance; package matching runtime/stress/native evidence; GitHub CI and public asset verification. Test writes are restricted to disposable work/TestVault. Mobile, Community publication and untested OS/IME behavior remain outside certified scope.

All 33 unit tests, 1,442 scripted app assertions and nine trusted native keyboard checks pass on the final bundle. GitHub checks and release packaging passed. Public 0.4.3 is published as a pre-release; all eight independent public asset checks pass. The main vault was untouched.
