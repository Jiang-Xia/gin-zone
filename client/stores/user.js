import { defineStore } from 'pinia'

// 用户态中心化：减少散落的 uni.setStorageSync/getStorageSync key
export const useUserStore = defineStore('user', {
  state: () => ({
    // 登录令牌（持久化到本地）
    token: '',
    // 当前用户信息（持久化到本地）
    userInfo: {},
  }),
  getters: {
    // 原始用户信息（与 shopkeeper 对齐）
    data: (state) => state.userInfo,
    // 是否已登录（有 token 即认为登录）
    isLoggedIn: (state) => !!state.token,
    // 常用 userId 快捷读取
    userId: (state) => state.userInfo?.userId || '',
  },
  actions: {
    // 按“有值字段”合并用户信息，避免空值覆盖已有字段
    setData(data) {
      if (!data) return
      const patch = Object.fromEntries(
        Object.entries(data).filter(([, value]) => ![undefined, null, ''].includes(value)),
      )
      this.userInfo = { ...this.userInfo, ...patch }
    },
    // 设置 userInfo 的某个字段（与 shopkeeper 风格对齐）
    set(key, value) {
      if (!key) return
      this.userInfo[key] = value
    },
    // 仅清空 userInfo（不动 token）
    clear() {
      this.userInfo = {}
    },
    // 更新 token，并同步写入本地
    setToken(token) {
      this.token = token || ''
    },
    // 更新用户信息，并同步写入本地
    setUserInfo(info) {
      this.userInfo = {}
      this.setData(info || {})
    },
    // 批量更新 token + userInfo
    setAll({ token, userInfo } = {}) {
      this.setToken(token)
      this.setUserInfo(userInfo)
    },
    // 退出登录：清空会话、本地缓存和内存态
    logout() {
      this.token = ''
      this.userInfo = {}
      uni.setStorageSync('zoneSessionId', '')
      uni.setStorageSync('zoneWorkKey', '')
    },
  },
  persist: {
    key: 'zone:user',
    storage: {
      getItem: (key) => {
        if (typeof uni !== 'undefined') return uni.getStorageSync(key)
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key)
        return null
      },
      setItem: (key, value) => {
        if (typeof uni !== 'undefined') return uni.setStorageSync(key, value)
        if (typeof localStorage !== 'undefined') return localStorage.setItem(key, value)
      },
      removeItem: (key) => {
        if (typeof uni !== 'undefined') return uni.removeStorageSync(key)
        if (typeof localStorage !== 'undefined') return localStorage.removeItem(key)
      },
    },
    paths: ['token', 'userInfo'],
  },
})

