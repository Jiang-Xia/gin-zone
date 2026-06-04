// UI helper methods for uni-app (Vue3)
// - `showModal` wraps `uni.showModal` with default button colors
// - `toast` wraps `uni.showToast` with sensible defaults

const DEFAULT_MODAL_OPTIONS = {
  confirmColor: '#f00057',
  cancelColor: '#999999',
}

let customModalOpener = null

const DEFAULT_TOAST_OPTIONS = {
  icon: 'none',
  duration: 2000,
  mask: false,
}

function normalizeModalArgs(arg1, arg2) {
  // Usage:
  // showModal({ title, content, ... })
  // showModal('content', { title?, ... })
  if (typeof arg1 === 'string') {
    return { content: arg1, ...(arg2 || {}) }
  }
  return { ...(arg1 || {}) }
}

export function showModal(arg1, arg2) {
  const options = normalizeModalArgs(arg1, arg2)
  const mergedOptions = {
    ...DEFAULT_MODAL_OPTIONS,
    ...options,
  }
  if (customModalOpener) {
    return customModalOpener(mergedOptions)
      .then((res) => {
        options?.success?.(res)
        return res
      })
      .catch((err) => {
        options?.fail?.(err)
        throw err
      })
  }
  return new Promise((resolve, reject) => {
    uni.showModal({
      ...mergedOptions,
      success: (res) => {
        options?.success?.(res)
        resolve(res)
      },
      fail: (err) => {
        options?.fail?.(err)
        reject(err)
      },
    })
  })
}

export function registerCustomModalOpener(opener) {
  customModalOpener = typeof opener === 'function' ? opener : null
}

function normalizeToastArgs(arg1, arg2) {
  // Usage:
  // toast({ title, icon?, duration?, ... })
  // toast('title', { icon?, ... })
  if (typeof arg1 === 'string') {
    return { title: arg1, ...(arg2 || {}) }
  }
  return { ...(arg1 || {}) }
}

function baseToast(arg1, arg2) {
  const options = normalizeToastArgs(arg1, arg2)
  if (!options?.title) return
  uni.showToast({
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
  })
}

export const toast = Object.assign(baseToast, {
  none(title, options) {
    return baseToast(title, { ...(options || {}), icon: 'none' })
  },
  success(title, options) {
    return baseToast(title, { ...(options || {}), icon: 'success' })
  },
  error(title, options) {
    return baseToast(title, { ...(options || {}), icon: 'error' })
  },
})

