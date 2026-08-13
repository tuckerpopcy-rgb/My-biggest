// ============================================================
// Salon na we yon - Sierra Leone Quiz Screen
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { quizQuestions, quizCategories, getQuizByCategory, getRandomQuiz } from '../lib/quizzes';
import { awardPoints, POINTS } from '../lib/points';
import { Card, GradientHeader, Badge, Button } from '../components/UIComponents';
import type { QuizQuestion } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function QuizScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [mode, setMode] = useState<'menu' | 'playing' | 'results'>('menu');
  const [category, setCategory] = useState('All');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredCorrect, setAnsweredCorrect] = useState<boolean[]>([]);

  const startQuiz = (cat: string) => {
    const qs = cat === 'All' ? getRandomQuiz(10) : getQuizByCategory(cat);
    setQuestions(qs);
    setCategory(cat);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowExplanation(false);
    setAnsweredCorrect([]);
    setMode('playing');
  };

  const handleAnswer = async (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowExplanation(true);

    const correct = index === questions[currentQ].correctIndex;
    setAnsweredCorrect([...answeredCorrect, correct]);

    if (correct && user) {
      setScore(score + 1);
      await awardPoints(user.id, POINTS.QUIZ_CORRECT, 'Correct quiz answer');
      await refreshUser();
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (user) {
      const totalCorrect = answeredCorrect.filter(Boolean).length;
      await awardPoints(user.id, POINTS.QUIZ_COMPLETE, 'Completed a quiz');
      await refreshUser();

      // Update user quiz stats
      const users = await (async () => {
        const { db } = await import('../lib/database');
        return await db.get<any[]>('users') || [];
      })();
      const updated = users.map((u: any) =>
        u.id === user.id
          ? {
              ...u,
              quizHighScore: Math.max(u.quizHighScore, totalCorrect),
              quizzesCompleted: u.quizzesCompleted + 1,
            }
          : u
      );
      const { db } = await import('../lib/database');
      await db.set('users', updated);

      // Record result
      const results = await db.get<any[]>('quizResults') || [];
      results.push({
        id: 'result_' + Date.now(),
        userId: user.id,
        score: totalCorrect,
        total: questions.length,
        category,
        completedAt: Date.now(),
      });
      await db.set('quizResults', results);
    }
    setMode('results');
  };

  // ===== MENU MODE =====
  if (mode === 'menu') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <GradientHeader
          theme={theme}
          title="Sierra Leone Quiz"
          subtitle="Test your knowledge & earn points!"
          right={
            user && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: c.primary }}>{user.quizHighScore}</Text>
                <Text style={{ fontSize: 10, color: c.textMuted }}>Best Score</Text>
              </View>
            )
          }
        />

        <FlatList
          data={quizCategories}
          keyExtractor={item => item}
          contentContainerStyle={styles.list}
          renderItem={({ item: cat }) => {
            const count = cat === 'All' ? quizQuestions.length : getQuizByCategory(cat).length;
            const emojis: Record<string, string> = {
              All: '🎯', History: '📜', Geography: '🗺️', Culture: '🎭', Economy: '💰',
            };
            return (
              <Card theme={theme} onPress={() => startQuiz(cat)}>
                <View style={styles.categoryRow}>
                  <Text style={{ fontSize: 40 }}>{emojis[cat] || '❓'}</Text>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[styles.categoryName, { color: c.text }]}>{cat}</Text>
                    <Text style={[styles.categoryCount, { color: c.textMuted }]}>{count} questions</Text>
                  </View>
                  <View style={[styles.playBtn, { backgroundColor: c.primary }]}>
                    <Ionicons name="play" size={20} color="#fff" />
                  </View>
                </View>
              </Card>
            );
          }}
        />

        <View style={{ padding: 16 }}>
          <Card theme={theme}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 }}>🏆 How to Earn Points</Text>
            <Text style={{ fontSize: 14, color: c.textSecondary, lineHeight: 22 }}>
              • Correct answer: +{POINTS.QUIZ_CORRECT} points{'\n'}
              • Complete a quiz: +{POINTS.QUIZ_COMPLETE} points{'\n'}
              • Climb the leaderboard with your total score!
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // ===== PLAYING MODE =====
  if (mode === 'playing') {
    const q = questions[currentQ];
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        {/* Progress */}
        <View style={[styles.progressContainer, { backgroundColor: c.surface }]}>
          <View style={styles.progressInfo}>
            <Text style={{ color: c.textSecondary, fontSize: 14 }}>Question {currentQ + 1} of {questions.length}</Text>
            <Badge theme={theme} text={`Score: ${score}`} color={c.success} />
          </View>
          <View style={[styles.progressBar, { backgroundColor: c.surfaceAlt }]}>
            <View style={[styles.progressFill, {
              backgroundColor: c.primary,
              width: `${((currentQ + 1) / questions.length) * 100}%`,
            }]} />
          </View>
        </View>

        <View style={styles.quizContent}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            <Badge theme={theme} text={q.category} color={c.primary} size="small" />
            <Badge theme={theme} text={q.difficulty} color={q.difficulty === 'easy' ? c.success : q.difficulty === 'medium' ? c.warning : c.error} size="small" />
          </View>

          <Text style={[styles.questionText, { color: c.text }]}>{q.question}</Text>

          <View style={{ marginTop: 24, gap: 12 }}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              const showResult = selected !== null;

              let bg = c.surface;
              let border = c.border;
              let textColor = c.text;

              if (showResult) {
                if (isCorrect) {
                  bg = c.success + '20';
                  border = c.success;
                  textColor = c.success;
                } else if (isSelected) {
                  bg = c.error + '20';
                  border = c.error;
                  textColor = c.error;
                }
              } else if (isSelected) {
                border = c.primary;
                bg = c.primary + '15';
              }

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleAnswer(i)}
                  disabled={selected !== null}
                  style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>{opt}</Text>
                  {showResult && isCorrect && <Ionicons name="checkmark-circle" size={22} color={c.success} />}
                  {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color={c.error} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <View style={[styles.explanation, { backgroundColor: c.primary + '10', borderColor: c.primary + '30' }]}>
              <Text style={{ fontSize: 14, color: c.text, lineHeight: 20 }}>
                <Text style={{ fontWeight: '700' }}>💡 Explanation: </Text>
                {q.explanation}
              </Text>
            </View>
          )}

          {selected !== null && (
            <View style={{ marginTop: 20 }}>
              <Button
                theme={theme}
                title={currentQ + 1 < questions.length ? 'Next Question →' : 'See Results 🎉'}
                onPress={nextQuestion}
                size="large"
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ===== RESULTS MODE =====
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 60;
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.resultsContainer}>
        <Text style={{ fontSize: 72 }}>{passed ? '🎉' : '💪'}</Text>
        <Text style={[styles.resultTitle, { color: c.text }]}>
          {passed ? 'Well Done!' : 'Keep Trying!'}
        </Text>
        <Text style={[styles.resultScore, { color: c.primary }]}>
          {score} / {questions.length}
        </Text>
        <Text style={[styles.resultPercent, { color: c.textSecondary }]}>
          {percentage}% Correct
        </Text>

        <View style={{ width: '100%', marginTop: 32, gap: 12 }}>
          <Card theme={theme}>
            <Text style={{ fontSize: 15, color: c.textSecondary, marginBottom: 4 }}>Points Earned</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: c.success }}>
              +{(score * POINTS.QUIZ_CORRECT) + POINTS.QUIZ_COMPLETE} ⭐
            </Text>
          </Card>

          <Card theme={theme}>
            <Text style={{ fontSize: 15, color: c.textSecondary, marginBottom: 4 }}>Your Best Score</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: c.primary }}>
              {Math.max(user?.quizHighScore || 0, score)} / {questions.length}
            </Text>
          </Card>

          <View style={{ gap: 12, marginTop: 8 }}>
            <Button theme={theme} title="Play Again" onPress={() => startQuiz(category)} size="large" />
            <Button theme={theme} title="Back to Categories" variant="outline" onPress={() => setMode('menu')} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 8 },
  categoryRow: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 18, fontWeight: '700' },
  categoryCount: { fontSize: 13, marginTop: 2 },
  playBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  progressContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  quizContent: { flex: 1, padding: 20 },
  questionText: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2,
  },
  explanation: {
    marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 1.5,
  },
  resultsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultTitle: { fontSize: 28, fontWeight: '800', marginTop: 16 },
  resultScore: { fontSize: 48, fontWeight: '900', marginTop: 8 },
  resultPercent: { fontSize: 18, marginTop: 4 },
});
