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
- Clean BRAT install, version upgrade, preference persistence and recovery evidence.
- Real iOS and Android checks or an explicitly agreed change to platform scope; current mobile evidence remains outstanding.
- Review current developer policies and submission requirements; record remaining issues.
- Check plugin ID uniqueness in the current directory.

When ready, the owner signs in with an Obsidian account at community.obsidian.md, links GitHub ownership and adds the plugin. The directory reads the default branch manifest and performs automated review. This work prepares the package; it does not create/link accounts or submit a listing.
