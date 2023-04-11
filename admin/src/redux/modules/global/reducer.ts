import { AnyAction } from '@reduxjs/toolkit';
import { GlobalState } from '@/redux/interface';
import * as types from '@/redux/mutation-types';
const globalState: GlobalState = {
  token: '',
  userInfo: {},
};
/**
 * @description:  global reducer 内部已经使用了immer不用手动使用
 * 不能修改旧state，必须先拷贝一份state，再进行修改，也可以使用Object.assign函数生成新的state
 * 永远不要在 reducer 里做这些操作：修改传入参数；执行有副作用的操作，
 * 如 API 请求和路由跳转；调用非纯函数，如 Date.now() 或 Math.random()；
 * @param {GlobalState} state
 * @param {AnyAction} action
 * @return {GlobalState}
 */
const global = (state: GlobalState = globalState, action: AnyAction) => {
  // console.log(action);
  switch (action.type) {
    case types.SET_TOKEN:
      return {
        ...state,
        token: action.token,
      };
    case types.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case types.LOGOUT:
      return {
        ...state,
        token: '',
        userInfo: {},
      };
    default:
      // 必须返回state
      return state;
  }
};

export default global;
