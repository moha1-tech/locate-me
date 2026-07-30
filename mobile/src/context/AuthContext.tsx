import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthUser, Role } from '../types';
import * as authApi from '../api/auth';
import { saveToken, clearToken } from '../api/client';

const USER_KEY = 'locateme_user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(USER_KEY).then((stored) => {
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
    });
  }, []);

  const persist = async (authUser: AuthUser, accessToken: string) => {
    await saveToken(accessToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const res = await authApi.login(email, password);
        await persist(res.user, res.accessToken);
      },
      register: async (email, password, name, role) => {
        const res = await authApi.register(email, password, name, role);
        await persist(res.user, res.accessToken);
      },
      logout: async () => {
        await clearToken();
        await SecureStore.deleteItemAsync(USER_KEY);
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
