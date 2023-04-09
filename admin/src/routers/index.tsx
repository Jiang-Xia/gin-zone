import { Suspense, lazy, ReactNode } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import Login from '@pages/login';
// 组件自动化导入函数
export const lazyLoad = (moduleName: string) => {
  const Module = lazy(() => import(`@pages/${moduleName}`));
  return (
    <LazyLoadComponent>
      <Module />
    </LazyLoadComponent>
  );
};
// 懒加载组件
const LazyLoadComponent = ({ children }: any) => {
  // Suspense懒加载时用于页面缓存
  return (
    <Suspense
      fallback={
        <Spin
          size="large"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        />
      }
    >
      {children}
    </Suspense>
  );
};
export interface RouteObject {
  element: ReactNode;
  path?: string;
  auth?: boolean;
  name?: string;
  icon?: ReactNode;
  children?: RouteObject[];
  redirect?: string;
}
// 自动导入所有模块路由
const metaRouters: any = require.context('./modules', false, /.tsx$/);
// 统一处理路由
export const routerArray: RouteObject[] = [];
metaRouters.keys().forEach((key: string) => {
  const route: RouteObject = metaRouters(key).default;
  routerArray.push(route);
});
export const rootRouter: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" />,
  },
  {
    path: '/login',
    element: <Login />,
    auth: false,
  },
  ...routerArray,
  {
    path: '*',
    element: <Navigate to="/moment" />,
  },
];

const Router = () => {
  const routes = useRoutes(rootRouter);
  return routes;
};

export default Router;
