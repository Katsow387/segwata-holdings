-- Run once in Supabase > SQL Editor (after 0001 and 0002). Safe to re-run.

alter table profiles add column if not exists business_name text;

-- Sign-up trigger: saves name, phone, business name, role and the whole sign-up form
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  r text := new.raw_user_meta_data->>'role';
  valid boolean := coalesce(r in ('merchant','supplier','driver'), false);
  sd jsonb := coalesce(new.raw_user_meta_data->'signup_data', '{}'::jsonb);
begin
  insert into profiles (id, email, full_name, phone, business_name, role, role_locked)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    coalesce(sd->>'businessName', sd->>'companyName'),
    case when valid then r::app_role else 'merchant' end, valid)
  on conflict (id) do nothing;
  if valid then
    insert into applications (user_id, role, data) values (new.id, r::app_role, sd)
    on conflict (user_id) do nothing;
  end if;
  return new;
end $$;

-- Backfill anyone who signed up before the tables/trigger existed
insert into profiles (id, email, full_name, phone, role, role_locked)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'), u.raw_user_meta_data->>'phone',
  case when u.raw_user_meta_data->>'role' in ('merchant','supplier','driver') then (u.raw_user_meta_data->>'role')::app_role else 'merchant' end,
  coalesce(u.raw_user_meta_data->>'role' in ('merchant','supplier','driver'), false)
from auth.users u where not exists (select 1 from profiles p where p.id = u.id);

insert into applications (user_id, role, data)
select u.id, (u.raw_user_meta_data->>'role')::app_role, coalesce(u.raw_user_meta_data->'signup_data', '{}'::jsonb)
from auth.users u
where u.raw_user_meta_data->>'role' in ('merchant','supplier','driver')
  and not exists (select 1 from applications a where a.user_id = u.id);

update profiles p set business_name = coalesce(a.data->>'businessName', a.data->>'companyName')
from applications a where a.user_id = p.id and p.business_name is null;
