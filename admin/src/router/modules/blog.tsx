import { ChartIcon, DashboardIcon } from 'tdesign-icons-react';
import BlogOpsPage from '../../pages/blog/ops';
import BlogArticleManagePage from '../../pages/blog/articles';
import BlogCommentManagePage from '../../pages/blog/comments';
import BlogDashboardPage from '../../pages/blog/dashboard';
import type { AppRouteItem } from '../types';

const blogRoutes: AppRouteItem[] = [
  {
    path: '/blog/dashboard',
    element: <BlogDashboardPage />,
    requiresAuth: true,
    meta: {
      title: '内容统计',
      icon: <DashboardIcon />,
      roles: ['admin'],
      breadcrumbs: ['内容管理', '内容统计'],
    },
  },
  {
    path: '/blog/articles',
    element: <BlogArticleManagePage />,
    requiresAuth: true,
    meta: {
      title: '文章管理',
      icon: <ChartIcon />,
      roles: ['admin'],
      breadcrumbs: ['内容管理', '文章管理'],
    },
  },
  {
    path: '/blog/comments',
    element: <BlogCommentManagePage />,
    requiresAuth: true,
    meta: {
      title: '评论管理',
      icon: <ChartIcon />,
      roles: ['admin'],
      breadcrumbs: ['内容管理', '评论管理'],
    },
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
      breadcrumbs: ['系统工具', '博客运营联调'],
    },
  },
];

export default blogRoutes;

