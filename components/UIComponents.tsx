// ============================================================
// Salon na we yon - Reusable UI Components
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useApp } from '../lib/context';
import type { Theme } from '../lib/types';

export function useThemedStyles() {
  const { theme, scale, fontScale } = useApp();
  return { theme, scale, fontScale };
}

export function LoadingSpinner({ theme, size = 'large' }: { theme: Theme; size?: 'small' | 'large' }) {
  return (
    <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      <Text style={{ color: theme.colors.textSecondary, marginTop: 12, fontSize: 14 }}>Loading...</Text>
    </View>
  );
}

export function EmptyState({
  theme, icon, title, subtitle, actionLabel, onAction
}: {
  theme: Theme; icon: string; title: string; subtitle?: string;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={[styles.centerContainer, { backgroundColor: theme.colors.background, padding: 24 }]}>
      <Text style={{ fontSize: 56, marginBottom: 16 }}>{icon}</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, textAlign: 'center', marginBottom: 8 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Avatar({
  uri, size = 44, theme, name
}: { uri: string | null; size?: number; theme: Theme; name?: string }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>{initials}</Text>
    </View>
  );
}

export function GradientHeader({
  theme, title, subtitle, right
}: { theme: Theme; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={{
      padding: 16,
      paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.text }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

export function Card({
  theme, children, onPress, style
}: { theme: Theme; children: React.ReactNode; onPress?: () => void; style?: any }) {
  const Component: any = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      style={[{
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }, style]}
    >
      {children}
    </Component>
  );
}

export function Pill({
  theme, label, color, onPress, active
}: { theme: Theme; label: string; color?: string; onPress?: () => void; active?: boolean }) {
  const Component: any = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: active ? (color || theme.colors.primary) : theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: active ? (color || theme.colors.primary) : theme.colors.border,
        marginRight: 8,
      }}
    >
      <Text style={{
        color: active ? '#fff' : theme.colors.text,
        fontSize: 13,
        fontWeight: '600',
      }}>{label}</Text>
    </Component>
  );
}

export function Button({
  theme, title, onPress, variant = 'primary', size = 'medium', disabled, icon
}: {
  theme: Theme; title: string; onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean; icon?: string;
}) {
  const sizes = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
  };

  const variants = {
    primary: { bg: theme.colors.primary, text: '#fff', border: theme.colors.primary },
    outline: { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary },
    ghost: { bg: 'transparent', text: theme.colors.textSecondary, border: 'transparent' },
    danger: { bg: theme.colors.error, text: '#fff', border: theme.colors.error },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: v.bg,
        paddingVertical: s.paddingVertical,
        paddingHorizontal: s.paddingHorizontal,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: v.border,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon && <Text style={{ fontSize: s.fontSize, marginRight: 8 }}>{icon}</Text>}
      <Text style={{ color: v.text, fontSize: s.fontSize, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Badge({
  theme, text, color, size = 'medium'
}: { theme: Theme; text: string; color?: string; size?: 'small' | 'medium' }) {
  return (
    <View style={{
      backgroundColor: (color || theme.colors.primary) + '22',
      paddingHorizontal: size === 'small' ? 8 : 12,
      paddingVertical: size === 'small' ? 3 : 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: (color || theme.colors.primary) + '44',
    }}>
      <Text style={{
        color: color || theme.colors.primary,
        fontSize: size === 'small' ? 10 : 12,
        fontWeight: '700',
      }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
