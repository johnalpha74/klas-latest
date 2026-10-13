import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicSupabase } from '@/lib/supabase';
import { buttonVariants } from '@/components/ui/button';
import { JobCard } from '@/components/JobCard';

const heroBg = {
  background:
    'radial-gradient(ellipse 45% 55% at 50% 42%, rgba(57,162,214,0.30), rgba(17,17,17,0) 70%),' +
    'linear-gradient(#202226 1px, transparent 1px) 0 0 / 64px 64px,' +
    'linear-gradient(90deg, #202226 1px, transparent 1px) 0 0 / 64px 64px, #111111',
};

export default function Landing() {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    publicSupabase
      .from('jobs')
      .select('id, title, location, employment_type, level, created_at, companies(name)')
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setJobs(data ?? []));
  }, []);

  return (
    <>
      <section style={heroBg} className="py-24" aria-labelledby="hero-title">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h1 id="hero-title" className="max-w-[760px] text-display-mobile md:text-[56px] md:leading-[64px]">
            Find your dream job <span className="text-primary">and get hired.</span>
          </h1>
          <p className="max-w-[560px] text-lg text-muted-foreground">Explore thousands of job listings or find the perfect candidate.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link to="/jobs" className={buttonVariants({ variant: 'primary', className: 'min-w-[180px]' })}>Find jobs</Link>
            <Link to="/post-job" className={buttonVariants({ variant: 'recruiter', className: 'min-w-[180px]' })}>Post a job</Link>
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-8 py-10 md:py-16" aria-labelledby="latest-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="latest-title" className="text-section-mobile md:text-section">Latest jobs</h2>
          <Link to="/jobs" className="inline-flex min-h-control items-center text-label text-primary">View all jobs</Link>
        </div>
        {jobs === null && <p role="status" className="text-muted-foreground">Loading jobs…</p>}
        {jobs?.length === 0 && <p className="text-muted-foreground">No jobs posted yet.</p>}
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {jobs?.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>
    </>
  );
}
