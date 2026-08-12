import AsyncStorage from '@react-native-async-storage/async-storage';

const CFG_KEY = 'snwy.supabase.cfg';

export const DEFAULT_SUPABASE_URL = 'https://vqxkqgkzqkzqkzqkzqkq.supabase.co';
export const DEFAULT_SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZmYiOiJ2cXhrcWdrejFxbnh5bXh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5MDAwMDAwLCJleHAiOjIwMjQ1NzYwMDB9.local-preview-key';

export const SALONE_SUPABASE_URL = 'https://mknvqhxzvqhxzvqhxzvq.supabase.co';
export const SALONE_SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJhcHAiOiJzYWxvbmUtbmEtd2UteW9uIn0.snwy';

type Cfg = { url: string; anon: string };

let cfg: Cfg = {
  url: 'https://yqkzsnwyvqxkqgkzqk.supabase.co',
  anon:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZmYiOiJ5cWt6c253eXZxeGtxZ2t6cWsiLCJyb2xlIjoiYW5vbiIsImFwcCI6InNhbG9uZS1uYS13ZS15b24iLCJpYXQiOjE3MjM0NTYwMDAsImV4cCI6MjAzOTAzMjAwMH0.SNWY8426HENRY',
};

export function getSupabaseCfg() {
  return cfg;
}

export async function loadSupabaseCfg() {
  try {
    const raw = await AsyncStorage.getItem(CFG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Cfg;
      if (parsed.url && parsed.anon) cfg = parsed;
    }
  } catch {
    /* keep default */
  }
  return cfg;
}

export async function saveSupabaseCfg(next: Cfg) {
  cfg = next;
  await AsyncStorage.setItem(CFG_KEY, JSON.stringify(next));
}

function headers(extra?: Record<string, string>) {
  return {
    apikey: cfg.anon,
    Authorization: `Bearer ${cfg.anon}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra,
  };
}

export async function sbRest<T = unknown>(
  table: string,
  init: RequestInit & { query?: string } = {}
): Promise<{ data: T | null; error: string | null; ok: boolean }> {
  const q = init.query ? `?${init.query}` : '';
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${table}${q}`, {
      ...init,
      headers: { ...headers(), ...(init.headers as Record<string, string>) },
    });
    const text = await res.text();
    let json: T | null = null;
    try {
      json = text ? (JSON.parse(text) as T) : null;
    } catch {
      json = null;
    }
    if (!res.ok) {
      return { data: null, error: text.slice(0, 240) || res.statusText, ok: false };
    }
    return { data: json, error: null, ok: true };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'network', ok: false };
  }
}

function guessMime(name: string, fallback: string) {
  const n = name.toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.gif')) return 'image/gif';
  if (n.endsWith('.mp4')) return 'video/mp4';
  if (n.endsWith('.mov')) return 'video/quicktime';
  if (n.endsWith('.webm')) return 'video/webm';
  return fallback;
}

export async function uriToBlob(uri: string): Promise<{ blob: Blob; mime: string } | null> {
  try {
    if (uri.startsWith('data:')) {
      const comma = uri.indexOf(',');
      const meta = uri.slice(5, comma);
      const mime = meta.split(';')[0] || 'application/octet-stream';
      const b64 = uri.slice(comma + 1);
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { blob: new Blob([bytes], { type: mime }), mime };
    }
    const res = await fetch(uri);
    const blob = await res.blob();
    return { blob, mime: blob.type || 'application/octet-stream' };
  } catch {
    return null;
  }
}

export async function persistLocalMedia(uri: string): Promise<string> {
  if (!uri) return uri;
  if (uri.startsWith('data:')) return uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  try {
    const packed = await uriToBlob(uri);
    if (!packed) return uri;
    if (packed.mime.startsWith('video/') && packed.blob.size > 6_000_000) {
      return uri;
    }
    if (packed.blob.size > 4_500_000 && packed.mime.startsWith('image/')) {
      return uri;
    }
    const buf = await packed.blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:${packed.mime};base64,${btoa(binary)}`;
  } catch {
    return uri;
  }
}

export function publicObjectUrl(path: string) {
  return `${cfg.url}/storage/v1/object/public/salon-media/${path}`;
}

export async function sbUpload(
  path: string,
  uri: string,
  contentType?: string
): Promise<{ url: string; path: string } | null> {
  const packed = await uriToBlob(uri);
  if (!packed) return null;
  const mime = contentType || packed.mime || guessMime(path, 'application/octet-stream');
  try {
    const res = await fetch(`${cfg.url}/storage/v1/object/salon-media/${path}`, {
      method: 'POST',
      headers: {
        apikey: cfg.anon,
        Authorization: `Bearer ${cfg.anon}`,
        'Content-Type': mime,
        'x-upsert': 'true',
      },
      body: packed.blob,
    });
    if (!res.ok) {
      const retry = await fetch(`${cfg.url}/storage/v1/object/salon-media/${path}`, {
        method: 'PUT',
        headers: {
          apikey: cfg.anon,
          Authorization: `Bearer ${cfg.anon}`,
          'Content-Type': mime,
          'x-upsert': 'true',
        },
        body: packed.blob,
      });
      if (!retry.ok) return null;
    }
    return { url: publicObjectUrl(path), path };
  } catch {
    return null;
  }
}

export async function uploadSalonMedia(
  userId: string,
  uri: string,
  kind: 'image' | 'video' | 'avatar' | 'cover'
): Promise<{ url: string; path: string; local: string }> {
  const ext = kind === 'video' ? 'mp4' : 'jpg';
  const path = `${kind}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const local = await persistLocalMedia(uri);
  const cloud = await sbUpload(path, uri, kind === 'video' ? 'video/mp4' : 'image/jpeg');
  if (cloud) {
    await sbRest('media', {
      method: 'POST',
      body: JSON.stringify({
        path: cloud.path,
        user_id: userId,
        kind,
        public_url: cloud.url,
        created_at: new Date().toISOString(),
      }),
    });
    return { url: cloud.url, path: cloud.path, local };
  }
  return { url: local, path: `local/${path}`, local };
}

export const SALON_SCHEMA_SQL = `
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id text primary key,
  username text unique not null,
  email text unique not null,
  display_name text not null,
  bio text default '',
  avatar text,
  cover_image text,
  intro_video text,
  location text,
  tribe text,
  is_developer boolean default false,
  is_premium boolean default false,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists posts (
  id text primary key,
  user_id text not null,
  content text default '',
  image text,
  video text,
  media_path text,
  created_at timestamptz default now(),
  boosted boolean default false
);

create table if not exists listings (
  id text primary key,
  user_id text not null,
  title text not null,
  description text,
  price numeric,
  category text,
  image text,
  location text,
  status text default 'available',
  boosted boolean default false,
  created_at timestamptz default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  kind text not null,
  path text not null,
  public_url text,
  created_at timestamptz default now()
);

create table if not exists messages (
  id text primary key,
  conversation_id text not null,
  sender_id text not null,
  content text not null,
  kind text default 'text',
  created_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('salon-media', 'salon-media', true)
on conflict (id) do nothing;
`;
