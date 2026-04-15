import type { UserInfo } from '../store/auth';
import type { AppRouteMeta } from './types';

// 权限判断：统一管理员放行 + 角色命中逻辑
export function canAccessRoute(userInfo: UserInfo | null, meta?: AppRouteMeta) {
  const roles = meta?.roles;
  // 未配置角色限制时默认可访问
  if (!roles || roles.length === 0) {
    return true;
  }
  // 管理员默认放行
  if (userInfo?.isAdmin) {
    return true;
  }
  // 普通用户命中任意角色即可
  const roleList = Array.isArray(userInfo?.roles) ? userInfo.roles : [];
  return roles.some((role) => roleList.includes(role));
}
