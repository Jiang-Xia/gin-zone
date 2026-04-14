import { del, get, patch, post } from '../http';
import type { UserInfo } from '../../store/auth';

interface LoginResult {
  token: string;
}

export interface UserListResult {
  list: UserInfo[];
  total: number;
}

export interface RegisterPayload {
  userName: string;
  password: string;
  nickName?: string;
  avatar?: string;
  intro?: string;
  email?: string;
  gender?: number;
}

export interface UpdateUserPayload {
  nickName?: string;
  avatar?: string;
  intro?: string;
  email?: string;
  gender?: number;
}

export interface ChangePasswordPayload {
  userName: string;
  password: string;
  newPassword: string;
}

export function loginApi(params: Record<string, unknown>) {
  return post<LoginResult>('/base/users/login', params);
}

export function getUserInfo() {
  return get<UserInfo>('/base/users/info');
}

export function registerUser(params: RegisterPayload) {
  return post<number>('/base/users', params);
}

export function getUserList(q = '') {
  return get<UserListResult>('/base/users', { params: { q } });
}

export function updateUser(id: number, params: UpdateUserPayload) {
  return patch<UserInfo>(`/base/users/${id}`, params);
}

export function deleteUser(id: number) {
  return del<boolean>(`/base/users/${id}`);
}

export function changePassword(params: ChangePasswordPayload) {
  return post<boolean>('/base/users/password', params);
}
