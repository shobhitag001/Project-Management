import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from './Chip';
import type { Priority, Status, Task } from '@/types';
import { colors } from '@/lib/theme';

const nextStatus: Record<Status, Status> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
};
const nextPriority: Record<Priority, Priority> = {
  LOW: 'MEDIUM',
  MEDIUM: 'HIGH',
  HIGH: 'LOW',
};

export function TaskCard({
  task,
  projectId,
  busy,
  onUpdate,
  onDelete,
}: {
  task: Task;
  projectId: string;
  busy?: boolean;
  onUpdate: (id: string, changes: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const done = task.status === 'COMPLETED';
  const confirmDelete = () =>
    Alert.alert('Delete task?', `“${task.name}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
    ]);

  return (
    <View style={[styles.card, done && styles.doneCard, busy && styles.busy]}>
      <Pressable
        onPress={() =>
          router.push({ pathname: '/task-form', params: { projectId, taskId: task.id } })
        }
      >
        <View style={styles.titleRow}>
          <Text style={[styles.title, done && styles.done]}>{task.name}</Text>
          <Text style={styles.edit}>Edit</Text>
        </View>
        {task.description ? <Text style={styles.description} numberOfLines={2}>{task.description}</Text> : null}
        {task.dueDate ? <Text style={styles.due}>Due {new Date(task.dueDate).toLocaleDateString()}</Text> : null}
      </Pressable>
      <View style={styles.chips}>
        <Chip
          label={task.status.replace('_', ' ').toLowerCase()}
          onPress={() => onUpdate(task.id, { status: nextStatus[task.status] })}
        />
        <Chip
          label={`${task.priority.toLowerCase()} priority`}
          onPress={() => onUpdate(task.id, { priority: nextPriority[task.priority] })}
        />
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.completeButton}
          onPress={() => onUpdate(task.id, { status: done ? 'PENDING' : 'COMPLETED' })}
        >
          <Text style={styles.completeText}>{done ? 'Reopen' : 'Mark complete'}</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} hitSlop={10}>
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 15, gap: 10 },
  doneCard: { backgroundColor: '#F8FAFC' },
  busy: { opacity: 0.55 },
  titleRow: { flexDirection: 'row', gap: 10 },
  title: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 17 },
  done: { color: colors.muted, textDecorationLine: 'line-through' },
  edit: { color: colors.primary, fontWeight: '600' },
  description: { color: colors.muted, lineHeight: 20, marginTop: 5 },
  due: { color: colors.warning, fontSize: 12, marginTop: 6 },
  chips: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  actions: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', alignItems: 'center' },
  completeButton: { flex: 1 },
  completeText: { color: colors.success, fontWeight: '700' },
  delete: { color: colors.danger, fontWeight: '600' },
});
