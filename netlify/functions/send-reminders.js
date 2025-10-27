// netlify/functions/send-reminders.js
// Cron example: every 5 minutes
// In netlify.toml add:
// [functions."send-reminders"]
//   schedule = "*/5 * * * *"

import { createClient } from "@supabase/supabase-js";

/**
 * -------------------------
 * Environment / setup
 * -------------------------
 * Required (server-side only):
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional (only used if present):
 * - RESEND_API_KEY
 * - RESEND_FROM (e.g. "Reminders <noreply@yourdomain.com>")
 * - WEB_PUSH_SUBJECT (e.g. "mailto:admin@yourdomain.com")
 * - WEB_PUSH_PUBLIC_KEY
 * - WEB_PUSH_PRIVATE_KEY
 */

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY,
  RESEND_FROM = "Reminders <noreply@example.com>",
  WEB_PUSH_SUBJECT = "mailto:admin@example.com",
  WEB_PUSH_PUBLIC_KEY,
  WEB_PUSH_PRIVATE_KEY,
  NODE_ENV,
} = process.env;

// Supabase client (Service Role — keep server-side only!)
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

// NOTE: We purposely do NOT import "resend" or "web-push" at the top level.
// We'll try to load them dynamically inside the handler if configured.

export const handler = async () => {
  if (!supabase) {
    console.warn(
      "[send-reminders] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; skipping run."
    );
    return { statusCode: 200, body: "Supabase not configured. Skipping." };
  }

  // Try to dynamically load optional deps if keys are provided.
  // If they are not installed, we’ll catch and continue without email/push.
  let resendClient = null;
  let webpush = null;
  const pushEnabled = WEB_PUSH_PUBLIC_KEY && WEB_PUSH_PRIVATE_KEY;

  if (RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend"); // dynamic import
      resendClient = new Resend(RESEND_API_KEY);
    } catch (e) {
      console.warn("[send-reminders] 'resend' not available; email will be skipped.");
    }
  }

  if (pushEnabled) {
    try {
      webpush = (await import("web-push")).default; // dynamic import
      webpush.setVapidDetails(WEB_PUSH_SUBJECT, WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY);
    } catch (e) {
      console.warn("[send-reminders] 'web-push' not available; push will be skipped.");
      webpush = null;
    }
  }

  try {
    const now = new Date().toISOString();

    // 1) Find due reminders
    const { data: due, error } = await supabase
      .from("reminders")
      .select("id,user_id,title,message,type,next_run_at,recurrence,enabled")
      .lte("next_run_at", now)
      .eq("enabled", true)
      .limit(200); // safety cap

    if (error) {
      console.error("Supabase (select due) error", error);
      return { statusCode: 500, body: "DB error" };
    }

    if (!Array.isArray(due) || due.length === 0) {
      // nothing to do
      return { statusCode: 200, body: "No due reminders." };
    }

    for (const r of due) {
      try {
        // 2) deliver: email + push (best-effort)
        await deliverReminder({ r, resendClient, webpush });

        // 3) compute next_run_at
        const next = computeNextRunFromRecurrence(r);

        // 4) update reminder + log delivery
        const updates = {
          last_sent_at: new Date().toISOString(),
          next_run_at: next || null,
          enabled: !!next, // disable if no next run (one-off)
        };

        const { error: upErr } = await supabase
          .from("reminders")
          .update(updates)
          .eq("id", r.id);

        if (upErr) console.error("Supabase (update) error", upErr);

        await supabase.from("reminder_deliveries").insert([
          {
            reminder_id: r.id,
            channel: "email_push",
            status: "ok",
            meta: { next_run_at: next },
          },
        ]);
      } catch (e) {
        console.error("deliverReminder error", e);
        await supabase.from("reminder_deliveries").insert([
          {
            reminder_id: r.id,
            channel: "email_push",
            status: "error",
            error: String(e?.message || e),
          },
        ]);
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    console.error("[send-reminders] fatal error:", e);
    return { statusCode: 500, body: "Internal error" };
  }
};

// -------------------------
// Delivery helpers
// -------------------------

async function deliverReminder({ r, resendClient, webpush }) {
  // Fetch user contact and subscriptions (adjust table names/columns as needed)
  const { data: profile, error: profileErr } = await supabase
    .from("profiles") // If you store email here; otherwise use auth admin API.
    .select("email")
    .eq("id", r.user_id)
    .single();

  if (profileErr) {
    // Not fatal — maybe you only want push
    console.warn("profiles lookup error:", profileErr.message);
  }

  // Email via Resend (if configured & installed)
  if (resendClient && profile?.email) {
    try {
      await resendClient.emails.send({
        from: RESEND_FROM,
        to: profile.email,
        subject: r.title || "Reminder",
        text: r.message || `You have a ${r.type} reminder`,
      });
    } catch (e) {
      console.error("Resend email error:", e?.message || e);
    }
  } else if (!resendClient && profile?.email && NODE_ENV !== "production") {
    console.log(`[dev] Would email ${profile.email}: ${r.title} — ${r.message || ""}`);
  }

  // Web Push to all subscriptions (if configured & installed)
  if (webpush) {
    const { data: subs, error: subsErr } = await supabase
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("user_id", r.user_id);

    if (subsErr) {
      console.warn("push_subscriptions lookup error:", subsErr.message);
      return;
    }

    const payload = JSON.stringify({
      title: r.title || "Reminder",
      body: r.message || `You have a ${r.type} reminder`,
      data: { reminderId: r.id },
    });

    for (const s of subs || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          payload
        );
      } catch (e) {
        // cleanup gone subscriptions
        if (e.statusCode === 410 || e.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        } else {
          console.error("Web Push error:", e?.statusCode || "", e?.message || e);
        }
      }
    }
  } else if (NODE_ENV !== "production") {
    console.log(`[dev] Would push-notify user ${r.user_id}: ${r.title}`);
  }
}

// -------------------------
// Recurrence helper (simple)
// -------------------------

/**
 * Return next ISO timestamp in UTC or null if one-off.
 * Supports:
 * - "DAILY"
 * - "WEEKLY:MO,WE,FR"
 * - "CRON:* * * * *" (stubbed: +5 minutes unless you add cron-parser)
 */
function computeNextRunFromRecurrence(rem) {
  const now = new Date();
  const cur = new Date(rem.next_run_at || now);
  const rec = (rem.recurrence || "").toUpperCase();

  if (!rec) return null; // one-shot reminder

  if (rec.startsWith("DAILY")) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    return cur.toISOString();
  }

  if (rec.startsWith("WEEKLY")) {
    // WEEKLY:MO,WE,FR
    const days = (rec.split(":")[1] || "")
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .filter(Boolean);
    const map = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
    const today = cur.getUTCDay();
    let minDelta = 7;
    for (const d of days) {
      const target = map[d];
      if (typeof target === "number") {
        const delta = ((target - today + 7) % 7) || 7;
        if (delta < minDelta) minDelta = delta;
      }
    }
    cur.setUTCDate(cur.getUTCDate() + (Number.isFinite(minDelta) ? minDelta : 7));
    return cur.toISOString();
  }

  if (rec.startsWith("CRON:")) {
    // Optional: swap this for real cron parsing:
    //   const parser = await import("cron-parser");
    //   const interval = parser.parseExpression(rec.slice(5), { currentDate: cur });
    //   return interval.next().toDate().toISOString();
    cur.setUTCMinutes(cur.getUTCMinutes() + 5);
    return cur.toISOString();
  }

  // default daily
  cur.setUTCDate(cur.getUTCDate() + 1);
  return cur.toISOString();
}
