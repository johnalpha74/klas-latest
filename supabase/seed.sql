-- Sample data so the home page and job search have something to show.
-- Run in the Supabase SQL editor (it runs as an admin, so RLS does not block it).
-- Delete with: delete from public.profiles where id = 'seed_recruiter';
insert into public.profiles (id, role, full_name) values ('seed_recruiter', 'recruiter', 'Sample recruiter')
on conflict (id) do nothing;

with c as (
  insert into public.companies (name, created_by) values ('Company name', 'seed_recruiter')
  on conflict do nothing returning id
)
insert into public.jobs (recruiter_id, company_id, title, location, employment_type, level, description, created_at)
select 'seed_recruiter', c.id, j.title, j.location, j.type::public.employment_type, j.level::public.job_level, j.descr, now() - (j.days || ' days')::interval
from c, (values
  ('Data Engineer', 'Dublin', 'full_time', 'intermediate', 'A unique chance to develop, enhance and troubleshoot data pipelines for an expanding engineering team.', 2),
  ('PL/SQL API Integration Analyst', 'Salisbury', 'full_time', 'intermediate', 'Integration analyst with Oracle, PL/SQL and solid API experience to join an expanding team.', 12),
  ('AWS BI Developer', 'Düsseldorf', 'contract', 'advanced', 'Design, develop and optimise business intelligence (BI) on AWS services.', 1),
  ('ML Engineer', 'Perth', 'full_time', 'intermediate', 'Join a dynamic team responsible for developing cutting-edge AI and ML solutions.', 2)
) as j(title, location, type, level, descr, days);
