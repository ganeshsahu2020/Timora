// src/lib/ensureProfile.js
import { supabase } from './supabase';

export async function ensureProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return console.error('[ensureProfile]', error);
  if (!data) {
    await supabase.from('profiles').insert({ id: user.id, full_name: user.user_metadata?.full_name || '' });
  }
}
