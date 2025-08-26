<template>
    <pageConfig title="聊天" left-icon="plus" @clickLeft="clickLeft">
        <view class="container">
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
        				v-for="(item,index) in userList" :key="(item.userId||item.groupId)+index">
        				<uni-list-chat :avatar-circle="true" :title="item.name" :avatar="item.avatar" :note="item.note"
        					:time="item.time" :badge-text="item.noReadMsgCount" clickable @click="clickUserItem(item)">
        				</uni-list-chat>
        			</uni-swipe-action-item>
        		</uni-swipe-action>
        	</uni-list>
        </view>
        <tabbar :tabBarShow="2"/>
    </pageConfig>
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
				defaultList: [
					// {
					// 	id: "001",
					// 	name: "知心小夏",
					// 	avatar: oneChat,
					// 	note: '对话聊天机器人小夏'
					// },
					// {
					// 	id: "002",
					// 	name: "可爱大白",
					// 	avatar: sevenChat,
					// 	note: '可可爱爱机器人大白'
					// },
					// {
					// 	id: "003",
					// 	name: "憨逼小木",
					// 	avatar: sixChat,
					// 	note: '憨憨机器人小木'
					// },
				],
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
            uni.hideTabBar()
			this.init()
		},
        onReady() {
        },
		onNavigationBarButtonTap() {
			this.clickLeft()
		},
		methods: {
			init() {
				const userId = getApp().globalData.userInfo.userId
				console.log({
					userId
				})
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
					this.initFriend()
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
					url: "/packageA/pages/chat/chatDetail?name=" + item.name + str
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
								url: "/packageA/pages/chat/addFriend?name=添加好友&type=friend"
							})
						} else if (res.tapIndex === 1) {
							uni.navigateTo({
								url: "/packageA/pages/chat/addFriend?name=添加群&type=group"
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
					url: `/packageA/pages/chat/chatAiDetail?id=${item.id}&name=${item.name}&avatar=${item.avatar}`
				})
			},
			bindClick() {

			},
			initFriend(){
				this.socketTask = getApp().globalData.socketTask
				this.socketTask.onMessage((res) => {
					if (res.data) {
						const revObj = JSON.parse(res.data)
						const cb = (v)=>{
							v.note = revObj.content
							v.time = formatDate()
							v.noReadMsgCount++
							if (v.msgType === 2) {
								v.note = "[图片]"
							} else if (v.msgType === 3) {
								v.note = "[视频]"
							}
						}
						this.userList = this.userList.map(v=>{
							if(revObj.groupId&&revObj.groupId===v.groupId){
								cb(v)
							}else if(revObj.receiverId&&revObj.receiverId===v.userId){
								cb(v)
							}
							return v
						})
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		font-size: 14px;
	}
</style>