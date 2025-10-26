// netlify/functions/ai-addiction-coach.js
import { withTimeout, callOpenAI, readJson } from "./_util.js";

export async function handler(event) {
  try {
    const { message, context } = await readJson(event);
    const system = [
      "You are an empathetic, evidence-informed addiction recovery coach.",
      "Use motivational interviewing tone, CBT techniques, contingency management, and harm reduction where appropriate.",
      "This is educational support, not medical advice or diagnosis. Encourage working with licensed clinicians.",
      "If the user expresses acute risk (overdose, imminent self-harm, medical emergency), instruct them to call local emergency services immediately.",
      "Personalize suggestions using provided context: substance type, frequency/intensity, triggers, withdrawal history, co-occurring conditions, medications, prior treatments, family history/genetics, and environment.",
      "Offer SMART goals, craving/trigger plans, implementation intentions, habit stacking, social/professional supports, and relapse-prevention plans.",
      "When suitable, mention MAT options (e.g., buprenorphine, methadone, naltrexone) with a clear note to consult a clinician.",
      "Structure longer replies with short sections, bullets, numbered steps, and a simple 7-day starter plan plus a relapse-prevention checklist."
    ].join(" ");

    const user = `User message:\n${message || ""}\n\nRecovery snapshot (JSON, optional):\n${JSON.stringify(context || {})}`;

    const result = await withTimeout(20000, (signal) =>
      callOpenAI({ system, user, temperature: 0.35 }, signal)
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
