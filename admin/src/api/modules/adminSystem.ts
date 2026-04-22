import { del, get, patch, post } from '../http';
import type { PageResult } from '../types';

export interface AdminAuditLogRow {
  id: number;
  operatorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  beforeValue?: string;
  afterValue?: string;
  ip?: string;
  userAgent?: string;
  createdAt?: string;
}

export interface AdminAuditLogQuery {
  page?: number;
  pageSize?: number;
  operatorUserId?: string;
  action?: string;
  targetType?: string;
  startAt?: string;
  endAt?: string;
}

export interface SysConfigItem {
  id?: number;
  configKey: string;
  configValue: string;
  remark?: string;
}

export function getAdminAuditLogs(query: AdminAuditLogQuery) {
  return get<PageResult<AdminAuditLogRow>>('/admin/auditLogs', { params: query });
}

export function getSysConfigList() {
  return get<SysConfigItem[]>('/admin/sysConfig');
}

export function createSysConfig(payload: Pick<SysConfigItem, 'configKey' | 'configValue' | 'remark'>) {
  return post<boolean, typeof payload>('/admin/sysConfig', payload);
}

export function updateSysConfig(id: number, payload: Pick<SysConfigItem, 'configValue' | 'remark'>) {
  return patch<boolean, typeof payload>(`/admin/sysConfig/${id}`, payload);
}

export function deleteSysConfig(id: number) {
  return del<boolean>(`/admin/sysConfig/${id}`);
}
