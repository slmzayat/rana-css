<<<<<<< HEAD
# Rana

Rana styles plain HTML and Markdown output for calm, long-form reading.
Link one stylesheet, and paragraphs, headings, tables, and code blocks
already look considered. No utility classes to learn, no build step,
no JavaScript.

**[Site](https://slmzayat.github.io/rana-css/)** ·
**[Demo](https://slmzayat.github.io/rana-css/demo/)** ·
**[Token reference](https://slmzayat.github.io/rana-css/demo/tokens.html)**

Most classless CSS frameworks trace back to a browser landscape from
before `light-dark()`, `:has()`, and native CSS nesting existed. Rana
starts from today's evergreen browsers instead, so theming,
right-to-left support, and interaction all use the current CSS
platform rather than fallbacks for engines that no longer need them.

## Files

| File | Purpose |
|---|---|
| `index.html` | The marketing page. Feature overview, theme picker, fit guide. |
| `src/rana.css` | The framework. Styles semantic HTML and GFM output. |
| `src/rana-integrations.css` | Optional overlay: Shiki, GFM alerts, KaTeX, heading anchors. |
| `examples/astro.config.mjs` | Reference Astro setup, valid for Astro 6 and 7. |
| `REQUIREMENTS.md` | Pipeline hooks, known trade-offs, browser floor. |
| `demo/index.html` | Open in a browser to see every element styled. |
| `demo/tokens.html` | Token reference: every custom property with live swatches, type scale, and spacing bars. |

## Why Rana

- **Reading-first typography.** Two weights, three voices: serif for
  prose, sans for headings and labels, mono for code. Body text and the top
  headings scale fluidly with the viewport, on a 65ch measure with
  token-driven vertical rhythm.
- **Four themes, one mechanism.** Light, dark, a Flexoki sepia, and a
  Kindle-inspired mint, all driven by `color-scheme` and
  `light-dark()`. Follows the OS automatically, or switch manually
  with three lines of `:has()`. No theme-switch JavaScript.
- **Contrast you can verify.** Every palette is checked against WCAG
  AA; body text targets AAA. Visible focus everywhere,
  keyboard-scrollable code blocks and tables, reduced-motion support.
- **Right-to-left by default, not bolted on.** Logical properties
  throughout, a Noto Sans Arabic voice, and cursive-safe tracking for
  `lang="ar"` content.
- **Real interaction, zero scripts.** Sliding disclosures, animated
  checkboxes, theme cross-fade, and press states, on native elements
  only.
- **One file, no dependencies.** Drop `rana.css` into any static site
  or Markdown pipeline. The optional `rana-integrations.css` adds
  Shiki, KaTeX, and GitHub-style alerts.

## Where Rana fits

Rana is built for reading-first pages: blogs, documentation, essays,
changelogs, anywhere Markdown is the source of truth and the page is
mostly text. If your content is already semantic HTML or GFM output,
Rana styles it with no markup changes.

Rana is not a component library or an app UI kit. It has no grid
system, no modal manager, and no JavaScript widgets. It also expects a
genuinely current browser.

## Size and performance

- `rana.css` is 21 KB unminified with comments, about 6 KB over the
  wire with gzip. `rana-integrations.css` adds 1 KB compressed. There
  is no minified build to manage because there is no build at all.
- Zero JavaScript means zero script parsing, zero hydration, and
  nothing to break with scripts disabled. Theming, disclosure
  animation, and the theme switch all run in CSS.
- All four themes ship in that one file. Theming uses `color-scheme`
  and custom properties, so switching themes repaints; it never loads
  a second stylesheet.
- The largest cost is fonts, not CSS: ten static cuts from Bunny
  Fonts, loaded via `@import` by default. `REQUIREMENTS.md` documents
  the `<link rel="preconnect">` upgrade for faster first paint, and
  the Fontsource route for self-hosting with zero third-party
  requests. Swap the font stack and the framework itself costs 6 KB.
- No dependencies, no preprocessor, no versioned toolchain. The file
  you read in the repo is the file browsers execute.

## Browser floor

Modern evergreen, mid-2026: `light-dark()`, `:has()`, `color-mix()`,
native CSS nesting. Older browsers get light mode and instant
disclosures instead of animated ones.

## Credits

- [Pico CSS](https://picocss.com): slate and azure palette basis
- [Flexoki](https://stephango.com/flexoki) by Steph Ango: sepia palette
- [Source Serif 4, Source Sans 3, Source Code Pro](https://github.com/adobe-fonts)
  by Adobe (SIL OFL), served via [Bunny Fonts](https://fonts.bunny.net)
- [Noto Sans Arabic](https://fonts.bunny.net/family/noto-sans-arabic)
  by The Noto Project Authors (SIL OFL), served via Bunny Fonts
- [Shiki](https://shiki.style): syntax highlighting, with GitHub themes
- [System Font Stack](https://systemfontstack.com): fallback stacks
- Easing curve after [Emil Kowalski](https://emilkowal.ski)'s animation work
- Interface details informed by [Vercel's Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
  and [Rauno Freiberg's Interfaces](https://interfaces.rauno.me)
- Typographic choices follow Matthew Butterick's [Practical Typography](https://practicaltypography.com)
- Marketing-page pictograms from IBM's [Carbon Design System](https://carbondesignsystem.com/elements/pictograms/library/) (Apache 2.0)
- Built with [Claude Code](https://claude.com/claude-code) and Claude Fable 5

## License

[MIT](LICENSE).
=======
# rana-css
CSS for calm, long-form reading
>>>>>>> dbbacd7b33af1fab417b71ed193b1a359c376786
