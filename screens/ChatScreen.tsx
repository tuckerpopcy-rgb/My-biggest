// ============================================================
// Salon na we yon - Chat Screen
// Voice, video, and text chat with real-time sync
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { getChatRooms, getChatMessages, sendChatMessage, joinRoom } from '../lib/chat';
import { checkSubscriptionStatus } from '../lib/subscription';
import { Avatar, Card, GradientHeader, Badge, Button, EmptyState, LoadingSpinner } from '../components/UIComponents';
import type { ChatRoom, ChatMessage } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ChatScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [view, setView] = useState<'rooms' | 'chat'>('rooms');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState({ active: false, tier: 'free', daysLeft: 0 });

  useEffect(() => {
    if (user) checkSubscriptionStatus(user.id).then(setSubStatus);
  }, [user]);

  const loadRooms = useCallback(async () => {
    const r = await getChatRooms();
    setRooms(r);
    setLoading(false);
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const loadMessages = useCallback(async (roomId: string) => {
    const msgs = await getChatMessages(roomId);
    setMessages(msgs);
  }, []);

  const openRoom = async (room: ChatRoom) => {
    if (!user) return;
    // Voice/video requires premium
    if ((room.type === 'voice' || room.type === 'video') && !subStatus.active && !user.isDeveloper) {
      return; // Show locked state
    }
    await joinRoom(room.id, user.id);
    setSelectedRoom(room);
    await loadMessages(room.id);
    setView('chat');
  };

  const handleSend = async () => {
    if (!input.trim() || !user || !selectedRoom) return;
    await sendChatMessage(
      selectedRoom.id, user.id, user.displayName, user.avatar, input.trim()
    );
    setInput('');
    await loadMessages(selectedRoom.id);
    await refreshUser();
  };

  // ===== CHAT ROOM VIEW =====
  if (view === 'chat' && selectedRoom) {
    const isPremiumRoom = selectedRoom.type !== 'text';
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        {/* Header */}
        <View style={[styles.chatHeader, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => { setView('rooms'); setSelectedRoom(null); }}>
            <Ionicons name="arrow-back" size={28} color={c.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>{selectedRoom.name}</Text>
            <Text style={{ fontSize: 12, color: c.textMuted }}>
              {selectedRoom.type === 'voice' ? '🎤 Voice' : selectedRoom.type === 'video' ? '📹 Video' : '💬 Text'} Chat
              {' · '}{selectedRoom.participants.length} online
            </Text>
          </View>
          {isPremiumRoom && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: c.success + '20' }]}>
                <Ionicons name="call" size={20} color={c.success} />
              </TouchableOpacity>
              {selectedRoom.type === 'video' && (
                <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: c.primary + '20' }]}>
                  <Ionicons name="videocam" size={20} color={c.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
          renderItem={({ item: msg }) => {
            const isMe = msg.authorId === user?.id;
            return (
              <View style={[styles.messageRow, isMe ? styles.messageRowMe : {}]}>
                {!isMe && <Avatar uri={msg.authorAvatar} size={32} theme={theme} name={msg.authorName} />}
                <View style={[
                  styles.messageBubble,
                  {
                    backgroundColor: isMe ? c.primary : c.surfaceAlt,
                    maxWidth: '75%',
                  },
                ]}>
                  {!isMe && (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: c.primary, marginBottom: 2 }}>
                      {msg.authorName}
                    </Text>
                  )}
                  <Text style={{ fontSize: 15, color: isMe ? '#fff' : c.text, lineHeight: 20 }}>
                    {msg.content}
                  </Text>
                  <Text style={{ fontSize: 10, color: isMe ? '#ffffff88' : c.textMuted, marginTop: 4, alignSelf: 'flex-end' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 40 }}>{selectedRoom.type === 'voice' ? '🎤' : selectedRoom.type === 'video' ? '📹' : '💬'}</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: c.text, marginTop: 12 }}>Start the conversation!</Text>
              <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>{selectedRoom.description}</Text>
            </View>
          }
        />

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.inputBar, { backgroundColor: c.surface, borderTopColor: c.border }]}
        >
          <TextInput
            style={[styles.chatInput, { backgroundColor: c.surfaceAlt, color: c.text }]}
            placeholder="Type a message..."
            placeholderTextColor={c.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={[styles.sendBtn, { backgroundColor: input.trim() ? c.primary : c.surfaceAlt }]}
          >
            <Ionicons name="send" size={20} color={input.trim() ? '#fff' : c.textMuted} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ===== ROOMS LIST VIEW =====
  if (loading) return <LoadingSpinner theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        theme={theme}
        title="Chat"
        subtitle="Connect in real-time"
        right={
          subStatus.active ? (
            <Badge theme={theme} text="PREMIUM" color="#FFD700" size="small" />
          ) : null
        }
      />

      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item: room }) => {
          const isLocked = (room.type === 'voice' || room.type === 'video') && !subStatus.active && !user?.isDeveloper;
          const typeIcons = { text: '💬', voice: '🎤', video: '📹' };
          return (
            <Card theme={theme} onPress={() => !isLocked && openRoom(room)}>
              <View style={styles.roomRow}>
                <View style={[styles.roomIcon, { backgroundColor: (room.type === 'voice' ? '#4CAF50' : room.type === 'video' ? '#2196F3' : c.primary) + '20' }]}>
                  <Text style={{ fontSize: 24 }}>{typeIcons[room.type]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{room.name}</Text>
                    {isLocked && <Ionicons name="lock-closed" size={14} color={c.warning} />}
                  </View>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{room.description}</Text>
                  <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
                    {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {isLocked ? (
                  <Badge theme={theme} text="PREMIUM" color={c.warning} size="small" />
                ) : (
                  <Ionicons name="chevron-forward" size={22} color={c.textMuted} />
                )}
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  roomRow: { flexDirection: 'row', alignItems: 'center' },
  roomIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1,
  },
  mediaBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginLeft: 8 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
