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
	const avatars = [
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlzz-头像_天秤座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xk9-头像_天蝎座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlez-头像_白羊座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xhh-头像_双子座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodluq-头像_巨蟹座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlph-头像_狮子座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xep-头像_处女座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xbx-头像_水瓶座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9x95-头像_摩羯座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlk8-头像_双鱼座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodl9q-头像_金牛座.png',
		'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9x6d-头像_射手座.png'
	]
	export default {
		data() {
			return {
				groupIcon,
				userIcon,
				userList: []
			}
		},
		components: {},
		onPullDownRefresh() {
			this.init()
		},
		onLoad() {
			this.init()
		},
		methods: {
			init() {
				const userId = getApp().globalData.userInfo.userId
				this.$api.get("/mobile/chat/friends", {
					userId
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
