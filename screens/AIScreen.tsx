import React, { useRef, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { askSalonAI } from '../lib/ai';

interface Turn {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const STARTERS = [
  'What do the Salone flag colours mean?',
  'Who was Sir Milton Margai?',
  'Tell me about Krio language',
  'What is cassava leaf stew?',
  'Which countries border Sierra Leone?',
  'What is climate change?',
];

export default function AIScreen() {
  const { palette, t, tap, buzz } = useApp();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { id: 'w', role: 'ai', text: t('aiWelcome') },
  ]);
  const list = useRef<FlatList>(null);

  const ask = async (q?: string) => {
    const question = (q ?? input).trim();
    if (!question || busy) return;
    tap();
    setInput('');
    const userTurn: Turn = { id: 'u' + Date.now(), role: 'user', text: question };
    setTurns((prev) => [...prev, userTurn]);
    setBusy(true);
    setTimeout(() => {
      const answer = askSalonAI(question);
      setTurns((prev) => [...prev, { id: 'a' + Date.now(), role: 'ai', text: answer }]);
      setBusy(false);
      buzz('success');
    }, 420);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <View style={[styles.head, { borderBottomColor: palette.border }]}>
        <View style={[styles.orb, { backgroundColor: palette.primary }]}>
          <Ionicons name="sparkles" size={20} color={palette.primaryText} />
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ color: palette.text, fontWeight: '900', fontSize: 18 }}>{t('salonAI')}</Text>
          <Text style={{ color: palette.muted, fontSize: 12 }}>Sierra Leone · World · Live answers</Text>
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <FlatList
          ref={list}
          data={turns}
          keyExtractor={(i) => i.id}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          ListFooterComponent={
            busy ? (
              <Text style={{ color: palette.muted, marginTop: 8, fontStyle: 'italic' }}>{t('thinking')}</Text>
            ) : turns.length < 3 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {STARTERS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => ask(s)}
                    style={[styles.chip, { borderColor: palette.border, backgroundColor: palette.card }]}
                  >
                    <Text style={{ color: palette.text, fontSize: 13 }}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const mine = item.role === 'user';
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
                  <Text style={{ color: palette.accent, fontWeight: '800', fontSize: 11, marginBottom: 4 }}>SALON AI</Text>
                ) : null}
                <Text style={{ color: mine ? palette.primaryText : palette.text, lineHeight: 22, fontSize: 15 }}>
                  {item.text}
                </Text>
              </View>
            );
          }}
        />
        <View style={[styles.bar, { backgroundColor: palette.card, borderTopColor: palette.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('askAI')}
            placeholderTextColor={palette.muted}
            style={[styles.input, { color: palette.text, backgroundColor: palette.input, borderColor: palette.border }]}
            onSubmitEditing={() => ask()}
            returnKeyType="send"
          />
          <Pressable onPress={() => ask()} style={[styles.send, { backgroundColor: palette.primary }]}>
            <Ionicons name="arrow-up" size={20} color={palette.primaryText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orb: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '90%', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, maxWidth: '100%' },
  bar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
