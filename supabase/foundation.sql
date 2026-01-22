create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users.id on delete cascade,
  email text,
  role text not null default 'staff' check (role in ('manager', 'staff')),
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.sync_auth_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new.role),
    true
  )
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_profile_role_sync on public.profiles;

create trigger on_profile_role_sync
  after insert or update of role on public.profiles
  for each row execute function public.sync_auth_role();

alter table public.profiles enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

create policy "Profiles are viewable by their owners"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.restaurant_members rm_manager
      join public.restaurant_members rm_member
        on rm_member.restaurant_id = rm_manager.restaurant_id
      where rm_manager.user_id = auth.uid()
        and rm_manager.role = 'manager'
        and rm_member.user_id = profiles.id
    )
  );

create policy "Profiles are updateable by their owners"
  on public.profiles
  for update
  using (auth.uid() = id);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  user_id uuid references auth.users.id on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.staff enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'staff'
  loop
    execute format('drop policy if exists %I on public.staff', pol.policyname);
  end loop;
end $$;

create policy "Managers can manage staff"
  on public.staff
  for all
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = staff.restaurant_id
        and rm.role = 'manager'
    )
  )
  with check (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = staff.restaurant_id
        and rm.role = 'manager'
    )
  );

create policy "Members can read staff in their restaurant"
  on public.staff
  for select
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = staff.restaurant_id
    )
  );

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  staff_id uuid not null references public.staff.id on delete cascade,
  start_time time not null,
  end_time time not null,
  role text not null,
  created_at timestamp with time zone default now()
);

alter table public.shifts enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'shifts'
  loop
    execute format('drop policy if exists %I on public.shifts', pol.policyname);
  end loop;
end $$;

create policy "Managers can manage shifts"
  on public.shifts
  for all
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = shifts.restaurant_id
        and rm.role = 'manager'
    )
  )
  with check (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = shifts.restaurant_id
        and rm.role = 'manager'
    )
  );

create policy "Staff can read their assigned shifts"
  on public.shifts
  for select
  using (
    exists (
      select 1
      from public.staff
      where staff.id = shifts.staff_id
        and staff.user_id = auth.uid()
        and staff.restaurant_id = shifts.restaurant_id
    )
  );
