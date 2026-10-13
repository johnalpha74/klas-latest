import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { EMPLOYMENT_TYPES, LEVELS, postedAgo } from '@/lib/utils';

/** KLAS job card. `job` is a jobs row with `companies(name)` joined. */
export function JobCard({ job, actions }) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6" aria-labelledby={`job-${job.id}`}>
      <h3 id={`job-${job.id}`} className="break-words text-card-heading text-primary">{job.title}</h3>
      <p className="text-sm text-muted-foreground">{[job.companies?.name, job.location].filter(Boolean).join(' / ')}</p>
      <p className="text-sm text-muted-foreground">{EMPLOYMENT_TYPES[job.employment_type]} / {LEVELS[job.level]}</p>
      <p className="text-sm text-muted-foreground">{postedAgo(job.created_at)}</p>
      <div className="mt-auto flex gap-3 pt-1">
        <Link to={`/jobs/${job.id}`} className={buttonVariants({ variant: 'job', className: 'flex-1 px-4' })}>View details</Link>
        {actions}
      </div>
    </article>
  );
}
