import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { SalonVideo } from '../components/SalonVideo';
import { VaultImage } from '../components/VaultImage';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Avatar, Button, Card, Empty, FlagBar, IconBtn } from '../components/UI';
import { timeAgo } from '../lib/hash';
import { Post, User } from '../lib/types';

export default function FeedScreen() {
  const nav = useNavigation<any>();
  const {
    palette,
    t,
    posts,
    user,
    getUser,
    createMediaPost,
    toggleLike,
    addComment,
    deletePost,
    unreadCount,
    tap,
    isPremium,
    toggleSavePost,
    isSaved,
    boostPost,
  } = useApp();
  const [composer, setComposer] = useState(false);
  const [text, setText] = useState('');
  const [img, setImg] = useState<string | null>(null);
  const [vid, setVid] = useState<string | null>(null);
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () =>
      [...posts].sort((a, b) => {
        if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
        return b.createdAt - a.createdAt;
      }),
    [posts]
  );
  const active = posts.find((p) => p.id === openPost);

  const pick = async () => {
    tap();
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: false,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setImg(res.assets[0].uri);
      setVid(null);
    }
  };

  const pickVideo = async () => {
    tap();
    if (!isPremium()) {
      setComposer(false);
      nav.navigate('Premium');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.6,
      videoMaxDuration: 120,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setVid(res.assets[0].uri);
      setImg(null);
    }
  };

  const publish = async () => {
    setBusy(true);
    try {
      await createMediaPost({ content: text, image: img, video: vid });
      setText('');
      setImg(null);
      setVid(null);
      setComposer(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top']}>
      <FlagBar />
      <View style={[styles.header, { backgroundColor: palette.header, borderBottomColor: palette.border }]}>
        <View>
          <Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SALONE</Text>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>{t('feed')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconBtn name="videocam-outline" color={palette.text} onPress={() => nav.navigate('Studio')} />
          <IconBtn name="help-circle-outline" color={palette.text} onPress={() => nav.navigate('Quiz')} />
          <IconBtn name="sparkles" color={palette.primary} onPress={() => nav.navigate('SalonAI')} />
          <IconBtn
            name="notifications-outline"
            color={palette.text}
            badge={unreadCount()}
            onPress={() => nav.navigate('Notifications')}
          />
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 500);
        }}
        ListHeaderComponent={
          <Pressable
            onPress={() => {
              tap();
              setComposer(true);
            }}
            style={[styles.composer, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Avatar uri={user?.avatar} name={user?.displayName} size={40} />
            <Text style={{ color: palette.muted, flex: 1, marginLeft: 10 }}>{t('whatsHappening')}</Text>
            <Ionicons name="create-outline" size={20} color={palette.primary} />
          </Pressable>
        }
        ListEmptyComponent={<Empty icon="newspaper-outline" title={t('noPosts')} />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            author={getUser(item.userId)}
            meId={user?.id}
            premium={isPremium()}
            saved={isSaved(item.id)}
            onLike={() => toggleLike(item.id)}
            onComment={() => setOpenPost(item.id)}
            onDelete={() => deletePost(item.id)}
            onAuthor={() => nav.navigate('UserProfile', { userId: item.userId })}
            onSave={() => toggleSavePost(item.id)}
            onBoost={() => boostPost(item.id)}
          />
        )}
      />

      <Modal visible={composer} animationType="slide" onRequestClose={() => setComposer(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
          <View style={[styles.modalHead, { borderBottomColor: palette.border }]}>
            <Pressable onPress={() => setComposer(false)}>
              <Text style={{ color: palette.primary, fontWeight: '700' }}>{t('cancel')}</Text>
            </Pressable>
            <Text style={{ color: palette.text, fontWeight: '800' }}>{t('writePost')}</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={{ padding: 16, flex: 1 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('whatsHappening')}
              placeholderTextColor={palette.muted}
              multiline
              style={{ color: palette.text, fontSize: 17, minHeight: 140, textAlignVertical: 'top' }}
            />
            {img ? <VaultImage uri={img} style={styles.preview} /> : null}
            {vid ? <SalonVideo uri={vid} height={200} autoPlay /> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button title={t('uploadPhoto')} icon="image-outline" variant="soft" onPress={pick} style={{ flex: 1 }} />
              <Button title={t('uploadVideo')} icon="videocam-outline" variant="soft" onPress={pickVideo} style={{ flex: 1 }} />
            </View>
            <Button
              title={t('publish')}
              onPress={publish}
              loading={busy}
              style={{ marginTop: 10 }}
              disabled={(!text.trim() && !img && !vid) || busy}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!active} animationType="slide" onRequestClose={() => setOpenPost(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalHead, { borderBottomColor: palette.border }]}>
              <Pressable onPress={() => setOpenPost(null)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
              <Text style={{ color: palette.text, fontWeight: '800' }}>{t('comments')}</Text>
              <View style={{ width: 24 }} />
            </View>
            <FlatList
              data={active?.comments || []}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={<Empty icon="chatbubble-outline" title="No comments yet" body="Be the first to speak." />}
              renderItem={({ item: c }) => {
                const a = getUser(c.userId);
                return (
                  <View style={{ flexDirection: 'row', marginBottom: 14, gap: 10 }}>
                    <Avatar uri={a?.avatar} name={a?.displayName} size={34} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: palette.text, fontWeight: '700' }}>
                        {a?.displayName || 'Member'}{' '}
                        <Text style={{ color: palette.muted, fontWeight: '500', fontSize: 12 }}>{timeAgo(c.createdAt)}</Text>
                      </Text>
                      <Text style={{ color: palette.text, marginTop: 2 }}>{c.content}</Text>
                    </View>
                  </View>
                );
              }}
            />
            <View style={[styles.commentBar, { borderTopColor: palette.border, backgroundColor: palette.card }]}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t('writeComment')}
                placeholderTextColor={palette.muted}
                style={[styles.commentIn, { color: palette.text, backgroundColor: palette.input, borderColor: palette.border }]}
              />
              <Pressable
                onPress={async () => {
                  if (!active) return;
                  await addComment(active.id, comment);
                  setComment('');
                }}
              >
                <Ionicons name="send" size={22} color={palette.primary} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function PostCard({
  post,
  author,
  meId,
  premium,
  saved,
  onLike,
  onComment,
  onDelete,
  onAuthor,
  onSave,
  onBoost,
}: {
  post: Post;
  author?: User;
  meId?: string;
  premium?: boolean;
  saved?: boolean;
  onLike: () => void;
  onComment: () => void;
  onDelete: () => void;
  onAuthor: () => void;
  onSave: () => void;
  onBoost: () => void;
}) {
  const { palette, t } = useApp();
  const liked = meId ? post.likes.includes(meId) : false;
  return (
    <Card style={{ marginTop: 12 }}>
      <Pressable onPress={onAuthor} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar uri={author?.avatar} name={author?.displayName} size={42} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: palette.text, fontWeight: '800' }}>
              {author?.displayName || 'Salone voice'}
            </Text>
            {author?.verified ? <Ionicons name="checkmark-circle" size={14} color={palette.accent} /> : null}
            {author?.isDeveloper ? (
              <Text style={{ color: palette.accent, fontWeight: '800', fontSize: 12 }}> · Dev</Text>
            ) : null}
            {post.boosted ? (
              <Text style={{ color: palette.primary, fontWeight: '800', fontSize: 11 }}> · {t('boosted')}</Text>
            ) : null}
          </View>
          <Text style={{ color: palette.muted, fontSize: 12 }}>
            @{author?.username} · {author?.location || 'Salone'} · {timeAgo(post.createdAt)}
          </Text>
        </View>
        {meId === post.userId ? (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={palette.muted} />
          </Pressable>
        ) : null}
      </Pressable>
      {post.content ? (
        <Text style={{ color: palette.text, marginTop: 10, fontSize: 15.5, lineHeight: 22 }}>{post.content}</Text>
      ) : null}
      {post.image ? <VaultImage uri={post.image} style={styles.postImg} /> : null}
      {post.video ? <SalonVideo uri={post.video} height={220} autoPlay /> : null}
      <View style={styles.actions}>
        <Pressable onPress={onLike} style={styles.act}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#E11D48' : palette.muted} />
          <Text style={{ color: palette.muted, fontWeight: '700' }}>{post.likes.length}</Text>
        </Pressable>
        <Pressable onPress={onComment} style={styles.act}>
          <Ionicons name="chatbubble-outline" size={18} color={palette.muted} />
          <Text style={{ color: palette.muted, fontWeight: '700' }}>
            {post.comments.length} {t('comment')}
          </Text>
        </Pressable>
        <Pressable onPress={onSave} style={styles.act}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? palette.accent : palette.muted} />
        </Pressable>
        {meId === post.userId && premium && !post.boosted ? (
          <Pressable onPress={onBoost} style={styles.act}>
            <Ionicons name="flash-outline" size={18} color={palette.primary} />
            <Text style={{ color: palette.primary, fontWeight: '700', fontSize: 12 }}>{t('boost')}</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  preview: { width: '100%', height: 200, borderRadius: 14, marginTop: 8 },
  postImg: { width: '100%', height: 220, borderRadius: 14, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 18, marginTop: 12 },
  act: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentIn: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
});
