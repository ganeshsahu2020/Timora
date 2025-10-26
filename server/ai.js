// server/ai.js
import express from "express";
// If on Node < 18, also:  import fetch from "node-fetch";

const router = express.Router();

/** Fetch with timeout (AbortController) */
const fetchWithTimeout = (url, opts = {}, ms = 20000) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  const final = { ...opts, signal: ctrl.signal };
  return fetch(url, final).finally(() => clearTimeout(id));
};

const openAIEndpoint = "https://api.openai.com/v1/chat/completions";
const commonHeaders = {
  "Content-Type": "application/json",
};

// ----------------------- Sleep Coach -----------------------
router.post("/sleep-coach", async (req, res) => {
  try {
    const { message, context } = req.body || {};
    const sys = [
      "You are an empathetic, evidence-based sleep coach.",
      "Give concise, practical guidance. Avoid medical diagnosis; suggest seeing a clinician when appropriate.",
      "Reference provided user context (sleep trends, last night, environment) to personalize advice.",
      "Use short bullets and numbered steps for longer replies.",
    ].join(" ");

    const reply = await fetchWithTimeout(
      openAIEndpoint,
      {
        method: "POST",
        headers: {
          ...commonHeaders,
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content:
                `User message:\n${message || ""}\n\nContext (JSON, optional):\n` +
                JSON.stringify(context || {}),
            },
          ],
        }),
      },
      20000
    );

    if (!reply.ok) {
      const errText = await reply.text().catch(() => "");
      console.error("[OpenAI error /sleep-coach]", reply.status, errText);
      return res
        .status(502)
        .json({ error: "openai_error", status: reply.status, detail: errText });
    }

    const data = await reply.json();
    const text = data?.choices?.[0]?.message?.content || "No reply.";
    res.json({ reply: text });
  } catch (e) {
    const isAbort = e?.name === "AbortError";
    console.error("[Server error /sleep-coach]", isAbort ? "OpenAI timeout/abort" : e);
    res
      .status(isAbort ? 504 : 500)
      .json({ error: isAbort ? "timeout" : "server_error", detail: String(e) });
  }
});

// ------------------- Financial Advisor ---------------------
router.post("/finance-advisor", async (req, res) => {
  try {
    const { message, context } = req.body || {};
    const sys = [
      "You are a prudent, CFP-style AI financial advisor.",
      "Give practical, compliant guidance (education only; not investment advice).",
      "Use the user's context (net worth, cash flow, risk profile, allocation, debts) to personalize suggestions.",
      "Prefer clear bullets, numbered steps, and simple rules of thumb.",
      "Suggest verification with a qualified professional for high-stakes decisions.",
    ].join(" ");

    const reply = await fetchWithTimeout(
      openAIEndpoint,
      {
        method: "POST",
        headers: {
          ...commonHeaders,
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content:
                `User message:\n${message || ""}\n\nFinancial snapshot (JSON, optional):\n` +
                JSON.stringify(context || {}),
            },
          ],
        }),
      },
      20000
    );

    if (!reply.ok) {
      const errText = await reply.text().catch(() => "");
      console.error("[OpenAI error /finance-advisor]", reply.status, errText);
      return res
        .status(502)
        .json({ error: "openai_error", status: reply.status, detail: errText });
    }

    const data = await reply.json();
    const text = data?.choices?.[0]?.message?.content || "No reply.";
    res.json({ reply: text });
  } catch (e) {
    const isAbort = e?.name === "AbortError";
    console.error("[Server error /finance-advisor]", isAbort ? "OpenAI timeout/abort" : e);
    res
      .status(isAbort ? 504 : 500)
      .json({ error: isAbort ? "timeout" : "server_error", detail: String(e) });
  }
});

// ---------------------- Habits Coach -----------------------
router.post("/habits-coach", async (req, res) => {
  try {
    const { message, context } = req.body || {};
    const sys = [
      "You are an empathetic, science-based habits coach (Atomic Habits, BJ Fogg, WOOP).",
      "Give concise, practical steps using cues, cravings, responses, and rewards.",
      "Use implementation intentions (“If it’s 7am, then I will…”) and habit stacking.",
      "Reference the user's snapshot (habits, streaks, predictive schedule, correlations) when provided.",
      "Avoid medical or mental-health diagnoses; suggest seeking professional help if appropriate.",
      "Prefer short bullets and numbered steps for longer replies.",
    ].join(" ");

    const reply = await fetchWithTimeout(
      openAIEndpoint,
      {
        method: "POST",
        headers: {
          ...commonHeaders,
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.35,
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content:
                `User message:\n${message || ""}\n\nHabits snapshot (JSON, optional):\n` +
                JSON.stringify(context || {}),
            },
          ],
        }),
      },
      20000
    );

    if (!reply.ok) {
      const errText = await reply.text().catch(() => "");
      console.error("[OpenAI error /habits-coach]", reply.status, errText);
      return res
        .status(502)
        .json({ error: "openai_error", status: reply.status, detail: errText });
    }

    const data = await reply.json();
    const text = data?.choices?.[0]?.message?.content || "No reply.";
    res.json({ reply: text });
  } catch (e) {
    const isAbort = e?.name === "AbortError";
    console.error("[Server error /habits-coach]", isAbort ? "OpenAI timeout/abort" : e);
    res
      .status(isAbort ? 504 : 500)
      .json({ error: isAbort ? "timeout" : "server_error", detail: String(e) });
  }
});

// ------------------- Addiction Recovery Coach ---------------
router.post("/addiction-coach", async (req, res) => {
  try {
    const { message, context } = req.body || {};
    const sys = [
      "You are an empathetic, evidence-informed addiction recovery coach.",
      "Use motivational interviewing tone, CBT techniques, contingency management, and harm reduction where appropriate.",
      "This is educational support, not medical advice or diagnosis. Encourage working with licensed clinicians.",
      "If the user expresses acute risk (overdose, imminent self-harm, medical emergency), instruct them to call local emergency services immediately.",
      "Personalize suggestions using provided context: substance type, frequency/intensity, triggers, withdrawal history, co-occurring conditions, medications, prior treatments, family history/genetics, and environment.",
      "Offer SMART goals, craving/trigger plans, implementation intentions, habit stacking, social/professional supports, and relapse-prevention plans.",
      "When suitable, mention MAT options (e.g., buprenorphine, methadone, naltrexone) with a clear note to consult a clinician.",
      "Structure longer replies with short sections, bullets, numbered steps, and a simple 7-day starter plan plus a relapse-prevention checklist.",
    ].join(" ");

    const reply = await fetchWithTimeout(
      openAIEndpoint,
      {
        method: "POST",
        headers: {
          ...commonHeaders,
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.35,
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content:
                `User message:\n${message || ""}\n\nRecovery snapshot (JSON, optional):\n` +
                JSON.stringify(context || {}),
            },
          ],
        }),
      },
      20000
    );

    if (!reply.ok) {
      const errText = await reply.text().catch(() => "");
      console.error("[OpenAI error /addiction-coach]", reply.status, errText);
      return res
        .status(502)
        .json({ error: "openai_error", status: reply.status, detail: errText });
    }

    const data = await reply.json();
    const text = data?.choices?.[0]?.message?.content || "No reply.";
    res.json({ reply: text });
  } catch (e) {
    const isAbort = e?.name === "AbortError";
    console.error("[Server error /addiction-coach]", isAbort ? "OpenAI timeout/abort" : e);
    res
      .status(isAbort ? 504 : 500)
      .json({ error: isAbort ? "timeout" : "server_error", detail: String(e) });
  }
});

export default router;
