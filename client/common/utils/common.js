/* 全局功能方法挂载 */
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
}
const common = new Common()
export default common

export const mixins = {
	data() {
		return {
			// 默认的全局分享内容
			share: {
				title: '',
				path: 'pages/blog/index', // 全局分享的路径，比如 首页
				imageUrl: '', // 全局分享的图片(可本地可网络)
			}
		}
	},
	// 定义全局分享
	// 1.发送给朋友
	onShareAppMessage(res) { 
		// 动态获取当前页面栈
		let pages = getCurrentPages(); //获取所有页面栈实例列表
		let nowPage = pages[pages.length - 1]; //当前页页面实例
		this.share.title = this.getShareTitle(nowPage.route)
		this.share.path = nowPage.$page.fullPath
		// console.log({nowPage})
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
			success(res) {
				uni.showToast({
					title: '分享成功'
				})
			},
			fail(res) {
				uni.showToast({
					title: '分享失败',
					icon: 'none'
				})
			}
		}
	},
	// 2.分享到朋友圈
	onShareTimeline(res) { 
		// 动态获取当前页面栈
		let pages = getCurrentPages(); //获取所有页面栈实例列表
		let nowPage = pages[pages.length - 1]; //当前页页面实例
		this.share.title = this.getShareTitle(nowPage.route)
		this.share.path = nowPage.$page.fullPath
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
			success(res) {
				uni.showToast({
					title: '分享成功'
				})
			},
			fail(res) {
				uni.showToast({
					title: '分享失败',
					icon: 'none'
				})
			}
		}
	},
	// created(){
	// 	let pages = getCurrentPages(); //获取所有页面栈实例列表
	// 	let nowPage = pages[pages.length - 1]; //当前页页面实例
	// 	console.log({nowPage})
	// },
	methods:{
		// 获取分享标题
		getShareTitle(path){
			let title = ''
			if(this.share.title){
				title = this.share.title
			}else{
				title = this.$pages.find(v=>v.path===path)?.style.navigationBarTitleText
			}
			return title||'江夏的博客'
		},
		// 获取当前定位经纬度和地址
		$_getCurrentAddressByLocation(){
            uni.showLoading({
                title:'加载中'
            })
			return new Promise((resolve, reject) => {
				uni.getLocation({
					geocode: true,
					accuracy: true,
					isHighAccuracy: true,
					type: 'wgs84', //返回可以用于uni.openLocation的经纬度
					success: (locationInfo) => {
						const {latitude,longitude} = locationInfo
						let url = 'https://restapi.amap.com/v3/geocode/regeo'
						const params = {
							// WEB 服务 api key
							key: '7279c02a8edb6f46df4fe81dbe8be1a4',
							location: longitude + ',' + latitude
						}
						uni.request({
							url,
							data: params,
							method: "GET",
							complete: (res) => {
								// console.log('地理地址编码：', res)
								const regeocode = res.data.regeocode
								const formattedAddress = regeocode.formatted_address
                                const obj = {
                                    locationInfo,
                                    formattedAddress,
                                }
                                resolve(obj)
                                uni.hideLoading()
							}
						});
					},
                    complete() {
                        uni.hideLoading()
                    }
				});
			})
            setTimeout(()=>{ uni.hideLoading()}, 2000)
		}
	}
}
