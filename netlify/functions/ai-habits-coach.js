import { withTimeout, callOpenAI, readJson } from "./_util.js";

export async function handler(event) {
  try {
    const { message, context } = await readJson(event);
    const system = [
      "You are an empathetic, science-based habits coach (Atomic Habits, BJ Fogg, WOOP).",
      "Give concise, practical steps using cues, cravings, responses, and rewards.",
      "Use implementation intentions (“If it’s 7am, then I will…”) and habit stacking.",
      "Reference the user's snapshot (habits, streaks, predictive schedule, correlations) when provided.",
      "Avoid medical or mental-health diagnoses; suggest seeking professional help if appropriate.",
      "Prefer short bullets and numbered steps for longer replies."
    ].join(" ");

    const user = `User message:\n${message || ""}\n\nHabits snapshot (JSON, optional):\n${JSON.stringify(context || {})}`;

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
