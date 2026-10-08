import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Project } from '@/types';
import { colors } from '@/lib/theme';

export function ProjectCard({ project }: { project: Project }) {
  const total = project._count?.tasks ?? 0;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/projects/[id]', params: { id: project.id } })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
      {project.description ? (
        <Text style={styles.description} numberOfLines={2}>{project.description}</Text>
      ) : null}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{total} task{total === 1 ? '' : 's'}</Text>
        <Text style={styles.status}>{project.status.replace(/_/g, ' ').toLowerCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 9,
  },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '700' },
  arrow: { color: colors.primary, fontSize: 28, lineHeight: 28 },
  description: { color: colors.muted, lineHeight: 20 },
  meta: { color: colors.muted, fontSize: 13 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
});
