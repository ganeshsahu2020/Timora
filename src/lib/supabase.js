// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Read once at module load
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use a stable storageKey so auth state is consistent.
// Also guard against HMR / multi-imports by caching on globalThis.
if (!globalThis.__supabase) {
  globalThis.__supabase =
    url && anon
      ? createClient(url, anon, {
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
