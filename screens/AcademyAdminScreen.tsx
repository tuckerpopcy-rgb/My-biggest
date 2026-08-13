import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Button, Card, Empty, FlagBar } from '../components/UI';
import { ACADEMY_FEE, COURSES } from '../lib/teachAI';
import { timeAgo } from '../lib/hash';

export default function AcademyAdminScreen() {
  const { palette, applications, payments, reviewApplication, user, getUser } = useApp();
  const rows = [...applications].sort((a, b) => b.updatedAt - a.updatedAt);

  if (!user?.isDeveloper) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <Empty icon="shield-outline" title="Developer only" body="Review sits with Henry Tucker." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['bottom']}>
      <FlagBar />
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900', marginBottom: 12 }}>Academy desk</Text>
        }
        ListEmptyComponent={<Empty icon="school-outline" title="No applications yet" />}
        renderItem={({ item }) => {
          const payer = payments.find((p) => p.id === item.paymentId);
          const who = getUser(item.userId);
          return (
            <Card style={{ marginBottom: 12 }}>
              <Text style={{ color: palette.text, fontWeight: '800' }}>{item.fullName}</Text>
              <Text style={{ color: palette.muted, marginTop: 2 }}>
                @{who?.username} · {item.phone} · {timeAgo(item.updatedAt)}
              </Text>
              <Text style={{ color: palette.text, marginTop: 8 }}>{item.reason || 'No note.'}</Text>
              <Text style={{ color: palette.muted, marginTop: 6 }}>
                {item.subjects.map((s) => COURSES.find((c) => c.id === s)?.title || s).join(' · ')}
              </Text>
              <Text style={{ color: palette.accent, fontWeight: '800', marginTop: 8 }}>{item.status.replace('_', ' ')}</Text>
              {payer ? (
                <Text style={{ color: palette.muted, marginTop: 4 }}>
                  Paid Le {payer.amount} from {payer.senderNumber} · ref {payer.reference}
                </Text>
              ) : (
                <Text style={{ color: palette.muted, marginTop: 4 }}>No payment recorded yet (fee Le {ACADEMY_FEE}).</Text>
              )}
              {item.status === 'paid_pending' ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Button title="Approve" onPress={() => reviewApplication(item.id, 'approved')} style={{ flex: 1 }} />
                  <Button title="Reject" variant="danger" onPress={() => reviewApplication(item.id, 'rejected')} style={{ flex: 1 }} />
                </View>
              ) : null}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
