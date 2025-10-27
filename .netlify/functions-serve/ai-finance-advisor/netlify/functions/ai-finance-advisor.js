var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/ai-finance-advisor.js
var ai_finance_advisor_exports = {};
__export(ai_finance_advisor_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(ai_finance_advisor_exports);

// netlify/functions/_util.js
async function withTimeout(ms, run) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await run(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}
async function callOpenAI({ system, user, temperature = 0.35, model = "gpt-4o-mini" }, signal) {
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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
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
async function readJson(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}

// netlify/functions/ai-finance-advisor.js
async function handler(event) {
  try {
    const { message, context } = await readJson(event);
    const system = [
      "You are a prudent, CFP-style AI financial advisor.",
      "Give practical, compliant guidance (education only; not investment advice).",
      "Use the user's context (net worth, cash flow, risk profile, allocation, debts) to personalize suggestions.",
      "Prefer clear bullets, numbered steps, and simple rules of thumb.",
      "Suggest verification with a qualified professional for high-stakes decisions."
    ].join(" ");
    const user = `User message:
${message || ""}

Financial snapshot (JSON, optional):
${JSON.stringify(context || {})}`;
    const result = await withTimeout(
      2e4,
      (signal) => callOpenAI({ system, user, temperature: 0.3 }, signal)
    );
    return {
      statusCode: result.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.json)
    };
  } catch (e) {
    const isAbort = e?.name === "AbortError";
    return {
      statusCode: isAbort ? 504 : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: isAbort ? "timeout" : "server_error", detail: String(e) })
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=ai-finance-advisor.js.map
