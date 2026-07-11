# REQUIREMENTS.md — Pipeline Dependencies for rana.css + rana-integrations.css

## File layering

- **rana.css** — classless core. Works on any semantic HTML from any
  GFM-compliant renderer. No pipeline dependencies except item 1 below.
- **rana-integrations.css** — optional overlay for Astro/Shiki, KaTeX, and
  rehype-autolink-headings. Import after rana.css. Safe to omit outside
  those pipelines.

## Astro version compatibility

Both stylesheets are pure CSS and work under Astro 6 and 7. The pipeline
hooks are the version-sensitive part:

**Astro 7 changed the default Markdown processor to Sätteri (Rust-based),
which does not run remark/rehype plugins.** This framework pins the unified
pipeline instead — see `astro.config.mjs`, which sets
`processor: unified({...})` via `@astrojs/markdown-remark`. With that config:

- Astro 6: identical to default behavior; the `processor` key is a no-op.
- Astro 7: opts out of Sätteri. All three hooks below work unchanged.
  Trade-off: you forgo Sätteri's Rust build-speed gains on Markdown
  processing (material on thousands-of-pages sites, negligible on a blog).

If you later migrate to Sätteri, three things must be re-verified or
rebuilt: (a) the autolink and tabindex plugins must be rewritten against
Sätteri's plugin API; (b) footnote markup — rana.css targets remark-gfm's
output (`section[data-footnotes]`, `a[data-footnote-ref]`, plus legacy
`.footnotes` class fallbacks); Sätteri is built on pulldown-cmark and its
footnote HTML may differ — check satteri.bruits.org and adjust selectors;
(c) math — Sätteri's built-in math emits MathML, not KaTeX, so replace
`.katex-display` in rana-integrations.css with a MathML-targeted overflow rule.

## Hook 1: tabindex on code blocks (rana.css)

`pre:focus-visible` lets keyboard users scroll overflowing code blocks
(WCAG 2.1.1). Browsers do not focus `<pre>` natively, so the pipeline must
inject `tabindex="0"`. The `rehypePreTabindex` plugin in `astro.config.mjs`
handles this. Outside Astro, replicate it in whatever pipeline renders
your Markdown.

## Hook 2: heading anchor links (rana-integrations.css)

`a.heading-link` styling requires `rehype-autolink-headings` configured with
`className: ['heading-link']` and an `aria-label` (the injected anchor has
no accessible name otherwise). Do **not** set `tabindex: -1` on the anchor —
it removes it from keyboard tab order. `rehype-slug` must run first to
generate the heading ids. See `astro.config.mjs` for the exact options.

## Hook 3: Shiki dual themes (rana-integrations.css)

Dark-mode syntax highlighting requires
`shikiConfig: { themes: { light, dark } }`. Dual-theme mode emits
`--shiki-dark` / `--shiki-dark-bg` custom properties as inline styles on
every token span; rana-integrations.css flips to them under
`prefers-color-scheme: dark`. The `!important` in that rule is load-bearing —
inline styles otherwise beat any stylesheet rule. Unaffected by the
Astro 6→7 upgrade (Shiki 4 in both).

## Fonts

rana.css loads exactly 8 static cuts from Bunny Fonts (GDPR-safe CDN,
no user tracking) via `@import` at the top of the file:

- Source Serif 4 — 400, 400 italic, 700, 700 italic (prose, headings h1–h2)
- Source Sans 3 — 400, 700 (h3–h6, tables, footnotes, captions, UI controls)
- Source Code Pro — 400, 700 (code; 700 covers bold tokens in Shiki themes)

`font-synthesis: none` on `html` enforces the manifest: any weight/style
combination without a shipped cut renders at the nearest real cut rather
than being faux-bolded/obliqued. Nested emphasis flips to roman
(`blockquote em`, `em em`), removing italic demand from edge contexts.

For faster first paint, move the font request out of the `@import` and into
`<head>`:

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link rel="stylesheet" href="https://fonts.bunny.net/css?family=source-serif-4:400,400i,700,700i|source-sans-3:400,700|source-code-pro:400,700&display=swap">

then delete the `@import` line. Fontsource npm packages
(`@fontsource/source-serif-4` etc., importing the per-weight CSS files)
are the equivalent self-hosted option with zero third-party requests.

## HTML head & authoring conventions

The stylesheet assumes the host document provides:

- `<html lang="en">` (or the page's actual language). `p, li, blockquote`
  hyphenate via `hyphens: auto`; without a `lang` attribute the browser has
  no hyphenation dictionary to hyphenate against and the rule is a silent
  no-op.
- `<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">`
  and `content="#11191F"` for dark — browser chrome matches `--color-bg`.
- `width`/`height` attributes on every `<img>` (prevents layout shift);
  `loading="lazy"` on below-fold images. In Astro, `<Image />` handles both.
- `translate="no"` on code elements and brand names if the audience uses
  auto-translation (prevents garbled identifiers).
- Optional: an SVG favicon containing a `<style>` block keyed on
  `prefers-color-scheme` so the icon adapts to the system theme.

Content conventions (authoring, not CSS): use the ellipsis glyph `…` not
`...`, curly quotes `" "` not straight, and non-breaking spaces between
values and units (`10 MB`).

## Known limitation: theme-switch transition flash

Elements with color transitions (links, summary, checkboxes, buttons)
animate for ~150ms when `prefers-color-scheme` flips (OS auto dark mode at
sunset, manual toggle). The standard fix requires JavaScript to suspend
transitions during the switch, which this framework deliberately excludes.
The flash is brief and cosmetic; accepted as a trade-off of the zero-JS
constraint. If a site adds a JS theme toggle later, apply the
disable-transitions-during-switch pattern at that layer.

## Known trade-off: table semantics

rana.css uses `table { display: block; overflow-x: auto }` so wide tables
scroll instead of breaking narrow layouts. Some assistive technology loses
table semantics under `display: block`. Preferred alternative where the
pipeline allows: wrap tables in `<div class="table-wrap" tabindex="0">`
with the overflow on the wrapper, and remove `display: block` from the
table rule.
