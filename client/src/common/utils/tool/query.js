// 获取 url 参数

export function getQueryVariable(variable) {
  const query = location?.search?.substring(1) || ''
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return false
}

