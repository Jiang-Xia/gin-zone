<template>
	<view class="container">
		<image v-if="isLogin" class="my-bg" src="../../static/images/logined.png" mode=""></image>
		<navigator v-if="isLogin" class="my-info" url="/pages/my/setting" hover-class="navigator-hover">
			<view class="top-box">
				<image class="avatar" :src="userInfo.avatar" mode=""></image>
				<view class="uni-flex-column">
					<text class="name">{{userInfo.nickName}}</text>
					<text>{{userInfo.intro||'难将心事和人说 说与青天明月知'}}</text>
				</view>
				<uni-icons custom-prefix="zonefont" color="#bbbbb" type="zone-gerenziliao" size="17"></uni-icons>
			</view>
		</navigator>
		<view class="login-wrap" v-if="!isLogin">
			<image class="login-bg" src="../../static/images/approve.png" mode=""></image>
			<button type="primary" @tap="login">登录</button>
		</view>

		<view class="menu-list" v-if="isLogin">
			<uni-list :border="false">
				<uni-list-item showArrow title="退出登录" @click="logout" clickable></uni-list-item>
			</uni-list>
		</view>
	</view>

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
			const token = uni.getStorageSync("token")
			console.log('token', token)
			if (token) {
				this.getZoneUserInfo()
			}
		},
		methods: {
			login() {
				// #ifdef H5|| APP
				uni.navigateTo({
					url: "/pages/my/login"
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
				getApp().globalData.userInfo = res.data
				uni.setStorageSync('userInfo', res.data)
			},
			setToken(token) {
				uni.setStorageSync("token", token)
			},
			logout() {
				this.userInfo = {}
				getApp().globalData.userInfo = {}
				this.setToken('')
				console.log("退出登录")
			}
		}
	}
</script>

<style lang="scss">
	.container {
		font-size: 14px;
		line-height: 24px;
		padding: 88rpx 32rpx 32rpx 32rpx;
	}

	.my-bg {
		width: 100%;
		height: 324rpx;
		margin-bottom: 16rpx;
	}

	page {
		background-color: #f9f9f9;
	}

	.my-info {
		display: flex;
		border-radius: 10rpx;
		background-color: #fff;
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

		.uni-list-item {
			border-radius: 10rpx;
			padding: 24rpx;
		}
	}

	.login-wrap {
		text-align: center;

		.login-bg {
			margin: 0 auto 32rpx;
		}

		button {
			width: 110px;
		}
	}
</style>
