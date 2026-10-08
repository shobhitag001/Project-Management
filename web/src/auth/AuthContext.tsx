import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { User } from "../types";

interface AuthValue {
  user: User | null;
  loading: boolean;
  expiredMessage: string;
  login(email: string, password: string): Promise<void>;
  register(fullName: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiredMessage, setExpiredMessage] = useState("");

  const expire = useCallback(() => {
    setUser(null);
    setExpiredMessage("Your session expired. Please log in again.");
  }, []);

  useEffect(() => {
    window.addEventListener("auth-expired", expire);
    const token = localStorage.getItem("pms_token");
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener("auth-expired", expire);
    }
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    return () => window.removeEventListener("auth-expired", expire);
  }, [expire]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      expiredMessage,
      async login(email, password) {
        const result = await api.login({ email, password });
        localStorage.setItem("pms_token", result.token);
        setExpiredMessage("");
        setUser(result.user);
      },
      async register(fullName, email, password) {
        const result = await api.register({ fullName, email, password });
        localStorage.setItem("pms_token", result.token);
        setExpiredMessage("");
        setUser(result.user);
      },
      async logout() {
        try {
          await api.logout();
        } finally {
          localStorage.removeItem("pms_token");
          setUser(null);
        }
      },
    }),
    [expiredMessage, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
