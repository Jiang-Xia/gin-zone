// API 接口层：把“接口路径 + 参数组织”收敛到固定命名下
// 目标：页面只关心 `this.$apis.auth.login(...)` 这种语义，不再到处散落 URL 字符串

export function createApis(api) {
  return {
    auth: {
      // 登录鉴权/会话密钥初始化
      signIn: () => api.signIn(),
      login: (params) => api.post('/base/users/login', params),
      register: (params) => api.post('/base/users', params),
      wxLogin: (params) => api.post('/base/auth/wxlogin', params),
      getUserInfo: (params) => api.get('/base/users/info', params || {}),
      updateUser: (id, params) =>
        api.patch('/base/users/{id}', { ...(params || {}), id }),
    },

    blog: {
      dailyImg: (n = 7) => api.get('/blog/resources/daily-img', { n }),
      articleList: (params) => api.post('/blog/article/list', params),
      articleInfo: (id) => api.get('/blog/article/info', { id }),
    },

    chat: {
      friends: (params) => api.get('/mobile/chat/friends', params),
      delFriend: (friendId) =>
        api.del('/mobile/chat/friends/{friendId}', { friendId }),

      groups: (params) => api.get('/mobile/chat/groups', params),
      users: (params) => api.get('/base/users', params),
      addFriend: (params) => api.post('/mobile/chat/friends', params),
      createGroup: (params) => api.post('/mobile/chat/groups', params),

      updateReadTime: (params) =>
        api.post('/mobile/chat/updateReadTime', params),
      logs: (params) => api.post('/mobile/chat/logs', params),
      delGroupMember: (groupId) =>
        api.del('/mobile/chat/groupMembers/{groupId}', { groupId }),
    },

    pay: {
      openid: (code, type) => api.post('/blog/pay/openid', { code, type }),
      tradeCreate: (params) => api.post('/blog/pay/trade/create', params),
      tradeQuery: (params) => api.get('/blog/pay/trade/query', params),
      h5OpenMini: (params) => api.post('/blog/pay/h5-open-mini', params),

      weixinQuickPay: (params) => api.post('/WeixinQuickPay', params),
      getValidateCode: (params) => api.post('/GetValidateCode', params),
      queryJQBankCard: (params) => api.post('/QjbankCardQuery', params),
    },

    moment: {
      list: (params) => api.get('/mobile/moments', params),
      update: (params) =>
        api.get('/mobile/moments/UpdateMoment', params || {}),
      create: (params) => api.post('/mobile/moments', params),
    },

    third: {
      gushici: () => api.get('/third/gushici'),
    },

    webview: {
      wc0001: (params) => api.post('/WC0001', params),
      wc0002: (params) => api.post('/WC0002', params),
    },

    chatAi: {
      getOpenAiKey: (params) => api.post('/third/chatGPT', params),
      sendMessage: (params) => api.post('/third/chatGPTApi', params),
    },
  }
}

