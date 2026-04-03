// 支付链路服务（从页面中抽离网络/参数构建/串联逻辑）

function toolPost(tool, apiName, params, bool) {
  return new Promise((resolve, reject) => {
    try {
      tool.Post(apiName, params, bool, (data) => resolve(data))
    } catch (e) {
      reject(e)
    }
  })
}

export function savePayOrderParams({
  status = 'PROCESSING',
  orderNo,
  mchtNo,
  amount,
  storeName = '',
}) {
  uni.setStorageSync('pay_order_params', {
    status,
    orderNo,
    mchtNo,
    amount,
    storeName,
  })
}

export function loadPayOrderParams() {
  try {
    return uni.getStorageSync('pay_order_params') || {}
  } catch (e) {
    return {}
  }
}

export function applyOrder(tool, { amount, qrCodeInfo, payType, remark }) {
  const mchtNo = qrCodeInfo.mchtNo
  const storeNo = qrCodeInfo.storeNo
  const qrCodeNo = qrCodeInfo.qrcodeNo

  const today = tool.getYesterday('', 0)
  const tradeNo = today + tool.guid(3)
  const subOrderNo = 'S' + today + tool.guid(3)

  const params = {
    version: '1.0',
    mchtNo,
    storeNo,
    qrCodeNo,
    payScene: uni.getStorageSync('payScene') || 'WEB',
    payType,
    tradeNo,
    currency: 'CNY',
    amount,
    remark,
    orderType: 'COMMON',
    orderSubs: [
      {
        subMchtNo: mchtNo,
        subOrderNo,
        goods: '商品',
        storeNo,
        amount,
      },
    ],
  }

  return toolPost(tool, 'ApplyOrder', params, false)
}

export function queryOrder(tool, { mchtNo, orderNo }) {
  const params = { orderNo, mchtNo }
  return toolPost(tool, 'QueryOrder', params, true)
}

// 收银台/支付页：二维码信息
export function getQrcodeInfo(tool, { qrNo, qrType = 'STATIC' }) {
  return toolPost(
    tool,
    'admin.qrcode.GetQrcodeInfo',
    {
      qrNo,
      qrType,
    },
    false,
  )
}

// 查询商户营销活动列表
export function listMchtJoinActivity(tool, param) {
  return toolPost(tool, 'pub.checkActivity.queryCActivityByMcht', param, false)
}

// 计算营销活动金额
export function calculateActivity(tool, param) {
  return toolPost(tool, 'ACalculateActivity', param, false)
}

export function payOrder(tool, {
  mchtNo,
  storeNo,
  orderNo,
  orderSubs,
  payType,
  currentPayMethod,
  currentFQ,
  ip,
  userAuthCode,
}) {
  const params = {
    orderNo,
    storeNo,
    orderSubs,
    mchtNo,
    payType,
    bizType: 'JSAPI',
    tradeInfo: {
      createIp: ip || '127.0.0.1',
      code: userAuthCode,
    },
  }

  // 分期（与页面逻辑一致）
  if (currentPayMethod === 'hb') {
    params.tradeFqInfo = {
      fqChannels: 'alipayfq',
      fqNum: currentFQ,
      fqSellerPercent: 0,
    }
  } else if (currentPayMethod === 'xyk') {
    params.tradeFqInfo = {
      fqChannels: 'alipayfq_cc',
      fqNum: currentFQ,
      fqSellerPercent: 0,
    }
  }

  return toolPost(tool, 'PayOrder', params, false)
}

