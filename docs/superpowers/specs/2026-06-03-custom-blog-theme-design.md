# Custom Jekyll theme for `luthebao` — design spec

**Date:** 2026-06-03
**Goal:** Replace the `jekyll-theme-architect` remote gem theme with a self-contained, distinctive, GitHub-Pages-safe custom theme for a coding/software blog served at `www.beyonderluu.com`.

## Aesthetic direction — "Engineered minimal" (Modern Dev)

A clean, technical, lightly terminal-flavored developer journal. Monospace carries the
*structure* (brand, headings, metadata, labels — it reads as "this person writes
software"); a humanist sans carries the *reading*. Restrained cool-slate neutrals with a
single warm **amber accent** (uncommon for dev blogs, which default to blue). One memorable
motif: monospace headings + a `$`/caret prompt glyph and hairline rules.

### Type system (self-hosted, zero external requests)
- **IBM Plex Mono** — brand, headings, metadata, code, chips. Weights 400/500/600.
- **IBM Plex Sans** — body copy. Weights 400/600 + 400 italic. Full **Vietnamese** coverage
  (needed for the `lang: vi` VPT post).
- Self-hosted `woff2` under `assets/fonts/`, `@font-face` with `unicode-range` (latin /
  latin-ext / vietnamese subsets) + `font-display: swap`. Robust system fallbacks so text
  never breaks if a file is missing.

### Color tokens (CSS custom properties; light + dark)
- Light: cool off-white page, white surfaces, near-black slate text, hairline borders.
- Dark: near-black slate page (not pure black), brightened amber accent.
- Dark mode: header toggle (sun/moon), default = OS `prefers-color-scheme`, choice persisted
  in `localStorage`. Inline `<head>` script applies the theme **before first paint** (no FOUC).

## Architecture — local theme, no gem

Remove `theme:` from `_config.yml`; ship local `_layouts/`, `_includes/`, `_sass/`,
`assets/`. GitHub Pages compiles the SCSS natively (jekyll-sass-converter) and runs only
allowlisted plugins — no custom build step, no CI.

```
_layouts/    base.html → default, home, post, page   (Jekyll layout inheritance)
_includes/   head, header, footer, post-card, theme-toggle, icons, post-nav
_sass/       _tokens _fonts _base _layout _home _post _code _components _syntax
assets/      css/style.scss · js/main.js · img/favicon.svg · fonts/*
```

### Layouts
- **base** — `<!doctype html>`, head include, skip link, sticky header, `{{ content }}`,
  footer. `<html lang>` derived from `page.lang | default: site.lang` → VPT post = `lang="vi"`.
- **home** (`index.md`) — hero ("Hi, I'm ironman 👋" + tagline + social) over a subtle
  dotted-grid backdrop, then the post list (cards: date, title, reading time, tags, excerpt).
- **post** — back link, title, meta row (date · reading time · tags), richly-styled article
  body, prev/next nav, back-to-home.
- **page** — lightweight static pages (About).

### Plugins (all GitHub-Pages allowlisted)
`jekyll-seo-tag` (meta/OG/Twitter/JSON-LD), `jekyll-sitemap`, `jekyll-feed` (RSS `/feed.xml`).
Minimal `Gemfile` (`github-pages` group) for local preview parity.

## Components / behavior
- **Header**: mono brand with accent prompt glyph + caret; nav (Posts, About, GitHub icon);
  theme toggle. Sticky, translucent with backdrop blur, hairline border on scroll. Mobile-collapsed.
- **Code blocks**: Rouge highlighting with matched **light + dark** token themes driven by
  CSS vars; JS enhancer adds a header bar with the language label + **copy-to-clipboard** button.
  Styled tables, blockquotes, `hr`, lists, inline code.
- **Motion**: one orchestrated page-load staggered reveal; tasteful hover micro-interactions;
  caret blink. All gated behind `prefers-reduced-motion`.
- **A11y**: semantic HTML, skip-to-content, visible focus rings, `aria` on toggle/nav,
  responsive to mobile.

## Content changes (additive)
- `index.md` → `home` layout, restructured hero + post list.
- Add `tags:` (and a one-line `summary:`) front matter to the 4 posts for chips/excerpts.
- Add seeded `about.md` (`page` layout) from existing GitHub/site info.
- **Unchanged**: `vptdata.json`, `vpt/` exclusion, CNAME, post body content.

## Verification
- Compile SCSS with dart-sass (`npx sass`) — must compile clean.
- Build with Jekyll locally if the background install succeeds (authoritative Liquid + Sass).
- Adversarial multi-dimension review (GH-Pages safety, Liquid correctness, a11y, responsive,
  no-FOUC dark mode, Vietnamese rendering); fix confirmed findings.
- Browser screenshots: light, dark, mobile, a code-heavy post, the VI post.

## Out of scope (YAGNI)
Dedicated tag/archive pages, comments, search, pagination (only 4 posts), webfont CDN.
