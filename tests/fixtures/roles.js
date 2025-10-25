export function roleFromMetadata(meta) {
  if (!meta) return 'guest';
  return meta.role || 'user';
}
