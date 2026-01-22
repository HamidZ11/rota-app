create extension if not exists "pgcrypto";

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists public.restaurant_members (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('manager', 'staff')),
  created_at timestamp with time zone default now(),
  unique (restaurant_id, user_id)
);

alter table if exists public.staff
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

alter table if exists public.shifts
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

alter table if exists public.holidays
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

alter table if exists public.holiday_requests
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

alter table if exists public.swap_requests
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

do $$
declare
  default_restaurant_id uuid;
begin
  select id into default_restaurant_id
  from public.restaurants
  order by created_at
  limit 1;

  if default_restaurant_id is null then
    insert into public.restaurants (name, owner_user_id)
    values (
      'Default restaurant',
      (select id from auth.users order by created_at limit 1)
    )
    returning id into default_restaurant_id;
  end if;

  update public.staff
  set restaurant_id = default_restaurant_id
  where restaurant_id is null;

  update public.shifts
  set restaurant_id = staff.restaurant_id
  from public.staff
  where public.shifts.staff_id = staff.id
    and public.shifts.restaurant_id is null;

  update public.holidays
  set restaurant_id = staff.restaurant_id
  from public.staff
  where public.holidays.staff_id = staff.id
    and public.holidays.restaurant_id is null;

  update public.holiday_requests
  set restaurant_id = staff.restaurant_id
  from public.staff
  where public.holiday_requests.staff_id = staff.id
    and public.holiday_requests.restaurant_id is null;

  update public.swap_requests
  set restaurant_id = shifts.restaurant_id
  from public.shifts
  where public.swap_requests.shift_id = shifts.id
    and public.swap_requests.restaurant_id is null;

  insert into public.restaurant_members (restaurant_id, user_id, role)
  select default_restaurant_id, profiles.id, profiles.role
  from public.profiles
  where not exists (
    select 1
    from public.restaurant_members rm
    where rm.restaurant_id = default_restaurant_id
      and rm.user_id = profiles.id
  );
end $$;

alter table if exists public.staff
  alter column restaurant_id set not null;

alter table if exists public.shifts
  alter column restaurant_id set not null;

alter table if exists public.holidays
  alter column restaurant_id set not null;

alter table if exists public.holiday_requests
  alter column restaurant_id set not null;

alter table if exists public.swap_requests
  alter column restaurant_id set not null;
