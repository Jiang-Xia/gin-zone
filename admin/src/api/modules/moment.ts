import { get, post } from '../http';

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

export interface MomentListResult {
  list: MomentItem[];
  total?: number;
}

export interface AddMomentPayload {
  content: string;
  urls: string;
  userId: string;
  location: string;
}

export function getMomentList(params: Record<string, unknown>) {
  return get<MomentListResult>('/mobile/moments', { params });
}

export function addMoment(params: AddMomentPayload) {
  return post<AddMomentPayload>('/mobile/moments', params);
}

export function updateMoment(id: number, type: 'like' | 'view') {
  return get<boolean>('/mobile/moments/UpdateMoment', {
    params: { id, t: type },
  });
}
