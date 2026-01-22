insert into public.profiles (id, email, role)
select u.id, u.email, 'staff'
from auth.users as u
where not exists (
  select 1
  from public.profiles as p
  where p.id = u.id
);
