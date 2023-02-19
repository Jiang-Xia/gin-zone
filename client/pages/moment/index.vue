<template>
	<view class="container moment-card-wrap">
		<!--#ifdef MP-WEIXIN  -->
		<uni-nav-bar backgroundColor="#f8f8f8" left-icon="plus" border fixed statusBar title="动态"
			@clickLeft="clickLeft" />
		<!--#endif -->
		<section class="moment-card" v-for="(item, index) in cardList" :key="index">
			<div class="card-top">
				<image class="avatar" :src="item.userInfo.avatar" />
				<div class="middle">
					<p class="name">{{ item.userInfo.nickName }}</p>
					<p class="date">{{ item.date }}</p>
				</div>

			</div>
			<div class="card-message">{{ item.content }}</div>
			<div class="card-images">
				<image class="image-item" v-for="(item2, index2) in item.images"
					:style="{ marginRight: (index2 + 1) % 3 === 0 ? '0px' : '4px' }" width="114" height="114" radius="8"
					:src="$fileUrl+item2" :key="index2" />
			</div>
			<div class="card-bottom">
				<div class="adress">
					<uni-icons type="location" color="#999"></uni-icons> {{ item.location }}
					<uni-icons type="right" color="#999"></uni-icons>
				</div>
				<div class="tool-wrap">
					<span @click="dianzanHandle(item)">
						<uni-icons :type="item.dianzaned ? 'hand-up-filled' : 'hand-up'" style="margin-bottom: 4px;"
							:color="item.dianzaned ? '#0066cc' : '#666'"></uni-icons>
						<span :style="{ color: item.dianzaned ? '#0066cc' : '' }">{{ item.likes }}</span>
					</span>
					<span>
						<uni-icons type="chatbubble" color="#666"></uni-icons>
						{{ item.likes }}
					</span>
					<span>
						<uni-icons type="eye" color="#666"></uni-icons>
						{{ item.views }}
					</span>
					<span>
						<uni-icons type="ellipsis" color="#666"></uni-icons>
					</span>
				</div>
			</div>
		</section>
		<uni-load-more v-if="loading || status === 'noMore' " :status="status" />
	</view>
</template>

<script>
	import {
		formatDate
	} from '../../common/utils/util'
	import {
		formatTime
	} from '/common/utils/util'
	export default {
		data() {
			return {
				cardList: [],
				loading: false,
				status: "more",
				page: 1,
			}
		},
		// 下拉刷新回调函数
		onPullDownRefresh() {
			this.init()
		},
		onShow() {
			this.init()
		},
		// 上拉加载回调函数
		onReachBottom() {
			this.getMomentList(true)
		},
		onNavigationBarButtonTap() {
			this.clickLeft()
		},
		// created() {
		// 	this.init()
		// },
		methods: {
			init() {
				this.cardList = []
				this.onSearch()
			},
			onSearch() {
				this.getMomentList()
			},
			async getMomentList(isScoll) {
				try {
					this.loading = true
					this.status = "loading"
					// 是否滚动
					if (!isScoll) {
						this.articleList = []
						this.page = 1
					} else {
						this.page++
					}
					const {
						content
					} = this
					const params = {
						page: this.page,
						pageSize: 20,
					}
					const res = await this.$api.get('/mobile/moments', params)
					const list = res.data.list.map(v => {
						v.images = v.urls.split()
						v.date = formatDate(v.createdAt)
						return v
					})
					if (!list.length) {
						this.status = "noMore"
					} else {
						this.status = "more"
					}
					this.loading = false
					this.cardList = this.cardList.concat(list)
				} finally {
					this.loading = false
					uni.stopPullDownRefresh()
				}
			},
			dianzanHandle(item) {
				item.dianzaned = true
			},
			clickLeft() {
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
					return
				}
				// #ifndef MP-WEIXIN
				uni.navigateTo({
					url: "/pages/moment/addMoment"
				})
				// #endif
			}
		}
	}
</script>

<style lang="scss">
	.moment-card-wrap {
		.moment-card {
			padding: 12px 12px 12px 12px;
			margin-bottom: 12px;
			border-bottom: 1rpx solid $uni-border-1;
		}

		.card-top {
			display: flex;

			.middle {
				flex: 1;
			}

			.avatar {
				margin-right: 12px;
				height: 80rpx;
				width: 80rpx;
				border-radius: 50%;
			}

			.name {
				color: #666;
				padding-bottom: 8px;
				font-size: 15px;
			}

			.date {
				color: #999;
				font-size: 13px;
			}
		}

		.card-message {
			margin-top: 10px;
			font-size: 15px;
			font-weight: 500;
			color: #000000;
			margin-bottom: 10px;
		}

		.card-images {
			.image-item {
				height: 228rpx;
				width: 228rpx;
				border-radius: 16rpx;
				margin-right: 4px;
				margin-bottom: 4px;
			}
		}

		.card-bottom {
			padding-top: 10px;

			.adress {
				color: #999;
				font-size: 13px;

				.uni-icon {
					font-size: 14px;
					vertical-align: middle;
				}
			}

			.tool-wrap {
				padding-top: 18px;
				display: flex;
				justify-content: space-between;
				color: #666;
				font-size: 13px;
				font-weight: 500;
				color: #666666;
				line-height: 12px;

				&>span {
					// display: flex;
					// align-items: center;
				}

				.uni-icon {
					// margin-right: 2px;
				}
			}
		}
	}
</style>
