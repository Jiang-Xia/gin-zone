import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getUserInfo } from '../api/modules/user';
import { TOKEN_KEY, USER_KEY } from '../constants/auth';

export interface UserInfo {
  id?: number;
  userId?: string;
  userName?: string;
  nickName?: string;
  avatar?: string;
  intro?: string;
  email?: string;
  gender?: number;
  isAdmin?: boolean;
  isLock?: boolean;
  roles?: string[];
  [key: string]: unknown;
}

interface AuthContextValue {
  token: string;
  userInfo: UserInfo | null;
  setLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  });

  const setLogin = async (nextToken: string) => {
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    try {
      const res = await getUserInfo();
      setUserInfo(res ?? null);
      localStorage.setItem(USER_KEY, JSON.stringify(res ?? null));
    } catch {
      setUserInfo(null);
      localStorage.removeItem(USER_KEY);
    }
  };

  const logout = () => {
    setToken('');
    setUserInfo(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      userInfo,
      setLogin,
      logout,
    }),
    [token, userInfo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
