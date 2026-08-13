// ============================================================
// Salon na we yon - Authentication System
// Permanent sessions with no logout issues
// ============================================================

import { db } from './database';
import * as SecureStore from 'expo-secure-store';
import type { User } from './types';

const SESSION_KEY = 'salon_session_user_id';

export class AuthService {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  async init(): Promise<User | null> {
    await db.init();
    const sessionId = await SecureStore.getItemAsync(SESSION_KEY);
    if (sessionId) {
      const users = await db.get<User[]>('users');
      const user = users?.find(u => u.id === sessionId);
      if (user) {
        this.currentUser = user;
        this.notifyListeners();
        return user;
      }
    }
    return null;
  }

  async register(
    username: string,
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    const users = await db.get<User[]>('users') || [];

    // Validate - no demo accounts
    if (username.toLowerCase().includes('demo') || username.toLowerCase().includes('test')) {
      return { success: false, error: 'Invalid username. Please use a real username.' };
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already taken. Please choose another.' };
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already registered. Please login instead.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      username,
      email,
      passwordHash: db.hash(password),
      displayName,
      bio: '',
      avatar: null,
      coverPhoto: null,
      points: 100, // Welcome bonus
      followers: [],
      following: [],
      isSubscribed: false,
      subscriptionTier: 'free',
      subscriptionExpiry: null,
      isDeveloper: false,
      approvedClasses: [],
      joinedAt: Date.now(),
      lastActive: Date.now(),
      quizHighScore: 0,
      quizzesCompleted: 0,
    };

    users.push(newUser);
    await db.set('users', users);

    // Create permanent session
    await SecureStore.setItemAsync(SESSION_KEY, newUser.id);
    this.currentUser = newUser;
    this.notifyListeners();

    // Add welcome notification
    await this.addWelcomeNotification(newUser.id);

    return { success: true, user: newUser };
  }

  async login(
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    const users = await db.get<User[]>('users') || [];
    const hash = db.hash(password);

    const user = users.find(
      u => (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
            u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
           u.passwordHash === hash
    );

    if (!user) {
      return { success: false, error: 'Invalid credentials. Please check your details.' };
    }

    // Update last active
    user.lastActive = Date.now();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    await db.set('users', updatedUsers);

    // Create permanent session
    await SecureStore.setItemAsync(SESSION_KEY, user.id);
    this.currentUser = user;
    this.notifyListeners();

    return { success: true, user };
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    this.currentUser = null;
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async refreshUser(): Promise<User | null> {
    if (!this.currentUser) return null;
    const users = await db.get<User[]>('users') || [];
    const user = users.find(u => u.id === this.currentUser!.id);
    if (user) {
      this.currentUser = user;
      this.notifyListeners();
    }
    return user;
  }

  async updateUser(updates: Partial<User>): Promise<User | null> {
    if (!this.currentUser) return null;
    const users = await db.get<User[]>('users') || [];
    const updated = users.map(u =>
      u.id === this.currentUser!.id ? { ...u, ...updates } : u
    );
    await db.set('users', updated);
    this.currentUser = { ...this.currentUser, ...updates };
    this.notifyListeners();
    return this.currentUser;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await db.get<User[]>('users') || [];
    return users.find(u => u.id === id) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.get<User[]>('users') || [];
  }

  onAuthChange(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  private async addWelcomeNotification(userId: string) {
    const notifications = await db.get<any[]>('notifications') || [];
    notifications.unshift({
      id: 'notif_welcome_' + userId,
      type: 'update',
      title: 'Account Created Successfully!',
      message: 'Welcome to Salon na we yon! You received 100 bonus points. Start exploring quizzes, posts, and classes.',
      fromUserId: 'dev_henry_tucker',
      fromUserName: 'Henry Tucker',
      read: false,
      createdAt: Date.now(),
    });
    await db.set('notifications', notifications);
  }

  // Developer portal access
  async verifyDeveloperAccess(code: string): Promise<boolean> {
    // Henry Tucker's developer code
    return code === 'HTUCKER_DEV_2024';
  }
}

export const authService = new AuthService();
