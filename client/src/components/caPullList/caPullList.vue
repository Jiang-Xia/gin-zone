<template>
    <scroll-view
        class="ca-pull-list"
        scroll-y
        :lower-threshold="lowerThreshold"
        :refresher-enabled="refresherEnabled"
        :refresher-triggered="refresherTriggered"
        :refresher-background="refresherBackground"
        @refresherrefresh="onRefresh"
        @scrolltolower="onLoadMore"
    >
        <view class="ca-pull-list__content">
            <slot />

            <view v-if="showEmpty" class="ca-pull-list__empty">
                <noData color="'#333'" title="暂无数据" :loading="false" />
            </view>

            <view v-if="showFooter" class="ca-pull-list__footer">
                <t-loading
                    v-if="loadingMore"
                    theme="circular"
                    size="40rpx"
                    text="加载中..."
                    class="ca-pull-list__loading"
                />
                <view v-else-if="finished" class="ca-pull-list__finished">没有更多了</view>
            </view>
        </view>
    </scroll-view>
</template>

<script>
    import noData from '@/components/noData/noData.vue'

    export default {
        name: 'CaPullList',
        components: { noData },
        props: {
            // 下拉刷新开关
            refresherEnabled: {
                type: Boolean,
                default: true,
            },
            // 下拉刷新状态（由父组件控制，刷新完成后置 false）
            refresherTriggered: {
                type: Boolean,
                default: false,
            },
            refresherBackground: {
                type: String,
                default: '#ffffff',
            },
            // 触底距离
            lowerThreshold: {
                type: Number,
                default: 80,
            },
            // 列表数据长度（用于判断 empty）
            listLength: {
                type: Number,
                default: 0,
            },
            // 首次/整体加载中（可用于空态前的 skeleton，这里先不做复杂）
            loading: {
                type: Boolean,
                default: false,
            },
            // 上拉加载中
            loadingMore: {
                type: Boolean,
                default: false,
            },
            // 是否加载完
            finished: {
                type: Boolean,
                default: false,
            },
            // 是否展示空态
            showEmptyWhenNoData: {
                type: Boolean,
                default: true,
            },
            // 是否展示底部 footer（loadingMore / finished）
            showFooter: {
                type: Boolean,
                default: true,
            },
        },
        computed: {
            showEmpty() {
                if (!this.showEmptyWhenNoData) return false
                if (this.loading) return false
                return this.listLength === 0
            },
        },
        methods: {
            onRefresh() {
                this.$emit('refresh')
            },
            onLoadMore() {
                if (this.loading || this.loadingMore || this.finished) return
                this.$emit('loadMore')
            },
        },
    }
</script>

<style lang="scss">
    .ca-pull-list {
        height: 100%;
        width: 100%;
    }

    .ca-pull-list__content {
        padding-bottom: 40rpx;
    }

    .ca-pull-list__empty {
        margin-top: 40rpx;
        min-height: 400rpx;
    }

    .ca-pull-list__footer {
        padding: 24rpx 0;
        display: flex;
        justify-content: center;
        align-items: center;
        color: rgba(0, 0, 0, 0.35);
        font-size: 24rpx;
    }

    .ca-pull-list__finished {
        padding: 8rpx 0;
    }
</style>

