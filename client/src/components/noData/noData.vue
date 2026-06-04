<template>
    <view class="noData">
        <view v-if="isLoading">
            <t-loading v-if="true" theme="circular" size="56rpx" text="加载中..." class="wrapper" />
        </view>

        <view v-else class="noDataContent">
            <t-image :src="imageSrc" :width="imageWidth" :height="imageHeight"
                :custom-style="{ minHeight: '44rpx', marginRight: '8rpx' }" />
            <view class="text" :style="{ color }">
                {{ title ? title : '暂无数据' }}
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        props: {
            color: {
                type: String,
                default: '#8c8c8c',
            },
            image: {
                type: String,
                default: '/static/images/noData.svg',
            },
            loading: {
                type: Boolean,
                default: false,
            },
            title: {
                type: [Boolean, String],
                default: '',
            },
            size: {
                type: String,
                default: 'large',
            },
        },
        data() {
            return {
                isLoading: true,
            }
        },
        computed: {
            imageSrc() {
                if (!this.image) return this.$getImg('/static/images/components/noData.png')
                return /^https?:\/\//.test(this.image) ? this.image : this.$getImg(this.image)
            },
            imageWidth() {
                return this.size === 'large' ? '124' : '46'
            },
            imageHeight() {
                return this.size === 'large' ? '117' : '43'
            },
        },
        watch: {
            loading: {
                immediate: true,
                handler(val) {
                    this.isLoading = val
                },
            },
        },
    }
</script>

<style scoped lang="scss">
    .noData {
        padding: 32rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;

        .noDataContent {
            position: relative;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;

            .text {
                text-align: center;
                font-size: 13px;
            }
        }
    }
</style>
