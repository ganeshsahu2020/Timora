// src/shims/es-toolkit-compat-get.js
// Minimal lodash-like get(obj, path, defaultValue)
// Supports dot and bracket paths: "a.b[0].c"
function toPath(p) {
  if (Array.isArray(p)) return p;
  return String(p)
    .replace(/\[(\w+)\]/g, '.$1') // [0] -> .0
    .replace(/^\./, '')           // leading dot
    .split('.');
}

export default function get(obj, path, defaultValue) {
  if (obj == null) return defaultValue;
  const parts = toPath(path);
  let cur = obj;
  for (const key of parts) {
    if (cur == null) return defaultValue;
    cur = cur[key];
  }
  return cur === undefined ? defaultValue : cur;
}
