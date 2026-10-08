import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FormField } from '@/components/FormField';
import { Loading } from '@/components/Feedback';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { colors } from '@/lib/theme';
import type { Priority, Status, TaskInput } from '@/types';

export default function TaskFormScreen() {
  const { projectId, taskId } = useLocalSearchParams<{ projectId: string; taskId?: string }>();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('PENDING');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(Boolean(taskId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!taskId || !projectId || authLoading || !user) return;
    api.tasks(projectId)
      .then((tasks) => {
        const task = tasks.find((item) => item.id === taskId);
        if (!task) throw new Error('Task not found.');
        setTitle(task.name);
        setDescription(task.description ?? '');
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.dueDate?.slice(0, 10) ?? '');
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [projectId, taskId, authLoading, user]);

  const submit = async () => {
    setError('');
    if (!title.trim()) return setError('Task title is required.');
    if (title.trim().length > 120) return setError('Task title must be 120 characters or fewer.');
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return setError('Due date must use YYYY-MM-DD.');
    }
    if (dueDate && Number.isNaN(new Date(`${dueDate}T00:00:00`).getTime())) {
      return setError('Enter a valid due date.');
    }
    if (!projectId) return setError('Project information is missing.');
    const input: TaskInput = {
      name: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || null,
      projectId,
    };
    setSubmitting(true);
    try {
      if (taskId) await api.updateTask(taskId, input);
      else await api.createTask(input);
      router.back();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  if (loading) return <Loading label="Loading task…" />;

  return (
    <Screen>
      <Stack.Screen options={{ title: taskId ? 'Edit task' : 'New task' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FormField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          maxLength={120}
        />
        <FormField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add context or acceptance criteria"
          multiline
          maxLength={1000}
        />
        <Text style={styles.label}>Status</Text>
        <View style={styles.chips}>
          {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as Status[]).map((item) => (
            <Chip key={item} label={item.replace('_', ' ').toLowerCase()} selected={status === item} onPress={() => setStatus(item)} />
          ))}
        </View>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.chips}>
          {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((item) => (
            <Chip key={item} label={item.toLowerCase()} selected={priority === item} onPress={() => setPriority(item)} />
          ))}
        </View>
        <FormField
          label="Due date (optional)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Button loading={submitting} onPress={() => void submit()}>
          {taskId ? 'Save changes' : 'Create task'}
        </Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 20, paddingBottom: 40 },
  error: { color: colors.danger, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginBottom: 16 },
  label: { color: colors.text, fontWeight: '600', fontSize: 14, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
});
