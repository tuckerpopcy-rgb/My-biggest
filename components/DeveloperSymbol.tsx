// ============================================================
// Salon na we yon - Developer Access Symbol
// LARGE, easy-to-tap developer portal access
// ============================================================

import React, { useState } from 'react';
import {
  TouchableOpacity, View, Text, StyleSheet,
  Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import { useApp } from '../lib/context';
import { authService } from '../lib/auth';
import { Button } from './UIComponents';

interface Props {
  onAccess: () => void;
}

export function DeveloperSymbol({ onAccess }: Props) {
  const { theme } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the developer access code.');
      return;
    }
    setVerifying(true);
    const valid = await authService.verifyDeveloperAccess(code.trim());
    setVerifying(false);

    if (valid) {
      setModalVisible(false);
      setCode('');
      onAccess();
    } else {
      Alert.alert('Access Denied', 'Invalid developer code. Only Henry Tucker can access the developer portal.');
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.symbol,
          {
            backgroundColor: theme.colors.primary + '18',
            borderColor: theme.colors.primary + '50',
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.35,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
          },
        ]}
        activeOpacity={0.6}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={[styles.symbolText, { color: theme.colors.primary }]}>⚙️</Text>
        <Text style={[styles.label, { color: theme.colors.primary }]}>DEV</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>🔐 Developer Portal</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Enter the developer access code to continue. Only Henry Tucker has access.
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surfaceAlt,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder="Developer access code"
              placeholderTextColor={theme.colors.textMuted}
              value={code}
              onChangeText={setCode}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleVerify}
            />
            <View style={styles.buttonRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button theme={theme} title="Cancel" variant="outline" onPress={() => { setModalVisible(false); setCode(''); }} />
              </View>
              <View style={{ flex: 1 }}>
                <Button theme={theme} title={verifying ? 'Verifying...' : 'Access'} onPress={handleVerify} disabled={verifying} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  symbol: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 30,
    fontWeight: '900',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
  },
});
