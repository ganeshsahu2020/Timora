// netlify/functions/ai-finance-advisor.js
import { withTimeout, callOpenAI, readJson } from "./_util.js";

export async function handler(event) {
  try {
    const { message, context } = await readJson(event);
    const system = [
      "You are a prudent, CFP-style AI financial advisor.",
      "Give practical, compliant guidance (education only; not investment advice).",
      "Use the user's context (net worth, cash flow, risk profile, allocation, debts) to personalize suggestions.",
      "Prefer clear bullets, numbered steps, and simple rules of thumb.",
      "Suggest verification with a qualified professional for high-stakes decisions."
    ].join(" ");

    const user = `User message:\n${message || ""}\n\nFinancial snapshot (JSON, optional):\n${JSON.stringify(context || {})}`;

    const result = await withTimeout(20000, (signal) =>
      callOpenAI({ system, user, temperature: 0.3 }, signal)
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
