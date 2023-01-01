<template>
	<view class="container">
		<uni-nav-bar backgroundColor="#f8f8f8" left-icon="left" right-icon="plus" :border="false" shadow="true"
			title="聊天" @clickRight="clickRight" />
		<uni-list :border="true">
			<!-- 右侧带角标 -->
			<uni-list-chat v-for="(item,index) in userList" :avatar-circle="true" :title="item.name"
				:avatar="item.avatar" :note="item.name" :time="item.time" :badge-text="item.badge" clickable
				@click="clickUserItem(item)">
			</uni-list-chat>
		</uni-list>
	</view>
</template>

<script>
	import groupIcon from "../../static/images/group.png"
	import userIcon from "../../static/images/user.png"
	export default {
		data() {
			return {
				groupIcon,
				userIcon,
				userList: [],
				userId:""
			}
		},
		components: {},
		onPullDownRefresh() {
			this.init()
		},
		onLoad() {
			this.userId = getApp().globalData.userInfo.userId
			this.init()
		},
		methods: {
			init() {
				this.$api.get("/mobile/chat/friends", {
					userId:this.userId
				}).then(res => {
					uni.stopPullDownRefresh()
					this.userList = res.data.map((v, i) => {
						v.avatar = v.groupId ? groupIcon : v.avatar || userIcon
						v.name = v.nickName || v.groupName
						v.badge = i + 1
						v.note = "你好"
						v.time = '2020-12-26 20:20'
						return v
					})
				}).catch(() => {
					uni.stopPullDownRefresh()
				})
			},
			clickUserItem(item) {
				if(!this.userId){
					uni.showModal({title:"请先登录！"})
					return
				}
				let str = ''
				if (item.groupId) {
					str = "&groupId=" + item.groupId
				} else {
					str = "&friendId=" + item.friendId
				}
				uni.navigateTo({
					url: "/pages/chat/chatDetail?name=" + item.name + str
				})
			},
			clickRight() {
				if(!this.userId){
					uni.showModal({title:"请先登录！"})
					return
				}
				uni.showActionSheet({
					itemList: ['添加好友', '加入群聊'],
					success: (res) => {
						if (res.tapIndex === 0) {
							uni.navigateTo({
								url: "/pages/chat/addFriend?name=添加好友&type=friend"
							})
						} else if (res.tapIndex === 1) {
							uni.navigateTo({
								url: "/pages/chat/addFriend?name=添加群&type=group"
							})
						}
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				})
			}
		}
	}
</script>

<style>
	.container {
		font-size: 14px;
	}
</style>
