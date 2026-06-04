// 平台识别与 H5 关闭 WebView 能力

// 判断是微信还是支付宝环境
export function isWxOrAli() {
  const ua = navigator?.userAgent?.toLowerCase?.()
  if (!ua) return ''
  let payType = ''
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    uni.setStorageSync('user_agent', 'WXPAY')
    payType = 'WXPAY'
  } else if (ua.match(/AlipayClient/i) == 'alipayclient') {
    uni.setStorageSync('user_agent', 'ALIPAY')
    payType = 'ALIPAY'
  }
  return payType
}

// 微信和支付宝 h5支付关闭当前页面
export function closeWindow() {
  const payType = isWxOrAli()
  if (payType === 'WXPAY') {
    document.addEventListener(
      'WeixinJSBridgeReady',
      function () {
        WeixinJSBridge.call('closeWindow')
      },
      false,
    )
    WeixinJSBridge.call('closeWindow')
  } else if (payType === 'ALIPAY') {
    document.addEventListener(
      'AlipayJSBridgeReady',
      function () {
        AlipayJSBridge.call('closeWebview')
      },
      false,
    )
    AlipayJSBridge.call('closeWebview')
  }
  window.close()
}

