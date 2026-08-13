import React, { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Empty } from '../components/UI';
import { timeAgo } from '../lib/hash';
import { NotificationType } from '../lib/types';

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  like: 'heart',
  comment: 'chatbubble',
  message: 'mail',
  follow: 'person-add',
  system: 'sparkles',
  market: 'storefront',
  quiz: 'help-circle',
  video: 'videocam',
  academy: 'school',
};

export default function NotificationsScreen() {
  const { palette, t, notifications, user, markNotificationsRead } = useApp();
  const mine = useMemo(
    () => notifications.filter((n) => n.userId === user?.id),
    [notifications, user?.id]
  );

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlatList
        data={mine}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        ListEmptyComponent={<Empty icon="notifications-off-outline" title={t('noNotifications')} />}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
                opacity: item.read ? 0.78 : 1,
              },
            ]}
          >
            <View style={[styles.ic, { backgroundColor: palette.bgAlt }]}>
              <Ionicons name={ICONS[item.type] || 'notifications'} size={18} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: '800' }}>{item.title}</Text>
              <Text style={{ color: palette.muted, marginTop: 2 }}>{item.body}</Text>
            </View>
            <Text style={{ color: palette.muted, fontSize: 11 }}>{timeAgo(item.createdAt)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  ic: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
