import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '@/lib/supabase';
import { dashboardPath } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

const ROLES = [
  { role: 'candidate', title: 'Candidate', body: 'Search and apply for jobs, save the ones you like and track every application.',
    className: 'bg-primary text-primary-foreground hover:bg-primary-hover' },
  { role: 'recruiter', title: 'Recruiter', body: 'Post jobs, search CVs, and manage applications and candidates from your dashboard.',
    className: 'bg-recruiter text-recruiter-foreground hover:bg-recruiter-hover' },
];

/** "I am a…" — the role is saved once to profiles and cannot be changed afterwards. */
export default function Onboarding() {
  const { user } = useUser();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  async function choose(role) {
    setSaving(role);
    setError(null);
    const { error } = await supabase.from('profiles').insert({
      role,
      full_name: user?.fullName ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    });
    if (error) {
      setSaving(null);
      setError("We couldn't save your choice. Please try again.");
      return;
    }
    navigate(dashboardPath(role), { replace: true });
  }

  return (
    <section className="container flex max-w-[880px] flex-col items-center gap-10 py-24 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-display-mobile md:text-display">I am a…</h1>
        <p className="text-muted-foreground">Choose how you will use KLAS. You can't change this later.</p>
      </div>
      <div className="grid w-full gap-6 text-left [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {ROLES.map((r) => (
          <button
            key={r.role}
            type="button"
            onClick={() => choose(r.role)}
            disabled={saving !== null}
            aria-busy={saving === r.role || undefined}
            className={cn('flex min-h-[220px] flex-col gap-3 rounded-panel p-8 text-left transition-colors disabled:opacity-70', r.className)}
          >
            <span className="text-[28px] font-bold leading-9">{r.title}</span>
            <span>{r.body}</span>
            <span className="mt-auto text-label">{saving === r.role ? 'Saving…' : `Continue as a ${r.role} →`}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-error">{error}</p>}
    </section>
  );
}
