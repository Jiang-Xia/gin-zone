import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';

interface RequireAuthProps {
  roles?: string[];
  children?: ReactNode;
}

export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { token, userInfo } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && roles.length > 0) {
    const roleList = Array.isArray(userInfo?.roles) ? (userInfo?.roles as string[]) : [];
    const isAdmin = Boolean(userInfo?.isAdmin);
    if (!isAdmin && !roles.some((role) => roleList.includes(role))) {
      return <Navigate to="/403" replace />;
    }
  }
  return children ? <>{children}</> : <Outlet />;
}
