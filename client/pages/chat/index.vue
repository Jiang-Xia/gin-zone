<template>
	<view class="container">
		<uni-list :border="true">
			<!-- 右侧带角标 -->
			<uni-list-chat v-for="(item,index) in userList" :avatar-circle="true" :title="item.name"
				:avatar="avatars[index]" :note="item.name" :time="item.time" :badge-text="item.badge" clickable
				@click="clickUserItem(item)">
			</uni-list-chat>
		</uni-list>
	</view>
</template>

<script>
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
				avatars,
				userList: [{
					name: "机器人001",
					note: "主人你好",
					badge: 1,
					time: '2020-12-26 20:20'
				}, {
					name: "机器人002",
					note: "咯咯咯",
					badge: 2,
					time: '2020-12-26 20:20'
				}, ]
			}
		},
		components: {},
		methods: {
			clickUserItem(item) {
				uni.navigateTo({
					url: "/pages/chat/chatDetail?name="+item.name+"&id="+item.id
				})
			},
		}
	}
</script>

<style>
	.container {
		font-size: 14px;
	}
</style>
