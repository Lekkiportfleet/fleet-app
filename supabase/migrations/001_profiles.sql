-- Step 1: profiles table
-- Extends Supabase's built-in auth.users with app-specific role/profile data.
-- Run this in Supabase: SQL Editor → New query → paste → Run.

create type user_role as enum ('driver', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'driver',
  created_at timestamptz not null default now()
);

-- Row-level security: locked down by default, opened up by policy below.
alter table profiles enable row level security;

-- Every logged-in user can read their own profile row (needed so the app
-- can tell if the person logged in is a driver or an admin).
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Admins can read every profile (needed for the admin dashboard later).
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
