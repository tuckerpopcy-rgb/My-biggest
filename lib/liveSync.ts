import { Database, getDB, mutate } from './database';
import { isPlayableUri } from './mediaVault';
import {
  ClassPayment,
  CloudVideo,
  Conversation,
  Follow,
  LessonTurn,
  Listing,
  Message,
  Post,
  SavedItem,
  StudyApplication,
  User,
} from './types';

const CHANNEL = 'snwy.live.v4';
const BUS_KEY = 'snwy.live.bus.v4';
const SNAP_DB = 'snwy-live-snap';
const SNAP_STORE = 'snap';

type PublicUser = Omit<User, 'passwordHash'>;

export interface LivePayload {
  rev: number;
  updatedAt: number;
  users: PublicUser[];
  posts: Post[];
  listings: Listing[];
  conversations: Conversation[];
  messages: Message[];
  follows: Follow[];
  saved: SavedItem[];
  videos: CloudVideo[];
  applications: StudyApplication[];
  payments: ClassPayment[];
  lessons: LessonTurn[];
}

let channel: BroadcastChannel | null = null;
let pushing = false;
let lastPush = 0;
let started = false;
const listeners: Array<(p: LivePayload) => void> = [];

function openSnap(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(SNAP_DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(SNAP_STORE)) {
          req.result.createObjectStore(SNAP_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function strip(u: User): PublicUser {
  const { passwordHash: _pw, ...rest } = u;
  return rest;
}

export function packLive(db: Database): LivePayload {
  return {
    rev: Date.now(),
    updatedAt: Date.now(),
    users: db.users.map(strip),
    posts: db.posts,
    listings: db.listings,
    conversations: db.conversations,
    messages: db.messages,
    follows: db.follows,
    saved: db.saved,
    videos: db.videos,
    applications: db.applications,
    payments: db.payments,
    lessons: db.lessons,
  };
}

export function mergeLive(local: Database, remote: LivePayload): boolean {
  let changed = false;

  const keepMedia = <T extends Record<string, unknown>>(local: T, remote: T): T => {
    const next = { ...local, ...remote };
    (['image', 'video', 'media', 'avatar', 'coverImage', 'introVideo', 'publicUrl'] as const).forEach((k) => {
      const lv = local[k];
      const rv = remote[k];
      if (typeof lv === 'string' && isPlayableUri(lv) && typeof rv === 'string' && !isPlayableUri(rv)) {
        (next as Record<string, unknown>)[k] = lv;
      }
    });
    return next;
  };

  const mergeById = <T extends { id: string }>(mine: T[], theirs: T[], stamp: (x: T) => number) => {
    const map = new Map(mine.map((x) => [x.id, x]));
    theirs.forEach((item) => {
      const cur = map.get(item.id);
      if (!cur) {
        map.set(item.id, item);
        changed = true;
      } else if (stamp(item) >= stamp(cur)) {
        map.set(item.id, keepMedia(cur as T & Record<string, unknown>, item as T & Record<string, unknown>) as T);
        changed = true;
      }
    });
    return Array.from(map.values());
  };

  local.posts = mergeById(local.posts, remote.posts || [], (p) => p.updatedAt || p.createdAt);
  local.listings = mergeById(local.listings, remote.listings || [], (l) => l.updatedAt || l.createdAt);
  local.conversations = mergeById(local.conversations, remote.conversations || [], (c) => c.lastMessageAt);
  local.messages = mergeById(local.messages, remote.messages || [], (m) => m.updatedAt || m.createdAt);
  local.videos = mergeById(local.videos, remote.videos || [], (v) => v.createdAt);
  local.applications = mergeById(local.applications, remote.applications || [], (a) => a.updatedAt || a.createdAt);
  local.payments = mergeById(local.payments, remote.payments || [], (p) => p.createdAt);
  local.lessons = mergeById(local.lessons, remote.lessons || [], (l) => l.createdAt);

  const users = new Map(local.users.map((u) => [u.id, u]));
  (remote.users || []).forEach((ru) => {
    const cur = users.get(ru.id);
    if (!cur) {
      users.set(ru.id, { ...ru, passwordHash: '' } as User);
      changed = true;
    } else {
      const nextLast = ru.lastSeen || 0;
      if (nextLast > (cur.lastSeen || 0) || (ru.avatar && ru.avatar !== cur.avatar)) {
        Object.assign(cur, ru, { passwordHash: cur.passwordHash || '' });
        changed = true;
      }
    }
  });
  local.users = Array.from(users.values());

  const fkey = (f: Follow) => `${f.followerId}:${f.followingId}`;
  const fmap = new Map(local.follows.map((f) => [fkey(f), f]));
  (remote.follows || []).forEach((f) => {
    if (!fmap.has(fkey(f))) {
      fmap.set(fkey(f), f);
      changed = true;
    }
  });
  local.follows = Array.from(fmap.values());

  return changed;
}

function notify(p: LivePayload) {
  listeners.forEach((fn) => {
    try {
      fn(p);
    } catch {
      /* ignore */
    }
  });
}

async function pullCloud() {
  const dbx = await openSnap();
  if (!dbx) return;
  try {
    const remote = await new Promise<LivePayload | null>((resolve) => {
      const tx = dbx.transaction(SNAP_STORE, 'readonly');
      const req = tx.objectStore(SNAP_STORE).get('live');
      req.onsuccess = () => resolve((req.result as LivePayload) || null);
      req.onerror = () => resolve(null);
    });
    if (!remote || !remote.updatedAt) return;
    let changed = false;
    await mutate((d) => {
      changed = mergeLive(d, remote);
    });
    if (changed) notify(remote);
  } catch {
    /* ignore */
  }
}

async function pushCloud() {
  if (pushing) return;
  const t0 = Date.now();
  if (t0 - lastPush < 250) return;
  lastPush = t0;
  const dbx = await openSnap();
  if (!dbx) return;
  pushing = true;
  try {
    const payload = packLive(getDB());
    await new Promise<void>((resolve) => {
      const tx = dbx.transaction(SNAP_STORE, 'readwrite');
      tx.objectStore(SNAP_STORE).put(payload, 'live');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* ignore */
  } finally {
    pushing = false;
  }
}

export function publishLive() {
  const payload = packLive(getDB());
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      if (!channel) channel = new BroadcastChannel(CHANNEL);
      channel.postMessage(payload);
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(BUS_KEY, JSON.stringify({ t: Date.now(), rev: payload.rev }));
  } catch {
    /* ignore */
  }
  void pushCloud();
}

export function startLiveSync(onRemote: (p: LivePayload) => void) {
  if (started) {
    listeners.push(onRemote);
    return () => {
      const i = listeners.indexOf(onRemote);
      if (i >= 0) listeners.splice(i, 1);
    };
  }
  started = true;
  listeners.push(onRemote);

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (ev) => {
        const remote = ev.data as LivePayload;
        if (!remote?.updatedAt) return;
        let changed = false;
        void mutate((d) => {
          changed = mergeLive(d, remote);
        }).then(() => {
          if (changed) notify(remote);
        });
      };
    }
  } catch {
    /* ignore */
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === BUS_KEY && e.newValue) void pullCloud();
    });
  }

  void pullCloud();
  const poll = setInterval(() => {
    void pullCloud();
  }, 2500);

  return () => {
    clearInterval(poll);
    const i = listeners.indexOf(onRemote);
    if (i >= 0) listeners.splice(i, 1);
  };
}
