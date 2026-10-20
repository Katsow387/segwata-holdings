-- =====================================================================
-- 0000: reset every app object created by 0001-0005. auth.users is KEPT,
-- except the admin@sgt.com user (so 0005 recreates it cleanly).
-- Safe to run even if some objects don't exist.
-- =====================================================================

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_protect on public.profiles;
drop trigger if exists applications_protect on public.applications;
drop trigger if exists applications_guard on public.applications;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.protect_profile() cascade;
drop function if exists public.protect_application() cascade;
drop function if exists public.applications_guard() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.is_approved() cascade;
drop function if exists public.choose_role(text) cascade;
drop function if exists public.submit_driver_application() cascade;
drop function if exists public.submit_application() cascade;
drop function if exists public.admin_applications() cascade;
drop function if exists public.review_application(uuid, text, text) cascade;
drop function if exists public.set_my_role(text) cascade;

drop policy if exists docs_insert on storage.objects;
drop policy if exists docs_read on storage.objects;
drop policy if exists docs_delete on storage.objects;
drop policy if exists "admin reads application docs" on storage.objects;

drop table if exists public.disputes cascade;
drop table if exists public.deliveries cascade;
drop table if exists public.orders cascade;
drop table if exists public.applications cascade;
drop table if exists public.quote_requests cascade;
drop table if exists public.profiles cascade;

drop type if exists public.dispute_status cascade;
drop type if exists public.delivery_status cascade;
drop type if exists public.order_status cascade;
drop type if exists public.application_status cascade;
drop type if exists public.app_role cascade;

delete from auth.identities where user_id in (select id from auth.users where email = 'admin@sgt.com');
delete from auth.users where email = 'admin@sgt.com';

select 'reset complete' as status;
