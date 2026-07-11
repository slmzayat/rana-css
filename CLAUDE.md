# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Rana — conventions for AI-assisted work

Rana is a CSS framework for calm, long-form reading. It styles default
HTML and Markdown/GFM output directly. These rules are load-bearing;
do not "improve" past them without asking.

## Workflow

There is no build, lint, or test tooling (`package.json` has no `scripts`
and no dependencies — it exists only to describe the npm package). Rana is
plain CSS shipped as-is.

- The only verification loop is visual: open `demo/index.html` directly in
  a browser (no server needed) and check it against every theme
  (`light`, `dark`, `sepia`) after any change to `src/rana.css` or
  `src/rana-integrations.css`. Treat the demo as the regression suite.
- Astro is not installed in this repo; `astro.config.mjs` is reference
  configuration for consumers, not something you run here.

## Hard rules
- Pure native CSS only. No JavaScript, no preprocessors, no utility classes.
- All colors are custom properties using light-dark(); never hardcode a
  scheme-specific color outside a theme block. Theming = color-scheme +
  variables, nothing else.
- Palettes live in rana.css under `[data-theme="..."]` blocks. Pages own
  only switch wiring (the demo's `:has()` radio shim is a page concern,
  not a framework one).
- All block margins come from the --space-* rhythm tokens. Never a raw
  rem margin. Heading space-above scales with level (~3x space-below);
  heading + heading compresses to --space-s.
- Two font weights only (400/700); font-synthesis: none is intentional.
  Three voices: serif = reading, sans = interface/metadata, mono = code.
- Hover rules live in the single `(hover: hover) and (pointer: fine)`
  block (plus one scheme-scoped image-shadow rule inside the dark media
  query). :focus-visible rules only ADD to the global focus ring. Form
  fields use :focus (not :focus-visible) deliberately.
- Contrast standard: WCAG AA minimum, target AAA contrast (SC 1.4.6,
  7:1 for normal text). Check every color change against all themes:
  light, dark, and sepia. <!-- If AA-only was chosen, edit this line. -->
- Browser floor: mid-2026 evergreen (current Chrome, Firefox, and Safari
  on iOS) — light-dark(), :has(), color-mix(), native CSS nesting
  (relaxed syntax, nested at-rules). Do not add legacy fallbacks; do not
  raise the floor without asking.
- The demo (demo/index.html) is zero-JS. Shiki code blocks are
  pre-rendered at build time with defaultColor: false; both palettes
  arrive as --shiki-light/--shiki-dark variables.
- No renderer classes as primary CSS hooks. Task lists key off
  `:has(> input[type="checkbox"])`; footnotes off GFM's
  `section[data-footnotes]` / `a[data-footnote-ref]` attributes. Do not
  reintroduce legacy class fallbacks (`.footnotes`, `.contains-task-list`)
  — they were carried for one era and deliberately deleted once the
  `:has()`/`light-dark()` floor made them redundant.

## Structure
- src/rana.css — the framework (no renderer classes as primary hooks;
  GFM data attributes and :has() only)
- src/rana-integrations.css — optional overlay: Shiki, GFM alerts,
  KaTeX, heading anchors. Imported after rana.css.
- demo/index.html — test suite and living documentation. Reload it in a
  browser after every change; it is the visual regression suite.
- REQUIREMENTS.md — pipeline hooks (pre tabindex, autolink config,
  Shiki dual themes), known trade-offs (table display:block semantics,
  theme-switch behavior), browser floor.
- docs/design-decisions.md — the reasoning behind current values (why
  65ch, why the heading scale is 32/26/20/16/14/13, why sepia is Flexoki
  not a hand-rolled palette, rejected alternatives). CLAUDE.md holds the
  rules; this file holds the why. Check it before changing a value that
  looks arbitrary — it probably isn't. Newest entry supersedes older ones
  it contradicts.
- astro.config.mjs — reference Astro setup, pinned to the unified
  pipeline (valid Astro 6 and 7; do not switch to Sätteri without
  reworking the three pipeline hooks). Astro itself is not installed in
  this repo; this file is documentation for consumers.

## Copy conventions (demo and docs)
- Plain language, active voice, name each Markdown element.
- No em-dash " — " constructions; use commas, colons, or new sentences.
- Ellipsis glyph (…), curly quotes, non-breaking space before units.

## Publishing
- npm name is rana-css ("rana" is taken). Do not publish without the
  maintainer's explicit go-ahead.
