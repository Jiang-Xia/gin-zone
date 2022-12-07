<template>
	<view class="auto-container">
		<view v-if="showBtn" class="count-botton fade-in" @tap="navigateTo">跳过{{count}}s</view>
		<image class="bg_img" src="./start_bg.png"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bgImg: 'start_bg.png', //背景图地址，可相对/绝对，可本地/远程
				count: 4, //倒计时秒数
				showBtn: false, //初始不显示跳过按钮
				time: 0
			}
		},
		methods: {
			//延迟一秒显示跳转按钮
			showButton() {
				setTimeout(()=> {
					this.showBtn = true
				}, 1000)
			},
			//跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
			navigateTo() {
				clearInterval(this.time); //清除倒计时
				console.log('咋没动静！')
				uni.switchTab({
					url: '/pages/blog/index'
				})
			},
			//倒计时计数
			countDown() {
			 this.time = setInterval(()=> {
					if (this.count > 0) {
						this.count--
					} else {
						this.count = this.count
						this.navigateTo();
						clearInterval(this.time)
					}
				}, 1000)
			},
		},
		//初始化进入程序
		onLoad() {
			this.countDown();
			this.showButton();
		},

	}
</script>

<style lang="scss">
	@import url("auto.scss");
</style>
