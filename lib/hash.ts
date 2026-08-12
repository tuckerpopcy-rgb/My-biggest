export function hashPassword(password: string): string {
  const salt = 'SNWY-HT-1961-SALONE-NA-WE-YON';
  const str = `${salt}::${password}::${salt}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= str.charCodeAt(str.length - 1 - i);
    h2 = Math.imul(h2, 16777619);
  }
  const a = (h1 >>> 0).toString(16).padStart(8, '0');
  const b = (h2 >>> 0).toString(16).padStart(8, '0');
  let h3 = 2166136261;
  const mix = a + password.length + b;
  for (let i = 0; i < mix.length; i++) {
    h3 ^= mix.charCodeAt(i);
    h3 = Math.imul(h3, 16777619);
  }
  return `snwy$${a}${b}${(h3 >>> 0).toString(16).padStart(8, '0')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  return hashPassword(password) === stored;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function now(): number {
  return Date.now();
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(d / 365)}y`;
}
