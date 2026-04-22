import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/login';
import ForbiddenPage from '../pages/error/Forbidden';
import NotFoundPage from '../pages/error/NotFound';
import MainLayout from '../layouts/MainLayout';
import RequireAuth from './RequireAuth';
import { useAuth } from '../store/auth';
import { flatRoutes } from './routes';

export default function AppRouter() {
  // token 为空视为未登录，用于决定默认跳转与兜底路由
  const { token } = useAuth();

  return (
    <Routes>
      {/* 根路径：根据登录态决定跳转到欢迎页或登录页 */}
      <Route path="/" element={<Navigate to={token ? '/welcome' : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* 主布局容器：承载侧边栏/顶部栏/页面配置等 */}
      <Route element={<MainLayout />}>
        {flatRoutes
          .filter((route) => route.element)
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requiresAuth ? (
                  // 需要登录的页面：统一在这里做鉴权和角色校验
                  <RequireAuth roles={route.meta?.roles}>{route.element}</RequireAuth>
                ) : (
                  route.element
                )
              }
            />
          ))}
      </Route>

      {/* 未匹配路由：已登录 -> 404；未登录 -> 强制回登录页 */}
      <Route path="*" element={token ? <NotFoundPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
