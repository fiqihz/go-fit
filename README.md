# go-fit

A mobile-first PWA for tracking daily nutrition and body weight, and hitting
your macro targets. Log meals across Breakfast, Lunch, Snack, and Dinner, watch
calories and macros roll up against customizable daily goals, track your weight
over time, and review weekly/monthly summaries.

## Features

- **Diary** — daily calorie ring + carbs/fat/protein bars, four meal sections,
  add/edit foods via a bottom sheet, back-date any entry with a date picker.
- **Food library** — save foods once and reuse them, or quick-add on the fly.
- **Weight** — log daily body weight with a 30-day history and change delta.
- **Summary** — this week / this month / 7 / 30 days or a custom range, with a
  weight-trend sparkline plus nutrition totals and daily averages.
- **Goals** — customizable daily targets for calories and each macro.
- **In-app reminder** — a nudge when today's weight isn't logged yet.
- **Bilingual** — English / Bahasa Indonesia toggle.
- **PWA** — installable, offline app-shell.

## Tech stack

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase
(Auth + Postgres + RLS) · Zustand · vaul · framer-motion.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up Supabase — create a project, run [`supabase/schema.sql`](./supabase/schema.sql)
   in the SQL Editor, then copy your keys into `.env` (see [`.env.example`](./.env.example)):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Details in [`supabase/README.md`](./supabase/README.md).
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint

## Deployment

Deploy on Vercel. Add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel project
settings. All user data is isolated per account via Supabase Row Level Security.
