# go-fit — Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`schema.sql`](./schema.sql), and run it.
   This creates the tables (`daily_goals`, `foods`, `meal_entries`, `body_weights`),
   enables Row Level Security scoped to each signed-in user, and adds a trigger that
   seeds default goals when a user signs up.
3. In **Project Settings > API**, copy the **Project URL** and **anon public key**
   into your `.env` file (see `.env.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. Under **Authentication > Providers**, keep **Email** enabled. To let anyone sign
   up and use the app, leave sign-ups on. For a smoother demo you can turn off
   "Confirm email" under **Authentication > Sign In / Providers > Email**.

All data is isolated per user by RLS, so the app is safe to share publicly.
