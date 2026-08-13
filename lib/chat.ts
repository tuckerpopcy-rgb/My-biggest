// ============================================================
// Salon na we yon - Chat Service
// Voice, video, and text chat with real-time sync
// ============================================================

import { db } from './database';
import { awardPoints, POINTS } from './points';
import type { ChatRoom, ChatMessage } from './types';

export async function getChatRooms(): Promise<ChatRoom[]> {
  const rooms = await db.get<ChatRoom[]>('chatRooms') || [];
  return rooms.filter(r => r.active);
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const messages = await db.get<ChatMessage[]>('chatMessages') || [];
  return messages.filter(m => m.roomId === roomId).sort((a, b) => a.createdAt - b.createdAt);
}

export async function sendChatMessage(
  roomId: string,
  authorId: string,
  authorName: string,
  authorAvatar: string | null,
  content: string,
  type: 'text' | 'voice' | 'video' | 'system' = 'text'
): Promise<void> {
  const message: ChatMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    roomId,
    authorId,
    authorName,
    authorAvatar,
    content,
    type,
    createdAt: Date.now(),
  };

  await db.update('chatMessages', (msgs: ChatMessage[]) => [...msgs, message]);
  await awardPoints(authorId, POINTS.CHAT_MESSAGE, 'Sent a chat message');
}

export async function joinRoom(roomId: string, userId: string): Promise<void> {
  const rooms = await db.get<ChatRoom[]>('chatRooms') || [];
  const room = rooms.find(r => r.id === roomId);
  if (room && !room.participants.includes(userId)) {
    room.participants.push(userId);
    await db.set('chatRooms', rooms);
  }
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const rooms = await db.get<ChatRoom[]>('chatRooms') || [];
  const room = rooms.find(r => r.id === roomId);
  if (room) {
    room.participants = room.participants.filter(id => id !== userId);
    await db.set('chatRooms', rooms);
  }
}

export async function createChatRoom(
  name: string,
  type: 'voice' | 'video' | 'text',
  description: string,
  creatorId: string
): Promise<ChatRoom> {
  const room: ChatRoom = {
    id: 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name,
    type,
    participants: [creatorId],
    createdAt: Date.now(),
    active: true,
    description,
  };

  await db.update('chatRooms', (rooms: ChatRoom[]) => [...rooms, room]);
  return room;
}
