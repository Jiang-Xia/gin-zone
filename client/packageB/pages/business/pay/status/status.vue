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
                const cache = uni.getStorageSync('pay_order_params') || {}
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
                    const params = {
                        out_trade_no: uni.getStorageSync('payOutTradeNo'),
                    }
                    const res = await this.$api.get('/blog/pay/trade/query', params)
                    console.log('query',res)
                    if(res.data.tradeStatus === 'TRADE_SUCCESS'){
                        this.status = 'SUCCESS'
                    }
                    uni.hideLoading()
                } catch (error) {
                    uni.hideLoading()
                }
            },
            queryOrder() {
                // 由于模拟数据不依赖入参，这里直接请求即可
                const params = this._orderNo && this._mchtNo ? { orderNo: this._orderNo, mchtNo: this._mchtNo } : {}
                this.$tool.Post('QueryOrder', params, false, (data) => {
                    try {
                        const info = data.orderInfo || {}
                        // 优先使用接口顶层/内部状态
                        const s = data.status || info.status
                        // 将 UNPAY 等待支付视作处理中
                        if (s === 'SUCCESS') {
                            this.status = 'SUCCESS'
                        } else if (s === 'FAIL') {
                            this.status = 'FAIL'
                        } else {
                            this.status = 'PROCESSING'
                        }
                        // this.amount = typeof info.amount === 'number' ? info.amount : (info.realAmount || null)
                        this.storeName = info.storeName || info.mchtName || ''
                    } catch (e) {
                        this.status = 'PROCESSING'
                    }
                    // 若为处理中，延迟重试一次（模拟轮询）
                    if (this.status === 'PROCESSING') {
                        this.timer = setTimeout(() => {
                            this.$tool.Post('QueryOrder', params, false, (data2) => {
                                const info2 = data2.orderInfo || {}
                                const s2 = data2.status || info2.status
                                if (s2 === 'SUCCESS') {
                                    this.status = 'SUCCESS'
                                }
                            })
                        }, 1200)
                    }
                })
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

 
