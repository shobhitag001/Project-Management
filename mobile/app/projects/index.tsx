import { Redirect } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { EmptyState, Loading } from '@/components/Feedback';
import { ProjectCard } from '@/components/ProjectCard';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/lib/useProjects';

export default function ProjectsScreen() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading, refreshing, error, load } = useProjects(!authLoading && Boolean(user));
  if (authLoading) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  if (loading) return <Loading label="Loading projects…" />;
  if (error && projects.length === 0) {
    return <EmptyState title="Couldn’t load projects" detail={error} retry={() => void load()} />;
  }
  return (
    <Screen>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProjectCard project={item} />}
        contentContainerStyle={[styles.list, projects.length === 0 && styles.empty]}
        ItemSeparatorComponent={() => null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
        ListEmptyComponent={
          <EmptyState title="No projects" detail="Projects assigned to you will appear here." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 16, gap: 12 },
  empty: { flexGrow: 1 },
});
