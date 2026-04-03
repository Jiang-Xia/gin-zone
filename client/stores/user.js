import { defineStore } from 'pinia'

import {
  getToken,
  setToken,
  getUserInfo,
  setUserInfo,
  clearSession,
} from '@/common/request/session.js'

// 用户态中心化：减少散落的 uni.setStorageSync/getStorageSync key
export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: getUserInfo() || {},
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.userInfo?.userId || '',
  },
  actions: {
    hydrateFromStorage() {
      this.token = getToken() || ''
      this.userInfo = getUserInfo() || {}
    },
    setToken(token) {
      this.token = token || ''
      setToken(this.token)
    },
    setUserInfo(info) {
      this.userInfo = info || {}
      setUserInfo(this.userInfo)
    },
    setAll({ token, userInfo } = {}) {
      this.setToken(token)
      this.setUserInfo(userInfo)
    },
    logout() {
      clearSession()
      this.token = ''
      this.userInfo = {}
    },
  },
})

