// ============================================================
// Salon na we yon - Explore Screen
// Discover people, content, trending topics, and AI Learning
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { authService } from '../lib/auth';
import { toggleFollow } from '../lib/social';
import { Avatar, Card, GradientHeader, LoadingSpinner, EmptyState, Badge, Button } from '../components/UIComponents';
import { PointsBadge } from '../components/PointsBadge';
import type { User } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ExploreScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'people' | 'trending' | 'learn'>('people');

  const loadUsers = useCallback(async () => {
    const allUsers = await authService.getAllUsers();
    setUsers(allUsers.filter(u => u.id !== user?.id));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    await refreshUser();
    setRefreshing(false);
  };

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    await toggleFollow(targetId, user.id);
    await loadUsers();
    await refreshUser();
  };

  const filteredUsers = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const renderUser = ({ item: u }: { item: User }) => {
    const isFollowing = user?.following.includes(u.id) || false;
    return (
      <Card theme={theme} onPress={() => navigation?.navigate('UserProfile', { userId: u.id })}>
        <View style={styles.userRow}>
          <Avatar uri={u.avatar} size={50} theme={theme} name={u.displayName} />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: c.text }]}>{u.displayName}</Text>
              {u.isDeveloper && <Badge theme={theme} text="DEV" color={c.accent} size="small" />}
              {u.isSubscribed && <Badge theme={theme} text="⭐" color="#FFD700" size="small" />}
            </View>
            <Text style={[styles.userHandle, { color: c.textMuted }]}>@{u.username}</Text>
            <View style={styles.userStats}>
              <Text style={[styles.statText, { color: c.textSecondary }]}>{u.followers.length} followers</Text>
              <Text style={[styles.statText, { color: c.textSecondary }]}>· {u.points} pts</Text>
            </View>
          </View>
          {u.id !== user?.id && (
            <TouchableOpacity
              onPress={() => handleFollow(u.id)}
              style={[styles.followBtn, { backgroundColor: isFollowing ? c.surfaceAlt : c.primary, borderColor: isFollowing ? c.border : c.primary }]}
            >
              <Text style={{ color: isFollowing ? c.text : '#fff', fontSize: 13, fontWeight: '700' }}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  const trendingTopics = [
    { emoji: '🇸🇱', topic: 'Sierra Leone Culture', count: '2.1k posts' },
    { emoji: '📚', topic: 'Education & Learning', count: '1.5k posts' },
    { emoji: '💰', topic: 'Business & Finance', count: '890 posts' },
    { emoji: '🎵', topic: 'Music & Entertainment', count: '750 posts' },
    { emoji: '⚽', topic: 'Football & Sports', count: '620 posts' },
    { emoji: '🏥', topic: 'Health & Wellness', count: '480 posts' },
  ];

  const learnCategories = [
    { emoji: '💬', title: 'Krio Language', desc: 'Learn Sierra Leone\'s lingua franca', color: '#007A3D' },
    { emoji: '📚', title: 'Sierra Leone History', desc: 'From pre-colonial to modern day', color: '#E8850C' },
    { emoji: '💼', title: 'Business & Entrepreneurship', desc: 'Skills for Sierra Leone\'s economy', color: '#7B2D8E' },
    { emoji: '💻', title: 'Digital Skills & Technology', desc: 'From basics to app development', color: '#0077B6' },
    { emoji: '🏥', title: 'Health & Wellness', desc: 'Community health and nutrition', color: '#E91E63' },
  ];

  if (loading) return <LoadingSpinner theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader theme={theme} title="Explore" subtitle="Discover people & trending topics" />

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Ionicons name="search" size={20} color={c.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Search people..."
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setTab('people')} style={[styles.tab, { borderBottomColor: tab === 'people' ? c.primary : 'transparent' }]}>
          <Text style={{ color: tab === 'people' ? c.primary : c.textSecondary, fontWeight: '700', fontSize: 14 }}>People</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('trending')} style={[styles.tab, { borderBottomColor: tab === 'trending' ? c.primary : 'transparent' }]}>
          <Text style={{ color: tab === 'trending' ? c.primary : c.textSecondary, fontWeight: '700', fontSize: 14 }}>Trending</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('learn')} style={[styles.tab, { borderBottomColor: tab === 'learn' ? c.primary : 'transparent' }]}>
          <Text style={{ color: tab === 'learn' ? c.primary : c.textSecondary, fontWeight: '700', fontSize: 14 }}>Learn 🤖</Text>
        </TouchableOpacity>
      </View>

      {tab === 'people' ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
          ListEmptyComponent={<EmptyState theme={theme} icon="🔍" title="No users found" subtitle="Try a different search" />}
        />
      ) : tab === 'trending' ? (
        <FlatList
          data={trendingTopics}
          renderItem={({ item }) => (
            <Card theme={theme}>
              <View style={styles.trendingRow}>
                <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.trendingTopic, { color: c.text }]}>{item.topic}</Text>
                  <Text style={[styles.trendingCount, { color: c.textMuted }]}>{item.count}</Text>
                </View>
                <Ionicons name="trending-up" size={20} color={c.success} />
              </View>
            </Card>
          )}
          keyExtractor={item => item.topic}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={learnCategories}
          renderItem={({ item }) => (
            <Card theme={theme} onPress={() => navigation?.navigate('Teach')}>
              <View style={styles.trendingRow}>
                <View style={[styles.learnIcon, { backgroundColor: item.color + '22' }]}>
                  <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.trendingTopic, { color: c.text }]}>{item.title}</Text>
                  <Text style={[styles.trendingCount, { color: c.textMuted }]}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
              </View>
            </Card>
          )}
          keyExtractor={item => item.title}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <View style={{ marginTop: 12 }}>
              <Button theme={theme} title="Open AI Learning Center →" onPress={() => navigation?.navigate('Teach')} size="large" />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 14, borderWidth: 1.5, borderRadius: 14, paddingVertical: 4 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10, marginLeft: 8 },
  tabRow: { flexDirection: 'row', marginTop: 12, paddingHorizontal: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2.5 },
  list: { padding: 16, paddingTop: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 16, fontWeight: '700' },
  userHandle: { fontSize: 13, marginTop: 1 },
  userStats: { flexDirection: 'row', marginTop: 4, gap: 8 },
  statText: { fontSize: 12 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  trendingRow: { flexDirection: 'row', alignItems: 'center' },
  trendingTopic: { fontSize: 16, fontWeight: '700' },
  trendingCount: { fontSize: 13, marginTop: 2 },
  learnIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
