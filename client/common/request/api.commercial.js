import { sm2, sm4 } from 'sm-crypto'

import {
  baseUrl,
  isCryptoEnabled,
  privateKey,
  sm4Key,
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

function showToastAfterLoading(options) {
  const toastOptions =
    typeof options === 'string' ? { title: options, icon: 'none' } : options || {}
  // 避免 loading mask 关闭前 toast 被遮挡
  setTimeout(() => {
    uni.showToast(toastOptions)
  }, 0)
}

export class CommercialApi {
  shouldOpenCrypto() {
    return isCryptoEnabled()
  }

  getToken() {
    return getToken()
  }

  // 转化 rest 风格 api：把 "/path/{id}" 里的 "{id}" 替换成 data[id]
  restful(url, data = {}, config = {}) {
    const defaultHeaderConfig = {
      Authorization: this.getToken(),
    }

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

    // 自定义 baseUrl
    if (config.baseUrl) {
      url = config.baseUrl + url
    } else if (url.indexOf('http') !== -1) {
      url = url
    } else {
      if (this.shouldOpenCrypto() && !url.includes('/common/signIn')) {
        url = baseUrl + url

        const id = getSessionId()
        if (id) {
          config.header = {
            ...config.header,
            'Jx-Security': 'Jx-Security',
            'Jx-SessionId': id,
          }
        }

        // 有请求体才加密
        if (['POST', 'PUT', 'PATCH'].includes(method) && payload !== undefined) {
          let content = ''
          try {
            content = JSON.stringify(payload)
          } catch (e) {
            content = String(payload)
          }
          const workKey = getWorkKey() || sm4Key
          content = sm4.encrypt(content, workKey)
          payload = { content }
        }
      } else {
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
    const body = res?.data
    const code = body && body.code

    if (this.shouldOpenCrypto() && body && !url.includes('/common/signIn')) {
      if (body.encrypt) {
        try {
          const workKey = getWorkKey() || sm4Key
          const decrypted = sm4.decrypt(body.encrypt, workKey)
          body.data = JSON.parse(decrypted)
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

