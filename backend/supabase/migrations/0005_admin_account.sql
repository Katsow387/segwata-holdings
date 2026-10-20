-- 0005: create (or repair) the SGT GO admin account. Run after 0001-0004. Safe to re-run.
-- Login: admin@sgt.com / Admin123#

do $$
declare
  admin_email text := 'admin@sgt.com';
  admin_pass  text := 'Admin123#';
  uid uuid;
begin
  select id into uid from auth.users where email = admin_email;

  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uid, 'authenticated', 'authenticated', admin_email,
      crypt(admin_pass, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"SGT GO Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    begin
      insert into auth.identities
        (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
      values
        (gen_random_uuid(), uid, uid::text, 'email',
         jsonb_build_object('sub', uid::text, 'email', admin_email, 'email_verified', true),
         now(), now(), now());
    exception when undefined_column then
      insert into auth.identities
        (id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
      values
        (uid::text, uid, 'email',
         jsonb_build_object('sub', uid::text, 'email', admin_email, 'email_verified', true),
         now(), now(), now());
    end;
    raise notice 'Created admin auth user: %', uid;
  else
    update auth.users
       set encrypted_password = crypt(admin_pass, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at         = now()
     where id = uid;
    raise notice 'Admin already existed, password reset: %', uid;
  end if;

  insert into public.profiles (id, email, full_name, role, role_locked)
  values (uid, admin_email, 'SGT GO Admin', 'admin', true)
  on conflict (id) do update
    set role = 'admin', role_locked = true, email = excluded.email;

  raise notice 'Admin ready: % / %', admin_email, admin_pass;
end $$;
