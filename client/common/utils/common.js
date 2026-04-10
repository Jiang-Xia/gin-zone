/* 全局功能方法挂载 */
import shareMixin from './mixins/shareMixin.js'
import { getCurrentAddressByLocation } from './location.js'
import { showModal } from './ui.js'
import { useUserStore } from '@/stores/user.js'
export class Common {
    goTo(url){
      uni.navigateTo({
          url
      })  
    }
    back(delta){
      uni.navigateBack({delta:1})  
    }
	getUserId() {
		const userStore = useUserStore()
		const userInfo = userStore.userInfo
		console.log({
			用户信息: userInfo
		})
		return userStore.userId
	}
	showLoginModal() {
		if (this.getUserId()) {
			return
		}
		showModal({
			title: "请先登录！",
			success: (res) => {
				if (res.confirm) {

					// #ifndef MP-WEIXIN
					uni.navigateTo({
						url: "/packageA/pages/my/login"
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
    // 打开pdf
    openPdf(url){
        uni.showLoading({
            title:'加载中'
        })
        uni.downloadFile({
            url,
            success(res) {
                let filePath = res.tempFilePath;
                uni.openDocument({
                    filePath:filePath,
                    showMenu:true,
                    success() {
                        uni.hideLoading()
                        console.log('打开文档成功')
                    },
                    complete() {
                        uni.hideLoading()
                    }
                })
            }
        })
    }
}
const common = new Common()
export default common

export const mixins = {
  ...shareMixin,
  methods: {
    ...shareMixin.methods,
    // 获取当前定位经纬度和地址
    $_getCurrentAddressByLocation() {
      // 这里保留旧对外方法名，内部调用纯函数
      return getCurrentAddressByLocation()
    },
  },
}
