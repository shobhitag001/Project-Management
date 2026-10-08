import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/lib/theme';

export function FormField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, props.multiline && styles.multiline, error && styles.invalid]}
        placeholderTextColor={colors.muted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 15 },
  label: { color: colors.text, fontWeight: '600', fontSize: 14 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  invalid: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});
