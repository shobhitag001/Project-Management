import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { errorMessage } from './errors';
import type { Project } from '@/types';

export function useProjects(enabled = true) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setProjects(await api.projects());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);
  return { projects, loading, refreshing, error, load };
}
