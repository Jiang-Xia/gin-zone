import { ChartIcon, DashboardIcon,DocumentLocationIcon,ChatMessageIcon,ViewGanttIcon } from 'tdesign-icons-react';
import BlogOpsPage from '../../pages/blog/ops';
import BlogArticleManagePage from '../../pages/blog/articles';
import BlogCommentManagePage from '../../pages/blog/comments';
import BlogDashboardPage from '../../pages/blog/dashboard';
import type { AppRouteItem } from '../types';

const blogRoutes: AppRouteItem[] = [
  {
    path: '/content',
    requiresAuth: true,
    meta: {
      title: '内容管理',
      icon: <DocumentLocationIcon />,
      roles: ['admin'],
    },
    children: [
      {
        path: '/blog/dashboard',
        element: <BlogDashboardPage />,
        requiresAuth: true,
        meta: {
          title: '内容统计',
          icon: <DashboardIcon />,
          roles: ['admin'],
        },
      },
      {
        path: '/blog/articles',
        element: <BlogArticleManagePage />,
        requiresAuth: true,
        meta: {
          title: '文章管理',
          icon: <ViewGanttIcon />,
          roles: ['admin'],
        },
      },
      {
        path: '/blog/comments',
        element: <BlogCommentManagePage />,
        requiresAuth: true,
        meta: {
          title: '评论管理',
          icon: <ChatMessageIcon />,
          roles: ['admin'],
        },
      },
    ],
  },
  {
    path: '/blog/ops',
    element: <BlogOpsPage />,
    requiresAuth: true,
    meta: {
      title: '博客运营',
      icon: <ChartIcon />,
      hideInMenu: true,
      roles: ['admin'],
    },
  },
];

export default blogRoutes;

