<script>
	import { useUserStore } from '@/stores/user.js'
	import { useChatStore } from '@/stores/chat.js'
	export default {
		// 全局变量 全端支持
		globalData: {
		},
		data() {
			return {}
		},
		/* 应用生命周期 */
		onLaunch: function() {
			// console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
            
            // #ifdef H5 || APP-PLUS
            	/* tabbar中间按钮点击事件*/
            	uni.onTabBarMidButtonTap((res)=>{
            	    uni.scanCode({
            	    	success: function (res) {
            	    		console.log('条码类型：' + res.scanType);
            	    		console.log('条码内容：' + res.result);
            	    	}
            	    });
            	})
            // #endif
			// #ifdef MP-WEIXIN
				uni.authorize({
					scope: 'scope.userLocation',
					success() {}
				})
			// #endif
			this.initPush()
			const that = this
			uni.getSystemInfo({
				success: function(e) {
				}
			})
			const userStore = useUserStore()
			const chatStore = useChatStore()

			const userInfo = userStore.userInfo
			if (userInfo && userInfo.userId) {
				chatStore.initChat(userInfo.userId)
			}

			/* 全局用户信息处理 */
			// token 存在但 userInfo 缺失：补拉一次用户信息（失败则清空登录态）
			if (userStore.token && (!userInfo || !userInfo.userId)) {
				this.$apis.auth.getUserInfo().then(res => {
					userStore.setUserInfo(res.data)
					chatStore.initChat(res.data.userId)
				}).catch(() => {
					userStore.logout()
				})
			}
			// #ifdef MP-WEIXIN
			uni.showShareMenu({
				// 小程序分享
				withShareTicket: true,
			})
			// #endif
		},
		onShow: function() {
			console.log('App Show');
			// #ifdef MP-WEIXIN
			this.mpVersionUpdate()
			// #endif

		},
		onReady: function() {
			console.log('App onReady');
			this.initOpt();
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 初始化操作
			initOpt() {
				// console.log(window)
				window.addEventListener('resize', function() {
					if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName ===
						'TEXTAREA') { //滚动到当前元素的方法
						window.setTimeout(function() {
							if ('scrollIntoView' in document.activeElement) {
								document.activeElement.scrollIntoView(false)
							} else {
								document.activeElement.scrollIntoViewIfNeeded(false)
							}
						}, 0)
					}
				})
			},
			//版本更新
			mpVersionUpdate() {
				const updateManager = uni.getUpdateManager();
				updateManager.onCheckForUpdate(function(res) {
					console.log("hasUpdate", res.hasUpdate)
					// 请求完新版本信息的回调
					if (res.hasUpdate) {
						uni.showLoading({
							title: '正在下载'
						})
						updateManager.onUpdateReady(function(res) {
							uni.hideLoading()
							// App.vue 生命周期回调里用 this.$showModal 不稳定，这里直接用 uni.showModal 也可以；
							// 但为统一默认按钮颜色，还是走全局挂载的 $showModal（存在则用）
							;(getApp()?.$vm?.$showModal || uni.showModal)({
								title: '更新提示',
								content: '新版本已经准备好，是否重启应用？',
								success(res) {
									if (res.confirm) {
										// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
										updateManager.applyUpdate();
									} else {
										;(getApp()?.$vm?.$showModal || uni.showModal)({
											content: '本次版本更新涉及到新功能的添加，旧版本将无法正常使用',
											showCancel: false,
											confirmText: '确认更新'
										}).then(res => {
											updateManager.applyUpdate();
										});
									}
								}
							});
						})
						updateManager.onUpdateFailed(function(res) {
							uni.hideLoading()
							;(getApp()?.$vm?.$toast || uni.showToast)({ title: '新的版本下载失败', icon: 'none' })
						});

					}
				})
			},
			// 初始化推送功能
			initPush() {
				// Notification.requestPermission().then(permission => {
				//   console.log(permission)
				// })
				uni.getPushClientId({
					success: (res) => {
						console.log(res);
					},
					fail(err) {
						console.log(err)
					}
				})
				
				uni.onPushMessage((res) => {
					console.log('onPushMessage',res)
					//获取到通知消息有分为点击与监听
					if (res.type == 'click') {
						clearTimeout(timer);

						timer = setTimeout(() => {
							// 处理跳转的业务可以写这边
						}, 1500);
					} else {
						//aps为空说明是在线，aps有值的时候是离线，避免离线点击后再监听会出现两次通知栏
						if (res.data.aps) {
							return;
						}
						let platform = uni.getSystemInfoSync().platform;
						let msg = res.data;
						if (platform == 'ios') { //由于IOS 必须要创建本地消息 所以做这个判断
							if (msg.payload && msg.payload != null) {
								plus.push.createMessage(msg.content, msg.payload) //创建本地消息
							}
						}
						if (platform == 'android') {
							let options = {
								cover: false,
								sound: "system",
								title: msg.title
							}
							plus.push.createMessage(msg.content, msg.payload, options);
						}


					}
				})

			},
		}
	}
</script>
<style lang="scss">
	@import "@/static/iconfont.css";
	@import "common/css/base.scss";
	@import "common/css/animate.min.css";
	@import "@/styles/theme.css";
	@import "@/styles/app.scss";
	/*每个页面公共css 引入辅助样式(类型)*/
    // 文档 https://uniapp.dcloud.net.cn/component/uniui/uni-sass.html
	@import '@/uni_modules/uni-scss/index.scss';
	// 编辑器样式
	@import 'common/css/editor-v3.style.css';
    
    $uni-primary: #f00057;
    $uni-primary-disable:mix(#fff,$uni-primary,50%);
    $uni-primary-light: mix(#fff,$uni-primary,80%);
    
	// 设置整个项目的背景色
	page {
        background-color: #f1f1f1;
        /* #ifndef H5 ||APP-NVUE */
        background-color: #f7f7f7;
        /* #endif */
        // background-color: red;
		user-select: auto;
	}
    
	image{
	    background-size: contain;
	}
  
	// 自定义导航栏公共样式
	.uni-navbar {
		.nav-title {
			font-size: 32rpx;
			text-align: center;
			margin: auto;
		}

		.uni-nav-bar-text {
			font-size: 32rpx !important;
		}

		.uni-navbar-btn-text {
			line-height: 44rpx !important;

			text {
				font-size: 32rpx !important;
			}
		}
	}
    /* 自定导航栏样式*/
    .page-config {
      .global-nav{
            .uni-navbar__header{
                width: 100% !important;
                box-sizing: border-box;
                display: flex;
                justify-content: space-between;
            }
            .uni-navbar__header-container{
                flex: 1;
            }
            .uni-navbar__header-btns{
                
            }
            .nav-title{
                font-size: 18px;
                font-weight: 500;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
/* app.vue写全局样式，uni.scss写全局样式会注入到每个页面，造成每个页面css臃肿*/
    .uni-flex {
    	display: flex;
    }
    
    .uni-flex-row {
    	@extend .uni-flex;
    	flex-direction: row;
    	box-sizing: border-box;
    }
    
    .uni-flex-column {
    	@extend .uni-flex;
    	flex-direction: column;
    }
    
    .uni-color-gary {
    	color: #3b4144;
    }

    /* 略缩图 */
    .uni-thumb {
    	flex-shrink: 0;
    	margin-right:$uni-spacing-sm;
    	width: 125px;
    	height: 75px;
    	border-radius: $uni-radius-root;
    	overflow: hidden;
    	border: 1px #f5f5f5 solid;
    	image {
    		width: 100%;
    		height: 100%;
    	}
    }
</style>