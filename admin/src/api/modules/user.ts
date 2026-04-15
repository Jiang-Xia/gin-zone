import { get, post } from '../http';
import type { UserInfo } from '../../store/auth';
import { createCrudApi } from '../createCrudApi';
import type { PageResult } from '../types';

// 登录接口返回：token
interface LoginResult {
  token: string;
}

// 用户列表查询参数：当前仅支持关键字，后续可扩展分页字段
export interface UserListQuery extends Record<string, unknown> {
  q?: string;
}

// 注册用户参数（可选字段根据后端实际支持）
export interface RegisterPayload {
  userName: string;
  password: string;
  nickName?: string;
  avatar?: string;
  intro?: string;
  email?: string;
  gender?: number;
}

// 更新用户资料参数
export interface UpdateUserPayload {
  nickName?: string;
  avatar?: string;
  intro?: string;
  email?: string;
  gender?: number;
}

// 修改密码参数
export interface ChangePasswordPayload {
  userName: string;
  password: string;
  newPassword: string;
}

// 用户资源 CRUD 能力：统一复用新增/更新/删除/列表接口定义
const userCrudApi = createCrudApi<UserInfo, RegisterPayload, UpdateUserPayload>('/base/users');

// 登录：支持多种 payload（账号/手机号等），由页面决定传参结构
export function loginApi(params: Record<string, unknown>) {
  return post<LoginResult>('/base/users/login', params);
}

// 获取当前登录用户信息
export function getUserInfo() {
  return get<UserInfo>('/base/users/info');
}

// 新增用户（后台管理）
export function registerUser(params: RegisterPayload) {
  return userCrudApi.create(params);
}

// 用户列表（支持关键字查询 q）
export function getUserList(q = '') {
  return userCrudApi.list<UserListQuery>({ q }) as Promise<PageResult<UserInfo>>;
}

// 更新用户资料
export function updateUser(id: number, params: UpdateUserPayload) {
  return userCrudApi.update(id, params);
}

// 删除用户
export function deleteUser(id: number) {
  return userCrudApi.remove(id);
}

// 修改密码
export function changePassword(params: ChangePasswordPayload) {
  return post<boolean>('/base/users/password', params);
}
