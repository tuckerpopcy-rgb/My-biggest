// ============================================================
// Salon na we yon - News Feed Screen
// Sierra Leone news and updates
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { getNewsArticles, getFeaturedNews, toggleNewsLike, newsCategories } from '../lib/news';
import { formatTimeAgo } from '../lib/social';
import { Card, GradientHeader, Badge, Button, EmptyState, LoadingSpinner } from '../components/UIComponents';
import type { NewsArticle } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NewsScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featured, setFeatured] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('All');

  const loadData = useCallback(async () => {
    const [a, f] = await Promise.all([
      getNewsArticles(category),
      getFeaturedNews(),
    ]);
    setArticles(a);
    setFeatured(f);
    setLoading(false);
  }, [category]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await refreshUser();
    setRefreshing(false);
  };

  const handleLike = async (articleId: string) => {
    if (!user) return;
    await toggleNewsLike(articleId, user.id);
    await loadData();
    await refreshUser();
  };

  const categoryIcons: Record<string, string> = {
    Economy: '💰', Education: '📚', Sports: '⚽',
    Technology: '💻', Health: '🏥', Politics: '🏛️', Culture: '🎭',
  };

  const renderArticle = ({ item }: { item: NewsArticle }) => (
    <Card theme={theme} onPress={() => navigation?.navigate('NewsDetail', { articleId: item.id })}>
      {item.isFeatured && (
        <View style={[styles.featuredBanner, { backgroundColor: c.accent + '15', borderColor: c.accent + '40' }]}>
          <Ionicons name="star" size={14} color={c.accent} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.accent, marginLeft: 4 }}>FEATURED</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Text style={{ fontSize: 20 }}>{categoryIcons[item.category] || '📰'}</Text>
        <Badge theme={theme} text={item.category} color={c.primaryLight} size="small" />
        <Text style={{ fontSize: 11, color: c.textMuted, marginLeft: 'auto' }}>{formatTimeAgo(item.createdAt)}</Text>
      </View>

      <Text style={[styles.articleTitle, { color: c.text }]}>{item.title}</Text>
      <Text style={[styles.articleSummary, { color: c.textSecondary }]} numberOfLines={3}>{item.summary}</Text>

      <View style={styles.articleFooter}>
        <Text style={{ fontSize: 12, color: c.textMuted }}>By {item.author} · {item.source}</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => handleLike(item.id)}>
            <Ionicons
              name={item.likes.includes(user?.id || '') ? 'heart' : 'heart-outline'}
              size={18}
              color={item.likes.includes(user?.id || '') ? c.error : c.textMuted}
            />
            <Text style={{ fontSize: 12, color: c.textMuted }}>{item.likes.length}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="eye-outline" size={16} color={c.textMuted} />
            <Text style={{ fontSize: 12, color: c.textMuted }}>{item.views}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        theme={theme}
        title="News 📰"
        subtitle="Sierra Leone updates & stories"
      />

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {newsCategories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.catBtn, {
              backgroundColor: category === cat ? c.primary : c.surfaceAlt,
              borderColor: category === cat ? c.primary : c.border,
            }]}
          >
            <Text style={{ color: category === cat ? '#fff' : c.text, fontSize: 13, fontWeight: '600' }}>
              {cat !== 'All' ? (categoryIcons[cat] || '') + ' ' : ''}{cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        ListEmptyComponent={<EmptyState theme={theme} icon="📰" title="No news found" subtitle="Check back later for updates" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  catRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5 },
  list: { padding: 16, paddingTop: 4 },
  featuredBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 8 },
  articleTitle: { fontSize: 17, fontWeight: '700', lineHeight: 23, marginBottom: 6 },
  articleSummary: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', paddingTop: 10 },
});
