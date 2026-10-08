import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/errors';
import { colors } from '@/lib/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    if (fullName.trim().length < 2) return setError('Full name must be at least 2 characters.');
    if (!/\S+@\S+\.\S+/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim().toLowerCase(), password);
      router.replace('/dashboard');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Start organizing your work</Text>
        <Text style={styles.subtitle}>Create an account to access your projects and tasks.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FormField label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          onSubmitEditing={() => void submit()}
        />
        <Button loading={submitting} onPress={() => void submit()}>Create account</Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingVertical: 28 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  error: { color: colors.danger, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginBottom: 16 },
});
