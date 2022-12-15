<template>
	<view class="container">
		<button type="primary" @tap="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code: ''
			}
		},

		components: {},
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
						uni.showToast({title:"授权失败",icon:"error"})
						// 登录授权失败  
						// err.code是错误码
					}
				})
			},
			getUserInfo() {
				uni.getUserInfo({
					provider: 'weixin',
					success: async (info)=> {
						console.log("获取授权用户信息成功", info)
						const res = await this.$api.post('/base/auth/wxlogin', {
							code: this.code,
							...info.userInfo
						})
						this.setToken(res.data.token)
					},
					fail: (err) => {
						uni.showToast({title:"授权失败",icon:"error"})
						console.log("获取授权信息失败", err)
					}
				})
			},
			setToken(token) {
				uni.setStorageSync("token", token)
			}
		}
	}
</script>

<style lang="less">
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
	}
</style>
