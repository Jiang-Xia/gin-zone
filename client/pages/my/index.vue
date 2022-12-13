<template>
	<view class="container">
		<button type="primary" @tap="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code :''
			}
		},

		components: {},
		methods: {
			login() {
				uni.getUserProfile({
					lang: 'zh_CN',
					desc: '用户注册',
					success:async(info)=> {
						console.log("getUserProfile success", info)
						const res = await this.$api.post('/base/auth/wxlogin', {
							code: this.code,
							...info.userInfo
						})
					},
					fail(err) {
						console.log("getUserProfile err", err)
					}
				})
				uni.login({
					"provider": "weixin",
					scopes: "auth_user",
					success: async (event) => {
					this.code = event.code
					},
					fail: (err) => {
						// 登录授权失败  
						// err.code是错误码
					}
				})
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
