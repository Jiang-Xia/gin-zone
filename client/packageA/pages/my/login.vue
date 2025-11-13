<template>
<pageConfig :navbar="false">
	<view class="container">
		<view class="bg bg-color-base margin-b20"></view>

		<view class="tab z-flex z-flex z-row z-align-center">
			<image class="tab-bg" src="/static/login/banner-icon.png" mode=""></image>

			<view class="z-flex z-flex z-row z-align-center">
				<view class="z-flex z-column z-align-center margin-r40" @click="cur = 0">
					<text class="font-50 margin-b20" :class="[cur ? 'color-black-3': 'color-base']">登录</text>
					<view class="line bg-color-base" v-if="!cur"></view>
				</view>
				<view class="z-flex z-column z-align-center" @click="cur = 1">
					<text class="font-46 margin-b20" :class="[cur ? 'color-base': 'color-black-3']">注册</text>
					<view class="line bg-color-base" v-if="cur"></view>
				</view>
			</view>
		</view>

        <view class="login margin-b80" v-if="!cur">
            <view class="input z-flex z-row z-align-center margin-b40">
                <image class="input-icon margin-r20" src="/static/login/account.png" mode=""></image>
                <input v-model="form.userName" class="z-flex-item color-base font-30" type="text" :maxlength="11"
                    placeholder="请输入您的用户名" placeholder-class="input-placeholder" />
            </view>
            <view class="input z-flex z-row z-align-center margin-b40">
                <image class="input-icon margin-r20" src="/static/login/password.png" mode=""></image>
                <input v-model="form.password" class="z-flex-item color-base font-30" type="text" :password="!showPwd"
                    placeholder="请输入您的登录密码" placeholder-class="input-placeholder" @confirm="confirm" />
                <uni-icons class="pwd-toggle" :type="showPwd ? 'eye-slash' : 'eye'" size="22" color="#999" @tap="showPwd = !showPwd"></uni-icons>
            </view>
        </view>

        <view class="register margin-b80" v-if="cur">
            <view class="input z-flex z-row z-align-center margin-b40">
                <image class="input-icon margin-r20" src="/static/login/account.png" mode=""></image>
                <input v-model="form.userName" class="z-flex-item color-base font-30" type="text" :maxlength="11"
                    placeholder="请输入您的用户名" placeholder-class="input-placeholder" />
            </view>
            <view class="input z-flex z-row z-align-center margin-b40">
                <image class="input-icon margin-r20" src="/static/login/password.png" mode=""></image>
                <input v-model="form.password" class="z-flex-item color-base font-30" type="text" :password="!showPwd"
                    placeholder="请输入您的登录密码" placeholder-class="input-placeholder" @confirm="confirm" />
                <uni-icons class="pwd-toggle" :type="showPwd ? 'eye-slash' : 'eye'" size="22" color="#999" @tap="showPwd = !showPwd"></uni-icons>
            </view>
        </view>

        <view class="button-wrap">
            <view class="button bg-color-base z-flex z-row z-align-center z-space-center margin-b20" :class="[isValid ? '':'btn-disabled']" @tap="confirm">
                <text class="color-white font-34">立即{{ cur ? '注册': '登录' }}</text>
            </view>
        </view>

        <view class="z-flex z-row z-align-center z-space-center margin-b100">
            <text class="color-base font-28" @tap="forgotPwd">忘记密码？</text>
        </view>

		<view class="other">
			<view class="z-flex z-row z-align-center margin-b40">
				<view class="separator z-flex-item"></view>
				<!-- <text class="color-black-3 font-28">更多登录方式</text> -->
				<text class="color-black-9 font-20">{{nowTime}}</text>
				<view class="separator z-flex-item"></view>
			</view>

			<view class="other-items z-flex z-row z-align-center z-space-around">
				<!-- <image class="other-icon" src="/static/login/wechat.png" mode=""></image> -->
				<!-- <image class="other-icon" src="/static/login/qq.png" mode=""></image> -->
				<!-- <image class="other-icon" src="/static/login/apple.png" mode=""></image> -->
			</view>
		</view>
	</view>
</pageConfig>
</template>

<script>
	import {
		formatTime
	} from '@/common/utils/util'
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
                    uni.showToast({
                        title: this.cur ? '请输入有效的用户名和密码以注册' : '请输入有效的用户名和密码以登录',
                        icon: 'none'
                    })
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
                    uni.showLoading({
                        title: ''
                    })
                    const res = await this.$api.post('/base/users/login', {
                        ...this.form
                    })
                    uni.hideLoading()
                    uni.setStorageSync("zoneToken", res.data.token)
                    const res2 = await this.$api.get('/base/users/info')
                    uni.setStorageSync('zoneUserInfo', res2.data)
                    const app = getApp()
                    app.globalData.userInfo = res2.data
                    if(app.globalData.initChat){
                        app.globalData.initChat()
                    }
                    uni.showToast({
                        title: "登录成功",
                        icon: 'none'
                    });
                    setTimeout(() => {
                        uni.switchTab({
                            url: "/pages/chat/index"
                        })
                    }, 800)
                } catch (e) {
                    uni.hideLoading()
                    uni.showToast({
                        title: '登录失败，请稍后重试',
                        icon: 'none'
                    })
                }
            },
            async register() {
                try {
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
                    const res = await this.$api.post('/base/users', params)
                    uni.showToast({
                        title: "注册成功,快去登录吧!",
                        icon: 'none'
                    });
                    this.form = {
                        userName:"",
                        password:""
                    }
                    this.cur = 0
                } catch (e) {
                    uni.showToast({
                        title: '注册失败，请稍后重试',
                        icon: 'none'
                    })
                }
            },
            forgotPwd(){
                uni.showToast({
                    title: '请联系管理员重置密码',
                    icon: 'none'
                })
            }
    }
}
</script>

<style lang="scss" scoped>
	.container {
		position: relative;
        background-color: $uni-white;
	}

	.bg {
		position: relative;
		width: 100%;
		height: 400rpx;
	}

	.tab {
		position: absolute;
		top: 250rpx;
		left: 20rpx;
		right: 20rpx;
		height: 150rpx;
		padding: 0 50rpx;
		background-color: $uni-white;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;

		&-bg {
			position: absolute;
			top: -200rpx;
			right: -50rpx;
			width: 440rpx;
			height: 285rpx;
		}
	}

	.line {
		width: 25rpx;
		height: 7rpx;
	}

	.login,
	.register {
		padding: 0 60rpx;
        .z-flex-item{
            background-color: transparent;
        }
	}

    .input {
        width: 100%;
        height: 90rpx;
        padding: 0 30rpx;
        background-color: rgba($uni-primary, 0.1);
        border-radius: 45rpx;
        box-sizing: border-box;

        &-icon {
            width: 30rpx;
            height: 38rpx;
        }

        &-placeholder {
            color: $uni-primary;
        }
    }

	.button-wrap {
		padding: 0 60rpx;
	}

    .button {
        width: 100%;
        height: 90rpx;
        border-radius: 45rpx;
    }
    .btn-disabled{
        opacity: 0.5;
    }
    .pwd-toggle{
        margin-left: 20rpx;
    }

	.separator {
		height: 2rpx;
		margin: 0 30rpx;
		background-color: #f5f5f5;
	}

	.other {
		&-items {
			padding: 0 200rpx;
		}

		&-icon {
			width: 50rpx;
			height: 50rpx;
		}
	}
</style>
