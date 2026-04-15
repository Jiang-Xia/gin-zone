import dashboardRoutes from './dashboard';
import momentRoutes from './moment';
import profileRoutes from './profile';
import userRoutes from './user';
import type { AppRouteItem } from '../types';

// 路由聚合：按模块组织，便于按业务扩展
const appRoutes: AppRouteItem[] = [...dashboardRoutes, ...momentRoutes, ...userRoutes, ...profileRoutes];

export default appRoutes;
