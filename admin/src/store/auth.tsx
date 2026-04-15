import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getUserInfo } from '../api/modules/user';
import { TOKEN_KEY, USER_KEY } from '../constants/auth';

// 用户信息结构（与后端字段尽量保持一致，便于直连渲染）
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
  // 登录态 token（空字符串表示未登录）
  token: string;
  // 当前用户信息（未登录/拉取失败时为 null）
  userInfo: UserInfo | null;
  // 登录：落 token 并同步拉取用户信息
  setLogin: (token: string) => Promise<void>;
  // 退出：清空 token 与用户缓存
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  // 首次初始化时从 localStorage 恢复登录态
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  });

  // 写入 token 后，尝试拉取一次用户信息；拉取失败则只保留 token（由后续页面自行处理）
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

  // 退出登录：同时清理本地缓存
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
