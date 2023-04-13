import * as types from '@/redux/mutation-types';
import { userInfo } from '@/api/modules/user';
import type { ProSettings } from '@ant-design/pro-components';
// * action数据的唯一来源

// * setToken
export const setToken = (token: string) => ({ type: types.SET_TOKEN, token });

// * setUserInfo
export const setUserInfo = async () => {
  const res = await userInfo();
  return { type: types.SET_USER_INFO, userInfo: res.data };
};

// * logout
export const logout = () => {
  return { type: types.LOGOUT };
};

// * setUserInfo
export const setSystemConfig = (systemConfig: ProSettings) => {
  return { type: types.SET_SYSTEM_CONFIG, systemConfig };
};
