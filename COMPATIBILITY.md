# Compatibility findings — 0.4.4 beta

The 0.4.4 beta passed 2,007 actual-app assertions across runtime and stress suites on macOS/Obsidian 1.13.7, with code/CSS hashes recorded in suite-report.json. This is evidence for the tested combinations, not universal compatibility certification.

Extended MathJax 0.4.1: custom preamble macros and chemistry work with standard/native delimiters in Reading View and Live Preview. Both load orders were checked. Unloading our renderer preserves native math. We share Obsidian's MathJax engine rather than replacing that plugin's functionality.

Quick Latex 2.6.5: native-dollar auto-fractions work alongside our standard-delimiter rendering/preview. Our plugin does not make Quick Latex recognize alternative math contexts. Its dollar assumptions occur in several handlers; see TYPING-INTEGRATION.md for a maintainable integration route and boundaries.

SwiftLaTeX Render 0.6.0: the embedded engine initializes with a loopback-only package endpoint in TestVault. Standard-delimiter math and editing previews render while it is enabled, and source is preserved. Full TeX/PDF/SVG compilation, package downloads and every settings combination were not tested. Its own manifest declares desktop-only; it is not needed on mobile.

Upstream LaTeX Delimiter Renderer 1.0.4: an original-source local build was actually loaded in TestVault. Our known-ID guard pauses; upstream handles Reading View/Live Preview equations without competing source markers. Removing it resumes our rendering without residual upstream widgets. Upstream preferences were not written. The guard is not universal detection of every renderer and may take up to the polling interval after a configuration change.

Built-in Vim: normal-mode j/k and counted motions enter logical equation source lines. Rendering resumes in insert mode. Source stays unchanged. The normal-mode DOM class is a host convention rather than a guaranteed API. Synthetic key checks do not certify every mapping, macro or third-party Vim extension.

Multiple panes and desktop popouts: independent active previews, owner-document rendering, reading/live math, coloring, source preservation and repeated reload cleanup were checked. Long previews stay scrollable within their pane. Tables/callout titles and embeds have source-aware checks; unsupported or ambiguous mappings can remain literal.

Themes/platforms: built-in light/dark classes were tested. The installed Minimal stylesheet was checked in light/dark classes at a 360px editor width; long previews stayed contained and scrollable. This does not certify every theme preset or custom color contrast. Mobile is outside scope. Windows/Linux and real OS IME composition remain unverified; see DESKTOP-TESTING.md and the recorded unsuccessful automation attempt. The minimum is conservatively the tested host 1.13.7. Older versions may work but are not claimed.
