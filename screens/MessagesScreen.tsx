import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Avatar, Empty, FlagBar } from '../components/UI';
import { timeAgo } from '../lib/hash';

export default function MessagesScreen() {
  const nav = useNavigation<any>();
  const { palette, t, conversations, messages, user, users, openConversation, tap } = useApp();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'chats' | 'people'>('chats');

  const mine = useMemo(() => {
    if (!user) return [];
    return conversations
      .filter((c) => c.participants.includes(user.id))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [conversations, user]);

  const people = useMemo(() => {
    if (!user) return [];
    const s = q.trim().toLowerCase();
    return users
      .filter((u) => u.id !== user.id)
      .filter((u) =>
        !s
          ? true
          : u.displayName.toLowerCase().includes(s) ||
            u.username.toLowerCase().includes(s) ||
            u.location.toLowerCase().includes(s)
      );
  }, [users, user, q]);

  const unreadFor = (cid: string) =>
    messages.filter((m) => m.conversationId === cid && m.senderId !== user?.id && !m.read).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top']}>
      <FlagBar />
      <View style={[styles.head, { borderBottomColor: palette.border }]}>
        <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>{t('messages')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tab label={t('messages')} active={tab === 'chats'} onPress={() => setTab('chats')} />
          <Tab label={t('people')} active={tab === 'people'} onPress={() => setTab('people')} />
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('search')}
          placeholderTextColor={palette.muted}
          style={[
            styles.search,
            { backgroundColor: palette.card, color: palette.text, borderColor: palette.border },
          ]}
        />
      </View>
      {tab === 'chats' ? (
        <FlatList
          data={mine}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
          ListEmptyComponent={<Empty icon="chatbubbles-outline" title={t('noMessages')} body={t('emptyChat')} />}
          renderItem={({ item }) => {
            const otherId = item.participants.find((p) => p !== user?.id);
            const other = users.find((u) => u.id === otherId);
            const n = unreadFor(item.id);
            return (
              <Pressable
                onPress={() => {
                  tap();
                  nav.navigate('Chat', { conversationId: item.id });
                }}
                style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
              >
                <Avatar uri={other?.avatar} name={other?.displayName} size={48} badge />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: palette.text, fontWeight: '800' }}>{other?.displayName || 'Member'}</Text>
                    <Text style={{ color: palette.muted, fontSize: 11 }}>
                      {item.lastMessageAt ? timeAgo(item.lastMessageAt) : ''}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={{ color: n ? palette.text : palette.muted, marginTop: 3, fontWeight: n ? '700' : '400' }}>
                    {item.lastMessage || t('emptyChat')}
                  </Text>
                </View>
                {n > 0 ? (
                  <View style={[styles.badge, { backgroundColor: palette.primary }]}>
                    <Text style={{ color: palette.primaryText, fontWeight: '800', fontSize: 11 }}>{n}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
          ListEmptyComponent={<Empty icon="people-outline" title={t('noUsers')} body="Only real registered accounts appear here." />}
          renderItem={({ item }) => (
            <Pressable
              onPress={async () => {
                tap();
                const id = await openConversation(item.id);
                nav.navigate('Chat', { conversationId: id });
              }}
              style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Avatar uri={item.avatar} name={item.displayName} size={48} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: palette.text, fontWeight: '800' }}>
                  {item.displayName} {item.isDeveloper ? '· Dev' : ''}
                </Text>
                <Text style={{ color: palette.muted, marginTop: 2 }}>
                  @{item.username} · {item.location} · {item.tribe || 'Salone'}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { palette, tap } = useApp();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? palette.primary : palette.bgAlt,
      }}
    >
      <Text style={{ color: active ? palette.primaryText : palette.text, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  badge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
