-- KLAS job portal — initial schema
-- Auth: Clerk is connected to Supabase as a third-party auth provider, so every
-- request carries a Clerk session token and auth.jwt()->>'sub' is the Clerk user id.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.requesting_user_id()
returns text
language sql stable
as $$ select nullif(auth.jwt() ->> 'sub', '')::text $$;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('candidate', 'recruiter');
create type public.employment_type as enum ('full_time', 'part_time', 'contract');
create type public.job_level as enum ('entry', 'intermediate', 'advanced');
create type public.job_status as enum ('open', 'hiring', 'closed');
-- Decision pending: the two specs list different statuses. This is the union in pipeline order.
create type public.application_status as enum ('submitted', 'reviewed', 'interviewing', 'hired', 'rejected');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          text primary key default public.requesting_user_id(),  -- Clerk user id
  role        public.user_role not null,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  logo_path   text,                                  -- path in the company-logos bucket
  created_by  text default public.requesting_user_id() references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create unique index companies_name_unique on public.companies (lower(name));

create table public.jobs (
  id               uuid primary key default gen_random_uuid(),
  recruiter_id     text not null default public.requesting_user_id() references public.profiles (id) on delete cascade,
  company_id       uuid not null references public.companies (id) on delete restrict,
  title            text not null check (length(trim(title)) > 0),
  description      text not null default '',         -- Markdown
  location         text not null,
  employment_type  public.employment_type not null,
  level            public.job_level not null,
  salary           text,
  status           public.job_status not null default 'open',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index jobs_status_created_idx on public.jobs (status, created_at desc);
create index jobs_recruiter_idx on public.jobs (recruiter_id);
create index jobs_company_idx on public.jobs (company_id);

create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.jobs (id) on delete cascade,
  candidate_id  text not null default public.requesting_user_id() references public.profiles (id) on delete cascade,
  resume_path   text not null,                       -- path in the resumes bucket: <candidate_id>/<file>
  cover_letter  text,
  status        public.application_status not null default 'submitted',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (job_id, candidate_id)
);
create index applications_candidate_idx on public.applications (candidate_id);
create index applications_job_idx on public.applications (job_id);

create table public.saved_jobs (
  candidate_id  text not null default public.requesting_user_id() references public.profiles (id) on delete cascade,
  job_id        uuid not null references public.jobs (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (candidate_id, job_id)
);

-- ---------------------------------------------------------------------------
-- Role and ownership helpers (security definer so RLS policies can call them)
-- ---------------------------------------------------------------------------
create or replace function public.current_role_is(r public.user_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = public.requesting_user_id() and role = r) $$;

create or replace function public.owns_job(j uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.jobs where id = j and recruiter_id = public.requesting_user_id()) $$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger jobs_touch before update on public.jobs for each row execute function public.touch_updated_at();
create trigger applications_touch before update on public.applications for each row execute function public.touch_updated_at();

-- A role is chosen once at onboarding and cannot be changed by the user.
create or replace function public.lock_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role <> old.role then raise exception 'Role cannot be changed'; end if;
  if new.id <> old.id then raise exception 'Profile id cannot be changed'; end if;
  return new;
end $$;
create trigger profiles_lock_role before update on public.profiles for each row execute function public.lock_profile_role();

-- Recruiters may only change an application's status; candidates may not change status at all.
create or replace function public.guard_application_update()
returns trigger language plpgsql as $$
begin
  if new.job_id <> old.job_id or new.candidate_id <> old.candidate_id or new.resume_path <> old.resume_path then
    raise exception 'Only the status of an application can be changed';
  end if;
  if new.status <> old.status and not public.owns_job(old.job_id) then
    raise exception 'Only the job''s recruiter can change the status';
  end if;
  return new;
end $$;
create trigger applications_guard before update on public.applications for each row execute function public.guard_application_update();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.companies    enable row level security;
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs   enable row level security;

-- profiles
create policy "read own profile" on public.profiles for select to authenticated
  using (id = public.requesting_user_id());
create policy "recruiters read applicants" on public.profiles for select to authenticated
  using (exists (
    select 1 from public.applications a
    where a.candidate_id = profiles.id and public.owns_job(a.job_id)
  ));
create policy "create own profile" on public.profiles for insert to authenticated
  with check (id = public.requesting_user_id());
create policy "update own profile" on public.profiles for update to authenticated
  using (id = public.requesting_user_id()) with check (id = public.requesting_user_id());

-- companies: public directory, recruiters add and edit their own
create policy "anyone reads companies" on public.companies for select to anon, authenticated using (true);
create policy "recruiters add companies" on public.companies for insert to authenticated
  with check (created_by = public.requesting_user_id() and public.current_role_is('recruiter'));
create policy "creator edits company" on public.companies for update to authenticated
  using (created_by = public.requesting_user_id()) with check (created_by = public.requesting_user_id());

-- jobs: open and hiring jobs are public; recruiters manage their own (closed ones too)
create policy "anyone reads live jobs" on public.jobs for select to anon, authenticated
  using (status <> 'closed' or recruiter_id = public.requesting_user_id());
create policy "recruiters post jobs" on public.jobs for insert to authenticated
  with check (recruiter_id = public.requesting_user_id() and public.current_role_is('recruiter'));
create policy "recruiters edit own jobs" on public.jobs for update to authenticated
  using (recruiter_id = public.requesting_user_id()) with check (recruiter_id = public.requesting_user_id());
create policy "recruiters delete own jobs" on public.jobs for delete to authenticated
  using (recruiter_id = public.requesting_user_id());

-- applications
create policy "candidates read own applications" on public.applications for select to authenticated
  using (candidate_id = public.requesting_user_id());
create policy "recruiters read applications to their jobs" on public.applications for select to authenticated
  using (public.owns_job(job_id));
create policy "candidates apply to open jobs" on public.applications for insert to authenticated
  with check (
    candidate_id = public.requesting_user_id()
    and public.current_role_is('candidate')
    and exists (select 1 from public.jobs j where j.id = job_id and j.status <> 'closed')
    and split_part(resume_path, '/', 1) = public.requesting_user_id()
  );
create policy "recruiters update applications to their jobs" on public.applications for update to authenticated
  using (public.owns_job(job_id)) with check (public.owns_job(job_id));
create policy "candidates withdraw own applications" on public.applications for delete to authenticated
  using (candidate_id = public.requesting_user_id());

-- saved jobs
create policy "candidates manage saved jobs" on public.saved_jobs for all to authenticated
  using (candidate_id = public.requesting_user_id())
  with check (candidate_id = public.requesting_user_id() and public.current_role_is('candidate'));

-- ---------------------------------------------------------------------------
-- Storage: private CVs, public company logos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('resumes', 'resumes', false, 5242880,
    array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('company-logos', 'company-logos', true, 1048576,
    array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])
on conflict (id) do nothing;

-- CVs live at resumes/<clerk user id>/<file>
create policy "candidates upload own CVs" on storage.objects for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = public.requesting_user_id());
create policy "candidates read own CVs" on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = public.requesting_user_id());
create policy "recruiters read applicants' CVs" on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and exists (
    select 1 from public.applications a where a.resume_path = storage.objects.name and public.owns_job(a.job_id)
  ));
create policy "candidates delete own CVs" on storage.objects for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = public.requesting_user_id());

-- Logos live at company-logos/<clerk user id>/<file>
create policy "recruiters upload logos" on storage.objects for insert to authenticated
  with check (bucket_id = 'company-logos' and (storage.foldername(name))[1] = public.requesting_user_id()
              and public.current_role_is('recruiter'));
