# Segwata update: brochure styling + one sign-up + admin-reviewed applications

## 1. Copy the files
Unzip over your project (same folder layout). Then **delete** these, they are replaced:
- `src/sgtgo/DriverApply.jsx`  (replaced by `Apply.jsx`, which handles all three roles)
- `src/sgtgo/DriverStatus.jsx` (replaced by `ApplicationStatus.jsx`)
- `src/sgtgo/Signup_1.jsx` (was an identical duplicate of Signup.jsx)

`src/lib/auth.jsx` and `src/lib/RequireRole.jsx` are rewritten. I couldn't see your originals,
so if anything else in your project imports something else from them, tell me.
Your `lib/supabase`, `data/mockData` and the existing logo/hero images are untouched.

## 2. Run the SQL
Supabase > SQL Editor > paste `supabase/0004_applications_admin.sql` > Run.
Then make yourself admin (last line of the file, put your email in):
    update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');

## 3. Supabase > Authentication > URL Configuration
Add these to "Redirect URLs" (email confirmation and Google both land here):
- https://katsow387.github.io/segwata-holdings/sgt-go/continue
- http://localhost:5173/segwata-holdings/sgt-go/continue   (local dev)

## 4. Check once
Your new-user trigger gets `role` from the sign-up form. Make sure it only accepts
merchant / supplier / driver and turns anything else (e.g. "admin") into a default,
otherwise someone could sign up as an admin. Admins should only be made with the SQL line above.

## How it works now
Sign up (name, phone, email, password + pick merchant/supplier/driver)
  -> automatically taken to the matching application form (/sgt-go/apply)
  -> submits -> "Application received" page (/sgt-go/status)
  -> admin opens Admin > Applications, views the documents, then
     Approve / Approve provisionally (drivers) / Request more info / Reject
  -> applicant's next login (or "Refresh status") opens their dashboard, or tells them what's needed.
Dashboards are blocked until approved. Old links like /sgt-go/driver/signup still work.
