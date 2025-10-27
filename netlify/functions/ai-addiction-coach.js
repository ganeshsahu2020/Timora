// netlify/functions/ai-addiction-coach.js
import { withTimeout, callOpenAI, readJson } from "./_util.js";

export async function handler(event) {
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS,GET",
    "access-control-allow-headers": "content-type,authorization",
  };

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }

  // Health check: GET /api/ai/addiction-coach?health=1
  if (event.httpMethod === "GET" && event.queryStringParameters?.health === "1") {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json", ...cors },
      body: JSON.stringify({ ok: true, function: "ai-addiction-coach" }),
    };
  }

  try {
    const { message, context } = await readJson(event);

    const system = [
      "You are an empathetic, evidence-informed addiction recovery coach.",
      "Use motivational interviewing tone, CBT techniques, contingency management, and harm reduction when appropriate.",
      "This is educational support, not medical advice. Encourage working with licensed clinicians.",
      "If the user expresses acute risk (overdose, imminent self-harm, medical emergency), instruct them to call local emergency services immediately.",
      "Personalize suggestions with substance type, frequency, triggers, withdrawal history, co-occurring conditions, medications, prior treatments, and environment.",
      "Offer SMART goals, craving/trigger plans, implementation intentions, habit stacking, social/professional supports, and relapse-prevention steps.",
      "When suitable, mention MAT options (buprenorphine, methadone, naltrexone) with a note to consult a clinician.",
      "Use short sections, bullets, numbered steps, a simple 7-day starter plan, and a relapse-prevention checklist."
    ].join(" ");

    const user = `User message:\n${message || ""}\n\nRecovery snapshot (JSON, optional):\n${JSON.stringify(context || {})}`;

    // IMPORTANT: keep this safely under Netlify’s limit.
    // 8500ms + a little platform overhead avoids Function 504s.
    const result = await withTimeout(8500, (signal) =>
      callOpenAI(
        {
          system,
          user,
          temperature: 0.3,
          // If your callOpenAI helper supports a model param, this helps latency.
          // If not, it's ignored harmlessly.
          model: "gpt-4o-mini"
        },
        signal
      )
    );

    return {
      statusCode: result.status,
      headers: { "content-type": "application/json", ...cors },
      body: JSON.stringify(result.json),
    };
  } catch (e) {
    const isAbort = e?.name === "AbortError";
    return {
      statusCode: isAbort ? 504 : 500,
      headers: { "content-type": "application/json", ...cors },
      body: JSON.stringify({ error: isAbort ? "timeout" : "server_error", detail: String(e) }),
    };
  }
}
