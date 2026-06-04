// 分享 mixin：把 onShareAppMessage/onShareTimeline 与 getShareTitle 收敛到独立模块

const shareMixin = {
  data() {
    return {
      // 默认的全局分享内容
      share: {
        title: '',
        path: 'pages/blog/index', // 默认分享路径，比如 首页
        imageUrl: '', // 默认分享图片（可本地或网络）
      },
    }
  },

  // 1.发送给朋友
  onShareAppMessage(res) {
    const that = this
    // 动态获取当前页面栈
    let pages = getCurrentPages()
    let nowPage = pages[pages.length - 1]

    this.share.title = this.getShareTitle(nowPage.route)
    this.share.path = nowPage.$page.fullPath

    return {
      title: this.share.title,
      path: this.share.path,
      imageUrl: this.share.imageUrl,
      success() {
        ;(that?.$toast || uni.showToast)({ title: '分享成功', icon: 'none' })
      },
      fail() {
        ;(that?.$toast || uni.showToast)({ title: '分享失败', icon: 'none' })
      },
    }
  },

  // 2.分享到朋友圈
  onShareTimeline(res) {
    const that = this
    // 动态获取当前页面栈
    let pages = getCurrentPages()
    let nowPage = pages[pages.length - 1]

    this.share.title = this.getShareTitle(nowPage.route)
    this.share.query = nowPage.$page.query

    return {
      title: this.share.title,
      query: this.share.query,
      imageUrl: this.share.imageUrl,
      success() {
        ;(that?.$toast || uni.showToast)({ title: '分享成功', icon: 'none' })
      },
      fail() {
        ;(that?.$toast || uni.showToast)({ title: '分享失败', icon: 'none' })
      },
    }
  },

  methods: {
    // 获取分享标题
    getShareTitle(path) {
      let title = ''
      if (this.share.title) {
        title = this.share.title
      } else {
        title = this.$pages.find((v) => v.path === path)?.style
          .navigationBarTitleText
      }
      return title || '江夏的博客'
    },
  },
}

export default shareMixin

