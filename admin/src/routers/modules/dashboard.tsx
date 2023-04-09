import React from 'react';
import Layout from '@/layouts';
import { RouteObject, lazyLoad } from '@/routers';
// dashboard 模块
const dashboardRouter: RouteObject = {
  element: <Layout />,
  children: [
    {
      path: '/welcome',
      element: lazyLoad('Welcome'),
      name: '欢迎页',
      auth: true,
    },
  ],
};

export default dashboardRouter;
