<script>
	export default {
		// 全局变量 全端支持
		globalData: {
			StatusBar: 0,
			CustomBar:0,
			Custom:0
		},
		/* 应用生命周期 */
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
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
				}
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	// @import "commcon/colorui/main.css";
	// @import "commcon/colorui/icon.css";
	@import "/common/colorui/main.css";
	// @import "commcon/colorui/icon.css";colorui/main.css";
	@import "/common/colorui/icon.css";
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
