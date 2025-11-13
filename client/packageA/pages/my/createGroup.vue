<template>
 <pageConfig title="创建群聊">
	<view class="container">
		<uni-section title="群聊信息" type="line">
			<view class="form-wrap">
				<!-- 基础用法，不包含校验规则 -->
				<uni-forms ref="valiForm" :rules="rules" :modelValue="baseFormData">
					<uni-forms-item required name="avatar">
						<uni-file-picker limit="1" :del-icon="false" disable-preview :imageStyles="imageStyles"
							file-mediatype="image" @select="selectAvatar">
							<image class="avatar" v-if="baseFormData.avatar" :src="baseFormData.avatar"
								mode="scaleToFill"></image>
							<text v-show="!baseFormData.avatar">选择</text>
						</uni-file-picker>
					</uni-forms-item>
					<uni-forms-item label="群名称" required  name="groupName">
						<uni-easyinput type="groupName" v-model="baseFormData.groupName" placeholder="请输入群名称" />
					</uni-forms-item>
					<uni-forms-item label="群介绍">
						<uni-easyinput v-model="baseFormData.intro" placeholder="请输入群介绍" />
					</uni-forms-item>
					<uni-forms-item label="群公告">
						<uni-easyinput type="textarea" v-model="baseFormData.notice" placeholder="请输入群公告" />
					</uni-forms-item>
				</uni-forms>
				<button type="primary" size="default" @click="submit('valiForm')">提交</button>
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
				rules: {
					avatar: {
						rules: [{
							required: true,
							errorMessage: '群头像不能为空'
						}]
					},
					groupName: {
						rules: [{
							required: true,
							errorMessage: '群名称不能为空'
						}]
					}
				},
				imageStyles: {
					width: 64,
					height: 64,
					border: {
						radius: '50%'
					}
				},
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
				} else {
					return url
				}
			}
		},
		created() {},
		methods: {
			// 选择头像
			selectAvatar(imageRes) {
				imageRes.tempFilePaths.forEach((path, index) => {
					this.uploadFile(path)
				})
			},
			async uploadFile(file) {
				const res = await this.$api.upload(file)
				this.baseFormData.avatar = this.$fileUrl + res.data.url
			},
			async submit(ref) {
				const params = {
					...this.baseFormData
				}
				this.$refs[ref].validate().then(async (res2) => {
					const res = await this.$api.post('/mobile/chat/groups', params)
					uni.showToast({
						title: "新增成功",
					});
					uni.switchTab({
						url: "/pages/chat/index"
					})
				}).catch(err => {
					console.log('err', err);
				})
			}
		}
	}
</script>

<style lang="scss">
	.form-wrap {
		padding: 15px;
		background-color: $uni-white;

		.btn-wrap {
			&::after {
				display: none;
			}

			background: none;
			border: none;
			width: auto;
			margin: 0;
		}

		.avatar {
			height: 128rpx;
			width: 128rpx;
			border-radius: 50%;
		}

		.uni-file-picker {
			width: 128rpx;
			margin: auto;
		}
	}

	.segmented-control {
		margin-bottom: 15px;
	}

	.button-group {
		margin-top: 15px;
		display: flex;
		justify-content: space-around;

		button {
			width: 200rpx;
		}
	}

	.form-item {
		display: flex;
		align-items: center;
	}

	.button {
		display: flex;
		align-items: center;
		height: 35px;
		margin-left: 10px;
	}
</style>
