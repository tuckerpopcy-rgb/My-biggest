// ============================================================
// Salon na we yon - Authentication Screen
// Real login only - No demo accounts
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../lib/auth';
import { db } from '../lib/database';
import { getTheme } from '../lib/themes';

export default function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = getTheme('sierra_leone');
  const c = theme.colors;

  const handleSubmit = async () => {
    setError('');

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      setLoading(true);
      const result = await authService.login(email.trim(), password);
      setLoading(false);
      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Login failed.');
      }
    } else {
      if (!email.trim() || !username.trim() || !password.trim() || !displayName.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      if (username.trim().toLowerCase().includes('demo') || username.trim().toLowerCase().includes('test')) {
        setError('Invalid username. Please use a real username - no demo or test accounts.');
        return;
      }
      setLoading(true);
      const result = await authService.register(
        username.trim(),
        email.trim(),
        password,
        displayName.trim()
      );
      setLoading(false);
      if (result.success) {
        Alert.alert(
          'Welcome! 🎉',
          'Your account has been created. You received 100 bonus points! Start exploring Salon na we yon.',
          [{ text: 'Let\'s Go!', onPress: onLogin }]
        );
      } else {
        setError(result.error || 'Registration failed.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo & Title */}
          <View style={styles.logoSection}>
            <View style={[styles.logoCircle, { backgroundColor: c.primary }]}>
              <Text style={styles.logoEmoji}>🇸🇱</Text>
            </View>
            <Text style={[styles.appName, { color: c.text }]}>Salon na we yon</Text>
            <Text style={[styles.appTagline, { color: c.textSecondary }]}>Sierra Leone is Ours</Text>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Text style={[styles.appDesc, { color: c.textMuted }]}>
              Connect, Learn, Earn & Grow together
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: c.text }]}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>

            {!isLogin && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
                  placeholder="Display Name"
                  placeholderTextColor={c.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
                  placeholder="Username"
                  placeholderTextColor={c.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
              placeholder={isLogin ? 'Email or Username' : 'Email'}
              placeholderTextColor={c.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
              placeholder="Password"
              placeholderTextColor={c.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {error ? (
              <Text style={[styles.error, { color: c.error }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: c.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setIsLogin(!isLogin); setError(''); }}
              style={styles.switchBtn}
            >
              <Text style={[styles.switchText, { color: c.primary }]}>
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: c.textMuted }]}>
            By Henry Tucker · v1.0.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  appTagline: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  divider: { width: 60, height: 2, marginTop: 12, marginBottom: 12, borderRadius: 1 },
  appDesc: { fontSize: 13 },
  form: { marginBottom: 24 },
  formTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  input: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 18,
    paddingVertical: 16, fontSize: 16, marginBottom: 14,
  },
  error: { fontSize: 13, marginBottom: 12, textAlign: 'center' },
  submitBtn: {
    borderRadius: 14, paddingVertical: 18, alignItems: 'center',
    marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  switchBtn: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  switchText: { fontSize: 14, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
