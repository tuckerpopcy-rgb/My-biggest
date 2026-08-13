import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Button, Empty } from '../components/UI';
import { COURSES, openingLecture } from '../lib/teachAI';
import { CourseId } from '../lib/types';

export default function ClassroomScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const initial = (route.params?.subject as CourseId) || 'forex';
  const { palette, t, user, lessons, isAcademyApproved, askLecture, tap } = useApp();
  const [subject, setSubject] = useState<CourseId>(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef<FlatList>(null);
  const unlocked = isAcademyApproved();

  const thread = useMemo(
    () => lessons.filter((l) => l.userId === user?.id && l.subject === subject).sort((a, b) => a.createdAt - b.createdAt),
    [lessons, user?.id, subject]
  );

  useEffect(() => {
    if (!unlocked || !user) return;
    if (thread.length === 0) {
      void askLecture(subject, '');
    }
  }, [subject, unlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    setText('');
    setBusy(true);
    try {
      await askLecture(subject, q);
    } finally {
      setBusy(false);
    }
  };

  if (!unlocked) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
        <View style={styles.lock}>
          <View style={[styles.lockOrb, { backgroundColor: palette.bgAlt }]}>
            <Ionicons name="lock-closed" size={36} color={palette.warning} />
          </View>
          <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900', marginTop: 14 }}>{t('classroomLocked')}</Text>
          <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 8, lineHeight: 21, maxWidth: 300 }}>
            Lectures live in the academy database. Apply, pay Le 1000 by Orange Money, and wait for approval.
          </Text>
          <Button title={t('academy')} onPress={() => nav.navigate('Academy')} style={{ marginTop: 18, alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <View style={[styles.subs, { borderBottomColor: palette.border }]}>
        {COURSES.map((c) => {
          const on = subject === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                tap();
                setSubject(c.id);
              }}
              style={[styles.pill, { backgroundColor: on ? palette.primary : palette.bgAlt }]}
            >
              <Text style={{ color: on ? palette.primaryText : palette.text, fontWeight: '800', fontSize: 12 }}>{c.title}</Text>
            </Pressable>
          );
        })}
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <FlatList
          ref={list}
          data={thread}
          keyExtractor={(i) => i.id}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          ListEmptyComponent={<Empty icon="school-outline" title="Lecture starting…" body={openingLecture(subject).slice(0, 120)} />}
          renderItem={({ item }) => {
            const mine = item.role === 'student';
            return (
              <View
                style={[
                  styles.bubble,
                  {
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    backgroundColor: mine ? palette.primary : palette.card,
                    borderColor: mine ? palette.primary : palette.border,
                  },
                ]}
              >
                {!mine ? (
                  <Text style={{ color: palette.accent, fontWeight: '800', fontSize: 11, marginBottom: 4 }}>LECTURER</Text>
                ) : null}
                <Text style={{ color: mine ? palette.primaryText : palette.text, lineHeight: 22 }}>{item.text}</Text>
              </View>
            );
          }}
        />
        <View style={[styles.bar, { backgroundColor: palette.card, borderTopColor: palette.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask your lecturer…"
            placeholderTextColor={palette.muted}
            style={[styles.input, { color: palette.text, backgroundColor: palette.input, borderColor: palette.border }]}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={[styles.send, { backgroundColor: palette.primary }]}>
            <Ionicons name="arrow-up" size={20} color={palette.primaryText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  lock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  lockOrb: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  subs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  pill: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  bubble: { maxWidth: '92%', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
