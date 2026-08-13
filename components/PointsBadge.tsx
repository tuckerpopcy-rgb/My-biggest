// ============================================================
// Salon na we yon - Points Badge Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../lib/context';
import { getPointsLevel, getPointsColor } from '../lib/points';

export function PointsBadge({ points, compact = false }: { points: number; compact?: boolean }) {
  const { theme } = useApp();
  const { level, title } = getPointsLevel(points);
  const color = getPointsColor(level);

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Text style={[styles.compactText, { color }]}>⭐ {points.toLocaleString()}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: color + '15', borderColor: color + '40' }]}>
      <Text style={[styles.points, { color }]}>⭐ {points.toLocaleString()}</Text>
      <Text style={[styles.level, { color }]}>Lv.{level} · {title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  points: {
    fontSize: 16,
    fontWeight: '800',
  },
  level: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
