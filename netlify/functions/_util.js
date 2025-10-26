// Shared helpers for all AI functions

export async function withTimeout(ms, promise) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await promise(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

// Standard OpenAI call (Chat Completions)
export async function callOpenAI({ system, user, temperature = 0.35, model = "gpt-4o-mini" }, signal) {
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) {
    return {
      ok: false,
      status: 500,
      json: { error: "missing_api_key", detail: "Set OPENAI_API_KEY in Netlify env vars." }
    };
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    }),
    signal
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    return { ok: false, status: 502, json: { error: "openai_error", status: resp.status, detail: text } };
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "No reply.";
  return { ok: true, status: 200, json: { reply: content } };
}

// Simple JSON body reader (since we’re on Netlify functions)
export async function readJson(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}
