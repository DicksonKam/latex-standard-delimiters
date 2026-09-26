# Typing-assistant integration feasibility

Quick Latex 2.6.5 was inspected from its installed code, without changing it. Its `withinMath` predicate uses dollar-delimiter context; multiple handlers independently locate dollars using `lastIndexOf('$')`. Its native helpers also insert dollar-delimited math. Consequently, changing the predicate alone would not reliably support standard delimiters: fraction, script and delimiter operations need consistent bounds and offset handling too.

The existing coexistence tests show native-dollar auto-fractions working while standard-delimiter input stays intact. They do not prove Quick Latex snippets run inside standard delimiters. We will not monkey-patch its private methods, intercept its edits or convert the source to dollars.

A maintainable integration would have a math-context provider returning the source range, content range, delimiter kind and display mode, consumed by the typing assistant in every operation that currently assumes dollars. Our parser already supplies the underlying bounds. This requires an explicit interface adopted by that assistant, or an upstream change supporting additional delimiters. It is a feasible separate integration project, not a reliable automatic feature we can promise from this renderer alone.

Until such an interface exists, users can use standard delimiters for pasted AI equations, coloring and previews, and keep existing dollar-based typing helpers. Optional helpers implemented directly in this plugin would need an opt-in setting and conflict tests; they are not part of this reliability release. No external contribution or maintainer message has been sent.

SwiftLaTeX 0.6.0 serves another purpose: it registers latex/latexsvg code blocks with a separate TeX compilation engine and PDF/SVG output. It is desktop-only according to its installed manifest. Extended MathJax remains the shared-engine macro/configuration extension for ordinary math. These tools need coexistence tests, not wholesale replacement.
