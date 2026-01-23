/**
 * Single source of truth for profile ring colors.
 * EXACTLY 5 options - validated on both client and server.
 * Each color has: base, glow, shine (bright highlight), shadow (dark depth)
 */
export const RING_COLORS = [
  { key: 'gold', label: 'Gold', className: 'ring-gold', base: '#f59e0b', glow: '#ffd08a', shine: '#fff7e0', shadow: '#b45309' },
  { key: 'sky', label: 'Sky', className: 'ring-sky', base: '#00d9ff', glow: '#6bfff2', shine: '#e0ffff', shadow: '#0891b2' },
  { key: 'mint', label: 'Mint', className: 'ring-mint', base: '#22c55e', glow: '#8cffb2', shine: '#dcfce7', shadow: '#15803d' },
  { key: 'violet', label: 'Violet', className: 'ring-violet', base: '#a855f7', glow: '#d7b3ff', shine: '#f3e8ff', shadow: '#7c3aed' },
  { key: 'slate', label: 'Slate', className: 'ring-slate', base: '#94a3b8', glow: '#e2e8f0', shine: '#f8fafc', shadow: '#475569' },
] as const;

export type RingColorKey = typeof RING_COLORS[number]['key'];

/** Array of allowed ring color keys for validation */
export const ALLOWED_RING_COLOR_KEYS: readonly RingColorKey[] = RING_COLORS.map(c => c.key);

/** Type guard to check if a string is a valid RingColorKey */
export function isValidRingColorKey(key: unknown): key is RingColorKey {
  return typeof key === 'string' && ALLOWED_RING_COLOR_KEYS.includes(key as RingColorKey);
}

export function getRingColorByKey(key?: string | null) {
  if (!key) return null;
  return RING_COLORS.find((color) => color.key === key) || null;
}

export function getDefaultRingColor(seed: string) {
  if (!seed) return RING_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  const index = Math.abs(hash) % RING_COLORS.length;
  return RING_COLORS[index];
}

export function resolveRingColor(key: string | null | undefined, seed: string) {
  return getRingColorByKey(key) || getDefaultRingColor(seed);
}
