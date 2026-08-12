import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Button, Card, FlagBar } from '../components/UI';
import { LANGUAGES } from '../lib/i18n';
import { ACCENT_OPTIONS } from '../lib/theme';
import { AccentName, LanguageCode, ThemeMode } from '../lib/types';

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const { palette, t, settings, updateSettings, tap, buzz, isPremium } = useApp();

  const setTheme = (mode: ThemeMode) => {
    tap();
    updateSettings({ themeMode: mode });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlagBar />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: palette.muted, marginBottom: 12 }}>{t('settingsSaved')}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <Button title={isPremium() ? t('premiumLive') : t('goPremium')} icon="diamond" onPress={() => nav.navigate('Premium')} style={{ flex: 1 }} />
          <Button title={t('studio')} icon="videocam" variant="soft" onPress={() => nav.navigate('Studio')} style={{ flex: 1 }} />
        </View>

        <Label color={palette.muted}>{t('theme')}</Label>
        <Card style={{ flexDirection: 'row', gap: 8 }}>
          {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setTheme(m)}
              style={[
                styles.seg,
                {
                  backgroundColor: settings.themeMode === m ? palette.primary : palette.bgAlt,
                },
              ]}
            >
              <Text
                style={{
                  color: settings.themeMode === m ? palette.primaryText : palette.text,
                  fontWeight: '800',
                  fontSize: 13,
                }}
              >
                {t(m)}
              </Text>
            </Pressable>
          ))}
        </Card>

        <Label color={palette.muted}>{t('accent')}</Label>
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {ACCENT_OPTIONS.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => {
                  tap();
                  updateSettings({ accent: a.key as AccentName });
                }}
                style={{ alignItems: 'center', width: 86 }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: a.color,
                    borderWidth: settings.accent === a.key ? 3 : 0,
                    borderColor: palette.text,
                  }}
                />
                <Text style={{ color: palette.muted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Label color={palette.muted}>{t('language')}</Label>
        <Card>
          {LANGUAGES.map((l) => {
            const active = settings.language === l.code;
            return (
              <Pressable
                key={l.code}
                onPress={() => {
                  tap();
                  updateSettings({ language: l.code as LanguageCode });
                }}
                style={[styles.lang, { borderBottomColor: palette.border }]}
              >
                <View>
                  <Text style={{ color: palette.text, fontWeight: '800' }}>{l.native}</Text>
                  <Text style={{ color: palette.muted, fontSize: 12 }}>{l.name} · {l.tribe}</Text>
                </View>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: active ? palette.primary : palette.border,
                    backgroundColor: active ? palette.primary : 'transparent',
                  }}
                />
              </Pressable>
            );
          })}
        </Card>

        <Label color={palette.muted}>Feedback</Label>
        <Card>
          <Row
            label={t('haptics')}
            value={settings.haptics}
            on={palette.primary}
            color={palette.text}
            onChange={(v) => {
              updateSettings({ haptics: v });
              if (v) buzz('success');
            }}
          />
          <Row
            label={t('clickSounds')}
            value={settings.clickSounds}
            on={palette.primary}
            color={palette.text}
            onChange={(v) => updateSettings({ clickSounds: v })}
          />
          <Row
            label={t('realtimeNotifs')}
            value={settings.notifications}
            on={palette.primary}
            color={palette.text}
            onChange={(v) => updateSettings({ notifications: v })}
          />
        </Card>

        <Text style={{ color: palette.muted, marginTop: 18, fontSize: 12, lineHeight: 18 }}>
          Theme, language, haptics, click sounds and notifications apply instantly across the whole app.
          Your session stays signed in until you log out. Accounts are permanent on this device database.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ children, color }: { children: string; color: string }) {
  return (
    <Text style={{ color, fontWeight: '800', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function Row({
  label,
  value,
  onChange,
  on,
  color,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  on: string;
  color: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ fontWeight: '700', fontSize: 15, color }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: on }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  seg: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  lang: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
