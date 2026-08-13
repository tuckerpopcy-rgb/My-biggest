// ============================================================
// Salon na we yon - Developer Portal
// Henry Tucker's admin dashboard
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { db } from '../lib/database';
import { authService } from '../lib/auth';
import { addDeveloperUpdate } from '../lib/notifications';
import { Card, Badge, Button } from '../components/UIComponents';
import type { User, Post, Notification } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DeveloperPortal({ navigation }: any) {
  const { theme } = useApp();
  const c = theme.colors;
  const [tab, setTab] = useState<'overview' | 'users' | 'posts' | 'broadcast'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const u = await db.get<User[]>('users') || [];
    const p = await db.get<Post[]>('posts') || [];
    const n = await db.get<Notification[]>('notifications') || [];
    setUsers(u);
    setPosts(p);
    setNotifications(n);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) {
      Alert.alert('Error', 'Please enter both title and message.');
      return;
    }
    await addDeveloperUpdate(broadcastTitle.trim(), broadcastMsg.trim());
    setBroadcastTitle('');
    setBroadcastMsg('');
    await loadData();
    Alert.alert('Success', 'Update sent to all users!');
  };

  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
  const totalSubscribers = users.filter(u => u.isSubscribed).length;
  const totalQuizResults = users.reduce((sum, u) => sum + u.quizzesCompleted, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>Developer Portal</Text>
            <Text style={{ fontSize: 12, color: '#ffffffaa' }}>Henry Tucker · Admin</Text>
          </View>
          <View style={[styles.devBadge, { backgroundColor: '#FFD700' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#000' }}>DEV</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['overview', 'users', 'posts', 'broadcast'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, { borderBottomColor: tab === t ? '#fff' : 'transparent' }]}
            >
              <Text style={{ color: tab === t ? '#fff' : '#ffffffaa', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {tab === 'overview' && (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 4 }}>Dashboard Overview</Text>

            <View style={styles.statsGrid}>
              <Card theme={theme} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Total Users</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: c.primary, marginTop: 4 }}>{users.length}</Text>
              </Card>
              <Card theme={theme} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Subscribers</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#FFD700', marginTop: 4 }}>{totalSubscribers}</Text>
              </Card>
            </View>
            <View style={styles.statsGrid}>
              <Card theme={theme} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Total Posts</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: c.success, marginTop: 4 }}>{posts.length}</Text>
              </Card>
              <Card theme={theme} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Total Points</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: c.accent, marginTop: 4 }}>{totalPoints.toLocaleString()}</Text>
              </Card>
            </View>
            <View style={styles.statsGrid}>
              <Card theme={theme} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Quizzes Done</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: c.warning, marginTop: 4 }}>{totalQuizResults}</Text>
              </Card>
              <Card theme={theme} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Notifications</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: c.error, marginTop: 4 }}>{notifications.length}</Text>
              </Card>
            </View>

            <Card theme={theme}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 }}>Recent Activity</Text>
              {users.slice(0, 5).map(u => (
                <View key={u.id} style={styles.activityRow}>
                  <Text style={{ fontSize: 14, color: c.text }}>{u.displayName}</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted }}>{u.points} pts · Joined {new Date(u.joinedAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {tab === 'users' && (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 8 }}>All Users ({users.length})</Text>
            {users.map(u => (
              <Card key={u.id} theme={theme}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.userDot, { backgroundColor: u.isDeveloper ? '#FFD700' : c.primary }]} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{u.displayName}</Text>
                    <Text style={{ fontSize: 12, color: c.textMuted }}>@{u.username} · {u.email}</Text>
                  </View>
                  <View style={{ gap: 4 }}>
                    {u.isDeveloper && <Badge theme={theme} text="DEV" color="#FFD700" size="small" />}
                    {u.isSubscribed && <Badge theme={theme} text="SUB" color={c.success} size="small" />}
                    <Text style={{ fontSize: 11, color: c.textMuted }}>{u.points}pts</Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        {tab === 'posts' && (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 8 }}>All Posts ({posts.length})</Text>
            {posts.map(p => (
              <Card key={p.id} theme={theme}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{p.authorName}</Text>
                <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 4, lineHeight: 20 }}>{p.content.slice(0, 100)}{p.content.length > 100 ? '...' : ''}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: c.textMuted }}>❤️ {p.likes.length}</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted }}>💬 {p.comments.length}</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted }}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {tab === 'broadcast' && (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 8 }}>📢 Send Update</Text>
            <Card theme={theme}>
              <Text style={{ fontSize: 14, color: c.textSecondary, marginBottom: 16 }}>
                Send a notification to all users. Updates appear in their Notifications feed.
              </Text>
              <TextInput
                style={[styles.broadcastInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
                placeholder="Update title"
                placeholderTextColor={c.textMuted}
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />
              <TextInput
                style={[styles.broadcastInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }, styles.broadcastMsg]}
                placeholder="Update message"
                placeholderTextColor={c.textMuted}
                value={broadcastMsg}
                onChangeText={setBroadcastMsg}
                multiline
                maxLength={500}
              />
              <Button theme={theme} title="📢 Send to All Users" onPress={handleBroadcast} size="large" />
            </Card>

            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginTop: 12, marginBottom: 8 }}>Recent Notifications</Text>
            {notifications.slice(0, 10).map(n => (
              <Card key={n.id} theme={theme}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge theme={theme} text={n.type.toUpperCase()} size="small" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: c.text, flex: 1 }}>{n.title}</Text>
                </View>
                <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4 }}>{n.message}</Text>
                <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  devBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tabRow: { flexDirection: 'row', marginTop: 16, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderBottomWidth: 2.5 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  userDot: { width: 10, height: 10, borderRadius: 5 },
  broadcastInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  broadcastMsg: { minHeight: 100, textAlignVertical: 'top' },
});
