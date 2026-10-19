-- Paste into Supabase > SQL Editor to see what sign-up saved (newest first).
-- Every auth user should have a role and an application row. A blank role means it was NOT saved.
select u.email, u.created_at, u.email_confirmed_at is not null as confirmed,
       p.role, p.full_name, p.phone, p.business_name,
       a.status as application_status, a.data
from auth.users u
left join profiles p on p.id = u.id
left join applications a on a.user_id = u.id
order by u.created_at desc
limit 10;
