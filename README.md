# KLAS Recruitment — job portal

React + Vite + Tailwind (KLAS design system theme), Clerk for sign-in, Supabase for data and file storage.

## What's built (step 1: foundation)

- KLAS design tokens in `src/index.css` and `tailwind.config.js` (colours, Poppins type scale, 8/12/16px radii, 48px controls), plus shadcn-style `Button`, `Input`, `Label`, `Field`.
- Database schema with row-level security in `supabase/migrations/0001_init.sql`: profiles, companies, jobs, applications, saved jobs, plus `resumes` (private) and `company-logos` (public) storage buckets.
- Clerk sign-in and sign-up (email/password and Google), themed to KLAS, then the "I am a…" step that saves the role once.
- Protected routes: `/candidate` for candidates, `/recruiter` and `/post-job` for recruiters; people with the wrong role are sent to their own dashboard.
- Live pages: home (latest jobs), job search with filters, job details, candidate dashboard (applications and saved jobs), recruiter dashboard (jobs, application counts, Open/Hiring/Closed status).
- Placeholders for: For employers, For candidates, Post a job.

## Setup

1. **Install:** `npm install`
2. **Clerk:** create an application at clerk.com and turn on Email and Google sign-in.
3. **Supabase:** create a project at supabase.com.
4. **Connect Clerk to Supabase:**
   - In Clerk, open Integrations → Supabase and activate it. Copy the Clerk domain it shows.
   - In Supabase, open Authentication → Sign In / Providers → Third-party auth, add Clerk, and paste that domain.
   - After this, Supabase accepts Clerk session tokens, and `auth.jwt()->>'sub'` is the Clerk user id.
5. **Database:** in the Supabase SQL editor, run `supabase/migrations/0001_init.sql`. Optionally run `supabase/seed.sql` afterwards for four sample jobs.
6. **Environment:** copy `.env.example` to `.env.local` and fill in the three keys.
7. **Run:** `npm run dev`, then open http://localhost:5173.

## How access works

| Who | Can |
| --- | --- |
| Anyone | Read jobs that are not closed, and companies |
| Candidate | Create own profile; apply to open jobs with a CV stored under `resumes/<their id>/`; read own applications and CVs; save jobs |
| Recruiter | Add companies and logos; post, edit, close and delete own jobs; read applications, applicant profiles and CVs for own jobs only; change application status |

The role can't be changed after onboarding. Candidates can't change an application's status. Recruiters can change only the status.
These rules were tested against Postgres 16 with stand-ins for Supabase's auth and storage.

## Decisions still open

- **Application statuses:** the schema uses submitted, reviewed, interviewing, hired and rejected. Your two specs list different ones; to change them, edit the `application_status` enum before going live.
- **Pricing tiers and paid features:** not modelled yet.

## Next steps

1. Candidate side: the apply form with CV upload to the `resumes` bucket, Markdown job descriptions, and saving and unsaving jobs.
2. Recruiter side: the Post a job form (pick a company or add a new one with a logo upload), and the applicant list with status changes.
3. The For employers and For candidates pages, the FAQ and the companies carousel.
4. Deploy to Vercel or Netlify. Add the environment variables there, and add the production URL to Clerk's allowed origins.
