import { post } from '../http';

// 公共模块：获取服务端会话与工作密钥
export function signInApi() {
  return post<string>('/common/signIn');
}

