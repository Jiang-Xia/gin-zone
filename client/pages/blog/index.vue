<template>
<pageConfig title="博客" :left="false">
	<view class="container">
		<uni-swiper-dot :info="swiperList" :current="current" field="url" mode="round" :dotsStyles="dotsStyles">
			<swiper class="swiper" @change="swiperChange" circular :autoplay="true" :interval="6000" :duration="500">
				<swiper-item v-for="(item ,index) in swiperList" :key="index">
					<view class="swiper-item">
						<image :src="'https://cn.bing.com/'+item.url"></image>
					</view>
				</swiper-item>
			</swiper>
		</uni-swiper-dot>


		<view class="heading">
			<text>最新文章</text>
			<text @tap="goArticleList" class="uni-info">查看更多</text>
		</view>
		<view class="news">
			<view class="news-item" v-for="item in articleList" :key="item.id" @tap="goDetail(item.id)">
				<!-- <image :src="item.cover" :fade-show="true"></image> -->
                <uv-image :src="item.cover" width="100%" height="100%" radius="8"></uv-image>
				<view class="news-item__title">
					<text class="text  uni-ellipsis">{{item.title}}</text>
					<uni-icons type="forward" size="18" color="#f9f9f9"></uni-icons>
				</view>
                <!-- #ifndef MP-WEIXIN -->
				<!-- #endif -->
			</view>
		</view>
	</view>
    <!-- <tabbar :tabBarShow="0"/> -->
</pageConfig>
</template>

<script>
	import {
		formatTime
	} from '@/common/utils/util'
	export default {
		data() {
			return {
				swiperList: [],
				articleList: [],
				current:0,
				dotsStyles:{
						backgroundColor: 'rgba(0, 0, 0, .1)',
						border: '1px rgba(0, 0, 0, .3) solid',
						color: '#fff',
						selectedBackgroundColor: 'rgba(0, 0, 0, .5)',
						selectedBorder: '1px rgba(0, 0, 0, .5) solid'
					},
			}
		},
		components: {},
		onPullDownRefresh() {
			this.init()
			uni.stopPullDownRefresh()
		},
        onReady() {
        },
		onShow() {
            this.$api.signIn().then(()=>{
                this.init()
            })
            // uni.navigateTo({
            //     url: '/packageB/pages/business/webview/webview'
            // })
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
				uni.showLoading({
					title: ''
				})
				this.articleList = []
				let pageSize = 10
				const params = {
					page: 1,
					pageSize,
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
					url: "/packageA/pages/blog/articles/articles",
				})
			},
			goDetail(id) {
				uni.navigateTo({
					url: "/packageA/pages/blog/detail/detail?id=" + id,
				})
			},
			swiperChange(e) {
				this.current = e.detail.current;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-bottom: 50px;
		padding-right: 24rpx;
		padding-left: 24rpx;
        padding-top: 24rpx;
		.swiper {
			height: 400rpx;
            background-color: #fff;
            border-radius: 16rpx;
			box-shadow: 0px 1px 7px 5px rgba(186,190,197,0.2);
			:deep(.uni-swiper__warp){
				border-radius: 16rpx;
			}
			.swiper-item {
				display: block;
				height: 400rpx;
				image {
					border-radius: 16rpx;
					width: 100%;
					height: 100%;
				}
			}
		}
		.heading {
			font-weight: 500;
			font-size: 14px;
			line-height: 2.4;
			display: flex;
			justify-content: space-between;
		}

		.news {
			box-sizing: border-box;
			.news-item {
				position: relative;
				height: 340rpx;
				border-radius: 16rpx;
				box-sizing: border-box;
				margin-bottom: 32rpx;
				// box-shadow: 0px 1px 7px 5px rgba(186,190,197,0.2);
                background-color: #fff;
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
				// box-shadow: 0rpx 0rpx 20rpx rgba(0, 0, 0, .3);
			}

			.text {
				font-size: 28rpx;
				font-weight: 600;
				letter-spacing: 4rpx;
			}
		}
	}
</style>
