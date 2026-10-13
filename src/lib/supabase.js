import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/clerk-react';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('Missing Supabase env vars — copy .env.example to .env.local');

/** Public client for signed-out reads (live jobs, companies). */
export const publicSupabase = createClient(url, anonKey);

/**
 * Supabase client that sends the Clerk session token on every request
 * (Clerk is set up as a third-party auth provider in Supabase), so RLS sees auth.jwt()->>'sub'.
 */
export function useSupabase() {
  const { session } = useSession();
  return useMemo(() => {
    if (!session) return publicSupabase;
    return createClient(url, anonKey, {
      accessToken: async () => (await session.getToken()) ?? null,
    });
  }, [session]);
}
