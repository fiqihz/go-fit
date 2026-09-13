-- ============================================================================
-- go-fit — Database Schema (Supabase / PostgreSQL)
-- ============================================================================
-- Multi-user nutrition tracker. Every row is owned by an authenticated user
-- (auth.uid()). Row Level Security ensures a user only ever sees their own
-- data, so the app can be shared publicly with sign-up enabled.
--
-- How to apply: Supabase Dashboard > SQL Editor > paste & Run.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. DAILY GOALS (one row per user; customizable targets)
-- ----------------------------------------------------------------------------
create table if not exists daily_goals (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  target_calories  integer not null default 2000 check (target_calories >= 0),
  target_carbs_g   numeric(7,2) not null default 250 check (target_carbs_g >= 0),
  target_fat_g     numeric(7,2) not null default 65  check (target_fat_g >= 0),
  target_protein_g numeric(7,2) not null default 150 check (target_protein_g >= 0),
  onboarded        boolean not null default false,
  updated_at       timestamptz not null default now()
);

-- Safe to re-run: add the onboarding flag if the table predates this column.
alter table daily_goals
  add column if not exists onboarded boolean not null default false;

-- ----------------------------------------------------------------------------
-- 2. FOODS (personal reusable library)
-- ----------------------------------------------------------------------------
create table if not exists foods (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  serving      text,                       -- free text, e.g. "100 g", "1 cup"
  calories     numeric(8,2) not null default 0 check (calories >= 0),
  carbs_g      numeric(7,2) not null default 0 check (carbs_g >= 0),
  fat_g        numeric(7,2) not null default 0 check (fat_g >= 0),
  protein_g    numeric(7,2) not null default 0 check (protein_g >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_foods_user on foods(user_id);
create index if not exists idx_foods_user_name on foods(user_id, lower(name));

-- ----------------------------------------------------------------------------
-- 3. MEAL ENTRIES (a logged food on a specific date + meal session)
-- ----------------------------------------------------------------------------
create table if not exists meal_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  food_id      uuid references foods(id) on delete set null, -- optional link to library
  entry_date   date not null,
  meal_type    text not null check (meal_type in ('breakfast','lunch','snack','dinner')),
  name         text not null,              -- snapshot of the food name
  serving      text,
  calories     numeric(8,2) not null default 0 check (calories >= 0),
  carbs_g      numeric(7,2) not null default 0 check (carbs_g >= 0),
  fat_g        numeric(7,2) not null default 0 check (fat_g >= 0),
  protein_g    numeric(7,2) not null default 0 check (protein_g >= 0),
  logged_time  time,                       -- optional "Time" field
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_meal_entries_user_date on meal_entries(user_id, entry_date);

-- ----------------------------------------------------------------------------
-- 4. BODY WEIGHTS (one entry per user per date)
-- ----------------------------------------------------------------------------
create table if not exists body_weights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  entry_date   date not null,
  weight_kg    numeric(6,2) not null check (weight_kg > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, entry_date)
);
create index if not exists idx_body_weights_user_date on body_weights(user_id, entry_date);

-- ============================================================================
-- ROW LEVEL SECURITY — every table is scoped to auth.uid()
-- ============================================================================
alter table daily_goals  enable row level security;
alter table foods        enable row level security;
alter table meal_entries enable row level security;
alter table body_weights enable row level security;

-- daily_goals
drop policy if exists "own goals" on daily_goals;
create policy "own goals" on daily_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- foods
drop policy if exists "own foods" on foods;
create policy "own foods" on foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- meal_entries
drop policy if exists "own meal_entries" on meal_entries;
create policy "own meal_entries" on meal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- body_weights
drop policy if exists "own body_weights" on body_weights;
create policy "own body_weights" on body_weights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Convenience: auto-create a default goals row when a user signs up.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.daily_goals (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
