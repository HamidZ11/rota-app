create extension if not exists "pgcrypto";

create table if not exists public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  requested_by uuid not null references public.staff(id),
  requested_with uuid references public.staff(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now()
);

alter table public.swap_requests enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'swap_requests'
  loop
    execute format('drop policy if exists %I on public.swap_requests', pol.policyname);
  end loop;
end $$;

create policy "Staff can create swap requests for their shifts"
  on public.swap_requests
  for insert
  with check (
    exists (
      select 1
      from public.shifts
      join public.staff on staff.id = shifts.staff_id
      where shifts.id = swap_requests.shift_id
        and shifts.restaurant_id = swap_requests.restaurant_id
        and staff.user_id = auth.uid()
    )
  );

create policy "Staff can read their swap requests"
  on public.swap_requests
  for select
  using (
    exists (
      select 1
      from public.staff
      where staff.id = swap_requests.requested_by
        and staff.user_id = auth.uid()
        and staff.restaurant_id = swap_requests.restaurant_id
    )
  );

create policy "Managers can read all swap requests"
  on public.swap_requests
  for select
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = swap_requests.restaurant_id
        and rm.role = 'manager'
    )
  );

create policy "Managers can update swap requests"
  on public.swap_requests
  for update
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = swap_requests.restaurant_id
        and rm.role = 'manager'
    )
  )
  with check (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = swap_requests.restaurant_id
        and rm.role = 'manager'
    )
  );

create policy "Staff can read staff list"
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
