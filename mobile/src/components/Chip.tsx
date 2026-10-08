import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/lib/theme';

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  selected: { backgroundColor: '#DBEAFE', borderColor: colors.primary },
  text: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  selectedText: { color: colors.primaryDark },
});
