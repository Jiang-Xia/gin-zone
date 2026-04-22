import { del, get, patch, post } from '../http';
import type { PageResult } from '../types';

export interface SensitiveWordRow {
  id: number;
  word: string;
  status: number;
  level: number;
  remark?: string;
  createdAt?: string;
}

export interface SensitiveWordQuery {
  page?: number;
  pageSize?: number;
  word?: string;
  status?: number;
  level?: number;
}

export interface SensitiveHitRow {
  id: number;
  word: string;
  messageId: number;
  senderId: string;
  groupId: number;
  content: string;
  createdAt?: string;
}

export interface SensitiveHitQuery {
  page?: number;
  pageSize?: number;
  word?: string;
  senderId?: string;
  groupId?: number;
}

export function getSensitiveWords(query: SensitiveWordQuery) {
  return get<PageResult<SensitiveWordRow>>('/admin/sensitiveWords', { params: query });
}

export function createSensitiveWord(payload: Pick<SensitiveWordRow, 'word' | 'status' | 'level' | 'remark'>) {
  return post<boolean, typeof payload>('/admin/sensitiveWords', payload);
}

export function updateSensitiveWord(id: number, payload: Partial<Pick<SensitiveWordRow, 'word' | 'status' | 'level' | 'remark'>>) {
  return patch<boolean, typeof payload>(`/admin/sensitiveWords/${id}`, payload);
}

export function deleteSensitiveWord(id: number) {
  return del<boolean>(`/admin/sensitiveWords/${id}`);
}

export function getSensitiveHits(query: SensitiveHitQuery) {
  return get<PageResult<SensitiveHitRow>>('/admin/sensitiveWords/hits', { params: query });
}
