import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Button, Card, FlagBar } from '../components/UI';
import { pickQuiz, QuizQ } from '../lib/quiz';

export default function QuizScreen() {
  const { palette, t, saveQuizResult, buzz, tap, db, user } = useApp();
  const [round, setRound] = useState<QuizQ[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const history = useMemo(
    () => db.quizResults.filter((r) => r.userId === user?.id).slice(0, 6),
    [db.quizResults, user?.id]
  );

  const start = () => {
    tap();
    setRound(pickQuiz(8));
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const q = round?.[i];

  const choose = (idx: number) => {
    if (picked !== null || !q) return;
    setPicked(idx);
    if (idx === q.answerIndex) {
      setScore((s) => s + 1);
      buzz('success');
    } else buzz('warning');
  };

  const next = async () => {
    if (!round) return;
    if (i + 1 >= round.length) {
      setDone(true);
      await saveQuizResult(score + (picked === q?.answerIndex && picked !== null ? 0 : 0), round.length, 'Salone');
      return;
    }
    setI(i + 1);
    setPicked(null);
  };

  const finish = async () => {
    if (round) await saveQuizResult(score, round.length, 'Sierra Leone');
    setDone(true);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top']}>
      <FlagBar />
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SALONE</Text>
        <Text style={{ color: palette.text, fontSize: 26, fontWeight: '900' }}>{t('quiz')}</Text>
        <Text style={{ color: palette.muted, marginTop: 4, marginBottom: 14 }}>
          Real questions about Sierra Leone — flag, towns, tribes, history, food.
        </Text>

        {!round ? (
          <>
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <View style={[styles.orb, { backgroundColor: palette.primary }]}>
                  <Ionicons name="help" size={36} color={palette.primaryText} />
                </View>
                <Text style={{ color: palette.text, fontWeight: '800', fontSize: 18, marginTop: 10 }}>
                  8 live questions
                </Text>
                <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 6 }}>
                  No demo scores. Your results stay on this device with your real account.
                </Text>
                <Button title={t('startQuiz')} icon="play" onPress={start} style={{ marginTop: 16, alignSelf: 'stretch' }} />
              </View>
            </Card>
            {history.length ? (
              <View style={{ marginTop: 18 }}>
                <Text style={{ color: palette.text, fontWeight: '800', marginBottom: 8 }}>Your recent scores</Text>
                {history.map((h) => (
                  <View
                    key={h.id}
                    style={[
                      styles.hist,
                      { backgroundColor: palette.card, borderColor: palette.border },
                    ]}
                  >
                    <Text style={{ color: palette.text, fontWeight: '700' }}>
                      {h.score}/{h.total}
                    </Text>
                    <Text style={{ color: palette.muted }}>{h.category}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : done ? (
          <Card>
            <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
              {score}/{round.length}
            </Text>
            <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 8 }}>
              {score >= 6 ? 'Yu sabi Salone well!' : score >= 4 ? 'Strong effort — keep learning.' : 'Read the Feed and ask Salon AI, then try again.'}
            </Text>
            <Button title={t('playAgain')} onPress={start} style={{ marginTop: 16 }} />
            <Button
              title="Back"
              variant="ghost"
              onPress={() => setRound(null)}
              style={{ marginTop: 8 }}
            />
          </Card>
        ) : q ? (
          <Card>
            <Text style={{ color: palette.muted, fontWeight: '700' }}>
              {i + 1} / {round.length} · {q.category}
            </Text>
            <Text style={{ color: palette.text, fontSize: 18, fontWeight: '800', marginTop: 10, lineHeight: 26 }}>
              {q.question}
            </Text>
            <View style={{ marginTop: 14, gap: 8 }}>
              {q.options.map((op, idx) => {
                const revealed = picked !== null;
                const correct = idx === q.answerIndex;
                const chosen = picked === idx;
                let bg = palette.bgAlt;
                if (revealed && correct) bg = palette.success;
                else if (revealed && chosen && !correct) bg = palette.danger;
                return (
                  <Pressable key={op} onPress={() => choose(idx)} style={[styles.opt, { backgroundColor: bg }]}>
                    <Text style={{ color: revealed && (correct || chosen) ? '#fff' : palette.text, fontWeight: '700' }}>
                      {op}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {picked !== null ? (
              <>
                <Text style={{ color: palette.muted, marginTop: 12, lineHeight: 20 }}>{q.fact}</Text>
                <Button
                  title={i + 1 === round.length ? t('seeResults') : t('nextQuestion')}
                  onPress={i + 1 === round.length ? finish : next}
                  style={{ marginTop: 14 }}
                />
              </>
            ) : null}
          </Card>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  hist: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  opt: { padding: 14, borderRadius: 12 },
});
