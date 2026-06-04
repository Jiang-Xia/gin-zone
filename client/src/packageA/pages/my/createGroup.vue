<template>
	<pageConfig :title="pageTitle">
		<view class="container">
			<uni-section v-if="isEditMode && ownerInfo && ownerInfo.userId" title="群主" type="line">
				<t-cell-group theme="card">
					<t-cell :title="ownerInfo.nickName || ownerInfo.userName || ownerInfo.userId"
					 :description="`用户ID：${ownerInfo.userId}`"
					 align="top"
					 :image="ownerInfo.avatar || defaultAvatar"
					 >
					</t-cell>
				</t-cell-group>
			</uni-section>

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
						<t-button theme="primary" variant="base" block :disabled="submitting" @click="submit">
							{{ submitting ? '提交中...' : (isEditMode ? '保存修改' : '提交') }}
						</t-button>
					</view>
				</view>
			</uni-section>

			<uni-section v-if="isEditMode" title="群成员管理" type="line">
				<view class="members-entry">
					<t-button theme="primary" variant="outline" block @click="goMembers">
						进入群成员管理
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
				defaultAvatar: this.$getImg('/static/images/user.png'),
				pageTitle: "创建群聊",
				// 编辑模式下需要传 groupId
				groupId: 0,
				// 群主信息（展示用）
				ownerInfo: {},
				submitting: false,
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
		computed: {
			isEditMode() {
				return Number(this.groupId || 0) > 0
			}
		},
		async onLoad(option) {
			this.groupId = Number(option?.groupId || 0)
			this.pageTitle = this.isEditMode ? "编辑群聊" : "创建群聊"
			if (this.isEditMode) {
				await this.loadGroupInfo()
			}
		},
		methods: {
			async loadGroupInfo() {
				try {
					const res = await this.$apis.chat.groupInfo(this.groupId)
					const g = res?.data || {}
					this.ownerInfo = g.ownerInfo || {}
					this.baseFormData = {
						avatar: g.avatar || "",
						groupName: g.groupName || "",
						intro: g.intro || "",
						notice: g.notice || "",
					}
					// console.log('baseFormData', this.baseFormData)
				} catch (e) {
					console.log('loadGroupInfo err', e)
				}
			},
			goMembers() {
				if (!this.isEditMode) return
				uni.navigateTo({
					url: `/packageA/pages/my/groupMembers?groupId=${this.groupId}`,
				})
			},
			async submit() {
				try {
					const validateResult = await this.$refs.valiForm.validate({
						showErrorMessage: true
					})
					if (validateResult !== true) return
					if (this.submitting) return
					this.submitting = true
					if (this.isEditMode) {
						// 修改群聊：复用同页编辑模式
						await this.$apis.chat.updateGroup(this.groupId, { ...this.baseFormData })
					} else {
						// 创建群聊：接口层负责拼装与请求入口
						await this.$apis.chat.createGroup({ ...this.baseFormData })
					}

					uni.showToast({
						title: this.isEditMode ? "保存成功" : "新增成功",
					});
					if (this.isEditMode) {
						uni.navigateBack()
					} else {
						uni.switchTab({
							url: "/pages/chat/index"
						})
					}
				} catch (err) {
					console.log('submit err', err);
				} finally {
					this.submitting = false
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
	.members-wrap {
		background-color: $uni-white;
	}
	.members-entry {
		background-color: $uni-white;
		padding: 24rpx 32rpx;
	}
	.tip {
		text-align: center;
		color: #999;
		font-size: 12px;
		padding: 40rpx 20rpx;
	}
</style>
