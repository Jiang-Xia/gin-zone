import { UserListIcon } from 'tdesign-icons-react';
import UserManagePage from '../../pages/user';
import type { AppRouteItem } from '../types';

// 用户管理路由
const userRoutes: AppRouteItem[] = [
  {
    path: '/chat',
    requiresAuth: true,
    meta: {
      title: '聊天管理',
      roles: ['admin'],
    },
    children: [
      {
        path: '/user/list',
        element: <UserManagePage />,
        requiresAuth: true,
        meta: {
          title: '用户管理',
          icon: <UserListIcon />,
          roles: ['admin'],
        },
      },
    ],
  },
];

export default userRoutes;
