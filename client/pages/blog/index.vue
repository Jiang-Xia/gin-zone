<template>
	<view class="container">
		<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="6000" :duration="500">
			<swiper-item v-for="item in swiperList" :key="item.hsh">
				<view class="swiper-item">
					<img :src="'https://cn.bing.com/'+item.url" />
				</view>
			</swiper-item>
		</swiper>

		<view class="heading">最新文章</view>
		<view class="news">
			<view class="news-item" v-for="item in articleList" :key="item.id" @tap="goDetail(item.id)">
				<img :src="item.cover"/>
				<text class="text">{{item.title}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatTime
	} from '/common/utils/util'
	export default {
		data() {
			return {
				swiperList: [],
				articleList: [],

			}
		},

		components: {},
		created() {
			this.getImage()
			this.getArticleList()
		},
		methods: {
			async getImage() {
				const res = await this.$api.get('/blog/resources/daily-img', {
					n: 7
				})
				console.log(res)
				this.swiperList = res.data.images
			},
			async getArticleList() {
				this.articleList = []
				const params = {
					page: 1,
					pageSize: 4,
				}
				const res = await this.$api.post('/blog/article/list', params)
				const list = res.data.list.map((v) => {
					v.createTime = formatTime(new Date(v.createTime))
					return v
				})
				this.articleList = list
			},
			goDetail(id) {
				uni.navigateTo({
					url: "/pages/blog/detail/detail?id=" + id,
				})
			},
		}
	}
</script>

<style lang="scss">
	.container {
		padding-bottom: 50px;

		.swiper {
			height: 500rpx;
		}

		.swiper-item {
			display: block;
			height: 500rpx;

			img {
				width: 100%;
				height: 100%;
			}
		}

		.heading {
			font-weight: 600;
			font-size: 14px;
			padding: 0 16rpx;
			line-height: 2.4;
		}

		.news {
			padding: 0 16rpx;
			box-sizing: border-box;

			.news-item {
				position: relative;
				height: 400rpx;
				border-radius: 16rpx;
				box-sizing: border-box;
				margin-bottom: 32rpx;
			}

			img {
				width: 100%;
				border-radius: 16rpx;
				height: 100%;
			}

			.text {
				position: absolute;
				top: 50%;
				left: 0;
				transform: translate(0, -50%);
				width: 100%;
				font-weight: 52rpx;
				font-weight: 600;
				color: #f9f9f9;
				text-align: center;
				letter-spacing: 4rpx;
			}
		}
	}
</style>
