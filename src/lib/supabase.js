// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://nsijrzvsdiqgwpqwnpzz.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaWpyenZzZGlxZ3dwcXducHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDU0MTMsImV4cCI6MjA3NjkyMTQxM30.ZfDlpYB-lt-74TWwew6rrJXfk9Vi33ER5AeiLd-vj2A';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only trust env if it points at the nsijrzvs… project
export const SUPABASE_URL =
  envUrl && envUrl.includes('nsijrzvsdiqgwpqwnpzz') ? envUrl : FALLBACK_URL;

export const SUPABASE_ANON_KEY =
  envKey && envKey.length > 50 ? envKey : FALLBACK_ANON;

// Debug (remove later if you want)
console.log('supabase.js → VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('supabase.js → Using URL:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'sb-nsijrzvsdiqgwpqwnpzz-auth',
  },
});
