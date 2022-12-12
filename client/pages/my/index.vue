<template>
	<view class="container">
		<button type="primary" @tap="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			}
		},

		components: {},
		methods: {
			login() {
				uni.login({
					"provider": "weixin",
					scopes:"auth_user",
					// "onlyAuthorize": true, // 微信登录仅请求授权认证
					success: (event)=> {
						// uni.setStorageSync('token', res.token)
						this.$api.get('/base/auth/wxlogin',{code:event.code})
					},
					fail: (err)=> {
						// 登录授权失败  
						// err.code是错误码
					}
				})
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
	}
</style>
