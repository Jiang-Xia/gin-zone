<template>
	<pageConfig title="创建群聊">
		<view class="container">
			<uni-section title="群聊信息" type="line">
				<view class="form-wrap">
					<t-form ref="valiForm" :data="baseFormData" :rules="rules">
						<t-form-item name="avatar">
							<!-- 头像上传 -->
							<t-upload
								v-model:files="uploadFiles"
								:max="1"
								:media-type="['image']"
								:remove-btn="false"
								:preview="false"
								:grid-config="{ column: 1, width: 128, height: 128 }"
								:image-props="{ mode: 'aspectFill', shape: 'round' }"
								:request-method="uploadRequestMethod"
								@success="onUploadSuccess"
							/>
						</t-form-item>

						<t-form-item label="群名称" name="groupName">
							<t-input
								v-model:value="baseFormData.groupName"
								type="text"
								placeholder="请输入群名称"
								clearable
							/>
						</t-form-item>

						<t-form-item label="群介绍" name="intro">
							<t-input
								v-model:value="baseFormData.intro"
								type="text"
								placeholder="请输入群介绍"
								clearable
							/>
						</t-form-item>

						<t-form-item label="群公告" name="notice">
							<t-textarea
								v-model:value="baseFormData.notice"
								placeholder="请输入群公告"
								autosize
							/>
						</t-form-item>
					</t-form>

					<t-button theme="primary" variant="base" block class="submit-btn" @click="submit">
						提交
					</t-button>
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
				// t-upload 受控文件列表（单张头像）
				uploadFiles: []
			}
		},
		methods: {
			/**
			 * t-upload 的自定义上传方法。
			 * @param {Array} files 选中的文件列表，包含本地临时路径（url）
			 */
			async uploadRequestMethod(files) {
				await Promise.all((files || []).map(async (file) => {
					if (!file?.url) return
					const res = await this.$api.upload(file.url)
					const finalUrl = this.$fileUrl + res.data.url
					file.url = finalUrl
					file.thumb = finalUrl
					file.status = 'done'
					file.percent = 100
				}))
			},
			onUploadSuccess(e) {
				const files = e?.detail?.files || e?.files || []
				this.uploadFiles = files
				this.baseFormData.avatar = files?.[0]?.url || ''
			},
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

<style lang="scss">
	.form-wrap {
		padding: 15px;
		background-color: $uni-white;
	}

	.submit-btn {
		margin-top: 20rpx;
	}
</style>
