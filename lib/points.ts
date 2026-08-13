// ============================================================
// Salon na we yon - Points & Rewards System
// ============================================================

import { db } from './database';
import type { User } from './types';

export const POINTS = {
  LIKE: 5,
  COMMENT: 15,
  FOLLOW: 10,
  QUIZ_CORRECT: 20,
  QUIZ_COMPLETE: 50,
  DAILY_LOGIN: 25,
  POST_CREATE: 10,
  PROFILE_COMPLETE: 30,
  SUBSCRIBE: 100,
  CHAT_MESSAGE: 3,
} as const;

export async function awardPoints(
  userId: string,
  amount: number,
  reason: string
): Promise<User | null> {
  const users = await db.get<User[]>('users') || [];
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    points: users[userIndex].points + amount,
  };

  await db.set('users', users);
  return users[userIndex];
}

export function getPointsLevel(points: number): { level: number; title: string; progress: number } {
  const levels = [
    { min: 0, title: 'Newcomer' },
    { min: 100, title: 'Explorer' },
    { min: 300, title: 'Learner' },
    { min: 600, title: 'Scholar' },
    { min: 1000, title: 'Mentor' },
    { min: 2000, title: 'Expert' },
    { min: 4000, title: 'Master' },
    { min: 8000, title: 'Champion' },
    { min: 15000, title: 'Legend' },
    { min: 30000, title: 'Icon' },
  ];

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].min) {
      currentLevel = i;
      break;
    }
  }

  const nextLevel = currentLevel + 1;
  const currentMin = levels[currentLevel].min;
  const nextMin = nextLevel < levels.length ? levels[nextLevel].min : currentMin * 2;
  const progress = (points - currentMin) / (nextMin - currentMin);

  return {
    level: currentLevel + 1,
    title: levels[currentLevel].title,
    progress: Math.min(progress, 1),
  };
}

export function getPointsColor(level: number): string {
  const colors = ['#9E9E9E', '#8D6E63', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63', '#F44336', '#FFD700'];
  return colors[Math.min(level - 1, colors.length - 1)];
}
