import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { canAccessRoute } from './permissions';

interface RequireAuthProps {
  // 允许访问的角色列表（不传/空数组表示不做角色限制）
  roles?: string[];
  children?: ReactNode;
}

export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { token, userInfo } = useAuth();
  const location = useLocation();
  // 未登录：跳转登录页，并记录来源路径（便于后续回跳）
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // 角色校验：统一复用 canAccessRoute，避免菜单与路由规则不一致
  if (!canAccessRoute(userInfo, { title: '', roles })) {
    return <Navigate to="/403" replace />;
  }
  // 用法：可包裹 children，也可作为 <Route element={<RequireAuth/>}> 输出 <Outlet/>
  return children ? <>{children}</> : <Outlet />;
}
