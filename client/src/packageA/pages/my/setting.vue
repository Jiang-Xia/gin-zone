<template>
<pageConfig title="个人资料">
	<view class="container">
		<uni-section title="个人信息" type="line">
			<view class="form-wrap">
				<!-- 基础用法，不包含校验规则 -->
				<uni-forms ref="baseForm" :modelValue="baseFormData">
					<uni-forms-item>
						<!-- #ifdef MP-WEIXIN -->
						<button class="btn-wrap" open-type="chooseAvatar" @chooseavatar="onChooseavatar">
							<image class="avatar" :src="avatar" mode="scaleToFill"></image>
						</button>
						<!-- #endif -->
						<!-- #ifdef H5||APP-PLUS -->
						<uni-file-picker limit="1" :del-icon="false" disable-preview :imageStyles="imageStyles"
							file-mediatype="image" @select="selectAvatar">
							<image class="avatar" :src="avatar" mode="scaleToFill"></image>
						</uni-file-picker>
						<!-- #endif -->
					</uni-forms-item>
					<uni-forms-item label="昵称" required>
						<uni-easyinput type="nickname" v-model="baseFormData.nickName" placeholder="请输入昵称" />
					</uni-forms-item>
					<uni-forms-item label="邮箱">
						<uni-easyinput v-model="baseFormData.email" placeholder="请输入邮箱" />
					</uni-forms-item>
					<uni-forms-item label="性别">
						<uni-data-checkbox v-model="baseFormData.gender" :localdata="sexs" />
					</uni-forms-item>
					<uni-forms-item label="自我介绍" label-width="75">
						<uni-easyinput type="textarea" v-model="baseFormData.intro" placeholder="请输入自我介绍" />
					</uni-forms-item>
				</uni-forms>
					<button type="primary" size="default" @click="submit">提交</button>
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
				imageStyles: {
					width: 64,
					height: 64,
					border: {
						radius: '50%'
					}
				},
				// 单选数据源
				sexs: [{
					text: '男',
					value: 0
				}, {
					text: '女',
					value: 1
				}],
			}
		},
		computed: {
			userInfo() {
				return getApp().globalData.userInfo
			},
			avatar() {
				const url = this.baseFormData.avatar||''
				if (url.indexOf('http') === -1) {
					return this.$fileUrl + url
				} else {
					return url
				}
			}
		},
		created() {
			for (let key in this.baseFormData) {
				this.baseFormData[key] = this.userInfo[key]
			}
		},
		methods: {
			// 选择头像
			async onChooseavatar(e) {
				const {
					avatarUrl
				} = e.detail
				this.uploadFile(avatarUrl)
			},
			selectAvatar(imageRes) {
				imageRes.tempFilePaths.forEach((path, index) => {
					this.uploadFile(path)
				})
			},
			async uploadFile(file) {
				const res = await this.$api.upload(file)
				this.baseFormData.avatar = this.$fileUrl+res.data.url
			},
			async submit() {
				const params = {
					id:this.userInfo.id,
					...this.baseFormData
				}
				// console.log({...params})
				const res = await this.$api.patch('/base/users/{id}',params)
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

<style lang="scss">
	.form-wrap {
		padding: 15px;
		background-color: #fff;

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
