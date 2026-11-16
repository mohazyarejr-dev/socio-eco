# Connect your own Supabase project

This copy no longer points at Lovable Cloud. It reads your Supabase project from `.env`.

## 1. Create the database tables
Supabase Dashboard -> **SQL Editor** -> New query -> paste the whole of
`supabase/migrations/20260101000000_research_platform.sql` -> **Run**.
(It creates `user_roles`, `survey_responses`, `research_projects`, `research_resources`,
the `has_role()` and `get_survey_aggregates()` functions, and all RLS policies.)

## 2. Add your keys
Dashboard -> **Project Settings -> API**. Copy `.env.example` to `.env` and fill in:
- `SUPABASE_URL` and `VITE_SUPABASE_URL` -> Project URL
- `SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` -> anon / publishable key

If you deploy (Cloudflare, Vercel, Netlify...), add the same four variables in the host's
environment settings - `.env` is not uploaded.

## 3. Allow your site URLs
Dashboard -> **Authentication -> URL Configuration**: set Site URL to your deployed address and add
`http://localhost:3000/**` (or whatever port `bun run dev` prints) to Redirect URLs.

## 4. Create your admin account
Sign up at `/login`, confirm the email, then run the "make yourself an admin" SQL at the bottom of
the migration file in the SQL Editor. Without a row in `user_roles`, `/admin` will refuse you.

## 5. Run
`bun install && bun run dev` (or `npm install --legacy-peer-deps && npm run dev`)

## What was changed in the code
- `src/integrations/supabase/env.ts` (new): single place that reads the URL + key.
- `client.ts`: uses your URL/key, standard localStorage auth (removed the Lovable preview-iframe session broker).
- `auth-middleware.ts`, `src/lib/survey.functions.ts`: read config through `env.ts`.
- `previewAuthStorage.ts`: deleted (Lovable-only).
- `.env`, `supabase/config.toml`, `drizzle.config.ts`: Lovable project values replaced with placeholders.
- `.gitignore`: `.env` is now ignored. If it was already committed, run `git rm --cached .env`.

## Roles
- **Admin** (`user_roles.role = 'admin'`): everything - dashboard, survey responses, CSV export, projects, resources.
- **Researcher** (`user_roles.role = 'moderator'`): can sign in, see the dashboard and survey responses, export CSV.
- Run `supabase/first-admin-setup.sql` to confirm/reset your first user's password and make it admin.
  Use the commented section at the bottom of that file to approve researchers.

## Repeat submissions
A device may submit the survey any number of times. Run `supabase/migrations/20260102000000_allow_multiple_submissions.sql` once on an existing database (new databases created from the main migration already allow it).
