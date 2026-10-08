import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState, Loading } from '@/components/Feedback';
import { ProjectCard } from '@/components/ProjectCard';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { colors } from '@/lib/theme';
import { useProjects } from '@/lib/useProjects';
import type { DashboardStats } from '@/types';

export default function DashboardScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const { projects, loading, refreshing, error, load } = useProjects(
    !authLoading && Boolean(user),
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsRefreshing, setStatsRefreshing] = useState(false);
  const [statsError, setStatsError] = useState('');

  const loadStats = useCallback(async (refresh = false) => {
    refresh ? setStatsRefreshing(true) : setStatsLoading(true);
    setStatsError('');
    try {
      setStats(await api.dashboard());
    } catch (caught) {
      setStatsError(errorMessage(caught));
    } finally {
      setStatsLoading(false);
      setStatsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) void loadStats();
  }, [authLoading, user, loadStats]);

  const refresh = () => Promise.all([load(true), loadStats(true)]);

  if (authLoading) return <Loading />;
  if (!user) return <Redirect href="/login" />;

  const pageLoading = loading || statsLoading;
  const pageError = error || statsError;
  const cards = stats
    ? [
        ['Projects', stats.totalProjects],
        ['Tasks', stats.totalTasks],
        ['Completed', stats.completedTasks],
        ['Pending', stats.pendingTasks],
        ['Projects in progress', stats.projectsInProgress],
      ] as const
    : [];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || statsRefreshing}
            onRefresh={() => void refresh()}
          />
        }
      >
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.greeting}>
              Hello{user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            </Text>
            <Text style={styles.subheading}>Here’s how your work is progressing.</Text>
          </View>
          <Button variant="outline" onPress={() => void logout()}>Log out</Button>
        </View>
        {!pageLoading && !pageError && stats ? (
          <View style={styles.stats}>
            {cards.map(([label, value]) => (
              <View style={styles.stat} key={label}>
                <Text style={styles.statNumber}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent projects</Text>
          <Text style={styles.link} onPress={() => router.push('/projects')}>View all</Text>
        </View>
        {pageLoading ? <Loading label="Loading dashboard…" /> : pageError ? (
          <EmptyState
            title="Couldn’t load dashboard"
            detail={pageError}
            retry={() => void refresh()}
          />
        ) : projects.length === 0 ? (
          <EmptyState title="No projects yet" detail="Projects assigned to you will appear here." />
        ) : (
          projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingVertical: 18, gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headingText: { flex: 1 },
  greeting: { color: colors.text, fontSize: 27, fontWeight: '800' },
  subheading: { color: colors.muted, marginTop: 4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 8 },
  stat: { width: '47%', flexGrow: 1, backgroundColor: '#EFF6FF', padding: 14, borderRadius: 14 },
  statNumber: { color: colors.primaryDark, fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 20, fontWeight: '800' },
  link: { color: colors.primary, fontWeight: '700', padding: 6 },
});
