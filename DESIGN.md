# Design System for Paylix

## 1. Visual Theme & Atmosphere

Paylix's interface is built on controlled darkness — a near-black canvas (`#0a0a0c`) that sits between pure void and warm charcoal, creating a stage where financial data and payment states command attention without strain. This is the darkness of a well-designed trading terminal or a Stripe dashboard in dark mode: purposeful, engineered, and easy on the eyes during long sessions. Every pixel serves the mission of making money movement feel safe, clear, and inevitable.

The color story is anchored by a single, electric teal accent (`#06d6a0`) — a color that sits at the intersection of "financial confidence" and "technical precision." Unlike the blues that dominate fintech (Stripe, PayPal, Coinbase), teal carves out a distinct identity while still reading as trustworthy. It glows against the dark canvas with the calm authority of a status LED on high-end hardware — present, reassuring, never shouting. This accent is used surgically: interactive elements, primary CTAs, and active states only. Everything else lives in the neutral gray spectrum.

Typography runs on two tracks: Geist Sans for all human-readable interface text — clean, geometric, engineered by Vercel for screen rendering at small sizes — and Geist Mono for the financial data layer. Wallet addresses, transaction hashes, USDC amounts, and API keys all render in monospace, creating an instant visual separation between "what the interface says" and "what the blockchain says." Tabular numbers (`tnum`) are enabled globally so columns of financial data align with pixel precision.

The border system uses neutral white at low opacity (`rgba(255, 255, 255, 0.06)`) — chromatically silent, no blue cast. This is an explicit correction of the previous cold `rgba(148, 163, 184, 0.12)` border, which introduced a subtle slate tint that fought the teal accent. With white-based borders, cards and dividers recede quietly and the single accent color does all the chromatic work. Combined with minimal shadow usage (borders and surface tiers do the heavy lifting in dark mode), the result is a calm, layered aesthetic where depth comes from background lightness, not drop shadows.

**Key Characteristics:**
- Near-black canvas (`#0a0a0c`) with three ascending surface tiers for depth
- Electric teal accent (`#06d6a0`) — one color, used only for interactive and active states
- Two-font system: Geist Sans (interface) and Geist Mono (financial data) — no third font
- Neutral white borders at 0.06 / 0.10 opacity — no blue cast (this is the fix for the previous cold `rgba(148, 163, 184)` border)
- Monospace typography for all blockchain data: amounts, hashes, addresses, keys
- Tabular numbers (`font-variant-numeric: tabular-nums`) on every numeric display
- Status colors derived from payment semantics: `confirmed → success` green, `pending → info` blue, `past_due → warning` amber, `failed → destructive` red
- No gradients, no glows, no crypto-aesthetic ornamentation — this is fintech, not DeFi
- Depth from background tiers, not shadow. Shadows are reserved for truly floating elements.
- Dark mode as the primary and default experience
- Micro-animations only on meaningful state transitions (payment confirmation, status changes)
- Generous whitespace on an 8-point grid that communicates premium quality and financial seriousness
- Checkout page designed as a focused, trust-building single card — no distractions

## 2. Color Palette & Roles

The token names below match `paykit/apps/web/app/globals.css` exactly. CSS variables are the source of truth; hex values are shown for reference.

### Canvas & Surface Tiers

Depth is created by ascending surface lightness, not by shadow. Every card, modal, or popover picks one of these four tiers.

- **`--background`** (`#0a0a0c`): The canvas. Page background, the deepest layer. Near-black with a neutral undertone.
- **`--surface-1`** (`#111113`): Cards, sidebar, default containers. The workhorse surface — one step above canvas.
- **`--surface-2`** (`#17171a`): Elevated elements — popovers, dropdowns, the checkout card. Two steps above canvas.
- **`--surface-3`** (`#1e1e22`): Hover state for surface elements, and the highest content tier. Interactive feedback.

### Text Tiers

- **`--foreground`** (`#ededef`): Headings, amounts, primary content. Near-white, neutral (no blue cast).
- **`--foreground-muted`** (`#a1a1aa`): Descriptions, labels, secondary information. Neutral zinc gray.
- **`--foreground-dim`** (`#71717a`): Placeholders, table-header uppercase labels, timestamps, disabled text. Recedes into the canvas.

### Borders

**Neutral white at low opacity, no blue cast.** This is the fix for the previous cold `rgba(148, 163, 184, 0.12)` border, which introduced a slate tint that conflicted with the teal accent.

- **`--border`** (`rgba(255, 255, 255, 0.06)`): Default border. Cards, inputs, dividers, table rows. Applied globally as `border-color` on `*, ::before, ::after`.
- **`--border-strong`** (`rgba(255, 255, 255, 0.10)`): Emphasized borders — focused inputs (before the teal ring kicks in), important dividers, the checkout card edge.

Warm-tinted borders are not permitted. Any border shade outside this scale is a regression.

### Accent

- **`--primary`** (`#06d6a0`): The accent. Interactive elements, primary buttons, active nav states, focus rings, links. A calm, electric green-teal that reads as both technical and trustworthy. Unchanged from previous versions.
- **`--primary-foreground`** (`#07070a`): Text on teal buttons.
- **`--ring`** (`#06d6a0`): Focus ring color for interactive elements.

Teal is reserved for small interactive targets. Never use it on large background areas, body text, or decoration.

### Status — Payment Semantics

Status colors are immutable and map 1:1 with payment states:

| Payment state | Token | Hex | Semantic |
|---|---|---|---|
| `confirmed` | `--success` | `#22c55e` | Payment confirmed, subscription active, webhook delivered |
| `pending` | `--info` | `#3b82f6` | Payment pending, processing, waiting for confirmation |
| `past_due` | `--warning` | `#f59e0b` | Subscription past due, charge failed but recoverable |
| `failed` | `--destructive` | `#ef4444` | Payment failed, subscription cancelled, webhook delivery failed |

- **`--destructive-foreground`** (`#fef2f2`): Text on destructive surfaces.

Do not invent additional status colors. A new payment state must map onto one of these four tokens.

### Currency

- **`--usdc`** (`#2775ca`): The official USDC brand color. Used exclusively for token indicators, currency badges, and amount displays where token identity needs emphasis.

### Shadcn Compatibility Aliases

The `:root` block keeps the following legacy shadcn names pointing at the new tiers so existing `components/ui/*` primitives continue to build. They will be rewired to surface tokens over time:

```
--card               → var(--surface-1)
--card-foreground    → var(--foreground)
--popover            → var(--surface-2)
--popover-foreground → var(--foreground)
--secondary          → var(--surface-2)
--muted              → var(--surface-1)
--muted-foreground   → var(--foreground-muted)
--accent             → var(--surface-3)
--input              → var(--border)
```

When writing new components, prefer the surface/foreground tier names directly over these aliases.

## 3. Typography Rules

### Font Family

- **Sans (interface)**: Geist Sans — `var(--font-sans)`. Vercel's geometric sans-serif, optimized for screen rendering at 12–16px.
- **Mono (blockchain data)**: Geist Mono — `var(--font-mono)`. For all financial data, blockchain identifiers, and code.
- **Global**: `font-variant-numeric: tabular-nums` is enabled on `body` so every numeric column aligns.

Do not introduce a third font family. Geist Sans + Geist Mono only.

### Hierarchy (current scale)

- **h1 / page title** — `text-2xl font-semibold tracking-tight`
  - **Changed from `text-3xl`.** The old 30px page title was too loud for a data-dense fintech dashboard; 24px with tight tracking reads as confident without shouting. One h1 per page.
- **h2 / section title** — `text-base font-semibold`
  - Section labels, card headers. 16px — deliberately close to body size so the hierarchy is carried by weight, not scale.
- **Table header** — `text-xs font-medium uppercase tracking-wider text-foreground-dim`
  - 12px uppercase, dim tier text. Used for every data-table column header and overline label.
- **Body** — `text-sm`
  - 14px. The default for descriptions, form copy, table cells, everything that isn't a heading or blockchain data.
- **Blockchain data** — `font-mono tabular-nums`
  - Applies to amounts (`$10.00`), tx hashes, wallet addresses, API keys, subscription IDs. Monospace with tabular numbers, always. Size follows the surrounding context (usually `text-sm`, larger for hero amounts).

### Principles

- **Financial data is always monospace.** Every number that represents money, every blockchain hash, every wallet address, every API key renders in Geist Mono. Sans-serif = interface, monospace = data. Users learn the split in seconds.
- **Tabular numbers are non-negotiable.** `font-variant-numeric: tabular-nums` on every numeric display. Proportional numbers in financial tables is a cardinal sin.
- **Hierarchy through weight, not just size.** Body is `font-normal`, labels and buttons `font-medium`, headings `font-semibold`. Nothing above 600.
- **Truncate blockchain data, never wrap.** Wallet addresses: `0x1a2b...3c4d` (first 6 + last 4). Tx hashes: same. API keys: `sk_live_...a1b2` (prefix + last 4). Copy button adjacent. Never multi-line.

## 4. Component Stylings

### Buttons

**Primary**
- Background: `bg-primary` (`#06d6a0`)
- Text: `text-primary-foreground`
- Radius: `rounded-md` (`--radius` = 0.625rem)
- Font: `text-sm font-medium`
- Hover: subtle primary darken
- Focus: `ring-2 ring-ring` with 2px offset
- Disabled: 40% opacity
- Use: Primary actions ("Create Product", "Generate Key", "Connect Wallet & Pay")

**Secondary**
- Background: `transparent`
- Border: `1px solid var(--border)`
- Text: `text-foreground`
- Hover: background `var(--surface-1)`, border `var(--border-strong)`
- Use: Secondary actions ("Cancel", "Back", "Export CSV", "View Details")

**Ghost**
- Background: `transparent`
- Text: `text-foreground-muted`
- Hover: background `var(--surface-1)`, text `var(--foreground)`
- Use: Tertiary actions, nav links, toolbar items

**Destructive**
- Background: `transparent`
- Border: `1px solid color-mix(in oklab, var(--destructive) 30%, transparent)`
- Text: `text-destructive`
- Hover: background destructive at 12% opacity
- Use: Irreversible actions

**Icon Button**
- Size: 36px × 36px desktop, 44px × 44px mobile
- Icon: 16px, `text-foreground-dim`
- Hover: background `var(--surface-1)`, icon `var(--foreground)`

### Cards & Containers

**Default Card** — `bg-surface-1 border border-border rounded-lg p-6`
- Dashboard content containers, form sections, settings panels.

**Elevated Card** — `bg-surface-2 border border-border rounded-lg p-6`
- Modals, dropdowns, popovers, command palette.

**Checkout Card** — `bg-surface-2 border border-border-strong rounded-xl p-8 max-w-[480px]`
- The single most important card in the system. Centered, slightly stronger border.

**Stat Card** — `bg-surface-1 border border-border rounded-lg p-6`
- Top: uppercase label (table-header style, `text-foreground-dim`).
- Bottom: large mono number (`font-mono tabular-nums`, `text-foreground`).
- Optional: small trend badge right-aligned.

### Badges / Tags / Pills

All status badges follow the same shape: full pill (`rounded-full`), `text-xs font-medium`, `px-2.5 py-0.5`, 1px border in the status color at ~30% opacity, background at ~12% opacity, foreground at the full status color.

- **Confirmed / Active** — `--success` / green
- **Pending** — `--info` / blue
- **Past Due / Warning** — `--warning` / amber
- **Failed / Cancelled** — `--destructive` / red
- **USDC Token Badge** — `--usdc` / USDC blue, `rounded-md` (slightly less round than status pills)

### Inputs & Forms

**Text Input**
- Background: `bg-background`
- Border: `1px solid var(--border)`
- Text: `text-foreground`
- Placeholder: `text-foreground-dim`
- Radius: `rounded-md`
- Height: 40px (`h-10`)
- Focus: border `var(--primary)`, ring `ring-2 ring-ring/20`
- Error: border `var(--destructive)`

**Select / Dropdown** — same base as text input; dropdown panel uses Elevated Card styling; option hover = `bg-surface-3`; selected option text = `text-primary`.

**Toggle Switch** — track inactive `var(--border-strong)`, track active `var(--primary)`, thumb `var(--foreground)`.

### Navigation

**Sidebar**
- Background: `var(--sidebar)` (= `--surface-1`)
- Right border: `1px solid var(--sidebar-border)` (= `--border`)
- Section labels: table-header style — `text-xs font-medium uppercase tracking-wider text-foreground-dim`
- Nav items: `h-9 px-3 rounded-md text-sm`
- Inactive: `text-foreground-muted`, icon `text-foreground-dim`
- Hover: `bg-surface-2`, text + icon `text-foreground`
- Active: `bg-primary/10`, text + icon `text-primary`

### Tables

- Container: lives inside a Default Card (no extra wrapper needed).
- Header row: `text-xs font-medium uppercase tracking-wider text-foreground-dim`, bottom border `var(--border)`.
- Data row: `text-sm text-foreground`, bottom border `var(--border)`.
- Row hover: `bg-surface-1` (if the table lives on `--background`) or `bg-surface-2` (if in a card).
- Cell padding: `py-3.5 px-4` (see Spacing section).
- Monospace cells: amounts (right-aligned), tx hashes (truncated + copy button).
- Status column: status pill.
- Actions column: icon buttons, right-aligned.

### Checkout Page Layout

- Full viewport, `bg-background`, centered card.
- Checkout Card — `max-w-[480px]`, `bg-surface-2`, `border-border-strong`, `rounded-xl`, `p-8`.
- Top: product name (h2 style), description (`text-sm text-foreground-muted`), price (`font-mono tabular-nums text-2xl`) + USDC badge.
- Divider: `border-t border-border`, `my-6`.
- Middle: customer info fields, stacked with `gap-3`.
- Bottom: primary "Connect Wallet & Pay" button (full width) and/or QR code block.
- Footer: "Powered by Paylix" caption, `text-xs text-foreground-dim`, centered.

## 5. Layout Principles

### Spacing — 8-Point Grid

Paylix uses an **8-point grid** (with 4px permitted as a half-step for tight compositions). Prefer multiples of 8. This creates visual rhythm without requiring pixel-level precision.

**Canonical spacings — use these verbatim:**

- **Page gutters** — `px-8 py-10` (32px horizontal, 40px vertical)
- **Section gaps** — `gap-10` (40px between major sections on a page)
- **Card padding** — `p-6` (24px — the workhorse card inset)
- **Table cell padding** — `py-3.5 px-4` (14px vertical, 16px horizontal — the one deliberate 4px half-step, because 14px row density reads better than 16px for dense data)
- Form field gap — `gap-4` (16px)
- Stat card grid gap — `gap-4` (16px)

### Grid & Container

- Dashboard max content width: `max-w-[1200px]`, centered.
- Sidebar: fixed `240px` desktop, collapses on tablet/mobile.
- Main content area: fluid, `px-8 py-10`.
- Stat cards: 3-column CSS grid at desktop, `gap-4`.
- Forms: single column, `max-w-[560px]`.
- Checkout page: centered `max-w-[480px]`.

### Whitespace Philosophy

- **Generous spacing equals trust.** A payment platform with cramped margins feels amateur. Cards breathe; sections breathe.
- **Data tables are denser by design.** Users scan them — density helps. But tables sit inside a padded card, so the density is contained.
- **Rhythm over pixel-perfection.** The 8-point grid is law. A 24px inset that "should" be 22px is better at 24px because consistency outweighs any single measurement being "optimal."

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `0.375rem` (6px) | Inline tags, small pills, tight controls |
| `--radius` / `--radius-md` | `0.625rem` (10px) | Buttons, inputs, nav items, default cards |
| `--radius-lg` | `0.875rem` (14px) | Elevated cards, modals, major containers |
| `--radius-xl` | `1rem` (16px) | Checkout card, hero elements |
| Full pill | `9999px` | Status badges, avatars |

## 6. Depth & Elevation

On a near-black canvas, shadows are barely perceptible. **Depth comes from surface tiers, not shadow.**

| Level | Treatment | Use |
|---|---|---|
| Canvas (L0) | `--background` | Page background, empty areas |
| Flat (L1) | `--surface-1` + `--border` | Cards, containers, inputs, sidebar |
| Raised (L2) | `--surface-2` + `--border` | Dropdowns, popovers, tooltips, modals |
| Elevated (L3) | `--surface-2` + `--border-strong` + optional shadow | Checkout card, command palette |
| Hover state | `--surface-3` | Transient hover background on interactive surfaces |

Shadows are reserved for truly floating elements (checkout card, command palette, critical overlays). For everything else, move up one surface tier instead of adding a shadow.

### Backdrop

- Modal/dialog/drawer backdrop: `rgba(0, 0, 0, 0.65)` with `backdrop-blur-sm`.
- Transition: opacity 200ms ease.

## 7. Do's and Don'ts

### Do

- Use `--primary` (`#06d6a0`) exclusively for interactive elements — buttons, links, focus rings, active nav items, toggle tracks. Protect it.
- Apply Geist Mono to every piece of financial data: amounts (`$10.00`), hashes (`0x1a2b...`), addresses, API keys (`sk_live_...`), subscription IDs. No exceptions.
- Enable `tabular-nums` on every numeric display.
- Truncate wallet addresses to first 6 + `...` + last 4 characters. Add a copy-to-clipboard icon button adjacent.
- Use status colors consistently: `success`=confirmed/active, `info`=pending, `warning`=past_due, `destructive`=failed/cancelled.
- Keep the checkout card centered at `max-w-[480px]`.
- Maintain the 8-point spacing grid.
- Use surface tiers for depth. Move up a tier instead of adding a shadow.
- Show USDC amounts with exactly 2 decimal places (`$10.00`, not `$10`) and the USDC token badge alongside.

### Don't

- Don't use gradients, glows, neon effects, or animated backgrounds. These are crypto-aesthetic tropes. Paylix is a payment tool, not a DeFi dashboard.
- Don't use font weight above 600.
- Don't apply teal to large background areas, body text, or decorative elements.
- Don't use pure black (`#000000`) as the canvas. Use `--background` (`#0a0a0c`).
- **Don't reintroduce `rgba(148, 163, 184, …)` borders.** These are the old cold slate-tinted borders; they're gone for a reason. Use `--border` / `--border-strong`.
- Don't wrap wallet addresses or transaction hashes to multiple lines.
- Don't use emoji or decorative icons in the dashboard. Use Lucide icons, stroke width 1.5px, in `--foreground-dim` (inactive) or `--foreground` (active).
- Don't add box-shadows to L1/L2 cards. Shadows are reserved for L3 floating elements.
- Don't introduce a third font family.
- Don't use color alone to communicate status. Always pair with a text label.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Sidebar collapses to bottom tab bar. Stat cards stack to 1-column. Tables scroll horizontally with sticky first column. Checkout is full-width with 16px padding. |
| Tablet | 640–1024px | Sidebar collapses to icon-only rail (56px). Stat cards in 2-column grid. Page gutters reduce to `px-6 py-8`. |
| Desktop | > 1024px | Full sidebar (240px). Stat cards 3-column. Page gutters `px-8 py-10`. |

### Touch Targets

- Minimum touch target: 44×44px on mobile (WCAG 2.5.5).
- Table rows: 52px height.
- Buttons: 40px desktop, 44px mobile.
- Icon buttons: 36×36px desktop, 44×44px mobile.

### Collapsing Strategy

- Sidebar: 240px full → 56px icon rail → hidden (bottom tab bar on mobile).
- Stat cards: 3-col → 2-col → 1-col stack.
- Data tables: fixed layout → horizontal scroll, sticky first and actions columns.
- Forms: `max-w-[560px]` at all sizes, gutters adjust.
- Checkout card: `max-w-[480px]` centered → full-width with 16px horizontal padding.
- Page header (title + actions): side-by-side → stacked.

### Image Behavior

- Paylix logo: SVG, 24px in sidebar, 20px in mobile nav, 28px on checkout.
- Token icons (USDC): 16px in tables, 20px in checkout.
- QR codes: 200px desktop, 160px mobile, always centered.
- No decorative illustrations — the UI is data-driven.

## 9. Agent Prompt Guide

### Quick Token Reference

- Brand / interactive: `--primary` (`#06d6a0`)
- Canvas: `--background` (`#0a0a0c`)
- Card surface: `--surface-1` (`#111113`)
- Elevated surface: `--surface-2` (`#17171a`)
- Hover surface: `--surface-3` (`#1e1e22`)
- Primary text: `--foreground` (`#ededef`)
- Muted text: `--foreground-muted` (`#a1a1aa`)
- Dim text: `--foreground-dim` (`#71717a`)
- Border: `--border` (`rgba(255, 255, 255, 0.06)`)
- Strong border: `--border-strong` (`rgba(255, 255, 255, 0.10)`)
- Success (confirmed): `--success` (`#22c55e`)
- Warning (past_due): `--warning` (`#f59e0b`)
- Info (pending): `--info` (`#3b82f6`)
- Destructive (failed): `--destructive` (`#ef4444`)
- USDC: `--usdc` (`#2775ca`)
- Financial amounts: `font-mono tabular-nums`

### Example Component Prompts

- "Build a payment status badge. `rounded-full`, `text-xs font-medium`, `px-2.5 py-0.5`, 1px border in the status color at 30% opacity, bg at 12% opacity, text at the full status color. Confirmed → `--success`. Pending → `--info`. Past due → `--warning`. Failed → `--destructive`."

- "Build a stat card. `bg-surface-1 border border-border rounded-lg p-6`. Top: uppercase label `text-xs font-medium uppercase tracking-wider text-foreground-dim`. Bottom: large amount `font-mono tabular-nums text-2xl font-semibold text-foreground`. Optional trend badge right-aligned."

- "Build the sidebar nav. Width 240px, `bg-sidebar` (= `--surface-1`), right border `--sidebar-border`. Section labels: `text-xs font-medium uppercase tracking-wider text-foreground-dim`. Nav items: `h-9 px-3 rounded-md text-sm`. Inactive: `text-foreground-muted`, icon `text-foreground-dim`. Hover: `bg-surface-2`, text+icon `text-foreground`. Active: `bg-primary/10`, text+icon `text-primary`."

- "Build the checkout page. Full viewport `bg-background`. Centered card: `max-w-[480px] bg-surface-2 border border-border-strong rounded-xl p-8`. Product name in h2 style (`text-base font-semibold`). Price `font-mono tabular-nums text-2xl font-semibold` + USDC badge. Customer fields stacked with `gap-3`. Full-width primary button. QR code section below divider, centered."

- "Build a data table for payments. Lives inside a Default Card. Header: `text-xs font-medium uppercase tracking-wider text-foreground-dim`, bottom border `--border`. Rows: `text-sm text-foreground`, cell padding `py-3.5 px-4`, row hover `bg-surface-2`. Amount column: `font-mono tabular-nums` right-aligned + USDC badge. Status column: pill badges. Tx hash: mono truncated (6+4) + copy icon button."

### Iteration Guide

1. Start with `--background` canvas, `--surface-1` cards, `--foreground` text — this is the foundation of every screen.
2. Teal is ONLY for things the user clicks, focuses, or that indicate "active."
3. All financial data renders in Geist Mono with `tabular-nums`. Every time.
4. Depth comes from surface tiers (`--surface-1` → `--surface-2` → `--surface-3`), not shadow.
5. Borders are neutral white at 0.06 / 0.10 opacity. No slate, no blue cast.
6. The 8-point spacing grid is law: `px-8 py-10` page gutters, `gap-10` section gaps, `p-6` card padding, `py-3.5 px-4` table cells.
7. Status colors are immutable: `success`=confirmed, `info`=pending, `warning`=past_due, `destructive`=failed.
8. The checkout page is a single centered card (`max-w-[480px]`).
9. More whitespace is almost always the right call.
