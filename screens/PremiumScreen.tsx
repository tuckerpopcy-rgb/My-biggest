import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Button, Card, FlagBar } from '../components/UI';

const PERKS = [
  { icon: 'videocam' as const, title: 'Cloud video', body: 'Upload real video to the Salone media library. Posts and intro films stay with your account.' },
  { icon: 'flash' as const, title: 'Boost', body: 'Pin your posts and market stalls to the top of the feed and bazaar.' },
  { icon: 'checkmark-circle' as const, title: 'Gold mark', body: 'A verified badge on your name across feed, chat and market.' },
  { icon: 'sparkles' as const, title: 'Salon AI depth', body: 'Longer, richer answers on Sierra Leone and the world.' },
  { icon: 'bookmark' as const, title: 'Saved library', body: 'Keep posts and listings in a private shelf.' },
  { icon: 'shield-checkmark' as const, title: 'Founder tools', body: 'Henry’s circle keeps Premium for life on this device.' },
];

export default function PremiumScreen() {
  const { palette, t, user, isPremium, activatePremium } = useApp();
  const live = isPremium();
  const until = user?.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString() : null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlagBar />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.hero, { backgroundColor: palette.primary }]}>
          <Ionicons name="diamond" size={36} color={palette.primaryText} />
          <Text style={{ color: palette.primaryText, fontSize: 26, fontWeight: '900', marginTop: 10 }}>Salone Premium</Text>
          <Text style={{ color: palette.primaryText, opacity: 0.9, marginTop: 6, textAlign: 'center' }}>
            {t('premiumBody')}
          </Text>
        </View>

        {live ? (
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: palette.success, fontWeight: '800' }}>{t('premiumLive')}</Text>
            <Text style={{ color: palette.muted, marginTop: 4 }}>
              {user?.isDeveloper ? 'Founder seat — never expires.' : until ? `Active until ${until}` : 'Active on this account.'}
            </Text>
          </Card>
        ) : null}

        {PERKS.map((p) => (
          <Card key={p.title} style={{ marginTop: 10, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={[styles.ic, { backgroundColor: palette.bgAlt }]}>
              <Ionicons name={p.icon} size={20} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: '800' }}>{p.title}</Text>
              <Text style={{ color: palette.muted, marginTop: 3, lineHeight: 20 }}>{p.body}</Text>
            </View>
          </Card>
        ))}

        {!live ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            <Button title={`${t('monthly')} · Le 25`} icon="flash" onPress={() => activatePremium('monthly')} />
            <Button title={`${t('yearly')} · Le 200`} icon="star" variant="soft" onPress={() => activatePremium('yearly')} />
            <Button title={`${t('founder')} · Le 1,000`} icon="diamond" variant="ghost" onPress={() => activatePremium('founder')} />
            <Text style={{ color: palette.muted, fontSize: 12, textAlign: 'center', marginTop: 6 }}>
              Activation is stored on your permanent account. No demo memberships.
            </Text>
          </View>
        ) : (
          <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 18 }}>
            Your Premium tools are live in Studio, Feed, Market and Salon AI.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { borderRadius: 22, padding: 22, alignItems: 'center' },
  ic: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
