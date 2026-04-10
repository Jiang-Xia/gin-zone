// 加密会话参数存取（仅用于请求加解密链路）
const SESSION_ID_KEY = 'zoneSessionId'
const WORK_KEY_KEY = 'zoneWorkKey'

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

