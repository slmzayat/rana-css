# Requirements

Pipeline dependencies for rana.css and rana-integrations.css.

## File layering

- **rana.css**: classless core. Works on any semantic HTML from any
  GFM-compliant renderer. No pipeline dependencies except the tabindex
  hook below.
- **rana-integrations.css**: optional overlay for Astro, Shiki, KaTeX,
  and rehype-autolink-headings. Import after rana.css. Safe to omit
  outside those pipelines.

## Browser floor

Both stylesheets target mid-2026 evergreen browsers: current Chrome,
Firefox, and Safari on iOS. Load-bearing features: `light-dark()`,
`:has()`, `color-mix()`, and native CSS nesting (relaxed syntax, nested
at-rules).

A few vendor prefixes remain because no engine has shipped a standard
replacement, or an engine's unprefixing attempt was reverted:
`-webkit-text-size-adjust`, `-webkit-tap-highlight-color`,
`-webkit-user-select`, and `summary::-webkit-details-marker`. See the
inline comment at each declaration in rana.css for specifics. Don't
raise the floor, or add fallbacks for older browsers, without asking.

## Astro version compatibility

Both stylesheets are pure CSS and work under Astro 6 and 7. The pipeline
hooks are the version-sensitive part.

Astro 7 defaults to the Sätteri (Rust) Markdown processor, which skips
remark and rehype plugins. This framework pins the unified pipeline
instead: `examples/astro.config.mjs` sets `processor: unified({...})` via
`@astrojs/markdown-remark`. On Astro 6 that key is a no-op. On Astro 7
it keeps all three hooks below working, at the cost of Sätteri's Rust
build speed on Markdown, which matters on a thousand-page site and
doesn't on a blog.

Migrating to Sätteri later means rewriting three things: the autolink
and tabindex plugins for Sätteri's plugin API, the footnote selectors
(Sätteri runs on pulldown-cmark, and its footnote markup may not match
remark-gfm's `section[data-footnotes]` and `a[data-footnote-ref]`, so
check satteri.bruits.org), and the math rule, since Sätteri emits MathML
instead of KaTeX, so `.katex-display` needs a MathML-targeted rule.

## Hook 1: tabindex on code blocks (rana.css)

`pre:focus-visible` lets keyboard users scroll overflowing code blocks
(WCAG 2.1.1). Browsers don't focus `<pre>` natively, so the pipeline
must inject `tabindex="0"`. `examples/astro.config.mjs` does this with the
`rehypePreTabindex` plugin. Outside Astro, add the same injection to
whatever pipeline renders your Markdown.

## Hook 2: heading anchor links (rana-integrations.css)

`a.heading-link` needs `rehype-autolink-headings` configured with
`className: ['heading-link']` and an `aria-label`; the injected anchor
has no accessible name otherwise. Don't set `tabindex: -1` on the
anchor, since that removes it from keyboard tab order. Run
`rehype-slug` first to generate heading ids. See
`examples/astro.config.mjs` for
the exact options.

## Hook 3: Shiki dual themes (rana-integrations.css)

Dark-mode syntax highlighting needs
`shikiConfig: { themes: { light, dark }, defaultColor: false }`. Without
`defaultColor: false`, every token carries an inline `color` that beats
the variable switch. Dual-theme mode emits
`--shiki-dark` and `--shiki-dark-bg` as inline styles on every token
span. rana-integrations.css switches to them under
`prefers-color-scheme: dark`. The `!important` there is required:
inline styles otherwise beat any stylesheet rule. Unaffected by the
Astro 6 to 7 upgrade, since Shiki 4 ships in both.

## Fonts

rana.css loads exactly 10 static cuts from Bunny Fonts, a GDPR-safe CDN
with no user tracking, via `@import`:

- Source Serif 4: 400, 400 italic, 700, 700 italic (prose, h1-h2)
- Source Sans 3: 400, 700 (h3-h6, tables, footnotes, captions, UI controls)
- Source Code Pro: 400, 700 (code; 700 covers bold tokens in Shiki themes)
- Noto Sans Arabic: 400, 700 (the `:lang(ar)` voice)

`font-synthesis: none` on `html` enforces this manifest: a weight or
style combination without a shipped cut renders at the nearest real cut
instead of a faux-bolded or obliqued fake.

For faster first paint, move the font request into `<head>` and drop
the `@import`:

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link rel="stylesheet" href="https://fonts.bunny.net/css?family=source-serif-4:400,400i,700,700i|source-sans-3:400,700|source-code-pro:400,700|noto-sans-arabic:400,700&display=swap">

Fontsource npm packages, such as `@fontsource/source-serif-4`, are the
self-hosted equivalent, with zero third-party requests.

## HTML head and authoring conventions

The stylesheet assumes the host document provides:

- `<html lang="en">`, or the page's real language. `p, li, blockquote`
  hyphenate via `hyphens: auto`, which needs a `lang` attribute to pick
  a hyphenation dictionary. Without one, the rule silently does nothing.
- `<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">`
  and `content="#11191F"` for dark, so browser chrome matches `--color-bg`.
- `width` and `height` on every `<img>`, to prevent layout shift, and
  `loading="lazy"` on below-fold images. Astro's `<Image />` handles both.
- `translate="no"` on code elements and brand names, if your audience
  uses auto-translation, to stop identifiers from getting garbled.
- Optionally, an SVG favicon with a `<style>` block keyed on
  `prefers-color-scheme`, so the icon follows the system theme.

Authoring conventions, not CSS: use the ellipsis glyph `…` instead of
`...`, curly quotes `" "` instead of straight ones, and a non-breaking
space between a value and its unit, as in `10 MB`.

## Known limitation: theme-switch transition flash

Links, summary, checkboxes, and buttons animate for about 150ms when
`prefers-color-scheme` flips, whether from the OS or a manual toggle.
Fixing that needs JavaScript to suspend transitions during the switch,
which this framework deliberately excludes. The flash is brief and
cosmetic. If a site adds a JS theme toggle later, disable transitions
during the switch at that layer.

## Known trade-off: table semantics

`table { display: block; overflow-x: auto }` lets wide tables scroll
instead of breaking the layout, but some assistive technology loses
table semantics under `display: block`. Where the pipeline allows it,
wrap tables in `<div class="table-wrap" tabindex="0">` instead: put the
overflow on the wrapper and drop `display: block` from the table rule.

A pipeline that can inject attributes but can't restructure to the
wrapper div can patch the lost semantics back with `role="table"`,
`role="row"`, and `role="cell"` on the table, its rows, and its cells.
That's an ARIA fix, so it belongs in the pipeline, not the stylesheet,
the same reasoning as the `aria-label` requirement in Hook 2.
