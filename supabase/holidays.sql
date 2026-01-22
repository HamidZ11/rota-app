create extension if not exists "pgcrypto";

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  constraint holidays_date_order check (end_date >= start_date)
);

alter table public.holidays enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'holidays'
  loop
    execute format('drop policy if exists %I on public.holidays', pol.policyname);
  end loop;
end $$;

create policy "Managers can manage holidays"
  on public.holidays
  for all
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = holidays.restaurant_id
        and rm.role = 'manager'
    )
  )
  with check (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = holidays.restaurant_id
        and rm.role = 'manager'
    )
  );

create policy "Staff can read their holidays"
  on public.holidays
  for select
  using (
    exists (
      select 1
      from public.staff
      where staff.id = holidays.staff_id
        and staff.user_id = auth.uid()
        and staff.restaurant_id = holidays.restaurant_id
    )
  );
