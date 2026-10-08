import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { EmptyState, Loading } from '@/components/Feedback';
import { Screen } from '@/components/Screen';
import { TaskCard } from '@/components/TaskCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { colors } from '@/lib/theme';
import type { Priority, Project, Status, Task } from '@/types';

type Filter = 'ALL' | Status;
type PriorityFilter = 'ALL' | Priority;

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (!id || authLoading || !user) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [nextProject, nextTasks] = await Promise.all([api.project(id), api.tasks(id)]);
      setProject(nextProject);
      setProjectTasks(nextTasks);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, authLoading, user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const tasks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projectTasks.filter(
      (task) =>
        (filter === 'ALL' || task.status === filter) &&
        (priorityFilter === 'ALL' || task.priority === priorityFilter) &&
        (!term ||
          task.name.toLowerCase().includes(term) ||
          task.description?.toLowerCase().includes(term)),
    );
  }, [projectTasks, query, filter, priorityFilter]);

  const updateTask = async (taskId: string, changes: Partial<Task>) => {
    if (busyId) return;
    setBusyId(taskId);
    setError('');
    const previous = projectTasks;
    setProjectTasks((current) =>
      current.map((task) => task.id === taskId ? { ...task, ...changes } : task),
    );
    try {
      await api.updateTask(taskId, changes);
    } catch (e) {
      setProjectTasks(previous);
      setError(errorMessage(e));
    } finally {
      setBusyId('');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (busyId) return;
    setBusyId(taskId);
    setError('');
    try {
      await api.deleteTask(taskId);
      setProjectTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId('');
    }
  };

  if (authLoading) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  if (loading && !project) return <Loading label="Loading project…" />;
  if (!project) return <EmptyState title="Couldn’t load project" detail={error} retry={() => void load()} />;

  return (
    <Screen>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            projectId={project.id}
            busy={busyId === item.id}
            onUpdate={(taskId, changes) => void updateTask(taskId, changes)}
            onDelete={(taskId) => void deleteTask(taskId)}
          />
        )}
        contentContainerStyle={[styles.list, tasks.length === 0 && styles.grow]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{project.name}</Text>
            {project.description ? <Text style={styles.description}>{project.description}</Text> : null}
            <Button onPress={() => router.push({ pathname: '/task-form', params: { projectId: project.id } })}>
              + Add task
            </Button>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search tasks"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={styles.search}
            />
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as Filter[]).map((item) => (
                <Chip
                  key={item}
                  label={item === 'ALL' ? 'All' : item.replace('_', ' ').toLowerCase()}
                  selected={filter === item}
                  onPress={() => setFilter(item)}
                />
              ))}
            </ScrollView>
            <Text style={styles.filterLabel}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as PriorityFilter[]).map((item) => (
                <Chip
                  key={item}
                  label={item === 'ALL' ? 'All' : item.toLowerCase()}
                  selected={priorityFilter === item}
                  onPress={() => setPriorityFilter(item)}
                />
              ))}
            </ScrollView>
            <Text style={styles.count}>{tasks.length} task{tasks.length === 1 ? '' : 's'}</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No matching tasks"
            detail={query || filter !== 'ALL' || priorityFilter !== 'ALL' ? 'Try changing your search or filters.' : 'Add the first task to this project.'}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 16 },
  grow: { flexGrow: 1 },
  separator: { height: 12 },
  header: { gap: 12, marginBottom: 14 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  description: { color: colors.muted, lineHeight: 21 },
  error: { color: colors.danger, backgroundColor: '#FEF2F2', padding: 11, borderRadius: 10 },
  search: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: colors.text, fontSize: 16 },
  filters: { gap: 8, paddingRight: 10 },
  filterLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
  count: { color: colors.muted, fontSize: 13 },
});
