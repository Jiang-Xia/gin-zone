import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TOKEN_KEY } from '../constants/auth';

export interface ApiEnvelope<T> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY) ?? '';
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

const resolveMessage = (payload: ApiEnvelope<unknown>) => payload.msg || payload.message || '请求失败';

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

const unwrapResponse = <T>(response: AxiosResponse<ApiEnvelope<T>>) => response.data.data;

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
