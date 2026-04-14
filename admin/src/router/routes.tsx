import { DashboardIcon, UserCircleIcon, ViewModuleIcon } from 'tdesign-icons-react';
import type { ReactElement, ReactNode } from 'react';
import MomentListPage from '../pages/moment/list';
import ProfilePage from '../pages/profile';
import UserManagePage from '../pages/user';
import WelcomePage from '../pages/welcome';

export interface AppRouteMeta {
  title: string;
  icon?: ReactElement;
  hideInMenu?: boolean;
  roles?: string[];
}

export interface AppRouteItem {
  path: string;
  element: ReactNode;
  requiresAuth?: boolean;
  meta?: AppRouteMeta;
}

export const appRoutes: AppRouteItem[] = [
  {
    path: '/welcome',
    element: <WelcomePage />,
    requiresAuth: true,
    meta: {
      title: '欢迎',
      icon: <DashboardIcon />,
    },
  },
  {
    path: '/moment/list',
    element: <MomentListPage />,
    requiresAuth: true,
    meta: {
      title: '动态列表',
      icon: <ViewModuleIcon />,
    },
  },
  {
    path: '/user/list',
    element: <UserManagePage />,
    requiresAuth: true,
    meta: {
      title: '用户管理',
      icon: <UserCircleIcon />,
      roles: ['admin'],
    },
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    requiresAuth: true,
    meta: {
      title: '个人中心',
      icon: <UserCircleIcon />,
    },
  },
];

export const menuRoutes = appRoutes.filter((route) => route.meta && !route.meta.hideInMenu);
