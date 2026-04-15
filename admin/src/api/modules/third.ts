import { get, post } from '../http';

export interface ChatGptPayload {
  prompt: string;
}

export interface ChatGptApiPayload {
  id?: string;
  message: string;
  key?: string;
}

// 第三方接口：今日古诗词
export function getGuShiCi(refresh = false) {
  return get<Record<string, unknown>>('/third/gushici', {
    params: refresh ? { refresh: '1' } : undefined,
  });
}

// 第三方接口：ChatGPT
export function chatGpt(payload: ChatGptPayload) {
  return post<Record<string, unknown>, ChatGptPayload>('/third/chatGPT', payload);
}

// 第三方接口：ChatGPTApi
export function chatGptApi(payload: ChatGptApiPayload) {
  return post<Record<string, unknown>, ChatGptApiPayload>('/third/chatGPTApi', payload);
}

