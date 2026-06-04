<template>
    <pageConfig title="其他功能">
        <view class="other-features-page">
            <t-cell-group>
                <t-cell title="Demo 演示页" arrow @click="goDemo" />
                <t-cell title="手机号登录（WebView）" arrow @click="goWebview" />
                <t-cell title="博客文章列表" arrow @click="goArticles" />
                <t-cell title="图表页面" arrow @click="goChart" />
                <!-- #ifndef MP-WEIXIN -->
                <t-cell title="支付中转页" arrow @click="goPayTransfer" />
                <!-- #endif -->
            </t-cell-group>
        </view>
    </pageConfig>
</template>

<script>
export default {
    methods: {
        goDemo() {
            uni.navigateTo({
                url: '/packageB/pages/demo/demo',
            })
        },
        goWebview() {
            uni.navigateTo({
                url: '/packageB/pages/business/webview/webview',
            })
        },
        goArticles() {
            uni.navigateTo({
                url: '/packageA/pages/blog/articles/articles',
            })
        },
        goChart() {
            uni.navigateTo({
                url: '/packageB/pages/chart/chart',
            })
        },
        goPayTransfer() {
            uni.navigateTo({
                url: '/packageB/pages/business/pay/transfer/transfer',
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.other-features-page {
    margin-top: 20rpx;

    :deep(.t-cell-group) {
        margin: 0;
        border-radius: 0;
    }
}
</style>
