// src/services/reminderStore.js
import { supabase } from '../lib/supabase';

/**
 * This module supports TWO modes:
 * 1) Supabase mode (preferred): if a shared `supabase` client exists
 * 2) Local mode (fallback): localStorage-backed for dev without credentials
 *
 * Public API (stable for callers):
 * - listReminders()
 * - upsertReminder(reminder)  // create or update by id
 * - deleteReminder(id)
 * - toggleReminder(id, enabled)
 * - computeNextRunUTC({ start_date, time, recurrence })
 * - savePushSubscription({ endpoint, keys, userAgent })
 * - removePushSubscription(endpoint)
 * - REMINDER_TYPES, RECURRENCES
 */

// ---------------- Constants --------------------------------------------------

export const REMINDER_TYPES = [
  { value: 'habit',    label: 'Habits' },
  { value: 'sleep',    label: 'Sleep' },
  { value: 'wealth',   label: 'Wealth' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'custom',   label: 'Custom' },
];

export const RECURRENCES = [
  { value: 'once',    label: 'One-time' },
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

// ---------------- Mode detection --------------------------------------------

const isRemote = !!supabase;

// ---------------- Time helper ------------------------------------------------

/**
 * Compute next_run_at (UTC ISO) from start_date, time, recurrence.
 * Supports:
 * - daily: "DAILY" (case-insensitive)
 * - weekly: "WEEKLY:MO,WE,FR" (comma-separated days, SU..SA)
 * - default bump: +1 day
 */
export function computeNextRunUTC({ start_date, time, recurrence }) {
  const now = new Date();
  const base = start_date ? new Date(start_date) : new Date(now);

  // If time "HH:mm" provided, apply as UTC time
  if (time && typeof time === 'string') {
    const [hh, mm] = time.split(':').map(Number);
    base.setUTCHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  }

  // If computed time is in the past or right now, bump forward based on recurrence
  if (base <= now) {
    const rec = (recurrence || '').toUpperCase();
    if (!rec || rec.startsWith('DAILY')) {
      base.setUTCDate(base.getUTCDate() + 1);
    } else if (rec.startsWith('WEEKLY')) {
      // WEEKLY:MO,WE,FR
      const days = (rec.split(':')[1] || '')
        .split(',')
        .map((d) => d.trim().toUpperCase())
        .filter(Boolean);
      const map = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
      const today = now.getUTCDay();
      let minDelta = 7;
      for (const d of days) {
        const target = map[d];
        if (typeof target === 'number') {
          const delta = (target - today + 7) % 7 || 7;
          if (delta < minDelta) minDelta = delta;
        }
      }
      base.setUTCDate(now.getUTCDate() + (Number.isFinite(minDelta) ? minDelta : 7));
    } else {
      // fallback: +1 day
      base.setUTCDate(base.getUTCDate() + 1);
    }
  }

  return base.toISOString();
}

// ============================================================================
// ========================= REMOTE (Supabase) ================================
// ============================================================================

async function remote_listReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('next_run_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function remote_createReminder(payload) {
  const next_run_at = payload.next_run_at ?? computeNextRunUTC(payload);
  const { data, error } = await supabase
    .from('reminders')
    .insert([{ ...payload, next_run_at }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function remote_updateReminder(id, patch) {
  const next_run_at = patch?.recompute
    ? computeNextRunUTC({ ...patch })
    : patch?.next_run_at;

  const { data, error } = await supabase
    .from('reminders')
    .update({ ...patch, ...(next_run_at ? { next_run_at } : {}) })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function remote_toggleReminder(id, enabled) {
  const { data, error } = await supabase
    .from('reminders')
    .update({ enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function remote_deleteReminder(id) {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Push subscriptions (remote only; local no-ops)
async function remote_savePushSubscription({ endpoint, keys, userAgent }) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .insert([{
      endpoint,
      p256dh: keys?.p256dh,
      auth: keys?.auth,
      user_agent: userAgent,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function remote_removePushSubscription(endpoint) {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) throw error;
  return true;
}

// ============================================================================
// ========================= LOCAL (fallback) =================================
// ============================================================================

const LS_KEY = 'reminders:v1';

function readAllLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAllLocal(arr) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

function uidLocal() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function local_listReminders() {
  const all = readAllLocal();
  // sort: enabled first, then by next_run_at / time / start_date
  return [...all].sort((a, b) => {
    const ae = a.enabled === false ? 1 : 0;
    const be = b.enabled === false ? 1 : 0;
    if (ae !== be) return ae - be;

    const an = a.next_run_at || '';
    const bn = b.next_run_at || '';
    if (an && bn && an !== bn) return an.localeCompare(bn);

    const at = a.time || '';
    const bt = b.time || '';
    if (at && bt && at !== bt) return at.localeCompare(bt);

    const asd = a.start_date || '';
    const bsd = b.start_date || '';
    if (asd && bsd && asd !== bsd) return asd.localeCompare(bsd);

    return (a.title || '').localeCompare(b.title || '');
  });
}

function local_createReminder(payload) {
  const all = readAllLocal();
  const now = new Date().toISOString();
  const normalized = {
    id: payload.id || uidLocal(),
    user_id: payload.user_id || null,
    type: payload.type || 'custom',
    title: payload.title || 'Reminder',
    message: payload.message || '',
    time: payload.time || '',          // "HH:MM"
    recurrence: payload.recurrence || 'once',
    start_date: payload.start_date || '',
    enabled: payload.enabled !== false,
    next_run_at: payload.next_run_at ?? computeNextRunUTC(payload),
    created_at: payload.created_at || now,
    updated_at: now,
  };
  all.push(normalized);
  writeAllLocal(all);
  return normalized;
}

function local_updateReminder(id, patch = {}) {
  const all = readAllLocal();
  const i = all.findIndex((r) => r.id === id);
  if (i === -1) return null;

  const next_run_at = patch?.recompute
    ? computeNextRunUTC({ ...all[i], ...patch })
    : (patch?.next_run_at ?? all[i].next_run_at);

  const updated = {
    ...all[i],
    ...patch,
    next_run_at,
    updated_at: new Date().toISOString(),
  };
  all[i] = updated;
  writeAllLocal(all);
  return updated;
}

function local_toggleReminder(id, enabled) {
  const all = readAllLocal();
  const i = all.findIndex((r) => r.id === id);
  if (i === -1) return null;
  all[i].enabled = typeof enabled === 'boolean' ? enabled : !all[i].enabled;
  all[i].updated_at = new Date().toISOString();
  writeAllLocal(all);
  return all[i];
}

function local_deleteReminder(id) {
  const all = readAllLocal();
  const next = all.filter((r) => r.id !== id);
  writeAllLocal(next);
  return true;
}

// local push stubs (no-op)
async function local_savePushSubscription() { return { ok: true }; }
async function local_removePushSubscription() { return true; }

// ============================================================================
// ========================= Public API (unified) ==============================
// ============================================================================

export async function listReminders(opts) {
  // ✅ Bullet-proof: always return an array, even if Supabase/local fails
  try {
    const data = isRemote
      ? await remote_listReminders(opts)
      : local_listReminders(opts);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Create or update based on presence of `id`.
 * Returns the saved/updated record.
 */
export async function upsertReminder(reminder) {
  if (isRemote) {
    if (reminder?.id) {
      return remote_updateReminder(reminder.id, reminder);
    }
    return remote_createReminder(reminder);
  } else {
    if (reminder?.id) {
      return local_updateReminder(reminder.id, reminder);
    }
    return local_createReminder(reminder);
  }
}

// Optional named functions (useful if you want them directly)
export async function createReminder(payload) {
  return isRemote ? remote_createReminder(payload) : local_createReminder(payload);
}
export async function updateReminder(id, patch) {
  return isRemote ? remote_updateReminder(id, patch) : local_updateReminder(id, patch);
}

export async function toggleReminder(id, enabled) {
  return isRemote ? remote_toggleReminder(id, enabled) : local_toggleReminder(id, enabled);
}

export async function deleteReminder(id) {
  return isRemote ? remote_deleteReminder(id) : local_deleteReminder(id);
}

/** Push subscriptions */
export async function savePushSubscription({ endpoint, keys, userAgent }) {
  return isRemote
    ? remote_savePushSubscription({ endpoint, keys, userAgent })
    : local_savePushSubscription({ endpoint, keys, userAgent });
}

export async function removePushSubscription(endpoint) {
  return isRemote
    ? remote_removePushSubscription(endpoint)
    : local_removePushSubscription(endpoint);
}
