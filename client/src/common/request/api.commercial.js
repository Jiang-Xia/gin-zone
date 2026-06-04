import { sm2, sm4 } from 'sm-crypto'

import {
  baseUrl,
  isCryptoEnabled,
  privateKey,
  sm4Key,
  enableRequestCryptoDebugLog,
} from './config.js'
import {
  clearCryptoSession,
  getSessionId,
  getWorkKey,
} from './session.js'
import {
  beginGlobalLoading,
  endGlobalLoading,
} from './loading.js'
import { toast as uiToast } from '../utils/ui.js'
import { useUserStore } from '@/stores/user.js'
import { useChatStore } from '@/stores/chat.js'

// token 失效触发登录跳转时避免并发重复跳转
let _logoutInProgress = false

function showToastAfterLoading(options) {
  const toastOptions =
    typeof options === 'string' ? { title: options, icon: 'none' } : options || {}
  // 避免 loading mask 关闭前 toast 被遮挡
  setTimeout(() => {
    uiToast(toastOptions)
  }, 0)
}

// 会话失效专用错误名：用于触发自动重签并重试
const ERR_CRYPTO_SESSION_EXPIRED = 'ERR_CRYPTO_SESSION_EXPIRED'
// 配置上的一次重试标记，避免死循环
const CRYPTO_RETRIED_FLAG = '__cryptoRetried'
// 仅这些方法会对请求体做加密
const CRYPTO_BODY_METHODS = ['POST', 'PUT', 'PATCH']
// 后端约定成功码
const SUCCESS_CODES = [0, 200]
// 后端约定：加密会话失效（server/pkg/tip/code.go）
const CRYPTO_SESSION_EXPIRE_CODE = 20108

// 日志打印时对 Authorization 做脱敏，避免把完整 token 打到控制台
export class CommercialApi {
  /** @type {Promise<void> | null} 并发 signIn 复用同一请求 */
  _signInInFlight = null

  // 是否开启加解密：默认开启；本地存储 zoneOpenCrypto='0' 关闭（兼容旧版 openCrypto）
  shouldOpenCrypto() {
    return isCryptoEnabled()
  }

  // 获取鉴权 token（zoneToken）
  getToken() {
    const userStore = useUserStore()
    return userStore.token || ''
  }

  // ---------------------------
  // URL & crypto strategy
  // ---------------------------
  isSignInUrl(url) {
    return typeof url === 'string' && url.includes('/common/signIn')
  }

  isAbsoluteUrl(url) {
    return typeof url === 'string' && url.indexOf('http') === 0
  }

  /**
   * 与 restful 一致：仅相对路径走 baseUrl + 加密时，才需要先 signIn。
   * 自定义 config.baseUrl、绝对 URL、以及 /common/signIn 本身不经过此处。
   */
  needsCryptoSession(url, config = {}) {
    if (!this.shouldOpenCrypto()) return false
    if (this.isSignInUrl(url)) return false
    if (config.baseUrl) return false
    if (this.isAbsoluteUrl(url)) return false
    return true
  }

  /**
   * 加密链路：本类所有对外发网方法（get/post/…/request/upload）均先 await 此处，
   * 再组包发请求。例外：`/common/signIn` 自身、`needsCryptoSession` 为 false 的路径不触发签到。
   */
  ensureCryptoSessionIfNeeded(url, config = {}) {
    if (!this.needsCryptoSession(url, config)) return Promise.resolve()
    return this.signIn()
  }

  // 结构化判定：后端返回明确 code/data 标识会话失效
  isCryptoSessionExpiredBody(body) {
    if (!body) return false
    const code = Number(body?.code)
    const flag = body?.data?.cryptoSessionExpired === true
    return code === CRYPTO_SESSION_EXPIRE_CODE || flag
  }

  // 创建“会话失效”错误对象，统一错误结构
  buildSessionExpiredError(extra = {}) {
    return {
      name: ERR_CRYPTO_SESSION_EXPIRED,
      ...extra,
    }
  }

  // 判定某个错误是否为“会话失效”
  isSessionExpiredError(err) {
    return err?.name === ERR_CRYPTO_SESSION_EXPIRED
  }

  // 默认仅对幂等请求自动重放；写请求需显式允许以避免重复副作用
  shouldAutoReplayOnSessionExpired(config = {}) {
    if (config?.allowReplayOnSessionExpired === true) return true
    const method = String(config?.method || 'GET').toUpperCase()
    return ['GET', 'HEAD', 'OPTIONS'].includes(method)
  }

  // 执行 task；若会话失效则 clear + signIn 后仅重试一次
  async withOneRetryOnSessionExpired(task, { url, config, retry } = {}) {
    try {
      return await task()
    } catch (err) {
      if (enableRequestCryptoDebugLog) {
        console.log('[crypto-retry] task failed:', {
          url,
          errorName: err?.name,
          alreadyRetried: !!config?.[CRYPTO_RETRIED_FLAG],
        })
      }
      const canRetry =
        this.needsCryptoSession(url, config) &&
        !config?.[CRYPTO_RETRIED_FLAG] &&
        this.shouldAutoReplayOnSessionExpired(config) &&
        this.isSessionExpiredError(err)
      if (!canRetry) throw err
      if (enableRequestCryptoDebugLog) {
        console.log('[crypto-retry] session expired, re-signing...', { url })
      }
      clearCryptoSession()
      await this.signIn()
      if (enableRequestCryptoDebugLog) {
        console.log('[crypto-retry] re-sign success, retrying request once', { url })
      }
      return retry({
        ...config,
        [CRYPTO_RETRIED_FLAG]: true,
      })
    }
  }

  // 统一归一化 payload：空对象或非法对象转 undefined
  normalizePayload(data) {
    // GET/DELETE 空对象统一转 undefined，避免后端把 {} 识别为有参请求
    if (!data || typeof data !== 'object') return undefined
    return Object.keys(data).length ? data : undefined
  }

  // 统一 URL 解析：优先 custom baseUrl，其次绝对地址，最后拼接默认 baseUrl
  resolveUrl(url, config = {}) {
    if (config.baseUrl) return config.baseUrl + url
    if (this.isAbsoluteUrl(url)) return url
    return baseUrl + url
  }

  // 给请求头并入 Authorization 默认值
  mergeDefaultHeader(config = {}) {
    const defaultHeaderConfig = {
      // 后端通用鉴权头
      Authorization: this.getToken(),
    }
    return {
      ...config,
      header: {
        ...(config.header || {}),
        ...defaultHeaderConfig,
      },
    }
  }

  // 在可加密场景下把业务 payload 转成 { content }
  encryptPayloadIfNeeded(url, payload, config = {}) {
    const method = config.method
    const canEncryptBody =
      CRYPTO_BODY_METHODS.includes(method) &&
      payload !== undefined &&
      this.shouldOpenCrypto() &&
      !this.isSignInUrl(url)
    if (!canEncryptBody) return payload

    const shouldLogCryptoRequest = enableRequestCryptoDebugLog
    if (shouldLogCryptoRequest) {
      console.log('[crypto] request(encrypted):', url, payload)
    }

    let content = ''
    try {
      content = JSON.stringify(payload)
    } catch (e) {
      content = String(payload)
    }
    // workKey 来自 signIn 初始化的 zoneWorkKey；为空则回退 sm4Key（联调兜底）
    const workKey = getWorkKey() || sm4Key
    content = sm4.encrypt(content, workKey)
    return { content }
  }

  // 在可加密场景下附加会话头（Jx-Security/Jx-SessionId）
  attachCryptoHeadersIfNeeded(url, config = {}) {
    const shouldAttach =
      this.shouldOpenCrypto() && !this.isSignInUrl(url)
    if (!shouldAttach) return config

    const sessionId = getSessionId()
    if (!sessionId) return config

    return {
      ...config,
      header: {
        ...(config.header || {}),
        'Jx-Security': 'Jx-Security',
        'Jx-SessionId': sessionId,
      },
    }
  }

  // 构建请求配置：含 REST 参数替换、URL/header 处理、可选加密
  buildRequestConfig(url, data = {}, config = {}) {
    // payload：请求 body（GET/DELETE 空对象转 undefined；避免后端异常）
    let payload = this.normalizePayload(data)

    const routeParams = payload || {}
    for (let key in routeParams) {
      if (url.indexOf(`{${key}}`) !== -1) {
        url = url.replace(`{${key}}`, `${routeParams[key]}`)
      }
    }

    // 统一拼接 URL（baseUrl/customBaseUrl/absoluteUrl）
    url = this.resolveUrl(url, config)
    // crypto 模式下：非 signIn 自动补会话头 + 请求体加密
    config = this.attachCryptoHeadersIfNeeded(url, config)
    payload = this.encryptPayloadIfNeeded(url, payload, config)
    // 最后统一并入默认鉴权头
    config = this.mergeDefaultHeader(config)

    return {
      data: payload,
      url,
      config,
    }
  }

  // 兼容旧调用命名，逐步迁移到 buildRequestConfig
  restful(url, data = {}, config = {}) {
    return this.buildRequestConfig(url, data, config)
  }

  // ---------------------------
  // Response handling
  // ---------------------------
  shouldDebugCryptoResponse(url, body) {
    return (
      enableRequestCryptoDebugLog &&
      this.shouldOpenCrypto() &&
      body &&
      !this.isSignInUrl(url)
    )
  }

  // 尝试解密响应体（仅 crypto 且返回 encrypt 时）
  tryDecryptResponse(body, url) {
    if (!(this.shouldOpenCrypto() && body && !this.isSignInUrl(url))) return
    if (!body.encrypt) return
    const workKey = getWorkKey() || sm4Key
    const decrypted = sm4.decrypt(body.encrypt, workKey)
    body.data = JSON.parse(decrypted)
  }

  // 判断后端返回码是否成功
  isSuccessCode(code) {
    return SUCCESS_CODES.includes(code)
  }

  // 请求响应完成：处理响应 code / 解密 / 错误提示
  handleResponse(res, resolve, reject, url) {
    // res.data 即后端响应体；旧版返回成功/失败字段约定为 code/msg/encrypt/data
    const body = res?.data
    const code = body && body.code
    // 仅在：加密开启 + 有响应体 + 非 signIn 时，才打印调试日志
    const shouldDebugCrypto = this.shouldDebugCryptoResponse(url, body)

    try {
      this.tryDecryptResponse(body, url)
      if (shouldDebugCrypto && body?.encrypt) {
        // 解密后的业务数据（data）
        console.log('[crypto] response(decrypted):', url, body.data)
      }
    } catch (error) {
      console.error('解密报文失败', error)
      // 多半是 workKey/session 与后端不一致或已过期；交由请求层自动 signIn 后重试一次
      reject(this.buildSessionExpiredError({ error }))
      return
    }

    if (this.isSuccessCode(code)) {
      // code 命中成功：resolve body（与旧版行为保持一致）
      resolve(body)
      return
    }

    if (!body) {
      reject(body)
      showToastAfterLoading({
        title: '网络错误',
        icon: 'error',
      })
      return
    }

    // 鉴权失败统一重登（基于业务码 code，而不是 reload 魔法字段）
    const AUTH_LOGOUT_CODES = [20001, 20002, 20003, 20105]
    const codeNum = Number(code)
    if (typeof codeNum === 'number' && AUTH_LOGOUT_CODES.includes(codeNum)) {
      // 统一失效处理：清理 token + userInfo + 会话密钥
      const userStore = useUserStore()
      userStore.logout()

      // token 失效后断开聊天长连接，避免继续心跳/接收消息
      const chatStore = useChatStore()
      chatStore.closeChatConnection()

      // 自动回到登录页，避免用户停留在无效鉴权页面
      if (!_logoutInProgress) {
        _logoutInProgress = true
        const loginUrl = '/packageA/pages/my/login'
        const fallbackTabUrl = '/pages/my/index'
        try {
          uni.reLaunch({ url: loginUrl })
        } catch (e) {
          try {
            uni.redirectTo({ url: loginUrl })
          } catch (e2) {
            try {
              uni.switchTab({ url: fallbackTabUrl })
            } catch (e3) {
              // 兜底都失败则保持当前页，至少保证已清理登录态
            }
          }
        }
        setTimeout(() => {
          _logoutInProgress = false
        }, 1500)
      }

      // 已触发登录态清理与跳转，这里直接 reject 并返回，避免额外 toast 干扰
      reject(body)
      return
    }

    if (this.shouldOpenCrypto() && this.isCryptoSessionExpiredBody(body)) {
      reject(this.buildSessionExpiredError({ body }))
      return
    }

    reject(body)
    const msg = body && body.msg ? String(body.msg) : '系统繁忙，请稍后重试'
    showToastAfterLoading({
      title: msg,
      icon: 'none',
    })
  }

  // 兼容旧命名：complete -> handleResponse
  complete(res, resolve, reject, url) {
    return this.handleResponse(res, resolve, reject, url)
  }

  // 纯请求核心：只负责组包 + 发请求 + 回调 handleResponse（不关心重试策略）
  requestCore(url, method = 'GET', data, config = {}) {
    const loadingOpt = config.loading
    beginGlobalLoading(loadingOpt)
    let rest
    try {
      rest = this.buildRequestConfig(url, data, { ...config, method })
    } catch (e) {
      endGlobalLoading(loadingOpt)
      return Promise.reject(e)
    }
    return new Promise((resolve, reject) => {
      uni.request({
        url: rest.url,
        data: rest.data,
        method,
        header: rest.config.header,
        complete: (res) => {
          try {
            this.handleResponse(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  // 请求统一入口：先确保会话，再发请求；会话失效时自动重签并重试一次
  async request(url, method = 'GET', data, config = {}) {
    return this.withOneRetryOnSessionExpired(
      async () => {
        await this.ensureCryptoSessionIfNeeded(url, config)
        return this.requestCore(url, method, data, config)
      },
      {
        url,
        config,
        retry: (nextConfig) => this.request(url, method, data, nextConfig),
      },
    )
  }

  // 语义化别名：统一走 request
  post(url, data, config = {}) {
    return this.request(url, 'POST', data, config)
  }

  // 语义化别名：统一走 request
  get(url, data, config = {}) {
    return this.request(url, 'GET', data, config)
  }

  // 语义化别名：统一走 request
  patch(url, data, config = {}) {
    return this.request(url, 'PATCH', data, config)
  }

  // 语义化别名：统一走 request
  put(url, data, config = {}) {
    return this.request(url, 'PUT', data, config)
  }

  // 语义化别名：统一走 request
  del(url, data, config = {}) {
    return this.request(url, 'DELETE', data, config)
  }

  // 上传核心逻辑：与 requestCore 一样只负责实际发网，不处理重试策略
  // 上传核心：只负责上传并交给 handleResponse 处理结果
  uploadCore(filePath, config = {}) {
    const loadingOpt = config.loading
    beginGlobalLoading(loadingOpt)
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: baseUrl + '/base/upload',
        filePath,
        name: 'file',
        header: {
          Authorization: this.getToken(),
        },
        complete: (res) => {
          try {
            if (res.data) {
              res.data = JSON.parse(res.data)
            }
            this.handleResponse(res, resolve, reject, '/base/upload')
          } catch (e) {
            reject(e)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  // 上传入口：先确保会话；会话失效时自动重签并重试一次
  upload(filePath, config = {}) {
    const url = '/base/upload'
    return this.withOneRetryOnSessionExpired(
      async () => {
        await this.ensureCryptoSessionIfNeeded(url, config)
        return this.uploadCore(filePath, config)
      },
      {
        url,
        config,
        retry: (nextConfig) => this.upload(filePath, nextConfig),
      },
    )
  }

  // 统一签到（加密会话密钥初始化）
  signIn() {
    // signIn：初始化 zoneSessionId + zoneWorkKey
    // 旧版约定：响应 data 为“加密字符串”，需要 sm2 解密后 JSON.parse
    if (!this.shouldOpenCrypto()) return Promise.resolve()
    if (getSessionId() && getWorkKey()) {
      if (enableRequestCryptoDebugLog) {
        // console.log('[crypto-signIn] skipped, session already exists')
      }
      return Promise.resolve()
    }
    if (this._signInInFlight) return this._signInInFlight

    if (enableRequestCryptoDebugLog) {
      console.log('[crypto-signIn] requesting /common/signIn')
    }
    this._signInInFlight = this.post('/common/signIn', { sence: 'blog' })
      .then((res) => {
        if (res?.data) {
          // 旧版约定：signIn 返回的数据是加密字符串，需要 sm2 解密后 parse
          const encrypted = res.data
          const decrypted = sm2.doDecrypt(encrypted.slice(2), privateKey, 1)
          return JSON.parse(decrypted)
        }
        throw new Error('signIn: empty response data')
      })
      .then((data) => {
        if (data?.sessionId && data?.workKey) {
          uni.setStorageSync('zoneSessionId', data.sessionId)
          uni.setStorageSync('zoneWorkKey', data.workKey)
          if (enableRequestCryptoDebugLog) {
            console.log('[crypto-signIn] success', {
              sessionId: data.sessionId,
            })
          }
          return
        }
        throw new Error('signIn: missing sessionId or workKey')
      })
      .catch((err) => {
        if (enableRequestCryptoDebugLog) {
          console.log('[crypto-signIn] failed', err)
        }
        clearCryptoSession()
        throw err
      })
      .finally(() => {
        this._signInInFlight = null
      })

    return this._signInInFlight
  }
}

const api = new CommercialApi()
export default api

