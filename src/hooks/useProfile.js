import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabase } from '@/lib/supabase';

/** The signed-in user's KLAS profile (role chosen at onboarding), or null if none yet. */
export function useProfile() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const supabase = useSupabase();
  const [state, setState] = useState({ loading: true, profile: null, error: null });

  const load = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) { setState({ loading: false, profile: null, error: null }); return; }
    setState((s) => ({ ...s, loading: true }));
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setState({ loading: false, profile: data, error });
  }, [isLoaded, isSignedIn, userId, supabase]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}

export const dashboardPath = (role) => (role === 'recruiter' ? '/recruiter' : '/candidate');
