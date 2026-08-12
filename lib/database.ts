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
} from './types';

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
  settings: AppSettings;
  developer: DeveloperProfile;
  session: Session | null;
  tutorialSeen: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  accent: 'flag',
  language: 'en',
  haptics: true,
  clickSounds: true,
  notifications: true,
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
    settings: { ...DEFAULT_SETTINGS },
    developer: { ...DEFAULT_DEVELOPER },
    session: null,
    tutorialSeen: false,
  };
}

let memory: Database = empty();
let ready = false;
const listeners = new Set<() => void>();

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
    messages: parsed.messages || [],
    notifications: parsed.notifications || [],
    quizResults: parsed.quizResults || [],
    follows: parsed.follows || [],
    saved: parsed.saved || [],
    videos: parsed.videos || [],
    session: parsed.session || null,
    tutorialSeen: !!parsed.tutorialSeen,
  };
}

export async function initDB(): Promise<Database> {
  if (ready) return memory;
  try {
    let raw = await AsyncStorage.getItem(KEY);
    if (!raw) raw = await AsyncStorage.getItem(LEGACY);
    if (raw) {
      memory = normalize(JSON.parse(raw) as Database);
      await persist();
    } else {
      memory = empty();
      await persist();
    }
  } catch {
    memory = empty();
  }
  ready = true;
  return memory;
}

async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* storage full — keep memory */
  }
}

export function getDB(): Database {
  return memory;
}

export async function mutate(updater: (db: Database) => void): Promise<Database> {
  updater(memory);
  await persist();
  emit();
  return memory;
}

export async function replaceDB(next: Database): Promise<void> {
  memory = next;
  await persist();
  emit();
}
