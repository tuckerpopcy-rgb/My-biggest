import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Avatar, Button, Card, Chip, Empty, Field, FlagBar } from '../components/UI';
import { VaultImage } from '../components/VaultImage';
import { Listing, ListingCategory } from '../lib/types';
import { timeAgo } from '../lib/hash';

const CATS: ListingCategory[] = [
  'food',
  'fashion',
  'electronics',
  'agriculture',
  'services',
  'crafts',
  'transport',
  'property',
  'other',
];

export default function MarketScreen() {
  const nav = useNavigation<any>();
  const {
    palette,
    t,
    listings,
    user,
    getUser,
    createListing,
    markListingSold,
    deleteListing,
    openConversation,
    tap,
    isPremium,
    boostListing,
  } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ListingCategory | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(user?.location || '');
  const [category, setCategory] = useState<ListingCategory>('food');
  const [img, setImg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Listing | null>(null);

  const data = useMemo(() => {
    return listings
      .filter((l) => (cat === 'all' ? true : l.category === cat))
      .filter((l) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return (
          l.title.toLowerCase().includes(s) ||
          l.description.toLowerCase().includes(s) ||
          l.location.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => {
        if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
  }, [listings, cat, q]);

  const pick = async () => {
    tap();
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]?.uri) setImg(res.assets[0].uri);
  };

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;
    await createListing({
      title,
      description,
      price: Number(price) || 0,
      category,
      location,
      image: img,
    });
    setOpen(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setImg(null);
  };

  const messageSeller = async (listing: Listing) => {
    if (!user || listing.userId === user.id) return;
    const id = await openConversation(listing.userId);
    setDetail(null);
    nav.navigate('Chat', { conversationId: id });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top']}>
      <FlagBar />
      <View style={[styles.head, { backgroundColor: palette.header, borderBottomColor: palette.border }]}>
        <View>
          <Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SALONE</Text>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>{t('market')}</Text>
        </View>
        <Button title={t('sell')} icon="add" onPress={() => setOpen(true)} style={{ paddingHorizontal: 14, minHeight: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
        <View style={[styles.search, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="search" size={18} color={palette.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('search')}
            placeholderTextColor={palette.muted}
            style={{ flex: 1, color: palette.text, marginLeft: 8, paddingVertical: 8 }}
          />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...CATS] as const}
          keyExtractor={(i) => i}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <Chip
              label={item === 'all' ? t('all') : t(item)}
              active={cat === item}
              onPress={() => setCat(item as any)}
            />
          )}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        numColumns={1}
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 450);
        }}
        ListEmptyComponent={<Empty icon="storefront-outline" title={t('noListings')} />}
        renderItem={({ item }) => {
          const seller = getUser(item.userId);
          return (
            <Pressable onPress={() => setDetail(item)}>
              <Card style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                {item.image ? (
                  <VaultImage uri={item.image} style={{ width: '100%', height: 160 }} />
                ) : (
                  <View style={[styles.ph, { backgroundColor: palette.bgAlt }]}>
                    <Ionicons name="cube-outline" size={36} color={palette.primary} />
                  </View>
                )}
                <View style={{ padding: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: palette.text, fontWeight: '800', fontSize: 16, flex: 1 }}>
                      {item.boosted ? '⚡ ' : ''}
                      {item.title}
                    </Text>
                    <Text style={{ color: palette.primary, fontWeight: '900' }}>
                      {item.price ? `Le ${item.price.toLocaleString()}` : 'Talk'}
                    </Text>
                  </View>
                  <Text style={{ color: palette.muted, marginTop: 4 }} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 }}>
                    <Avatar uri={seller?.avatar} name={seller?.displayName} size={24} />
                    <Text style={{ color: palette.muted, fontSize: 12, flex: 1 }}>
                      {seller?.displayName} · {item.location} · {timeAgo(item.createdAt)}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        backgroundColor: item.status === 'sold' ? palette.border : palette.bgAlt,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: palette.text }}>
                        {item.status === 'sold' ? t('sold') : t('available')}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
          <View style={[styles.modalHead, { borderBottomColor: palette.border }]}>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={{ color: palette.primary, fontWeight: '700' }}>{t('cancel')}</Text>
            </Pressable>
            <Text style={{ color: palette.text, fontWeight: '800' }}>{t('newListing')}</Text>
            <View style={{ width: 50 }} />
          </View>
          <FlatList
            data={[]}
            renderItem={null}
            ListHeaderComponent={
              <View style={{ padding: 16 }}>
                <Field label={t('title')} value={title} onChangeText={setTitle} placeholder="Cassava leaf, 5kg" />
                <Field
                  label={t('description')}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Fresh from Bo market…"
                  multiline
                />
                <Field
                  label={t('price')}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="150"
                />
                <Field label={t('location')} value={location} onChangeText={setLocation} />
                <Text style={{ color: palette.muted, fontWeight: '700', fontSize: 12, marginBottom: 8 }}>
                  {t('category').toUpperCase()}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {CATS.map((c) => (
                    <Chip key={c} label={t(c)} active={category === c} onPress={() => setCategory(c)} />
                  ))}
                </View>
                {img ? <VaultImage uri={img} style={{ width: '100%', height: 160, borderRadius: 14, marginBottom: 12 }} /> : null}
                <Button title={t('uploadPhoto')} icon="image-outline" variant="soft" onPress={pick} />
                <View style={{ height: 10 }} />
                <Button title={t('publish')} onPress={submit} disabled={!title.trim() || !description.trim()} />
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      <Modal visible={!!detail} animationType="fade" transparent onRequestClose={() => setDetail(null)}>
        <Pressable style={styles.overlay} onPress={() => setDetail(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: palette.card }]} onPress={() => {}}>
            {detail?.image ? (
              <VaultImage uri={detail.image} style={{ width: '100%', height: 180 }} />
            ) : null}
            <View style={{ padding: 16 }}>
              <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>{detail?.title}</Text>
              <Text style={{ color: palette.primary, fontWeight: '800', marginTop: 4 }}>
                {detail?.price ? `Le ${detail.price.toLocaleString()}` : 'Price on request'}
              </Text>
              <Text style={{ color: palette.text, marginTop: 10, lineHeight: 21 }}>{detail?.description}</Text>
              <Text style={{ color: palette.muted, marginTop: 8 }}>
                {detail?.location} · {detail ? t(detail.category) : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                {detail && user && detail.userId !== user.id ? (
                  <Button title={t('contactSeller')} icon="chatbubble" onPress={() => messageSeller(detail)} style={{ flex: 1 }} />
                ) : null}
                {detail && user && (detail.userId === user.id || user.isDeveloper) ? (
                  <>
                    {detail.status !== 'sold' ? (
                      <Button title={t('markSold')} variant="soft" onPress={() => { markListingSold(detail.id); setDetail({ ...detail, status: 'sold' }); }} style={{ flex: 1 }} />
                    ) : null}
                    {!detail.boosted ? (
                      <Button
                        title={t('boost')}
                        variant="soft"
                        onPress={() => {
                          if (!isPremium()) {
                            setDetail(null);
                            nav.navigate('Premium');
                            return;
                          }
                          boostListing(detail.id);
                          setDetail({ ...detail, boosted: true });
                        }}
                        style={{ flex: 1 }}
                      />
                    ) : null}
                    <Button title={t('delete')} variant="danger" onPress={() => { deleteListing(detail.id); setDetail(null); }} style={{ flex: 1 }} />
                  </>
                ) : null}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 12 },
  ph: { height: 120, alignItems: 'center', justifyContent: 'center' },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden', maxHeight: '88%' },
});
