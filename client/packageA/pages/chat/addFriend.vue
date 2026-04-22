<template>
 <pageConfig :title="title">
	<view>
		<uni-search-bar @confirm="onSearch" @cancel="onSearch" cancel-text="搜索" :focus="false" v-model="content"
			:placeholder="placeholder">
		</uni-search-bar>
		<view class="tip" v-if="!loading && addList.length === 0">
			<noData title="暂无搜索结果" :loading="false" />
		</view>
		<uni-list :border="true">
			<!-- 右侧带角标 clickable-->
			<uni-list-chat v-for="(item,index) in addList" :avatar-circle="true" :title="item.nickName||item.groupName"
				:avatar="item.avatar" :note="item.intro">
				<view class="chat-custom-right">
					<uni-icons
						v-if="!item._isAdded"
						type="plus-filled"
						color="#999"
						size="24"
						@click="clickUserItem(item)"
					></uni-icons>
					<uni-icons
						v-else
						type="checkbox-filled"
						color="#2BA471"
						size="24"
					></uni-icons>
				</view>
			</uni-list-chat>
		</uni-list>
		<uni-load-more v-if="loading || status === 'noMore' " :status="status" />
	</view>
</pageConfig>
</template>

<script>
	import noData from '@/components/noData/noData.vue'
	import { useUserStore } from '@/stores/user.js'

	export default {
		components: {
			noData,
		},
		data() {
			return {
				content: "",
				addList: [],
				loading: false,
				status: "more",
				page: 1,
				type: "",
                title:'',
				// 中文注释：用于“已添加”判断（好友/群）——渲染右侧按钮为勾选且禁点
				addedFriendIdSet: new Set(),
				addedGroupIdSet: new Set(),
			}
		},
		async onLoad(option) {
			this.type = option.type
			uni.setNavigationBarTitle({
				title: option.name
			})
            this.title = option.name
			await this.loadAddedRelations()
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
			showToast(msg) {
				if (typeof this?.$toast === 'function') {
					this.$toast(msg)
					return
				}
				uni.showToast({ title: msg, icon: 'none' })
			},
			async loadAddedRelations() {
				// 中文注释：后端会在好友关系表里同时记录“群聊会话关系”（groupId!=0）
				try {
					const res = await this.$apis.chat.friends({})
					const list = res?.data || []
					const fSet = new Set()
					const gSet = new Set()
					list.forEach((row) => {
						// 好友
						if (row?.friendId) {
							fSet.add(String(row.friendId))
						}
						// 群聊
						if (row?.groupId) {
							gSet.add(Number(row.groupId))
						}
					})
					this.addedFriendIdSet = fSet
					this.addedGroupIdSet = gSet
				} catch (e) {
					// 拉不到也不影响搜索与添加，只是无法禁用“已添加”状态
					this.addedFriendIdSet = new Set()
					this.addedGroupIdSet = new Set()
				}
			},
			// 统一计算列表项是否“已添加/已加入”
			isItemAdded(item) {
				const userStore = useUserStore()
				const userId = userStore.userId
				if (this.type === 'group') {
					const gid = Number(item?.id || 0)
					// 中文注释：自己创建的群也视为已加入（不可再次加入）
					if (String(item?.userId || '') === String(userId || '')) return true
					return gid > 0 && this.addedGroupIdSet.has(gid)
				}
				if (this.type === 'friend') {
					const fid = String(item?.userId || '')
					return !!fid && this.addedFriendIdSet.has(fid)
				}
				return false
			},
			withAddedFlag(list) {
				return (list || []).map((it) => ({
					...it,
					_isAdded: this.isItemAdded(it),
				}))
			},
			async onSearch() {
				const userStore = useUserStore()
				const userId = userStore.userId
				const keyword = String(this.content || '').trim()
				this.loading = true
				const params = {
					page: this.page,
					pageSize: 20,
				}
				let list = []
				try {
					let res = {}
					if (this.type === 'group') {
						params.groupName = keyword
						// 群搜索：使用接口层 groups
						res = await this.$apis.chat.groups(params)
						list = res?.data || []
					} else if (this.type === 'friend') {
						params.q = keyword
						// 用户搜索：使用接口层 users
						res = await this.$apis.chat.users(params)
						list = (res?.data?.list || []).filter(v => v.userId !== userId)
					}
					this.addList = this.withAddedFlag(list)
					// 中文注释：有关键词但结果为空时，提示用户“未搜索到”
					if (keyword && (!list || list.length === 0)) {
						this.showToast('未搜索到相关结果')
					}
				} finally {
					this.loading = false
				}
			},
			async clickUserItem(item) {
				// 中文注释：已添加/已加入的项不可点击，避免重复请求与后端报错提示
				if (item?._isAdded) return
				const userStore = useUserStore()
				const userId = userStore.userId
				const params = {
					userId: userId
				}
				if (this.type === 'group') {
					params.groupId = item.id
				} else if (this.type === 'friend') {
					params.friendId = item.userId
				}
				// 添加：由接口层统一处理 create friend/group join
				const res = await this.$apis.chat.addFriend(params)
				uni.showToast({
					title: res.msg,
				});
				// 中文注释：本地立刻标记为已添加，提升交互；并刷新“已添加集合”避免下次搜索状态不一致
				item._isAdded = true
				await this.loadAddedRelations()
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
    .uni-searchbar{
        background-color: $uni-white;
    }
	.tip {
		text-align: center;
		color: #999;
		font-size: 12px;
		padding: 60rpx;
	}
</style>
