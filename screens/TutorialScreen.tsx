import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { Button, FlagBar } from '../components/UI';

const STEPS = [
  { icon: 'earth' as const, title: 'tutorial1Title', body: 'tutorial1Body' },
  { icon: 'storefront' as const, title: 'tutorial2Title', body: 'tutorial2Body' },
  { icon: 'sparkles' as const, title: 'tutorial3Title', body: 'tutorial3Body' },
  { icon: 'shield-checkmark' as const, title: 'tutorial4Title', body: 'tutorial4Body' },
];

export default function TutorialScreen() {
  const { palette, t, markTutorialSeen, tap } = useApp();
  const [i, setI] = useState(0);
  const { width } = useWindowDimensions();
  const step = STEPS[i];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]}>
      <FlagBar />
      <View style={styles.top}>
        <Text style={{ color: palette.muted, fontWeight: '800', letterSpacing: 1.4, fontSize: 12 }}>
          SALONE NA WE YON
        </Text>
        <Pressable
          onPress={() => {
            tap();
            markTutorialSeen();
          }}
        >
          <Text style={{ color: palette.primary, fontWeight: '700' }}>{t('skip')}</Text>
        </Pressable>
      </View>

      <Animated.View
        key={i}
        entering={FadeInRight.springify()}
        exiting={FadeOutLeft.duration(160)}
        style={[styles.hero, { width }]}
      >
        {i === 0 ? (
          <Image source={require('../assets/salon-logo.png')} style={styles.brand} contentFit="cover" />
        ) : (
          <View style={[styles.orb, { backgroundColor: palette.primary }]}>
            <Ionicons name={step.icon} size={54} color={palette.primaryText} />
          </View>
        )}
        <Text style={[styles.title, { color: palette.text }]}>{t(step.title)}</Text>
        <Text style={[styles.body, { color: palette.muted }]}>{t(step.body)}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {STEPS.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: idx === i ? palette.primary : palette.border,
                width: idx === i ? 22 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.bottom}>
        <Button
          title={i === STEPS.length - 1 ? t('getStarted') : t('next')}
          icon={i === STEPS.length - 1 ? 'arrow-forward' : 'chevron-forward'}
          onPress={() => {
            if (i === STEPS.length - 1) markTutorialSeen();
            else setI(i + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: {
    paddingHorizontal: 22,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  brand: { width: 128, height: 128, borderRadius: 32, marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '900', textAlign: 'center', letterSpacing: -0.6 },
  body: { marginTop: 14, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },
  bottom: { paddingHorizontal: 22, paddingBottom: 18 },
});
