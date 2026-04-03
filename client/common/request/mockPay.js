// 支付 Mock：把静态 JSON 的模拟请求从 common/utils/tool.js 收敛到请求层

// #ifdef MP-ALIPAY||MP-WEIXIN||APP
import data1 from '/static/data/json/pay/ACalculateActivity.json'
import data2 from '/static/data/json/pay/admin.qrcode.GetQrcodeInfo.json'
import data3 from '/static/data/json/pay/ApplyOrder.json'
import data4 from '/static/data/json/pay/PayOrder.json'
import data5 from '/static/data/json/pay/pub.checkActivity.queryCActivityByMcht.json'
import data6 from '/static/data/json/pay/QueryOrder.json'
// #endif

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function mockPayPost(url, params) {
  // params 暂未用于静态 json；保留参数签名以便后续按需扩展
  void params

  return new Promise((resolve, reject) => {
    try {
      // #ifdef MP-ALIPAY||MP-WEIXIN||APP
      const dict = {
        ACalculateActivity: data1,
        'admin.qrcode.GetQrcodeInfo': data2,
        ApplyOrder: data3,
        PayOrder: data4,
        'pub.checkActivity.queryCActivityByMcht': data5,
        QueryOrder: data6,
      }
      sleep(500).then(() => resolve(dict[url]))
      // #endif

      // #ifndef MP-ALIPAY||MP-WEIXIN||APP
      // H5/浏览器环境：从本地 static data 拉取 json
      uni.request({
        url: `./static/data/json/pay/${url}.json`,
        success(res) {
          sleep(500).then(() => resolve(res.data))
        },
        fail(err) {
          reject(err)
        },
      })
      // #endif
    } catch (e) {
      reject(e)
    }
  })
}

