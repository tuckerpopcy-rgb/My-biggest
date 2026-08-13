import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDB_NAME = 'snwy-media-vault';
const STORE = 'files';
const META_KEY = 'snwy.media.meta.v1';

const playCache = new Map<string, string>();

export function isVaultRef(uri?: string | null): boolean {
  return !!uri && uri.startsWith('vault:');
}

export function isPlayableUri(uri?: string | null): boolean {
  if (!uri) return false;
  return (
    uri.startsWith('blob:') ||
    uri.startsWith('data:') ||
    uri.startsWith('file:') ||
    uri.startsWith('content:') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('ph://')
  );
}

function newId(kind: string) {
  return `vault:${kind}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(id: string, blob: Blob): Promise<boolean> {
  const db = await openIdb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(blob, id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbGet(id: string): Promise<Blob | null> {
  const db = await openIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readBlob(uri: string): Promise<Blob | null> {
  try {
    if (uri.startsWith('data:')) {
      const comma = uri.indexOf(',');
      const meta = uri.slice(5, comma);
      const mime = meta.split(';')[0] || 'application/octet-stream';
      const b64 = uri.slice(comma + 1);
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    const res = await fetch(uri);
    return await res.blob();
  } catch {
    return null;
  }
}

async function rememberMeta(id: string, kind: string, mime: string) {
  try {
    const raw = await AsyncStorage.getItem(META_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, { kind: string; mime: string }>) : {};
    map[id] = { kind, mime };
    await AsyncStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export async function ingestMedia(uri: string, kind: 'video' | 'image' | 'avatar' | 'cover'): Promise<string> {
  if (!uri) return uri;
  if (isVaultRef(uri)) return uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const id = newId(kind);
  playCache.set(id, uri);

  const blob = await readBlob(uri);
  if (blob) {
    const stored = await idbPut(id, blob);
    if (stored && typeof URL !== 'undefined' && URL.createObjectURL) {
      const obj = URL.createObjectURL(blob);
      playCache.set(id, obj);
    }
    await rememberMeta(id, kind, blob.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg'));
  } else if (Platform.OS !== 'web') {
    playCache.set(id, uri);
    await rememberMeta(id, kind, kind === 'video' ? 'video/mp4' : 'image/jpeg');
    try {
      const raw = await AsyncStorage.getItem(META_KEY + '.native');
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      map[id] = uri;
      await AsyncStorage.setItem(META_KEY + '.native', JSON.stringify(map));
    } catch {
      /* ignore */
    }
  }

  return id;
}

export async function playableUrl(ref?: string | null): Promise<string> {
  if (!ref) return '';
  if (playCache.has(ref)) return playCache.get(ref) as string;
  if (isPlayableUri(ref)) return ref;
  if (!isVaultRef(ref)) return ref;

  const blob = await idbGet(ref);
  if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
    const obj = URL.createObjectURL(blob);
    playCache.set(ref, obj);
    return obj;
  }

  try {
    const raw = await AsyncStorage.getItem(META_KEY + '.native');
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    if (map[ref]) {
      playCache.set(ref, map[ref]);
      return map[ref];
    }
  } catch {
    /* ignore */
  }

  return '';
}

export function peekPlayable(ref?: string | null): string {
  if (!ref) return '';
  if (playCache.has(ref)) return playCache.get(ref) as string;
  if (isPlayableUri(ref)) return ref;
  return '';
}
