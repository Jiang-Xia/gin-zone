<template>
    <pageConfig title="设置">
        <view class="setting-page">
            <t-cell-group>
                <t-cell title="个人资料" arrow @click="goProfileEdit" />
                <t-cell title="账号安全" arrow @click="goSecurity" />
                <t-cell title="通知设置" arrow @click="goNoticeSetting" />
                <t-cell title="图表页面" arrow @click="goChart" />
                <t-cell title="清理缓存" arrow @click="clearCache" />
                <t-cell title="关于" arrow @click="goAbout" />
                <t-cell title="检查更新" arrow @click="checkUpdate" />
            </t-cell-group>

            <view v-if="isLogin" class="logout-wrap">
                <t-button
                    :custom-style="{ background: 'transparent' }"
                    theme="danger"
                    variant="outline"
                    size="large"
                    @click="logout"
                >
                    退出登录
                </t-button>
            </view>
        </view>
    </pageConfig>
</template>

<script>
export default {
    data() {
        return {
            userInfo: {},
        }
    },
    computed: {
        isLogin() {
            return !!uni.getStorageSync('zoneToken')
        },
    },
    onShow() {
        this.userInfo = uni.getStorageSync('zoneUserInfo') || {}
    },
    methods: {
        goProfileEdit() {
            if (!this.isLogin) {
                uni.navigateTo({
                    url: '/packageA/pages/my/login',
                })
                return
            }
            uni.navigateTo({
                url: '/packageA/pages/my/profileEdit',
            })
        },
        logout() {
            this.$showModal({
                title: '退出登录',
                content: '确认退出登录吗？',
                confirmText: '退出',
                cancelText: '取消',
            }).then((res) => {
                if (!res.confirm) return

                uni.removeStorageSync('zoneToken')
                uni.removeStorageSync('zoneUserInfo')

                const app = getApp()
                if (app?.globalData) {
                    app.globalData.userInfo = null
                }

                this.$toast({ title: '已退出', icon: 'success' })

                setTimeout(() => {
                    uni.navigateTo({
                        url: '/packageA/pages/my/login',
                    })
                }, 300)
            })
        },
        goSecurity() {
            this.$toast({ title: '功能开发中', icon: 'none' })
        },
        goNoticeSetting() {
            this.$toast({ title: '功能开发中', icon: 'none' })
        },
        goChart() {
            uni.navigateTo({
                url: '/packageB/pages/chart/chart',
            })
        },
        clearCache() {
            this.$showModal({
                title: '清理缓存',
                content: '确认清理本地缓存吗？',
                confirmText: '清理',
                cancelText: '取消',
            }).then((res) => {
                if (!res.confirm) return

                const token = uni.getStorageSync('zoneToken')
                const userInfo = uni.getStorageSync('zoneUserInfo')
                uni.clearStorageSync()
                if (token) uni.setStorageSync('zoneToken', token)
                if (userInfo) uni.setStorageSync('zoneUserInfo', userInfo)

                this.$toast({ title: '缓存已清理', icon: 'success' })
            })
        },
        goAbout() {
            uni.navigateTo({
                url: '/packageA/pages/my/about',
            })
        },
        checkUpdate() {
            this.$toast({ title: '当前已是最新版本', icon: 'none' })
        },
    },
}
</script>

<style lang="scss" scoped>
.setting-page {
    margin-top: 20rpx;

    :deep(.t-cell-group) {
        margin: 0;
        border-radius: 0;
    }
}

.logout-wrap {
    display: flex;
    justify-content: center;
    padding: 120rpx 32rpx 48rpx;

    :deep(.t-button) {
        width: 60%;
        max-width: 520rpx;
    }
}
</style>
