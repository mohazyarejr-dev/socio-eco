-- Admin moderation of survey responses: edit, reject (and restore), delete.
-- Safe to run more than once.

-- 1. Review status. Existing and new submissions are 'approved' until an admin rejects them.
alter table public.survey_responses
  add column if not exists status text not null default 'approved',
  add column if not exists reviewed_at timestamptz;

alter table public.survey_responses drop constraint if exists survey_responses_status_check;
alter table public.survey_responses
  add constraint survey_responses_status_check check (status in ('approved', 'rejected'));

create index if not exists idx_survey_responses_status on public.survey_responses (status);

-- 2. Make sure signed-in staff can read, and admins can change/remove, rows.
--    (Row Level Security below still restricts who actually can.)
grant select, update, delete on public.survey_responses to authenticated;

drop policy if exists "Admins may update survey responses" on public.survey_responses;
create policy "Admins may update survey responses"
  on public.survey_responses for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins may delete survey responses" on public.survey_responses;
create policy "Admins may delete survey responses"
  on public.survey_responses for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 3. Anonymous visitors can only ever submit 'approved' rows (they cannot pre-set a status).
drop policy if exists "Anonymous visitors may submit valid responses" on public.survey_responses;
create policy "Anonymous visitors may submit valid responses"
  on public.survey_responses for insert
  to anon, authenticated
  with check (
    consent = true
    and status = 'approved'
    and age_range is not null
    and anon_token is not null
    and char_length(anon_token) between 10 and 64
    and char_length(coalesce(suggestions, '')) <= 2000
  );

-- 4. Public statistics ignore rejected responses.
create or replace function public.get_survey_aggregates()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with s as (select * from public.survey_responses where status = 'approved')
  select json_build_object(
    'total_responses', (select count(*) from s),
    'by_age_range', (
      select coalesce(json_object_agg(age_range, n), '{}'::json)
      from (select age_range, count(*) as n from s group by age_range) t
    ),
    'mean_scores', (
      select coalesce(json_build_object(
        'health_impact_physical', round(avg(health_impact_physical)::numeric, 2),
        'health_impact_mental', round(avg(health_impact_mental)::numeric, 2),
        'socioeconomic_education', round(avg(socioeconomic_education)::numeric, 2),
        'socioeconomic_employment', round(avg(socioeconomic_employment)::numeric, 2),
        'socioeconomic_family', round(avg(socioeconomic_family)::numeric, 2),
        'socioeconomic_finance', round(avg(socioeconomic_finance)::numeric, 2)
      ), '{}'::json)
      from s
    ),
    'awareness_distribution', (
      select coalesce(json_object_agg(awareness_level, n), '{}'::json)
      from (select awareness_level, count(*) as n from s where awareness_level is not null group by awareness_level) t
    ),
    'observed_effects', (
      select coalesce(json_object_agg(effect, n), '{}'::json)
      from (
        select effect, count(*) as n
        from s, unnest(observed_effects) as effect
        group by effect
      ) t
    ),
    'responses_by_month', (
      select coalesce(json_agg(m order by m.month), '[]'::json)
      from (
        select date_trunc('month', created_at)::date as month, count(*) as n
        from s
        group by 1
      ) m
    ),
    'generated_at', now()
  )
$$;

revoke all on function public.get_survey_aggregates() from public;
grant execute on function public.get_survey_aggregates() to anon, authenticated;
