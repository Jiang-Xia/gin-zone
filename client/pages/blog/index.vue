<template>
	<view class="container">
		<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="6000" :duration="500">
			<swiper-item v-for="item in swiperList" :key="item.hsh">
				<view class="swiper-item">
					<image :src="'https://cn.bing.com/'+item.url"></image>
				</view>
			</swiper-item>
		</swiper>

		<view class="heading">
			<text>最新文章</text>
			<text @tap="goArticleList" class="uni-info">查看更多</text>
		</view>
		<view class="news">
			<view class="news-item" v-for="item in articleList" :key="item.id" @tap="goDetail(item.id)">
				<image :src="item.cover" :fade-show="true"></image>
				<view class="news-item__title uni-ellipsis">
					<text class="text">{{item.title}}</text>
					<uni-icons type="forward" size="18" color="#f9f9f9"></uni-icons>
				</view>
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
		onPullDownRefresh() {
			this.init()
			uni.stopPullDownRefresh()
		},
		created() {
			this.init()
		},
		methods: {
			init() {
				this.getImage()
				this.getArticleList()
			},
			async getImage() {
				const res = await this.$api.get('/blog/resources/daily-img', {
					n: 7
				})
				// console.log(res)
				this.swiperList = res.data.images
			},
			async getArticleList() {
				uni.showLoading({title:''})
				this.articleList = []
				const params = {
					page: 1,
					pageSize: 10,
					client: true
				}
				const res = await this.$api.post('/blog/article/list', params)
				const list = res.data.list.map((v) => {
					v.createTime = formatTime(new Date(v.createTime))
					return v
				})
				this.articleList = list
				uni.hideLoading()
			},
			goArticleList() {
				uni.navigateTo({
					url: "/pages/blog/articles/articles",
				})
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

			image {
				width: 100%;
				height: 100%;
			}
		}

		.heading {
			font-weight: 500;
			font-size: 14px;
			padding: 0 16rpx;
			line-height: 2.4;
			display: flex;
			justify-content: space-between;
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

			image {
				width: 100%;
				border-radius: 16rpx;
				height: 100%;
			}

			.news-item__title {
				background: rgba(0, 0, 0, 0.2);
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				box-sizing: border-box;
				border-radius: 0 0 16rpx 16rpx;
				padding: 16rpx;
				color: #f9f9f9;
				display: flex;
				justify-content: space-between;
				box-shadow: 0rpx 0rpx 20rpx rgba(0, 0, 0, .3);
			}

			.text {
				font-size: 28rpx;
				font-weight: 600;
				text-align: center;
				letter-spacing: 4rpx;
			}
		}
	}
</style>
