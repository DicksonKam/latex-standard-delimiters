# 0.4.2 stress-test milestone audit

Status: complete — published desktop GitHub beta

Local verification: complete

Stress testing confirmed dense callout source mapping re-rendered the whole section once per equation: 250 equations took approximately 10 seconds in Live Preview and 20 seconds in Reading View on the tested machine. The patch builds one marked template per section and retains Markdown-neutral collision avoidance, unique partial mappings, deduplication and stale-DOM guards. Production does not write note source.

Final gate: 31 unit tests including 7,000 generated inputs; all 18 existing runtime suites and three new stress suites on the final bundle; dense callout timing improvement; exact source and literal-text preservation; package current hash-bound evidence; GitHub CI; public asset/checksum verification. Mobile, Community directory publication, Windows/Linux and real OS IME certification remain outside the tested scope. Test writes stay in disposable work/TestVault.

Final local evidence passes: 31 unit tests, 7,000 generated inputs and 1,173 actual-app assertions across 21 suites on the current bundle. The 250-equation callout now completes in approximately 0.6 seconds in both views. All literal-text, source-preservation, navigation, editing, compatibility and lifecycle regression gates pass. Public release and asset verification passed.

Public 0.4.2 was published from commit d8dc0ef24ba2e1747472a502d2e8a88fa2c90508. GitHub Checks run 36307754297 and Release run 36307794910 passed. The release workflow now validates current runtime/stress hashes and local completion before creating a draft. Draft tag, notes and assets were inspected. Eight independent public download/checksum/ZIP/manifest assertions pass in public-release-check-report.json. Previous release tags/assets remain immutable. BRAT patch upgrade was not separately re-exercised; earlier update reports retain their historical tested versions.
