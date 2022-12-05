<template>
	<!-- <c-navbar bgColor="bg-gradual-blue" :isBack="true">
	  <block slot="backText">返回</block>
	  <block slot="content">导航栏</block>
	</c-navbar> -->
	<view class="container">
		blog
	</view>
</template>

<script>
	import { formatTime } from '/common/utils/util'
	export default {
		data() {
			return {
				articleList: []
			}
		},
			
		components:{
		},
		created() {
			this.$api.get('/base/users', {})
			this.$api.get('/blog/article/info', {id:40})
			this.getArticleList()
		},
		methods: {
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
				this.articleList = []
			},
			goDetail(e) {
				const id = e.currentTarget.id
				uni.navigateTo({
					url: "/pages/detail/detail?id=" + id,
				})
			},
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
