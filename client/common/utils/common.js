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
					uni.navigateTo({
						url: "/pages/my/login"
					})
				} else if (res.cancel) {
					console.log('取消');
				}

			}
		})
	}
}
const common = new Common()
export default common
