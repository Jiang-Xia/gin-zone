import { get, post } from '../http';
import type { PageQuery, PageResult } from '../types';

// 动态条目（列表页展示使用）
export interface MomentItem {
  id: number;
  content: string;
  urls: string;
  location: string;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  userInfo: {
    nickName: string;
    avatar: string;
  };
}

// 动态列表查询参数：分页 + 内容关键字
export interface MomentListQuery extends PageQuery {
  content?: string;
}

// 发布动态参数
export interface AddMomentPayload {
  content: string;
  urls: string;
  userId: string;
  location: string;
}

// 动态列表查询：分页/关键字等都放在 params 中
export function getMomentList(params: MomentListQuery) {
  return get<PageResult<MomentItem>>('/mobile/moments', { params });
}

// 发布动态
export function addMoment(params: AddMomentPayload) {
  return post<AddMomentPayload>('/mobile/moments', params);
}

// 更新动态统计：点赞/浏览量（示例接口，后端使用 t=like/view 区分）
export function updateMoment(id: number, type: 'like' | 'view') {
  return get<boolean>('/mobile/moments/UpdateMoment', {
    params: { id, t: type },
  });
}
