import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { colors } from '@/lib/theme';

export function Button({
  children,
  loading,
  variant = 'primary',
  ...props
}: PropsWithChildren<PressableProps & { loading?: boolean; variant?: 'primary' | 'outline' | 'danger' }>) {
  return (
    <Pressable
      {...props}
      disabled={props.disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (pressed || props.disabled || loading) && styles.faded,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.text, variant !== 'primary' && styles.altText]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  outline: { backgroundColor: colors.surface, borderColor: colors.primary },
  danger: { backgroundColor: colors.surface, borderColor: colors.danger },
  faded: { opacity: 0.65 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
  altText: { color: colors.primary },
});
