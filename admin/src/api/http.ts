import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { sm2, sm4 } from 'sm-crypto';
import { TOKEN_KEY } from '../constants/auth';

// 统一接口返回结构：后端约定 code=0 为成功，data 为实际业务数据
export interface ApiEnvelope<T> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
  encrypt?: string;
}

// axios 实例：统一设置 baseURL/超时/cookie 等
const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

const rawHttp = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

// 服务端约定：加密会话失效状态码
const CRYPTO_SESSION_EXPIRE_CODE = 20108;
// 会话初始化接口路径
const SIGN_IN_PATH = '/common/signIn';
// 仅这些 HTTP 方法需要加密请求体
const CRYPTO_BODY_METHODS = ['POST', 'PUT', 'PATCH'];
// 本地存储中的加密会话键名
const SESSION_ID_KEY = 'zoneSessionId';
const WORK_KEY_KEY = 'zoneWorkKey';
// 单次自动重试标记，防止重放死循环
const CRYPTO_RETRIED_FLAG = '__cryptoRetried';
// 缓存原始请求体，重试时可重复加密
const CRYPTO_RAW_DATA_FLAG = '__rawData';
// workKey 缺失时使用的 SM4 兜底密钥（兼容联调）
const FALLBACK_SM4_KEY =
  (import.meta.env.VITE_CRYPTO_SM4_KEY as string | undefined) ||
  '0123456789abcdeffedcba9876543210';
// signIn 返回报文解密所需私钥
const PRIVATE_KEY =
  (import.meta.env.VITE_CRYPTO_PRIVATE_KEY as string | undefined) ||
  '6e5779ba88066b86012bc54331caf9ca8b685b00da94b1b660ac8b2508d0614d';

// 扩展 axios 配置：记录重试标记与原始请求数据
type CryptoRequestConfig = InternalAxiosRequestConfig & {
  allowReplayOnSessionExpired?: boolean;
  [CRYPTO_RETRIED_FLAG]?: boolean;
  [CRYPTO_RAW_DATA_FLAG]?: unknown;
};

// 并发 signIn 复用同一 Promise，避免重复签到
let signInInFlight: Promise<void> | null = null;

// 加密总开关：环境变量 + 本地开关都允许才启用
const isCryptoEnabled = () => {
  const fromEnv = (import.meta.env.VITE_OPEN_CRYPTO as string | undefined) !== '0';
  const fromStorage = localStorage.getItem('zoneOpenCrypto') !== '0';
  return fromEnv && fromStorage;
};

// 统一把绝对 URL 归一为 path，便于做路由匹配
const resolvePath = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url;
};

// 判断是否为 signIn 请求（自身不走加密包装）
const isSignInRequest = (url?: string) => resolvePath(url).includes(SIGN_IN_PATH);
// 读取当前加密会话 sessionId
const getSessionId = () => localStorage.getItem(SESSION_ID_KEY) ?? '';
// 读取当前加密会话 workKey
const getWorkKey = () => localStorage.getItem(WORK_KEY_KEY) ?? '';
// 清空加密会话（解密失败/会话过期后触发）
const clearCryptoSession = () => {
  localStorage.removeItem(SESSION_ID_KEY);
  localStorage.removeItem(WORK_KEY_KEY);
};

// 保存服务端下发的 sessionId + workKey
const setCryptoSession = (sessionId: string, workKey: string) => {
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  localStorage.setItem(WORK_KEY_KEY, workKey);
};

// 识别后端返回是否表示“加密会话已失效”
const isCryptoSessionExpiredBody = (payload?: ApiEnvelope<unknown>) => {
  if (!payload) return false;
  if (Number(payload.code) === CRYPTO_SESSION_EXPIRE_CODE) return true;
  if (typeof payload.data === 'object' && payload.data !== null) {
    return (payload.data as { cryptoSessionExpired?: boolean }).cryptoSessionExpired === true;
  }
  return false;
};

// 默认仅重放幂等请求；写请求需显式开启重放
const shouldAutoReplay = (config: CryptoRequestConfig) => {
  if (config.allowReplayOnSessionExpired === true) return true;
  const method = String(config.method || 'GET').toUpperCase();
  return ['GET', 'HEAD', 'OPTIONS'].includes(method);
};

// 确保本地已具备可用加密会话；缺失时自动 signIn
const ensureCryptoSession = async () => {
  if (!isCryptoEnabled()) return;
  if (getSessionId() && getWorkKey()) return;
  if (signInInFlight) return signInInFlight;

  signInInFlight = rawHttp
    .post<ApiEnvelope<string>>(SIGN_IN_PATH, { sence: 'blog' })
    .then((response) => {
      const payload = response.data;
      if (typeof payload?.data !== 'string') {
        throw new Error('加密会话初始化失败');
      }
      const decrypted = sm2.doDecrypt(payload.data.slice(2), PRIVATE_KEY, 1);
      const result = JSON.parse(decrypted) as { sessionId?: string; workKey?: string };
      if (!result.sessionId || !result.workKey) {
        throw new Error('加密会话初始化失败');
      }
      setCryptoSession(result.sessionId, result.workKey);
    })
    .catch((error: unknown) => {
      clearCryptoSession();
      throw error;
    })
    .finally(() => {
      signInInFlight = null;
    });

  return signInInFlight;
};

http.interceptors.request.use(async (rawConfig) => {
  const config = rawConfig as CryptoRequestConfig;
  // 从本地缓存读取 token，并写入 Authorization 头（与后端约定）
  const token = localStorage.getItem(TOKEN_KEY) ?? '';
  if (token) {
    config.headers.Authorization = token;
  }

  const isSignIn = isSignInRequest(config.url);
  if (!isCryptoEnabled() || isSignIn) {
    return config;
  }

  // 普通接口发送前，先确保会话可用
  await ensureCryptoSession();
  const sessionId = getSessionId();
  if (sessionId) {
    // 服务端约定的加密会话请求头
    config.headers['Jx-Security'] = 'Jx-Security';
    config.headers['Jx-SessionId'] = sessionId;
  }

  const method = String(config.method || 'GET').toUpperCase();
  // 缓存初始 body，重试时复用原文重新加密
  const rawData = config[CRYPTO_RAW_DATA_FLAG] ?? config.data;
  config[CRYPTO_RAW_DATA_FLAG] = rawData;
  if (!CRYPTO_BODY_METHODS.includes(method) || rawData === undefined) {
    return config;
  }

  // 将业务请求体加密为统一 content 结构
  const plaintext = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
  config.data = { content: sm4.encrypt(plaintext, getWorkKey() || FALLBACK_SM4_KEY) };
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
  async (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const payload = response.data;
    const config = response.config as CryptoRequestConfig;
    // 命中 encrypt 字段时解密响应体
    if (isCryptoEnabled() && !isSignInRequest(config.url) && payload?.encrypt) {
      try {
        const decrypted = sm4.decrypt(payload.encrypt, getWorkKey() || FALLBACK_SM4_KEY);
        payload.data = JSON.parse(decrypted);
      } catch {
        clearCryptoSession();
        throw new Error('报文解密失败，请重试');
      }
    }
    // 防御：后端返回结构不符合预期时，直接抛错
    if (typeof payload?.code !== 'number') {
      throw new Error('服务返回格式不正确');
    }
    if (
      isCryptoEnabled() &&
      isCryptoSessionExpiredBody(payload) &&
      !config[CRYPTO_RETRIED_FLAG] &&
      shouldAutoReplay(config)
    ) {
      // 会话过期：清理并重签，再自动重放一次请求
      clearCryptoSession();
      await ensureCryptoSession();
      const retryConfig: CryptoRequestConfig = {
        ...config,
        [CRYPTO_RETRIED_FLAG]: true,
      };
      return http.request(retryConfig);
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
