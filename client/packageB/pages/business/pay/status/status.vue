<template>
    <view class="pay-status-page">
        <view class="content">
            <view class="logo-box">
                <image src="/static/business/images/pay/bank-logo.png"></image>
            </view>
            <view class="status-box">
                <image class="status-img" :src="statusImage" mode="widthFix"></image>
                <view class="status-title">{{ statusText }}</view>
                <view class="status-sub" v-if="storeName">商户：{{ storeName }}</view>
                <view class="status-amount" v-if="amount !== null">金额：¥ {{ moneyFormatter(amount) }}</view>
            </view>

            <view class="tips" v-if="isProcessing">
                支付结果获取中，请稍候...
            </view>
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
                timer: null,
                statusDict:{
                    WAIT_BUYER_PAY: '支付中',
                    TRADE_CLOSED: '交易关闭',
                    TRADE_SUCCESS: '支付成功',
                    TRADE_FINISHED: '交易结束',
                }
            }
        },
        onLoad() {
            try {
                const cache = loadPayOrderParams()
                if (cache && typeof cache === 'object') {
                    if (cache.amount != null) this.amount = cache.amount
                    if (cache.storeName) this.storeName = cache.storeName
                    this._orderNo = cache.orderNo
                    this._mchtNo = cache.mchtNo
                }
            } catch (e) {}
            // #ifdef MP-ALIPAY
            this.queryStatus()
            // #endif
            // #ifndef MP-ALIPAY
            this.queryOrder()
            // #endif
        },
        onUnload() {
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
            statusImage() {
                if (this.status === 'SUCCESS') return '/static/business/images/pay/pay-success.png'
                return '/static/business/images/pay/pay-process.png'
            }
        },
        methods: {
            moneyFormatter(arg) {
                return this.$tool.moneyFormatter2(arg)
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
                    }
                    uni.hideLoading()
                } catch (error) {
                    uni.hideLoading()
                }
            },
            async queryOrder() {
                const params = this._orderNo && this._mchtNo
                    ? { orderNo: this._orderNo, mchtNo: this._mchtNo }
                    : null
                if (!params) return

                await this.queryOrderOnce(params)
            },
            async queryOrderOnce(params) {
                try {
                    // 轮询：只重试一次（模拟联调场景；真实接入可改为指数退避/多次重试）
                    // params.orderNo / params.mchtNo：来自 all-pay 页面写入的 pay_order_params
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
                } catch (e) {
                    this.status = 'PROCESSING'
                }

                // 若为处理中，延迟重试一次（模拟轮询）
                if (this.status === 'PROCESSING') {
                    this.timer = setTimeout(() => {
                        this.queryOrderOnce(params)
                    }, 1200)
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
            .status-sub {
                margin-top: 12rpx;
                font-size: 26rpx;
                color: #666;
            }
            .status-amount {
                margin-top: 8rpx;
                font-size: 28rpx;
                color: #f6585d;
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

 
