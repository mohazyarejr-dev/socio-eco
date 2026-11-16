-- Run this in Supabase Dashboard -> SQL Editor (after the main migration has been run).
-- It fixes "Invalid login credentials" for your existing user and makes it an administrator.

-- STEP 1: choose a password (replace CHANGE_ME_PASSWORD, at least 8 characters) and confirm the email.
update auth.users
set encrypted_password = extensions.crypt('CHANGE_ME_PASSWORD', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'mofarah@gmail.com';

-- STEP 2: make this user an administrator (full access).
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'mofarah@gmail.com'
on conflict do nothing;

-- STEP 3 (check): you should see one row with role = admin.
select u.email, r.role
from public.user_roles r join auth.users u on u.id = r.user_id;


-- ============ ADD A RESEARCHER LATER ============
-- 1. The researcher signs up at /login ("Create an account") and confirms their email.
-- 2. You run this with their email. Researchers can sign in, see the dashboard, view survey
--    responses and export the CSV. Only admins can manage projects/resources.
--
-- insert into public.user_roles (user_id, role)
-- select id, 'moderator' from auth.users where email = 'researcher@example.com'
-- on conflict do nothing;
--
-- To remove access:
-- delete from public.user_roles
-- where user_id = (select id from auth.users where email = 'researcher@example.com');
