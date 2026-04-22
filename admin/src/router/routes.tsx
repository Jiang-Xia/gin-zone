import appRoutes from './modules';
import type { AppRouteItem } from './types';

export type { AppRouteItem, AppRouteMeta } from './types';

export { appRoutes };

// 展平路由树：用于路由匹配、面包屑等基于 path 的查询
function flattenRoutes(routes: AppRouteItem[]): AppRouteItem[] {
  return routes.flatMap((route) => [route, ...(route.children ? flattenRoutes(route.children) : [])]);
}

// 展平后的路由列表：包含父子节点
export const flatRoutes = flattenRoutes(appRoutes);

// 根据 path 查找路由链路（父 -> 子），用于动态生成面包屑
export function getRouteChainByPath(pathname: string) {
  const findChain = (routes: AppRouteItem[], chain: AppRouteItem[]): AppRouteItem[] | null => {
    for (const route of routes) {
      const nextChain = [...chain, route];
      if (route.path === pathname) {
        return nextChain;
      }
      if (route.children?.length) {
        const childChain = findChain(route.children, nextChain);
        if (childChain) {
          return childChain;
        }
      }
    }
    return null;
  };
  return findChain(appRoutes, []) ?? [];
}
