<template>
	<pageConfig title="群成员管理">
		<view class="container">
			<uni-section title="群成员" type="line">
				<view v-if="loading" class="tip">加载中...</view>
				<view v-else-if="!members.length" class="tip">暂无群成员</view>
				<t-cell-group v-else>
					<t-cell
						v-for="m in members"
						:key="`${m.groupId}-${m.userId}`"
						:title="m.userInfo?.nickName || m.userInfo?.userName || m.userId"
						:note="`${m.userInfo?.userName ? ' @' + m.userInfo.userName : ''}`"
						:description="`${m.userId}}`"
						:bordered="true"
						:image="m.userInfo?.avatar || defaultAvatar"
					>
						<template #right-icon>
							<t-button
								size="small"
								theme="danger"
								variant="text"
								:disabled="deletingKey === `${m.groupId}-${m.userId}`"
								@click.stop="confirmRemove(m)"
							>
								删除
							</t-button>
						</template>
					</t-cell>
				</t-cell-group>
			</uni-section>
		</view>
	</pageConfig>
</template>

<script>
	export default {
		data() {
			return {
				defaultAvatar: this.$getImg('/static/images/user.png'),
				groupId: 0,
				loading: false,
				deletingKey: '',
				members: [],
			}
		},
		onLoad(option) {
			// 群成员管理需要 groupId 参数
			this.groupId = Number(option?.groupId || 0)
		},
		onShow() {
			this.loadMembers()
		},
		methods: {
			async loadMembers() {
				if (!this.groupId) {
					this.members = []
					return
				}
				this.loading = true
				try {
					const res = await this.$apis.chat.groupMembers(this.groupId)
					this.members = res?.data || []
				} catch (e) {
					this.members = []
				} finally {
					this.loading = false
				}
			},
			confirmRemove(m) {
				if (!m?.userId) return
				uni.showModal({
					title: '确认删除',
					content: '确认删除该群成员吗？',
					success: (res) => {
						if (res.confirm) {
							this.removeMember(m)
						}
					},
				})
			},
			async removeMember(m) {
				if (!this.groupId) return
				const key = `${m.groupId}-${m.userId}`
				if (this.deletingKey) return
				try {
					this.deletingKey = key
					await this.$apis.chat.removeGroupMember(this.groupId, m.userId)
					this.$toast({ title: '删除成功', icon: 'success' })
					await this.loadMembers()
				} catch (e) {
					// 错误提示由请求层统一处理；这里做兜底避免静默失败
					this.$toast({ title: '删除失败', icon: 'none' })
				} finally {
					this.deletingKey = ''
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.container {
		margin-top: 16rpx;
	}
	.tip {
		text-align: center;
		color: #999;
		font-size: 12px;
		padding: 40rpx 20rpx;
	}
</style>

