import type { ReactElement, ReactNode } from 'react';

// 路由元信息：用于菜单、面包屑、权限等统一配置
export interface AppRouteMeta {
  title: string;
  icon?: ReactElement;
  hideInMenu?: boolean;
  // 访问该路由需要的角色列表（满足其一即可；管理员默认放行）
  roles?: string[];
  // 面包屑文案（不传时默认使用“控制台 + 标题”）
  breadcrumbs?: string[];
}

// 路由配置项：驱动 react-router 渲染与菜单生成
export interface AppRouteItem {
  path: string;
  element?: ReactNode;
  // 是否需要登录才能访问
  requiresAuth?: boolean;
  meta?: AppRouteMeta;
  // 子路由：用于构建树形菜单与层级路由
  children?: AppRouteItem[];
}
