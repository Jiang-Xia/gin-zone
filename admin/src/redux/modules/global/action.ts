import * as types from '@/redux/mutation-types';
import { userInfo } from '@/api/modules/user';

// * action数据的唯一来源

// * setToken
export const setToken = (token: string) => ({ type: types.SET_TOKEN, token });

// * setUserInfo
export const setUserInfo = async () => {
  const res = await userInfo();
  return { type: types.SET_USER_INFO, userInfo: res.data };
};

// * logout
export const logout = async (info: string) => {
  return { type: types.LOGOUT };
};
