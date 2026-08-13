import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Button, Card, Field, FlagBar } from '../components/UI';
import { ACADEMY_FEE, COURSES, ORANGE_MONEY } from '../lib/teachAI';
import { CourseId } from '../lib/types';

export default function AcademyScreen() {
  const nav = useNavigation<any>();
  const {
    palette,
    t,
    user,
    applyForAcademy,
    submitClassPayment,
    myApplication,
    isAcademyApproved,
    tap,
  } = useApp();
  const app = myApplication();
  const approved = isAcademyApproved();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [reason, setReason] = useState('');
  const [picked, setPicked] = useState<CourseId[]>(['forex', 'office', 'software']);
  const [sender, setSender] = useState('');
  const [ref, setRef] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (id: CourseId) => {
    tap();
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const apply = async () => {
    if (picked.length !== 3) return;
    setBusy(true);
    try {
      await applyForAcademy({ fullName: name, phone, reason, subjects: picked });
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    if (!app) return;
    setBusy(true);
    try {
      await submitClassPayment(app.id, sender, ref);
      setSender('');
      setRef('');
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (approved) return 'Approved — classroom unlocked';
    if (app?.status === 'paid_pending') return 'Paid — waiting for approval';
    if (app?.status === 'rejected') return 'Not approved';
    if (app?.status === 'awaiting_payment') return 'Awaiting Orange Money payment';
    return 'New application';
  }, [app, approved]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top']}>
      <FlagBar />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: palette.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SALON ACADEMY</Text>
        <Text style={{ color: palette.text, fontSize: 26, fontWeight: '900' }}>{t('academy')}</Text>
        <Text style={{ color: palette.muted, marginTop: 6, lineHeight: 20 }}>
          Apply to study three live subjects with Salon AI lecturers. Pay Le {ACADEMY_FEE} by Orange Money, then wait for approval. The classroom stays locked until you are approved.
        </Text>

        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: palette.accent, fontWeight: '800' }}>{statusLabel}</Text>
          <Text style={{ color: palette.text, marginTop: 8, fontWeight: '700' }}>Orange Money</Text>
          <Text style={{ color: palette.primary, fontSize: 22, fontWeight: '900', marginTop: 2 }}>{ORANGE_MONEY}</Text>
          <Text style={{ color: palette.muted, marginTop: 4 }}>Le {ACADEMY_FEE} · Forex + Microsoft Office + Software Engineering</Text>
        </Card>

        {COURSES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => {
              if (approved) nav.navigate('Classroom', { subject: c.id });
              else toggle(c.id);
            }}
            style={[styles.course, { backgroundColor: palette.card, borderColor: picked.includes(c.id) ? palette.primary : palette.border }]}
          >
            <View style={[styles.ic, { backgroundColor: palette.bgAlt }]}>
              <Ionicons name={c.icon} size={20} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: '800' }}>{c.title}</Text>
              <Text style={{ color: palette.muted, marginTop: 2 }}>{c.summary}</Text>
            </View>
            {approved ? (
              <Ionicons name="lock-open" size={18} color={palette.success} />
            ) : (
              <Ionicons name={picked.includes(c.id) ? 'checkbox' : 'square-outline'} size={20} color={palette.primary} />
            )}
          </Pressable>
        ))}

        {approved ? (
          <Button title={t('classroom')} icon="school" onPress={() => nav.navigate('Classroom', { subject: 'forex' })} style={{ marginTop: 16 }} />
        ) : !app || app.status === 'rejected' ? (
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: palette.text, fontWeight: '800', marginBottom: 8 }}>Study application</Text>
            <Field label="Full name" value={name} onChangeText={setName} />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+232…" />
            <Field label="Why do you want these classes?" value={reason} onChangeText={setReason} multiline />
            <Button
              title={busy ? 'Saving…' : 'Submit application'}
              onPress={apply}
              loading={busy}
              disabled={busy || picked.length !== 3 || !name.trim()}
            />
            <Text style={{ color: palette.muted, fontSize: 12, marginTop: 8 }}>
              All three subjects are required. Fee is Le {ACADEMY_FEE} after you apply.
            </Text>
          </Card>
        ) : app.status === 'awaiting_payment' ? (
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: palette.text, fontWeight: '800' }}>Pay with Orange Money</Text>
            <Text style={{ color: palette.muted, marginTop: 6, lineHeight: 20 }}>
              Send Le {ACADEMY_FEE} to {ORANGE_MONEY}. Then enter the number you sent from and the Orange Money reference.
            </Text>
            <Field label="Your Orange Money number" value={sender} onChangeText={setSender} keyboardType="phone-pad" placeholder="+23278…" />
            <Field label="Transaction reference" value={ref} onChangeText={setRef} placeholder="OM-…" />
            <Button title={busy ? 'Sending…' : `I paid Le ${ACADEMY_FEE}`} onPress={pay} loading={busy} disabled={busy || !sender.trim() || !ref.trim()} />
          </Card>
        ) : (
          <Card style={{ marginTop: 14 }}>
            <Ionicons name="time" size={28} color={palette.warning} />
            <Text style={{ color: palette.text, fontWeight: '800', marginTop: 8 }}>Payment is in the database</Text>
            <Text style={{ color: palette.muted, marginTop: 6 }}>
              Henry Tucker reviews paid applications. Classroom stays locked until you are approved. You will get a live notification.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  course: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  ic: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
