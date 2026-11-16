# Design update — Youth Health Matters

Visual refresh to match the supplied mock-up (web, mobile, admin dashboard).

## What changed
- **Design system** (`src/styles.css`): navy + vivid-blue palette, Plus Jakarta Sans, new `panel`
  utility, refreshed hero veil and navy bands. The old `teal` tokens are now `brand`
  (`bg-brand`, `text-brand-deep`, ...), so every page picks up the palette from one place.
- **Branding**: "Youth Health Matters - Healthy Youth • Stronger Communities" with a new logo
  (`src/components/site/brand-mark.tsx`; change `BRAND_NAME` / `BRAND_TAGLINE` there).
- **Header / footer**: dark navy header with active underline; footer with quick links,
  contact block and the four-pillar strip. New phone-only bottom tab bar (`mobile-tab-bar.tsx`).
- **Home** (`src/routes/index.tsx`): photo hero, four overlapping quick cards, About the Issue,
  Key Effects panels, research overview, sample dashboard, "A Brighter Future is Possible" CTA.
- **Admin** (`src/routes/admin.tsx`): sidebar dashboard shell (own layout, no public header),
  coloured stat cards, responses-over-time area chart, recent-responses table. Existing
  features (CSV export, projects, resources) are unchanged.
- Sub-pages (About, Effects, Findings, Resources, Survey, Login, Privacy) inherit the new look.

## Please replace before launch
- Contact email in `site-footer.tsx` is a placeholder (`info@youthhealthmatters.example`).
- The mock-up's "1 in 3 youths" statistic was NOT used: it has no source in the project.
  Add it back only with a citation.
- No phone number or social-media links were added (none were real).

## Run it
`bun install && bun run dev` (or `npm install --legacy-peer-deps && npm run dev`).
