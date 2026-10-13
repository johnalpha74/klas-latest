import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '@/lib/supabase';
import { buttonVariants } from '@/components/ui/button';
import { postedAgo } from '@/lib/utils';

const JOB_STATUSES = { open: 'Open', hiring: 'Hiring', closed: 'Closed' };

export default function RecruiterDashboard() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.from('jobs')
      .select('id, title, location, status, created_at, applications(count)')
      .eq('recruiter_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setJobs(data ?? []));
  }, [supabase, userId]);

  async function setStatus(job, status) {
    setError(null);
    const previous = job.status;
    setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, status } : j)));
    const { error } = await supabase.from('jobs').update({ status }).eq('id', job.id);
    if (error) {
      setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, status: previous } : j)));
      setError(`Couldn't update ${job.title}. Please try again.`);
    }
  }

  return (
    <section className="container flex flex-col gap-10 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-section-mobile md:text-section">My dashboard</h1>
        <Link to="/post-job" className={buttonVariants({ variant: 'recruiter' })}>Post a job</Link>
      </div>
      {error && <p role="alert" className="text-error">{error}</p>}
      <section aria-labelledby="myjobs" className="flex flex-col gap-4">
        <h2 id="myjobs" className="text-card-heading">My jobs</h2>
        {jobs === null ? <p role="status" className="text-muted-foreground">Loading…</p> : jobs.length === 0 ? (
          <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead><tr className="border-b border-surface-disabled text-label text-muted-foreground">
                <th scope="col" className="px-4 py-3">Job</th><th scope="col" className="px-4 py-3">Posted</th>
                <th scope="col" className="px-4 py-3">Applications</th><th scope="col" className="px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-surface-disabled last:border-0">
                    <td className="px-4 py-3"><Link className="text-primary" to={`/jobs/${job.id}`}>{job.title}</Link>
                      <div className="text-sm text-muted-foreground">{job.location}</div></td>
                    <td className="px-4 py-3">{postedAgo(job.created_at).replace('Posted ', '')}</td>
                    <td className="px-4 py-3">{job.applications?.[0]?.count ?? 0}</td>
                    <td className="px-4 py-3">
                      <label htmlFor={`st-${job.id}`} className="sr-only">Status for {job.title}</label>
                      <select id={`st-${job.id}`} value={job.status} onChange={(e) => setStatus(job, e.target.value)}
                        className="min-h-control rounded-control border border-input bg-surface px-3 text-foreground">
                        {Object.entries(JOB_STATUSES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
