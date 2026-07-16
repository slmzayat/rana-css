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

**Fonts: 10 static cuts from Bunny Fonts, not variable fonts.** The owner
chose static cuts to avoid shipping full variable files. Serif 400,
400 italic, 700, 700 italic; Sans 400, 700; Mono 400, 700 (Mono 700 exists
because GitHub Shiki themes emit bold tokens); Noto Sans Arabic 400, 700
for the `:lang(ar)` voice. Bunny over Fontsource for
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
Decision executed: see "Fixed: contrast" further down for the shipped
values and the knock-on effects that were checked before shipping them.

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

## Browser floor raised: mid-2024 to mid-2026

Moved the stated floor forward two years and swept both stylesheets for
anything that only existed to serve the old one. Nothing here changed
computed style; it is a subtraction and consolidation pass.

**Removed: `-moz-osx-font-smoothing`.** Firefox 128 (2024) began aliasing
`-webkit-font-smoothing: antialiased` to the exact effect the Mozilla
property provided, confirmed via the WebKit-aliasing intent thread on
mozilla.dev-platform. Keeping both was pure redundancy once Firefox
reads the WebKit one directly. `-webkit-font-smoothing` itself stays:
still non-standard, still required, no engine has a spec-track
replacement.

**Removed: `-webkit-hyphens`.** Safari shipped unprefixed `hyphens` in
Safari 17 (September 2023), confirmed against the WebKit 17.0 feature
blog post. Every engine in the mid-2026 floor is well past that.

**Kept, and now documented inline, three prefixes that looked removable
but verified otherwise:** `-webkit-text-size-adjust` (Safari has never
shipped an unprefixed version, and Firefox has no equivalent at all, so
both declarations stay); `-webkit-tap-highlight-color` (non-standard,
no replacement proposed anywhere); `-webkit-user-select` (WebKit's own
unprefixing patch, bug 208677, shipped and was reverted in 2022 over an
Outlook-on-iOS regression, and remains unshipped per Interop 2025
tracking). The lesson worth keeping: caniuse's rendered summary claimed
Safari had "always" supported plain `user-select`, which was wrong;
only reading WebKit's own bug tracker and changeset history surfaced the
revert. Don't trust a single secondary source on prefix history again.

**Removed: `summary::-webkit-details-marker`? No** — checked and kept.
Safari still won't hide the native disclosure triangle via `list-style:
none` or `::marker` on `<summary>`; the non-standard pseudo-element is
still the only way. Added a comment so a future pass doesn't re-remove
it on the assumption that `list-style: none` (already present on
`summary`) is sufficient.

**Adopted: native CSS nesting, selectively.** Verified relaxed nesting
(bare type selectors as the first nested rule, no `&` required) and
nested at-rules both reached Chrome 120, Firefox 117, and Safari 17.2 by
December 2023 — comfortably inside the new floor. Applied only where a
literal repeated selector prefix already existed across separate rules
for the same component: `figure` + its `img/video/iframe` override,
the four `li input[type="checkbox"]` state rules, the `details` +
`::details-content` pair, the four-rule `.astro-code`/`.shiki` Shiki
block (which also nests its `@media (prefers-color-scheme: dark)`
override), and `.markdown-alert` + its `> p` rules. Every merge flattens
to the exact original selector list and specificity; none was verified
by eye alone, each was diffed against the pre-nesting selector.

**Explicitly left flat:** the hover media-query block (`h1 a:hover` through
`h6 a:hover`, and the rest) was not touched, even though `:is()` nesting
would have shrunk it too — CLAUDE.md calls out "the single hover media
block" as an invariant to preserve exactly, and restructuring its
internal selectors, even losslessly, wasn't worth the risk of that being
read as a violation. Also left flat: `pre`/`pre code` (the saving was one
repeated word, not worth the added visual nesting depth), the form
element rules (input/textarea/select/button selector lists overlap
irregularly, no clean common parent to nest under), and
`a[data-footnote-ref], a[data-footnote-backref]` plus its `-backref`-only
follow-up rule (nesting would have required attaching an attribute
selector to an `:is()`-flattened `&`, which is harder to read than the
two flat rules it would replace, not easier).

## Backlog implementation pass: forms, native elements, print, correctness fixes

A large batch from docs/backlog.md, everything except motion philosophy
(already a deliberate, recorded choice), the OpenType curiosity
(speculative, no known problem), and sidenotes (a real feature, not a
fix, needs its own design conversation).

**Adopted: `--color-error` and `--color-success` tokens.** New root-level
custom properties, `light-dark(#CF222E, #F85149)` and
`light-dark(#1A7F37, #3FB950)`. Same hex pairs as the existing GFM alert
caution/tip colors in rana-integrations.css, chosen for visual
consistency across the framework rather than inventing a second red and
green. Not derived from the alert colors via `var()`, rana.css can't
depend on rana-integrations.css, so the values are independently
declared and happen to match. Sepia gets no override: sepia sets
`color-scheme: light`, so it resolves to the same light branch these
already use, and that branch already has enough contrast against
sepia's paper background.

**Adopted: `:user-invalid` / `:user-valid`, not `[aria-invalid]`.**
Covered in detail during the ARIA discussion already in the backlog:
`aria-invalid` is normally toggled by JavaScript after a blur or a
failed submit, specifically so an empty required field doesn't look
wrong before the user has touched it. Rana ships no JS to do that
timing. `:user-invalid`/`:user-valid` are native CSS, need no ARIA and
no script, and, importantly, verified during testing to require an
actual value change, not just a focus-and-blur on an empty field. That
matches the same "don't shame an untouched field" intent the JS-driven
approach was trying to achieve, for free.

**Adopted: `accent-color` for standalone checkboxes, radios, ranges,
`<progress>`, and `<meter>`**, instead of a custom `appearance: none`
rebuild. Found in Chota's stylesheet: the browser draws its own native
control tinted to the theme color, effectively free. Verified this
coexists cleanly with the task-list checkbox's existing custom
`appearance: none` treatment: `accent-color` only affects the native
widget, and task-list checkboxes have already suppressed that widget, so
the property is simply inert there, no conflict, no override needed.

**Adopted: `svg { max-inline-size: 100% }` as its own rule, not folded
into the `img, video, iframe` block.** That rule forces `display: block`
and centers its subjects, correct for a standalone photo or embed, wrong
for a small inline SVG icon sitting in a sentence. The only real
complaint was overflow, so only the overflow guard was added; inline
icons stay inline.

**Adopted: widen the top-margin reset to `<details>` and `<dialog>`.**
Found while studying Simple.css: Rana's `body > :is(main, article) >
:first-child` reset only ever covered the top-level document wrapper.
A heading placed right after a `<summary>` still got its full
`margin-block-start`, up to 3rem for an h2, reading as a large gap at
the top of an open panel. The fix is `details > summary + *`, not
`details > :first-child`: the summary itself is always the details
element's first child, so a naive `:first-child` selector would never
reach the actual content. Confirmed with a synthetic
`<details><summary>...</summary><h2>...</h2></details>`: margin-block-start
computed to 0 after the fix, would have been 3rem before it. `dialog >
:first-child` is the simpler, correct form for dialog, since dialog has
no summary-equivalent control element ahead of its content.

**Adopted: `fieldset`/`legend`, `legend` styled as a label, not a
heading.** Border, radius, and padding on `fieldset` matching the
framework's other bordered surfaces (details, code blocks, inputs).
`legend` reuses the exact h5/h6 voice: sans, bold, small, tracked,
uppercase, meta-colored. Found in Chota: its legend treatment happened
to already match that voice almost exactly, which is a good sign it's
the right register for a form-grouping label rather than a new one
invented for this occurrence.

**Adopted: extended input type coverage.** `input[type="text"]` through
`input[type="color"]`, now including `password`, `tel`, `url`, `number`,
`date` and its variants, sharing the same border, padding, radius, and
focus treatment as `text`/`email`/`search` always had. This was the
single most corroborated finding across every framework audited (Pico,
MVP, Sakura, Chota all have the identical blind spot); Rana closes it
rather than joining the list of frameworks that don't.

**Adopted: `input[type="file"]` and `::file-selector-button`.** The
input itself loses its border (file inputs render inconsistently across
engines when bordered like a text field); the button part gets the same
sans, bold, themed-link-color treatment as the framework's other
buttons, so it doesn't look like an unstyled foreign control next to
them.

**Adopted: `dl`/`dt`/`dd`.** Found while cross-checking MVP.css: Rana's
own demo has always had a "Definition lists" section showing `dl`/`dt`/
`dd` as a supported feature, while the stylesheet had zero rules for any
of the three. `dt` gets the same bold, heading-colored treatment as
`th`, term-as-header is the same relationship column-header-to-cell is.
`dd` drops the UA default 40px inline indent to stay flush with the
rest of the column's rhythm, matching how blockquote and lists already
avoid a deep, old-fashioned indent.

**Adopted: `table caption`.** `caption-side: bottom`, sans, small,
meta-colored, `text-align: start`. Deliberately mirrors `figcaption`'s
voice and its "quiet label after the content" position, but kept
start-aligned rather than centered: figcaption centers because it sits
under a centered image, but tables are full-width blocks, and centering
a caption over a wide table reads as disconnected from it.

**Adopted: `cite { font-style: italic }`.** Previously relied on the
browser default (also italic) with no explicit rule. Made explicit for
the same reason most of this framework states values that happen to
match the UA default anyway, an explicit rule documents the choice and
protects it from a future browser change, rather than leaving it to
accident. Confirmed this doesn't fight the existing `cite em { font-style:
normal }` roman-flip rule, which still only concerns nested emphasis
inside an already-italic citation.

**Adopted: `<dialog>` and `::backdrop`.** Background, color, border, and
padding matching the framework's other surfaces; added to the shared
theme cross-fade transition list alongside `details`. No open/close
animation, unlike `<details>`, `dialog::backdrop` has no equivalent to
`::details-content` for a CSS-only slide, and faking one would mean
reaching for `@starting-style` and discrete transitions on `display`,
meaningfully more code for an effect the framework doesn't guarantee
elsewhere either. Demo shows a statically `open` dialog: true modal
behavior needs `.showModal()`, which needs JavaScript Rana doesn't ship,
so the demo documents that limitation in its own copy rather than
pretending to demonstrate something it can't.

**Adopted: `[hidden]` specificity fix.** Found during the html5-boilerplate
audit: `li:has(> input[type="checkbox"]) { display: flex }` has
specificity (0,1,1), higher than the UA stylesheet's `[hidden] {
display: none }` at (0,1,0), so a task-list item marked `hidden` would
still render. Fixed by excluding it directly, `:not([hidden])`, rather
than adding a competing `[hidden] { display: none }` rule with
`!important`, which would have been a blunter, less targeted fix for a
single narrow case.

**Adopted: a real print stylesheet**, not just hiding page chrome (Rana
has none to hide). White background, black text, printed link and abbr
titles, `break-inside: avoid` on `pre`/`blockquote`/`tr`/`img`/`figure`,
orphan and widow control on `p`/`h2`/`h3`, no page break right after a
heading. The one deliberate departure from the classic h5bp/Simple.css
version both this list was built from: neither forces `color: #000`
with a blanket `*` selector, only on `body`, because GFM alerts and
Shiki code blocks carry real meaning through color (severity, token
highlighting) that a global black-text override would erase. Those two
components get `print-color-adjust: exact` in rana-integrations.css
instead, a nuance surfaced while studying emilkowal.ski's production
CSS, so their tinted backgrounds and border colors survive printing
without the reader needing to enable "background graphics" in their
print dialog.

**Adopted: `scrollbar-color` and `scrollbar-width: thin` on `html`.**
Found in emilkowal.ski's compiled CSS: the standard property, not the
old `::-webkit-scrollbar` pseudo-element hack, tinted to `--color-border`
over a transparent track. One rule, inherited by every scrollable
descendant including `pre` and `table`, no per-component repetition
needed.

**Verification note:** this session's browser tool has a known,
previously documented limitation where a genuinely dynamic pseudo-class
match, confirmed correct via `.matches()` and a full resolved-cascade
walk of the stylesheet, doesn't always show up in a subsequent
`getComputedStyle` read. Re-confirmed here for `:user-invalid` after a
real, physical type-and-blur interaction (not just a synthetic one, as
in the earlier `:checked` finding), which rules out "synthetic events
don't count" as the explanation and points more firmly at the tool
itself. Static-state checks (the `details`/`dialog` margin fix, `accent-color`
values, `scrollbar-color`, fieldset/legend, extended input borders, `dl`/
`dt`/`dd`, table caption, `cite`, inline `svg`, and both `@media print`
blocks' parsed structure) all verified cleanly.

## Applied Emil Kowalski's animation skill

Studied github.com/emilkowalski/skills and went through every transition
in rana.css against it. The custom easing curve already in use,
`cubic-bezier(0.23, 1, 0.32, 1)`, is the skill's own recommended
ease-out value verbatim, and the framework already transitions only
`transform`/`opacity`/color properties (never `transition: all`, never a
layout-triggering property except the one deliberate, documented
exception below), and already uses CSS transitions rather than
keyframes everywhere, so it's interruptible by design. Confirms the
existing architecture was already sound; the changes below are
refinements, not a rebuild.

**Adopted: a decision tree instead of one curve for everything.** The
skill's actual rule: entering elements get ease-out, on-screen
morphing gets ease-in-out, plain color and hover changes get `ease`
with no custom curve at all. Reclassified every transition in the
file against this:

- Color-family transitions, the theme cross-fade list, link and
  footnote-link hover color, input border/shadow/background on focus,
  button and checkbox background, summary's own color, now use plain
  `ease`. None of these are movement; they were borrowing the strong
  entrance curve for no reason.
- Genuine entrances keep `--ease-out-strong`: the checkbox
  checkmark draw, the button press scale, the image hover-lift.
- Genuine morphs get a new `--ease-in-out: cubic-bezier(0.77, 0,
  0.175, 1)` token, the skill's own recommended value: the details
  panel's expand/collapse, and the summary marker's 90-degree rotation
  in place (a rotation is not an entrance, nothing is arriving).
- Where a single declaration bundled both families together (button:
  background-color and transform in one list; the marker: color and
  transform in one list), split them so each property gets the curve
  that matches what it's actually doing, not whatever the rest of the
  declaration happened to use.

**Adopted: exit faster than entry, for the one interaction where it was
easy to get right safely.** The details panel's `::details-content`
transition-duration is now asymmetric: `--duration-fast` (150ms) on the
base (closing) state, overridden to `--duration-medium` (250ms) on
`&[open]` (opening). Matches the skill's own framing: slow where the
user is deciding to look at something, fast where the system is just
getting out of the way.

**Tried and reverted: the same asymmetric fade-and-scale treatment for
`<dialog>`.** Built the standard `@starting-style` plus
`transition-behavior: allow-discrete` pattern (verified `@starting-style`
and `allow-discrete` are both supported since Chrome 121, Safari 17.5,
Firefox 129, comfortably inside the floor). It works correctly for a
dialog opened and closed through `.showModal()`. It does not work for a
`<dialog open>` present in the initial HTML with no JS ever toggling
it: confirmed by testing that such a dialog gets stuck at `opacity: 0`
permanently, matching `dialog[open]` correctly per `.matches()`, but
never actually painted, because no discrete open/close event ever fires
to carry it from the `@starting-style` value to the resting one. Since
Rana ships no JS and can't guarantee every consumer opens their dialogs
programmatically rather than serving one already open, shipping this
would risk a genuinely invisible dialog in a real, plausible case, not
just a demo artifact. Reverted to the plain, static dialog styling from
the previous pass. This was already the original call
("no CSS-only equivalent to `::details-content` for dialog... reaching
for `@starting-style`... meaningfully more code for an effect the
framework doesn't guarantee elsewhere either"); revisited it under the
new animation skill's guidance and it held up for a concrete, testable
reason this time instead of just a hunch.

**Adopted: a missed-opportunity fix.** `a[data-footnote-ref]` and
`a[data-footnote-backref]` had no transition at all, so their hover
color changed instantly while every other link on the page fades. Added
the same `color`/`text-decoration-color` `ease` transition regular links
already have.

**Found and fixed, unrelated to the skill but found while auditing
every transition in the file:** the demo's own back-to-top button
referenced `var(--duration-press)`, a custom property that has never
existed in rana.css. An invalid `var()` reference inside a shorthand
invalidates the whole declaration, so its entire `transition` property
was silently dropped, color, border-color, and the press scale were
all instant. Replaced with `--duration-fast`, matching the same
button-press pattern used everywhere else, and split its color
properties to `ease` per the same decision tree.

**Found and fixed, also unrelated to the skill:** the demo's page-level
`<style>` block still had its own `fieldset { border; border-radius;
padding }` rule, added back when rana.css had no fieldset styling at
all. Now that rana.css styles fieldset natively, that page-level rule
was silently winning the cascade (same specificity, later in source)
and made the new framework rule dead code for the one page that
exercises it. Removed the redundant box styling; kept the page-specific
`fieldset label` and `fieldset input[type="radio"]` spacing rules, since
those are about the theme switcher's own compact horizontal layout, not
something rana.css should dictate generically.

**Fixed: the demo's inline SVG example was illegible.** Shipped at
`width="256" height="256"` inside a sentence, it rendered at its full
intrinsic size since `max-inline-size: 100%` never had to constrain it
against a ~620px column, huge next to body text. Resized to a real icon
scale (16px, matching the surrounding line height) and changed the
example from a circle to a small star, so the demo actually demonstrates
"inline icon," which was the point, instead of "oversized shape stuck
in a paragraph."

## Screenshot-driven fixes: spacing, dialog overlap, contrast, and the corner arrow

Four issues raised directly against rendered screenshots, not audits.

**Fixed: asymmetric top/bottom spacing inside `<details>`.** The
`details > summary + *` fix (widening the top-margin reset) only ever
covered the top. The bottom had no equivalent: a paragraph inside a
details panel kept its own `margin-block-end` (1.5rem), stacking with
the panel's own 1rem padding for roughly 2.5rem of air at the bottom
against roughly 1rem at the top. Widened the existing `:last-child`
margin-block-end reset (already scoped to the top-level document
wrapper) to also cover `details > :last-child` and `dialog >
:last-child`. Confirmed: a details panel's last paragraph now computes
to `margin-block-end: 0`.

**Fixed: a statically-open `<dialog>` overlapped the section after
it.** The browser's own UA stylesheet gives every `<dialog>` `position:
absolute` by default, modal or not; `:modal` additionally gets `position:
fixed` for the true centered-overlay case. Rana's dialog rule never
touched `position`, so a `<dialog open>` rendered outside `.showModal()`
(exactly what the demo shows, and a legitimate pattern for a real
consumer too, e.g. an always-visible callout using dialog markup)
floated absolutely positioned over whatever came next in the document,
in this case obscuring the "Code inside a quote" section entirely.
Added `dialog:not(:modal) { position: static }`, scoped to exclude
`:modal` so a real, JS-invoked modal keeps the UA's own fixed,
centered, top-layer behavior untouched. Also added `dialog:not(:modal)`
to the breakout margin-block rhythm (`pre, blockquote, table, figure,
details`), since a `position: static` dialog now needs the same
top/bottom air those get, and switched the dialog's own `margin: auto`
to `margin-inline: auto` so it only centers horizontally and doesn't
fight the block-direction margins the breakout rule now provides.
Confirmed: computed `position` is `static`, and the next heading's
bounding box no longer overlaps the dialog's.

**Removed: the fixed corner "back to top" arrow.** Always visible
regardless of scroll position, which is exactly the complaint, a
reader at the top of the page has no use for a button that takes them
to the top of the page. The honest options were: make it appear only
past some scroll distance (needs either JavaScript, which the demo
doesn't ship, or scroll-driven animation techniques immature enough
not to risk on a whim), or remove it. Removed it, its CSS, and the
now-orphaned `--duration-press` reference along with it. The link's
target, `<header id="top">`, was left in place since removing an id
some other page might link to costs nothing; nothing in the demo
references it now.

**Fixed: contrast. `--color-meta` and `--color-link` were AA, not the
project's own stated AAA target.** This was flagged directly ("quotes
hard to read in dark mode") and confirmed by computing real WCAG
contrast ratios rather than eyeballing them: `--color-meta` measured
5.69:1 (light), 4.72:1 (dark), 4.97:1 (sepia) against their
backgrounds, all clearing the 4.5:1 AA floor but well short of the 7:1
AAA target this project committed to (see "Contrast standard" above,
which had already flagged this exact gap and left it "pending"). Dark
mode's 4.72:1 was the closest to an outright AA failure, which lines up
with it being the one actually complained about.

- New `--color-meta`: `#46596D` (light), `#9FA6B2` (dark), `#565552`
  (sepia). Each computed to land at 7.0 to 7.3:1 against its own
  `--color-bg`, found by bisecting lightness in HSL space while holding
  hue and saturation constant, so each stays recognizably the same
  muted blue-gray (or, for sepia, the same neutral warm gray) rather
  than becoming a different color entirely.
- `--color-link` and `--color-link-hover`: the plan already on record
  ("promote hover to link, add a deeper hover") is exactly what
  shipped. The old hover color already cleared 7:1 in every theme
  (7.64/7.97/8.04), so it became the new base link color, and a new,
  deeper hover was computed by extending the same hue and the same
  lightness delta the old link-to-hover step used, landing at
  10.2 to 11.4:1. Verified knock-on effects rather than assuming them
  clean: button text and the checkbox checkmark stroke
  (`light-dark(#FFFFFF, #11191F)`) against the new link background
  compute to 7.64/7.97/8.26:1, better than before, since the new link
  colors are themselves higher-contrast than the old ones they
  replaced. The focus ring's hardcoded rgba values were re-derived from
  the new link hex values for the same reason; sepia's is a separate
  hardcoded value and was updated too.
- Found and fixed in passing: the demo's own sepia `:has()` shim
  duplicates the palette (documented reason: a zero-JS page can't set
  `data-theme` from a radio), and still had the old link/meta/focus-ring
  values hardcoded. Would have left the demo's sepia radio showing stale
  colors while `<html data-theme="sepia">` on a real site got the new
  ones. Synced.
- Checked but left alone: GFM alert title colors (note/tip/important/
  warning/caution) land between 4.5 and 7.0:1 against their own tinted
  backgrounds in both themes, AA-clean, short of AAA. Not adjusted:
  these are GitHub's actual convention colors, used because they're
  recognizable as that convention; pushing them to AAA would mean
  deviating further from an authentic, well-known palette for a
  five-word label, the same authenticity-versus-synthetic-AAA tradeoff
  already accepted for Flexoki sepia elsewhere in this document.

**A tooling note worth keeping:** verifying the new link colors via
this session's browser tool initially looked like a repeat of the
`:checked`/`:focus`/`:user-invalid` "matches but won't repaint" issue
documented earlier, changing `data-theme` correctly updated
`color-scheme` and the raw `--color-link` token, but `getComputedStyle`
kept reporting the old color regardless. Isolated the actual cause this
time: setting `a.style.transition = 'none'` immediately fixed the
read. Every element that exhibited this symptom all session,
`li input[type="checkbox"]`, form fields, and now `a`, has a CSS
`transition` declared on the affected property; `h6`, which has no
transition and updated instantly and correctly every time, never did.
The pattern is specific to this automation tool's handling of
transitioning properties, not a rendering bug in the actual CSS: worth
remembering as a fast diagnostic (temporarily disable the transition
and recheck) rather than re-deriving it from scratch next time.

## Mint theme: two variants added for evaluation, not a final decision

The owner wants a Kindle-inspired mint theme and drafted two candidate
palettes. Both were checked against real WCAG math rather than the
inline comments' claims, and against Kindle's own reader stylesheet
(view-source on its CSS assets) rather than guessed colors.

**`--color-bg: #C5E7CE` is Kindle's actual green-theme background**,
confirmed directly from `.kg-client-theme--green { --page-background-
color: #c5e7ce }` in its stylesheet, not a guess. **`--color-meta:
#3A4B43` is also Kindle's own value**, from `.footer-label-color-green`
in the same stylesheet, and it happens to land at 6.92:1 against that
background, just under AAA, comfortably AA, with almost no adjustment
needed either direction.

One of the two owner-drafted options claimed its meta color hit "7.5:1
AAA." Measured: 5.32:1, AA only. Flagged rather than shipped as
commented.

Shipped both, deliberately, as `[data-theme="mint-aa"]` and
`[data-theme="mint-aaa"]`, so the owner can compare them live rather
than pick from a written description:

- **mint-aa**: `--color-meta: #3A4B43` (Kindle's value, unchanged,
  6.92:1), `--color-link: #0E5C54` (5.86:1).
- **mint-aaa**: `--color-meta: #384841` (barely darker than Kindle's
  value, 7.23:1), `--color-link: #0B4C45` (7.36:1).
- Identical in both: `--color-heading`/`--color-body: #121E15`,
  `--color-border: #99C7A4`, `--color-code-bg: #D4EEDB`. Border/bg and
  code-bg/bg contrast (1.42, 1.09) checked against the existing
  themes' own hairline subtlety (1.24 to 1.43, 1.04 to 1.11 across
  light/dark/sepia) rather than assumed acceptable: both land right in
  that established range. Link-on-code-bg and meta-on-code-bg both
  checked too (6.37 to 7.99 across both variants), and button text
  (white) on the new link colors comes out to 7.84:1 (AA variant) and
  9.84:1 (AAA variant). Neither `--color-error` nor `--color-success`
  is overridden, matching sepia's precedent: mint is a light scheme, so
  both inherit the default light-mode values, which clear the 3:1
  non-text threshold against this background (4.00 and 3.80:1) without
  needing a mint-tinted variant.

**This is explicitly not a shipped decision.** Two variants of the same
theme name existing at once is not the intended end state; once the
owner picks one, the other should be deleted and the survivor renamed
to plain `[data-theme="mint"]`, with the demo's radio switcher,
`:has()` shim, README, and REQUIREMENTS updated to match the three
other named themes rather than carrying two mint entries indefinitely.

**Follow-up: mint-aa redesigned around a lighter background, mint-aaa
kept as Kindle's own darker mint.** The owner preferred mint-aaa on
first look and asked for mint-aa to become a distinctly lighter,
paper-like shade instead of a near-duplicate of AAA, using `#DAF1DF`
as the new background. Retuned rather than reused: Kindle's own meta
color, dropped in as-is against this lighter background, measures
7.77:1, AAA, which would have quietly erased the AA/AAA distinction
the two variants exist to demonstrate. Recomputed `--color-meta` and
`--color-link` in the same hue families, bisected to land at 5.85 and
5.88:1 against the new background, comfortably AA, deliberately short
of AAA.

`--color-border` and `--color-code-bg` were also recomputed rather
than carried over from the darker mint-aaa background, and this
surfaced a real bug in the bisection helper used elsewhere in this
document: it assumes contrast increases monotonically as lightness
rises, true when darkening a light color against a dark background,
false in the other direction. Applied blindly to a light background it
produced `#6FDB86`, a saturated near-neon green, technically hitting
the target ratio but nothing like a subtle hairline. Fixed by
searching in the correct direction (darkening from the background's
own hue toward the background, not lightening away from it); the
corrected border (`#9ED1A9`) and code-bg (`#C6E9CE`) land at 1.45:1
and 1.11:1, matching the same quiet-hairline range as every other
theme in the framework. Worth remembering next time a color needs
bisecting against a light background specifically, the direction isn't
interchangeable.

## Mint finalized: AAA variant kept, AA variant deleted

The owner picked mint-aaa. `[data-theme="mint-aaa"]` renamed to plain
`[data-theme="mint"]`, matching `light`, `dark`, and `sepia`.
`[data-theme="mint-aa"]` deleted entirely, along with its demo radio,
its `:has()` shim block, and its entry in the image-filter and Shiki
forwarding rules. Mint is no longer a two-variant comparison; it is a
fourth named theme like the other three. CLAUDE.md's verification list
and contrast-check line, and README's theme summary, updated to
mention it alongside the existing three.

**Theme switcher order: Auto, Light, Sepia, Mint, Dark.** Requested in
this order; the rationale holds up on its own terms too: Auto first as
the default and recommended choice, then the three named light-scheme
palettes grouped together (Light, Sepia, Mint), then Dark last as the
one genuinely different `color-scheme`. Grouping by scheme rather than
alphabetically or by when each was added is the more scannable order.

## Comments in rana.css and rana-integrations.css cut to what's required

Requested explicitly: strip every comment that isn't required, not
just minimized as in the earlier pass. "Required" was read narrowly,
kept only where removing the comment risks a real mistake, a future
editor (human or AI) "fixing" code that looks wrong, redundant, or
dead without the missing context. Cut everything else: section
numbering, the file-header banner, design rationale (palette choices,
token structure, why a value is what it is), and progressive-enhancement
notes, all of which either restate what the selector already says or
duplicate what's already recorded in this file.

Kept, because each documents something a reader can't get from the
code alone and would plausibly "clean up" otherwise:

- Every vendor-prefix comment explaining why the prefix is still
  needed (`-webkit-text-size-adjust`, `-webkit-tap-highlight-color`,
  `-webkit-user-select`, `summary::-webkit-details-marker`). These
  exist specifically because they look redundant next to their
  unprefixed sibling or a seemingly-equivalent standard property.
- The Windows dark-mode `<select>` bug, and the dark-mode button ink
  color: both look like unnecessary overrides of properties the
  element would otherwise inherit, and both are fixes for a real,
  non-obvious bug (invisible dropdown options; a contrast failure)
  that a "cleanup" would silently reintroduce.
- `:focus` instead of `:focus-visible` on form fields: the one spot in
  the file that looks like an inconsistency with every other
  interactive element, and isn't.
- The `svg` sizing rule's comment, explaining why it doesn't join the
  `img, video, iframe` block treatment: without it, folding svg into
  that rule looks like an obvious simplification, and would break
  inline icon usage.
- `interpolate-size: allow-keywords` and the `dialog:not(:modal) {
  position: static }` fix: both reference obscure browser behavior
  (animating to `auto`; the UA's default absolute positioning on every
  dialog) with no way to infer the reason from the property alone.
- `pre code`'s tabindex cross-reference to REQUIREMENTS.md: the CSS
  half of an accessibility feature whose other half lives outside this
  file entirely.
- The `▸` glyph note next to `content: "\25B8"`: not a design
  explanation, just decoding an escape sequence no one can read by eye.

Verified this was a comment-only change and introduced no functional
difference: stripped comments from both the pre-edit and post-edit
versions of each file with the same regex used in earlier passes, then
diffed the results. rana-integrations.css came back byte-identical.
rana.css's only differences were the mint-aa deletion and mint-aaa
rename described above, exactly the two changes intended, nothing
else moved.

## RTL and Arabic support audited, three real bugs fixed, one font added

An audit found Rana was already RTL-correct almost everywhere, because
the framework never used physical properties in the first place:
every margin/padding/border is `-inline`/`-block`, alignment is
`text-align: start`, sticky positioning is `inset-inline-start`. That
discipline (adopted for its own sake, not for RTL) is what makes RTL
support close to free. Three real gaps remained:

**`env(safe-area-inset-left/right)` paired with logical
`padding-inline`.** `env()` insets are physical (tied to the actual
device edge), but the two values in a `padding-inline` shorthand are
logical (start/end). In LTR they happen to line up; under `dir="rtl"`
they'd pair the wrong physical inset with the wrong logical side.
Fixed with a `:dir(rtl)` override that swaps the two `env()` calls.
`:dir()` reached Baseline widely-available in June 2026 (Chrome 120+,
Firefox 49+, Safari 16.4+), comfortably inside the mid-2026 floor.
Verified in a real `dir="rtl"` render: `:dir(rtl)` matches, and the
existing logical properties (blockquote's `border-inline-start`, the
sticky first table column's `inset-inline-start`, the checkbox's
`margin-inline-end`) all land on the correct physical (right) side
without any changes.

**Non-zero `letter-spacing` on Arabic text.** Arabic is a cursive,
context-shaping script; any manual tracking (h1/h2's negative
tracking, h5/h6/legend/alert-title's `0.06em` label tracking) breaks
glyph joining in most engines, not just the intended kerning. Fixed
with `:lang(ar) :is(h1, h2, h5, h6, legend) { letter-spacing: normal }`
in rana.css and `:lang(ar) .markdown-alert-title` in
rana-integrations.css. Compounding the selector with each target
(rather than a bare `:lang(ar)` reset) was deliberate: it guarantees
higher specificity than the plain type/class rules regardless of
which file loads first or in what order, without relying on a
duplicated-pseudo-class specificity hack. `text-transform: uppercase`
on h5/h6 was left alone: Arabic has no case, so it's already a
harmless no-op there.

**Code and keyboard keys inheriting paragraph direction.** `pre`,
`code`, and `kbd` hold Latin identifiers and key names; letting them
inherit `direction: rtl` from surrounding Arabic prose can reorder
punctuation at the paragraph's bidi boundary. Fixed with
`direction: ltr; unicode-bidi: isolate` on both rules, unconditionally
(harmless, and already correct, in an LTR document).

**Font: Noto Sans Arabic, not Source Arabic Sans.** Rana ships every
other typeface through Bunny Fonts (self-hosted, OFL-licensed, one
`@import`); Source Arabic Sans is Adobe-Originals-only, with no Bunny
Fonts listing and its own kit/licensing model, inconsistent with how
every other font in this project is distributed. Noto Sans Arabic is
on Bunny Fonts, OFL, and is the de facto standard Arabic text face on
the web. Arabic has no serif/sans split to mirror Latin's, so one
family covers both `--font-serif` and `--font-sans` for `:lang(ar)`
content, prepended to the existing fallback chain (so embedded Latin
text and digits still fall through to Source Serif 4 / Source Sans
3).

Shipped a broken first version of this: `:lang(ar) { --font-serif:
"Noto Sans Arabic", var(--font-serif); }`. Looks like the standard
"extend a token on a more specific selector" pattern, and would be
fine if the override lived on a descendant. It doesn't: `:root` and
`:lang(ar)` can both match the exact same `<html lang="ar">` element,
so `:lang(ar)`'s declaration wins the cascade outright and there is no
second, ancestor-level declaration of `--font-serif` left for
`var(--font-serif)` to fall back to. That's a same-element cycle, not
inheritance, so per spec `--font-serif` becomes guaranteed-invalid on
that element, and every `font-family: var(--font-serif)` consumer
quietly falls back to its own inherited value, the browser's UA
default serif, silently discarding Noto Sans Arabic. Confirmed via
`getComputedStyle` before and after: the property read back empty
pre-fix. Fixed by splitting the Latin stacks into their own tokens
(`--font-serif-latin`, `--font-sans-latin`) that `:root` never
overrides, and having `:lang(ar)` build `--font-serif`/`--font-sans`
from those instead of from themselves. The lesson: the "safe"
self-referencing-variable pattern only holds when the overriding rule
targets a descendant of the element holding the original declaration,
not a second selector that can match the identical element.

Only weights 400/700 imported, matching the two-weight rule; no
italic, since Noto Sans Arabic ships none and Arabic script has no
italic convention, so `font-synthesis: none` correctly leaves emphasis
upright rather than faking an oblique.

**Not changed:** `hyphens: auto` / `hyphenate-limit-chars` on
p/li/blockquote. Browsers have no Arabic hyphenation dictionary, so
the property is already an inert no-op for `:lang(ar)` content; there
was nothing to fix.

Added `demo/index.ar.html`: a full `lang="ar" dir="rtl"` mirror of
`demo/index.html`, same element coverage, real Modern Standard Arabic
copy (not transliteration or placeholder text), so RTL rendering has
its own visual regression suite alongside the LTR one. Verified via
computed styles in a real render (see above) rather than a screenshot,
since the fixes are structural/logical-property correctness, not
visual tuning.

## Repo-wide review pass: naming, dead references, no visual change

A pass over every tracked file, explicitly scoped to zero rendered-output
change: reduce duplication and fix incorrect references, don't touch a
single computed value.

**`demo/arabic-index.html` renamed to `demo/index.ar.html`.** Adjective-
prefixed naming (`arabic-index`) doesn't match any established
convention; the `page.<BCP-47-subtag>.ext` suffix is the common pattern
for a localized sibling of a default-locale file (Eleventy, Jekyll, and
general i18n tooling all use it), and reads immediately as "the Arabic
version of index.html" without the file name and the folder disagreeing
about which word comes first. Kept flat in `demo/` rather than moving to
`demo/ar/index.html`: it's a static single-page proving ground, not a
routed multi-page site, so the directory-per-locale convention (matching
real URL structure) doesn't buy anything here and would only add a
`../../` hop to every asset link.

**`package.json`'s `style` and `files` fields pointed at `rana.css` and
`rana-integrations.css` (package root), but the actual files live in
`src/`.** Stale since whenever the CSS moved into `src/`; as written, an
npm publish would ship a `files` allowlist that matches nothing, and any
bundler reading the `style` field would 404. Fixed to `src/rana.css` /
`src/rana-integrations.css`. Never caught because nothing in this repo's
workflow (no build, no publish yet) actually reads those fields.

**`astro.config.mjs`'s pipeline-hook comment referenced
`rana-rana-integrations.css`**, a duplicated-prefix typo, twice. Fixed to
`rana-integrations.css`.

**Three identical `light-dark(#FFFFFF, #11191F)` literals** (the
button's ink color, the file input's `::file-selector-button` ink color,
and the checkbox checkmark's border color) consolidated into one
`--color-ink-on-accent` token in `:root`, next to the other `--color-*`
tokens. Deliberately not reused for `--color-bg` even though the value
is currently identical: `--color-bg` means "the page background,"
these three mean "ink color that reads on an accent-colored surface,"
and they're only numerically equal by coincidence of the current
palette. Aliasing them to `--color-bg` would make a future page-
background change silently repaint button text and checkmarks too.
README.md's file table and CLAUDE.md/design-decisions.md's demo
references were updated for the rename and the `src/` paths; no other
file had a stale reference, a raw duplicated color literal outside the
three above, or a naming convention worth changing.

## README repositioned against the classless-CSS field

Rewrote README.md's intro and highlights after surveying seven
comparable frameworks (Pico, MVP.css, Sakura, Simple.css, Tacit,
Picnic, Chota). The factual basis for the positioning: only Pico and
Sakura advertise native dark mode; MVP.css, Tacit, Picnic, and Chota
target IE11-era browsers with traditional CSS; Simple.css's GitHub
repo is archived; Chota's last release was January 2023. Rana's honest
differentiator is therefore its browser floor, so the intro leads with
"starts from today's evergreen browsers" rather than adjectives, and
names no competitor. Voice follows IBM Carbon's guidelines:
conversational, confident but not boastful, facts over figurative
language.

Two claims in the first draft were corrected before shipping because
they were factually wrong about Rana itself: it claimed dialogs
animate via `@starting-style` (that experiment was reverted, see the
animation-skill entry above), and implied all heading sizes are fluid
(only h1/h2 are; h3-h6 are deliberately fixed). Marketing copy is held
to the same accuracy bar as the code comments: nothing the demo can't
demonstrate.

Added a "Where Rana fits" section stating what Rana is not (no grid,
no components, no JS widgets, no legacy browsers), on the theory that
a reader who self-selects out in ten seconds is a better outcome than
one who finds out after integrating. Credits now note the framework
was built with Claude Code and Claude Fable 5.

## astro.config.mjs moved to examples/

A follow-up file-placement review confirmed `src/rana-integrations.css`
and `REQUIREMENTS.md` are correctly named and located: the former is a
shipped stylesheet belonging beside rana.css in `src/` (both listed in
package.json's `files`), and the latter ships in the npm package, so it
stays at root with README the way LICENSE and CHANGELOG conventionally
do, and is referenced by bare name from a comment inside rana.css.

`astro.config.mjs` at the repo root was the one misplacement: a config
file at root signals "this repo runs this tool," but Astro is not
installed here and the file is reference documentation for consumers.
Moved to `examples/astro.config.mjs`, the standard home for reference
configs. The header comment inside still reads `// astro.config.mjs`
on purpose: it names what the file must be called in the consumer's
own project root. The historical entry above referring to the root
path was left unedited; entries here record what was true when
written.

## Pre-publish pass: LICENSE, exports map, .gitignore, .editorconfig

Preparing for the first GitHub publish.

**LICENSE added** (MIT, 2026, Saleem Al Zayat). README's license
section had said "MIT, or your own choice. Update this section before
you publish"; that placeholder is now resolved to a link to the real
file. GitHub and npm both detect the license from this file.

**package.json gained an `exports` map** so bundlers resolve
`rana-css` (bare), `rana-css/rana.css`, and
`rana-css/rana-integrations.css` without consumers knowing the
internal `src/` layout. The legacy `style` field stays for older
tooling that reads it. README.md dropped from `files`: npm includes
README and LICENSE unconditionally, so listing it was noise. Still
deliberately absent: `repository`, `homepage`, and `bugs`, because the
GitHub URL doesn't exist yet; add them once the repo is created, since
npm uses them for the package page's sidebar links.

**.gitignore extended** with `desktop.ini` (this repo lives in a
OneDrive folder, which drops that file into directories) and `*.swp`,
with section comments. **.editorconfig added** matching the existing
convention in every file: 2-space indent, UTF-8, LF, final newline,
with trailing-whitespace trimming off for Markdown (trailing double
spaces are hard line breaks).

Considered and skipped: CONTRIBUTING.md (premature before anyone has
contributed), CHANGELOG.md (nothing released yet; start it at the
first tagged release), and GitHub issue/PR templates (same reasoning).

## Demo copy toned down to Carbon voice; Arabic demo removed

A copy pass over demo/index.html against IBM Carbon's voice
guidelines (clear, conversational, confident but not boastful,
figurative language only for emphasis), calibrated against the Tacit,
Simple.css, and Sakura demo pages: Sakura is purely utilitarian,
Simple.css is chatty with jokes, Tacit is terse but friendly. Rana's
demo sits between Simple.css and Sakura: explanatory sentences that
teach what each element does, without literary flourish.

Cut or flattened: "proving ground," "the paragraph carries the whole
design," "wear capital letters," "the quietest label," "after a small
breath ... never lose the seam," "doing what long-form prose does,"
"breathes a little more," "without losing the thread." Structure,
element coverage, and test cases are untouched; this was prose only,
and the page remains the visual regression suite.

One accuracy bug found during the pass: the blockquote intro claimed
quotes render "larger, italic, with a rule down its left side," but
rana.css deliberately sets `font-size: 1em; font-style: normal` on
blockquotes (a Practical Typography decision recorded earlier), and
the rule is `border-inline-start`, not physically left. Rewritten to
describe what actually renders: a quieter color with a rule along its
edge.

`demo/index.ar.html` removed at the owner's request. The RTL and
Arabic CSS support in rana.css is unaffected and stays; what's gone is
only the dedicated Arabic regression page. CLAUDE.md's workflow now
says to spot-check RTL by setting `dir="rtl" lang="ar"` on the demo's
`<html>` element instead of reloading a second page.

## README gained a "Size and performance" section

Numbers measured, not estimated: rana.css is 21,380 bytes raw and
5,762 bytes gzipped; rana-integrations.css is 2,583 raw, 1,065
gzipped. The section states them as 21 KB / ~6 KB / 1 KB. If either
file changes materially, re-measure (`gzip -c file | wc -c`) and
update the section rather than letting it drift.

The section's angle is honesty about where the weight actually is:
the CSS is small, the ten font cuts from Bunny Fonts are the real
cost, and the section points to REQUIREMENTS.md's preconnect and
Fontsource options instead of pretending fonts are free. "No minified
build because there is no build" and "the file you read is the file
browsers execute" are positioning choices: shipping unminified CSS
with comments is framed as an auditability feature, which it is, at a
cost of about 2 KB gzipped versus a minified variant. If a minified
build is ever added, this section and the no-build claims in CLAUDE.md
both need rewording.

## Marketing page added at the repo root

`index.html` at root, inspired by getskeleton.com's structure: hero
with size facts and two CTAs, a live theme picker, a six-card feature
grid, an "Is Rana for you?" fit guide, getting-started snippets, and a
credits footer. Root placement is deliberate: GitHub Pages serves the
repo root, so the marketing page becomes the site index and the demo
stays one click away at /demo/.

The page eats its own cooking: it links src/rana.css and adds only a
page-level inline `<style>` block (hero scale, CTA link-buttons, the
feature grid, check/cross list markers, and the same `:has()` radio
theme wiring the demo uses). Zero JavaScript, same as everything else.
The theme picker doubles as a live proof of the three-lines-of-CSS
switcher claim, with its legend saying exactly that.

Pictograms are real IBM Carbon pictograms (Apache 2.0), fetched from
the @carbon/pictograms npm package v12.79.0 and inlined as SVG so the
page stays self-contained: text--layout (typography), colors (themes),
accessibility, language--translation (RTL), lightning (zero JS), and
code (one file). They are 32x32 single-path fills, colored via
`fill: var(--color-link)` so they follow every theme. The pop of color
the owner asked for comes from the palette's own tokens: pictograms in
link blue, fit-guide checkmarks in --color-success, crosses in
--color-error. Verified in a real render that all three recolor
correctly under dark and mint.

Voice is Carbon with permitted humor, kept to two jokes ("The mint
theme follows your Kindle nostalgia," "close this tab with
confidence either way") so the page stays confident rather than
cute. The "Not a good fit" list is as prominent as the good-fit list,
same reasoning as README's "Where Rana fits": fast self-selection
beats a disappointed adopter. Carbon pictogram credit added to the
page footer and README's credits.

## Marketing page revision: typography section, tone, UX cleanup

Second pass after review. The first typography section led with the
font ("The reading voice is Source Serif 4...") and ran a Fournier
history lesson, the 1742 date, a release-year/style-count table, and
three H3 subsections (digits, italics, quiet details). The owner
called it pretentious and questioned whether the digits and italics
deep-dives earned their place. They did not: on a page whose job is
to help someone decide in seconds, typography-nerd trivia is the most
impressive and least relevant content. Cut all of it.

Rewrote to a Headspace-inspired voice (short, warm, second person,
one gentle wink), sampled from their tone guidelines: gentle,
non-preachy, reassuring, "you've got this" register. The section now
leads with the reading benefit under an H2 "Made for reading," names
Source Serif 4 in one sentence, states the 17-19px / 1.6 / 65ch
facts plainly, and folds the former digits/italics/details H3s into a
single "handled quietly" line ending "You will probably never notice
them. That is the idea."

The last paragraph adapts Skeleton's "Other type basics like anchors,
strong, emphasis, and underline are all obviously included" into a
live demo: the sentence itself contains a real `<a>`, `<strong>`,
`<em>`, `<u>`, `<mark>`, `<code>`, and `<kbd>`, each rendering as
itself, closing on "Obviously." as a nod to Skeleton's line. Verified
in a real render that all seven inline elements style distinctly.

UX/UI cleanup in the same pass:
- Removed all seven structural `<hr>` dividers. One rule between every
  section is visual noise; switched to semantic `<section>` elements
  with `margin-block: var(--space-3xl)` and a single top border on the
  footer. Verified zero `<hr>` remain, five sections present.
- Hero CTAs relabeled from "See every element styled" / "Download
  rana.css" to "Get started" (jumps to a new `id="start"` on the
  Getting started section) and "See the demo." The raw-file download
  moved into Getting started, where an eager user actually looks for
  it. A framework's primary CTA should be "start," not "download a raw
  file."
- Reordered feature cards so "Zero JavaScript," a headline
  differentiator, comes third instead of fifth, ahead of the
  accessibility/RTL breadth cards.
- The `#start` jump inherits rana.css's `scroll-behavior: smooth`,
  which is already gated behind prefers-reduced-motion, so it animates
  or snaps per the reader's motion preference at no extra cost.

Added a second emoji (🎨 on "Make it yours"); two total across the
page, matching the owner's "not afraid of a pop" direction while
staying restrained.

## Marketing page: de-snarked, footnoted, run against Elmore Leonard

The owner flagged specific lines as snarky rather than funny and asked
for a pass against Elmore Leonard's rules for writing (via the
Guardian's "Ten rules for writing fiction"). The operative ones for
marketing copy: leave out the parts readers skip, avoid clichés, keep
exclamation points down (the page has zero in prose; the only "!" is
in `<!DOCTYPE>`), and above all "if it sounds like writing, I rewrite
it." Snark is writing that is pleased with itself, so it was the first
to go.

Line-by-line fixes:
- "numbers that settle into a sentence instead of shouting ... a fake
  slant ... You will probably never notice them" was superior in tone
  and used "thing." Rewritten to show, not tell: the paragraph now
  demonstrates old-style figures with a real year (1889) and a real
  `<em>true italic</em>` inline, rather than bragging about them. The
  word "thing" is gone from the page.
- The Skeleton-style type-basics line dropped its "Obviously." closer
  (the owner called it out by name) and now just ends on the list.
- "Nothing to hydrate, nothing to break" became "No scripts to load,
  and none to maintain": same fact, no smugness.
- "sans for interface" replaced with "a sans-serif for headings and
  labels," since "interface" is jargon that does not tell a blogger
  where the font actually shows up.
- "The mint theme follows your Kindle nostalgia" was both unfunny and
  factually wrong (the mint reference is the Kindle web reader, not the
  e-ink devices, which have no color). Replaced with a real, cited
  reason: the eye peaks in green near 555 nm, so a soft green
  background stays legible while cutting the glare of pure white.

Footnotes added, which do double duty: they cite the claims and they
demonstrate Rana's GFM footnote styling on the marketing page itself.
Three of them, numbered in document order: [^1] Flexoki credit for the
sepia palette (the owner asked for this credit explicitly), [^2] the
green-sensitivity source (RP Photonics' luminosity-functions page,
chosen over blog results for being a technical reference), and [^3]
Emil Kowalski for the easing curve, mentioned where the interaction
animations are, which is the only place it is relevant. The footer was
slimmed accordingly: Flexoki and Emil now live in the footnotes, so
the footer carries only license, fonts, pictograms, and the build
credit.

Other additions the owner requested:
- A GitHub Flavored Markdown link (github.github.com/gfm) on the first
  mention.
- A real Shiki-highlighted JavaScript block under a new "Code,
  highlighted" section, which required linking rana-integrations.css.
  The tokens carry both `--shiki-light` and `--shiki-dark` inline, the
  same dual-theme pattern the demo uses, so the block recolors with
  the theme. This is the first place the page shows the integrations
  layer, not just names it.

"Is Rana for you?" reworked. The glib "close this tab with confidence
either way" intro is gone. The two lists (good fit / not a good fit)
now sit side by side in a responsive two-column grid for faster
scanning, the bullets are parallel and concrete, and the snarky "You
would rather read a stylesheet than configure one" became "You value
reading over configuration." The yes/no structure was kept: it is a
genuinely good self-qualification pattern, the section just needed
plainer words.

## Marketing page: external-critique pass, four fixes adopted

An outside review flagged the page. Assessed each point rather than
applying wholesale; adopted the four that were correct, rejected one
that was technically mistaken, and kept our voice against a suggested
rewrite that read like a spec sheet and would have deleted the
footnotes, GFM link, and mint rationale requested in prior turns.

Adopted:
- The "No build step" / "Write Markdown" contradiction was real:
  browsers do not parse Markdown, so any Markdown author runs a compile
  step. "No build step" overclaimed the user's whole pipeline when the
  honest claim is narrower (Rana has no preprocessor of its own).
  Hero fact changed to "No preprocessor"; section 1 now says Rana
  "styles the HTML your Markdown compiles to" and "run your Markdown
  through any renderer," naming the step instead of implying Markdown
  works in the browser directly.
- "One file, no toolchain" overstated once the optional integrations
  (Shiki, KaTeX, alerts, pipeline hooks) appear later. Card retitled
  "One core file"; the code section is now "Code, highlighted
  (optional)" and opens with "The core stays one file; everything in
  this section is an optional add-on"; getting-started separates the
  one-file core from the optional layer explicitly.
- The theme picker: the critique wanted it moved next to the themes
  card to demonstrate the claim inline, and it was moved there briefly.
  The owner preferred it back at the top, directly below the hero CTAs,
  and that placement won: it is an immediate interactive hook, and a
  first-time visitor gets to feel the whole page recolor before reading
  a word. Its legend stands alone there ("Switch the theme of this
  whole page. It is CSS only, no JavaScript"), with the overclaiming
  "three lines of CSS" line dropped. Verified the picker drives the
  theme and that Auto unsets cleanly.
- The picker legend previously claimed "the whole switcher is three
  lines of CSS," which an observant reader would disprove by viewing
  source (this page carries four full custom palettes). Softened to
  "the change is CSS only, no JavaScript."

Rejected:
- "Move the Shiki inline `--shiki-light`/`--shiki-dark` styles into the
  stylesheet to avoid DOM bloat." This misunderstands syntax
  highlighting: every token can be a distinct color, so per-token
  colors cannot live in a stylesheet without a class per color per
  token, which is exactly what Shiki's dual-theme inline-variable
  output avoids. It is build-time generated content, not hand-authored
  markup, so the clean-HTML principle does not apply. Left as-is.

Verified, not a bug (the review asked to check it): selecting Auto
unsets the forced overrides. `color-scheme` on `:root` reads
"light dark" on Auto, "dark"/"light" when a theme is forced, and back
to "light dark" when Auto is reselected, because Auto has no
`:root:has()` rule and the radios are mutually exclusive.

Subtle live examples added while here: section 1 now points out that
the numbered notes at the foot of the page are Rana styling GFM
footnotes, tying the earlier footnotes to the GFM claim.

## Marketing page: second external-critique pass (HTML-only reader)

A reviewer who read only the HTML, not the rendered CSS, raised three
points. Two held up, one was the recycled Shiki misunderstanding.

Adopted:
- The theme-picker legend ("Switch the theme of this whole page. It is
  CSS only, no JavaScript") repeated "no JavaScript" from the hero fact
  directly above it. Compressed to a plain active instruction, "Try a
  theme." The CSS-only proof is already carried by the hero fact and
  the themes card, so the legend does not need to restate it.
- The footnote self-reference added in the previous pass ("The numbered
  notes near the foot of this page are Rana styling GFM footnotes") was
  removed from the middle of the section-1 pitch. It interrupted the
  paragraph, and the footnotes already demonstrate themselves through
  the superscript marks and the notes list; the callout was
  over-explaining, which Leonard's "leave out the part readers skip"
  says to cut. Not moved to a blockquote as the reviewer suggested: a
  blockquote is for quotations, and misusing one as an aside would be
  its own semantic contradiction on a page that markets semantic HTML.

Rejected (again): "extract the Shiki inline `--shiki-light`/
`--shiki-dark` variables into the CSS file." Same answer as the first
critique pass. Reading the HTML without the CSS makes the per-token
inline variables look like clutter, but they are build-time generated
output, and per-token colors cannot move to a stylesheet without a
class per color per token, the exact thing dual-theme Shiki avoids.
Rana's no-classes/clean-markup claim is about the HTML an author
writes, not about generator output. The copy already frames the block
as generated ("run Shiki in your HTML step," "from a single render").
