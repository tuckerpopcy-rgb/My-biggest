// ============================================================
// Salon na we yon - Subscription Service
// Payment subscription model for classes
// ============================================================

import { db } from './database';
import { awardPoints, POINTS } from './points';
import type { User } from './types';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: 'forever',
    features: [
      'Access to basic courses',
      'Participate in community',
      'Earn points through interactions',
      'Access to quizzes',
      'Standard themes',
    ],
    color: '#9E9E9E',
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 50,
    duration: '30 days',
    features: [
      'All free features',
      'Access to all basic courses',
      'AI assessment feedback',
      'Additional themes',
      'Priority notifications',
      'No advertisements',
    ],
    color: '#0077B6',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 150,
    duration: '30 days',
    features: [
      'All basic features',
      'Access to ALL courses including premium',
      'Advanced AI teaching assistant',
      'All premium themes & effects',
      'Voice & video chat access',
      'Custom profile effects',
      'Priority support',
      'Exclusive content from Henry Tucker',
      'Double points multiplier',
    ],
    color: '#FFD700',
  },
];

export async function subscribe(
  userId: string,
  tier: 'basic' | 'premium'
): Promise<User | null> {
  const users = await db.get<User[]>('users') || [];
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  users[userIndex] = {
    ...users[userIndex],
    isSubscribed: true,
    subscriptionTier: tier,
    subscriptionExpiry: expiry,
    approvedClasses: tier === 'premium' ? ['all'] : ['basic'],
  };

  await db.set('users', users);
  await awardPoints(userId, POINTS.SUBSCRIBE, 'Subscribed to ' + tier);

  // Record subscription
  const subscriptions = await db.get<any[]>('subscriptions') || [];
  subscriptions.push({
    id: 'sub_' + Date.now(),
    userId,
    tier,
    price: tier === 'premium' ? 150 : 50,
    startDate: Date.now(),
    endDate: expiry,
    status: 'active',
  });
  await db.set('subscriptions', subscriptions);

  return users[userIndex];
}

export async function checkSubscriptionStatus(userId: string): Promise<{ active: boolean; tier: string; daysLeft: number }> {
  const user = await (async () => {
    const users = await db.get<User[]>('users') || [];
    return users.find(u => u.id === userId);
  })();

  if (!user) return { active: false, tier: 'free', daysLeft: 0 };

  if (user.isDeveloper) return { active: true, tier: 'premium', daysLeft: 999 };

  if (!user.isSubscribed || !user.subscriptionExpiry) {
    return { active: false, tier: 'free', daysLeft: 0 };
  }

  if (user.subscriptionExpiry < Date.now()) {
    // Expired - reset
    const users = await db.get<User[]>('users') || [];
    const updated = users.map(u =>
      u.id === userId ? { ...u, isSubscribed: false, subscriptionTier: 'free' as const, subscriptionExpiry: null } : u
    );
    await db.set('users', updated);
    return { active: false, tier: 'free', daysLeft: 0 };
  }

  const daysLeft = Math.ceil((user.subscriptionExpiry - Date.now()) / (24 * 60 * 60 * 1000));
  return { active: true, tier: user.subscriptionTier, daysLeft };
}

export async function getSubscriptionHistory(userId: string): Promise<any[]> {
  const subs = await db.get<any[]>('subscriptions') || [];
  return subs.filter(s => s.userId === userId).sort((a, b) => b.startDate - a.startDate);
}
