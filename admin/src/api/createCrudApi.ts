import { del, get, patch, post } from './http';
import type { PageResult } from './types';

// CRUD 工厂：统一生成列表/详情/新增/更新/删除方法
export function createCrudApi<TEntity, TCreatePayload = Partial<TEntity>, TUpdatePayload = Partial<TEntity>>(
  basePath: string,
) {
  return {
    // 获取列表：适配常见 list + total 结构
    list: <TQuery extends Record<string, unknown>>(params?: TQuery) =>
      get<PageResult<TEntity>>(basePath, {
        params,
      }),
    // 获取详情：按 id 查询单条记录
    detail: (id: number | string) => get<TEntity>(`${basePath}/${id}`),
    // 新增记录
    create: (payload: TCreatePayload) => post<TEntity | number>(basePath, payload),
    // 更新记录
    update: (id: number | string, payload: TUpdatePayload) => patch<TEntity>(`${basePath}/${id}`, payload),
    // 删除记录
    remove: (id: number | string) => del<boolean>(`${basePath}/${id}`),
  };
}
