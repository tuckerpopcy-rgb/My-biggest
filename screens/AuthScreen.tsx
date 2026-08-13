import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Button, Field, FlagBar } from '../components/UI';
import { LANGUAGES } from '../lib/i18n';

export default function AuthScreen() {
  const nav = useNavigation<any>();
  const { palette, t, login, register, settings, updateSettings, tap } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [tribe, setTribe] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const res = await login(username, password);
        if (!res.ok) setErr(res.error || t('invalidLogin'));
      } else {
        const res = await register({
          username,
          email,
          password,
          displayName,
          location,
          tribe,
          phone,
        });
        if (!res.ok) setErr(res.error || t('fillAll'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]}>
      <FlagBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require('../assets/salon-logo.png')} style={styles.logo} contentFit="cover" />
            <Text style={[styles.name, { color: palette.text }]}>{t('appName')}</Text>
            <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 6 }}>{t('tagline')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.h, { color: palette.text }]}>
              {mode === 'login' ? t('login') : t('register')}
            </Text>
            <Text style={{ color: palette.muted, marginBottom: 14, fontSize: 13 }}>
              {mode === 'register'
                ? 'Permanent registration. Real people only. No demo accounts.'
                : 'Sign in with your real account. Session stays until you log out.'}
            </Text>

            <Field
              label={t('username')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              placeholder={mode === 'login' ? 'username or email' : 'choose a username'}
            />
            {mode === 'register' ? (
              <>
                <Field
                  label={t('email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  placeholder="you@email.com"
                />
                <Field
                  label={t('displayName')}
                  value={displayName}
                  onChangeText={setDisplayName}
                  returnKeyType="next"
                  placeholder="Your name"
                />
                <Field
                  label={t('location')}
                  value={location}
                  onChangeText={setLocation}
                  returnKeyType="next"
                  placeholder="Freetown, Bo, Kenema…"
                />
                <Field
                  label={t('tribe')}
                  value={tribe}
                  onChangeText={setTribe}
                  returnKeyType="next"
                  placeholder="Temne, Mende, Krio…"
                />
                <Field
                  label={t('phone')}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  placeholder="+232…"
                />
              </>
            ) : null}
            <Field
              label={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={submit}
              placeholder="••••••••"
            />

            {err ? <Text style={{ color: palette.danger, marginBottom: 10, fontWeight: '600' }}>{err}</Text> : null}

            <Button title={mode === 'login' ? t('login') : t('register')} onPress={submit} loading={busy} />

            <Button
              title={mode === 'login' ? t('newAccount') : t('haveAccount')}
              variant="ghost"
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErr('');
              }}
              style={{ marginTop: 8 }}
            />
          </View>

          <Text style={[styles.langLabel, { color: palette.muted }]}>{t('language')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {LANGUAGES.map((l) => {
              const active = settings.language === l.code;
              return (
                <PressLang
                  key={l.code}
                  active={active}
                  label={l.native}
                  sub={l.tribe}
                  onPress={() => {
                    tap();
                    updateSettings({ language: l.code });
                  }}
                />
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => {
              tap();
              nav.navigate('AboutDeveloper');
            }}
            style={styles.aboutLink}
          >
            <Text style={{ color: palette.muted, fontSize: 13, fontWeight: '600' }}>{t('aboutDev')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PressLang({
  active,
  label,
  sub,
  onPress,
}: {
  active: boolean;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  const { palette } = useApp();
  return (
    <Text
      onPress={onPress}
      style={{
        overflow: 'hidden',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: active ? palette.primary : palette.card,
        color: active ? palette.primaryText : palette.text,
        fontWeight: '700',
        borderWidth: 1,
        borderColor: active ? palette.primary : palette.border,
        marginBottom: 4,
      }}
    >
      {label} · {sub}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  brand: { alignItems: 'center', marginBottom: 22, marginTop: 8 },
  logo: { width: 84, height: 84, borderRadius: 22 },
  name: { fontSize: 28, fontWeight: '900', marginTop: 12, letterSpacing: -0.6 },
  card: { borderRadius: 20, padding: 16, borderWidth: 1 },
  h: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  langLabel: { marginTop: 20, marginBottom: 8, fontWeight: '700', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  aboutLink: { marginTop: 28, alignItems: 'center', paddingVertical: 10 },
});
