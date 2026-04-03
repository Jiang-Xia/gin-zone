// 时间/随机数相关工具

// 根据当前时间获取昨天/前天的 yyyymmdd（原工具历史包容）
export function getYesterday(detail, num) {
  let today = new Date()
  if (detail) {
    today = new Date(detail)
  }

  const nowTime = today.getTime()
  const ms = 24 * 3600 * 1000 * num
  today.setTime(parseInt(nowTime + ms))

  let oYear = today.getFullYear()
  let oMoth = (today.getMonth() + 1).toString()
  if (oMoth.length <= 1) oMoth = '0' + oMoth

  let oDay = today.getDate().toString()
  if (oDay.length <= 1) oDay = '0' + oDay

  return oYear + '' + oMoth + '' + oDay
}

// 前端生成随机GUID（简化版：每个 S4 是 4 个 hex）
export function guid(loop) {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  let g = ''
  for (let i = 0; i < loop; i++) {
    g = g + S4()
  }
  return g
}

