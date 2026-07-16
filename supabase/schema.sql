-- The Pack Version 1 starter schema for Supabase
-- Run this in Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  initials text not null default '',
  privacy text not null default 'friends' check (privacy in ('public','friends','private')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stickers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text not null check (section in ('beer','events','food','challenges','special')),
  image_path text not null,
  unlock_method text not null default 'staff_code' check (unlock_method in ('honor_check_in','qr_code','staff_code','automatic','hidden')),
  unlock_code text not null unique,
  enabled boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Preserve existing reward rows while bringing older databases onto the V1.2.1 model.
alter table public.stickers
add column if not exists unlock_method text not null default 'staff_code';

alter table public.stickers
drop constraint if exists stickers_unlock_method_check;

alter table public.stickers
add constraint stickers_unlock_method_check
check (unlock_method in ('honor_check_in','qr_code','staff_code','automatic','hidden'));

create table if not exists public.user_stickers (
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, sticker_id)
);

create table if not exists public.sticker_placements (
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  section text not null,
  page_number integer not null check (page_number > 0),
  slot_number integer not null check (slot_number between 0 and 2),
  placed_at timestamptz not null default now(),
  primary key (user_id, sticker_id),
  unique (user_id, section, page_number, slot_number)
);

create table if not exists public.friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location text not null check (location in ('Mooresville','Fletcher Place')),
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.stickers enable row level security;
alter table public.user_stickers enable row level security;
alter table public.sticker_placements enable row level security;
alter table public.friendships enable row level security;
alter table public.checkins enable row level security;

-- Profiles
create policy "profiles readable by authenticated users"
on public.profiles for select to authenticated using (true);
create policy "users insert own profile"
on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "users update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Stickers are readable by signed-in users. Admin writes should be done through a protected backend/Edge Function.
create policy "active stickers readable"
on public.stickers for select to authenticated using (enabled = true);

-- Each user owns their unlocks and placements.
create policy "users read own unlocked stickers"
on public.user_stickers for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own unlocked stickers"
on public.user_stickers for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users read own placements"
on public.sticker_placements for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own placements"
on public.sticker_placements for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own placements"
on public.sticker_placements for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users delete own placements"
on public.sticker_placements for delete to authenticated using ((select auth.uid()) = user_id);

-- Friendships
create policy "users read their friendships"
on public.friendships for select to authenticated
using ((select auth.uid()) in (requester_id, addressee_id));
create policy "users send friend requests"
on public.friendships for insert to authenticated with check ((select auth.uid()) = requester_id);
create policy "users update received friendships"
on public.friendships for update to authenticated
using ((select auth.uid()) = addressee_id) with check ((select auth.uid()) = addressee_id);

-- Check-ins: users control their own rows. Friend visibility should be exposed through a secure function/view later.
create policy "users read own checkins"
on public.checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy "users create own checkins"
on public.checkins for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own checkins"
on public.checkins for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Atomic reward redemption. Reward IDs remain permanent and separate from the shared unlock code.
drop function if exists public.redeem_sticker_code(text);
create function public.redeem_sticker_code(code_input text)
returns table (sticker_id uuid, sticker_name text, sticker_section text, image_path text, already_collected boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched public.stickers;
  inserted_count integer;
begin
  select * into matched
  from public.stickers
  where enabled = true and upper(trim(unlock_code)) = upper(trim(code_input))
  limit 1;

  if matched.id is null then
    raise exception 'INVALID_CODE';
  end if;

  insert into public.user_stickers(user_id, sticker_id)
  values ((select auth.uid()), matched.id)
  on conflict do nothing;

  get diagnostics inserted_count = row_count;

  return query select matched.id, matched.name, matched.section, matched.image_path, inserted_count = 0;
end;
$$;

revoke all on function public.redeem_sticker_code(text) from public;
grant execute on function public.redeem_sticker_code(text) to authenticated;
