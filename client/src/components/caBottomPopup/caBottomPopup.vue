<template>
    <t-popup :custom-style="{height: maxHeight}" :visible="localVisible" placement="bottom" @visible-change="handleVisibleChange">
        <view class="ca-bottom-popup">
            <view class="ca-bottom-popup__header">
                <view class="ca-bottom-popup__header-action ca-bottom-popup__header-action--cancel"
                    @tap="onCancel">
                    <text v-if="showCancel&&cancelText">{{ cancelText }}</text>
                    <t-icon v-if="showCancel&&!cancelText" name="close" size="24" color="#bdbdbd"/>
                </view>
                <view class="ca-bottom-popup__title">
                    {{ resolvedTitle }}
                </view>
                <view class="ca-bottom-popup__header-action ca-bottom-popup__header-action--confirm"
                    @tap="onConfirm">
                    <text v-if="showConfirm">{{ confirmText }}</text>
                </view>
            </view>

            <view class="ca-bottom-popup__body">
                <slot v-if="visible" />
            </view>
        </view>
    </t-popup>
</template>

<script>
    export default {
        name: 'CaBottomPopup',
        props: {
            // 是否显示弹框
            visible: {
                type: Boolean,
                default: false,
            },
            // 标题，默认“选择付款方式”
            title: {
                type: String,
                default: '',
            },
            // 高度
            maxHeight: {
                type: String,
                default: '70vh',
            },
            // 取消按钮文本
            cancelText: {
                type: String,
                default: '',
            },
            // 确认按钮文本
            confirmText: {
                type: String,
                default: '确定',
            },
            // 是否展示取消按钮
            showCancel: {
                type: Boolean,
                default: true,
            },
            // 是否展示确认按钮
            showConfirm: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {}
        },
        computed: {
            resolvedTitle() {
                return this.title || '选择付款方式'
            },
            localVisible: {
                get() {
                    return this.visible
                },
                set(val) {
                    this.$emit('update:visible', val)
                }
            },
        },
        methods: {
            handleVisibleChange(visible) {
                // t-popup 的 visible-change 第一个参数固定为布尔值
                const realVisible = !!visible
                this.localVisible = realVisible
                this.$emit('update:visible', realVisible)
                this.$emit('visible-change', realVisible)
            },
            onCancel() {
                this.$emit('cancel')
                this.$emit('update:visible', false)
            },
            onConfirm() {
                this.$emit('confirm')
            },
        },
    }
</script>

<style lang="scss">
    .ca-bottom-popup {
        background: #ffffff;
        border-top-left-radius: 32rpx;
        border-top-right-radius: 32rpx;
        padding-bottom: 40rpx;

        .ca-bottom-popup__header {
            position: relative;
            padding: 20rpx 32rpx;
            height: 96rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
            // border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);

            .ca-bottom-popup__title {
                font-size: 32rpx;
                color: rgba(0, 0, 0, 0.88);
                font-weight: 600;
                text-align: center;
                flex: 1;
            }

            .ca-bottom-popup__header-action {
                font-size: 28rpx;
                min-width: 96rpx;
                text-align: center;

                &--cancel {
                    color: rgba(0, 0, 0, 0.45);
                }

                &--confirm {
                    color: #f24500;
                }
            }
        }

        .ca-bottom-popup__body {
            padding: 20rpx 0 0;
            // max-height: 50vh;
            max-height: 70vh;
            // overflow: auto;
        }
    }
</style>

