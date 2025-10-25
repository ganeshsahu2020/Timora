// src/services/recoveryStore.js
import { supabase } from '../lib/supabase';

/** ------------------------------------------------------------------------
 * Auth helpers
 * -----------------------------------------------------------------------*/
async function getUid() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data?.user?.id;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

/** ------------------------------------------------------------------------
 * Snapshot: create/update helpers (handles 409 conflicts)
 * -----------------------------------------------------------------------*/

/**
 * Upsert a one-row-per-user snapshot. Avoids 409 by specifying onConflict.
 */
export async function upsertRecoverySnapshot(patch) {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth?.user?.id;
  if (!user_id) throw new Error('No authenticated user');

  const payload = {
    user_id,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('recovery_snapshot')
    .upsert(payload, { onConflict: 'user_id' });

  // Optional fallback in rare race cases
  if (error && String(error.code) === '409') {
    const { error: e2 } = await supabase
      .from('recovery_snapshot')
      .update(patch)
      .eq('user_id', user_id);
    if (e2) throw e2;
    return { ok: true, method: 'update' };
  }

  if (error) throw error;
  return { ok: true, method: 'upsert' };
}

/**
 * Ensure a snapshot row exists for this user (idempotent).
 * Call once on page mount for Recovery pages.
 */
export async function ensureSnapshotRow() {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth?.user?.id;
  if (!user_id) return;

  const { data, error } = await supabase
    .from('recovery_snapshot')
    .select('user_id')
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    // Create initial blank snapshot with your schema keys
    await supabase
      .from('recovery_snapshot')
      .upsert(
        {
          user_id,
          substance: 'alcohol',
          pattern: { stage: 'early-recovery', daysSober: 0, past30UseDays: 0, severity: 'moderate', weeklyAmount: 0 },
          health: { cooccurring: [], meds: [], sleepQuality: 70 },
          risks: { topTriggers: [], highRiskTimes: [], highRiskPlaces: [] },
          supports: { contacts: [], therapy: { active: false }, groups: { type: 'SMART Recovery', active: false } },
          cravings: { last7dAvg: 0, peakTimes: [] },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  }
}

/** ------------------------------------------------------------------------
 * Snapshot: load & update
 * -----------------------------------------------------------------------*/

/** Load snapshot (and seed a minimal row if none exists). */
export async function getRecoverySnapshot() {
  const user_id = await getUid();

  const { data, error } = await supabase
    .from('recovery_snapshot')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const seed = {
      user_id,
      substance: 'alcohol',
      pattern: { stage: 'early-recovery', daysSober: 0, past30UseDays: 0, severity: 'moderate', weeklyAmount: 0 },
      health: { cooccurring: [], meds: [], sleepQuality: 70 },
      risks: { topTriggers: [], highRiskTimes: [], highRiskPlaces: [] },
      supports: { contacts: [], therapy: { active: false }, groups: { type: 'SMART Recovery', active: false } },
      cravings: { last7dAvg: 0, peakTimes: [] },
      updated_at: new Date().toISOString(),
    };

    // Use UPSERT for strict mode / double-mount safety
    const { error: insErr } = await supabase
      .from('recovery_snapshot')
      .upsert(seed, { onConflict: 'user_id' });

    if (insErr) throw insErr;
    return seed;
  }

  return data;
}

/**
 * Partial-update JSONB fields by merging with current snapshot,
 * then upsert (onConflict user_id) to avoid 409.
 */
export async function updateRecoverySnapshot(patch = {}) {
  const user_id = await getUid();

  const { data: curr, error: loadErr } = await supabase
    .from('recovery_snapshot')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();
  if (loadErr) throw loadErr;

  const merged = {
    user_id,
    substance: patch.substance ?? curr?.substance ?? null,
    pattern: { ...(curr?.pattern || {}), ...(patch.pattern || {}) },
    health: { ...(curr?.health || {}), ...(patch.health || {}) },
    risks: { ...(curr?.risks || {}), ...(patch.risks || {}) },
    supports: { ...(curr?.supports || {}), ...(patch.supports || {}) },
    cravings: { ...(curr?.cravings || {}), ...(patch.cravings || {}) },
    updated_at: new Date().toISOString(),
  };

  // Delegate to the 409-safe upsert helper
  await upsertRecoverySnapshot(merged);

  // Return fresh snapshot
  const { data, error } = await supabase
    .from('recovery_snapshot')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** ------------------------------------------------------------------------
 * Logs (events)
 * -----------------------------------------------------------------------*/

export async function saveRecoveryEntry(entry) {
  const user_id = await getUid();
  const payload = {
    user_id,
    date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
    type: entry.type, // craving | intake | exposure | medication | therapy | note | sober-day
    substance: entry.substance || null,
    amount: entry.amount || null,
    craving_level: entry.cravingLevel ?? null,
    trigger: entry.trigger || null,
    urge_duration_min: entry.urgeDurationMin ?? null,
    used_coping: entry.usedCoping ?? null,
    notes: entry.notes || null,
  };
  const { error } = await supabase.from('recovery_logs').insert(payload);
  if (error) throw error;

  // Lightweight snapshot side-effects (daysSober / rolling cravings)
  try {
    const snap = await getRecoverySnapshot();
    const next = { ...snap };

    if (entry?.type === 'sober-day') {
      const prev = Number(next?.pattern?.daysSober || 0);
      next.pattern = { ...(next.pattern || {}), daysSober: prev + 1 };
    }
    if (entry?.type === 'craving' && typeof entry?.cravingLevel === 'number') {
      const curr = Number(next?.cravings?.last7dAvg || 0);
      const rolled = Math.round(((curr * 6 + entry.cravingLevel) / 7) * 10) / 10;
      next.cravings = { ...(next.cravings || {}), last7dAvg: rolled };
    }
    await updateRecoverySnapshot(next);
  } catch {
    // non-fatal
  }

  return { ok: true };
}

export async function listRecoveryLogs({ limit = 50 } = {}) {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_logs')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** ------------------------------------------------------------------------
 * Triggers CRUD
 * -----------------------------------------------------------------------*/
export async function listTriggers() {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_triggers')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createTrigger({ label, notes }) {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_triggers')
    .insert({ user_id, label, notes: notes || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateTrigger(id, patch) {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_triggers')
    .update({ label: patch.label, notes: patch.notes })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteTrigger(id) {
  const user_id = await getUid();
  const { error } = await supabase
    .from('recovery_triggers')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  if (error) throw error;
  return { ok: true };
}

/** ------------------------------------------------------------------------
 * Relapses CRUD
 * -----------------------------------------------------------------------*/
export async function listRelapses() {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_relapses')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createRelapse({ date, trigger, intensity, notes }) {
  const user_id = await getUid();
  const payload = {
    user_id,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    trigger: trigger || null,
    intensity: Number(intensity ?? 0),
    notes: notes || null,
  };
  const { data, error } = await supabase
    .from('recovery_relapses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateRelapse(id, patch) {
  const user_id = await getUid();
  const update = {
    ...(patch.date ? { date: new Date(patch.date).toISOString() } : {}),
    ...(patch.trigger !== undefined ? { trigger: patch.trigger } : {}),
    ...(patch.intensity !== undefined ? { intensity: Number(patch.intensity) } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
  };
  const { data, error } = await supabase
    .from('recovery_relapses')
    .update(update)
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteRelapse(id) {
  const user_id = await getUid();
  const { error } = await supabase
    .from('recovery_relapses')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  if (error) throw error;
  return { ok: true };
}

/** ------------------------------------------------------------------------
 * Supports CRUD
 * -----------------------------------------------------------------------*/
export async function listSupports() {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_supports')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createSupport({ name, phone, relation, notes }) {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_supports')
    .insert({
      user_id,
      name,
      phone: phone || null,
      relation: relation || null,
      notes: notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateSupport(id, patch) {
  const user_id = await getUid();
  const { data, error } = await supabase
    .from('recovery_supports')
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.relation !== undefined ? { relation: patch.relation } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteSupport(id) {
  const user_id = await getUid();
  const { error } = await supabase
    .from('recovery_supports')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  if (error) throw error;
  return { ok: true };
}

/** ------------------------------------------------------------------------
 * Insights + Export
 * -----------------------------------------------------------------------*/
export async function generateRecoveryInsights() {
  const snap = await getRecoverySnapshot();
  const logs = await listRecoveryLogs({ limit: 100 });

  const cravings = logs.filter(
    (l) => l.type === 'craving' && typeof l.craving_level === 'number'
  );
  const avgCraving = cravings.length
    ? Math.round(
        (cravings.reduce((s, r) => s + r.craving_level, 0) / cravings.length) * 10
      ) / 10
    : snap?.cravings?.last7dAvg ?? 0;

  const daysSober = snap?.pattern?.daysSober ?? 0;

  const suggestions = [
    {
      title: 'Tighten evening routine',
      description:
        'Add a 20-min walk at 8:30pm and text a peer at 9:15pm. Keep a non-alcoholic drink ready.',
      priority: 'high',
    },
    {
      title: 'Plan for social pressure',
      description:
        'Prepare two no-alcohol scripts and set a 90-minute limit at events.',
      priority: 'medium',
    },
    {
      title: 'Stress decompression',
      description:
        'Use 4-7-8 breathing + 5-minute journal when deadlines spike.',
      priority: 'medium',
    },
  ];

  const score = Math.max(0, 100 - avgCraving * 10 + daysSober / 2);

  return {
    score: Math.round(score),
    readiness: snap?.pattern?.stage || 'action',
    suggestions,
  };
}

export async function exportRecoveryData(format = 'json') {
  const user_id = await getUid();

  const [snapshotRes, logsRes, triggersRes, relapsesRes, supportsRes] = await Promise.all([
    supabase.from('recovery_snapshot').select('*').eq('user_id', user_id).maybeSingle(),
    supabase.from('recovery_logs').select('*').eq('user_id', user_id).order('date', { ascending: false }),
    supabase.from('recovery_triggers').select('*').eq('user_id', user_id).order('created_at', { ascending: false }),
    supabase.from('recovery_relapses').select('*').eq('user_id', user_id).order('date', { ascending: false }),
    supabase.from('recovery_supports').select('*').eq('user_id', user_id).order('created_at', { ascending: false }),
  ]);

  const payload = {
    snapshot: snapshotRes.data ?? null,
    logs: logsRes.data ?? [],
    triggers: triggersRes.data ?? [],
    relapses: relapsesRes.data ?? [],
    supports: supportsRes.data ?? [],
    exportedAt: new Date().toISOString(),
  };

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'csv') {
    const rows = [['section', 'key', 'value']];
    const pushKV = (section, obj) => {
      Object.entries(obj || {}).forEach(([k, v]) => {
        rows.push([section, k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')]);
      });
    };
    pushKV('snapshot', payload.snapshot || {});
    (payload.logs || []).forEach((r) => rows.push(['logs', r.id, JSON.stringify(r)]));
    (payload.triggers || []).forEach((r) => rows.push(['triggers', r.id, JSON.stringify(r)]));
    (payload.relapses || []).forEach((r) => rows.push(['relapses', r.id, JSON.stringify(r)]));
    (payload.supports || []).forEach((r) => rows.push(['supports', r.id, JSON.stringify(r)]));

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  // pdf etc — handle server-side later
  return;
}
