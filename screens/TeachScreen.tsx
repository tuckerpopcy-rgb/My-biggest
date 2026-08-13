// ============================================================
// Salon na we yon - AI Teaching Screen
// Subscription-based classes with AI assessment
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { courses, canAccessCourse, assessPerformance } from '../lib/aiTeacher';
import { checkSubscriptionStatus, subscribe, SUBSCRIPTION_PLANS } from '../lib/subscription';
import { awardPoints, POINTS } from '../lib/points';
import { Card, GradientHeader, Badge, Button, EmptyState } from '../components/UIComponents';
import type { Course, Lesson, AIQuestion } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TeachScreen({ navigation }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const [view, setView] = useState<'courses' | 'lesson' | 'assessment' | 'result' | 'subscription'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [assessment, setAssessment] = useState<any>(null);
  const [subStatus, setSubStatus] = useState({ active: false, tier: 'free', daysLeft: 0 });

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus(user.id).then(setSubStatus);
    }
  }, [user]);

  const userTier = user?.isDeveloper ? 'premium' : (subStatus.active ? subStatus.tier as any : 'free');

  const startLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setView('lesson');
  };

  const startAssessment = () => {
    if (!selectedLesson) return;
    setCurrentQ(0);
    setSelected(null);
    setCorrectCount(0);
    setStartTime(Date.now());
    setView('assessment');
  };

  const handleAnswer = (index: number) => {
    if (selected !== null || !selectedLesson) return;
    setSelected(index);
    const correct = index === selectedLesson.questions[currentQ].correctIndex;
    if (correct) setCorrectCount(correctCount + 1);
  };

  const nextQuestion = async () => {
    if (!selectedLesson) return;
    if (currentQ + 1 < selectedLesson.questions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      // Assessment complete
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const result = assessPerformance(selectedLesson.questions.length, correctCount, timeSpent);
      setAssessment(result);
      if (user) {
        await awardPoints(user.id, correctCount * 20, 'AI assessment completed');
        await refreshUser();
      }
      setView('result');
    }
  };

  const handleSubscribe = async (tier: 'basic' | 'premium') => {
    if (!user) return;
    await subscribe(user.id, tier);
    const status = await checkSubscriptionStatus(user.id);
    setSubStatus(status);
    await refreshUser();
    setView('courses');
  };

  // ===== SUBSCRIPTION VIEW =====
  if (view === 'subscription') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setView('courses')}>
            <Ionicons name="arrow-back" size={28} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: c.text, marginLeft: 12 }]}>Subscription Plans</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[styles.subDesc, { color: c.textSecondary, marginBottom: 20 }]}>
            Unlock premium courses, advanced AI teaching, exclusive themes, and more!
          </Text>
          {SUBSCRIPTION_PLANS.filter(p => p.id !== 'free').map(plan => (
            <Card key={plan.id} theme={theme}>
              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color + '22' }]}>
                  <Text style={{ fontSize: 28 }}>{plan.id === 'basic' ? '⭐' : '👑'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planName, { color: c.text }]}>{plan.name}</Text>
                  <Text style={[styles.planPrice, { color: plan.color }]}>Le {plan.price} · {plan.duration}</Text>
                </View>
              </View>
              <View style={{ marginTop: 16, gap: 8 }}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                    <Text style={{ fontSize: 14, color: c.textSecondary, flex: 1, marginLeft: 8 }}>{f}</Text>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 16 }}>
                <Button
                  theme={theme}
                  title={`Subscribe to ${plan.name}`}
                  onPress={() => handleSubscribe(plan.id as 'basic' | 'premium')}
                  size="large"
                />
              </View>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== LESSON VIEW =====
  if (view === 'lesson' && selectedLesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setView('courses')}>
            <Ionicons name="arrow-back" size={28} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: c.text, marginLeft: 12, flex: 1 }]}>{selectedLesson.title}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Card theme={theme}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 32 }}>{selectedCourse?.icon}</Text>
              <Text style={[styles.courseTitle, { color: c.text, marginLeft: 10 }]}>{selectedCourse?.title}</Text>
            </View>
            <Text style={[styles.lessonContent, { color: c.text }]}>{selectedLesson.content}</Text>
          </Card>

          <View style={{ marginTop: 16 }}>
            <Text style={[styles.assessmentTitle, { color: c.text }]}>🤖 AI Assessment</Text>
            <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 4, marginBottom: 16 }}>
              Complete {selectedLesson.questions.length} questions to test your understanding. The AI will assess your performance.
            </Text>
            <Button theme={theme} title="Start Assessment →" onPress={startAssessment} size="large" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== ASSESSMENT VIEW =====
  if (view === 'assessment' && selectedLesson) {
    const q = selectedLesson.questions[currentQ];
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.progressContainer, { backgroundColor: c.surface }]}>
          <View style={styles.progressInfo}>
            <Text style={{ color: c.textSecondary, fontSize: 14 }}>AI Assessment · Q{currentQ + 1}/{selectedLesson.questions.length}</Text>
            <Badge theme={theme} text={`Correct: ${correctCount}`} color={c.success} size="small" />
          </View>
          <View style={[styles.progressBar, { backgroundColor: c.surfaceAlt }]}>
            <View style={[styles.progressFill, {
              backgroundColor: c.primary,
              width: `${((currentQ + 1) / selectedLesson.questions.length) * 100}%`,
            }]} />
          </View>
        </View>

        <View style={{ flex: 1, padding: 20 }}>
          <View style={[styles.aiBadge, { backgroundColor: c.accent + '20' }]}>
            <Ionicons name="sparkles" size={16} color={c.accent} />
            <Text style={{ color: c.accent, fontSize: 13, fontWeight: '600', marginLeft: 6 }}>AI Teacher</Text>
          </View>
          <Text style={[styles.questionText, { color: c.text, marginTop: 12 }]}>{q.question}</Text>

          <View style={{ marginTop: 24, gap: 12 }}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              const showResult = selected !== null;
              let bg = c.surface, border = c.border, textColor = c.text;
              if (showResult) {
                if (isCorrect) { bg = c.success + '20'; border = c.success; textColor = c.success; }
                else if (isSelected) { bg = c.error + '20'; border = c.error; textColor = c.error; }
              } else if (isSelected) { border = c.primary; bg = c.primary + '15'; }
              return (
                <TouchableOpacity
                  key={i} onPress={() => handleAnswer(i)} disabled={selected !== null}
                  style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, flex: 1 }}>{opt}</Text>
                  {showResult && isCorrect && <Ionicons name="checkmark-circle" size={22} color={c.success} />}
                  {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color={c.error} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {selected !== null && (
            <View style={[styles.explanation, { backgroundColor: c.primary + '10', borderColor: c.primary + '30' }]}>
              <Text style={{ fontSize: 14, color: c.text, lineHeight: 20 }}>
                <Text style={{ fontWeight: '700' }}>💡 AI Feedback: </Text>
                {q.explanation}
              </Text>
            </View>
          )}

          {selected !== null && (
            <View style={{ marginTop: 20 }}>
              <Button
                theme={theme}
                title={currentQ + 1 < selectedLesson.questions.length ? 'Next →' : 'See AI Assessment 🤖'}
                onPress={nextQuestion}
                size="large"
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ===== RESULT VIEW =====
  if (view === 'result' && assessment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={[styles.gradeCircle, { backgroundColor: assessment.score >= 60 ? c.success : c.warning }]}>
              <Text style={styles.gradeText}>{assessment.grade}</Text>
            </View>
            <Text style={[styles.resultTitle, { color: c.text, marginTop: 20 }]}>AI Assessment Complete</Text>
            <Text style={[styles.resultScore, { color: c.primary }]}>{Math.round(assessment.score)}%</Text>
          </View>

          <Card theme={theme} style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="sparkles" size={20} color={c.accent} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginLeft: 8 }}>AI Feedback</Text>
            </View>
            <Text style={{ fontSize: 15, color: c.textSecondary, lineHeight: 22 }}>{assessment.feedback}</Text>
          </Card>

          <Card theme={theme}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="bulb" size={20} color={c.warning} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginLeft: 8 }}>Recommendation</Text>
            </View>
            <Text style={{ fontSize: 15, color: c.textSecondary, lineHeight: 22 }}>{assessment.recommendation}</Text>
          </Card>

          <Card theme={theme}>
            <Text style={{ fontSize: 15, color: c.textSecondary }}>Points Earned</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: c.success, marginTop: 4 }}>+{correctCount * 20} ⭐</Text>
          </Card>

          <View style={{ gap: 12, marginTop: 8 }}>
            <Button theme={theme} title="Back to Courses" onPress={() => setView('courses')} size="large" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== COURSES LIST VIEW =====
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader
        theme={theme}
        title="AI Learning"
        subtitle="Smart teaching with AI assessment"
        right={
          subStatus.active ? (
            <Badge theme={theme} text={`${subStatus.tier.toUpperCase()}`} color="#FFD700" />
          ) : null
        }
      />

      {/* Subscription Status Banner */}
      {!subStatus.active && !user?.isDeveloper && (
        <TouchableOpacity onPress={() => setView('subscription')} activeOpacity={0.8}>
          <View style={[styles.subBanner, { backgroundColor: c.accent + '15', borderColor: c.accent + '40' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: c.accent }}>🔒 Unlock Premium Classes</Text>
              <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>
                Subscribe to access all courses & AI teaching
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={c.accent} />
          </View>
        </TouchableOpacity>
      )}

      {subStatus.active && !user?.isDeveloper && (
        <View style={[styles.activeBanner, { backgroundColor: c.success + '15' }]}>
          <Ionicons name="checkmark-circle" size={20} color={c.success} />
          <Text style={{ fontSize: 13, color: c.success, marginLeft: 8, fontWeight: '600' }}>
            {subStatus.tier.toUpperCase()} active · {subStatus.daysLeft} days left
          </Text>
        </View>
      )}

      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item: course }) => {
          const hasAccess = user?.isDeveloper || canAccessCourse(course, userTier);
          return (
            <Card theme={theme}>
              <View style={styles.courseHeader}>
                <View style={[styles.courseIcon, { backgroundColor: course.color + '22' }]}>
                  <Text style={{ fontSize: 28 }}>{course.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.courseTitle, { color: c.text }]}>{course.title}</Text>
                    {course.tier === 'premium' && (
                      <Ionicons name="lock-closed" size={14} color={c.warning} />
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                    {course.lessons.length} lessons · {course.category}
                  </Text>
                </View>
              </View>
              <Text style={[styles.courseDesc, { color: c.textSecondary }]}>{course.description}</Text>

              {hasAccess ? (
                <View style={{ marginTop: 12, gap: 8 }}>
                  {course.lessons.map(lesson => (
                    <TouchableOpacity
                      key={lesson.id}
                      onPress={() => startLesson(course, lesson)}
                      style={[styles.lessonBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                    >
                      <Ionicons name="book" size={18} color={c.primary} />
                      <Text style={{ flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: c.text }}>
                        {lesson.title}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={[styles.lockedSection, { backgroundColor: c.warning + '10', borderColor: c.warning + '30' }]}>
                  <Ionicons name="lock-closed" size={24} color={c.warning} />
                  <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 8, textAlign: 'center' }}>
                    This is a premium course. Subscribe to unlock AI-powered lessons and assessments.
                  </Text>
                  <View style={{ marginTop: 12 }}>
                    <Button theme={theme} title="Unlock Now →" onPress={() => setView('subscription')} size="small" />
                  </View>
                </View>
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 20, fontWeight: '800' },
  subBanner: {
    marginHorizontal: 16, padding: 14, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
  },
  activeBanner: {
    marginHorizontal: 16, padding: 10, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  courseHeader: { flexDirection: 'row', alignItems: 'center' },
  courseIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontSize: 17, fontWeight: '700' },
  courseDesc: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  lessonBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5,
  },
  lockedSection: {
    marginTop: 12, padding: 20, borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center',
  },
  progressContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  questionText: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2 },
  explanation: { marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 1.5 },
  lessonContent: { fontSize: 15, lineHeight: 24 },
  assessmentTitle: { fontSize: 18, fontWeight: '700' },
  gradeCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 42, fontWeight: '900', color: '#fff' },
  resultTitle: { fontSize: 22, fontWeight: '800' },
  resultScore: { fontSize: 48, fontWeight: '900', marginTop: 8 },
  subDesc: { fontSize: 15, lineHeight: 22 },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  planIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 20, fontWeight: '800' },
  planPrice: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
});
