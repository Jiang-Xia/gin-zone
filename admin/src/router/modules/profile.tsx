import { UserCircleIcon } from 'tdesign-icons-react';
import ProfilePage from '../../pages/profile';
import type { AppRouteItem } from '../types';

// 个人中心路由
const profileRoutes: AppRouteItem[] = [
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

export default profileRoutes;
