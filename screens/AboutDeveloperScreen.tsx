import React, { useState } from 'react';
import {
  Alert,
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Button, Card, FlagBar } from '../components/UI';

export default function AboutDeveloperScreen() {
  const { palette, t, developer, user, updateDeveloper, tap, buzz, developerLogin } = useApp();
  const canEdit = !!user?.isDeveloper;
  const [gate, setGate] = useState(false);
  const [digits, setDigits] = useState('');
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    if (!canEdit) {
      Alert.alert('Developer only', 'Sign in as Henry Tucker to change this photo across the platform.');
      return;
    }
    tap();
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      await updateDeveloper({ image: res.assets[0].uri });
      buzz('success');
      Alert.alert(t('photoUpdated'), "Henry Tucker's image now appears everywhere this profile is shown.");
    }
  };

  const openGate = () => {
    tap();
    if (canEdit) {
      buzz('success');
      return;
    }
    setDigits('');
    setWrong(false);
    setGate(true);
  };

  const pressDigit = async (d: string) => {
    if (busy) return;
    tap();
    const next = (digits + d).slice(0, 4);
    setDigits(next);
    setWrong(false);
    if (next.length === 4) {
      setBusy(true);
      const res = await developerLogin(next);
      setBusy(false);
      if (res.ok) {
        setGate(false);
        setDigits('');
      } else {
        setWrong(true);
        setDigits('');
      }
    }
  };

  const backspace = () => {
    tap();
    setDigits((v) => v.slice(0, -1));
    setWrong(false);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlagBar />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
          <Pressable onPress={canEdit ? upload : undefined}>
            {developer.image ? (
              <Image source={{ uri: developer.image }} style={styles.photo} contentFit="cover" />
            ) : (
              <View style={[styles.photo, { backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={64} color={palette.primaryText} />
              </View>
            )}
            {canEdit ? (
              <View style={[styles.cam, { backgroundColor: palette.accent }]}>
                <Ionicons name="cloud-upload" size={16} color="#1a1200" />
              </View>
            ) : null}
          </Pressable>
          <Text style={{ color: palette.text, fontSize: 26, fontWeight: '900', marginTop: 14 }}>{developer.name}</Text>
          <Text style={{ color: palette.primary, fontWeight: '700', marginTop: 4 }}>{developer.title}</Text>
          <Text style={{ color: palette.muted, marginTop: 4 }}>{developer.location}</Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ color: palette.muted, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>ABOUT</Text>
          <Text style={{ color: palette.text, marginTop: 8, lineHeight: 23, fontSize: 15.5 }}>{developer.bio}</Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Row icon="mail-outline" label={developer.email} color={palette.text} muted={palette.muted} bg={palette.bgAlt} />
          <Row icon="location-outline" label={developer.location} color={palette.text} muted={palette.muted} bg={palette.bgAlt} />
          <Row icon="leaf-outline" label="Salone Na We Yon" color={palette.text} muted={palette.muted} bg={palette.bgAlt} />
        </Card>

        {canEdit ? (
          <Button title={t('uploadDevPhoto')} icon="image" onPress={upload} style={{ marginTop: 16 }} />
        ) : (
          <Text style={{ color: palette.muted, marginTop: 16, textAlign: 'center', lineHeight: 20 }}>
            Henry Tucker built Salone Na We Yon. His portrait and tools appear here once he is signed in.
          </Text>
        )}

        <View style={styles.hiddenWrap}>
          <Pressable onPress={openGate} hitSlop={18} style={styles.hiddenHit}>
            <View style={[styles.tinyLion, { borderColor: palette.primary }]}>
              <View style={[styles.tinyDot, { backgroundColor: palette.primary }]} />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={gate} transparent animationType="fade" onRequestClose={() => setGate(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.veil} onPress={() => setGate(false)}>
            <Pressable style={[styles.pad, { backgroundColor: palette.card, borderColor: palette.border }]} onPress={() => {}}>
              <View style={[styles.miniMark, { borderColor: palette.primary }]}>
                <View style={[styles.tinyDot, { backgroundColor: palette.primary }]} />
              </View>
              <View style={styles.dots}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.slot,
                      {
                        borderColor: wrong ? palette.danger : palette.border,
                        backgroundColor: digits.length > i ? (wrong ? palette.danger : palette.primary) : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
              {wrong ? (
                <Text style={{ color: palette.danger, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Try again</Text>
              ) : (
                <View style={{ height: 20 }} />
              )}
              <View style={styles.keys}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k) => {
                  if (!k) return <View key="sp" style={styles.key} />;
                  const del = k === '⌫';
                  return (
                    <Pressable
                      key={k}
                      onPress={() => (del ? backspace() : pressDigit(k))}
                      style={[styles.key, { backgroundColor: palette.bgAlt }]}
                    >
                      <Text style={{ color: palette.text, fontSize: del ? 18 : 20, fontWeight: '800' }}>{k}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  color,
  muted,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  muted: string;
  bg: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={18} color={muted} />
      </View>
      <Text style={{ color, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  photo: { width: 140, height: 140, borderRadius: 70 },
  cam: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenWrap: { alignItems: 'center', marginTop: 28, marginBottom: 8, opacity: 0.45 },
  hiddenHit: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  tinyLion: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tinyDot: { width: 4, height: 4, borderRadius: 2 },
  veil: { flex: 1, backgroundColor: 'rgba(6,16,10,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  pad: { width: 280, borderRadius: 22, borderWidth: 1, paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center' },
  miniMark: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dots: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  slot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  keys: { flexDirection: 'row', flexWrap: 'wrap', width: 222, justifyContent: 'space-between' },
  key: { width: 66, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
