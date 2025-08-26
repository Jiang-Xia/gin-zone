<template>
 <pageConfig :title="title">
	<view>
		<uni-search-bar @confirm="onSearch" @cancel="onSearch" cancel-text="搜索" :focus="false" v-model="content"
			:placeholder="placeholder">
		</uni-search-bar>
		<uni-list :border="true">
			<!-- 右侧带角标 clickable-->
			<uni-list-chat v-for="(item,index) in addList" :avatar-circle="true" :title="item.nickName||item.groupName"
				:avatar="item.avatar" :note="item.intro">
				<view class="chat-custom-right">
					<uni-icons type="plus-filled" color="#999" size="24" @click="clickUserItem(item)"></uni-icons>
				</view>
			</uni-list-chat>
		</uni-list>
		<uni-load-more v-if="loading || status === 'noMore' " :status="status" />
	</view>
</pageConfig>
</template>

<script>
	export default {
		data() {
			return {
				content: "",
				addList: [],
				loading: false,
				status: "more",
				page: 1,
				type: "",
                title:''
			}
		},
		onLoad(option) {
			this.type = option.type
			uni.setNavigationBarTitle({
				title: option.name
			})
            this.title = option.name
		},
		onPullDownRefresh() {
			this.onSearch()
			uni.stopPullDownRefresh()
		},
		computed: {
			placeholder() {
				return this.type === 'group' ? '输入群名搜索群' : "输入用户名或昵称搜索好友"
			}
		},
		methods: {
			async onSearch() {
				const userId = getApp().globalData.userInfo.userId
				const params = {
					page: this.page,
					pageSize: 20,
				}
				let res = {}
				if (this.type === 'group') {
					params.groupName = this.content
					res = await this.$api.get('/mobile/chat/groups', params)
					this.addList = res.data
				} else if (this.type === 'friend') {
					params.q = this.content
					res = await this.$api.get('/base/users', params)
					this.addList = res.data.list.filter(v=>v.userId!==userId)
				}
			},
			async clickUserItem(item) {
				const userId = getApp().globalData.userInfo.userId
				const params = {
					userId: userId
				}
				if (this.type === 'group') {
					params.groupId = item.id
				} else if (this.type === 'friend') {
					params.friendId = item.userId
				}
				const res = await this.$api.post('/mobile/chat/friends', params)
				uni.showToast({
					title: res.msg,
				});
			}
		}
	}
</script>

<style lang="scss">
	.chat-custom-right {
		display: flex;
		align-items: center;
		height: 100%;
	}
</style>
