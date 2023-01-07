<template>
	<view class="container">
		<uni-nav-bar backgroundColor="#f8f8f8" left-icon="plus" :border="true" :shadow="false" fixed statusBar
			title="聊天" @clickLeft="clickLeft" />
		<uni-list :border="true">
			<!-- 右侧带角标 -->
			<uni-list-chat v-for="(item,index) in userList" :avatar-circle="true" :title="item.name"
				:avatar="item.avatar" :note="item.note" :time="item.time" :badge-text="item.noReadMsgCount" clickable
				@click="clickUserItem(item)">
			</uni-list-chat>
		</uni-list>
	</view>
</template>

<script>
	import groupIcon from "../../static/images/group.png"
	import userIcon from "../../static/images/user.png"
	import {
		formatDate
	} from '../../common/utils/util.js';
	export default {
		data() {
			return {
				groupIcon,
				userIcon,
				userList: [],
			}
		},
		components: {},
		onPullDownRefresh() {
			this.init()
		},
		onShow() {
			this.init()
		},
		methods: {
			init() {
				const userId = getApp().globalData.userInfo.userId
				if(!userId){
					this.userList = []
					return
				}
				this.$api.get("/mobile/chat/friends", {
					userId: userId
				}).then(res => {
					uni.stopPullDownRefresh()
					this.userList = res.data.map((v, i) => {
						v.avatar = v.groupId ? groupIcon : v.avatar || userIcon
						v.name = v.nickName || v.groupName
						v.time = formatDate(v.lastInfoTime)
						v.note = v.lastMsg
						if(v.msgType===2){
							v.note = "[图片]"
						}else if(v.msgType===3){
							v.note = "[视频]"
						}
						return v
					})
				}).catch(() => {
					uni.stopPullDownRefresh()
				})
			},
			clickUserItem(item) {
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
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
			clickLeft() {
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
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
