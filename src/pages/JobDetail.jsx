import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicSupabase } from '@/lib/supabase';
import { EMPLOYMENT_TYPES, LEVELS, postedAgo } from '@/lib/utils';

export default function JobDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, job: null });

  useEffect(() => {
    publicSupabase
      .from('jobs')
      .select('*, companies(name, logo_path)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setState({ loading: false, job: data }));
  }, [id]);

  if (state.loading) return <p role="status" className="container py-16 text-muted-foreground">Loading…</p>;
  if (!state.job) return <p className="container py-16 text-muted-foreground">This job is no longer available. <Link to="/jobs" className="text-primary">Back to jobs</Link></p>;

  const job = state.job;
  return (
    <article className="container flex flex-col gap-6 py-12">
      <Link to="/jobs" className="inline-flex min-h-control items-center self-start text-label text-primary">← Back to results</Link>
      <h1 className="text-section-mobile md:text-[40px] md:leading-[48px]">{job.title}</h1>
      <p className="text-muted-foreground">{job.companies?.name} / {job.location} · {postedAgo(job.created_at)}</p>
      <p className="text-muted-foreground">{EMPLOYMENT_TYPES[job.employment_type]} / {LEVELS[job.level]}{job.salary ? ` · ${job.salary}` : ''}</p>
      {/* Markdown rendering and the apply form come with the candidate-side step. */}
      <div className="max-w-[720px] whitespace-pre-wrap text-muted-foreground">{job.description}</div>
    </article>
  );
}
