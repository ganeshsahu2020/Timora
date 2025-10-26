// src/lib/apiBase.ts
// Prefer relative "/api" so Netlify Dev (8888) & Netlify prod handle redirects.
// If you *really* need to override, define VITE_API_BASE, else keep "".
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.trim() || "";
