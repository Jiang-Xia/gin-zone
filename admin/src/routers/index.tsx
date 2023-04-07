import { Suspense, lazy, ReactNode } from 'react';
import Layout from '@/layout/index';
import LoginPage from '@pages/login';
import defaultProps from '../layout/_defaultProps';
import { Routes, Route } from 'react-router-dom';
import AuthRouter from './AuthRouter';
import React from 'react';
const LayoutComponent = ({ children }: any) => {
  return (
    <Suspense fallback={''}>
      <Layout />
    </Suspense>
  );
};
const lazyLoad = (moduleName: string) => {
  const Module = lazy(() => import(`@pages/${moduleName}`));
  return <Module />;
};

export interface RouteConfig {
  path: string;
  component: ReactNode;
  auth?: boolean;
  name?: string;
  icon?: ReactNode;
  routes?: RouteConfig[];
  redirect?: string;
}

export const routers: RouteConfig[] = [{ path: '/login', component: <LoginPage />, auth: false }, defaultProps.route];

// 手动处理我们的routers 渲染路由表
export const RouteAuthFun = (routeList: RouteConfig[]) => {
  routeList = routeList.filter(v => v.component);
  return routeList.map((item: { path: string; auth?: boolean; component: ReactNode; routes?: any }) => {
    return (
      <Route
        path={item.path}
        element={
          // 鉴权组件
          <AuthRouter auth={item.auth} key={item.path}>
            {item.component}
          </AuthRouter>
        }
        key={item.path}
      >
        {/* 递归调用，因为可能存在多级的路由 */}
        {console.log(item)}
        {item?.routes && RouteAuthFun(item.routes)}
      </Route>
    );
  });
};
// 所有进入系统部署后的菜单路由
export const MenuRoutes: React.FC = () => (
  <div className="App">
    <Routes>{RouteAuthFun(defaultProps.route.routes)}</Routes>
  </div>
);
