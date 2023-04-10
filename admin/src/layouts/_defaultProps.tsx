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
        path: 'https://jiang-xia.top/',
        name: '我的博客',
        icon: 'GithubFilled',
      },
    ],
  },
  title: 'Zone Admin',
  logo: '/logo512.png',
  location: {
    pathname: '/',
  },
  menu: {
    loading: false,
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
