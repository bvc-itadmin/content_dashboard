---
name: Chartered Editorial
colors:
  surface: '#FCFBF9'
  surface-dim: '#D3DCDA'
  surface-bright: '#FCFBF9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#F2F8F6'
  surface-container: '#E4F1EE'
  surface-container-high: '#DAEAE6'
  surface-container-highest: '#D3E5E1'
  on-surface: '#111111'
  on-surface-variant: '#3F4447'
  inverse-surface: '#20252B'
  inverse-on-surface: '#F2F6F5'
  outline: '#626A6D'
  outline-variant: '#D2D8D6'
  surface-tint: '#106B62'
  primary: '#0B4F48'
  on-primary: '#ffffff'
  primary-container: '#106B62'
  on-primary-container: '#9AD6CC'
  inverse-primary: '#8FD0C5'
  secondary: '#775a00'
  on-secondary: '#ffffff'
  secondary-container: '#fed269'
  on-secondary-container: '#765900'
  tertiary: '#003110'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a1c'
  on-tertiary-container: '#42c264'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#E4F1EE'
  primary-fixed-dim: '#8FD0C5'
  on-primary-fixed: '#06302B'
  on-primary-fixed-variant: '#0D5A52'
  secondary-fixed: '#ffdf99'
  secondary-fixed-dim: '#ecc15a'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#5a4300'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#FCFBF9'
  on-background: '#111111'
  surface-variant: '#D3E5E1'
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-semibold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an authoritative, reliable, and approachable editorial workspace tailored for BVC & Co. Chartered Accountants. The user base consists of non-technical accounting partners, auditors, tax specialists, and administrative staff managing publications, client advisories, and tax updates.

The personality balances prestige and precision:
- **Tone:** Authoritative, disciplined, warm, and distinctly professional.
- **Aesthetic Movement:** Corporate Editorial with Warm Minimalism, matched to the bvcglobal.com teal and gold. It departs from cold enterprise SaaS tropes by utilizing warm parchment canvas tones, deliberate bookish typographic hierarchy, and tactile structure.
- **Affordance & Usability:** High-visibility hit states, prominent interactive targets (minimum 44px), explicit field boundaries, and zero ambiguity in form controls to ensure stress-free operations for high-consequence compliance workflows.

## Colors

The palette establishes formal contrast against an archival warm background, exceeding WCAG 2.2 AA standards across all functional interfaces:

- **Canvas & Surface:**
  - Background Canvas: `#FCFBF9` (warm archival cream)
  - Surface Cards & Modals: `#FFFFFF` (pure white for content focus)
  - Subdued Surface / Table Headers: `#F2F8F6`
- **Primary Teal (`#106B62`):** Reserved for primary navigation anchors, high-level structural chrome, primary action triggers, and active document statuses. Delivers an immediate sense of institutional trust.
- **Accent Gold (`#C8A45D`):** Applied deliberately to editorial badges, highlighted drafts, featured article bookmarks, and selective secondary accents. Text on gold uses `#20252B` to maintain required contrast ratios.
- **Typography & Text:**
  - Text Dark (Primary): `#20252B` (slate dark, contrast ratio > 11:1 against `#FFFFFF` and > 9.5:1 against `#FCFBF9`)
  - Text Muted (Secondary/Metadata): `#64748B` (meets 4.6:1 against white for standard text, 16px minimum)
- **Dividers & Structural Borders:** `#E2E8F0` for light demarcation, deepening to `#CBD5E1` when separating complex data columns.
- **Feedback & Validation:**
  - Success Green: `#16A34A` (published states, verified compliance checks)
  - Danger/Alert Red: `#DC2626` (validation errors, urgent regulatory deadlines, retraction actions)

## Typography

The type scale relies entirely on Inter, deployed with disciplined proportions and strict baseline alignments to guarantee cognitive ease for editorial operators:

- **Baseline Body Rules:** Standard body text never drops below 16px. Running text in editorial and legal preview panes uses `body-lg` (18px/28px) for effortless proofreading of complex tax and audit documents.
- **Headings & Titles:** Display and headline sizes employ negative tracking (`-0.01em` to `-0.02em`) and semi-bold/bold weights to impart structural authority akin to high-end financial journals.
- **Labels & Forms:** Field labels, column markers, and button labels are set strictly at `label-lg` (16px) or `label-sm` (14px uppercase/semi-bold for pill meta tags only). Never reduce instructional text below 14px.

## Layout & Spacing

The layout model is a robust 12-column responsive fluid grid anchored within a maximum reading container width of 1440px to prevent visual detachment on wide executive displays.

- **Desktop (1024px+):** Fixed 280px left-hand management rail, paired with a 12-column editorial canvas (`margin: 2rem`, `gutter: 1.5rem`). Content entry workspaces split into a 8-column editor and 4-column meta/publishing inspector.
- **Tablet (768px - 1023px):** Side navigation collapses into an accessible slide-over drawer. The grid reduces to 8 columns with 1.25rem gutters and 1.5rem margins.
- **Mobile (< 768px):** Single-column stacked layout with 1rem margin boundaries. Touch-friendly scrolling panels replace side-by-side editing drawers.
- **Vertical Rhythm:** Component groupings and content modules are separated using `space-lg` (24px) or `space-xl` (40px) to prevent operational fatigue and accidental mis-clicks.

## Elevation & Depth

To align with the warm editorial ethos of an accounting firm, visual hierarchy prioritizes crisp borders, tonal separation, and warm diffused shadows over artificial floating planes:

- **Base Layer:** `#FCFBF9` canvas tint forms the ground stage.
- **Card Tier (Level 1):** `#FFFFFF` surfaces bounded by a crisp 1px solid border (`#E2E8F0`). Enhanced with a soft, warm-tinted ambient drop shadow: `0 2px 6px rgba(16, 107, 98, 0.04), 0 1px 2px rgba(30, 41, 59, 0.03)`.
- **Raised Interactive Tier (Level 2 - Dropdowns, Popovers, Hovered Cards):** `0 8px 20px -2px rgba(16, 107, 98, 0.08), 0 4px 8px -2px rgba(30, 41, 59, 0.04)` over a 1px border (`#CBD5E1`).
- **Modal & Critical Dialog Tier (Level 3):** `0 20px 32px -4px rgba(16, 107, 98, 0.14)` combined with an ambient scrim of `#20252B` at 40% opacity.

## Shapes

The design system incorporates a conservative, structured corner geometry (`roundedness: 1` — Soft, 4px base radius):

- **Buttons, Inputs, Select Boxes:** 4px radius (`0.25rem`). This provides clean, architectural lines suited for chartered professional documentation while remaining softer than brutalist edges.
- **Cards, Panels, Alert Banners:** 8px radius (`rounded-lg` / `0.5rem`) to frame larger modular workspaces gracefully.
- **Modal Containers:** 12px radius (`rounded-xl` / `0.75rem`) for focal dialogue points.
- **Badges and Status Tags:** 4px soft radius or fully pill-shaped when designating live/draft publication status to contrast against rectangular text blocks.

## Components

### Buttons & Interactive Controls
- **Touch Target & Sizing:** Minimum button height is 48px (exceeding the 44px standard), with generous horizontal padding (24px, `space-lg`).
- **Primary Button:** Background `#106B62`, text `#FFFFFF`, 4px border radius. Hover state darkens to `#0B4F48` with a subtle elevation shift. Focus state features a 3px ring of `#C8A45D` with a 2px white offset.
- **Secondary Button:** Background `#FFFFFF`, 1.5px solid border `#106B62`, text `#106B62`. Hover shifts to `#FCFBF9`.
- **Tertiary / Destructive:** Red button (`#DC2626`) for irreversible actions (e.g., Unpublish, Delete Draft). Never rely on color alone; accompany with an explicit modal confirmation.

### Form Inputs & Selectors
- **Fields:** Minimum height of 48px. Background `#FFFFFF`, border 1px solid `#E2E8F0`, corner radius 4px, text `#20252B`.
- **States:** Focused fields switch to a 2px primary border `#106B62` with zero jitter. Errored states utilize `#DC2626` with persistent, non-dismissible helper text below the input.
- **Labels:** Statically positioned above inputs in `#20252B` (`body-semibold` or `label-lg`), maintaining high clarity without floating placeholders.

### Content Cards
- Pure `#FFFFFF` surface placed against the `#FCFBF9` background.
- Interior padding set to 24px (`space-lg`) on mobile and 32px on desktop.
- Header bars within cards utilize bottom borders (`#E2E8F0`) to cleanly delineate metadata (author, category, revision timestamp) from article body summaries.

### Chips & Status Badges
- **Draft Status:** Neutral slate background `#E2E8F0`, text `#20252B`.
- **Under Review:** Warm Gold background `#FEF9C3`, text `#854D0E`, border 1px solid `#C8A45D`.
- **Published:** Green background `#DCFCE7`, text `#166534`, border 1px solid `#16A34A`.
- Height of 28px, 10px horizontal padding, 14px bold typography.

### Checkboxes & Radio Buttons
- 22px × 22px visual box with an expanded 48px transparent touch hit target.
- Checked state uses `#106B62` fill with crisp white internal check mark. Clear high-contrast focus rings for full keyboard navigation.

### Editorial Additions
- **Tax Legislation Alert Banner:** Full-width bordered card with `#C8A45D` left accent strip (4px), alerting staff to immediate regulatory filing updates or required statutory disclosures.