<template>
	<view class="container">
		<!--#ifdef MP-WEIXIN  -->
		<uni-nav-bar backgroundColor="#f8f8f8" left-icon="plus" :border="true" :shadow="false" fixed statusBar
			title="聊天" @clickLeft="clickLeft" />
		<!--#endif -->
		<uni-list :border="true">
			<!-- 默认列表 -->
			<uni-list-chat v-for="(item,index) in defaultList" :key="index" :avatar-circle="true" :title="item.name"
				:avatar="item.avatar" :note="item.note" :time="item.time" clickable @click="clickDefaultItem(item)">
			</uni-list-chat>
			<!-- 右侧带角标 -->
			<!-- <uni-list-chat v-for="(item,index) in userList" :key="index" :avatar-circle="true" :title="item.name"
				:avatar="item.avatar" :note="item.note" :time="item.time" :badge-text="item.noReadMsgCount" clickable
				@click="clickUserItem(item)">
			</uni-list-chat> -->
			<uni-swipe-action>
				<uni-swipe-action-item :threshold="50" :right-options="options2" @click="bindClick"
					v-for="(item,index) in userList" :key="index">
					<uni-list-chat :avatar-circle="true" :title="item.name" :avatar="item.avatar" :note="item.note"
						:time="item.time" :badge-text="item.noReadMsgCount" clickable @click="clickUserItem(item)">
					</uni-list-chat>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</uni-list>
	</view>
</template>

<script>
	import groupIcon from "../../static/images/group.png"
	import userIcon from "../../static/images/user.png"
	import oneChat from "../../static/images/chat/avatar/one.png"
	import {
		formatDate
	} from '../../common/utils/util.js';
	export default {
		data() {
			return {
				groupIcon,
				userIcon,
				defaultList: [{
					name: "知心小夏",
					avatar: oneChat,
					note: '对话聊天机器人小夏'
				}],
				userList: [],
				options2: [{
						text: '取消',
						style: {
							backgroundColor: '#007aff'
						}
					},
					// {
					// 	text: '删除',
					// 	style: {
					// 		backgroundColor: '#F56C6C'
					// 	}
					// }
				],
			}
		},
		components: {},
		onPullDownRefresh() {
			this.init()
		},
		onShow() {
			this.init()
		},
		onNavigationBarButtonTap() {
			this.clickLeft()
		},
		methods: {
			init() {
				const userId = getApp().globalData.userInfo.userId
				console.log({userId})
				if (!userId) {
					this.userList = []
					return
				}
				this.$api.get("/mobile/chat/friends", {
					userId: userId
				}).then(res => {
					uni.stopPullDownRefresh()
					this.userList = res.data.map((v, i) => {
						v.avatar = v.userInfo.avatar || userIcon
						if (v.chatGroup.groupId) {
							v.avatar = groupIcon
						}
						v.name = v.userInfo.nickName || v.chatGroup.groupName
						v.time = formatDate(v.lastInfoTime)
						v.note = v.lastMsg
						if (v.msgType === 2) {
							v.note = "[图片]"
						} else if (v.msgType === 3) {
							v.note = "[视频]"
						}
						return v
					})
				}).finally(() => {

					// console.log("======================================", "stopPullDownRefresh")
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
			},
			// 点击默认功能列表
			clickDefaultItem(item) {
				uni.navigateTo({
					url: `/pages/chat/chatAiDetail?name=${item.name}&avatar=${oneChat}`
				})
			},
			bindClick() {

			}
		}
	}
</script>

<style lang="scss">
	.container {
		font-size: 14px;
	}
</style>
