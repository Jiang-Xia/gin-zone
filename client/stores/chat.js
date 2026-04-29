import { defineStore } from 'pinia'
import { wsUrl } from '@/common/request/config.js'
import { useUserStore } from '@/stores/user.js'

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 当前 WebSocket 连接实例
    socketTask: null,
    // 心跳定时器句柄
    heartbeatTimer: null,
    // 页面级消息监听器池（key -> handler）
    messageListeners: {},
  }),
  actions: {
    // 注册消息监听器（同 key 会覆盖旧监听）
    registerMessageListener(key, handler) {
      if (!key || typeof handler !== 'function') return
      this.messageListeners[key] = handler
    },
    // 注销消息监听器
    unregisterMessageListener(key) {
      if (!key) return
      delete this.messageListeners[key]
    },
    // 将 socket 消息分发到所有已注册监听器
    emitMessage(res) {
      Object.values(this.messageListeners).forEach((handler) => {
        try {
          handler(res)
        } catch (e) {
          console.log('消息分发回调执行失败:', e)
        }
      })
    },
    // 停止心跳，避免重复定时发送
    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    },
    // 中文注释：token 失效后统一断开 WebSocket，避免继续发送心跳/接收消息
    closeChatConnection() {
      this.stopHeartbeat()
      if (this.socketTask) {
        try {
          // 关闭连接，避免 token 无效后仍占用连接
          this.socketTask.close && this.socketTask.close({})
        } catch (e) {
          // 关闭失败不影响后续登录态清理
        }
      }
      this.socketTask = null
      // 中文注释：清空监听，避免 token 失效后旧页面回调仍被触发
      this.messageListeners = {}
    },
    // 启动心跳，定期向服务端保活
    startHeartbeat() {
      const userStore = useUserStore()
      this.stopHeartbeat()
      if (!this.socketTask || !userStore.userId) return
      this.heartbeatTimer = setInterval(() => {
        this.socketTask.send({
          data: JSON.stringify({
            cmd: 'heartbeat',
            content: 'heartbeat',
            senderId: userStore.userId,
          }),
          success: () => {},
          fail: (error) => {
            console.log('发送失败:', error)
          },
        })
      }, 10000)
    },
    // 初始化聊天连接（可传 userId，不传则读取 userStore）
    initChat(userId) {
      const userStore = useUserStore()
      const currentUserId = userId || userStore.userId
      if (!currentUserId) return null
      const auth = userStore.token || ''
      if (!auth) {
        console.warn('WebSocket 未连接：缺少 token')
        return null
      }
      this.stopHeartbeat()
      // 已有连接先关闭，避免重复连接导致回调叠加
      if (this.socketTask) {
        try {
          this.socketTask.close({})
        } catch (e) {}
        this.socketTask = null
      }
      const bearer = auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`
      const url =
        wsUrl +
        '/mobile/chat?userId=' +
        encodeURIComponent(currentUserId) +
        '&token=' +
        encodeURIComponent(bearer)
      const socketTask = uni.connectSocket({
        url,
        method: 'GET',
        multiple: true,
        header: {
          Authorization: bearer,
        },
        success() {
          console.log('WebSocket连接成功！')
        },
        fail() {
          console.log('WebSocket连接失败！')
        },
      })
      this.socketTask = socketTask
      this.socketTask.onOpen((res) => {
        console.log('WebSocket连接打开成功！', res)
        this.startHeartbeat()
      })
      this.socketTask.onError((res) => {
        console.log('WebSocket连接打开失败，请检查！', res)
      })
      // 底层只绑定一次消息监听，再统一分发给页面
      this.socketTask.onMessage((res) => {
        this.emitMessage(res)
      })
      return this.socketTask
    },
  },
})
