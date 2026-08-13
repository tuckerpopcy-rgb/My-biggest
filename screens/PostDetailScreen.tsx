// ============================================================
// Salon na we yon - Post Detail Screen
// Full post view with comments
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { getPosts, toggleLike, addComment, formatTimeAgo } from '../lib/social';
import { Avatar, Card, Badge, Button } from '../components/UIComponents';
import type { Post, Comment } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PostDetailScreen({ route, navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const postId = route?.params?.postId;
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPost = useCallback(async () => {
    const posts = await getPosts();
    const p = posts.find(p => p.id === postId);
    setPost(p || null);
    setLoading(false);
  }, [postId]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const handleLike = async () => {
    if (!user || !post) return;
    await toggleLike(post.id, user.id);
    await loadPost();
    await refreshUser();
  };

  const handleComment = async () => {
    if (!user || !post || !comment.trim()) return;
    await addComment(post.id, user.id, comment.trim());
    setComment('');
    await loadPost();
    await refreshUser();
  };

  if (loading || !post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: c.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={28} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginLeft: 12 }}>Post</Text>
        </View>

        <FlatList
          data={post.comments}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View>
              {/* Post Content */}
              <View style={{ marginBottom: 20 }}>
                <View style={styles.postHeader}>
                  <Avatar uri={post.authorAvatar} size={44} theme={theme} name={post.authorName} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{post.authorName}</Text>
                    <Text style={{ fontSize: 13, color: c.textMuted }}>{formatTimeAgo(post.createdAt)}</Text>
                  </View>
                  {post.authorId === 'dev_henry_tucker' && (
                    <Badge theme={theme} text="DEV" color={c.accent} size="small" />
                  )}
                </View>

                <Text style={{ fontSize: 17, color: c.text, lineHeight: 26, marginTop: 12 }}>{post.content}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                    <Ionicons
                      name={post.likes.includes(user?.id || '') ? 'heart' : 'heart-outline'}
                      size={24}
                      color={post.likes.includes(user?.id || '') ? c.error : c.textSecondary}
                    />
                    <Text style={{ fontSize: 14, color: c.textSecondary, marginLeft: 6 }}>{post.likes.length} likes</Text>
                  </TouchableOpacity>
                  <View style={styles.actionBtn}>
                    <Ionicons name="chatbubble" size={22} color={c.textSecondary} />
                    <Text style={{ fontSize: 14, color: c.textSecondary, marginLeft: 6 }}>{post.comments.length} comments</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.commentDivider, { borderColor: c.border }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Comments</Text>
              </View>
            </View>
          }
          renderItem={({ item: cmt }) => (
            <View style={styles.commentItem}>
              <Avatar uri={cmt.authorAvatar} size={34} theme={theme} name={cmt.authorName} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{cmt.authorName}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted }}>{formatTimeAgo(cmt.createdAt)}</Text>
                </View>
                <Text style={{ fontSize: 15, color: c.textSecondary, lineHeight: 20, marginTop: 4 }}>{cmt.content}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ fontSize: 14, color: c.textMuted }}>No comments yet. Be the first!</Text>
            </View>
          }
        />

        {/* Comment Input */}
        <View style={[styles.inputBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <Avatar uri={user?.avatar || null} size={32} theme={theme} name={user?.displayName} />
          <TextInput
            style={[styles.commentInput, { backgroundColor: c.surfaceAlt, color: c.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={c.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={!comment.trim()}
            style={[styles.sendBtn, { backgroundColor: comment.trim() ? c.primary : c.surfaceAlt }]}
          >
            <Ionicons name="send" size={18} color={comment.trim() ? '#fff' : c.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', gap: 24, marginTop: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  commentDivider: { paddingBottom: 12, marginBottom: 4, borderBottomWidth: 1 },
  commentItem: { flexDirection: 'row', marginBottom: 16 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, gap: 8 },
  commentInput: { flex: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 80, fontSize: 15 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
