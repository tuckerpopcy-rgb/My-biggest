import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Session } from './types';

export const SESSION_KEY = 'snwy.auth.session.v1';
export const USERS_KEY = 'snwy.users.permanent.v1';
export const FLAGS_KEY = 'snwy.flags.v1';

async function safeGet(key: string): Promise<string | null> {
  if (Platform.OS !== 'web') {
    try {
      const locked = await SecureStore.getItemAsync(key);
      if (locked) return locked;
    } catch {
      /* fall through */
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<boolean> {
  let ok = false;
  try {
    await AsyncStorage.setItem(key, value);
    ok = true;
  } catch {
    ok = false;
  }
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.setItemAsync(key, value);
      ok = true;
    } catch {
      /* ignore */
    }
  }
  return ok;
}

async function safeDel(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  }
}

export async function readSession(): Promise<Session | null> {
  const raw = await safeGet(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeSession(session: Session | null): Promise<void> {
  if (!session) {
    await safeDel(SESSION_KEY);
    return;
  }
  const ok = await safeSet(SESSION_KEY, JSON.stringify(session));
  if (!ok) {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* last resort — memory still holds it */
    }
  }
}

export async function readFlags(): Promise<{ tutorialSeen: boolean }> {
  try {
    const raw = await AsyncStorage.getItem(FLAGS_KEY);
    if (!raw) return { tutorialSeen: false };
    const parsed = JSON.parse(raw) as { tutorialSeen?: boolean };
    return { tutorialSeen: !!parsed.tutorialSeen };
  } catch {
    return { tutorialSeen: false };
  }
}

export async function writeFlags(flags: { tutorialSeen: boolean }): Promise<void> {
  try {
    await AsyncStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
  } catch {
    /* ignore */
  }
}
