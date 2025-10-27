import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import aiRoutes from "./ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5164;

app.use(express.json());

// allow vite (5161) and netlify dev (8888)
const ALLOW = new Set([
  "http://localhost:5161",
  "http://localhost:8888",
]);
app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOW.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
}));

app.use("/api/ai", aiRoutes);

app.get("/api/ai/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.get("/api/ai/debug", (_req, res) => {
  const key = process.env.OPENAI_API_KEY || "";
  res.json({ ok: true, port: PORT, keyPresent: !!key, keyPrefix: key ? key.slice(0, 8) : null });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
