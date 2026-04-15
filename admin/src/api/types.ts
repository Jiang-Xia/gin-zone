// 分页查询公共参数：所有列表页按该结构透传给后端
export interface PageQuery {
  page?: number;
  pageSize?: number;
}

// 分页返回公共结构：统一 list + total，支持无 total 场景
export interface PageResult<T> {
  list: T[];
  total?: number;
}
