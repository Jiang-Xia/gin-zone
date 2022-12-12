<template>
	<!-- <c-navbar bgColor="bg-gradual-blue" :isBack="true">
	  <block slot="backText">返回</block>
	  <block slot="content">导航栏</block>
	</c-navbar> -->
	<view class="container">
		<button type="primary" @tap="login">登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				href: 'https://uniapp.dcloud.io/component/README?id=uniui'
			}
		},

		components: {},
		methods: {

			login() {
				uni.login({
					"provider": "weixin",
					"onlyAuthorize": true, // 微信登录仅请求授权认证
					success: function(event) {
						const {
							code
						} = event
						//客户端成功获取授权临时票据（code）,向业务服务器发起登录请求。
						uni.request({
							url: 'https://www.example.com/loginByWeixin', //仅为示例，并非真实接口地址。
							data: {
								code: event.code
							},
							success: (res) => {
								//获得token完成登录
								uni.setStorageSync('token', res.token)
							}
						});
					},
					fail: function(err) {
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
