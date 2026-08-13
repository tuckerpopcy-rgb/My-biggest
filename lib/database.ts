import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Post,
  Listing,
  Conversation,
  Message,
  AppNotification,
  QuizResult,
  Follow,
  AppSettings,
  DeveloperProfile,
  Session,
  SavedItem,
  CloudVideo,
  StudyApplication,
  ClassPayment,
  LessonTurn,
  PointRules,
} from './types';
import { readFlags, readSession, writeFlags, writeSession } from './session';

const KEY = 'snwy.db.v2';
const LEGACY = 'snwy.db.v1';

export interface Database {
  users: User[];
  posts: Post[];
  listings: Listing[];
  conversations: Conversation[];
  messages: Message[];
  notifications: AppNotification[];
  quizResults: QuizResult[];
  follows: Follow[];
  saved: SavedItem[];
  videos: CloudVideo[];
  applications: StudyApplication[];
  payments: ClassPayment[];
  lessons: LessonTurn[];
  settings: AppSettings;
  developer: DeveloperProfile;
  session: Session | null;
  tutorialSeen: boolean;
  pointRules: PointRules;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  accent: 'flag',
  language: 'en',
  haptics: true,
  clickSounds: true,
  notifications: true,
  glow: true,
  uiScale: 'normal',
  fitMode: 'phone',
};

export const DEFAULT_POINT_RULES: PointRules = {
  like: 5,
  comment: 10,
  follow: 15,
  post: 20,
  video: 30,
  cap: 2500,
  enabled: true,
};

export const DEFAULT_DEVELOPER: DeveloperProfile = {
  name: 'Henry Tucker',
  title: 'Founder & Builder of Salone Na We Yon',
  bio: 'Henry Tucker is a Sierra Leonean builder creating digital homes for our people. Salone Na We Yon is his living work: a social square, a market, a newsroom and a classroom in one. He designs for Krio, Mende, Temne and every tribe that calls this land home.',
  image: null,
  email: 'henry.tucker@salonenaweyon.sl',
  location: 'Freetown, Sierra Leone',
  updatedAt: Date.now(),
};

function hydrateUser(u: Partial<User> & { id: string; username: string; email: string }): User {
  const merged: User = {
    id: u.id,
    username: u.username,
    email: u.email,
    passwordHash: u.passwordHash || '',
    displayName: u.displayName || u.username,
    bio: u.bio || '',
    avatar: u.avatar ?? null,
    coverImage: u.coverImage ?? null,
    introVideo: u.introVideo ?? null,
    location: u.location || 'Sierra Leone',
    tribe: u.tribe || '',
    language: u.language || 'en',
    createdAt: u.createdAt || Date.now(),
    isDeveloper: !!u.isDeveloper,
    isPremium: !!u.isPremium || !!u.isDeveloper,
    premiumUntil: u.premiumUntil ?? (u.isDeveloper ? Date.now() + 1000 * 60 * 60 * 24 * 365 * 10 : null),
    verified: !!u.verified || !!u.isDeveloper || !!u.isPremium,
    lastSeen: u.lastSeen || Date.now(),
    phone: u.phone || '',
    points: typeof u.points === 'number' ? u.points : 0,
  };
  return merged;
}

function hydratePost(p: Partial<Post> & { id: string; userId: string }): Post {
  return {
    id: p.id,
    userId: p.userId,
    content: p.content || '',
    image: p.image ?? null,
    video: p.video ?? null,
    mediaPath: p.mediaPath ?? null,
    likes: p.likes || [],
    comments: p.comments || [],
    createdAt: p.createdAt || Date.now(),
    updatedAt: p.updatedAt || p.createdAt || Date.now(),
    boosted: !!p.boosted,
  };
}

function hydrateListing(l: Partial<Listing> & { id: string; userId: string; title: string }): Listing {
  return {
    id: l.id,
    userId: l.userId,
    title: l.title,
    description: l.description || '',
    price: l.price || 0,
    currency: l.currency || 'SLE',
    category: l.category || 'other',
    image: l.image ?? null,
    location: l.location || 'Sierra Leone',
    status: l.status || 'available',
    createdAt: l.createdAt || Date.now(),
    updatedAt: l.updatedAt || l.createdAt || Date.now(),
    boosted: !!l.boosted,
  };
}

function empty(): Database {
  return {
    users: [],
    posts: [],
    listings: [],
    conversations: [],
    messages: [],
    notifications: [],
    quizResults: [],
    follows: [],
    saved: [],
    videos: [],
    applications: [],
    payments: [],
    lessons: [],
    settings: { ...DEFAULT_SETTINGS },
    developer: { ...DEFAULT_DEVELOPER },
    session: null,
    tutorialSeen: false,
    pointRules: { ...DEFAULT_POINT_RULES },
  };
}

let memory: Database = empty();
let ready = false;
const listeners = new Set<() => void>();
let afterWrite: (() => void) | null = null;

export function onDatabaseWrite(fn: () => void) {
  afterWrite = fn;
}

export function snapshot(): Database {
  return {
    ...memory,
    users: memory.users.slice(),
    posts: memory.posts.slice(),
    listings: memory.listings.slice(),
    conversations: memory.conversations.slice(),
    messages: memory.messages.slice(),
    notifications: memory.notifications.slice(),
    quizResults: memory.quizResults.slice(),
    follows: memory.follows.slice(),
    saved: memory.saved.slice(),
    videos: memory.videos.slice(),
    applications: memory.applications.slice(),
    payments: memory.payments.slice(),
    lessons: memory.lessons.slice(),
    settings: { ...memory.settings },
    developer: { ...memory.developer },
    session: memory.session ? { ...memory.session } : null,
    pointRules: { ...DEFAULT_POINT_RULES, ...(memory.pointRules || {}) },
  };
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

function normalize(parsed: Partial<Database>): Database {
  const base = empty();
  return {
    ...base,
    ...parsed,
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    developer: { ...DEFAULT_DEVELOPER, ...(parsed.developer || {}) },
    users: (parsed.users || []).map((u) => hydrateUser(u)),
    posts: (parsed.posts || []).map((p) => hydratePost(p)),
    listings: (parsed.listings || []).map((l) => hydrateListing(l)),
    conversations: parsed.conversations || [],
    messages: (parsed.messages || []).map((m) => ({ ...m, media: m.media ?? null })),
    notifications: parsed.notifications || [],
    quizResults: parsed.quizResults || [],
    follows: parsed.follows || [],
    saved: parsed.saved || [],
    videos: parsed.videos || [],
    applications: parsed.applications || [],
    payments: parsed.payments || [],
    lessons: parsed.lessons || [],
    session: parsed.session || null,
    tutorialSeen: !!parsed.tutorialSeen,
    pointRules: { ...DEFAULT_POINT_RULES, ...(parsed.pointRules || {}) },
  };
}

export async function initDB(): Promise<Database> {
  if (ready) return memory;
  try {
    let raw = await AsyncStorage.getItem(KEY);
    if (!raw) raw = await AsyncStorage.getItem(LEGACY);
    if (raw) {
      memory = normalize(JSON.parse(raw) as Database);
    } else {
      memory = empty();
    }
    const locked = await readSession();
    const flags = await readFlags();
    if (locked && locked.userId && memory.users.some((u) => u.id === locked.userId)) {
      memory.session = locked;
    } else {
      memory.session = null;
    }
    if (flags.tutorialSeen || memory.tutorialSeen) {
      memory.tutorialSeen = true;
    }
    await persist();
  } catch {
    memory = empty();
    try {
      const locked = await readSession();
      if (locked) memory.session = locked;
    } catch {
      /* ignore */
    }
  }
  ready = true;
  return memory;
}

async function persist() {
  const liveSession = memory.session;
  try {
    const payload = { ...memory, session: liveSession };
    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* storage full — keep memory */
  }
  try {
    await writeSession(memory.session);
    await writeFlags({ tutorialSeen: memory.tutorialSeen });
  } catch {
    /* session vault is best-effort */
  }
}

export async function clearSessionOnly(): Promise<void> {
  memory.session = null;
  await writeSession(null);
  await persist();
  emit();
}

export function getDB(): Database {
  return memory;
}

export async function mutate(updater: (db: Database) => void): Promise<Database> {
  updater(memory);
  emit();
  try {
    await persist();
  } catch {
    emit();
  }
  try {
    afterWrite?.();
  } catch {
    /* ignore live fan-out errors */
  }
  return memory;
}

export async function replaceDB(next: Database): Promise<void> {
  memory = next;
  await persist();
  emit();
}
