// Relative by default so Netlify Dev (http://localhost:8888) and production
// route /api/* to Netlify Functions via your netlify.toml redirects.
export const API_BASE = (import.meta.env?.VITE_API_BASE || '').trim();
