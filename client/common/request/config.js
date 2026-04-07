// 统一环境与地址配置（从旧版 common/request/api.js 抽离）

let env = process.env.NODE_ENV

let fileUrl = ''
let baseUrl = ''
let wsUrl = ''

if (env === 'production') {
  fileUrl = 'https://jiang-xia.top/x-zone/api/v1'
  baseUrl = 'https://jiang-xia.top/x-zone/api/v1'
  wsUrl = 'wss://jiang-xia.top/x-zone/api/v1'
  /* ubuntu 服务器
  fileUrl = "http://43.139.16.164/x-zone/api/v1"
  baseUrl = "http://43.139.16.164/x-zone/api/v1"
  wsUrl = "wss://43.139.16.164/x-zone/api/v1"
  */
} else {
  fileUrl = 'https://jiang-xia.top/x-zone/api/v1'
  baseUrl = 'https://jiang-xia.top/x-zone/api/v1'
  wsUrl = 'wss://jiang-xia.top/x-zone/api/v1'
  // 本地
  // fileUrl = "http://127.0.0.1:9600"
  // baseUrl = "http://127.0.0.1:9600/api/v1"
  // wsUrl = "ws://127.0.0.1:9600/api/v1"
 
}

// 后台加密公钥（注意：生产环境建议不要硬编码敏感信息）
const publicKey =
  '04d6c60496e5d6231de536259e8d6abdb28b6c3e3621108856abc07feb9a742a43bfd6ed7f4b485dcccc7a52e59eba85f7315c11d62abddaef42721d79218fa3d0'

// 前端解密私钥（注意：生产环境建议改为构建注入/受控下发）
const privateKey =
  '6e5779ba88066b86012bc54331caf9ca8b685b00da94b1b660ac8b2508d0614d'

// sm4 固定 key（兼容旧版逻辑；后续建议与 workKey 解耦）
const sm4Key = '0123456789abcdeffedcba9876543210'

// 控制加解密是否开启
// 联调/灰度时可通过本地存储 zoneOpenCrypto=1 来开启
function isCryptoEnabled() {
  try {
    return uni.getStorageSync('zoneOpenCrypto') === '1'
  } catch (e) {
    return false
  }
}

// 是否打印加密请求/响应调试日志（默认：开发环境开启，生产环境建议关闭）
// 可用本地存储 `zoneCryptoDebugLog=1` 强制打开（或关闭时可不设置该值）
const enableRequestCryptoDebugLog = (() => {
  try {
    return uni.getStorageSync('zoneCryptoDebugLog') === '1' || env !== 'production'
  } catch (e) {
    return env !== 'production'
  }
})()

export {
  env,
  fileUrl,
  baseUrl,
  wsUrl,
  publicKey,
  privateKey,
  sm4Key,
  isCryptoEnabled,
  enableRequestCryptoDebugLog,
}

