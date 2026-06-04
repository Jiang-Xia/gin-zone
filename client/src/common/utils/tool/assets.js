// 静态资源路径处理
// - 远程资源（http/https/data/blob）保持原样
// - "@/static/xx.png" 归一化为 "/static/xx.png"
// - 静态资源域名：使用 common/request/config.js 的 imageUrl
import { imageUrl } from '../../request/config.js'
const STATIC_BASE_URL = (imageUrl || '').trim()

function joinUrl(base, path) {
  if (!base) return path
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

export function getImg(src) {
  if (!src) return ''
  let s = String(src)
  if (/^(https?:)?\/\//.test(s) || s.startsWith('data:') || s.startsWith('blob:')) return s
  if (s.startsWith('@/')) s = s.replace(/^@\//, '/')
  if (s.startsWith('/static/')) return joinUrl(STATIC_BASE_URL, s)
  return s
}

