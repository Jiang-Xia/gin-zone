import { ViewModuleIcon } from 'tdesign-icons-react';
import MomentListPage from '../../pages/moment/list';
import MomentCommentManagePage from '../../pages/moment/comments';
import type { AppRouteItem } from '../types';

// 动态模块路由
const momentRoutes: AppRouteItem[] = [
  {
    path: '/content',
    requiresAuth: true,
    meta: {
      title: '内容管理',
    },
    children: [
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
        path: '/moment/comments',
        element: <MomentCommentManagePage />,
        requiresAuth: true,
        meta: {
          title: '动态评论管理',
          icon: <ViewModuleIcon />,
        },
      },
    ],
  },
];

export default momentRoutes;
