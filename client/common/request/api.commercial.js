import { sm2, sm4 } from 'sm-crypto'

import {
  baseUrl,
  isCryptoEnabled,
  privateKey,
  sm4Key,
  enableRequestCryptoDebugLog,
} from './config.js'
import {
  getToken,
  clearSession,
  getSessionId,
  getWorkKey,
} from './session.js'
import {
  beginGlobalLoading,
  endGlobalLoading,
} from './loading.js'
import { toast as uiToast } from '../utils/ui.js'

function showToastAfterLoading(options) {
  const toastOptions =
    typeof options === 'string' ? { title: options, icon: 'none' } : options || {}
  // 避免 loading mask 关闭前 toast 被遮挡
  setTimeout(() => {
    uiToast(toastOptions)
  }, 0)
}

// 日志打印时对 Authorization 做脱敏，避免把完整 token 打到控制台
export class CommercialApi {
  // 是否开启加解密：由本地存储 `zoneOpenCrypto` 控制（兼容旧版 openCrypto）
  shouldOpenCrypto() {
    return isCryptoEnabled()
  }

  // 获取鉴权 token（zoneToken）
  getToken() {
    // 这里的同名方法会调用同文件导入的 `getToken()`（storage 读取）
    return getToken()
  }

  // 转化 rest 风格 api：把 "/path/{id}" 里的 "{id}" 替换成 data[id]
  restful(url, data = {}, config = {}) {
    const defaultHeaderConfig = {
      // 后端通用鉴权头
      Authorization: this.getToken(),
    }

    // payload：请求 body（GET/DELETE 会通过空对象策略变成 undefined；避免后端异常）
    let payload = data
    if (!payload || typeof payload !== 'object') payload = {}

    for (let key in payload) {
      if (url.indexOf(`{${key}}`) !== -1) {
        url = url.replace(`{${key}}`, `${payload[key]}`)
      }
    }

    if (Object.keys(payload).length === 0) {
      payload = undefined // 置 undefined 不传空对象
    }

    const method = config.method
    const shouldLogCryptoRequest =
      enableRequestCryptoDebugLog &&
      this.shouldOpenCrypto() &&
      !url.includes('/common/signIn') &&
      ['POST', 'PUT', 'PATCH'].includes(method)
    // 自定义 baseUrl
    if (config.baseUrl) {
      url = config.baseUrl + url
    } else if (url.indexOf('http') !== -1) {
      url = url
    } else {
      if (this.shouldOpenCrypto() && !url.includes('/common/signIn')) {
        // crypto 模式下：除 signIn 外，把请求发往 baseUrl，并加会话头/请求体加密
        // 只有非 signIn 才走请求体加密 + 会话头（zoneSessionId）
        url = baseUrl + url

        const id = getSessionId()
        if (id) {
          config.header = {
            ...config.header,
            'Jx-Security': 'Jx-Security',
            'Jx-SessionId': id,
          }
        }

        // 只有 POST/PUT/PATCH 且 payload 存在时才加密
        if (['POST', 'PUT', 'PATCH'].includes(method) && payload !== undefined) {
          // 加密前打印：帮助你确认“实际上传了哪些主要字段”（明文请求体）
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
          payload = { content }
        }
      } else {
        // 不走 crypto 时：只做 baseUrl 拼接
        url = baseUrl + url
      }
    }

    // 自定义请求头
    if (config.header) {
      config.header = {
        ...config.header,
        ...defaultHeaderConfig,
      }
    } else {
      config.header = defaultHeaderConfig
    }

    return {
      data: payload,
      url,
      config,
    }
  }

  // 请求响应完成：处理响应 code / 解密 / 错误提示
  complete(res, resolve, reject, url) {
    // res.data 即后端响应体；旧版返回成功/失败字段约定为 code/msg/encrypt/data
    const body = res?.data
    const code = body && body.code
    // 仅在：加密开启 + 有响应体 + 非 signIn 时，才打印调试日志
    const shouldDebugCrypto =
      enableRequestCryptoDebugLog &&
      this.shouldOpenCrypto() &&
      body &&
      !url.includes('/common/signIn')

    if (this.shouldOpenCrypto() && body && !url.includes('/common/signIn')) {
      // crypto 模式：若响应体包含 encrypt，则解密后把解析结果写回 body.data
      if (body.encrypt) {
        try {
          // 响应解密：同样依赖 zoneWorkKey
          const workKey = getWorkKey() || sm4Key
          const decrypted = sm4.decrypt(body.encrypt, workKey)
          body.data = JSON.parse(decrypted)
          if (shouldDebugCrypto) {
            // 解密后的业务数据（data）
            console.log('[crypto] response(decrypted):', url, body.data)
          }
        } catch (error) {
          console.error('解密报文失败', error)
          reject(error)
          showToastAfterLoading({
            title: '解密报文失败，请稍后重试',
            icon: 'none',
          })
          return
        }
      }
    }

    if (code === 0 || code === 200) {
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

    // 鉴权失败清空信息（兼容旧版约定：res.data.data?.reload）
    if (body.data?.reload) {
      // 统一失效处理：清理 token + userInfo + 会话密钥
      clearSession()
    }

    reject(body)
    const msg = body && body.msg ? String(body.msg) : '系统繁忙，请稍后重试'
    showToastAfterLoading({
      title: msg,
      icon: 'none',
    })
  }

  async request(url, method = 'GET', data, config = {}) {
    const loadingOpt = config.loading
    beginGlobalLoading(loadingOpt)
    const rest = this.restful(url, data, { ...config, method })
    return new Promise((resolve, reject) => {
      uni.request({
        url: rest.url,
        data: rest.data,
        method,
        header: rest.config.header,
        complete: (res) => {
          try {
            this.complete(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  post(url, data, config = {}) {
    return new Promise((resolve, reject) => {
      const loadingOpt = config.loading
      beginGlobalLoading(loadingOpt)

      let rest
      try {
        rest = this.restful(url, data, { ...config, method: 'POST' })
      } catch (e) {
        endGlobalLoading(loadingOpt)
        reject(e)
        return
      }

      uni.request({
        url: rest.url,
        data: rest.data,
        method: 'POST',
        header: rest.config.header,
        complete: (res) => {
          try {
            this.complete(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  get(url, data, config = {}) {
    return new Promise((resolve, reject) => {
      const loadingOpt = config.loading
      beginGlobalLoading(loadingOpt)

      let rest
      try {
        rest = this.restful(url, data, { ...config, method: 'GET' })
      } catch (e) {
        endGlobalLoading(loadingOpt)
        reject(e)
        return
      }

      uni.request({
        url: rest.url,
        data: rest.data,
        method: 'GET',
        header: rest.config.header,
        complete: (res) => {
          try {
            this.complete(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  patch(url, data, config = {}) {
    return new Promise((resolve, reject) => {
      const loadingOpt = config.loading
      beginGlobalLoading(loadingOpt)

      let rest
      try {
        rest = this.restful(url, data, { ...config, method: 'PATCH' })
      } catch (e) {
        endGlobalLoading(loadingOpt)
        reject(e)
        return
      }

      uni.request({
        url: rest.url,
        data: rest.data,
        method: 'PATCH',
        header: rest.config.header,
        complete: (res) => {
          try {
            this.complete(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  put(url, data, config = {}) {
    return new Promise((resolve, reject) => {
      const loadingOpt = config.loading
      beginGlobalLoading(loadingOpt)

      let rest
      try {
        rest = this.restful(url, data, { ...config, method: 'PUT' })
      } catch (e) {
        endGlobalLoading(loadingOpt)
        reject(e)
        return
      }

      uni.request({
        url: rest.url,
        data: rest.data,
        method: 'PUT',
        header: rest.config.header,
        complete: (res) => {
          try {
            this.complete(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  del(url, data, config = {}) {
    return new Promise((resolve, reject) => {
      const loadingOpt = config.loading
      beginGlobalLoading(loadingOpt)

      let rest
      try {
        rest = this.restful(url, data, { ...config, method: 'DELETE' })
      } catch (e) {
        endGlobalLoading(loadingOpt)
        reject(e)
        return
      }

      uni.request({
        url: rest.url,
        data: rest.data,
        method: 'DELETE',
        header: rest.config.header,
        complete: (res) => {
          try {
            this.complete(res, resolve, reject, url)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  upload(filePath) {
    const loadingOpt = undefined
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
            this.complete(res, resolve, reject, '/base/upload')
          } catch (e) {
            reject(e)
          } finally {
            endGlobalLoading(loadingOpt)
          }
        },
      })
    })
  }

  // 统一签到（加密会话密钥初始化）
  signIn() {
    // signIn：初始化 zoneSessionId + zoneWorkKey
    // 旧版约定：响应 data 为“加密字符串”，需要 sm2 解密后 JSON.parse
    if (!this.shouldOpenCrypto()) return Promise.resolve()

    return this.post('/common/signIn', { sence: 'blog' })
      .then((res) => {
        if (res?.data) {
          // 旧版约定：signIn 返回的数据是加密字符串，需要 sm2 解密后 parse
          const encrypted = res.data
          const decrypted = sm2.doDecrypt(encrypted.slice(2), privateKey, 1)
          return JSON.parse(decrypted)
        }
      })
      .then((data) => {
        if (data) {
          uni.setStorageSync('zoneSessionId', data.sessionId)
          uni.setStorageSync('zoneWorkKey', data.workKey)
        }
      })
      .catch(() => {
        // 初始化失败回滚
        uni.setStorageSync('zoneSessionId', '')
        uni.setStorageSync('zoneWorkKey', '')
      })
  }
}

const api = new CommercialApi()
export default api

