<template>
	<page-meta>
		<navigation-bar :front-color="nbFrontColor" :background-color="nbBackgroundColor" />
	</page-meta>
	<image class="my-bg" src="../../static/images/my.png" mode=""></image>
	<view class="container">
		<view class="my-info">
			<image class="avatar" :src="userInfo.avatar" mode=""></image>
			<text>{{userInfo.nickName}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code: '',
				nbFrontColor: '#ffffff',
				nbBackgroundColor: 'rgba(0,0,0,0)',
				userInfo: {}
			}
		},

		components: {},
		onLoad() {
			const token = uni.getStorageSync("token")
			if (token) {
				this.getZoneUserInfo()
			}
		},
		methods: {
			login() {
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
			},
			setToken(token) {
				uni.setStorageSync("token", token)
			},
		}
	}
</script>

<style lang="less">
	.my-bg {
		width: 100%;
		position: fixed;
		top: 0;
		z-index: -1;
		height: 224rpx;
		/* #ifdef MP-WEIXIN */
		height: 324rpx;
		/* #endif */
	}

	.container {
		padding-top: 88rpx;
		font-size: 14px;
		line-height: 24px;
	}
	.my-info{
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		image{
			border-radius: 50%;
			height: 120rpx;
			width: 120rpx;
			margin-bottom: 10rpx;
		}
	}
</style>
