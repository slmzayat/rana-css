# Rana

**Rana — a CSS framework for calm, long-form reading.**

Write plain HTML or Markdown (including GitHub Flavored Markdown); Rana
styles the default output directly. No utility classes to learn, no
JavaScript to ship.

## Files

| File | Purpose |
|---|---|
| `rana.css` | The framework. Styles semantic HTML and GFM renderer output. |
| `rana-integrations.css` | Optional overlay: Shiki code themes, GFM alerts, KaTeX, heading anchors. |
| `astro.config.mjs` | Reference Astro setup (pinned unified pipeline, Astro 6/7). |
| `REQUIREMENTS.md` | Pipeline hooks, known trade-offs, browser floor. |
| `demo/` | A test suite that doubles as documentation. Open it in a browser. |

## Highlights

- Two-weight, three-voice typography: serif for reading, sans for interface,
  mono for code. Fluid sizes, 65ch measure, token-driven vertical rhythm.
- Native theming with `color-scheme` + `light-dark()`. Follows the OS, or
  switch manually with three lines of `:has()` — no scripts. Ships light,
  dark, and a Flexoki sepia example.
- WCAG AA throughout: visible focus everywhere, keyboard-scrollable code
  blocks and tables, reduced-motion compliance, contrast-checked palettes.
- Interaction polish on native elements only: sliding disclosures via
  `::details-content`, animated checkboxes, theme cross-fade, press states.

## Browser floor

Modern evergreen (mid-2026): `light-dark()`, `:has()`, `color-mix()`,
native CSS nesting. Older browsers get light mode and instant
(non-animated) disclosures.

## Credits

- [Pico CSS](https://picocss.com) — slate/azure palette basis
- [Flexoki](https://stephango.com/flexoki) by Steph Ango — sepia palette
- [Source Serif 4, Source Sans 3, Source Code Pro](https://github.com/adobe-fonts)
  by Adobe (SIL OFL), served via [Bunny Fonts](https://fonts.bunny.net)
- [Shiki](https://shiki.style) — syntax highlighting, with GitHub themes
- [System Font Stack](https://systemfontstack.com) — fallback stacks
- Easing curves after [Emil Kowalski](https://emilkowal.ski)'s animation work
- Interface details informed by [Vercel's Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
  and [Rauno Freiberg's Interfaces](https://interfaces.rauno.me)
- Typographic refinements after Matthew Butterick's [Practical Typography](https://practicaltypography.com)

## License

MIT (or your preference — update before publishing).
