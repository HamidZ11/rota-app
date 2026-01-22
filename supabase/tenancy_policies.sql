alter table public.restaurants enable row level security;

alter table public.restaurant_members enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('restaurants', 'restaurant_members')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

create policy "Members can read their restaurants"
  on public.restaurants
  for select
  using (
    exists (
      select 1
      from public.restaurant_members rm
      where rm.user_id = auth.uid()
        and rm.restaurant_id = restaurants.id
    )
  );

create policy "Users can create restaurants"
  on public.restaurants
  for insert
  with check (auth.uid() = owner_user_id);

create policy "Owners can update restaurants"
  on public.restaurants
  for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Members can read restaurant memberships"
  on public.restaurant_members
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.restaurants r
      where r.id = restaurant_members.restaurant_id
        and r.owner_user_id = auth.uid()
    )
  );

create policy "Owners can add restaurant members"
  on public.restaurant_members
  for insert
  with check (
    exists (
      select 1
      from public.restaurants
      where restaurants.id = restaurant_members.restaurant_id
        and restaurants.owner_user_id = auth.uid()
    )
  );

create policy "Owners can update restaurant members"
  on public.restaurant_members
  for update
  using (
    exists (
      select 1
      from public.restaurants
      where restaurants.id = restaurant_members.restaurant_id
        and restaurants.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants
      where restaurants.id = restaurant_members.restaurant_id
        and restaurants.owner_user_id = auth.uid()
    )
  );
