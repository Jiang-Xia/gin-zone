import type { FC, ReactNode } from 'react';
import 'antd/dist/reset.css';
import './App.css';
import { routers, RouteConfig } from './routers';
import { useRoutes } from 'react-router-dom';
const App: FC = () => {
  const routes = routers.map((v: RouteConfig) => {
    return {
      path: v.path,
      element: v.component,
      auth: v.auth,
      children: [],
      icon: v.icon,
      redirect: v.redirect,
    };
  });
  console.log(routes);
  // 传入路由表可直接渲染(获取一级路由)
  const element = useRoutes(routes);

  return <div className="App">{element}</div>;
};

export default App;
