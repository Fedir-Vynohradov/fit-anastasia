# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

The project requires **Node 20+**. The system Node may be older — load nvm before any `npm`/`npx` command:

```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
```

The repository sits at `/Users/fedorvinogradov/Documents/Claud Code/food-tracker`. The parent directory name contains a space, so always quote the path.

## Commands

```bash
npm run dev         # Start Next.js dev server on port 3000 (Turbopack)
npm run build       # Production build
npm start           # Run production build
npx tsc --noEmit    # Type-check without emitting
```

There are no tests, no lint script, and no formatter configured.

## Architecture

This is a single-user mobile-first food tracking app, branded "Fit Anastasia" — Next.js 14 App Router (running under Next 16.2 + Turbopack), all-local SQLite, no auth, no remote services beyond the Anthropic API.

### Request flow for the core "log a meal" feature

1. `components/CameraCapture.tsx` reads the file via `<input capture="environment">`, then **client-side compresses to ~800px JPEG quality 0.75** before any network call. This is essential — uncompressed phone photos easily exceed multi-MB and slow down the Claude vision call.
2. `app/page.tsx` `handleAnalyze` is a two-step pipeline: `POST /api/analyze` (vision → JSON) → `POST /api/meals` (persist). Both must succeed; failure of either returns the UI to `preview` state with the photo still in memory so the user can retry.
3. `app/api/analyze/route.ts` strips the data-URL prefix, sends image + `ANALYSIS_PROMPT` to `claude-sonnet-4-6`, and `JSON.parse`s the response directly. The prompt explicitly forbids markdown fences — if Claude wraps the JSON in ```` ``` ```` blocks the parse fails. Keep the "Do NOT include any text outside the JSON object" rule in the prompt.

The estimate Claude returns includes a `confidence` field (`high`/`medium`/`low`), persisted alongside macros and rendered as a pill on each meal card.

### Personalized advice (Coach)

`app/api/advice/route.ts` does **not** send images to Claude — it sends a JSON summary of meals from the last N days (3/7/14, controlled by the UI). Image data lives only on the client and in SQLite. Note the route is still `/api/advice`; the user-facing page is `/coach`.

### Storage

`lib/db.ts` uses `@neondatabase/serverless` (Neon Postgres over HTTP), connected via `DATABASE_URL`. The HTTP-based driver is required for Vercel — connection-pool drivers don't work in serverless functions. The same connection is used in local dev; there is no separate dev/prod path.

All query functions in `lib/db-queries.ts` are **async** and call `await ensureSchema()` first. `ensureSchema()` is memoized per cold container, so the `CREATE TABLE IF NOT EXISTS` runs at most once per warm function instance.

Images are stored as base64 in the `meals.image_data` text column. This keeps the app deployment-trivial but means the DB grows quickly — the client-side compression step in `CameraCapture` is what makes it tolerable. If image storage becomes a concern, move to Vercel Blob and store only the URL in `image_data`.

### Env loading (important gotcha)

Anthropic clients are constructed via `getApiKey()` from `lib/env.ts` **inside each request handler**, not at module top-level. Reason: under Next.js 16 + Turbopack, `process.env.ANTHROPIC_API_KEY` is set to an empty string before `.env.local` is loaded, which (a) silently breaks `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })` at module load with a confusing "Could not resolve authentication method" error, and (b) defeats the default `dotenv.config()` because dotenv won't overwrite existing keys.

`lib/env.ts` works around this with `dotenv.config({ override: true })`. `lib/db.ts` applies the same workaround for `DATABASE_URL`. **Do not** revert to reading these vars directly at module scope. On Vercel both vars are injected normally and the dotenv calls are no-ops.

### Pages and routing

Four routes under `app/`:
- `/` — today's macros, camera, today's meals (also includes its own date scrubber, so you can browse days without leaving Today)
- `/history` — date navigation + meal list for any past day
- `/coach` — Claude-generated nutrition report for the last 3/7/14 days
- `/settings` — read-only daily targets (no editing UI yet)

Bottom nav lives in `components/Navigation.tsx`, mounted in `app/layout.tsx`. Pages render inside `<main className="max-w-md mx-auto page-content">` so all content is phone-width even on desktop.

Daily goals are hard-coded constants in `lib/types.ts` (`DEFAULT_GOALS`). The `/settings` page reads from these — when adding goal editing, persist somewhere (localStorage or DB) and have all four pages read from the same source.

### Design system

Tailwind CSS v4 with **inline theme tokens** in `app/globals.css` via `@theme inline { --color-*: var(--*) }`. The CSS custom properties (e.g. `--terracotta`, `--card`, `--ink`) are mapped to utility classes (`bg-terracotta`, `bg-card`, `text-ink`). When adding new colors, register them in **both** the `:root` block and the `@theme inline` block — Tailwind only generates utilities for tokens declared in `@theme`.

Two fonts loaded in `app/layout.tsx`: **Fraunces** (serif, used via `.font-serif` class for headings, ring values, brand wordmark) and **Inter** (default body sans). Numbers in `MacroRings` use Fraunces specifically — the design relies on serif numerals for visual weight.

Macro accent colors map: calories → terracotta, protein → sage, carbs → mustard, fat → mauve. Reuse these everywhere a macro is referenced.

`components/BrandHeader.tsx` and `components/DateNav.tsx` are shared header pieces — every top-level page uses them rather than inlining the header. The "Fit Anastasia" wordmark only lives in `BrandHeader`.
