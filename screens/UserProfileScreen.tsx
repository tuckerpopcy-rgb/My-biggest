import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Avatar, Button, Card, Empty } from '../components/UI';
import { VaultImage } from '../components/VaultImage';
import { timeAgo } from '../lib/hash';

export default function UserProfileScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const userId = route.params?.userId as string;
  const {
    palette,
    t,
    getUser,
    posts,
    user,
    followUser,
    isFollowing,
    followerCount,
    followingCount,
    openConversation,
  } = useApp();
  const person = getUser(userId);
  const theirs = useMemo(() => posts.filter((p) => p.userId === userId), [posts, userId]);

  if (!person) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <Empty icon="person-outline" title="Account not found" />
      </SafeAreaView>
    );
  }

  const mine = user?.id === person.id;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlatList
        data={theirs}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            {person.coverImage ? (
              <VaultImage uri={person.coverImage} style={{ width: '100%', height: 120, borderRadius: 16, marginBottom: -40 }} />
            ) : null}
            <Avatar uri={person.avatar} name={person.displayName} size={88} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>
                {person.displayName}
              </Text>
              {person.verified ? <Ionicons name="checkmark-circle" size={18} color={palette.accent} /> : null}
            </View>
            <Text style={{ color: palette.muted }}>@{person.username}</Text>
            {person.isDeveloper ? (
              <Text style={{ color: palette.accent, fontWeight: '800', marginTop: 4 }}>{t('developer')}</Text>
            ) : null}
            <Text style={{ color: palette.text, textAlign: 'center', marginTop: 8 }}>
              {person.bio || `${person.displayName} from ${person.location}`}
            </Text>
            <Text style={{ color: palette.muted, marginTop: 6 }}>
              {person.location} · {person.tribe || 'Salone'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
              <Text style={{ color: palette.text, fontWeight: '800' }}>
                {followerCount(person.id)} <Text style={{ color: palette.muted, fontWeight: '500' }}>{t('followers')}</Text>
              </Text>
              <Text style={{ color: palette.text, fontWeight: '800' }}>
                {followingCount(person.id)} <Text style={{ color: palette.muted, fontWeight: '500' }}>{t('following')}</Text>
              </Text>
            </View>
            {!mine ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, width: '100%' }}>
                <Button
                  title={isFollowing(person.id) ? t('unfollow') : t('follow')}
                  variant={isFollowing(person.id) ? 'soft' : 'primary'}
                  onPress={() => followUser(person.id)}
                  style={{ flex: 1 }}
                />
                <Button
                  title={t('startChat')}
                  variant="ghost"
                  onPress={async () => {
                    const id = await openConversation(person.id);
                    nav.navigate('Chat', { conversationId: id });
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={<Empty icon="newspaper-outline" title="No posts from this account yet." />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <Text style={{ color: palette.muted, fontSize: 12 }}>{timeAgo(item.createdAt)}</Text>
            <Text style={{ color: palette.text, marginTop: 6 }}>{item.content}</Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
