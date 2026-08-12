import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';

const APress = Animated.createAnimatedComponent(Pressable);

export function FlagBar() {
  const { palette } = useApp();
  return (
    <View style={styles.flagRow}>
      <View style={[styles.flagStripe, { backgroundColor: palette.flagGreen }]} />
      <View style={[styles.flagStripe, { backgroundColor: palette.flagWhite, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#cfd8d0' }]} />
      <View style={[styles.flagStripe, { backgroundColor: palette.flagBlue }]} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'soft';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const { palette, tap } = useApp();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg =
    variant === 'primary'
      ? palette.primary
      : variant === 'danger'
      ? palette.danger
      : variant === 'soft'
      ? palette.bgAlt
      : 'transparent';
  const color =
    variant === 'primary' || variant === 'danger' ? palette.primaryText : palette.text;
  const border =
    variant === 'ghost' ? palette.border : variant === 'soft' ? palette.border : 'transparent';

  return (
    <APress
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.5 : 1,
        },
        anim,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
          <Text style={[styles.btnText, { color }]}>{title}</Text>
        </>
      )}
    </APress>
  );
}

export function Field({
  label,
  ...rest
}: { label?: string } & TextInputProps) {
  const { palette } = useApp();
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={palette.muted}
        style={[
          styles.input,
          {
            backgroundColor: palette.input,
            color: palette.text,
            borderColor: palette.border,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

export function Avatar({
  uri,
  name,
  size = 44,
  badge,
}: {
  uri?: string | null;
  name?: string;
  size?: number;
  badge?: boolean;
}) {
  const { palette } = useApp();
  const letter = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: palette.bgAlt }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: palette.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: palette.primaryText, fontWeight: '800', fontSize: size * 0.4 }}>
            {letter}
          </Text>
        </View>
      )}
      {badge ? (
        <View
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: palette.success,
            borderWidth: 2,
            borderColor: palette.card,
          }}
        />
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { palette } = useApp();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          shadowColor: palette.shadow,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Empty({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
}) {
  const { palette } = useApp();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.bgAlt }]}>
        <Ionicons name={icon} size={32} color={palette.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: palette.text }]}>{title}</Text>
      {body ? <Text style={[styles.emptyBody, { color: palette.muted }]}>{body}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { palette, tap } = useApp();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? palette.primary : palette.bgAlt,
          borderColor: active ? palette.primary : palette.border,
        },
      ]}
    >
      <Text style={{ color: active ? palette.primaryText : palette.text, fontWeight: '700', fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: React.ReactNode }) {
  const { palette } = useApp();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.section, { color: palette.text }]}>{children}</Text>
      {right}
    </View>
  );
}

export function IconBtn({
  name,
  onPress,
  color,
  size = 22,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
  badge?: number;
}) {
  const { palette, tap } = useApp();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      hitSlop={10}
      style={styles.iconBtn}
    >
      <Ionicons name={name} size={size} color={color || palette.text} />
      {badge && badge > 0 ? (
        <View style={[styles.badge, { backgroundColor: palette.danger }]}>
          <Text style={styles.badgeTxt}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Divider() {
  const { palette } = useApp();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: palette.border, marginVertical: 8 }} />;
}

export function HiddenDevMark({ onTriple }: { onTriple: () => void }) {
  const { palette } = useApp();
  const taps = React.useRef(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <Pressable
      onPress={() => {
        taps.current += 1;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          taps.current = 0;
        }, 900);
        if (taps.current >= 3) {
          taps.current = 0;
          onTriple();
        }
      }}
      hitSlop={16}
      style={styles.hiddenMark}
    >
      <View style={[styles.tinyLion, { borderColor: palette.primary }]}>
        <View style={[styles.tinyDot, { backgroundColor: palette.primary }]} />
      </View>
    </Pressable>
  );
}

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const o = useSharedValue(0);
  const y = useSharedValue(12);
  useEffect(() => {
    const t = setTimeout(() => {
      o.value = withSpring(1);
      y.value = withSpring(0);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, o, y]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  flagRow: { height: 6, flexDirection: 'row', width: '100%' },
  flagStripe: { flex: 1 },
  btn: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  btnText: { fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  empty: { alignItems: 'center', padding: 36 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptyBody: { marginTop: 6, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 6 },
  section: { fontSize: 18, fontWeight: '800' },
  iconBtn: { padding: 6, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  hiddenMark: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
  tinyLion: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tinyDot: { width: 5, height: 5, borderRadius: 3 },
});

export const textStyles = {
  h1: { fontSize: 28, fontWeight: '900' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '800' as const },
  body: { fontSize: 15, lineHeight: 22 },
  muted: { fontSize: 13 } as TextStyle,
};
