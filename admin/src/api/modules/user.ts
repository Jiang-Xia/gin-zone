import http from '@/api';
import axios, { AxiosResponse } from 'axios';
const publicPath = process.env.REACT_APP_PUBLIC_PATH;
/**
 * @name 用户模块
 */
// * 用户登录接口
export const loginApi = (params: any) => {
  return http.post<any>(`/base/users/login`, params);
};
// * 用户信息
export const userInfo = () => {
  return http.get<any>(`/base/users/info`);
};

// * 获取菜单列表
export const getMenuList = () => {
  return axios.get<any[]>(`${publicPath}/menu.json`).then((res: AxiosResponse) => res.data);
};
