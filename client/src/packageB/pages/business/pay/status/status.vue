<template>
    <view class="pay-status-page">
        <view class="content">
            <view class="logo-box">
                <image :src="$getImg('/packageB/static/business/images/pay/bank-logo.png')"></image>
            </view>
            <view class="status-box">
                <image class="status-img" :src="statusImage" mode="widthFix"></image>
                <view class="status-title" :class="statusTitleClass">{{ statusText }}</view>

                <view class="divider" />

                <view class="card">
                    <view class="row" v-if="storeName">
                        <view class="label">收款商户名称</view>
                        <view class="value ellipsis">{{ storeName }}</view>
                    </view>

                    <view class="row tappable" v-if="orderNo" @tap="copyText(orderNo, '订单编号')">
                        <view class="label">订单编号</view>
                        <view class="value value-copy">
                            <text class="ellipsis">{{ orderNo }}</text>
                        </view>
                    </view>

                    <view class="row" v-if="amount !== null">
                        <view class="label">实付金额</view>
                        <view class="value">￥{{ moneyFormatter(amount) }}</view>
                    </view>

                    <view class="row row-last">
                        <view class="label">订单状态</view>
                        <view class="value status">
                            <view class="status-tag" :class="statusTagClass">{{ statusDictText }}</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="tips" v-if="isProcessing">支付结果获取中，请稍候...</view>
            <!--#ifndef MP -->
            <view class="btn-group">
                <view class="btn primary" @tap="goHome">完成</view>
                <view class="btn ghost" @tap="returnTap">返回</view>
            </view>
            <!-- #endif -->
            <!--#ifdef MP -->
            <view class="btn-group">
                <view class="btn primary" @tap="goHome">完成</view>
            </view>
            <!-- #endif -->
        </view>
    </view>
</template>

<script>
    import { loadPayOrderParams, queryOrder as queryOrderService } from '@/packageB/services/payService.js'

    export default {
        data() {
            return {
                status: 'PROCESSING', // SUCCESS / FAIL / PROCESSING
                amount: null,
                storeName: '',
                orderNo: '',
                mchtNo: '',
                timer: null,
                isPageUnloaded: false,
                polling: false,
                pollTimes: 0,
                statusDict:{
                    WAIT_BUYER_PAY: '支付中',
                    TRADE_CLOSED: '交易关闭',
                    TRADE_SUCCESS: '支付成功',
                    TRADE_FINISHED: '交易结束',
                }
            }
        },
        onLoad(options) {
            this.isPageUnloaded = false
            try {
                const cache = loadPayOrderParams()
                if (cache && typeof cache === 'object') {
                    if (cache.amount != null) this.amount = cache.amount
                    if (cache.storeName) this.storeName = cache.storeName
                    this.orderNo = cache.orderNo || ''
                    this.mchtNo = cache.mchtNo || ''
                }
            } catch (e) {}

            // 允许从 query 覆盖（便于分享/外链/不同入口）
            this.applyQuery(options || {})

            // #ifdef MP-ALIPAY
            this.queryStatus()
            // #endif
            // #ifndef MP-ALIPAY
            this.queryOrder()
            // #endif
        },
        onUnload() {
            this.isPageUnloaded = true
            if (this.timer) clearTimeout(this.timer)
        },
        computed: {
            isProcessing() {
                return this.status === 'PROCESSING'
            },
            statusText() {
                if (this.status === 'SUCCESS') return '支付成功'
                if (this.status === 'FAIL') return '支付失败'
                return '支付处理中'
            },
            statusTitleClass() {
                if (this.status === 'SUCCESS') return 'status-title--success'
                if (this.status === 'FAIL') return 'status-title--fail'
                return 'status-title--processing'
            },
            statusImage() {
                if (this.status === 'SUCCESS') return this.$getImg('/packageB/static/business/images/pay/pay-success.png')
                if (this.status === 'FAIL') return this.$getImg('/packageB/static/business/images/pay/pay-fail.png')
                return this.$getImg('/packageB/static/business/images/pay/pay-process.png')
            },
            statusDictText() {
                // 小程序：tradeQuery 会返回 tradeStatus；H5/APP：QueryOrder 使用 SUCCESS/FAIL/PROCESSING（旧联调口径）
                if (this.status === 'SUCCESS') return '支付成功'
                if (this.status === 'FAIL') return '支付失败'
                return '支付中'
            },
            statusTagClass() {
                if (this.status === 'SUCCESS') return 'status-tag--success'
                if (this.status === 'FAIL') return 'status-tag--fail'
                return 'status-tag--processing'
            }
        },
        methods: {
            moneyFormatter(arg) {
                return this.$tool.moneyFormatter2(arg)
            },
            applyQuery(opt) {
                const decode = (v) => {
                    if (v === undefined || v === null) return ''
                    try {
                        return decodeURIComponent(String(v))
                    } catch (e) {
                        return String(v)
                    }
                }
                const pick = (key, fallback) => {
                    const v = opt[key]
                    if (v === undefined || v === null || v === '') return fallback
                    return decode(v)
                }

                this.orderNo = pick('orderNo', this.orderNo) || this.orderNo
                this.mchtNo = pick('mchtNo', this.mchtNo) || this.mchtNo
                this.storeName = pick('storeName', this.storeName) || this.storeName

                const amt = pick('amount', this.amount)
                if (amt !== '' && amt !== null && amt !== undefined) this.amount = amt
            },
            copyText(text, label) {
                const val = String(text || '').trim()
                if (!val) return
                uni.setClipboardData({
                    data: val,
                    success: () => {
                        try {
                            this.$tool && this.$tool.showToast && this.$tool.showToast(`${label}已复制`)
                        } catch (e) {}
                    },
                })
            },
            async queryStatus(type) {
                try {
                    uni.showLoading({title: '加载中'})
                    // 小程序支付结果：通过接口层 tradeQuery 获取交易状态
                    const params = {
                        out_trade_no: uni.getStorageSync('payOutTradeNo'),
                    }
                    const res = await this.$apis.pay.tradeQuery(params)
                    console.log('query',res)
                    if(res.data.tradeStatus === 'TRADE_SUCCESS'){
                        this.status = 'SUCCESS'
                    } else if (res.data.tradeStatus === 'TRADE_CLOSED') {
                        this.status = 'FAIL'
                    } else {
                        this.status = 'PROCESSING'
                    }
                    uni.hideLoading()
                } catch (error) {
                    uni.hideLoading()
                    this.status = 'FAIL'
                }
            },
            async queryOrder() {
                const params = this.orderNo && this.mchtNo
                    ? { orderNo: this.orderNo, mchtNo: this.mchtNo }
                    : null
                if (!params) return

                await this.queryOrderPoll(params)
            },
            async queryOrderPoll(params) {
                if (this.polling) return
                this.polling = true
                this.pollTimes = 0
                const maxTimes = 10
                const intervalMs = 1000

                const tick = async () => {
                    if (this.isPageUnloaded) return
                    this.pollTimes += 1
                    await this.queryOrderOnce(params)
                    if (this.status === 'SUCCESS' || this.status === 'FAIL') return
                    if (this.pollTimes >= maxTimes) {
                        // 超时兜底：避免一直“处理中”
                        this.status = 'FAIL'
                        return
                    }
                    this.timer = setTimeout(tick, intervalMs)
                }

                try {
                    await tick()
                } finally {
                    this.polling = false
                }
            },
            async queryOrderOnce(params) {
                try {
                    const data = await queryOrderService(this.$tool, {
                        mchtNo: params.mchtNo,
                        orderNo: params.orderNo,
                    })
                    const info = data?.orderInfo || {}

                    // 优先使用接口顶层/内部状态
                    const s = data?.status || info.status
                    if (s === 'SUCCESS') {
                        this.status = 'SUCCESS'
                    } else if (s === 'FAIL') {
                        this.status = 'FAIL'
                    } else {
                        this.status = 'PROCESSING'
                    }
                    this.storeName = info.storeName || info.mchtName || ''
                    this.orderNo = info.orderNo || params.orderNo || this.orderNo
                    this.mchtNo = info.mchtNo || params.mchtNo || this.mchtNo
                } catch (e) {
                    // 查询失败直接失败，避免“假处理中”
                    this.status = 'FAIL'
                }
            },
            returnTap() {
               uni.navigateBack()
            },
            goHome() {
                // #ifdef H5||APP
                uni.reLaunch({
                    url: '/pages/blog/index'
                })
                // #endif
                // #ifdef MP-ALIPAY||MP-WEIXIN
                uni.exitMiniProgram()
                // #endif
            }
        }
    }
</script>

<style lang="scss">
    .pay-status-page {
        .content {
            margin: 30rpx;
            margin-top: 30rpx;
            background: $uni-white;
            padding: 24rpx;
            border-radius: 8px;
            min-height: 600rpx;
        }

        .logo-box {
            margin-top: 10px;
            margin-bottom: 10px;
            text-align: center;
            image {
                height: 32px;
                width: 260px;
            }
        }

        .status-box {
            text-align: center;
            padding-top: 20rpx;
            .status-img {
                width: 200rpx;
                margin: 20rpx auto 10rpx auto;
            }
            .status-title {
                font-size: 36rpx;
                font-weight: bold;
                margin-top: 10rpx;
                color: #333;
            }
            .status-title--success {
                color: var(--td-brand-color);
            }
            .status-title--processing {
                color: #ed7b2f;
            }
            .status-title--fail {
                color: #e34d59;
            }
            .divider {
                margin: 26rpx auto 0;
                width: 100%;
                height: 20rpx;
                border-radius: 10rpx;
                background: linear-gradient(180deg, #EB6120 0%, #FFD3BF 100%);
            }
            .card {
                margin-top: -10rpx;
                background: #fbfbfb;
                padding: 18rpx 20rpx;
                box-sizing: border-box;
                margin-left: 12rpx;
                margin-right: 12rpx;
                text-align: left;
            }
            .row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18rpx 12rpx;
            }
            .label {
                flex-shrink: 0;
                font-size: 26rpx;
                color: rgba(0, 0, 0, 0.45);
            }
            .value {
                flex: 1;
                text-align: right;
                font-size: 26rpx;
                color: rgba(0, 0, 0, 0.88);
                display: flex;
                justify-content: flex-end;
                align-items: center;
                column-gap: 10rpx;
                min-width: 0;
            }
            .ellipsis {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                min-width: 0;
            }
            .tappable:active {
                opacity: 0.85;
            }
            .value-copy {
                color: rgba(0, 0, 0, 0.82);
            }
            .status {
                font-weight: 600;
            }
            .status-tag {
                display: inline-flex;
                align-items: center;
                padding: 6rpx 14rpx;
                border-radius: 999rpx;
                font-size: 24rpx;
                line-height: 1;
                border: 1rpx solid transparent;
            }
            .status-tag--success {
                color: #008858;
                background: #e3f9e9;
                border-color: rgba(0, 136, 88, 0.15);
            }
            .status-tag--processing {
                color: #be5a00;
                background: #fff1e9;
                border-color: rgba(190, 90, 0, 0.18);
            }
            .status-tag--fail {
                color: #d54941;
                background: #fff0ed;
                border-color: rgba(213, 73, 65, 0.18);
            }
            .row-last {
                padding-bottom: 22rpx;
            }
        }

        .tips {
            text-align: center;
            margin-top: 20rpx;
            font-size: 24rpx;
            color: #999;
        }

        .btn-group {
            display: flex;
            gap: 20rpx;
            margin: 40rpx 20rpx 10rpx 20rpx;
            .btn {
                flex: 1;
                height: 96rpx;
                line-height: 96rpx;
                text-align: center;
                border-radius: 8px;
                font-size: 30rpx;
            }
            .primary {
                background-color: $uni-primary;
                color: $uni-white;
            }
            .ghost {
                border: 1rpx solid $uni-border-1;
                color: #333;
                background: $uni-white;
            }
        }
    }
</style>

 
