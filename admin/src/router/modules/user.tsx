import { UserListIcon } from 'tdesign-icons-react';
import UserManagePage from '../../pages/user';
import type { AppRouteItem } from '../types';

// 用户管理路由
const userRoutes: AppRouteItem[] = [
  {
    path: '/user/list',
    element: <UserManagePage />,
    requiresAuth: true,
    meta: {
      title: '用户管理',
      icon: <UserListIcon />,
      roles: ['admin'],
      breadcrumbs: ['系统管理', '用户管理'],
    },
  },
];

export default userRoutes;
