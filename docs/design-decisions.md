# Rana: design decisions

A record of what was decided, why, and what was rejected. CLAUDE.md holds
the rules; this file holds the reasoning. Newest architecture supersedes
anything older that contradicts it.

## Typography

**Body: fluid 17 to 19px serif, line-height 1.6, 65ch measure.**
Long-form guidance converges on 16 to 20px for sustained serif reading;
Source Serif 4 has a generous x-height so 19px reads large. The 45 to 75ch
canonical range puts 65 at the sweet spot for return-sweep accuracy.
Because the measure is ch-based, the column breathes with the fluid font
size automatically. Rejected: 72ch (an early copy error, never the design),
and any body change during the heading retune; analysis showed the body
was already correct and the headings came down to meet it.

**Heading scale: 32 / 26 / 20 / 16 / 14 / 13px, line-height inverse to
size (1.25 up to 1.5).** The original 40px h1 read as landing-page display
type. The owner requested 32/28/20/16/14; h2 was tuned to 26 because a
32:28 ratio (1.14) is too weak to separate the top two levels. The
uppercase tracked-label treatment moved from h3 (where 20px caps would
shout) down to h5/h6, where small caps read as editorial kickers. h4 at
16px sits below body size on purpose: bold sans against regular serif
separates by voice, not size. Negative tracking stops at h2.

**Two weights (400/700), three voices.** Serif for reading, sans for
interface and metadata, mono for code. `font-synthesis: none` enforces
the manifest: unshipped weight/style combinations fall back to a real cut
instead of browser-faked bold or oblique. Nested emphasis flips to roman
(`blockquote em`, `em em`), which is typographic convention and removes
italic demand from contexts without an italic cut.

**Fonts: 8 static cuts from Bunny Fonts, not variable fonts.** The owner
chose static cuts to avoid shipping full variable files. Serif 400,
400 italic, 700, 700 italic; Sans 400, 700; Mono 400, 700 (Mono 700 exists
because GitHub Shiki themes emit bold tokens). Bunny over Fontsource for
the in-CSS `@import` because Fontsource is an npm model with no CDN URL;
the README documents the `<link>` + preconnect upgrade path and Fontsource
as the self-hosted equivalent. Fallbacks follow systemfontstack.com.
`text-rendering: optimizeLegibility` was rejected in favor of
`font-kerning: normal` (same benefit, no legacy performance baggage).

## Color and theming

**All tokens are `light-dark()` pairs under `color-scheme: light dark`.**
This replaced a duplicated light/dark variable block inside a media query.
The refactor exists because a media query is unreachable from user
controls: with `light-dark()`, a theme switch is a single `color-scheme`
change, achievable with zero JS via `:has()` on a radio. It also themes
native scrollbars, form controls, and dropdowns for free. This raised the
browser floor to mid-2024, accepted deliberately.

**Palettes live in rana.css under `[data-theme]`; pages own only switch
wiring.** Sepia originally lived in the demo's page styles; the owner
correctly objected. The framework cannot know a page's radio IDs, so the
demo keeps a thin `:has()` forwarding shim, but the palette data itself is
framework property. Real sites set `<html data-theme="sepia">`.

**Palettes: Pico slate/azure (light/dark base), Flexoki light (sepia).**
The first sepia was a hand-rolled warm palette; replaced at the owner's
direction with Steph Ango's Flexoki, values annotated with their Flexoki
token names. A POC round of Ayu (light/mirage/dark) and Rosé Pine
(dawn/moon/main) was built and rejected on taste; noteworthy finding from
that round: Ayu Light's link blue fails AA (~2.9:1) with no darker blue in
the palette, while all three Rosé Pine variants are AA-clean.

**Selection is a tinted background only, text color untouched.** A
white-text `::selection` failed contrast in dark mode and was deleted;
the reintroduction uses `color-mix(link 20%, bg)`, which re-resolves per
theme automatically and can never break text contrast.

**Dark-mode buttons use dark ink, not white.** White on the dark theme's
lighter link blue is ~2.6:1, an AA failure found in the lean-pass audit.
`light-dark(#FFFFFF, #11191F)` on button text and the checkbox check
stroke fixes it at ~8:1.

**Contrast standard: AA hard gate; AAA contrast (SC 1.4.6) evaluated.**
Measured: body text passes 7:1 in all themes; only `--color-meta` and
`--color-link` fall short (4.7 to 6.4). In every theme the existing hover
color already passes 7:1, so the upgrade path is "promote hover to link,
add a deeper hover," plus three new meta values. Costs acknowledged:
Flexoki/Pico fidelity breaks on the adjusted tokens, meta darkening
flattens hierarchy texture, and blanket "AAA conformance" claims more
than contrast (SC 1.4.8 paragraph spacing would also bind). Recommendation
on record: claim "AA plus AAA contrast (1.4.6)," not blanket AAA.
Decision pending at time of writing.

## Vertical rhythm

**Nine-step token scale (`--space-3xs` 0.25rem to `--space-3xl` 4rem);
every block margin draws from it.** Replaced nine unrelated ad-hoc values.
Three principles: flow elements carry bottom-only margins; headings and
breakout blocks add tops, resolved by margin collapse; heading space-above
runs ~3x its space-below and scales with level, so a heading visibly
belongs to what follows it. Heading-under-heading compresses to 1rem
(title/subtitle pairs read as a unit). Prose gap is 1.5rem (~0.8 line),
tightened from a full line to match the denser heading scale. Breakouts
(quotes, code, tables, figures, details) share symmetric 2rem. First/last
children of the column are flattened. Strict pixel-grid rhythm was
rejected as impossible under fluid clamp() sizes; proportional rhythm with
a consistent scale is the honest modern equivalent.

## Interaction and motion

**Easing: one strong ease-out curve; durations 150/250ms.** A defined but
never-used ease-in-out token was deleted; `--duration-press` (160ms) was
merged into fast (150ms) as imperceptibly different. 250ms medium exists
for theme cross-fade and disclosure slides.

**Press feedback is scale 0.97 only.** An early `filter: blur(1px)` on
active buttons was cut: blurring label text mid-press reads as a rendering
glitch. Permanent `will-change: transform` was cut for pinning compositor
layers on elements that animate once.

**Hover is gated behind `(hover: hover) and (pointer: fine)` in one
consolidated block.** iOS fires hover on first tap, making linked images
require two taps. Focus-visible variants stay outside the gate. One
image-shadow hover remains nested in the dark media query because it is
scheme-scoped.

**Disclosures slide via `interpolate-size: allow-keywords` +
`::details-content`, with a rotating custom marker.** This replaced a
one-way `@starting-style` fade that only animated opening (and whose
`details[open] *` selector clobbered descendant link transitions, a bug
caught in review). Browsers without `::details-content` snap; accepted as
progressive enhancement (Chromium-first at time of writing).

**Theme switching cross-fades (250ms) on themed surfaces.** Originally
documented as an accepted "flash" limitation of the zero-JS constraint;
the owner asked for it as a feature, so the staggered accident became a
deliberate transition. Interactive elements keep their faster transitions;
the field rule merges both durations so the later declaration does not
clobber the fade.

**Focus: one global `:focus-visible` ring; element rules only add.**
Ten near-identical rules collapsed into one. Two intentional exceptions:
links add a 2px radius, buttons add a halo shadow, and form fields use
`:focus` (not `:focus-visible`) because fields should ring on click too.
The original 15%-alpha focus ring was rejected as nearly invisible.

## Accessibility mechanics

**Links are underlined at rest.** Color-only links fail SC 1.4.1 (the
blue/body distinction is under 3:1). The underline is a real
`text-decoration` with offset, not a border-bottom hack (borders misalign
on wrapped lines). At-rest underline color is a 40% link tint via
color-mix; an earlier `--color-border` underline was rejected as invisible.

**Code blocks and wide tables scroll, and need `tabindex="0"` to be
keyboard-scrollable.** The tabindex is a pipeline responsibility (a rehype
plugin in the Astro config); shipping the CSS without it is a silent
SC 2.1.1 gap, hence the REQUIREMENTS.md entry. `table { display: block }`
is a documented trade-off: some AT loses table semantics; the wrapper-div
alternative is on record as preferred where the pipeline allows.

**Reduced motion:** the kill-block zeroes all transitions and animations
under `prefers-reduced-motion: reduce`; smooth scroll is opt-in under
`no-preference`. The lean pass removed a redundant `scroll-behavior: auto
!important` from the kill-block because the gate already means smooth
scroll never exists for reduce users.

**Unchecked checkbox borders use meta, not border color** (border gray was
1.2:1, failing SC 1.4.11). Footnote refs/backrefs carry 0.5rem padding
with negative margins for touch-target size; a later fix pulled the
backref glyph back to a word-space gap without shrinking the target.

## Architecture

**No renderer classes as primary hooks.** Task lists key off
`:has(> input[type="checkbox"])`; footnotes off GFM's
`section[data-footnotes]` / `a[data-footnote-ref]` attributes. Legacy
class fallbacks (.footnotes, .contains-task-list, etc.) were carried for
one era and then deleted: the `:has()`/`light-dark()` browser floor means
any browser running the framework supports the modern selectors.

**Two files: rana.css (core) + rana-integrations.css (renderer overlay).**
Shiki, GFM alerts, KaTeX, and heading anchors are couplings to specific
tools and live in the overlay; the core stays renderer-agnostic. The
overlay duplicates the pre styling it needs so each file stands alone.

**Shiki: dual themes with `defaultColor: false`.** Both palettes arrive
as `--shiki-light`/`--shiki-dark` variables on every token, so theme
choice is pure cascade: the overlay picks light by default and dark under
the media query; a manual switcher overrides with higher specificity.
The default output (light baked inline) was rejected because a forced
light theme under a dark OS could not restore the light tokens. The panel
background is forced to `--color-code-bg` so the code surface follows the
active theme (including sepia) while token colors stay Shiki's. The demo
pre-renders Shiki at build time; zero runtime JS.

**GFM alerts are an integration, not core.** Vanilla GFM leaves
`> [!NOTE]` as a plain blockquote (legible, honest); with
rehype-github-alerts, the overlay colors five types using GitHub's hues as
light-dark() pairs over a color-mix background tint, so custom light
palettes (sepia) resolve without a third definition.

**Astro: pinned to the unified pipeline, both v6 and v7.** Astro 7's
default Sätteri processor does not run remark/rehype plugins, which the
framework's three hooks require (pre tabindex, autolink headings, Shiki
dual themes). `processor: unified({...})` is a no-op on v6 and the
explicit opt-out on v7. The Sätteri migration checklist (rewrite two
plugins, verify pulldown-cmark footnote markup, swap KaTeX rule for
MathML) is in REQUIREMENTS.md. Rationale: for a blog-scale site, plugin
stability beats Rust build speed.

**Heading anchors: `tabindex: -1` is forbidden on the injected anchor.**
It removes the anchor from tab order and dead-ends its focus-visible rule;
this bug shipped once in a config draft and was reverted.

## Content and naming

**Demo copy: plain language, active voice, names each Markdown element,
no " — " constructions, real prose (Walden) instead of lorem ipsum.**
The demo doubles as documentation and as the visual regression suite;
highlight.js was removed from it because two script tags on a zero-JS
framework's proof page were self-defeating.

**Name: Rana; npm package: rana-css.** `rana` is taken on npm (2021 to
2023 releases). Display name and package name diverge by necessity;
a scoped `@owner/rana` remains an open alternative. Not yet published;
publishing requires explicit go-ahead.

**"Classless" was dropped from public copy** at the owner's direction in
favor of "styles default HTML and Markdown/GFM output directly," which
says what it does rather than what it lacks.

## Practical Typography pass

A review against Matthew Butterick's Practical Typography, adopting the
points that fit a classless framework and rejecting the ones that assume
a specific tool or authorial control Rana doesn't have.

**Adopted: blockquotes stop shouting.** Quoted text was body size, italic,
with a heavy 3px rule; Butterick's point is that a block quotation is
still body prose and should read as such, not as decorative display type.
Now `blockquote` matches body font-size and line-height, `font-style:
normal` (italic is for emphasis, not for "this is a quote"), and the rule
drops to 1px to match the framework's other hairline borders (table rules,
card borders). Indent and `--color-meta` stay: the indent is the actual
quotation signal, and the muted color still separates quoted from
authorial text. The `blockquote em` roman-flip exception was removed from
the nested-emphasis selector list along with it: now that blockquotes are
roman by default, emphasis inside one behaves like emphasis anywhere else
and doesn't need a special case. Verified against the demo's Eames quote,
the triple-nested quote block, and the GFM alerts (which extend
blockquote and inherit the new baseline correctly).

**Adopted: oldstyle figures in prose, lining figures in tables.** Butterick's
default: oldstyle numerals (varying heights, some with descenders) belong
in running text because they behave like lowercase letters and don't
interrupt the reading rhythm; lining numerals (uniform cap-height) belong
in tables because columns of figures need to align. `body` gets
`font-variant-numeric: oldstyle-nums`; the table rule changes from
`tabular-nums` alone to `lining-nums tabular-nums` so it opts back in
explicitly rather than inheriting the new body default. Source Serif 4,
Source Sans 3, and Source Code Pro all ship the `onum`/`lnum` OpenType
features in their static Bunny cuts, so no font swap was needed.

**Adopted: hyphenation on prose blocks.** `hyphens: auto` (plus the
`-webkit-` prefix Safari still wants) on `p, li, blockquote`, with
`hyphenate-limit-chars: 6 3 3` so a hyphenation break needs a reasonably
long word and leaves at least 3 characters on each side of the break.
This tightens the ragged edge of justified-feeling body text at the 65ch
measure, especially on narrow viewports where fewer words fit per line.
Browser hyphenation dictionaries are keyed off the `lang` attribute, so
this is a documented HTML requirement (REQUIREMENTS.md), not a pure CSS
guarantee; the demo already declares `lang="en"`.

**Adopted: no ligatures in code.** `font-variant-ligatures: none` on
`pre, code, kbd`. Standard ligatures (fi, fl, ffi) exist to smooth
reading prose; in monospaced code they can disguise character sequences
that matter (`!=`, `->`) or that a font's stylistic-ligature set might
merge unexpectedly. Code should render exactly the characters typed.

**Adopted: table header rule matches body rules.** `th`'s bottom border
dropped from 2px to 1px, matching every other hairline in the framework
(table row dividers, blockquote rule, card/detail borders). The 2px
weight was left over from an earlier pass and wasn't doing anything a
consistent 1px plus the existing bold weight and heading color doesn't
already do to separate header from body.

**Rejected: true small caps for h5/h6.** Butterick prefers real small
caps (`font-variant-caps: all-small-caps`) over faux uppercase-plus-tracking
for label-style text. Not adopted: none of the three shipped weights
(Source Sans 3 400/700) include a small-caps OpenType table, so the
browser would synthesize small caps by scaling down regular capitals,
which is exactly the kind of faux-styling `font-synthesis: none` exists
to prevent elsewhere in this framework. Revisit only if a small-caps cut
is added to the font manifest.

**Rejected: curly-quote and en/em-dash enforcement in CSS.** Butterick
treats straight quotes and double-hyphen dashes as authoring mistakes to
fix in the text itself. This is correct but out of scope for a
stylesheet: rana.css styles whatever characters the document contains and
doesn't rewrite content. The existing copy-convention rule (curly quotes,
ellipsis glyph, no em-dash constructions) already covers this at the
authoring layer for Rana's own demo and docs.

**Rejected: reducing the 65ch measure or increasing line-height further.**
Butterick's ranges (45–90 characters, depending on source) already bracket
Rana's existing 65ch/1.6 choice, which docs/design-decisions.md's
Typography section already justifies in detail. Nothing in this pass
changed that math.

## Practical Typography pass: tables and lists

A second pass, this time against
[practicaltypography.com/tables.html](https://practicaltypography.com/tables.html)
and
[/bulleted-and-numbered-lists.html](https://practicaltypography.com/bulleted-and-numbered-lists.html),
triggered by the owner disliking the faded bullet/number markers.

**Adopted: list markers read at full ink, not `--color-meta`.** The
marker rule was `color: var(--color-meta)`, on the theory that a marker
"steps back so the text leads." In practice this reads as faded and
undersells the list signal, which is the opposite of Butterick's point
that a marker should be "big enough to be noticeable." `li::marker` now
sets `color: inherit`, so it renders in the same ink as its item text.
Bonus: this made a second, verbatim-duplicate `li::marker { color:
var(--color-meta) }` rule under the Footnotes section visible as a real
bug, not just dead code — same specificity, later in source order, so it
was silently re-fading every marker on the page (not just footnote ones)
by winning the cascade. Deleted. Footnote list markers still land on
meta automatically, with no rule of their own, because `section
[data-footnotes] ol` sets `color: var(--color-meta)` and `inherit`
carries it down.

**Adopted: numbered-list indices get a distinct voice.** Butterick notes
"list indices can be set in a different font ... than the list item
text." `ol > li::marker` now sets sans-serif, bold, and
`lining-nums tabular-nums`, so index digits stay upright and aligned
instead of picking up the body's oldstyle figures (which vary in height
and would make a numbered column ragged). This mirrors the framework's
existing pattern of using the sans voice for structural/label content
(h5/h6, table headers, captions) versus serif for reading prose. Bulleted
lists (`ul`) keep the plain inherited marker: a bullet isn't a numeral, so
there's no alignment problem for a distinct voice to solve, and adding one
anyway would be decoration without a reason.

**Adopted: more inline breathing room in table cells.** `th, td` inline
padding went from 1rem to 1.25rem. Butterick's core table rule is to
strip all cell borders and let increased cell margins carry the grid
instead; rana.css already had zero vertical rules and only a hairline
under each row plus a stronger one under the header, so the outstanding
lever was margin, not more borders. Block padding (0.75rem) is unchanged;
the row height was already comfortable and this is a column-legibility
fix, not a density fix.

**Rejected: zebra striping.** Not mentioned in Butterick's table page at
all (its guidance stops at borders and margins), and it would cut against
the borderless, quiet-grid look the rest of the table rule already
commits to.

**Rejected: hollow (unfilled) bullets.** Butterick calls hollow bullets
"more subtle" than solid discs. Rejected here on purpose: the owner's
complaint was that markers already read as too faded, and a hollow bullet
reads lighter than a filled one regardless of ink color. Full-ink solid
discs solve the actual complaint; going hollow would reintroduce the same
problem in a different form.

**Rejected: uppercase/tracked `th` labels.** The h5/h6 "small-label"
treatment (uppercase, tracked, sans) was considered for table headers
too, for consistency with the framework's structural-label voice. Not
adopted: `th` is already bold sans with its own rule weight, which is
enough separation from `td`; uppercasing arbitrary column headers can
mangle author-cased text (acronyms, proper nouns) in a way the framework
has no way to detect or guard against.

**Rejected: numeric column alignment (right/decimal-align).** Practical
Typography implies numeric columns read better right- or decimal-aligned,
but detecting "this column is numeric" from plain semantic HTML with no
renderer hooks isn't possible in CSS alone (no per-column type metadata
exists in a classless table). Left as `text-align: start` for every cell,
consistent with the framework's no-renderer-classes constraint; a
pipeline that can tag numeric columns could add alignment as a targeted
override.

## Wide-table follow-up: nowrap cells, sticky first column

The owner liked the demo's first table (four short columns) but found the
second (six columns, one a full-sentence "claim to fame" column) hard to
read. Measuring the live render explained why: `table-layout: auto`
squeezed all six columns to fit the 65ch measure and wrapped the long
column instead of overflowing, ballooning every row to 168 to 193px so a
single row spanned four or five wrapped lines per cell. The table's own
`overflow-x: auto` barely engaged (630px of content in a 621px box) because
wrapping, not overflow, was absorbing the excess width. The demo's own
caption ("scrolls sideways instead of breaking the layout") was a promise
the CSS wasn't actually keeping.

**Adopted: `white-space: nowrap` on `th, td`.** Forces one line per cell.
A cell that needs more room now makes the table wider instead of taller,
and the existing `overflow-x: auto` turns that into a real horizontal
scroll. After the change, both demo tables render at a uniform ~49px row
height; the second table's `scrollWidth` (1097px) now genuinely exceeds
its `clientWidth` (621px), where before the gap was 9px. Table 1 is
unaffected since none of its cells needed to wrap in the first place.

**Adopted: sticky first column.** `tr > :first-child { position: sticky;
inset-inline-start: 0; background-color: var(--color-bg) }`. Once cells
stop wrapping, wide tables scroll more often and further; without an
anchor, scrolling right loses the row label that gives the rest of the
row meaning. The first cell now stays put (confirmed: its `left` was
identical before and after a 300px `scrollLeft`) while the remaining
columns slide underneath it. `background-color` is required so scrolled
content doesn't show through underneath the pinned cell; `var(--color-bg)`
is correct here because the table sits directly on the page background
with no surface of its own, the same variable `html` itself uses.
Deliberately no separator border on the sticky edge: the framework's
table rule already rejects vertical rules as clutter, and the opaque
background alone is enough of a seam. Inert (not just harmless) on any
table that already fits without scrolling, so it needed no conditional
logic and no renderer hook to detect "this table happens to be wide."
