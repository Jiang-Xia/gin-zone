import dashboardRoutes from './dashboard';
import momentRoutes from './moment';
import profileRoutes from './profile';
import userRoutes from './user';
import apiExplorerRoutes from './apiExplorer';
import chatRoutes from './chat';
import blogRoutes from './blog';
import systemRoutes from './system';
import type { AppRouteItem } from '../types';

// 递归合并同 path 路由节点，支持跨模块扩展同一父级菜单
function mergeRouteTrees(routes: AppRouteItem[]) {
  const routeMap = new Map<string, AppRouteItem>();
  routes.forEach((route) => {
    const existed = routeMap.get(route.path);
    if (!existed) {
      routeMap.set(route.path, {
        ...route,
        children: route.children ? mergeRouteTrees(route.children) : undefined,
      });
      return;
    }
    routeMap.set(route.path, {
      ...existed,
      // 后声明路由可以补充 element/requiresAuth/meta
      element: route.element ?? existed.element,
      requiresAuth: route.requiresAuth ?? existed.requiresAuth,
      meta: route.meta ? (existed.meta ? { ...existed.meta, ...route.meta } : route.meta) : existed.meta,
      children: mergeRouteTrees([...(existed.children ?? []), ...(route.children ?? [])]),
    });
  });
  return Array.from(routeMap.values());
}

// 路由聚合：按模块组织，便于按业务扩展
const appRoutes: AppRouteItem[] = [
  ...dashboardRoutes,
  ...momentRoutes,
  ...userRoutes,
  ...profileRoutes,
  ...apiExplorerRoutes,
  ...chatRoutes,
  ...systemRoutes,
  ...blogRoutes,
];

export default mergeRouteTrees(appRoutes);
