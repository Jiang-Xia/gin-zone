import { get, post } from '../http';

export function getBlogArticleInfo(params: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/article/info', { params });
}

export function getBlogTag(params?: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/tag', { params });
}

export function getBlogCategory(params?: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/category', { params });
}

export function getBlogCommentAll(params?: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/comment/findAll', { params });
}

export function getBlogArticleViews(params?: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/article/views', { params });
}

export function getBlogDailyImage(params?: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/resources/daily-img', { params });
}

export function postBlogArticleList(payload: Record<string, unknown>) {
  return post<Record<string, unknown>, Record<string, unknown>>('/blog/article/list', payload);
}

export function postTradeCreate(payload: Record<string, unknown>) {
  return post<Record<string, unknown>, Record<string, unknown>>('/blog/pay/trade/create', payload);
}

export function getTradeQuery(params: Record<string, unknown>) {
  return get<Record<string, unknown>>('/blog/pay/trade/query', { params });
}

export function postTradeRefund(payload: Record<string, unknown>) {
  return post<Record<string, unknown>, Record<string, unknown>>('/blog/pay/trade/refund', payload);
}

export function postTradeClose(payload: Record<string, unknown>) {
  return post<Record<string, unknown>, Record<string, unknown>>('/blog/pay/trade/close', payload);
}

export function postPayOpenid(payload: Record<string, unknown>) {
  return post<Record<string, unknown>, Record<string, unknown>>('/blog/pay/openid', payload);
}

export function postPayH5OpenMini(payload: Record<string, unknown>) {
  return post<Record<string, unknown>, Record<string, unknown>>('/blog/pay/h5-open-mini', payload);
}

