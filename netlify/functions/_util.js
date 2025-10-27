// netlify/functions/_util.js
// ───────────────────────────────────────────────────────────
// Shared helpers for all AI functions (Netlify Functions)
// ───────────────────────────────────────────────────────────

/**
 * Run an async task with an AbortController-based timeout.
 * Your function code should pass the provided `signal` to fetch/OpenAI.
 */
export async function withTimeout(ms, run) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await run(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Call OpenAI Chat Completions API with sensible, fast defaults.
 * - Reads API key from env: OPENAI_API_KEY
 * - Model priority: opts.model → OPENAI_DEFAULT_MODEL → "gpt-4o-mini"
 */
export async function callOpenAI(
  { system, user, temperature = 0.35, model },
  signal
) {
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) {
    return {
      ok: false,
      status: 500,
      json: {
        error: "missing_api_key",
        detail:
          "Set OPENAI_API_KEY in your Netlify environment variables (Site settings → Environment variables).",
      },
    };
  }

  const chosenModel =
    model || process.env.OPENAI_DEFAULT_MODEL || "gpt-4o-mini";

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: chosenModel,
      temperature,
      messages: [
        { role: "system", content: String(system ?? "") },
        { role: "user", content: String(user ?? "") },
      ],
    }),
    signal,
  });

  if (!resp.ok) {
    // Try to return OpenAI’s error body for easier debugging
    let detail = "";
    try {
      detail = await resp.text();
    } catch {
      /* noop */
    }
    return {
      ok: false,
      status: 502,
      json: {
        error: "openai_error",
        status: resp.status,
        detail,
      },
    };
  }

  const data = await resp.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content ?? "No reply.";
  return { ok: true, status: 200, json: { reply: content } };
}

/**
 * Safely parse JSON body from a Netlify Function event.
 * Returns {} if body is empty/invalid.
 */
export async function readJson(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}
