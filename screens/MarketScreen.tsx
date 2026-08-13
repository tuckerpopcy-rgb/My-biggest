// ============================================================
// Salon na we yon - Market Screen
// Buy, sell, and browse marketplace items
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, TextInput, ScrollView, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { getMarketItems, createMarketItem, toggleMarketLike, marketCategories, formatPrice } from '../lib/market';
import { Avatar, Card, GradientHeader, Badge, Button, EmptyState, LoadingSpinner } from '../components/UIComponents';
import { PointsBadge } from '../components/PointsBadge';
import type { MarketItem } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MarketScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [itemCategory, setItemCategory] = useState('Electronics');
  const [itemCondition, setItemCondition] = useState<'new' | 'used' | 'refurbished'>('new');

  const loadItems = useCallback(async () => {
    const i = await getMarketItems(category);
    setItems(i);
    setLoading(false);
  }, [category]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    await refreshUser();
    setRefreshing(false);
  };

  const handleLike = async (itemId: string) => {
    if (!user) return;
    await toggleMarketLike(itemId, user.id);
    await loadItems();
    await refreshUser();
  };

  const handleCreate = async () => {
    if (!user || !title.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in title and price.');
      return;
    }
    const priceNum = parseInt(price.replace(/[^0-9]/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }
    await createMarketItem(
      user.id, user.displayName, user.avatar,
      title.trim(), desc.trim(), priceNum, 'Le',
      itemCategory, location.trim() || 'Sierra Leone', itemCondition
    );
    setShowCreate(false);
    setTitle(''); setDesc(''); setPrice(''); setLocation('');
    await loadItems();
    await refreshUser();
    Alert.alert('Success', 'Item listed in the market! +10 points');
  };

  const conditionColors: Record<string, string> = { new: c.success, used: c.warning, refurbished: c.primary };

  const renderItem = ({ item }: { item: MarketItem }) => (
    <Card theme={theme}>
      <View style={styles.itemHeader}>
        <Avatar uri={item.sellerAvatar} size={36} theme={theme} name={item.sellerName} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: c.text }}>{item.sellerName}</Text>
          <Text style={{ fontSize: 11, color: c.textMuted }}>{item.location} · {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        {item.sold && <Badge theme={theme} text="SOLD" color={c.error} size="small" />}
      </View>

      <Text style={[styles.itemTitle, { color: c.text }]}>{item.title}</Text>
      <Text style={[styles.itemDesc, { color: c.textSecondary }]} numberOfLines={2}>{item.description}</Text>

      <View style={styles.itemMeta}>
        <Text style={[styles.itemPrice, { color: c.primary }]}>{formatPrice(item.price, item.currency)}</Text>
        <Badge theme={theme} text={item.condition.toUpperCase()} color={conditionColors[item.condition]} size="small" />
        <Badge theme={theme} text={item.category} color={c.primaryLight} size="small" />
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
          <Ionicons
            name={item.likes.includes(user?.id || '') ? 'heart' : 'heart-outline'}
            size={20}
            color={item.likes.includes(user?.id || '') ? c.error : c.textSecondary}
          />
          <Text style={{ fontSize: 12, color: c.textSecondary, marginLeft: 4 }}>{item.likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="eye-outline" size={18} color={c.textSecondary} />
          <Text style={{ fontSize: 12, color: c.textSecondary, marginLeft: 4 }}>{item.views}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={c.textSecondary} />
          <Text style={{ fontSize: 12, color: c.textSecondary, marginLeft: 4 }}>Message</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        theme={theme}
        title="Market 🛍️"
        subtitle="Buy & sell in the community"
        right={
          <TouchableOpacity onPress={() => setShowCreate(true)} style={[styles.sellBtn, { backgroundColor: c.primary }]}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 2 }}>Sell</Text>
          </TouchableOpacity>
        }
      />

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {marketCategories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.catBtn, {
              backgroundColor: category === cat ? c.primary : c.surfaceAlt,
              borderColor: category === cat ? c.primary : c.border,
            }]}
          >
            <Text style={{ color: category === cat ? '#fff' : c.text, fontSize: 13, fontWeight: '600' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        ListEmptyComponent={<EmptyState theme={theme} icon="🛍️" title="No items found" subtitle="Be the first to list something!" />}
      />

      {/* Create Item Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>List an Item</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={28} color={c.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]} placeholder="Item title" placeholderTextColor={c.textMuted} value={title} onChangeText={setTitle} />
              <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }, { minHeight: 80 }]} placeholder="Description" placeholderTextColor={c.textMuted} value={desc} onChangeText={setDesc} multiline />
              <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]} placeholder="Price (in Leones)" placeholderTextColor={c.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" />
              <TextInput style={[styles.modalInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]} placeholder="Location (e.g. Freetown)" placeholderTextColor={c.textMuted} value={location} onChangeText={setLocation} />
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary }}>Condition</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['new', 'used', 'refurbished'] as const).map(cond => (
                    <TouchableOpacity key={cond} onPress={() => setItemCondition(cond)} style={[styles.condBtn, { backgroundColor: itemCondition === cond ? c.primary : c.surfaceAlt, borderColor: itemCondition === cond ? c.primary : c.border }]}>
                      <Text style={{ color: itemCondition === cond ? '#fff' : c.text, fontSize: 13, fontWeight: '600' }}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Button theme={theme} title="List Item" onPress={handleCreate} size="large" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  catRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5 },
  list: { padding: 16, paddingTop: 4 },
  sellBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  itemDesc: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  itemPrice: { fontSize: 18, fontWeight: '800' },
  itemActions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', paddingTop: 10, gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  condBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
});
