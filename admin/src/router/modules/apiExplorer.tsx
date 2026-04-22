import { ApiIcon } from 'tdesign-icons-react';
import type { AppRouteItem } from '../types';
import ApiExplorerPage from '../../pages/api-explorer';

const apiExplorerRoutes: AppRouteItem[] = [
  {
    path: '/tools/api-explorer',
    element: <ApiExplorerPage />,
    requiresAuth: true,
    meta: {
      title: '接口控制台',
      icon: <ApiIcon />,
      hideInMenu: true,
      roles: ['admin'],
    },
  },
];

export default apiExplorerRoutes;

