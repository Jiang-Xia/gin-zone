<template>
	<pageConfig :navbar="false">
		<view class="auth-page">
			<view class="header-bg-wrap">
				<view class="header-bg"></view>
				<image
					class="header-ornament"
					:src="$getImg('/packageA/static/login/banner-icon.png')"
					mode="aspectFit"
				/>
				<view class="header-text">
					<text class="title">Zone</text>
					<text class="subtitle">{{ cur ? '创建你的账号，开始聊天' : '欢迎回来，继续你的会话' }}</text>
				</view>
			</view>

			<view class="main-content">
				<view class="auth-card">
					<view class="segmented">
						<view
							class="segmented-item"
							:class="{ active: cur === 0 }"
							@click="cur = 0"
						>
							登录
						</view>
						<view
							class="segmented-item"
							:class="{ active: cur === 1 }"
							@click="cur = 1"
						>
							注册
						</view>
					</view>

					<view class="form-wrap">
						<view class="field-row">
							<t-icon t-class="field-prefix" name="user" size="22" color="#f00057" />
							<t-input
								v-model:value="form.userName"
								t-class="field-input-wrap"
								t-class-input="field-input"
								type="text"
								:maxlength="11"
								clearable
								placeholder="请输入用户名（至少 3 位）"
								:borderless="true"
							/>
						</view>

						<view class="field-row field-row--gap">
							<t-icon t-class="field-prefix" name="lock-on" size="22" color="#f00057" />
							<t-input
								v-model:value="form.password"
								t-class="field-input-wrap"
								t-class-input="field-input"
								:type="showPwd ? 'text' : 'password'"
								clearable
								placeholder="请输入密码（至少 6 位）"
								:borderless="true"
								@enter="confirm"
							/>
							<t-icon
								t-class="field-suffix"
								:name="showPwd ? 'eye-slash' : 'eye'"
								size="22"
								color="#f00057"
								@click="showPwd = !showPwd"
							/>
						</view>

						<t-button
							t-class="submit-btn"
							theme="primary"
							variant="base"
							block
							:disabled="!isValid"
							@click="confirm"
						>
							立即{{ cur ? '注册' : '登录' }}
						</t-button>

						<view class="helper-area">
							<view class="helper-row">
								<view></view>
								<text class="helper-link" @tap="forgotPwd">忘记密码？</text>
							</view>
							<text class="helper-meta">{{ nowTime }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</pageConfig>
</template>

<script>
	import {
		formatTime
	} from '@/common/utils/util'
	import { useUserStore } from '@/stores/user.js'
	import { useChatStore } from '@/stores/chat.js'
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
            cur: 0,
            nowTime: formatTime(new Date(), "-").slice(0, 10),
            form: {
                userName: "",
                password: ""
            },
            showPwd: false,
        }
    },
    computed: {
        isValid(){
            const u = this.form.userName?.trim()
            const p = this.form.password?.trim()
            return !!u && u.length >= 3 && !!p && p.length >= 6
        }
    },
    methods: {
            confirm() {
                if(!this.isValid){
                    this.$toast(this.cur ? '请输入有效的用户名和密码以注册' : '请输入有效的用户名和密码以登录')
                    return
                }
                if (this.cur === 0) {
                    this.login()
                } else {
                    this.register()
                }
            },
			getRandomAvatars() {
				return avatars[Math.round(Math.random() * avatars.length)]
			},
            async login() {
                try {
                    // 登录前：初始化加密会话密钥（common/signIn -> redis sessionId:sm4Key）
                    await this.$apis.auth.signIn()
                    uni.showLoading({
                        title: ''
                    })
                    // 登录：由接口层统一处理登录请求与 token 获取
                    const res = await this.$apis.auth.login({
                        ...this.form,
                    })
                    uni.hideLoading()
                    const userStore = useUserStore()
                    userStore.setToken(res.data.token)
                    // 拉取用户信息：成功后驱动聊天初始化
                    const res2 = await this.$apis.auth.getUserInfo()
                    userStore.setUserInfo(res2.data)
                    const chatStore = useChatStore()
                    chatStore.initChat(res2.data.userId)
                    this.$toast("登录成功");
                    setTimeout(() => {
                        uni.switchTab({
                            url: "/pages/chat/index"
                        })
                    }, 800)
                } catch (e) {
                    uni.hideLoading()
                    this.$toast('登录失败，请稍后重试')
                }
            },
            async register() {
                try {
                    // 注册前：初始化加密会话密钥（避免加密请求缺少 sm4Key）
                    await this.$apis.auth.signIn()
                    const {
                        userName,
                        password
                    } = this.form
                    const params = {
                        userName,
                        password,
                        avatar: this.getRandomAvatars(),
                        nickName: "用户" + userName,
                        intro: "这个人很懒，什么都没有留下。",
                    }
                    // 注册：由接口层统一处理注册请求
                    const res = await this.$apis.auth.register(params)
                    this.$toast("注册成功,快去登录吧!");
                    this.form = {
                        userName:"",
                        password:""
                    }
                    this.cur = 0
                } catch (e) {
                    this.$toast('注册失败，请稍后重试')
                }
            },
            forgotPwd(){
                this.$toast('请联系管理员重置密码')
            }
    }
}
</script>

<style lang="scss" scoped>
	.auth-page {
		min-height: 100vh;
		background: #fff;
	}

	.header-bg-wrap {
		position: relative;
		height: 520rpx;
		overflow: hidden;
	}

	.header-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, #ffe4cf 0%, #ffffff 82%);
	}

	.header-ornament {
		position: absolute;
		right: -40rpx;
		top: 110rpx;
		width: 460rpx;
		height: 300rpx;
		opacity: 0.95;
	}

	.header-text {
		position: absolute;
		left: 32rpx;
		right: 32rpx;
		top: 120rpx;
		display: flex;
		flex-direction: column;
		row-gap: 12rpx;
	}

	.title {
		font-size: 52rpx;
		font-weight: 700;
		color: #333;
		letter-spacing: 1rpx;
	}

	.subtitle {
		font-size: 26rpx;
		color: #666;
	}

	.main-content {
		position: relative;
		margin-top: -220rpx;
		padding: 0 32rpx 40rpx;
		box-sizing: border-box;
	}

	.auth-card {
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.72);
		box-shadow: 0px 1px 7px 5px rgba(186, 190, 197, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.45);
		backdrop-filter: blur(15px);
		padding: 28rpx;
	}

	.segmented {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12rpx;
		padding: 10rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.65);
		border: 1px solid rgba(0, 0, 0, 0.04);
	}

	.segmented-item {
		height: 68rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		color: #666;
	}

	.segmented-item.active {
		color: #f00057;
		background: rgba(240, 0, 87, 0.10);
	}

	.form-wrap {
		margin-top: 22rpx;
	}

	.field-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		width: 100%;
		border-radius: 999rpx;
		background: rgba(240, 0, 87, 0.06);
		padding: 0 24rpx;
		height: 92rpx;
		box-sizing: border-box;
	}

	.field-row--gap {
		margin-top: 32rpx;
	}


	.helper-area {
		margin-top: 22rpx;
	}

	.helper-row {
		margin-top: 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.helper-link {
		color: #f00057;
		font-size: 26rpx;
	}

	.helper-meta {
		margin-top: 32rpx;
		display: block;
		text-align: center;
		color: #999;
		font-size: 22rpx;
	}
	.auth-page {
		/* t-class* 挂到 TDesign 内部节点时，在 scoped 中需要 deep 才能命中 */
		:deep(.t-icon.field-prefix) {
			flex: none;
		}

		:deep(.t-input.field-input-wrap) {
			flex: 1;
			min-width: 0;
			background: transparent;
		}

		:deep(.t-input__input.field-input) {
			flex: 1;
			min-width: 0;
			background: transparent;
		}

		:deep(.t-icon.field-suffix) {
			flex: none;
		}

		:deep(.t-button.submit-btn) {
			margin-top: 32rpx;
			border-radius: 999rpx !important;
			overflow: hidden !important;
		}
	}
</style>

<style lang="scss">

</style>
