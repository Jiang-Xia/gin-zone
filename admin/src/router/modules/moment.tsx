import { ViewModuleIcon } from 'tdesign-icons-react';
import MomentListPage from '../../pages/moment/list';
import type { AppRouteItem } from '../types';

// 动态模块路由
const momentRoutes: AppRouteItem[] = [
  {
    path: '/moment/list',
    element: <MomentListPage />,
    requiresAuth: true,
    meta: {
      title: '动态列表',
      icon: <ViewModuleIcon />,
      breadcrumbs: ['内容管理', '动态列表'],
    },
  },
];

export default momentRoutes;
