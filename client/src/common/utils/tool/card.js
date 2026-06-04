// 银行卡号脱敏

export function getAcctNoDescAllQHTwo(acctNo) {
  if (!acctNo) return ''
  const s = String(acctNo)
  if (s.length < 4) {
    return s
  }
  return s.substring(0, 4) + ' ' + '**** ****' + ' ' + s.substring(s.length - 4, s.length)
}

