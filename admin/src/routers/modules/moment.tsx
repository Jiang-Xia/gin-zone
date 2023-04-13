import React from 'react';
import Layout from '@/layouts';
import { RouteObject, lazyLoad } from '@/routers';
// moment 模块
const momentRouter: RouteObject = {
  element: <Layout />,
  children: [
    {
      path: '/moment/list',
      element: lazyLoad('moment/list'),
      name: '动态页',
      auth: true,
    },
    {
      path: '/moment/detail',
      element: lazyLoad('moment/detail'),
      name: '动态详情',
      auth: true,
    },
  ],
};
export default momentRouter;
