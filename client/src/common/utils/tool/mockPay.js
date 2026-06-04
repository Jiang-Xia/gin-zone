import { mockPayPost } from '../../request/mockPay.js'

// 请求方法：支付 Mock（兼容旧 tool.Post 形参）
export function Post(url, params, bool, cb) {
  void bool
  mockPayPost(url, params)
    .then((res) => cb(res))
    .catch((error) => {
      console.error(error)
    })
}

