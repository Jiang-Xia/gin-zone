<template>
	<pageConfig title="创建群聊">
		<view class="container">
			<uni-section title="群聊信息" type="line">
				<view class="form-wrap">
					<t-form ref="valiForm" :data="baseFormData" :rules="rules" label-align="left">
						<t-form-item name="avatar">
							<!-- 头像上传 -->
							<!-- 复用统一上传组件：输出上传后 URL -->
							<caUpload v-model:value="baseFormData.avatar" type="photo" output="url" scene="avatar" />
						</t-form-item>

						<t-form-item label="群名称" name="groupName">
							<t-input
								v-model:value="baseFormData.groupName"
								type="text"
								placeholder="请输入群名称"
								clearable
								borderless
							/>
						</t-form-item>

						<t-form-item label="群介绍" name="intro">
							<t-input
								v-model:value="baseFormData.intro"
								type="text"
								placeholder="请输入群介绍"
								clearable
								borderless
							/>
						</t-form-item>

						<t-form-item label="群公告" name="notice">
							<t-textarea
								v-model:value="baseFormData.notice"
								placeholder="请输入群公告"
								autosize
								borderless
								indicator
								:maxlength="500"
								style="width: 100%;"
							/>
						</t-form-item>
					</t-form>

					<view class="submit-btn">
						<t-button theme="primary" variant="base" block @click="submit">
							提交
						</t-button>
					</view>
				</view>
			</uni-section>
		</view>
	</pageConfig>
</template>

<script>
	export default {
		data() {
			return {
				// 基础表单数据
				baseFormData: {
					avatar: "",
					groupName: '',
					intro: '',
					notice: ""
				},
				// t-form 规则：字段名 -> 校验规则数组
				rules: {
					avatar: [{
						required: true,
						message: '群头像不能为空'
					}],
					groupName: [{
						required: true,
						message: '群名称不能为空'
					}]
				},
				// 兼容：历史字段保留，不再使用（头像上传已统一走 caUpload）
				uploadFiles: []
			}
		},
		methods: {
			async submit() {
				try {
					const validateResult = await this.$refs.valiForm.validate({
						showErrorMessage: true
					})
					if (validateResult !== true) return

					// 创建群聊：接口层负责拼装与请求入口
					await this.$apis.chat.createGroup({ ...this.baseFormData })

					uni.showToast({
						title: "新增成功",
					});
					uni.switchTab({
						url: "/pages/chat/index"
					})
				} catch (err) {
					console.log('submit err', err);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		margin-top: 16rpx;
	}
	.form-wrap {
		// padding-top: 24rpx;
		background-color: $uni-white;
	}

	.submit-btn {
		padding: 32rpx;
	}
</style>
