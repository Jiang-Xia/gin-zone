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
	export default {
		data() {
			return {
				href: 'https://uniapp.dcloud.io/component/README?id=uniui'
			}
		},
			
		components:{
		},
		created() {
			this.$api.post("/base/users/{id}/info",{id:1111,a:222})
			this.$api.del("/base/users",{})
			this.$api.put("/base/users",{})
			this.$api.get("/base/users",{})
		},
		methods: {

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
