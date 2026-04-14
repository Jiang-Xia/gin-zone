import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/login';
import ForbiddenPage from '../pages/error/Forbidden';
import NotFoundPage from '../pages/error/NotFound';
import MainLayout from '../layouts/MainLayout';
import RequireAuth from './RequireAuth';
import { useAuth } from '../store/auth';
import { appRoutes } from './routes';

export default function AppRouter() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/welcome' : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route element={<MainLayout />}>
        {appRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.requiresAuth ? (
                <RequireAuth roles={route.meta?.roles}>{route.element}</RequireAuth>
              ) : (
                route.element
              )
            }
          />
        ))}
      </Route>

      <Route path="*" element={token ? <NotFoundPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
