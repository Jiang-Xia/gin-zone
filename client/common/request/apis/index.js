// API 接口层：把“接口路径 + 参数组织”收敛到固定命名下
// 目标：页面只关心 `this.$apis.auth.login(...)` 这种语义，不再到处散落 URL 字符串

export function createApis(api) {
  return {
    auth: {
      // 一般无需调用：CommercialApi 在加密链路的首个 get/post 前会自动 signIn；联调可手动调试用
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
      groupInfo: (groupId) => api.get('/mobile/chat/groups/{groupId}', { groupId }),
      users: (params) => api.get('/base/users', params),
      addFriend: (params) => api.post('/mobile/chat/friends', params),
      createGroup: (params) => api.post('/mobile/chat/groups', params),
      // 修改群聊信息（仅群主可修改）
      updateGroup: (groupId, params) =>
        api.patch('/mobile/chat/groups/{groupId}', { ...(params || {}), groupId }),
      groupMembers: (groupId) => api.get('/mobile/chat/groupMembers', { groupId }),
      // 群主/管理员删除群成员
      removeGroupMember: (groupId, userId) =>
        api.del('/mobile/chat/groupMembers/{groupId}/{userId}', { groupId, userId }),

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

