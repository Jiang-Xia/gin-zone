import appRoutes from './modules';

export type { AppRouteItem, AppRouteMeta } from './types';

export { appRoutes };

// 菜单路由：过滤掉不需要在菜单中展示的页面
export const menuRoutes = appRoutes.filter((route) => route.meta && !route.meta.hideInMenu);
