-- Allow the same device to submit the survey more than once.
-- Removes the UNIQUE rule on survey_responses.anon_token (safe to run more than once).
do $$
declare c text;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace n on n.oid = rel.relnamespace
    join pg_attribute a on a.attrelid = rel.oid and a.attnum = any(con.conkey)
    where n.nspname = 'public'
      and rel.relname = 'survey_responses'
      and con.contype = 'u'
      and a.attname = 'anon_token'
  loop
    execute format('alter table public.survey_responses drop constraint %I', c);
  end loop;
end $$;

-- Also drop a stand-alone unique index on that column, if one exists.
drop index if exists public.survey_responses_anon_token_key;
