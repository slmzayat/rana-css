# Backlog

Candidate additions and fixes, not yet implemented.

## Implemented

Everything previously logged here except the three items below was
implemented in one pass: extended form input coverage, standalone
checkbox/radio/range/progress/meter via `accent-color`, `:user-invalid`/
`:user-valid` validation states, `input[type="file"]` and
`::file-selector-button`, `fieldset`/`legend`, `<dialog>` and
`::backdrop`, a real `@media print` stylesheet (plus color-preserving
print rules for GFM alerts and Shiki blocks), `scrollbar-color` and
`scrollbar-width`, `dl`/`dt`/`dd`, `table caption`, `cite`, `svg` sizing,
the `details`/`dialog` heading-margin fix, the `[hidden]` specificity
fix, and the table `role="table"` ARIA documentation note. See
docs/design-decisions.md, "Backlog implementation pass" for what was
adopted and why.

## Open

- **Sidenotes and margin notes.** The one feature most on-brand for
  "calm, long-form reading" that Rana still doesn't have (Tufte CSS and
  Latex.css both center their design on it). A real feature, not a fix:
  needs a real conversation about whether it can key off GFM's existing
  `data-footnote-ref` markup to avoid a `.sidenote` class, and float or
  anchor-positioning work to lay it out. Not scoped yet.
- **Motion philosophy questions**, not concrete tasks: asymmetric
  enter/exit animation durations, and multiple easing curves per
  interaction versus Rana's one shared curve. Both surfaced from
  emilkowal.ski's own site practice, and both run against a deliberate
  simplification already recorded in docs/design-decisions.md. Left
  open only as things worth being aware of, not as items to act on.
- **OpenType stylistic-set curiosity.** Whether Source Serif 4 or Source
  Sans 3 expose any useful opt-in features via `font-feature-settings`.
  Speculative, no known problem driving it, someday material only.
