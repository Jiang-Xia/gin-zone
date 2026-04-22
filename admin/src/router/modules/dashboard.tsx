import { DashboardIcon } from 'tdesign-icons-react';
import WelcomePage from '../../pages/welcome';
import type { AppRouteItem } from '../types';

// 控制台相关路由
const dashboardRoutes: AppRouteItem[] = [
  {
    path: '/welcome',
    element: <WelcomePage />,
    requiresAuth: true,
    meta: {
      title: '欢迎',
      icon: <DashboardIcon />,
    },
  },
];

export default dashboardRoutes;
