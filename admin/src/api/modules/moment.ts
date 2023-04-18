import http from '@/api';
import axios, { AxiosResponse } from 'axios';
/**
 * @name 动态模块
 */
// * 动态列表
export const momentList = (params: any) => {
  return http.get<any>(`/mobile/moments`, params);
};
