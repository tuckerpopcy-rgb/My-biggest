// ============================================================
// Salon na we yon - Global App Context
// Optimized for fast app launch
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authService } from './auth';
import { db } from './database';
import { getTheme } from './themes';
import type { User, AppSettings, Theme } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@salon_settings';
const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'sierra_leone',
  uiScale: 1.0,
  fontScale: 1.0,
  reducedMotion: false,
  hapticsEnabled: true,
  notificationsEnabled: true,
  soundEnabled: true,
};

interface AppContextType {
  user: User | null;
  loading: boolean;
  settings: AppSettings;
  theme: Theme;
  refreshUser: () => Promise<void>;
  setSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setTheme: (themeId: string) => Promise<void>;
  scale: (size: number) => number;
  fontScale: (size: number) => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let mounted = true;

    (async () => {
      // Run DB init and settings load in parallel
      const [, savedSettings, currentUser] = await Promise.all([
        db.init(),
        AsyncStorage.getItem(SETTINGS_KEY),
        authService.init(),
      ]);

      if (!mounted) return;

      // Apply settings
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (e) {
          // Ignore parse errors, use defaults
        }
      }

      // Set user
      if (currentUser) {
        setUser(currentUser);
      }

      unsub = authService.onAuthChange((u) => {
        if (mounted) setUser(u);
      });

      setLoading(false);
    })();

    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authService.refreshUser();
    setUser(u);
  }, []);

  const setSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setSettingsState(prev => {
      const newSettings = { ...prev, ...updates };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings)).catch(() => {});
      return newSettings;
    });
  }, []);

  const setTheme = useCallback(async (themeId: string) => {
    await setSettings({ themeId });
  }, [setSettings]);

  const scale = useCallback((size: number) => Math.round(size * settings.uiScale), [settings.uiScale]);
  const fontScale = useCallback((size: number) => Math.round(size * settings.fontScale), [settings.fontScale]);

  const theme = getTheme(settings.themeId);

  return (
    <AppContext.Provider value={{
      user, loading, settings, theme, refreshUser, setSettings, setTheme, scale, fontScale,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
