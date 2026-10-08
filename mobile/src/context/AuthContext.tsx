import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, configureApi } from '@/lib/api';
import { ApiError } from '@/lib/errors';
import type { User } from '@/types';

const TOKEN_KEY = 'project_manager_jwt';
const USER_KEY = 'project_manager_user';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  notice: string | null;
  login(email: string, password: string): Promise<void>;
  register(fullName: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  clearNotice(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const endSession = useCallback(async (message?: string) => {
    configureApi(null);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setUser(null);
    if (message) setNotice(message);
    router.replace('/login');
  }, []);

  useEffect(() => {
    configureApi(null, (message) => void endSession(message));
    Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ])
      .then(async ([storedToken, storedUser]) => {
        if (storedToken) {
          configureApi(storedToken, (message) => void endSession(message));
          try {
            const currentUser = await api.me();
            setUser(currentUser);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(currentUser));
          } catch (error) {
            if (!(error instanceof ApiError) || error.status !== 401) {
              if (storedUser) {
                setUser(JSON.parse(storedUser) as User);
                setNotice('No network connection. Showing cached account data.');
              } else {
                setNotice('No network connection. Sign in when connectivity returns.');
              }
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [endSession]);

  const persistSession = async (response: Awaited<ReturnType<typeof api.login>>) => {
    const jwt = response.token;
    if (!jwt) throw new Error('The server did not return an access token.');
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, jwt),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
    ]);
    configureApi(jwt, (message) => void endSession(message));
    setUser(response.user);
    setNotice(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      notice,
      login: async (email, password) => persistSession(await api.login(email, password)),
      register: async (fullName, email, password) =>
        persistSession(await api.register(fullName, email, password)),
      logout: async () => {
        let message: string | undefined;
        try {
          await api.logout();
        } catch (error) {
          message = `${error instanceof Error ? error.message : 'The server could not be reached.'} You were logged out on this device.`;
        }
        await endSession(message);
      },
      clearNotice: () => setNotice(null),
    }),
    [user, loading, notice, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
