import { Redirect } from 'expo-router';
import { Loading } from '@/components/Feedback';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Restoring your session…" />;
  return <Redirect href={user ? '/dashboard' : '/login'} />;
}
