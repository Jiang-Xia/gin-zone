<template>
	<view class="container" :style="{'background-color':bg}">
		<view class="poem-container">

			<view class="sentence-container uni-ellipsis-1">
				<text v-for="item,index in poem" :key="index">
					<text class="poem">{{item}}</text>
				</text>
			</view>

			<view class="copy-right">
				<text class="title">{{'﹁' + title + '﹂'}}</text>
				<text class="author">{{author}}</text>
			</view>
		</view>

		<view class="moto-container" @tap="onTap">
			<text class="moto">进入Blog</text>
		</view>
	</view>
</template>

<script>
	import {
		getRandomColor,
		colorRgb,
		colorHex
	} from "/common/utils/util";
	export default {
		data() {
			return {
				poem: [],
				title: '',
				author: '',
				bg: '',
				colorR: ''
			}
		},
		created() {
				
			this.$api.get('/third/gushici').then(res=>{
				const {content,author,origin} =  res.data
				let index = 0
				for(let sign of ["，","？","。"]){
					index = content.indexOf(sign)
					if(index !==-1){break}
				}
				this.poem = [
					content.slice(0,index+1),
					content.slice(index+1,content.length),
				]
				this.author = author
				this.title = origin
			})
		},
		methods: {
			init() {
				this.poem = [
					"难将心事和人说",
					"说与青天明月知"
				]
				this.title = "美人对月"
				this.author = "唐寅"
				const color = getRandomColor()
				// const colorR = this.colorRgb(color)
				this.bg = color
				uni.setNavigationBarColor({
					frontColor: '#000000',
					backgroundColor: color,
				})

			},
			colorRgb(color) {
				color = colorRgb(color)
				color = color.replace(')', ',0.5)')
				return color
			},
			onTap() {
				uni.switchTab({
					url: '/pages/blog/index'
				})
			}
		},
		onLoad() {
			this.init()
		},
	}
</script>


<style lang="scss">
	@import url("entrance.scss");
</style>
