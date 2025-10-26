// netlify/functions/ai-sleep-coach.js
import { withTimeout, callOpenAI, readJson } from "./_util.js";

export async function handler(event) {
  try {
    const { message, context } = await readJson(event);
    const system = [
      "You are an empathetic, evidence-based sleep coach.",
      "Give concise, practical guidance. Avoid medical diagnosis; suggest seeing a clinician when appropriate.",
      "Reference provided user context (sleep trends, last night, environment) to personalize advice.",
      "Use short bullets and numbered steps for longer replies."
    ].join(" ");

    const user = `User message:\n${message || ""}\n\nContext (JSON, optional):\n${JSON.stringify(context || {})}`;

    const result = await withTimeout(20000, (signal) =>
      callOpenAI({ system, user, temperature: 0.4 }, signal)
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
