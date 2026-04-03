// 金额格式化

export function moneyFormatter2(num) {
  if (!num) {
    return '0.00'
  }
  let s = num + ''
  let d = ''
  if (s.slice(0, 1) == '-') {
    d = s.slice(0, 1)
    s = s.slice(1)
  }

  const len = s.length
  let index = s.indexOf('.')
  if (index == -1) {
    s = s + '.00'
  } else if (index + 2 == len) {
    s = s + '0'
  }

  index = s.indexOf('.')
  const num2 = s.slice(-3)
  s = s.slice(0, index)

  let result = ''
  while (s.length > 3) {
    result = ',' + s.slice(-3) + result
    s = s.slice(0, s.length - 3)
  }
  if (s) {
    result = s + result
  }
  return d + (result + num2)
}

