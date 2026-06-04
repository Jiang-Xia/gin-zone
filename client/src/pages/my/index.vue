<template>
    <view class="profile-page">
        <view class="profile-content">
            <view class="header-bg-wrap">
                <swiper v-if="swiperList.length" class="swiper" @change="swiperChange" circular :autoplay="false"
                    :interval="6000" :duration="500">
                    <swiper-item v-for="(item ,index) in swiperList" :key="index">
                        <view class="swiper-item">
                            <image :src="'https://cn.bing.com/'+item.url" class="swiper-image" mode="aspectFill">
                            </image>
                        </view>
                    </swiper-item>
                </swiper>
                <image v-else class="header-bg" :src="$getImg('/static/images/my.png')" mode="aspectFill"></image>
            </view>
            <view class="main-content">
                <view class="my-info" @click="onClickProfile">
                    <view class="avatar-wrap">
                        <image class="avatar" :src="isLogin ? userInfo.avatar : $getImg('/static/images/my.png')" mode="aspectFill">
                        </image>
                        <!-- <image class="avatar-camera" :src="$getImg('/static/images/my.png')" mode="aspectFill"></image> -->
                    </view>
                    <view class="text-wrap">
                        <view class="name-row">
                            <text class="name">{{ isLogin ? userInfo.nickName : '未登录' }}</text>
                            <uni-tag :inverted="true" :circle="true" v-if="isLogin && userInfo.isAdmin" text="管理员"
                                size="mini" />
                        </view>
                        <text class="intro">{{ isLogin ? (userInfo.intro || '难将心事和人说 说与青天明月知') : '点击去登录' }}</text>
                    </view>
                    <uni-icons custom-prefix="zonefont" color="#666" type="zone-gerenziliao" size="18"></uni-icons>
                </view>

                <view class="profile-menu">
                    <t-cell-group theme="card">
                        <t-cell title="创建群聊" arrow @click="goCreateGroup">
                            <template #image>
                                <uni-icons custom-prefix="zonefont" type="zone-plus" size="20"
                                    color="#f00057"></uni-icons>
                            </template>
                        </t-cell>

                        <t-cell title="群聊管理" arrow @click="goGroupManage">
                            <template #image>
                                <uni-icons type="staff" size="20"
                                    color="#f00057"></uni-icons>
                            </template>
                        </t-cell>

                        <t-cell title="收银台" arrow @click="goCashier">
                            <template #image>
                                <uni-icons type="wallet" size="20"
                                    color="#f00057"></uni-icons>
                            </template>
                        </t-cell>

                        <t-cell title="设置" arrow @click="goSetting">
                            <template #image>
                                <uni-icons type="gear" size="20"
                                    color="#f00057"></uni-icons>
                            </template>
                        </t-cell>

                        <t-cell title="关于" arrow @click="goAbout">
                            <template #image>
                                <uni-icons type="info" size="20"
                                    color="#f00057"></uni-icons>
                            </template>
                        </t-cell>
<!-- 
                        <t-cell title="测试" arrow :bordered="false" @click="goDemo">
                            <template #image>
                                <uni-icons custom-prefix="zonefont" type="zone-qita-v" size="20"
                                    color="#f00057"></uni-icons>
                            </template>
                        </t-cell> -->
                    </t-cell-group>
                </view>
            </view>
            
           <!-- <view v-if="!isLogin" class="logout-wrap">
                <t-button :custom-style="{background: 'transparent'}" theme="primary" variant="outline" size="large" @click="login">
                    去登录
                </t-button>
            </view> -->

            <view class="footer-tips">
                <view class="footer-tips__title">今日小贴士</view>
                <view class="footer-tips__text">在设置页可以管理账号、通知与缓存，保持应用最佳状态。</view>
            </view>
        </view>
    </view>
</template>

<script>
    import { useUserStore } from '@/stores/user.js'
    import { useChatStore } from '@/stores/chat.js'

    export default {
        data() {
            return {
                code: '',
                userInfo: {},
                swiperList: [],
                current: 0,
            }
        },
        computed: {
            isLogin() {
                return Object.keys(this.userInfo).length
            },
        },
        onShow() {
            // 轮播背景：复用博客首页逻辑（bing 每日图）；加密会话由请求层自动 signIn
            this.getImage()

            const userStore = useUserStore()
            const token = userStore.token
            if (token) {
                this.getZoneUserInfo()
            } else {
                this.userInfo = {}
            }
        },
        methods: {
            ensureLogin() {
                if (this.isLogin) return true
                this.login()
                return false
            },
            async getImage() {
                try {
                    const res = await this.$apis.blog.dailyImg(7)
                    this.swiperList = res?.data?.images || []
                } catch (e) {
                    this.swiperList = []
                }
            },
            swiperChange(e) {
                this.current = e.detail.current
            },
            onClickProfile() {
                if (!this.ensureLogin()) return
                this.goProfileEdit()
            },
            login() {
                // #ifdef H5 || APP || MP-ALIPAY
                uni.navigateTo({
                    url: "/packageA/pages/my/login"
                })
                return
                // #endif

                // #ifdef MP-WEIXIN
                uni.getUserProfile({
                    lang: 'zh_CN',
                    desc: '用户注册',
                    success: async (info) => {
                        const res = await this.$apis.auth.wxLogin({
                            code: this.code,
                            ...info.userInfo
                        })
                        this.setToken(res.data.token)
                        this.getZoneUserInfo()
                    },
                    fail(err) {
                        console.log("getUserProfile err", err)
                    }
                })
                // #endif

                uni.login({
                    "provider": "weixin",
                    "onlyAuthorize": true,
                    success: async (event) => {
                        this.code = event.code
                        // #ifdef APP-PLUS
                        this.getUserInfo(this.code)
                        // #endif
                    },
                    fail: (err) => {
                        this.$toast({ title: '授权失败', icon: 'error' })
                    }
                })
            },
            getUserInfo() {
                uni.getUserInfo({
                    provider: 'weixin',
                    success: async (info) => {
                        const res = await this.$apis.auth.wxLogin({
                            code: this.code,
                            ...info.userInfo
                        })
                        this.setToken(res.data.token)
                        this.getZoneUserInfo()
                    },
                    fail: (err) => {
                        this.$toast({ title: '授权失败', icon: 'error' })
                        console.log("获取授权信息失败", err)
                    }
                })
            },
            async getZoneUserInfo() {
                const res = await this.$apis.auth.getUserInfo()
                this.userInfo = res.data
                const userStore = useUserStore()
                userStore.setUserInfo(res.data)
                const chatStore = useChatStore()
                chatStore.initChat(res.data.userId)
            },
            setToken(token) {
                const userStore = useUserStore()
                userStore.setToken(token)
            },

            goProfileEdit() {
                if (!this.ensureLogin()) return
                uni.navigateTo({
                    url: "/packageA/pages/my/profileEdit"
                })
            },
            goSetting() {
                if (!this.ensureLogin()) return
                uni.navigateTo({
                    url: "/packageA/pages/my/setting"
                })
            },
            goAbout() {
                uni.navigateTo({
                    url: "/packageA/pages/my/about"
                })
            },
            goCreateGroup() {
                if (!this.ensureLogin()) return
                // 原先的“创建群聊”对管理员有校验，这里保留校验逻辑不丢
                if (!this.userInfo.isAdmin) {
                    this.$toast({ title: '您不是管理员', icon: 'error' })
                    return
                }
                uni.navigateTo({
                    url: "/packageA/pages/my/createGroup"
                })
            },
            goGroupManage() {
                if (!this.ensureLogin()) return
                // 群聊信息管理仅开放给管理员（与“创建群聊”保持一致的入口策略）
                if (!this.userInfo.isAdmin) {
                    this.$toast({ title: '您不是管理员', icon: 'error' })
                    return
                }
                uni.navigateTo({
                    url: "/packageA/pages/my/groupManage"
                })
            },
            goCashier() {
                if (!this.ensureLogin()) return

                // #ifdef MP-WEIXIN
                this.$toast('功能正在开发中')
                return
                // #endif

                uni.navigateTo({
                    url: "/packageB/pages/business/pay/cashier/cashier"
                })
            },
            goDemo() {
                if (!this.ensureLogin()) return
                uni.navigateTo({
                    url: "/packageB/pages/demo/demo"
                })
            },

        },
    }
</script>

<style lang="scss" scoped>
    .profile-page {
        font-size: 14px;
        line-height: 24px;
        min-height: 100vh;
        min-height: 100dvh;
        overflow-y: hidden;
    }

    /* 顶部 TDesign 导航栏样式 */
    ::v-deep .sr-navbar {
        background: linear-gradient(180deg, #ffe4cf 0%, #ffffff 80%);
    }

    ::v-deep .sr-navbar__title {
        font-size: 32rpx;
        font-weight: 500;
    }

    .sr-navbar__right {
        display: flex;
        align-items: center;
        column-gap: 12rpx;
        padding-right: 24rpx;
    }

    .sr-navbar__placeholder-left {
        width: 48rpx;
    }

    .sr-navbar__icon-btn {
        min-width: 120rpx;
        height: 56rpx;
        padding: 0 16rpx;
        border-radius: 999rpx;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sr-navbar__icon-text {
        font-size: 24rpx;
        color: #f00057;
    }


    .profile-content {
        position: relative;
        // padding: 0 32rpx 40rpx;
        box-sizing: border-box;
    }

    .header-bg-wrap {
        height: 500rpx;
        overflow: hidden;
    }

    .header-bg {
        width: 100%;
        height: 500rpx;
    }

    .swiper {
        height: 500rpx;
        background-color: #fff;
    }

    .swiper-item {
        height: 500rpx;
        overflow: hidden;
    }

    .swiper-image {
        width: 100%;
        height: 500rpx;
    }

    .main-content {
        position: relative;
        margin-top: -220rpx;
        z-index: 2;
        /* 让 my-info 的毛玻璃能透出顶部背景 */
        background: transparent;
    }

    .my-info {
        display: flex;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 32rpx;
        border-radius: 16rpx 16rpx 0 0;
        background: rgba(255, 255, 255, 0.7);
        box-shadow: 0px 1px 7px 5px rgba(186, 190, 197, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(15px);

        /* 管理员 tag：透明背景（仅此处生效） */
        :deep(.uni-tag),
        :deep(.uni-tag--inverted) {
            background-color: transparent !important;
        }

        .avatar-wrap {
            position: relative;
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex: none;
        }

        .avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }

        .avatar-camera {
            position: absolute;
            right: -4rpx;
            bottom: 0;
            width: 40rpx;
            height: 40rpx;
        }

        .text-wrap {
            flex: 1;
            min-width: 0;
            padding-left: 18rpx;
        }

        .name-row {
            display: flex;
            align-items: center;
            gap: 12rpx;
            min-width: 0;
            margin-bottom: 8rpx;
        }

        .name {
            font-weight: 600;
            font-size: 34rpx;
            color: #333;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .intro {
            display: block;
            margin-top: 8rpx;
            color: #666;
            font-size: 24rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .realname-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 4rpx;
        padding: 4rpx 18rpx;
        height: 46rpx;
        border-radius: 999rpx;
        font-size: 22rpx;
    }

    .realname-tag--primary {
        color: #eb641f;
        border: 1px solid #ef8c5a;
    }

    .profile-menu {
        padding-bottom: 16rpx;
        background-color: $uni-white;
        ::v-deep .t-cell-group {
            margin: 0;
            border-radius: 0;
        }
    }

    .logout-wrap {
        display: flex;
        justify-content: center;
        padding: 180rpx 32rpx 48rpx;

        ::v-deep .t-button {
            width: 60%;
            max-width: 520rpx;
        }
    }

    .footer-tips {
        margin: 96rpx 32rpx 48rpx;
        padding: 24rpx 28rpx;
        border-radius: 16rpx;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(240, 0, 87, 0.1);
    }

    .footer-tips__title {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
    }

    .footer-tips__text {
        margin-top: 10rpx;
        color: #666;
        font-size: 24rpx;
        line-height: 1.6;
    }
</style>