<template>
	<view>
		<form class="login-wrap" @submit="formSubmit">
			<view class="uni-form-item uni-column">
				<view class="title">input</view>
				<input class="uni-input" name="input" placeholder="这是一个输入框" />
			</view>
			<view class="uni-btn-v">
				<button form-type="submit">Submit</button>
			</view>
		</form>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		},
		methods: {
			/* h5和app端 登录表单 */

			formSubmit() {}
		}
	}
</script>

<style lang="scss">

</style>
