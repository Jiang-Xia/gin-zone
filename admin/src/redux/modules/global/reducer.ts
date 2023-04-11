import { AnyAction } from '@reduxjs/toolkit';
import { GlobalState } from '@/redux/interface';
import * as types from '@/redux/mutation-types';
import { createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';
const globalState: GlobalState = {
  token: '',
  userInfo: '',
};

// global reducer 内部已经使用了immer不用手动使用
const global = (state: GlobalState = globalState, action: AnyAction) => {
  // console.log(action);
  switch (action.type) {
    case types.SET_TOKEN:
      state.token = action.token;
      break;
    case types.SET_USER_INFO:
      state.userInfo = action.userInfo;
      break;
    default:
      return state;
  }
  // 必须返回state
  return state;
};

export default global;
