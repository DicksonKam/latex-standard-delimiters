# Historical community release preparation

As of September 27, 2026, the owner chose GitHub distribution and desktop-only support. Community submission and mobile testing are no longer release gates. The former plan below is retained as historical context, not an active submission task. No author outreach or community submission was performed.

# Community release preparation

Status: in progress. Do not describe this document as approval or a submitted listing.

The current official submission route is the Obsidian Community directory, not a pull request to the older plugin registry. See [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin), checked September 27, 2026.

## Listing draft

Name: LaTeX Standard Delimiters

Repository: https://github.com/DicksonKam/latex-standard-delimiters

Author: DicksonKam

Plugin ID: latex-standard-delimiters

Description: Render standard LaTeX delimiters and highlight math source without rewriting notes.

Overview: Write or paste equations with standard LaTeX inline and display delimiters. Render them in Reading View and Live Preview, reveal their original source for editing, and see syntax colors and updating equation previews. Native dollar math remains handled by Obsidian. Shared MathJax configuration and macros can be supplied by Extended MathJax.

## Required evidence before submission

- Public source, MIT license and retained upstream attribution.
- README with accurate installation/update instructions, examples and screenshots.
- Root manifest and published release tag agree; main.js, manifest.json and styles.css are downloadable release assets.
- Latest checks pass and actual-app reports identify the exact candidate hashes and host version.
- Clean BRAT install, version upgrade, preference persistence and recovery evidence: checked on macOS/Obsidian 1.13.7 with BRAT 1.3.0; see brat-update-report.json and brat-recovery-report.json.
- Real iOS and Android checks or an explicitly agreed change to platform scope; current mobile evidence remains outstanding.
- Current developer policies and submission requirements reviewed September 27, 2026. Fork approval remains a submission blocker; see the policy review below.
- Public installation registry checked: no exact ID or case-insensitive name collision among 8,102 entries; see registry-check-report.json. Unpublished submissions/reservations remain unverified until actual directory submission.

When ready, the owner signs in with an Obsidian account at community.obsidian.md, links GitHub ownership and adds the plugin. The directory reads the default branch manifest and performs automated review. This work prepares the package; it does not create/link accounts or submit a listing.

## Policy review and unresolved eligibility

Primary sources checked September 27, 2026: [Developer policies](https://docs.obsidian.md/community-directory/developer-policies) and [Submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins).

This repository retains code derived from Andreas Burger’s LaTeX Delimiter Renderer. Its MIT license permits the derivative, but the Community directory has an additional fork eligibility requirement: public written approval from the original author, or the documented inactive/unreachable-author process. No approval evidence has been collected. Do not submit until this is resolved. Attribution must remain regardless. No author outreach has been performed.

Production review found no Node/Electron imports, remote rendering service, telemetry, ads, self-updater or note-write API. Settings use host persistence; BRAT is a separate optional installer. The manifest description is below 250 characters and ends with a period, minimum app version matches the tested host, and there are no sample commands or funding links. MIT license and upstream attribution are present. These checks do not constitute directory approval or a complete security certification.

Remaining gates: fork eligibility, real mobile evidence, final ID/name uniqueness verification in the current directory. GitHub beta distribution can continue while these remain open.

Desktop screenshots are now included in README.md and images/. They were captured from actual Obsidian 1.13.7 with beta 0.3.1 in a disposable vault and visually inspected. Mobile evidence remains separate and outstanding.

## Requirement audit — September 27, 2026

- Clean-vault BRAT installation: verified through actual BRAT UI, starting with public 0.3.0.
- Upgrade, preferences and failed-load recovery: verified; brat-update-report.json and brat-recovery-report.json.
- Searchable settings: verified in actual Obsidian UI; settings-ui-report.json.
- Large-note editing: measured in actual Obsidian, with exact scope/limits in VERIFICATION.md and edit-performance-report.json.
- Math-plugin coexistence: actual-app reports cover the named tested versions and load orders; COMPATIBILITY.md states limitations.
- Markdown preservation: covered by actual-app assertions and BRAT recovery fixture checks. Main vault remains outside the developer test workflow.
- Public examples/screenshots: README.md, supplied fixtures and two inspected actual desktop screenshots.
- Bug reporting and known limits: issue form, CONTRIBUTING.md, VERIFICATION.md and platform/compatibility documents.
- Public release assets: independently downloaded 0.3.1 files match the tested local files; public-release-check-report.json.
- Community listing package: draft metadata and policy review prepared here. Not submitted.
- Real iOS/Android editing: incomplete. No actual-device result reports exist. MOBILE-QUICK-TEST.md and MOBILE-CHECKLIST.md are procedures, not evidence.
- Fork eligibility: incomplete. Upstream approval has not been obtained; the unsent request is a review draft outside the public repository.
- Directory uniqueness: public registry evidence collected; unpublished directory reservations cannot be ruled out by this evidence.

This audit does not mark the durable goal complete. Required mobile evidence and eligibility resolution remain external dependencies.
