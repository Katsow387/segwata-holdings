-- Run once in Supabase > SQL Editor (after 0001_init.sql).

-- 1. Document bucket: PDFs and photos only, 5 MB max each
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['application/pdf','image/jpeg','image/png']
where id = 'application-docs';

-- 2. Drivers can only save drafts. Submitting goes through the strict function below.
drop policy if exists apps_insert on applications;
drop policy if exists apps_edit on applications;
create policy apps_insert on applications for insert
  with check (user_id = auth.uid() and status = 'draft');
create policy apps_edit on applications for update
  using (user_id = auth.uid() and status in ('draft','more_info_required'))
  with check (user_id = auth.uid() and status in ('draft','more_info_required'));

-- Applicants cannot touch review fields
create or replace function protect_application() returns trigger language plpgsql as $$
begin
  if current_user = 'authenticated' and not is_admin() and (
       new.user_id is distinct from old.user_id or new.role is distinct from old.role
    or new.reason_code is distinct from old.reason_code or new.reviewer_note is distinct from old.reviewer_note
    or new.reviewed_by is distinct from old.reviewed_by or new.reviewed_at is distinct from old.reviewed_at
    or new.submitted_at is distinct from old.submitted_at) then
    raise exception 'You cannot change review fields';
  end if;
  return new;
end $$;
drop trigger if exists applications_protect on applications;
create trigger applications_protect before update on applications for each row execute function protect_application();

-- 3. Strict submission: refuses unless everything is filled in and every file really exists
create or replace function submit_driver_application() returns void
language plpgsql security definer set search_path = public as $$
declare a applications%rowtype; d jsonb; k text; missing text[] := '{}'; path text;
begin
  select * into a from applications where user_id = auth.uid() and role = 'driver';
  if not found then raise exception 'No driver application found'; end if;
  if a.status not in ('draft','more_info_required') then raise exception 'This application was already submitted'; end if;
  d := a.data;

  foreach k in array array['full_name','id_number','nationality','phone','address_street','address_city','address_postal',
    'emergency_name','emergency_phone','licence_code','licence_number','licence_expiry','years_experience',
    'vehicle_type','vehicle_make','vehicle_model','vehicle_year','vehicle_reg',
    'bank_name','bank_account_holder','bank_account_number','bank_branch_code','criminal_record'] loop
    if coalesce(trim(d->>k),'') = '' then missing := missing || k; end if;
  end loop;

  if coalesce(d->>'id_number','') !~ '^[A-Za-z0-9]{6,20}$' then missing := missing || 'id_number format'; end if;
  if coalesce(d->>'licence_expiry','') !~ '^\d{4}-\d{2}-\d{2}$' or (d->>'licence_expiry')::date <= current_date
    then missing := missing || 'licence expired or invalid'; end if;
  if coalesce(d->>'years_experience','0') !~ '^\d+$' or (d->>'years_experience')::int < 2
    then missing := missing || 'at least 2 years driving experience'; end if;
  if d->>'has_prdp' = 'yes' and coalesce(trim(d->>'prdp_number'),'') = '' then missing := missing || 'prdp_number'; end if;
  if d->>'criminal_record' = 'yes' and coalesce(trim(d->>'criminal_details'),'') = '' then missing := missing || 'criminal_details'; end if;
  foreach k in array array['consent_popia','consent_background','declaration_true'] loop
    if d->>k is distinct from 'true' then missing := missing || k; end if;
  end loop;

  foreach k in array array['id_document','licence_front','licence_back','proof_of_address','selfie','vehicle_registration',
    'vehicle_photo_front','vehicle_photo_side','police_clearance','bank_letter']
    || case when d->>'nationality' = 'foreign' then array['work_permit'] else '{}'::text[] end
    || case when d->>'has_prdp' = 'yes' then array['prdp'] else '{}'::text[] end loop
    path := d->'documents'->>k;
    if coalesce(path,'') = '' or path not like auth.uid()::text || '/%'
       or not exists (select 1 from storage.objects where bucket_id = 'application-docs' and name = path) then
      missing := missing || ('document: ' || k);
    end if;
  end loop;

  if array_length(missing, 1) > 0 then
    raise exception 'Missing or invalid: %', array_to_string(missing, ', ');
  end if;
  update applications set status = 'pending_review', submitted_at = now(), reviewer_note = null, reason_code = null where id = a.id;
end $$;
grant execute on function submit_driver_application() to authenticated;

-- To approve a driver by hand until the admin review screen exists:
-- update applications set status='approved', reviewed_at=now()
--   where user_id = (select id from profiles where email = 'driver@example.com');
