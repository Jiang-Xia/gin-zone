// 会话/密钥存取集中管理（减少散落的 storage key）

const TOKEN_KEY = 'zoneToken'
const USER_INFO_KEY = 'zoneUserInfo'
const SESSION_ID_KEY = 'zoneSessionId'
const WORK_KEY_KEY = 'zoneWorkKey'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY)
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function getUserInfo() {
  return uni.getStorageSync(USER_INFO_KEY)
}

export function setUserInfo(info) {
  uni.setStorageSync(USER_INFO_KEY, info)
}

export function clearSession() {
  uni.setStorageSync(TOKEN_KEY, '')
  uni.setStorageSync(USER_INFO_KEY, '')
  uni.setStorageSync(SESSION_ID_KEY, '')
  uni.setStorageSync(WORK_KEY_KEY, '')
}

export function getSessionId() {
  return uni.getStorageSync(SESSION_ID_KEY)
}

export function setSessionId(sessionId) {
  uni.setStorageSync(SESSION_ID_KEY, sessionId)
}

export function getWorkKey() {
  return uni.getStorageSync(WORK_KEY_KEY)
}

export function setWorkKey(workKey) {
  uni.setStorageSync(WORK_KEY_KEY, workKey)
}

