-- Segwata Holdings / SGT GO: run this whole file once in Supabase > SQL Editor.

create type app_role as enum ('merchant','supplier','driver','admin');
create type application_status as enum ('draft','pending_review','more_info_required','approved','provisional','rejected');
create type order_status as enum ('awaiting_acceptance','accepted','preparing','in_transit','delivered','cancelled');
create type delivery_status as enum ('assigned','in_progress','completed','cancelled');
create type dispute_status as enum ('investigating','awaiting_response','resolved');

-- ---------- Tables ----------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role app_role not null default 'merchant',
  role_locked boolean not null default false,
  full_name text, email text, phone text,
  created_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles on delete cascade,
  role app_role not null,
  status application_status not null default 'draft',
  data jsonb not null default '{}',
  reason_code text, reviewer_note text,
  submitted_at timestamptz, reviewed_at timestamptz,
  reviewed_by uuid references profiles,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  ref text unique default 'ORD-' || (floor(random()*90000)+10000)::int,
  merchant_id uuid not null references profiles,
  supplier_id uuid references profiles,
  items jsonb not null default '[]',
  total numeric(12,2) not null default 0,
  status order_status not null default 'awaiting_acceptance',
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete set null,
  driver_id uuid references profiles,
  pickup text not null, dropoff text not null,
  distance_km numeric(6,1), payout numeric(10,2),
  status delivery_status not null default 'assigned',
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete set null,
  raised_by uuid not null references profiles,
  against_user uuid references profiles,
  issue text not null,
  status dispute_status not null default 'investigating',
  created_at timestamptz not null default now()
);

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  pickup text not null check (char_length(pickup) between 3 and 300),
  dropoff text not null check (char_length(dropoff) between 3 and 300),
  distance_km numeric(7,1) not null check (distance_km > 0),
  truck text not null, helpers int not null default 0 check (helpers between 0 and 4),
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- ---------- Helpers ----------
create function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create function is_approved() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from applications where user_id = auth.uid() and status in ('approved','provisional')) $$;

-- New user -> profile + draft application (role only accepted if it's a public role; never admin)
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare r text := new.raw_user_meta_data->>'role'; valid boolean := r in ('merchant','supplier','driver');
begin
  insert into profiles (id, email, full_name, phone, role, role_locked)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    case when valid then r::app_role else 'merchant' end, valid);
  if valid then
    insert into applications (user_id, role, data)
    values (new.id, r::app_role, coalesce(new.raw_user_meta_data->'signup_data','{}'::jsonb));
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Google sign-ups pick their role once, right after the first login
create function choose_role(new_role text) returns void language plpgsql security definer set search_path = public as $$
begin
  if new_role not in ('merchant','supplier','driver') then raise exception 'Invalid role'; end if;
  update profiles set role = new_role::app_role, role_locked = true where id = auth.uid() and role_locked = false;
  insert into applications (user_id, role) select auth.uid(), new_role::app_role
    where exists (select 1 from profiles where id = auth.uid() and role = new_role::app_role)
    on conflict (user_id) do nothing;
end $$;

-- Stop users promoting themselves
create function protect_profile() returns trigger language plpgsql as $$
begin
  if current_user = 'authenticated' and not is_admin()
     and (new.role is distinct from old.role or new.role_locked is distinct from old.role_locked or new.id is distinct from old.id) then
    raise exception 'You cannot change your role';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on profiles for each row execute function protect_profile();

-- ---------- Row Level Security ----------
alter table profiles enable row level security;
alter table applications enable row level security;
alter table orders enable row level security;
alter table deliveries enable row level security;
alter table disputes enable row level security;
alter table quote_requests enable row level security;

create policy profiles_read on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_update on profiles for update using (id = auth.uid() or is_admin());

create policy apps_read on applications for select using (user_id = auth.uid() or is_admin());
create policy apps_insert on applications for insert with check (user_id = auth.uid() and status in ('draft','pending_review'));
create policy apps_edit on applications for update
  using (user_id = auth.uid() and status in ('draft','more_info_required'))
  with check (user_id = auth.uid() and status in ('draft','pending_review'));
create policy apps_admin on applications for update using (is_admin());

create policy orders_read on orders for select using (merchant_id = auth.uid() or supplier_id = auth.uid() or is_admin());
create policy orders_insert on orders for insert with check (merchant_id = auth.uid() and is_approved());
create policy orders_update on orders for update using (supplier_id = auth.uid() or is_admin());

create policy deliveries_read on deliveries for select using (
  driver_id = auth.uid() or is_admin()
  or exists (select 1 from orders o where o.id = order_id and (o.merchant_id = auth.uid() or o.supplier_id = auth.uid())));
create policy deliveries_update on deliveries for update using (driver_id = auth.uid() or is_admin());
create policy deliveries_admin_insert on deliveries for insert with check (is_admin());

create policy disputes_read on disputes for select using (raised_by = auth.uid() or against_user = auth.uid() or is_admin());
create policy disputes_insert on disputes for insert with check (raised_by = auth.uid());
create policy disputes_admin on disputes for update using (is_admin());

create policy quotes_insert on quote_requests for insert to anon, authenticated with check (true);
create policy quotes_read on quote_requests for select using (is_admin());

-- ---------- Private storage for ID documents ----------
insert into storage.buckets (id, name, public) values ('application-docs','application-docs', false) on conflict do nothing;
create policy docs_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'application-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy docs_read on storage.objects for select to authenticated
  using (bucket_id = 'application-docs' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
create policy docs_delete on storage.objects for delete to authenticated
  using (bucket_id = 'application-docs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Make yourself admin (run separately, with your own email):
-- update profiles set role = 'admin', role_locked = true where email = 'you@example.com';
