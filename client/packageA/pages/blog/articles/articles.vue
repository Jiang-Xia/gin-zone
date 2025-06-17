<template>
	<view>
		<uni-search-bar @confirm="onSearch" @cancel="onSearch" cancel-text="搜索" :focus="false" v-model="content"
			placeholder="输入关键字搜索文章">
		</uni-search-bar>

		<uni-list>
			<!-- 大图模式 -->
			<!-- <uni-list-item v-for="item in articleList" direction="column" clickable showArrow :rightText="String(item.views)" 
			:note="item.userInfo.nickname + ' '+item.createTime"
			:to="'/packageA/pages/blog/detail/detail?id='+item.id"
			>
				<template v-slot:header>
					<view class="uni-title">{{item.title}}</view>
					<view class="uni-thumb uni-content list-picture">
						<image :src="item.cover" mode="aspectFill"></image>
					</view>
				</template>
				<template v-slot:body1>
					<view class="custom-note">
						{{item.userInfo.nickname + ' '+item.createTime+' '+item.views}}
					</view>
				</template>
			</uni-list-item> -->
			
			<!-- 左图右文 -->
			<uni-list-item direction="row" clickable v-for="item in articleList" :key="item.id" :title="item.title"
			showArrow
				:note="item.userInfo.nickname + ' '+item.createTime"
				:to="'/packageA/pages/blog/detail/detail?id='+item.id">
				<template v-slot:header>
					<view class="uni-thumb">
						<image :src="item.cover" mode="aspectFill"></image>
					</view>
				</template>
			</uni-list-item>
			
		</uni-list>
		<uni-load-more v-if="loading || status === 'noMore' " :status="status" />
	</view>
</template>

<script>
	import {
		formatTime
	} from '/common/utils/util'
	export default {
		data() {
			return {
				content: "",
				articleList: [],
				loading: false,
				status: "more",
				page: 1,
			}
		},
		// 下拉刷新回调函数
		onPullDownRefresh() {
			this.init()
			uni.stopPullDownRefresh()
		},
		// 上拉加载回调函数
		onReachBottom() {
			this.getArticleList(true)
		},
		created() {
			this.init()
		},
		methods: {
			init() {
				// #ifndef MP-WEIXIN
				this.onSearch()
				// #endif
			},
			onSearch() {
				this.getArticleList()
			},
			async getArticleList(isScoll) {
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
					pageSize: 12,
					client: true,
					content,
					description: content,
					title: content
				}
				const res = await this.$api.post('/blog/article/list', params)
				const list = res.data.list.map((v) => {
					v.createTime = formatTime(new Date(v.createTime))
					return v
				})
				if (!list.length) {
					this.status = "noMore"
				} else {
					this.status = "more"
				}
				this.loading = false
				this.articleList = this.articleList.concat(list)
			},
		}
	}
</script>

<style lang="scss">
	.content {
		width: 100%;
		display: flex;
	}

	.list-picture {
		width: 100%;
		height: 145px;
	}

	.thumb-image {
		width: 100%;
		height: 100%;
	}
	.custom-note{
		color: #999;
		font-size: 24rpx;
	}
</style>
