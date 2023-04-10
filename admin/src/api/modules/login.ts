import http from '@/api';
/**
 * @name 登录模块
 */
// * 用户登录接口
export const loginApi = (params: any) => {
  return http.post(`/login`, params);
};

// * 获取菜单列表
export const getMenuList = () => {
  return http.get<any[]>(`/menu.json`);
};
