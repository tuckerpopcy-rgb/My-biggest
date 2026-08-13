// ============================================================
// Salon na we yon - News Detail Screen
// Full article view
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { getNewsById, toggleNewsLike, addNewsComment, incrementNewsViews } from '../lib/news';
import { formatTimeAgo } from '../lib/social';
import { Avatar, Card, Badge, Button } from '../components/UIComponents';
import type { NewsArticle } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NewsDetailScreen({ route, navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const articleId = route?.params?.articleId;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadArticle = useCallback(async () => {
    const a = await getNewsById(articleId);
    setArticle(a);
    setLoading(false);
    if (a) await incrementNewsViews(articleId);
  }, [articleId]);

  useEffect(() => { loadArticle(); }, [loadArticle]);

  const handleLike = async () => {
    if (!user || !article) return;
    await toggleNewsLike(article.id, user.id);
    await loadArticle();
    await refreshUser();
  };

  const handleComment = async () => {
    if (!user || !article || !comment.trim()) return;
    await addNewsComment(article.id, user.id, user.displayName, user.avatar, comment.trim());
    setComment('');
    await loadArticle();
    await refreshUser();
  };

  if (loading || !article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: c.textSecondary }}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={28} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginLeft: 12 }}>News</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {article.isFeatured && (
            <View style={[styles.featuredBanner, { backgroundColor: c.accent + '15', borderColor: c.accent + '40' }]}>
              <Ionicons name="star" size={14} color={c.accent} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: c.accent, marginLeft: 4 }}>FEATURED</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Badge theme={theme} text={article.category} color={c.primaryLight} />
            <Text style={{ fontSize: 12, color: c.textMuted }}>{formatTimeAgo(article.createdAt)}</Text>
          </View>

          <Text style={[styles.title, { color: c.text }]}>{article.title}</Text>
          <Text style={{ fontSize: 13, color: c.textMuted, marginBottom: 16 }}>By {article.author} · Source: {article.source}</Text>

          <Text style={[styles.content, { color: c.textSecondary }]}>{article.content}</Text>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: c.border, borderBottomColor: c.border }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Ionicons name={article.likes.includes(user?.id || '') ? 'heart' : 'heart-outline'} size={22} color={article.likes.includes(user?.id || '') ? c.error : c.textSecondary} />
              <Text style={{ fontSize: 14, color: c.textSecondary, marginLeft: 6 }}>{article.likes.length} likes</Text>
            </TouchableOpacity>
            <View style={styles.actionBtn}>
              <Ionicons name="eye-outline" size={20} color={c.textSecondary} />
              <Text style={{ fontSize: 14, color: c.textSecondary, marginLeft: 6 }}>{article.views} views</Text>
            </View>
          </View>

          {/* Comments */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginTop: 16, marginBottom: 12 }}>Comments ({article.comments.length})</Text>
          {article.comments.length === 0 ? (
            <Text style={{ color: c.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 16 }}>No comments yet. Be the first!</Text>
          ) : (
            article.comments.map(cmt => (
              <View key={cmt.id} style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Avatar uri={cmt.authorAvatar} size={32} theme={theme} name={cmt.authorName} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{cmt.authorName}</Text>
                    <Text style={{ fontSize: 11, color: c.textMuted }}>{formatTimeAgo(cmt.createdAt)}</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: c.textSecondary, lineHeight: 20, marginTop: 3 }}>{cmt.content}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Comment Input */}
        <View style={[styles.inputBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.commentInput, { backgroundColor: c.surfaceAlt, color: c.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={c.textMuted}
            value={comment}
            onChangeText={setComment}
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
  featuredBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 6 },
  content: { fontSize: 16, lineHeight: 26 },
  actions: { flexDirection: 'row', gap: 24, marginTop: 20, paddingTop: 14, paddingBottom: 14, borderTopWidth: 1, borderBottomWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, gap: 8 },
  commentInput: { flex: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
