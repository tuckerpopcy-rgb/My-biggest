import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Button, Card, Empty, FlagBar } from '../components/UI';
import { timeAgo } from '../lib/hash';

export default function StudioScreen() {
  const nav = useNavigation<any>();
  const { palette, t, user, videos, createMediaPost, isPremium, tap, cloudReady } = useApp();
  const [caption, setCaption] = useState('');
  const [clip, setClip] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = useMemo(() => videos.filter((v) => v.userId === user?.id), [videos, user?.id]);
  const premium = isPremium();

  const pick = async () => {
    tap();
    if (!premium) {
      nav.navigate('Premium');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.6,
      videoMaxDuration: 120,
    });
    if (!res.canceled && res.assets[0]?.uri) setClip(res.assets[0].uri);
  };

  const publish = async () => {
    if (!clip) {
      Alert.alert('Choose a video', 'Pick a real clip from your library first.');
      return;
    }
    setBusy(true);
    try {
      await createMediaPost({ content: caption, video: clip });
      setCaption('');
      setClip(null);
      Alert.alert('Live', 'Your video is on the feed and in the Salone cloud library.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlagBar />
      <FlatList
        data={mine}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>{t('studio')}</Text>
            <Text style={{ color: palette.muted, marginTop: 4, marginBottom: 12 }}>
              {cloudReady ? 'Supabase media lane is ready. Real clips only — no demo reels.' : 'Preparing cloud lane…'}
            </Text>
            <Card>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Caption this Salone moment…"
                placeholderTextColor={palette.muted}
                style={{ color: palette.text, minHeight: 60, textAlignVertical: 'top' }}
                multiline
              />
              {clip ? (
                <Video source={{ uri: clip }} style={styles.preview} useNativeControls resizeMode={ResizeMode.COVER} />
              ) : (
                <Pressable onPress={pick} style={[styles.drop, { borderColor: palette.border, backgroundColor: palette.bgAlt }]}>
                  <Ionicons name="cloud-upload-outline" size={28} color={palette.primary} />
                  <Text style={{ color: palette.text, fontWeight: '700', marginTop: 8 }}>{t('uploadVideo')}</Text>
                  <Text style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>
                    {premium ? 'Stored on your account + cloud bucket salon-media' : 'Unlock with Premium'}
                  </Text>
                </Pressable>
              )}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button title="Pick clip" variant="soft" icon="film-outline" onPress={pick} style={{ flex: 1 }} />
                <Button title={t('publish')} onPress={publish} loading={busy} disabled={!clip || busy} style={{ flex: 1 }} />
              </View>
            </Card>
            <Text style={{ color: palette.text, fontWeight: '800', marginTop: 20, marginBottom: 8 }}>{t('cloud')}</Text>
          </View>
        }
        ListEmptyComponent={<Empty icon="videocam-off-outline" title={t('noVideos')} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
            <Video source={{ uri: item.publicUrl }} style={{ width: '100%', height: 200 }} useNativeControls resizeMode={ResizeMode.COVER} />
            <View style={{ padding: 12 }}>
              <Text style={{ color: palette.text, fontWeight: '700' }}>{item.caption || 'Untitled clip'}</Text>
              <Text style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>
                {timeAgo(item.createdAt)} · {item.path.startsWith('local/') ? 'device vault' : 'supabase · salon-media'}
              </Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  preview: { width: '100%', height: 180, borderRadius: 12, marginTop: 10, backgroundColor: '#000' },
  drop: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 22, alignItems: 'center', marginTop: 10 },
});
