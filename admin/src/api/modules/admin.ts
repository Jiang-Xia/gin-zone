import { get } from '../http';
import type { PageResult } from '../types';

// 管理端路由：admin/moments（后端当前为占位实现）
export function getAdminMomentList(params?: Record<string, unknown>) {
  return get<PageResult<Record<string, unknown>>>('/admin/moments', {
    params,
  });
}

