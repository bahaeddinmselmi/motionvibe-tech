<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Digital Store — Project Rules for Agents

## Stack & Versions

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.10 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | TailwindCSS v4 | ^4 |
| Database | Supabase (Postgres + RLS) | @supabase/supabase-js ^2 |
| Icons | lucide-react | ^1.23.0 |
| Payments | Flouci (TND, Tunisia) | custom lib |
| Email | Resend | via API key |
| Container | Docker (standalone Next.js) | node:20-alpine |

> ⚠️ **lucide-react v1.23+ has different icon names.** The `Youtube` icon does NOT exist — use `Video` instead. Always verify icon names with:
> ```bash
> node -e "const l = require('lucide-react'); console.log(Object.keys(l).filter(k => k.toLowerCase().includes('YOUR_TERM')))"
> ```

---

## Project Structure

```
app/
  [slug]/page.tsx          # Public product landing page (customer-facing)
  admin/
    page.tsx               # Admin dashboard (stats + recent orders)
    login/                 # Admin auth
    products/
      page.tsx             # Product list table
      new/page.tsx         # Create new product
      [id]/page.tsx        # Edit existing product ← was missing, now exists
    orders/                # Order management
  api/
    checkout/              # POST: creates Flouci payment link + Supabase order
    webhook/flouci/        # POST: Flouci payment confirmation webhook
lib/
  types.ts                 # Shared TypeScript interfaces
  supabase/client.ts       # Browser Supabase client
  supabase/server.ts       # Server-side Supabase client
  supabase/service.ts      # Service role client (bypasses RLS)
  flouci.ts                # Flouci payment API wrapper
  ba9chich.ts              # ba9chich.com checkout integration
proxy.ts                   # Next.js middleware (auth guard for /admin)
```

---

## Data Model — Product

Defined in `lib/types.ts`. Key fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Product name, shown in h1 |
| `slug` | string | URL path, unique |
| `subtitle` | string? | Short tagline under title |
| `description` | string? | **Admin-editable About section text.** Supports `\n` newlines. Rendered with `dangerouslySetInnerHTML` replacing `\n` → `<br/>`. Do NOT store HTML — plain text + newlines only. |
| `superprofile_url` | string? | SuperProfile.bio embed URL. Renders as iframe (600px tall) + "Open ↗" link. |
| `hero_image` | string? | Main product image URL (shown in page + checkout form) |
| `price` | number | TND (Tunisian Dinar) |
| `original_price` | number? | If set, shows strikethrough + discount % badge |
| `features` | string[] | Bullet list in "What's included" section |
| `sections` | ProductSection[] | Dynamic page sections (see below) |
| `preview_images` | {url, caption?}[] | Demo preview gallery |
| `testimonials` | {name, text, rating, avatar?}[] | Customer reviews |
| `faqs` | {question, answer}[] | FAQ accordion |
| `ba9chich_product_id` | number? | ba9chich.com product ID for checkout |
| `is_active` | boolean | Only active products are publicly visible |

### Dynamic Section Types (`ProductSection`)

Sections are stored as JSONB in Supabase. Types:

```typescript
type ProductSection =
  | { type: 'youtube';  title?: string; videos: {url: string; caption?: string}[] }
  | { type: 'images';   title?: string; images: {url: string; caption?: string}[] }
  | { type: 'carousel'; title?: string; images: {url: string; caption?: string}[] }
  | { type: 'text';     title: string;  content: string }
  | { type: 'bullets';  title: string;  items: string[]; icon?: 'check'|'star'|'fire' }
```

---

## Design System — Palette

All colors are defined as constants at the top of `app/[slug]/page.tsx`. Do NOT use arbitrary Tailwind color classes — use these:

```typescript
const OR   = '#E05C00'   // burnt orange — primary CTA / accents
const OR_L = '#FF6B0A'   // lighter hover state
const DARK = '#111111'   // headings / bold text
const MID  = '#555555'   // body text
const LITE = '#888888'   // captions / secondary text
const SAND = '#F5F2EC'   // section alternating background
const BDR  = '#E0DDD8'   // border color
```

The font family uses CSS variables `var(--font-dm)` and `var(--font-inter)` — set in `app/layout.tsx`.

---

## Checkout Form Rules

- The form uses `border: 2px dashed ${BDR}` — **always dashed, never solid**
- Internal dividers also use `borderTop/Bottom: 2px dashed ${BDR}`
- Hero image appears at the **very top** of the form (before the header)
- The **"Yes, I Want This! 🎉"** checkbox is required — form submission is blocked if unchecked
- The `wantThis` state is client-side only — not sent to the API
- Currency is always **TND** (Tunisian Dinar)

---

## Admin Panel Rules

- Admin routes are protected by `proxy.ts` middleware — redirects unauthenticated users to `/admin/login`
- Admin uses a dark `bg-[#050818]` theme for the dashboard; light `bg-[#F5F2EC]` for product forms
- Product editor (`/admin/products/[id]`) loads the product by `id` (UUID), not slug
- After save, always redirect to `/admin/products`
- The `description` field in admin is a plain `<textarea>` — no rich text editor — plain text with newlines

---

## Supabase Rules

- **Public clients** (`lib/supabase/client.ts`) use anon key — subject to RLS
- **Server clients** (`lib/supabase/server.ts`) use anon key with cookie-based auth
- **Service client** (`lib/supabase/service.ts`) uses service role key — bypasses RLS, only use in API routes
- RLS policy: only `is_active = true` products are readable by the public
- Admins bypass RLS via service role key in API routes
- **Never use the service role key on the client side**

### Required DB columns (run migration if missing):
```sql
alter table products add column if not exists description text;
alter table products add column if not exists superprofile_url text;
alter table products add column if not exists sections jsonb default '[]';
```

---

## Payment Flow

```
Customer fills form
  → POST /api/checkout
    → Creates order in Supabase (status: 'pending')
    → Calls Flouci API to get payment link
    → Returns { flounciUrl }
  → Client shows RedirectOverlay (5s countdown)
  → Redirect to Flouci payment page
  → Flouci POSTs to /api/webhook/flouci on success
    → Updates order status to 'confirmed'
    → Sends download email via Resend
```

---

## Docker

- `output: "standalone"` is set in `next.config.ts` — required for Docker
- The Dockerfile uses 3 stages: deps → builder → runner (node:20-alpine)
- Secrets (service role key, Flouci keys, Resend key) are **runtime env vars**, never build args
- `NEXT_PUBLIC_*` vars are build-time args (baked into bundle) AND runtime vars
- `.dockerignore` excludes `node_modules`, `.next`, `.env*`

```bash
# Deploy
cp .env.example .env   # fill in real keys
docker compose up --build -d
```

---

## Environment Variables

| Variable | Side | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (build + runtime) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (build + runtime) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ✅ |
| `FLOUCI_PUBLIC_KEY` | Server only | ✅ |
| `FLOUCI_PRIVATE_KEY` | Server only | ✅ |
| `RESEND_API_KEY` | Server only | ✅ |

Local dev: put these in `.env.local` (already created from `.env.example`).
