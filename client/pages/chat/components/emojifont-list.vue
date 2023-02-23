<template>
	<view ref="confirm" class="emoji-list">
		<view class="emoji-list__content">
			<scroll-view :scroll-top="scrollTop" :scroll-y="true" :show-scrollbar="true">
				<view class="scroll-content">
					<text class="emojifont" @click="onClick(val)" v-for="(val,index) in [...emojis]"
						:key="val+index">{{val}}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import emojis from './emojis.js';
	let timer = null
	export default {
		name: 'EmojiList',
		props: {},
		data() {
			return {
				scrollTop: 0,
				confirm: null,
				emojis: emojis,
			}
		},
		watch: {},
		computed: {

		},
		async created() {
			// let emojisList = [];
			// for (let i = 0; i <= 82; i++) {
			// 	emojisList.push(`/uC${this.transformnum(i)}`)
			// }
			// console.log({emojisList})
		},
		methods: {
			// transformnum(num) {
			// 	let len = 3 //显示的长度，如果以0001则长度为4
			// 	num = parseInt(num, 10) + 1 //转数据类型，以十进制自增
			// 	num = num.toString() //转为字符串
			// 	while (num.length < len) { //当字符串长度小于设定长度时，在前面加0
			// 		num = "0" + num
			// 	}
			// 	return num
			// },
			onClick(e) {
				this.confirm(e)
			},
			open({
				confirm
			}) {
				// 赋值回调方法
				if (confirm) this.confirm = confirm
				this.scrollTop = 0
			},
		}
	}
</script>

<style lang="scss">
	.emoji-list {
		min-height: 300rpx;

		.emoji-list__content {
			height: 100%;
		}

		uni-scroll-view {
			height: 300rpx;
			width: 100%;
		}

		.scroll-content {
			padding-bottom: 40rpx;
		}

		.emojifont {
			font-family: emojifont !important;
			font-style: normal;
			font-size: 70rpx;
			padding: 8rpx;
		}
	}
</style>
