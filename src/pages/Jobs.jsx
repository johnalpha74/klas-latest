import { useEffect, useState } from 'react';
import { publicSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobCard } from '@/components/JobCard';
import { EMPLOYMENT_TYPES } from '@/lib/utils';

const selectClass =
  'min-h-control w-full rounded-control border border-input bg-surface px-4 text-body text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export default function Jobs() {
  const [filters, setFilters] = useState({ q: '', location: '', type: '' });
  const [applied, setApplied] = useState(filters);
  const [state, setState] = useState({ loading: true, jobs: [], error: null });

  useEffect(() => {
    let query = publicSupabase
      .from('jobs')
      .select('id, title, location, employment_type, level, created_at, companies(name)')
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(30);
    // Strip characters that PostgREST filter syntax treats specially.
    const clean = (s) => s.trim().replace(/[%,()*]/g, ' ');
    if (applied.q) query = query.ilike('title', `%${clean(applied.q)}%`);
    if (applied.location) query = query.ilike('location', `%${clean(applied.location)}%`);
    if (applied.type) query = query.eq('employment_type', applied.type);
    setState((s) => ({ ...s, loading: true }));
    query.then(({ data, error }) => setState({ loading: false, jobs: data ?? [], error }));
  }, [applied]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const clear = () => { const empty = { q: '', location: '', type: '' }; setFilters(empty); setApplied(empty); };

  return (
    <section className="container flex flex-col gap-8 py-12">
      <h1 className="text-section-mobile md:text-section">Find jobs</h1>
      <form role="search" className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setApplied(filters); }}>
        <div className="flex flex-col gap-4 md:flex-row">
          <label htmlFor="q" className="sr-only">Search by job title or keyword</label>
          <Input id="q" type="search" placeholder="Search by job title or keyword" value={filters.q} onChange={set('q')} />
          <Button type="submit" className="md:min-w-[160px]">Search</Button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label htmlFor="loc" className="sr-only">Location</label>
          <Input id="loc" placeholder="Location" value={filters.location} onChange={set('location')} />
          <label htmlFor="type" className="sr-only">Employment type</label>
          <select id="type" className={selectClass} value={filters.type} onChange={set('type')}>
            <option value="">Employment type</option>
            {Object.entries(EMPLOYMENT_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Button variant="link" onClick={clear}>Clear filters</Button>
        </div>
      </form>

      <div aria-live="polite">
        {state.loading && <p className="text-muted-foreground">Loading jobs…</p>}
        {state.error && <p className="text-error">We couldn't load jobs. Please try again.</p>}
        {!state.loading && !state.error && state.jobs.length === 0 && (
          <p className="text-muted-foreground">No jobs match your search. <Button variant="link" onClick={clear}>Clear filters</Button></p>
        )}
      </div>
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {state.jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </section>
  );
}
