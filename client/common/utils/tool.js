import { Post } from './tool/mockPay.js'

import { getYesterday, guid } from './tool/time.js'
import { isWxOrAli, closeWindow } from './tool/platform.js'
import { getAcctNoDescAllQHTwo } from './tool/card.js'
import { moneyFormatter2 } from './tool/money.js'
import { getQueryVariable } from './tool/query.js'

export default {
  Post,
  getYesterday,
  guid,
  isWxOrAli,
  closeWindow,
  getAcctNoDescAllQHTwo,
  moneyFormatter2,
  getQueryVariable,
}