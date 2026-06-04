// 全局 Loading 管理器（并发计数 + 防闪烁）

const globalLoadingState = {
  enabled: true,
  title: '加载中...',
  mask: true,
  debounceMs: 150,
}

const loadingRuntime = {
  pendingCount: 0,
  timer: null,
  showing: false,
}

export function setGlobalLoadingEnabled(enabled) {
  globalLoadingState.enabled = !!enabled
}

export function setGlobalLoadingOptions(options = {}) {
  if (!options || typeof options !== 'object') return
  if (typeof options.enabled === 'boolean')
    globalLoadingState.enabled = options.enabled
  if (typeof options.title === 'string') globalLoadingState.title = options.title
  if (typeof options.mask === 'boolean') globalLoadingState.mask = options.mask
  if (typeof options.debounceMs === 'number')
    globalLoadingState.debounceMs = options.debounceMs
}

function resolveLoadingOptions(options) {
  if (options === false) {
    return { enabled: false }
  }
  const opt = options && typeof options === 'object' ? options : {}
  const enabled =
    typeof opt.enabled === 'boolean'
      ? opt.enabled
      : globalLoadingState.enabled
  return {
    enabled,
    title: typeof opt.title === 'string' ? opt.title : globalLoadingState.title,
    mask: typeof opt.mask === 'boolean' ? opt.mask : globalLoadingState.mask,
    debounceMs:
      typeof opt.debounceMs === 'number'
        ? opt.debounceMs
        : globalLoadingState.debounceMs,
  }
}

export function beginGlobalLoading(options) {
  const opt = resolveLoadingOptions(options)
  if (!opt.enabled) return

  loadingRuntime.pendingCount += 1
  if (loadingRuntime.pendingCount !== 1) return

  if (loadingRuntime.timer) {
    clearTimeout(loadingRuntime.timer)
    loadingRuntime.timer = null
  }

  loadingRuntime.timer = setTimeout(() => {
    loadingRuntime.timer = null
    if (loadingRuntime.pendingCount > 0 && !loadingRuntime.showing) {
      loadingRuntime.showing = true
      uni.showLoading({
        title: opt.title,
        mask: opt.mask,
      })
    }
  }, Math.max(0, Number(opt.debounceMs) || 0))
}

export function endGlobalLoading(options) {
  const opt = resolveLoadingOptions(options)
  if (!opt.enabled) return

  loadingRuntime.pendingCount = Math.max(
    0,
    loadingRuntime.pendingCount - 1,
  )
  if (loadingRuntime.pendingCount > 0) return

  if (loadingRuntime.timer) {
    clearTimeout(loadingRuntime.timer)
    loadingRuntime.timer = null
  }

  if (loadingRuntime.showing) {
    loadingRuntime.showing = false
    uni.hideLoading()
  }
}

