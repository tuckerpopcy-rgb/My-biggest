// ============================================================
// Salon na we yon - Home Feed Screen
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { getPosts, createPost, toggleLike, formatTimeAgo } from '../lib/social';
import { Avatar, Card, GradientHeader, LoadingSpinner, EmptyState, Badge, Button } from '../components/UIComponents';
import { PointsBadge } from '../components/PointsBadge';
import type { Post } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPost, setNewPost] = useState('');

  const loadPosts = useCallback(async () => {
    const p = await getPosts();
    setPosts(p);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    await refreshUser();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;
    await createPost(user.id, newPost.trim());
    setNewPost('');
    await loadPosts();
    await refreshUser();
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    await toggleLike(postId, user.id);
    await loadPosts();
    await refreshUser();
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <Card theme={theme} onPress={() => navigation?.navigate('PostDetail', { postId: post.id })}>
      {/* Author */}
      <View style={styles.postHeader}>
        <Avatar uri={post.authorAvatar} size={42} theme={theme} name={post.authorName} />
        <View style={styles.postAuthorInfo}>
          <Text style={[styles.postAuthor, { color: c.text }]}>{post.authorName}</Text>
          <Text style={[styles.postTime, { color: c.textMuted }]}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
        {post.authorId === 'dev_henry_tucker' && (
          <Badge theme={theme} text="DEV" color={c.accent} size="small" />
        )}
      </View>

      {/* Content */}
      <Text style={[styles.postContent, { color: c.text }]}>{post.content}</Text>

      {/* Tags */}
      {post.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {post.tags.map(tag => (
            <Badge key={tag} theme={theme} text={`#${tag}`} color={c.primaryLight} size="small" />
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
          <Ionicons
            name={post.likes.includes(user?.id || '') ? 'heart' : 'heart-outline'}
            size={22}
            color={post.likes.includes(user?.id || '') ? c.error : c.textSecondary}
          />
          <Text style={[styles.actionText, { color: c.textSecondary }]}>{post.likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation?.navigate('PostDetail', { postId: post.id })}>
          <Ionicons name="chatbubble-outline" size={20} color={c.textSecondary} />
          <Text style={[styles.actionText, { color: c.textSecondary }]}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={20} color={c.textSecondary} />
          <Text style={[styles.actionText, { color: c.textSecondary }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        theme={theme}
        title="Salon na we yon"
        subtitle="What's happening in our community"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {user && <PointsBadge points={user.points} compact />}
            <TouchableOpacity onPress={() => navigation?.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={26} color={c.text} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Post */}
      <View style={[styles.createSection, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.createRow}>
          <Avatar uri={user?.avatar || null} size={36} theme={theme} name={user?.displayName} />
          <TextInput
            style={[styles.createInput, { color: c.text }]}
            placeholder="Share something with the community..."
            placeholderTextColor={c.textMuted}
            value={newPost}
            onChangeText={setNewPost}
            multiline
            maxLength={500}
          />
        </View>
        {newPost.trim() ? (
          <View style={styles.createActions}>
            <TouchableOpacity onPress={() => setNewPost('')} style={styles.createActionBtn}>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreatePost}
              style={[styles.postBtn, { backgroundColor: c.primary }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Post</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feed}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            theme={theme}
            icon="📝"
            title="No posts yet"
            subtitle="Be the first to share something!"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  feed: { padding: 16, paddingTop: 8 },
  createSection: {
    padding: 12, paddingHorizontal: 16,
    borderTopWidth: 1, borderBottomWidth: 1,
  },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createInput: { flex: 1, fontSize: 15, maxHeight: 80, paddingVertical: 8 },
  createActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, gap: 12 },
  createActionBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  postBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAuthorInfo: { flex: 1, marginLeft: 10 },
  postAuthor: { fontSize: 15, fontWeight: '700' },
  postTime: { fontSize: 12, marginTop: 1 },
  postContent: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  postActions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', paddingTop: 10, gap: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '500' },
});
