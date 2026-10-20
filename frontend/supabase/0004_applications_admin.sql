-- =====================================================================
-- 0004: one application flow for merchants, suppliers and drivers,
--       reviewed by an admin.   Run in Supabase > SQL Editor, after 0001-0003.
-- Safe to run more than once.
-- =====================================================================

-- 1. Columns the review flow needs (no-ops if they already exist)
alter table public.applications add column if not exists data          jsonb not null default '{}'::jsonb;
alter table public.applications add column if not exists reviewer_note text;
alter table public.applications add column if not exists submitted_at  timestamptz;
alter table public.applications add column if not exists reviewed_at   timestamptz;
alter table public.applications add column if not exists reviewed_by   uuid references auth.users(id);

-- One application per person
create unique index if not exists applications_user_id_key on public.applications (user_id);

-- 2. Applications used to be driver-only: allow merchant + supplier too
do $$
declare c record;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.applications'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.applications drop constraint %I', c.conname);
  end loop;
  begin
    alter table public.applications add constraint applications_role_check
      check (role::text in ('merchant', 'supplier', 'driver'));
  exception when others then
    raise notice 'Skipped role check: %', sqlerrm;
  end;
end $$;

-- 3. Who is an admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role::text = 'admin');
$$;

-- 4. Admins can read every application and every uploaded document
alter table public.applications enable row level security;
drop policy if exists "admin reads applications" on public.applications;
create policy "admin reads applications" on public.applications
  for select to authenticated using (public.is_admin());

drop policy if exists "admin reads application docs" on storage.objects;
create policy "admin reads application docs" on storage.objects
  for select to authenticated using (bucket_id = 'application-docs' and public.is_admin());

-- 5. Applicants must not be able to approve themselves.
--    Status / review fields can only change through the functions below (or an admin).
create or replace function public.applications_guard() returns trigger
language plpgsql as $$
begin
  if current_setting('app.rpc', true) = '1' or auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'draft';
    new.user_id := auth.uid();
    new.reviewer_note := null; new.reviewed_at := null; new.reviewed_by := null; new.submitted_at := null;
    return new;
  end if;
  -- UPDATE by the applicant: they may only edit their form data, and only while it is open
  if old.status::text not in ('draft', 'more_info_required') then
    new.data := old.data;
  end if;
  new.status := old.status;           new.role := old.role;            new.user_id := old.user_id;
  new.reviewer_note := old.reviewer_note; new.reviewed_at := old.reviewed_at;
  new.reviewed_by := old.reviewed_by; new.submitted_at := old.submitted_at;
  return new;
end $$;

drop trigger if exists applications_guard on public.applications;
create trigger applications_guard before insert or update on public.applications
  for each row execute function public.applications_guard();

-- 6. Applicant submits their finished form
create or replace function public.submit_application() returns void
language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  perform set_config('app.rpc', '1', true);
  select * into a from public.applications where user_id = auth.uid() for update;
  if not found then raise exception 'No application found.'; end if;
  if a.status::text not in ('draft', 'more_info_required') then
    raise exception 'This application has already been submitted.';
  end if;
  if coalesce(jsonb_typeof(a.data -> 'documents'), '') <> 'object' or a.data -> 'documents' = '{}'::jsonb then
    raise exception 'Upload your documents before submitting.';
  end if;
  update public.applications
     set status = 'pending_review', submitted_at = now(), reviewer_note = null
   where id = a.id;
end $$;

-- 7. Admin: list submitted applications (joins the applicant's email)
create or replace function public.admin_applications()
returns table (id uuid, user_id uuid, role text, status text, data jsonb, reviewer_note text,
               submitted_at timestamptz, reviewed_at timestamptz, email text, full_name text, phone text)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  return query
    select a.id, a.user_id, a.role::text, a.status::text, a.data, a.reviewer_note,
           a.submitted_at, a.reviewed_at, u.email::text,
           u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'phone'
      from public.applications a
      join auth.users u on u.id = a.user_id
     where a.status::text <> 'draft'
     order by a.submitted_at desc nulls last;
end $$;

-- 8. Admin: approve / approve provisionally (drivers) / ask for more info / reject
create or replace function public.review_application(p_id uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if p_status not in ('approved', 'provisional', 'rejected', 'more_info_required') then
    raise exception 'Invalid status.';
  end if;
  perform set_config('app.rpc', '1', true);
  select * into a from public.applications where id = p_id for update;
  if not found then raise exception 'Application not found.'; end if;
  if a.status::text = 'draft' then raise exception 'This application has not been submitted yet.'; end if;
  if p_status = 'provisional' and a.role::text <> 'driver' then
    raise exception 'Only drivers can be approved provisionally.';
  end if;
  if p_status in ('rejected', 'more_info_required') and coalesce(btrim(p_note), '') = '' then
    raise exception 'Add a note so the applicant knows why.';
  end if;
  update public.applications
     set status = p_status, reviewer_note = nullif(btrim(p_note), ''),
         reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_id;
end $$;

-- 9. Google sign-up: apply the role the person picked on the sign-up page
create or replace function public.set_my_role(p_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in.'; end if;
  if p_role not in ('merchant', 'supplier', 'driver') then raise exception 'Invalid role.'; end if;
  perform set_config('app.rpc', '1', true);
  if exists (select 1 from public.applications where user_id = auth.uid() and status::text <> 'draft') then
    return; -- already submitted: the role can't change any more
  end if;
  execute format('update public.profiles set role = %L where id = %L and role::text <> ''admin''', p_role, auth.uid());
  delete from public.applications where user_id = auth.uid() and status::text = 'draft' and role::text <> p_role;
end $$;

-- 10. Only signed-in users may call these
revoke execute on function public.submit_application(), public.admin_applications(),
  public.review_application(uuid, text, text), public.set_my_role(text) from public, anon;
grant execute on function public.submit_application(), public.admin_applications(),
  public.review_application(uuid, text, text), public.set_my_role(text) to authenticated;

-- 11. Make yourself the first admin (replace the email, then run this one line)
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
