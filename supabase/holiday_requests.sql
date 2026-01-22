create extension if not exists "pgcrypto";

create table if not exists public.holiday_requests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid references auth.users(id),
  constraint holiday_requests_date_order check (end_date >= start_date)
);

alter table public.holiday_requests enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'holiday_requests'
  loop
    execute format('drop policy if exists %I on public.holiday_requests', pol.policyname);
  end loop;
end $$;

create policy "Staff can create holiday requests"
  on public.holiday_requests
  for insert
  with check (
    exists (
      select 1
      from public.staff
      where staff.id = holiday_requests.staff_id
        and staff.user_id = auth.uid()
        and staff.restaurant_id = holiday_requests.restaurant_id
    )
  );

create policy "Staff can read their holiday requests"
  on public.holiday_requests
  for select
  using (
    exists (
      select 1
      from public.staff
      where staff.id = holiday_requests.staff_id
        and staff.user_id = auth.uid()
        and staff.restaurant_id = holiday_requests.restaurant_id
    )
  );

create policy "Managers can read all holiday requests"
  on public.holiday_requests
  for select
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = holiday_requests.restaurant_id
        and rm.role = 'manager'
    )
  );

create policy "Managers can update holiday requests"
  on public.holiday_requests
  for update
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = holiday_requests.restaurant_id
        and rm.role = 'manager'
    )
  )
  with check (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = holiday_requests.restaurant_id
        and rm.role = 'manager'
    )
  );
