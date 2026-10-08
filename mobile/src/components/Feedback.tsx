import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors } from '@/lib/theme';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{detail}</Text>
      {retry ? <Button onPress={retry}>Try again</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  muted: { color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
