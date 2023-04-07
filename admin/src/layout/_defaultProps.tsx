import { ChromeFilled, CrownFilled, SmileFilled } from '@ant-design/icons';
import Layout from './index';
import { lazy } from 'react';
import Welcome from '../pages/Welcome';
// 快速导入工具函数
const lazyLoad = (moduleName: string) => {
  const Module = lazy(() => import(`@/pages/${moduleName}`));
  return <Module />;
};
const defaultProps: any = {
  route: {
    path: '/',
    routes: [
      {
        path: '/welcome',
        name: '欢迎',
        component: Welcome,
        icon: <SmileFilled />,
        auth: true,
      },
      {
        path: '/moment',
        component: lazyLoad('moment'),
        name: '动态',
        auth: true,
        routes: [{ path: 'detail', component: lazyLoad('moment/detail'), name: '动态详情', auth: true }],
      },
      //   { path: "*", component: <NotFound />, auth: true },
      {
        path: 'https://jiang-xia.top/',
        name: '我的博客',
        icon: <ChromeFilled />,
      },
    ],
  },
  location: {
    pathname: '/',
  },
  appList: [
    {
      icon: 'https://jiang-xia.top/favicon.ico',
      title: '博客',
      desc: '博客前台',
      url: 'https://jiang-xia.top',
      target: '_blank',
    },
    {
      icon: 'https://admin.jiang-xia.top/logo.png',
      title: '博客后台管理',
      desc: '博客后台管理',
      url: 'https://admin.jiang-xia.top',
      target: '_blank',
    },
    {
      icon: 'https://jiang-xia.top/zone/static/logo/favicon.ico',
      title: 'Zone',
      desc: 'uniapp大前端项目',
      url: 'https://jiang-xia.top/zone/pages/blog/index',
      target: '_blank',
    },
  ],
};
export default defaultProps;
