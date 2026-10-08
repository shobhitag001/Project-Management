import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/errors';
import { colors } from '@/lib/theme';

export default function LoginScreen() {
  const { login, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    clearNotice();
    setError('');
    if (!/\S+@\S+\.\S+/.test(email.trim())) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
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
        <View>
          <Text style={styles.eyebrow}>PROJECT MANAGER</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to keep your team's work moving.</Text>
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            onSubmitEditing={() => void submit()}
          />
          <Button loading={submitting} onPress={() => void submit()}>
            Sign in
          </Button>
        </View>
        <Text style={styles.footer}>
          New here? <Link href="/register" style={styles.link}>Create an account</Link>
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: 28, paddingVertical: 32 },
  eyebrow: { color: colors.primary, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8, lineHeight: 23 },
  notice: { color: colors.warning, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 10 },
  error: { color: colors.danger, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10 },
  footer: { color: colors.muted, textAlign: 'center' },
  link: { color: colors.primary, fontWeight: '700' },
});
