<template>
<pageConfig title="博客" :left="false" :navbar="false">
	<view class="container">
		<!-- 透明搜索框和设置按钮 -->
		<view class="top-container">
            <!-- #ifndef MP -->
            <view class="spacer"></view>
            <!-- #endif -->
            <!-- #ifdef MP-WEIXIN -->
            <view class="settings-icon" @tap="goSetting">
            	<uni-icons type="gear" size="24" color="#fff"></uni-icons>
            </view>
            <!-- #endif -->
			<view class="search-container">
				<view class="search-box" @tap="goArticleList">
					<uni-icons type="search" size="20" color="#999"></uni-icons>
					<text class="search-placeholder">搜索文章...</text>
				</view>
			</view>
            <!-- #ifdef MP -->
            <view class="spacer"></view>
            <!-- #endif -->
            <!-- #ifndef MP -->
            <view class="settings-icon" @tap="goSetting">
            	<uni-icons type="gear" size="24" color="#fff"></uni-icons>
            </view>
            <!-- #endif -->
		</view>
		
		<!-- 轮播图作为背景 -->
		<view class="swiper-background">
			<swiper class="swiper" @change="swiperChange" circular :autoplay="true" :interval="6000" :duration="500">
				<swiper-item v-for="(item ,index) in swiperList" :key="index">
					<view class="swiper-item">
						<image :src="'https://cn.bing.com/'+item.url" class="swiper-image"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 功能菜单栏 浮在轮播图上方 -->
		<view class="floating-menu">
			<view class="menu-grid">
				<!-- H5：用纯 CSS Grid，自适应 4/8 列，不需要 JS 监听 resize -->
				<!-- #ifdef H5 -->
				<view class="menu-grid-h5">
					<view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="clickMenuItem({ detail: { index } })">
						<uni-icons :type="item.icon" :color="item.color" size="24"></uni-icons>
						<text class="menu-text">{{ item.text }}</text>
					</view>
				</view>
				<!-- #endif -->

				<!-- 非 H5：继续用 uni-grid -->
				<!-- #ifndef H5 -->
				<uni-grid :column="4" :show-border="false" :square="false" @change="clickMenuItem">
					<uni-grid-item v-for="(item, index) in menuList" :index="index" :key="index">
						<view class="menu-item">
							<uni-icons :type="item.icon" :color="item.color" size="24"></uni-icons>
							<text class="menu-text">{{ item.text }}</text>
						</view>
					</uni-grid-item>
				</uni-grid>
				<!-- #endif -->
			</view>
		</view>

        <view class="news-container">
            <view class="heading">
            	<text>最新文章</text>
            	<text @tap="goArticleList" class="uni-info">查看更多</text>
            </view>
            <view class="news">
            	<view class="news-item" v-for="item in articleList" :key="item.id" @click="goDetail(item.id)">
            		<!-- <image :src="item.cover" :fade-show="true"></image> -->
                    <t-image
                        :src="item.cover"
                        mode="aspectFill"
                        width="100%"
                        height="100%"
                        :custom-style="{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }"
                    ></t-image>
            		<view class="news-item__title">
            			<text class="text  uni-ellipsis">{{item.title}}</text>
            			<uni-icons type="forward" size="18" color="#f9f9f9"></uni-icons>
            		</view>
                    <!-- #ifndef MP-WEIXIN -->
            		<!-- #endif -->
            	</view>
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
				// 菜单列表
				menuList: [
					{ icon: 'chat', color: '#f00057', text: '聊天',type: 'tabbar', url: '/pages/chat/index' },
					{ icon: 'wallet', color: '#FF9900', text: '收银台', type: '',url: '/packageB/pages/business/pay/cashier/cashier' },
					{ icon: 'heart', color: '#FF5A5F', text: '关注', type: '', url: '' },
					{ icon: 'person', color: '#1CBBB4', text: '我的', type: 'tabbar', url: '/pages/my/index' },
					{ icon: 'image', color: '#FF6B6B', text: '动态', type: 'tabbar', url: '/pages/moment/index' },
					{ icon: 'gear', color: '#999999', text: '设置', type: '', url: '' },
					{ icon: 'tune', color: '#FF9900', text: '其他', type: '', url: '/packageB/pages/demo/demo' },
					{ icon: 'more', color: '#333333', text: '更多', type: '', url: '' }
				]
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
            // 进入博客页前：先完成 signIn（初始化加密会话密钥）再拉取首页数据
            this.$apis.auth.signIn().then(()=>{
                this.init()
            })
            // setTimeout(()=>{
            //     uni.navigateTo({
            //         url: '/packageB/pages/business/pay/cashier/cashier'
            //     })
            // },500)
		},
		methods: {
			init() {
				this.getImage()
				this.getArticleList()
			},
			async getImage() {
				// 首页轮播图：使用接口层，避免页面散落 URL
				const res = await this.$apis.blog.dailyImg(7)
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
				// 文章列表：使用接口层收敛入口
				const res = await this.$apis.blog.articleList(params)
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
			goSetting() {
				this.$toast('设置功能开发中')
			},
			goDetail(id) {
				uni.navigateTo({
					url: "/packageA/pages/blog/detail/detail?id=" + id,
				})
			},
			swiperChange(e) {
				this.current = e.detail.current;
			},
			// 菜单点击事件
			clickMenuItem(e) {
				const item = this.menuList[e.detail.index]
				console.log(item, '------------>')

				// 微信小程序：收银台功能暂未开放
				// #ifdef MP-WEIXIN
				if (item?.url === '/packageB/pages/business/pay/cashier/cashier' || item?.text === '收银台') {
					this.$toast('功能正在开发中')
					return
				}
				// #endif

				if (item.url) {
					if(item.type === 'tabbar'){
						uni.switchTab({
							url: item.url
						})
					}else{
						uni.navigateTo({
							url: item.url
						})
					}
				} else {
					this.$toast('功能开发中')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		// padding-bottom: 50px;
		
        padding-top: 0;
		
		.top-container {
			position: absolute;
			top: 32px;
			left: 0;
			right: 0;
			z-index: 999;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 24rpx;
			// #ifdef MP
			top: 95rpx;
			// #endif
			.spacer {
				width: 60rpx; /* 与设置按钮相同的宽度，用于平衡布局 */
				height: 60rpx;
				visibility: hidden;
			}
			
			.search-container {
				flex: 1;
				display: flex;
				justify-content: center;
				margin: 0 20rpx;
				// #ifdef MP
				margin: 0 120rpx;
				// #endif
				.search-box {
					display: flex;
					align-items: center;
					// background-color: rgba(255, 255, 255, 0.8);
                    background-color: rgba(255, 255, 255, 0.25);
					border-radius: 30rpx;
					padding: 15rpx 30rpx;
					width: 100%;
					max-width: 500rpx;
					
					.search-placeholder {
						color: #999;
						margin-left: 15rpx;
						font-size: 28rpx;
					}
				}
			}
			
			.settings-icon {
				background-color: rgba(0, 0, 0, 0.3);
				border-radius: 50%;
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
		
		/* .swiper-background 预留容器：避免空规则触发 lint */
		.swiper-background {
			display: block;
		}
		
		.swiper {
			height: 500rpx;
            background-color: $uni-white;
            border-radius: 0 0 15rpx 15rpx;
			box-shadow: none;
			:deep(.uni-swiper__warp){
				border-radius: 0 0 15rpx 15rpx;
				overflow: hidden;
			}
			.swiper-item {
				display: block;
				height: 500rpx;
				overflow: hidden;
				border-radius: 0 0 15rpx 15rpx;
				.swiper-image {
					width: 100%;
					height: 100%;
					border-radius: 0 0 15rpx 15rpx;
				}
			}
		}
		
		/* 浮动菜单栏 */
		.floating-menu {
			position: relative;
			margin-top: -120rpx; /* 将菜单栏向上移动，浮在轮播图上 */
			z-index: 100;
			padding: 0 24rpx;
			
			.menu-grid {
				background: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
				border-radius: 16rpx;
				padding: 20rpx 0;
				box-shadow: 0px 1px 7px 5px rgba(186,190,197,0.2);
				backdrop-filter: blur(15px); /* 毛玻璃效果 */
				-webkit-backdrop-filter: blur(15px); /* 兼容性 */

				/* H5：自适应网格布局（默认 4 列，宽屏 8 列） */
				.menu-grid-h5 {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
				}
				@media (min-width: 768px) {
					.menu-grid-h5 {
						grid-template-columns: repeat(8, 1fr);
					}
				}
				
				:deep(.uni-grid) {
					flex-direction: row;
				}
				
				.menu-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 16rpx 0;
					
					.menu-text {
						font-size: 24rpx;
						color: #333;
						margin-top: 12rpx;
					}
				}
			}
		}
        
        .news-container{
            padding-right: 24rpx;
            padding-left: 24rpx;
            padding-bottom: 92rpx;
            .heading {
            	font-weight: 500;
            	font-size: 14px;
            	line-height: 2.4;
            	display: flex;
            	justify-content: space-between;
            	margin-top: 28rpx; /* 为浮动菜单留出空间 */
                
                .uni-info {
                    color: #f00057;
                    font-size: 28rpx;
                }
            }
            
            .news {
            	box-sizing: border-box;
            	.news-item {
            		position: relative;
            		height: 320rpx;
            		border-radius: 16rpx;
            		box-sizing: border-box;
            		margin-bottom: 32rpx;
                    background-color: $uni-white;
                    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
                    overflow: hidden;
            	}
            
            	image {
            		width: 100%;
            		height: 100%;
                    transition: transform 0.3s ease;
                    object-fit: cover;
            	}
                
                .news-item:hover image {
                    transform: scale(1.03);
                }
            
            	.news-item__title {
            		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
            		position: absolute;
            		bottom: 0;
            		left: 0;
            		right: 0;
            		box-sizing: border-box;
            		padding: 24rpx 20rpx;
            		color: #f9f9f9;
            		display: flex;
            		justify-content: space-between;
            		align-items: flex-end;
            	}
            
            	.text {
            		font-size: 30rpx;
            		font-weight: 500;
            		letter-spacing: 2rpx;
                    flex: 1;
                    margin-right: 10rpx;
            	}
            }
        }
	}
</style>