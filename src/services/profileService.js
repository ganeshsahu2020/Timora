// src/services/profileService.js
import { supabase } from '../lib/supabase';

const nilIfEmpty = (v) => (v === '' || v === undefined ? null : v);
const dateOrNull = (v) => (v === '' || v === undefined || v === null ? null : v); // ← key fix

/** Load the current user's profile (seed one if missing, surface server errors). */
export async function getProfile() {
  const { data: auth, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const uid = auth?.user?.id;
  if (!uid) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) {
    console.error('profiles.select error', error);
    throw error;
  }

  if (!data) {
    const { data: seeded, error: insErr } = await supabase
      .from('profiles')
      .insert({ id: uid, prefs: {} })
      .select()
      .single();
    if (insErr) {
      console.error('profiles.insert seed error', insErr);
      throw insErr;
    }
    return seeded;
  }

  return data;
}

/** Insert/update the current user's profile. Sends normalized, safe values. */
export async function upsertProfile(patch = {}) {
  const { data: auth, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const uid = auth?.user?.id;
  if (!uid) throw new Error('Not authenticated');

  // Clean tags (trim & drop empties)
  const cleanTags = Array.isArray(patch.tags)
    ? patch.tags.map(t => (t ?? '').trim()).filter(Boolean)
    : null;

  const payload = {
    id: uid,
    full_name: patch.full_name ?? null,
    bio: patch.bio ?? null,
    prefs: patch.prefs ?? {},

    avatar_url: nilIfEmpty(patch.avatar_url),
    headline: nilIfEmpty(patch.headline),
    phone: nilIfEmpty(patch.phone),
    timezone: nilIfEmpty(patch.timezone),
    location: nilIfEmpty(patch.location),
    website: nilIfEmpty(patch.website),
    birthday: dateOrNull(patch.birthday),          // ← never send ""
    tags: cleanTags,                                // [] or null

    notify_news: !!patch.notify_news,
    notify_product: !!patch.notify_product,
    notify_security: patch.notify_security === false ? false : true,

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single(); // shows detailed server error on 400

  if (error) {
    console.error('profiles.upsert error', error);
    throw error;
  }
  return data;
}

/** Upload a single avatar image and persist profiles.avatar_url. Returns the URL. */
export async function uploadAvatar(file) {
  if (!file) throw new Error('No file selected');

  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error('Not authenticated');

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `${uid}/avatar-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || `image/${ext}`,
    });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = pub?.publicUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', uid)
    .select()
    .single();

  if (error) {
    console.error('profiles.update error', error);
    throw error;
  }
  return data?.avatar_url || publicUrl;
}

/** Client-safe placeholder: real account deletion needs a service role on a server. */
export async function deleteAccount() {
  await supabase.auth.signOut();
}
