/* 全局功能方法挂载 */
export class Common {
	getUserId() {
		const userInfo = getApp().globalData.userInfo
		console.log({
			用户信息: userInfo
		})
		return userInfo.userId
	}
	showLoginModal() {
		if (this.getUserId()) {
			return
		}
		uni.showModal({
			title: "请先登录！",
			success: (res) => {
				if (res.confirm) {

					// #ifndef MP-WEIXIN
					uni.navigateTo({
						url: "/pages/my/login"
					})
					// #endif
					// #ifdef MP-WEIXIN
					uni.switchTab({
						url: "/pages/my/index"
					})
					// #endif
				} else if (res.cancel) {
					console.log('取消');
				}

			}
		})
	}
}
const common = new Common()
export default common

export const mixins = {
	data() {
		return {
			// 默认的全局分享内容
			share: {
				title: '全局分享的标题',
				path: 'pages/blog/index', // 全局分享的路径，比如 首页
				imageUrl: '', // 全局分享的图片(可本地可网络)
			}
		}
	},
	// 定义全局分享
	// 1.发送给朋友
	onShareAppMessage(res) { 
		let that = this
		// 动态获取当前页面栈
		let pages = getCurrentPages(); //获取所有页面栈实例列表
		let nowPage = pages[pages.length - 1]; //当前页页面实例
		that.share.path = `/${nowPage.route}`
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
			success(res) {
				console.log('success(res)==', res);
				uni.showToast({
					title: '分享成功'
				})
			},
			fail(res) {
				console.log('fail(res)==', res);
				uni.showToast({
					title: '分享失败',
					icon: 'none'
				})
			}
		}
	},
	// 2.分享到朋友圈
	onShareTimeline(res) { 
		let that = this
		// 动态获取当前页面栈
		let pages = getCurrentPages(); //获取所有页面栈实例列表
		let nowPage = pages[pages.length - 1]; //当前页页面实例
		that.share.path = `/${nowPage.route}`
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
			success(res) {
				console.log('success(res)==', res);
				uni.showToast({
					title: '分享成功'
				})
			},
			fail(res) {
				console.log('fail(res)==', res);
				uni.showToast({
					title: '分享失败',
					icon: 'none'
				})
			}
		}
	},
}
