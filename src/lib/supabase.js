// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Read once at module load
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use a stable storageKey so auth state is consistent.
// Also guard against HMR / multi-imports by caching on globalThis.
if (!globalThis.__supabase) {
  globalThis.__supabase =
    SUPABASE_URL && SUPABASE_ANON_KEY
      ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            storageKey: 'timora-auth', // any unique key for your app
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      : null;
}

export const supabase = globalThis.__supabase;
