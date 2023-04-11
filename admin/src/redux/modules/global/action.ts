import * as types from '@/redux/mutation-types';
import { userInfo } from '@/api/modules/user';
// * setToken
export const setToken = (token: string) => ({ type: types.SET_TOKEN, token });

// * setUserInfo
export const setUserInfo = async (info: string) => {
  const res = await userInfo();
  return { type: types.SET_USER_INFO, userInfo: res.data };
};
