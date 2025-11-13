<template>
<pageConfig title="我的" :left="false">
	<view class="container">
        <view class="login-wrap" v-if="!isLogin">
        	<image class="login-bg" src="/static/images/approve.png" mode=""></image>
        	<button type="primary" @tap="login">登录</button>
            <!-- <button type="primary" @tap="$common.goTo('/packageB/pages/chart/chart')">图表</button> -->
        </view>
        <view class="main-content" v-if="isLogin">
            <view class="bg-wrap">
                <image class="my-bg" src="/static/images/logined.png" mode=""></image>
            </view>
            <view class="card-wrap">
                <navigator class="my-info" url="/packageA/pages/my/setting" hover-class="navigator-hover">
                    <view class="top-box">
                        <image class="avatar" :src="userInfo.avatar" mode=""></image>
                        <view class="uni-flex-column">
                            <text class="name flex-between">{{userInfo.nickName}}<uni-tag :inverted="true" :circle="true" v-if="userInfo.isAdmin" text="管理员"  size="mini" /></text>
                            <text class="intro">{{userInfo.intro||'难将心事和人说 说与青天明月知'}}</text>
                        </view>
                       <uni-icons custom-prefix="zonefont" color="#bbbbb" type="zone-gerenziliao" size="17"></uni-icons>
                    </view>
                </navigator>
                <view class="menu-list">
                    <uni-list :border="false">
                        <uni-list-item showArrow title="其他功能" @click="other" clickable></uni-list-item>
                        <uni-list-item showArrow title="退出登录" @click="confirmLogout" clickable></uni-list-item>
                    </uni-list>
                </view>
            </view>
        </view>
	</view>
    <!-- <tabbar :tabBarShow="3"/> -->
</pageConfig>
</template>

<script>
	export default {
		data() {
			return {
				code: '',
				userInfo: {}
			}
		},

		components: {},

		computed: {
			isLogin() {
				return Object.keys(this.userInfo).length
			},
		},
		onShow() {
			const token = uni.getStorageSync("zoneToken")
			if (token) {
				this.getZoneUserInfo()
			}
		},
        onReady() {
        },
        methods: {
			login() {
				// #ifdef H5 || APP || MP-ALIPAY
				uni.navigateTo({
					url: "/packageA/pages/my/login"
				})
				return
				// #endif

				// #ifdef MP-WEIXIN
				uni.getUserProfile({
					lang: 'zh_CN',
					desc: '用户注册',
					success: async (info) => {
						console.log("getUserProfile success", info)
						const res = await this.$api.post('/base/auth/wxlogin', {
							code: this.code,
							...info.userInfo
						})
						this.setToken(res.data.token)
						this.getZoneUserInfo()
					},
					fail(err) {
						console.log("getUserProfile err", err)
					}
				})
				// #endif

				uni.login({
					"provider": "weixin",
					"onlyAuthorize": true, // 微信登录仅请求授权认证
					success: async (event) => {
						this.code = event.code
						// console.log("event.code", event.code)
						// #ifdef APP-PLUS
						this.getUserInfo(this.code)
						// #endif
					},
					fail: (err) => {
						uni.showToast({
							title: "授权失败",
							icon: "error"
						})
						// 登录授权失败  
						// err.code是错误码
					}
				})
			},
			getUserInfo() {
				uni.getUserInfo({
					provider: 'weixin',
					success: async (info) => {
						console.log("获取授权用户信息成功", info)
						const res = await this.$api.post('/base/auth/wxlogin', {
							code: this.code,
							...info.userInfo
						})
						this.setToken(res.data.token)
						this.getZoneUserInfo()
					},
					fail: (err) => {
						uni.showToast({
							title: "授权失败",
							icon: "error"
						})
						console.log("获取授权信息失败", err)
					}
				})
			},
			// 用户信息
			async getZoneUserInfo() {
				const res = await this.$api.get('/base/users/info')
				this.userInfo = res.data
                const app = getApp()
				app.globalData.userInfo = res.data
				uni.setStorageSync('zoneUserInfo', res.data)
                if(app.globalData.initChat){
                    app.globalData.initChat()
                }
			},
			setToken(token) {
				uni.setStorageSync("zoneToken", token)
			},
            confirmLogout(){
                uni.showModal({
                    title: '确认退出',
                    content: '退出后将清空本地登录状态',
                    confirmColor: '#5064eb',
                    success: ({confirm}) => {
                        if(confirm){
                            this.logout()
                        }
                    }
                })
            },
            logout() {
                this.userInfo = {}
                getApp().globalData.userInfo = {}
                this.setToken('')
                uni.setStorageSync('zoneUserInfo', '')
                uni.showToast({
                    title: '已退出登录',
                    icon: 'none'
                })
            },
			// 其他功能
			other(){
				const isAdmin = this.userInfo.isAdmin
				let list = ["创建群聊", "收银台","测试"]
                
				uni.showActionSheet({
					itemList: list,
					success: async ({tapIndex}) => {
                        let url = ""
						if(tapIndex===0){
                            if(!isAdmin){
                                uni.showToast({
                                	title: "您不是管理员",
                                	icon: "error"
                                })
                                return
                            }
                            url = "/packageA/pages/my/createGroup"
						}else if(tapIndex===1){
                            url = "/packageB/pages/business/pay/cashier/cashier"
                        }else if(tapIndex===2){
                            url = "/packageB/pages/demo/demo"
                        }
                        uni.navigateTo({url})
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		font-size: 14px;
		line-height: 24px;
		padding: 0 0 0 0;
	}
    .bg-wrap{
        background-color: $uni-white;
        padding-left: 84rpx;
    }
    .main-content{
        .card-wrap{
            padding: 32rpx;
        }
    }
	.my-bg {
		width: 100%;
		height: 324rpx;
		margin-bottom: 16rpx;
	}

.my-info {
		display: flex;
		border-radius: 10rpx;
		background-color: $uni-white;
		padding: 24rpx;

		.top-box {
			display: flex;
			align-items: center;
			color: #666;
			font-size: 26rpx;
			// justify-content: space-between;
			width: 100%;
			&::active {
				background-color: #f1f1f1;
			}
		}

		.uni-flex-column {
			flex: 1;
		}

		.uni-icons {
			margin-left: 64rpx;
			margin-right: 18rpx;
		}

        .name {
            font-weight: 500;
            font-size: 36rpx;
            color: #333;
        }
        .intro{
            color: #666;
            font-size: 24rpx;
        }
		image {
			border-radius: 50%;
			height: 100rpx;
			width: 100rpx;
			margin-bottom: 10rpx;
			margin-right: 12rpx;
		}
	}

	.menu-list {
		margin-top: 32rpx;
		border-radius: 10rpx;
		background: transparent;
		.uni-list{background: transparent;}
		.uni-list-item {
			margin-bottom: 24rpx;
			border-radius: 10rpx;
			padding: 24rpx;
		}
	}

	.login-wrap {
		text-align: center;
        background-color: $uni-white;
        padding-top: 88rpx;
        padding-bottom: 32rpx;
		.login-bg {
			margin: 0 auto 32rpx;
            height: 480rpx;
            width: 100%;
		}

		button {
			width: 110px;
            display: inline-block;
		}
	}
</style>
