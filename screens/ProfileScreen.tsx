import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SalonVideo } from '../components/SalonVideo';
import { VaultImage } from '../components/VaultImage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Avatar, Button, Card, ConfirmSheet, Field, FlagBar } from '../components/UI';
import { timeAgo } from '../lib/hash';

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const {
    palette,
    t,
    user,
    posts,
    videos,
    followerCount,
    followingCount,
    saveProfile,
    logout,
    tap,
    isPremium,
  } = useApp();

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [tribe, setTribe] = useState(user?.tribe || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [cover, setCover] = useState<string | null>(user?.coverImage || null);
  const [intro, setIntro] = useState<string | null>(user?.introVideo || null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [outAsk, setOutAsk] = useState(false);
  const [outBusy, setOutBusy] = useState(false);
  const [leaveAsk, setLeaveAsk] = useState(false);

  useEffect(() => {
    if (edit && user && !dirty) {
      setName(user.displayName);
      setBio(user.bio);
      setLocation(user.location);
      setTribe(user.tribe);
      setAvatar(user.avatar);
      setCover(user.coverImage);
      setIntro(user.introVideo);
    }
  }, [edit, user, dirty]);

  const mine = useMemo(() => posts.filter((p) => p.userId === user?.id), [posts, user?.id]);
  const myVideos = useMemo(() => videos.filter((v) => v.userId === user?.id), [videos, user?.id]);

  if (!user) return null;

  const premium = isPremium();

  const pickImage = async (target: 'avatar' | 'cover') => {
    tap();
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.72,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      if (target === 'avatar') setAvatar(res.assets[0].uri);
      else setCover(res.assets[0].uri);
      setDirty(true);
    }
  };

  const pickVideo = async () => {
    tap();
    if (!premium) {
      nav.navigate('Premium');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.6,
      videoMaxDuration: 90,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setIntro(res.assets[0].uri);
      setDirty(true);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert(t('fillAll'), 'Your name is required before saving.');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({
        displayName: name,
        bio,
        location,
        tribe,
        avatar,
        coverImage: cover,
        introVideo: intro,
      });
      setDirty(false);
      setEdit(false);
      Alert.alert(t('saved'), t('profileSaved'));
    } finally {
      setSaving(false);
    }
  };

  const confirmOut = () => {
    tap();
    setOutAsk(true);
  };

  const doLogout = async () => {
    if (outBusy) return;
    setOutBusy(true);
    try {
      await logout();
    } finally {
      setOutBusy(false);
      setOutAsk(false);
    }
  };

  const openEditor = () => {
    tap();
    setDirty(false);
    setName(user.displayName);
    setBio(user.bio);
    setLocation(user.location);
    setTribe(user.tribe);
    setAvatar(user.avatar);
    setCover(user.coverImage);
    setIntro(user.introVideo);
    setEdit(true);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top']}>
      <FlagBar />
      <FlatList
        data={mine}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <View>
            <View style={{ height: 148, backgroundColor: palette.primary }}>
              {user.coverImage ? (
                <VaultImage uri={user.coverImage} style={{ width: '100%', height: 148 }} />
              ) : (
                <Image source={require('../assets/salon-logo.png')} style={styles.coverMark} contentFit="contain" />
              )}
            </View>
            <View style={{ paddingHorizontal: 16, marginTop: -42 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Avatar uri={user.avatar} name={user.displayName} size={88} />
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <Pressable onPress={() => { tap(); nav.navigate('Studio'); }} style={[styles.round, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <Ionicons name="videocam-outline" size={18} color={palette.text} />
                  </Pressable>
                  <Pressable onPress={() => { tap(); nav.navigate('Settings'); }} style={[styles.round, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <Ionicons name="settings-outline" size={18} color={palette.text} />
                  </Pressable>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>{user.displayName}</Text>
                  {user.verified ? <Ionicons name="checkmark-circle" size={18} color={palette.accent} /> : null}
                </View>
                <Text style={{ color: palette.muted }}>@{user.username}</Text>
                {user.isDeveloper ? (
                  <Text style={{ color: palette.accent, fontWeight: '800', marginTop: 4 }}>{t('developer')}</Text>
                ) : premium ? (
                  <Text style={{ color: palette.accent, fontWeight: '800', marginTop: 4 }}>{t('premiumLive')}</Text>
                ) : null}
                <Text style={{ color: palette.text, marginTop: 8 }}>{user.bio || 'Salone voice. No bio yet.'}</Text>
                <Text style={{ color: palette.muted, marginTop: 6 }}>
                  {user.location} · {user.tribe || 'Salone'} · joined {timeAgo(user.createdAt)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 18, marginTop: 14 }}>
                <Stat n={followerCount(user.id)} l={t('followers')} color={palette.text} muted={palette.muted} />
                <Stat n={followingCount(user.id)} l={t('following')} color={palette.text} muted={palette.muted} />
                <Stat n={mine.length} l={t('post')} color={palette.text} muted={palette.muted} />
                <Stat n={myVideos.length} l={t('videos')} color={palette.text} muted={palette.muted} />
              </View>
              {user.introVideo ? <SalonVideo uri={user.introVideo} height={180} autoPlay /> : null}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                <Button title={t('editProfile')} variant="soft" onPress={openEditor} style={{ flex: 1 }} />
                <Button
                  title={premium ? t('premium') : t('goPremium')}
                  variant={premium ? 'ghost' : 'primary'}
                  onPress={() => nav.navigate('Premium')}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Button title={t('academy')} variant="ghost" onPress={() => nav.navigate('Academy')} style={{ flex: 1 }} />
                <Button title={t('aboutDev')} variant="ghost" onPress={() => nav.navigate('AboutDeveloper')} style={{ flex: 1 }} />
              </View>
              <Button title={t('logout')} variant="danger" onPress={confirmOut} style={{ marginTop: 8 }} />
              <Text style={{ color: palette.text, fontWeight: '800', marginTop: 22, marginBottom: 8 }}>Your posts</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ color: palette.muted, textAlign: 'center', padding: 20 }}>No posts yet from this account.</Text>
        }
        renderItem={({ item }) => (
          <Card style={{ marginHorizontal: 16, marginBottom: 10 }}>
            <Text style={{ color: palette.muted, fontSize: 12 }}>{timeAgo(item.createdAt)}</Text>
            <Text style={{ color: palette.text, marginTop: 6 }}>{item.content}</Text>
            {item.image ? (
              <VaultImage uri={item.image} style={{ height: 160, borderRadius: 12, marginTop: 8 }} />
            ) : null}
            {item.video ? <SalonVideo uri={item.video} height={180} autoPlay /> : null}
          </Card>
        )}
      />

      <Modal visible={edit} animationType="slide" onRequestClose={() => setEdit(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalHead, { borderBottomColor: palette.border }]}>
              <Pressable
                onPress={() => {
                  if (dirty) setLeaveAsk(true);
                  else setEdit(false);
                }}
              >
                <Text style={{ color: palette.primary, fontWeight: '700' }}>{t('cancel')}</Text>
              </Pressable>
              <Text style={{ color: palette.text, fontWeight: '800' }}>{t('editProfile')}</Text>
              <Pressable onPress={save} disabled={saving || !dirty} hitSlop={8}>
                <Text style={{ color: dirty ? palette.primary : palette.muted, fontWeight: '800' }}>
                  {saving ? '…' : t('save')}
                </Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              <Pressable onPress={() => pickImage('cover')} style={[styles.coverEdit, { backgroundColor: palette.primary }]}>
                {cover ? <VaultImage uri={cover} style={StyleSheet.absoluteFill} /> : null}
                <View style={[styles.coverBtn, { backgroundColor: palette.overlay }]}>
                  <Ionicons name="image" size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 6 }}>{t('changeCover')}</Text>
                </View>
              </Pressable>

              <View style={{ alignItems: 'center', marginTop: -36, marginBottom: 12 }}>
                <Pressable onPress={() => pickImage('avatar')}>
                  <Avatar uri={avatar} name={name} size={88} />
                  <View style={[styles.cam, { backgroundColor: palette.primary }]}>
                    <Ionicons name="camera" size={14} color={palette.primaryText} />
                  </View>
                </Pressable>
                <Text style={{ color: palette.muted, marginTop: 8, fontSize: 12 }}>{t('changePhoto')}</Text>
              </View>

              <Field label={t('displayName')} value={name} onChangeText={(v) => { setName(v); setDirty(true); }} />
              <Field label={t('bio')} value={bio} onChangeText={(v) => { setBio(v); setDirty(true); }} multiline />
              <Field label={t('location')} value={location} onChangeText={(v) => { setLocation(v); setDirty(true); }} />
              <Field label={t('tribe')} value={tribe} onChangeText={(v) => { setTribe(v); setDirty(true); }} />

              <Text style={{ color: palette.muted, fontWeight: '800', fontSize: 12, letterSpacing: 0.6, marginBottom: 8 }}>
                {t('introVideo').toUpperCase()}
              </Text>
              {intro ? (
                <SalonVideo uri={intro} height={180} autoPlay />
              ) : (
                <Text style={{ color: palette.muted, marginBottom: 8 }}>
                  {premium ? 'Add a short intro. It saves to the Salone cloud with your profile.' : 'Premium unlocks intro video on your profile.'}
                </Text>
              )}
              <Button title={t('uploadVideo')} icon="videocam-outline" variant="soft" onPress={pickVideo} />

              <Button
                title={saving ? 'Saving…' : t('saveProfile')}
                icon="checkmark-circle"
                onPress={save}
                loading={saving}
                disabled={saving}
                style={{ marginTop: 16 }}
              />
              <Text style={{ color: palette.muted, fontSize: 12, marginTop: 10, textAlign: 'center' }}>
                Photos and videos are stored in your permanent account. Nothing is kept until you tap Save.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <ConfirmSheet
        visible={leaveAsk}
        title="Unsaved changes"
        body="Save your photo and video to your permanent profile before leaving?"
        confirmLabel={t('save')}
        cancelLabel="Discard"
        busy={saving}
        onCancel={() => {
          setLeaveAsk(false);
          setEdit(false);
        }}
        onConfirm={async () => {
          await save();
          setLeaveAsk(false);
        }}
      />
      <ConfirmSheet
        visible={outAsk}
        title={t('confirmLogout')}
        body={t('confirmLogoutBody')}
        confirmLabel={t('yesLogout')}
        cancelLabel={t('cancel')}
        danger
        busy={outBusy}
        onCancel={() => { if (!outBusy) setOutAsk(false); }}
        onConfirm={doLogout}
      />
    </SafeAreaView>
  );
}

function Stat({ n, l, color, muted }: { n: number; l: string; color: string; muted: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color, fontWeight: '900', fontSize: 18 }}>{n}</Text>
      <Text style={{ color: muted, fontSize: 11 }}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  coverMark: { width: 72, height: 72, alignSelf: 'center', marginTop: 36, opacity: 0.35 },
  cam: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  intro: { width: '100%', height: 180, borderRadius: 14, marginTop: 12, backgroundColor: '#000' },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  coverEdit: { height: 130, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center' },
  coverBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
});
