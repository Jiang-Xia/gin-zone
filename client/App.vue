<script>
	export default {
		// 全局变量 全端支持
		globalData: {
			StatusBar: 0,
			CustomBar: 0,
			Custom: 0,
			userInfo: {},
			avatar: "https://jiang-xia.top/x-blog/api/v1/static/uploads/2023-01-01/2kf3d768tj33vsgs6exbu8-默认头像.jpeg"
		},
		/* 应用生命周期 */
		onLaunch: function() {
			// console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
			const that = this
			uni.getSystemInfo({
				success: function(e) {
					// #ifndef MP
					that.globalData.StatusBar = e.statusBarHeight;
					if (e.platform == 'android') {
						that.globalData.CustomBar = e.statusBarHeight + 50;
					} else {
						that.globalData.CustomBar = e.statusBarHeight + 45;
					};
					// #endif
					// #ifdef MP-WEIXIN
					that.globalData.StatusBar = e.statusBarHeight;
					let custom = wx.getMenuButtonBoundingClientRect();
					that.globalData.Custom = custom;
					that.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif		
					// #ifdef MP-ALIPAY
					that.globalData.StatusBar = e.statusBarHeight;
					that.globalData.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
					// that.initOpt();
					// console.log(that.globalData)
				}
			})
			if (uni.getStorageSync("token")) {
				this.$api.get('/base/users/info').then(res => {
					uni.setStorageSync('userInfo', res.data)
					this.globalData.userInfo = res.data
				})
			}
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods:{
			// 初始化操作
			initOpt(){
			}
		}
	}
</script>
<style lang="scss">
	@import "@/static/iconfont.css";
	@import "common/css/base.scss";
	@import "common/css/animate.min.css";
	/*每个页面公共css 引入辅助样式*/
	@import '@/uni_modules/uni-scss/index.scss';
	// 编辑器样式
	@import 'common/css/editor-v3.style.css';
	/* #ifndef APP-NVUE */
	// 设置整个项目的背景色
	page {
		// background-color: #f5f5f5;
	}
	/* #endif */
	
	// 自定义导航栏公共样式
	.uni-navbar{
		.nav-title {
				font-size: 32rpx;
				text-align: center;
				margin: auto;
			}
		.uni-nav-bar-text{
			font-size: 32rpx !important;
		}
		.uni-navbar-btn-text{
			line-height: 44rpx !important;
			text{
				font-size: 32rpx !important;
			}
		}
	}
	
</style>
