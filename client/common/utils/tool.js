import { Post } from './tool/mockPay.js'

import { getYesterday, guid } from './tool/time.js'
import { isWxOrAli, closeWindow } from './tool/platform.js'
import { getAcctNoDescAllQHTwo } from './tool/card.js'
import { moneyFormatter2 } from './tool/money.js'
import { getQueryVariable } from './tool/query.js'
import { getImg } from './tool/assets.js'

// tool.js：兼容旧页面的工具聚合出口
// 具体实现拆到了 common/utils/tool/*，这里只做 re-export，避免全局改动过大
export default {
  Post,
  getYesterday,
  guid,
  isWxOrAli,
  closeWindow,
  getAcctNoDescAllQHTwo,
  moneyFormatter2,
  getQueryVariable,
  getImg,
}