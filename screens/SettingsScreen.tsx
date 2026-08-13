// ============================================================
// Salon na we yon - Settings Screen
// Theme picker, UI size controls, app configuration
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert, Slider,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/context';
import { themes, isThemeUnlocked } from '../lib/themes';
import { authService } from '../lib/auth';
import { Card, GradientHeader, Badge, Button } from '../components/UIComponents';
import { DeveloperSymbol } from '../components/DeveloperSymbol';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SettingsScreen({ navigation, onDevAccess }: any) {
  const { user, theme, settings, setSettings, setTheme, refreshUser } = useApp();
  const c = theme.colors;
  const [showThemes, setShowThemes] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout? Your account and data will be preserved for next login.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
          },
        },
      ]
    );
  };

  const handleDevAccess = () => {
    if (onDevAccess) onDevAccess();
    else navigation?.navigate('DeveloperPortal');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader theme={theme} title="Settings" subtitle="Customize your experience" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Profile Quick Access */}
        <Card theme={theme} onPress={() => navigation?.navigate('Profile')}>
          <View style={styles.profileRow}>
            <View style={[styles.profileAvatar, { backgroundColor: c.primary }]}>
              <Text style={{ fontSize: 24, color: '#fff', fontWeight: '700' }}>
                {user?.displayName?.[0] || '?'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>{user?.displayName}</Text>
              <Text style={{ fontSize: 13, color: c.textMuted }}>@{user?.username} · {user?.points} pts</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={c.textMuted} />
          </View>
        </Card>

        {/* ===== THEMES SECTION ===== */}
        <Card theme={theme}>
          <TouchableOpacity onPress={() => setShowThemes(!showThemes)} activeOpacity={0.8}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={22} color={c.primary} />
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, flex: 1, marginLeft: 10 }}>Themes & Colors</Text>
              <Ionicons name={showThemes ? 'chevron-up' : 'chevron-down'} size={20} color={c.textMuted} />
            </View>
          </TouchableOpacity>

          {showThemes && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {themes.map(t => {
                const isActive = t.id === settings.themeId;
                const unlocked = isThemeUnlocked(t.id, user?.isSubscribed || false);
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => unlocked && setTheme(t.id)}
                    disabled={!unlocked}
                    style={[
                      styles.themeItem,
                      {
                        backgroundColor: isActive ? t.colors.primary + '15' : c.surfaceAlt,
                        borderColor: isActive ? t.colors.primary : c.border,
                        opacity: unlocked ? 1 : 0.5,
                      },
                    ]}
                  >
                    <View style={styles.themeColors}>
                      <View style={[styles.colorDot, { backgroundColor: t.colors.primary }]} />
                      <View style={[styles.colorDot, { backgroundColor: t.colors.accent }]} />
                      <View style={[styles.colorDot, { backgroundColor: t.colors.gradientStart }]} />
                      <View style={[styles.colorDot, { backgroundColor: t.colors.gradientEnd }]} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{t.name}</Text>
                        {t.isPremium && <Badge theme={theme} text="PREMIUM" color="#FFD700" size="small" />}
                      </View>
                      <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                        {t.effects.glow ? '✨ Glow' : ''}
                        {t.effects.particles ? ' ✦ Particles' : ''}
                        {t.effects.shimmer ? ' ≋ Shimmer' : ''}
                        {t.effects.blur ? ' ◎ Blur' : ''}
                        {!t.effects.glow && !t.effects.particles && !t.effects.shimmer && !t.effects.blur ? 'Standard' : ''}
                      </Text>
                    </View>
                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={22} color={t.colors.primary} />
                    ) : !unlocked ? (
                      <Ionicons name="lock-closed" size={18} color={c.textMuted} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {/* ===== UI SIZE CONTROLS ===== */}
        <Card theme={theme}>
          <View style={styles.sectionHeader}>
            <Ionicons name="resize" size={22} color={c.primary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, marginLeft: 10 }}>UI Size Controls</Text>
          </View>

          <View style={{ marginTop: 16, gap: 16 }}>
            <View>
              <View style={styles.sliderLabel}>
                <Text style={{ fontSize: 14, color: c.textSecondary }}>Interface Scale</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{Math.round(settings.uiScale * 100)}%</Text>
              </View>
              <Slider
                minimumValue={0.8}
                maximumValue={1.4}
                step={0.05}
                value={settings.uiScale}
                onValueChange={(v) => setSettings({ uiScale: v })}
                minimumTrackTintColor={c.primary}
                maximumTrackTintColor={c.border}
                thumbTintColor={c.primary}
              />
            </View>

            <View>
              <View style={styles.sliderLabel}>
                <Text style={{ fontSize: 14, color: c.textSecondary }}>Font Scale</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{Math.round(settings.fontScale * 100)}%</Text>
              </View>
              <Slider
                minimumValue={0.8}
                maximumValue={1.5}
                step={0.05}
                value={settings.fontScale}
                onValueChange={(v) => setSettings({ fontScale: v })}
                minimumTrackTintColor={c.primary}
                maximumTrackTintColor={c.border}
                thumbTintColor={c.primary}
              />
            </View>
          </View>
        </Card>

        {/* ===== PREFERENCES ===== */}
        <Card theme={theme}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={22} color={c.primary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, marginLeft: 10 }}>Preferences</Text>
          </View>

          <View style={{ marginTop: 12, gap: 12 }}>
            <View style={styles.toggleRow}>
              <Text style={{ fontSize: 15, color: c.text, flex: 1 }}>Haptic Feedback</Text>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(v) => setSettings({ hapticsEnabled: v })}
                trackColor={{ true: c.primary + '44', false: c.border }}
                thumbColor={settings.hapticsEnabled ? c.primary : '#999'}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={{ fontSize: 15, color: c.text, flex: 1 }}>Notifications</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => setSettings({ notificationsEnabled: v })}
                trackColor={{ true: c.primary + '44', false: c.border }}
                thumbColor={settings.notificationsEnabled ? c.primary : '#999'}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={{ fontSize: 15, color: c.text, flex: 1 }}>Sound Effects</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(v) => setSettings({ soundEnabled: v })}
                trackColor={{ true: c.primary + '44', false: c.border }}
                thumbColor={settings.soundEnabled ? c.primary : '#999'}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={{ fontSize: 15, color: c.text, flex: 1 }}>Reduced Motion</Text>
              <Switch
                value={settings.reducedMotion}
                onValueChange={(v) => setSettings({ reducedMotion: v })}
                trackColor={{ true: c.primary + '44', false: c.border }}
                thumbColor={settings.reducedMotion ? c.primary : '#999'}
              />
            </View>
          </View>
        </Card>

        {/* ===== DEVELOPER PORTAL ACCESS ===== */}
        <Card theme={theme}>
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash" size={22} color={c.accent} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, marginLeft: 10 }}>Developer Portal</Text>
          </View>
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <DeveloperSymbol onAccess={handleDevAccess} />
            <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 12, textAlign: 'center', fontWeight: '600' }}>
              Tap the ⚙️ symbol to access the developer portal
            </Text>
            <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 4, textAlign: 'center' }}>
              Only Henry Tucker has access. Code required.
            </Text>
          </View>
        </Card>

        {/* ===== ABOUT ===== */}
        <Card theme={theme}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={c.primary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.text, marginLeft: 10 }}>About</Text>
          </View>
          <View style={{ marginTop: 12, gap: 8 }}>
            <View style={styles.aboutRow}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>App Name</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>Salon na we yon</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Version</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Developer</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.primary }}>Henry Tucker</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={{ fontSize: 14, color: c.textSecondary }}>Meaning</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>Sierra Leone is Ours 🇸🇱</Text>
            </View>
          </View>
        </Card>

        {/* Logout */}
        <Button theme={theme} title="Logout" variant="danger" onPress={handleLogout} size="large" />

        <Text style={{ textAlign: 'center', fontSize: 12, color: c.textMuted, paddingVertical: 8 }}>
          Made with ❤️ in Sierra Leone by Henry Tucker
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  themeItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5,
  },
  themeColors: { flexDirection: 'row', gap: 4 },
  colorDot: { width: 20, height: 20, borderRadius: 10 },
  sliderLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
