# Editing correctness review

This is a separate self-review pass of the implementation and evidence, not external certification.

Corrections from the review:
- A Reading View paragraph may contain both ordinary inline math and a cross-section display. Its reused scope must retain cross-section ownership, including when the display delimiter is removed. A semantic mixed-content regression was added.
- Deduplicating asynchronous work by element alone can suppress a newer source revision. Pending tasks now identify source text and source path, with early ownership registration and teardown/revision checks before DOM mutation.
- An older scope must not remove a newer weak-map owner when it unloads. Cleanup checks identity.
- Plugin unload must dispose scopes, not merely restore their fragments and clear a set. A stable toggle regression without manual refresh or reopening verifies the correction.
- A normal full rerender retained cached, already-processed paragraphs on the 200-paragraph note. Rebuilding preview data through public clear/set APIs fixes this. Repeated source events for an already queued/refreshed revision are coalesced.
- Native line-position mapping is unavailable immediately after a rebuild. Preserve the actual scroller's pixel anchor while waiting for usable logical mapping; every restoration frame is canceled with its source revision.
- Cached paragraphs may remount after their native render children unload. A view-owned coordinator recovers source-bound math, with explicit teardown guards and observer cancellation. The large-note regression includes three repeated returns from offscreen.
- Closing a popout can stop its timers before their own guards run. Workspace layout cleanup must release queued work for removed views.
- Asynchronous file reads are versioned so an older read cannot supersede a newer editor revision. Reads/scans are avoided when no matching Reading View pane is open.

Tradeoffs and evidence boundaries:
- Notes containing blank-row display math use a coalesced full refresh of affected Reading View panes. This can rerun other Markdown processors in that note. Ordinary notes retain incremental rendering. The large-note refresh benchmark and existing coexistence suites are required; they do not certify every third-party processor.
- Source-revision readiness waits at most 20 times 100ms; scroll restoration is bounded to 60 animation frames. Cross-section attachment retains the existing 20-frame bound. Unavailable/offscreen host sections may remain literal until the host mounts them; this is not universal rendering coverage.
- Semantic comparisons cover MathJax operators, command glyphs and structural nodes, while deliberately excluding pane-dependent styles. Visual layout, accessibility, all OS keyboards and real IME behavior are not fully certified by these comparisons.
- Runtime tests use synthetic editor changes except the explicitly trusted native keyboard probes. Aggregate assertion counts describe named scenarios and repetitions, not complete daily-use coverage.

Final evidence is still required in COMPLETION-AUDIT.md before release.
