// ============================================================
// Salon na we yon - Notifications Screen
// Updates from developer Henry Tucker
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import {
  getNotifications, markAsRead, markAllAsRead, deleteNotification,
} from '../lib/notifications';
import { Card, GradientHeader, Badge, Button, EmptyState, LoadingSpinner } from '../components/UIComponents';
import type { Notification } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationsScreen({ navigation }: any) {
  const { theme } = useApp();
  const c = theme.colors;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
    setLoading(false);
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    await loadNotifications();
  };

  const getNotifIcon = (type: string) => {
    const icons: Record<string, string> = {
      update: '📢', like: '❤️', comment: '💬', follow: '👤',
      subscription: '⭐', quiz: '🏆', system: '🔔',
    };
    return icons[type] || '🔔';
  };

  const getNotifColor = (type: string) => {
    const colors: Record<string, string> = {
      update: c.accent, like: c.error, comment: c.primary,
      follow: c.success, subscription: '#FFD700', quiz: c.warning, system: c.textSecondary,
    };
    return colors[type] || c.textSecondary;
  };

  if (loading) return <LoadingSpinner theme={theme} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        theme={theme}
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={{ color: c.primary, fontSize: 13, fontWeight: '700' }}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        renderItem={({ item: notif }) => (
          <Card
            theme={theme}
            onPress={() => !notif.read && handleMarkRead(notif.id)}
            style={{
              opacity: notif.read ? 0.7 : 1,
              borderLeftWidth: notif.read ? 0 : 4,
              borderLeftColor: getNotifColor(notif.type),
            }}
          >
            <View style={styles.notifRow}>
              <Text style={{ fontSize: 28 }}>{getNotifIcon(notif.type)}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, flex: 1 }}>{notif.title}</Text>
                  {!notif.read && <View style={[styles.unreadDot, { backgroundColor: getNotifColor(notif.type) }]} />}
                </View>
                <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4, lineHeight: 18 }}>{notif.message}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                  {notif.fromUserName && (
                    <Text style={{ fontSize: 12, color: c.primary, fontWeight: '600' }}>from {notif.fromUserName}</Text>
                  )}
                  <Text style={{ fontSize: 11, color: c.textMuted }}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(notif.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={18} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState theme={theme} icon="🔔" title="No notifications" subtitle="You're all caught up!" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
