<template>
    <view class="ca-sms-btn" :class="{ disabled: isDisabled }" @tap.stop="handleTap">
        {{ textToShow }}
    </view>
</template>

<script>
    export default {
        name: 'caSmsCodeBtn',
        props: {
            seconds: {
                type: Number,
                default: 60
            },
            text: {
                type: String,
                default: '获取验证码'
            },
            disabled: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                left: 0,
                timer: null,
            }
        },
        computed: {
            isDisabled() {
                return this.disabled || this.left > 0
            },
            textToShow() {
                if (this.left > 0) return `${this.left}s后重发`
                return this.text
            }
        },
        beforeDestroy() {
            this.clearTimer()
        },
        methods: {
            clearTimer() {
                if (this.timer) {
                    clearInterval(this.timer)
                    this.timer = null
                }
            },
            start() {
                const n = Number(this.seconds) || 60
                this.left = n
                this.clearTimer()
                this.timer = setInterval(() => {
                    this.left -= 1
                    if (this.left <= 0) {
                        this.left = 0
                        this.clearTimer()
                    }
                }, 1000)
            },
            reset() {
                this.left = 0
                this.clearTimer()
            },
            handleTap() {
                if (this.isDisabled) return
                this.$emit('tap')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .ca-sms-btn {
        color: var(--td-brand-color);
        font-size: 32rpx;
        white-space: nowrap;
        line-height: 1;
    }

    .ca-sms-btn.disabled {
        color: #aaa;
    }
</style>

