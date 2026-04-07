<template>
	<pageConfig title="个人资料">
		<view class="container">
			<uni-section title="个人信息" type="line">
				<view class="form-wrap">
					<t-cell-group>
						<t-cell title="头像">
							<template #note>
								<!-- #ifdef MP-WEIXIN -->
								<button class="btn-wrap" open-type="chooseAvatar" @chooseavatar="onChooseavatar">
									<image class="avatar" :src="avatar" mode="scaleToFill"></image>
								</button>
								<!-- #endif -->

								<!-- #ifdef H5||APP-PLUS -->
								<view class="avatar-upload">
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
								</view>
								<!-- #endif -->
							</template>
						</t-cell>

						<caInput v-model:value="baseFormData.nickName" label="昵称" required type="nickname" placeholder="请输入昵称" />

						<caInput v-model:value="baseFormData.email" label="邮箱" type="text" placeholder="请输入邮箱" />

						<caRadio v-model:value="baseFormData.gender" label="性别" :options="sexs" />

						<t-cell title="自我介绍" :bordered="false" class="intro-cell">
							<template #note>
								<view style="width: 70%; margin-left: auto;">
									<t-textarea
										v-model:value="baseFormData.intro"
										placeholder="请输入自我介绍"
										autosize
										indicator
										:maxlength="50"
										style="width: 100%;"
									/>
								</view>
							</template>
						</t-cell>
					</t-cell-group>

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
					nickName: '',
					intro: '',
					gender: 1,
					email: ""
				},
				// 单选数据源（男/女）
				sexs: [{
					label: '男',
					value: 1,
				}, {
					label: '女',
					value: 0,
				}],
				// t-upload 受控文件列表（单张头像）
				uploadFiles: []
			}
		},
		computed: {
			userInfo() {
				return getApp().globalData.userInfo
			},
			avatar() {
				const url = this.baseFormData.avatar || ''
				if (url.indexOf('http') === -1) {
					return this.$fileUrl + url
				}
				return url
			}
		},
		created() {
			for (let key in this.baseFormData) {
				this.baseFormData[key] = this.userInfo[key]
			}
			// H5/APP：初始化 t-upload 展示
			if (this.avatar) {
				this.uploadFiles = [{
					url: this.avatar,
					thumb: this.avatar,
					type: 'image',
					percent: 100,
					status: 'done'
				}]
			}
		},
		methods: {
			// 选择头像（小程序：chooseAvatar）
			async onChooseavatar(e) {
				const {
					avatarUrl
				} = e.detail
				await this.uploadFile(avatarUrl)
			},
			async uploadFile(file) {
				const res = await this.$api.upload(file)
				const finalUrl = this.$fileUrl + res.data.url
				this.baseFormData.avatar = finalUrl
				// 同步 t-upload 展示（H5/APP）
				this.uploadFiles = [{
					url: finalUrl,
					thumb: finalUrl,
					type: 'image',
					percent: 100,
					status: 'done'
				}]
			},
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
				const params = {
					id: this.userInfo.id,
					...this.baseFormData
				}
				// 更新个人资料：走接口层避免散落 URL
				await this.$apis.auth.updateUser(this.userInfo.id, params)
				uni.showToast({
					title: "修改成功",
				});
				uni.switchTab({
					url: "/pages/my/index"
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-top: 24rpx;
		.uni-section{
			border-radius: 8rpx;
		}
		.uni-section__content{
			padding: 32rpx;
		}
	}
	.form-wrap {
		background-color: $uni-white;
	}

	.btn-wrap {
		&::after {
			display: none;
		}

		background: none;
		border: none;
		width: auto;
		margin: 0;
		padding: 0;
	}

	.avatar {
		height: 128rpx;
		width: 128rpx;
		border-radius: 50%;
	}

	.avatar-upload {
		display: flex;
		justify-content: center;
	}

	/* 覆盖 t-cell 内部布局：label 30%，note 70%（仅自我介绍这一行） */
	:deep(.intro-cell .t-cell__title) {
		flex: 0 0 30%;
		max-width: 30%;
	}

	:deep(.intro-cell .t-cell__note) {
		flex: 0 0 70%;
		max-width: 70%;
	}

	:deep(.intro-cell .t-cell__note) > view {
		width: 100% !important;
		margin-left: 0 !important;
	}

	.submit-btn {
		padding: 32rpx;
	}
</style>
