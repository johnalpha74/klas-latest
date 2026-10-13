import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '@/lib/supabase';
import { buttonVariants } from '@/components/ui/button';
import { JobCard } from '@/components/JobCard';

const STATUS = {
  submitted: { label: 'Submitted', className: 'border-border text-muted-foreground' },
  reviewed: { label: 'Reviewed', className: 'border-primary text-primary' },
  interviewing: { label: 'Interviewing', className: 'border-accent text-accent' },
  hired: { label: 'Hired', className: 'border-success text-success' },
  rejected: { label: 'Not selected', className: 'border-border text-muted-foreground' },
};

export default function CandidateDashboard() {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const [apps, setApps] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    supabase.from('applications')
      .select('id, status, created_at, jobs(id, title, location, companies(name))')
      .eq('candidate_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setApps(data ?? []));
    supabase.from('saved_jobs')
      .select('jobs(id, title, location, employment_type, level, created_at, companies(name))')
      .eq('candidate_id', userId)
      .then(({ data }) => setSaved((data ?? []).map((r) => r.jobs).filter(Boolean)));
  }, [supabase, userId]);

  return (
    <section className="container flex flex-col gap-10 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-section-mobile md:text-section">My dashboard</h1>
        <Link to="/jobs" className={buttonVariants()}>Find jobs</Link>
      </div>

      <section aria-labelledby="apps" className="flex flex-col gap-4">
        <h2 id="apps" className="text-card-heading">My applications</h2>
        {apps === null ? <p role="status" className="text-muted-foreground">Loading…</p> : apps.length === 0 ? (
          <p className="text-muted-foreground">You haven't applied for any jobs yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead><tr className="border-b border-surface-disabled text-label text-muted-foreground">
                <th scope="col" className="px-4 py-3">Job</th><th scope="col" className="px-4 py-3">Company</th><th scope="col" className="px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b border-surface-disabled last:border-0">
                    <td className="px-4 py-4"><Link className="text-primary" to={`/jobs/${a.jobs?.id}`}>{a.jobs?.title}</Link></td>
                    <td className="px-4 py-4">{a.jobs?.companies?.name}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex min-h-7 items-center gap-2 rounded-control border px-2.5 text-[13px] font-semibold ${STATUS[a.status].className}`}>
                        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />{STATUS[a.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="saved" className="flex flex-col gap-4">
        <h2 id="saved" className="text-card-heading">Saved jobs</h2>
        {saved?.length === 0 && <p className="text-muted-foreground">Jobs you save appear here.</p>}
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {saved?.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>
    </section>
  );
}
