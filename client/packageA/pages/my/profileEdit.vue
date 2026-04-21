<template>
	<pageConfig title="个人资料">
		<view class="container profile-edit-page">
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
									<!-- 复用统一上传组件：H5/APP 输出上传后 URL -->
									<caUpload v-model:value="baseFormData.avatar" type="photo" output="url" scene="avatar" />
								</view>
								<!-- #endif -->
							</template>
						</t-cell>

						<caInput v-model:value="baseFormData.nickName" label="昵称" required type="nickname" placeholder="请输入昵称" />

						<caInput v-model:value="baseFormData.email" label="邮箱" type="text" placeholder="请输入邮箱" />

						<caRadio v-model:value="baseFormData.gender" label="性别" :options="sexs" />

						<t-cell
							title="自我介绍"
							:bordered="false"
							t-class-center="profile-edit-intro__title-col"
							t-class-note="profile-edit-intro__note-col"
						>
							<template #note>
								<view class="profile-edit-intro__note-inner">
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
						<!-- <t-cell
							title="身份证"
							:bordered="false"
							t-class-center="profile-edit-intro__title-col"
							t-class-note="profile-edit-intro__note-col"
						>
							<template #note>
								<caUpload v-model:value="baseFormData.avatar" type="nation" output="url" />
							</template>
						</t-cell> -->
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
	import { useUserStore } from '@/stores/user.js'

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
				// 兼容：历史字段保留，不再使用（头像上传已统一走 caUpload）
				uploadFiles: []
			}
		},
		computed: {
			userInfo() {
				const userStore = useUserStore()
				return userStore.userInfo
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
			},
			async submit() {
				const userStore = useUserStore()
				const params = {
					id: this.userInfo.id,
					...this.baseFormData
				}
				// 更新个人资料：走接口层避免散落 URL
				await this.$apis.auth.updateUser(this.userInfo.id, params)
				// 更新本地 userInfo，避免返回“我的”页仍展示旧资料
				userStore.setData({ ...this.baseFormData })
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
		margin-top: 16rpx;
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

	/* note 插槽内节点仍在当前页编译，可用 scoped */
	.profile-edit-intro__note-inner {
		width: 100%;
		margin-left: 0;
	}

	/* t-cell 的 t-class-center / t-class-note：用 :deep 选自定义类名，单文件 scoped 即可穿透到组件内部 */
	.profile-edit-page {
		:deep(.profile-edit-intro__title-col) {
			flex: 0 0 30%;
			max-width: 30%;
		}

		:deep(.profile-edit-intro__note-col) {
			flex: 0 0 70%;
			max-width: 70%;
		}
	}

	.submit-btn {
		padding: 32rpx;
	}
</style>
