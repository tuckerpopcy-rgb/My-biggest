// ============================================================
// Salon na we yon - Notification System
// Updates from developer Henry Tucker
// ============================================================

import { db } from './database';
import type { Notification } from './types';

export async function getNotifications(): Promise<Notification[]> {
  const notifs = await db.get<Notification[]>('notifications') || [];
  return notifs.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUnreadCount(): Promise<number> {
  const notifs = await getNotifications();
  return notifs.filter(n => !n.read).length;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await db.update('notifications', (notifs: Notification[]) =>
    notifs.map(n => n.id === notificationId ? { ...n, read: true } : n)
  );
}

export async function markAllAsRead(): Promise<void> {
  await db.update('notifications', (notifs: Notification[]) =>
    notifs.map(n => ({ ...n, read: true }))
  );
}

export async function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
  const newNotif: Notification = {
    ...notification,
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    createdAt: Date.now(),
  };
  await db.update('notifications', (notifs: Notification[]) => [newNotif, ...notifs]);
}

export async function addDeveloperUpdate(title: string, message: string): Promise<void> {
  await addNotification({
    type: 'update',
    title,
    message,
    fromUserId: 'dev_henry_tucker',
    fromUserName: 'Henry Tucker',
    read: false,
  });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await db.update('notifications', (notifs: Notification[]) =>
    notifs.filter(n => n.id !== notificationId)
  );
}
