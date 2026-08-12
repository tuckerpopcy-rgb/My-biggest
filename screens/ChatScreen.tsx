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
import { Avatar, Empty } from '../components/UI';
import { timeAgo } from '../lib/hash';

export default function ChatScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const conversationId = route.params?.conversationId as string;
  const {
    palette,
    t,
    user,
    users,
    conversations,
    messages,
    sendMessage,
    sendQuizMessage,
    markConversationRead,
    tap,
  } = useApp();
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<Record<string, number>>({});
  const list = useRef<FlatList>(null);

  const convo = conversations.find((c) => c.id === conversationId);
  const other = users.find((u) => u.id === convo?.participants.find((p) => p !== user?.id));

  const thread = useMemo(
    () => messages.filter((m) => m.conversationId === conversationId).sort((a, b) => a.createdAt - b.createdAt),
    [messages, conversationId]
  );

  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId, thread.length, markConversationRead]);

  const send = async () => {
    const v = text.trim();
    if (!v) return;
    setText('');
    await sendMessage(conversationId, v);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={[styles.head, { borderBottomColor: palette.border, backgroundColor: palette.header }]}>
          <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ marginRight: 8 }}>
            <Ionicons name="chevron-back" size={26} color={palette.text} />
          </Pressable>
          <Avatar uri={other?.avatar} name={other?.displayName} size={36} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ color: palette.text, fontWeight: '800' }}>{other?.displayName || 'Chat'}</Text>
            <Text style={{ color: palette.success, fontSize: 12 }}>{t('online')} · @{other?.username}</Text>
          </View>
        </View>

        <FlatList
          ref={list}
          data={thread}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 20, flexGrow: 1 }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Empty icon="chatbubble-ellipses-outline" title={t('emptyChat')} />}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            if (item.kind === 'quiz' && item.quizPayload) {
              const sel = picked[item.id];
              return (
                <View style={[styles.quiz, { backgroundColor: palette.card, borderColor: palette.border, alignSelf: mine ? 'flex-end' : 'flex-start' }]}>
                  <Text style={{ color: palette.accent, fontWeight: '800', fontSize: 11, letterSpacing: 0.8 }}>SALONE QUIZ</Text>
                  <Text style={{ color: palette.text, fontWeight: '700', marginTop: 6 }}>{item.quizPayload.question}</Text>
                  {item.quizPayload.options.map((op: string, idx: number) => {
                    const revealed = sel !== undefined;
                    const correct = idx === item.quizPayload!.answerIndex;
                    const chosen = sel === idx;
                    let bg = palette.bgAlt;
                    if (revealed && correct) bg = palette.success;
                    else if (revealed && chosen && !correct) bg = palette.danger;
                    return (
                      <Pressable
                        key={op}
                        disabled={revealed}
                        onPress={() => {
                          tap();
                          setPicked((p) => ({ ...p, [item.id]: idx }));
                        }}
                        style={[styles.opt, { backgroundColor: bg }]}
                      >
                        <Text style={{ color: revealed && (correct || chosen) ? '#fff' : palette.text, fontWeight: '600' }}>{op}</Text>
                      </Pressable>
                    );
                  })}
                  <Text style={{ color: palette.muted, fontSize: 11, marginTop: 6 }}>{timeAgo(item.createdAt)}</Text>
                </View>
              );
            }
            return (
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: mine ? palette.primary : palette.card,
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    borderColor: mine ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text style={{ color: mine ? palette.primaryText : palette.text, fontSize: 15, lineHeight: 21 }}>
                  {item.content}
                </Text>
                <Text style={{ color: mine ? palette.primaryText : palette.muted, fontSize: 10, marginTop: 4, opacity: 0.8 }}>
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
            );
          }}
        />

        <View style={[styles.bar, { backgroundColor: palette.card, borderTopColor: palette.border }]}>
          <Pressable
            onPress={() => sendQuizMessage(conversationId)}
            style={[styles.quizBtn, { backgroundColor: palette.bgAlt }]}
          >
            <Ionicons name="help-circle" size={22} color={palette.primary} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('typeMessage')}
            placeholderTextColor={palette.muted}
            style={[styles.input, { color: palette.text, backgroundColor: palette.input, borderColor: palette.border }]}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Pressable onPress={send} style={[styles.send, { backgroundColor: palette.primary }]}>
            <Ionicons name="send" size={18} color={palette.primaryText} />
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 18, marginBottom: 8, borderWidth: 1 },
  quiz: { maxWidth: '88%', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  opt: { padding: 10, borderRadius: 10, marginTop: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  quizBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
