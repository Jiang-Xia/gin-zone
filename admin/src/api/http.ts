import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TOKEN_KEY } from '../constants/auth';

// 统一接口返回结构：后端约定 code=0 为成功，data 为实际业务数据
export interface ApiEnvelope<T> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}

// axios 实例：统一设置 baseURL/超时/cookie 等
const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  // 从本地缓存读取 token，并写入 Authorization 头（与后端约定）
  const token = localStorage.getItem(TOKEN_KEY) ?? '';
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// 兼容不同后端字段命名（msg/message）
const resolveMessage = (payload: ApiEnvelope<unknown>) => payload.msg || payload.message || '请求失败';

// 将 AxiosError 统一归一化为可展示的 Error（便于页面直接弹 toast）
const normalizeError = (error: AxiosError<ApiEnvelope<unknown>>) => {
  const payload = error.response?.data;
  if (payload?.msg || payload?.message) {
    return new Error(resolveMessage(payload));
  }
  if (error.code === 'ECONNABORTED') {
    return new Error('请求超时，请稍后再试');
  }
  return new Error('网络异常，请稍后重试');
};

http.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const payload = response.data;
    // 防御：后端返回结构不符合预期时，直接抛错
    if (typeof payload?.code !== 'number') {
      throw new Error('服务返回格式不正确');
    }
    if (payload.code !== 0) {
      throw new Error(resolveMessage(payload));
    }
    return response;
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => Promise.reject(normalizeError(error)),
);

// 将 ApiEnvelope 解包，页面侧只拿到 data
const unwrapResponse = <T>(response: AxiosResponse<ApiEnvelope<T>>) => response.data.data;

// 业务侧调用的请求方法封装：统一返回 data，避免重复写 response.data.data
export async function get<T = unknown>(url: string, config?: AxiosRequestConfig) {
  const response = await http.get<ApiEnvelope<T>>(url, config);
  return unwrapResponse(response);
}

export async function post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
  const response = await http.post<ApiEnvelope<T>>(url, data, config);
  return unwrapResponse(response);
}

export async function patch<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) {
  const response = await http.patch<ApiEnvelope<T>>(url, data, config);
  return unwrapResponse(response);
}

export async function del<T = unknown>(url: string, config?: AxiosRequestConfig) {
  const response = await http.delete<ApiEnvelope<T>>(url, config);
  return unwrapResponse(response);
}

export default http;
