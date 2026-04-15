import { useCallback, useEffect, useRef, useState } from 'react';

// 列表返回结构：统一 list + total，便于表格页复用
export interface ListPageResult<T> {
  list: T[];
  total?: number;
}

interface UseListPageOptions<TItem, TQuery extends Record<string, unknown>> {
  // 初始查询条件（如分页、关键字）
  initialQuery: TQuery;
  // 列表请求方法：返回统一结果结构
  request: (query: TQuery) => Promise<ListPageResult<TItem>>;
  // 是否在初始化时自动拉取一次
  immediate?: boolean;
}

export function useListPage<TItem, TQuery extends Record<string, unknown>>({
  initialQuery,
  request,
  immediate = true,
}: UseListPageOptions<TItem, TQuery>) {
  // 查询条件：由页面输入与分页变更驱动
  const [query, setQuery] = useState<TQuery>(initialQuery);
  // 列表数据
  const [list, setList] = useState<TItem[]>([]);
  // 总条数：后端不返回时兜底为 list.length
  const [total, setTotal] = useState(0);
  // loading 状态：统一控制表格加载态
  const [loading, setLoading] = useState(false);
  // 最新 query 引用：避免异步请求拿到旧条件
  const queryRef = useRef<TQuery>(initialQuery);
  // 最新 request 引用：避免 useEffect 因函数地址变化重复触发
  const requestRef = useRef(request);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  // 触发列表请求：支持传入局部条件进行合并更新
  const reload = useCallback(
    async (patch?: Partial<TQuery>) => {
      const nextQuery = patch ? ({ ...queryRef.current, ...patch } as TQuery) : queryRef.current;
      if (patch) {
        queryRef.current = nextQuery;
        setQuery(nextQuery);
      }
      setLoading(true);
      try {
        const response = await requestRef.current(nextQuery);
        const nextList = response?.list ?? [];
        setList(nextList);
        setTotal(response?.total ?? nextList.length);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 更新 query 时同步更新 ref，确保下一次请求使用最新条件
  const updateQuery = useCallback((updater: (prev: TQuery) => TQuery) => {
    setQuery((prev) => {
      const next = updater(prev);
      queryRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!immediate) {
      return;
    }
    void reload();
  }, [immediate, reload]);

  return {
    query,
    list,
    total,
    loading,
    setQuery: updateQuery,
    reload,
  };
}
