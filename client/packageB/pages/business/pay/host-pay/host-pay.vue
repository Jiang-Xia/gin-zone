<template>
    <view class="all-pay">
        <view class="content-page">
            <view class="flex-direction">
                <view class="logo-box">
                    <image src="/static/business/images/pay/bank-logo.png"></image>
                </view>
                <view class="flex-center title1" style="align-items: center; margin-top: 20rpx">
                    <view style="font-size: 40px; font-weight: 400; margin-bottom: 0px;margin-top: 6px;color:#f6585d;">¥
                    </view>
                    <view class="amount" style="font-size: 80rpx;color:#f6585d;">
                        {{ $tool.moneyFormatter2(qrCodeInfo.userAmount) }}
                    </view>
                </view>

                <!-- <view class="flex-between title2 pay-time">
                    <view>支付剩余时间：</view>
                    <view class="time-box">
                        <text style="color: #333;font-size: 14px;" v-if="day">{{day}}天</text>
                        <uni-countdown :show-day="false" :hour="hour" :minute="minute" :second="second" />
                    </view>
                </view> -->

                <view class="host_view">
                    <view class="title_Box">江氏银行卡支付</view>
                    <view class="row_view">
                        <uni-row>
                            <uni-col :span="6" class="label">手机号</uni-col>
                            <uni-col :span="18">
                                <input class="weui-input" v-model="hostpay.phone" maxlength="11" type="number"
                                    :placeholder="tipMap.phone" />
                            </uni-col>
                        </uni-row>
                    </view>
                    <view class="row_view">
                        <uni-row>
                            <uni-col :span="6" class="label">姓名</uni-col>
                            <uni-col :span="18"><input class="weui-input" v-model="hostpay.name" maxlength="11"
                                    :placeholder="tipMap.name" /></uni-col>
                        </uni-row>
                    </view>

                    <view class="row_view">
                        <uni-row>
                            <uni-col :span="6" class="label">身份证后6位</uni-col>
                            <uni-col :span="18"><input class="weui-input" v-model="hostpay.idCardLastSix" maxlength="6"
                                    :placeholder="tipMap.idCardLastSix" /></uni-col>
                        </uni-row>
                    </view>

                    <view class="row_view">
                        <uni-row>
                            <uni-col :span="6" class="label">验证码</uni-col>
                            <uni-col :span="12"><input class="weui-input" v-model="hostpay.authCode"
                                    :placeholder="tipMap.authCode" maxlength="6" type="number"
                                    @blur="QjbankCardQuery" /></uni-col>
                            <uni-col :span="6">
                                <view class="get-code-btn" :style="'color: ' + codeColor + ';'" @tap="sendmessg">
                                    {{ getmsg }}
                                </view>
                            </uni-col>
                        </uni-row>
                    </view>

                    <view class="row_view">
                        <uni-row>
                            <uni-col :span="6" class="label" style="line-height: 76rpx;">银行卡</uni-col>
                            <uni-col :span="15">
                                <uni-data-select class="weui-select" label="" v-model="cardNo" :localdata="hostList"
                                    @change="hostListChange" :clear="false" :placeholder="tipMap.cardNo">
                                </uni-data-select>
                            </uni-col>
                            <uni-col :span="3">
                                <view style="line-height: 76rpx;text-align: right;" @tap="QjbankCardQuery">查询
                                </view>
                            </uni-col>
                        </uni-row>
                    </view>
                </view>

            </view>
        </view>
        <view class="operation-btn2">
            <button class="btn-box" @tap="sureTap" type="primary">确认支付（¥{{ $tool.moneyFormatter2(qrCodeInfo.userAmount) }})</button>
        </view>

    </view>
</template>

<script>
    let that = null;

    export default {
        name: "host-pay",
        data() {
            return {
                qrCodeInfo: {},
                orderInfo: {},
                hour: 0,
                minute: 2,
                second: 59,
                day: 0,
                payType: '',
                hostpay: {
                    phone: '18888888888',
                    name: '江湖',
                    idCardLastSix: '123456',
                    authCode: '',
                },
                cardNo: '',
                tipMap: {
                    phone: '请输入银行卡预留手机号',
                    name: '请输入姓名',
                    idCardLastSix: '请输入身份证后',
                    authCode: '请输入验证码',
                    cardNo: '选择银行卡'
                },
                hostCardList: [],
                getmsg: '获取验证码',
                codeColor: '#333',
                sendmsg: '',
                sended: false,
                hostList: [],
                inter: null,
                tranNo: ''
            };
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function(options) {
            // this.hostList = [{
            //         value: '622222222222222222',
            //         text: `卡号(${this.$tool.getAcctNoDescAllQHTwo('622222222222222222')})`
            //     },
            //     {
            //         value: '633333333333333333',
            //         text: `卡号(${this.$tool.getAcctNoDescAllQHTwo('633333333333333333')})`
            //     }
            // ]
            that = this;
            const payType = 'HOSTPAY'
            this.payType = payType
            if (options.qrCodeInfo) {
                const qrCodeInfo = JSON.parse(options.qrCodeInfo)
                this.qrCodeInfo = qrCodeInfo
                console.log('host-pay-qrCodeInfo', qrCodeInfo)
            }
        },
        methods: {
            dealTime(expireTime) {
                if (expireTime) {
                    const arr = expireTime.split(':')
                    this.hour = Number(arr[0])
                    this.minute = Number(arr[1])
                    this.second = Number(arr[2])
                    if (this.hour / 24 >= 1) {
                        this.day = Math.floor(this.hour / 24)
                        this.hour = this.hour % 24
                    }
                }
            },
            //确认支付点击
            sureTap(e) {
                for (let key of Object.keys(this.hostpay)) {
                    if (!this.validateEmpty(key)) {
                        return
                    }
                }
                this.payOrder();
            },

            payOrder() {
                const payType = this.payType
                const params = this.qrCodeInfo
                params.gateHostPayReq = {
                    cardNo: this.cardNo
                }
                this.$api.post('/WeixinQuickPay', params).then(res => {

                    if (res.bookAction.retCode === '2000') {
                        this.tranNo = res.tranNo
                        this.goTo()
                    } else {
                        uni.showModal({
                            title: '提示',
                            content: res.bookAction.retMsg,
                            showCancel: false,
                            success: function(res) {
                                if (res.confirm) {
                                    that.$tool.closeWindow()
                                }
                            }
                        });
                    }
                }).catch(err => {});
            },
            goTo() {
                uni.redirectTo({
                    url: "/pages/pay-result/index?tranNo=" + this.tranNo + "&status=success"
                })
            },
            /* 本行卡支付 */
            // 获取验证码
            sendmessg: function(e) {
                console.log(Object.keys(this.hostpay).filter(k => k !== 'authCode'))
                for (let key of Object.keys(this.hostpay).filter(k => k !== 'authCode')) {
                    if (!this.validateEmpty(key)) {
                        return
                    }
                }

                var timer = 1;

                if (timer == 1) {
                    timer = 0;
                    var that = this;
                    var time = 60;

                    if (this.sendmsg == 'sendmsgafter') {
                        return;
                    }
                    this.SendValidateCode(); //本行卡
                    that.sendmsg = 'sendmsgafter';
                    that.codeColor = '#999999';
                    clearInterval(this.inter);
                    this.inter = setInterval(function() {
                        that.getmsg = time + 's后重发';

                        time--;
                        if (time < 0) {
                            timer = 1;
                            clearInterval(this.inter);
                            that.sendmsg = 'sendmsg';
                            that.getmsg = '获取验证码';
                            that.codeColor = '#333';
                        }
                    }, 1000);
                }
            },
            validateEmpty(field) {
                if (!this.hostpay[field]) {
                    this.tip(this.tipMap[field])
                } else {
                    return true
                }
            },
            tip(content) {
                uni.showModal({
                    title: '提示',
                    content,
                    showCancel: false,
                });
            },
            //本行卡 发送短信验证码
            SendValidateCode(e) {
                let params = {
                    phone: this.hostpay.phone,
                    bizType: 'HOSTPAY',
                };
                this.$api.post('/GetValidateCode', params).then(res => {
                    this.sended = true
                })
            },
            QjbankCardQuery(e) {
                if (!this.validateEmpty('authCode')) {
                    return
                }
                if (!this.sended) {
                    this.tip('请先获取验证码')
                    return
                }
                let param = {
                    ...this.hostpay,
                };
                this.$api.post('/QjbankCardQuery', params).then(res => {
                    // console.log('QjbankCardQuery--->', res)
                    if (res.cardList) {
                        this.hostList = res.cardList.map(v => {
                            return {
                                value: v.cardNo,
                                text: `卡号(${this.$tool.getAcctNoDescAllQHTwo(v.cardNo)})`
                            }
                        })
                        if (this.hostList.length) {
                            this.cardNo = this.hostList[0].value
                        }
                    }
                })
            },
            hostListChange(cardNo) {
                // console.log(cardNo, '----')
                this.cardNo = cardNo
            }
        }
    };
</script>
<style lang="scss" scoped>
    // page {
    //     overflow: auto;
    // }

    .all-pay {
        background-color: #f1f1f1;
        height: 100vh;
        --border-color: rgb(241, 241, 241);
        padding-top: 30rpx;
        position: relative;
    }

    .logo-img {
        width: 160rpx;
        margin-left: 40rpx;
    }

    .content-page {
        margin: 0 30rpx 100px 30rpx;
        background: #fff;
        padding: 6px;
        border-radius: 8px;
        min-height: 600rpx;
    }

    .original-amt {
        font-size: 30rpx;
        margin: 40rpx 0rpx 10rpx 0rpx;
        color: rgb(147, 18, 30);
        line-height: 0rpx;
        border-bottom: 4rpx solid rgb(147, 18, 30);
    }



    .pay-cell {
        height: 120rpx;
    }

    .cut-amt {
        color: rgb(147, 18, 30);
        font-size: 32rpx;
    }

    .bottom-wrap {
        border-radius: 16rpx 16rpx 0rpx 0rpx;
        background-color: rgba(150, 158, 184, 1);
        margin: 0rpx 30rpx;
        padding-bottom: 30rpx;
    }

    .sure-btn {
        /* width: 100%; */
        /* margin-top: -30rpx; */
        margin: -30rpx 30rpx 0rpx 30rpx;
        background-color: $uni-color-primary;
        height: 110rpx;
        line-height: 110rpx;
        text-align: center;
        border-radius: 8px;
        color: white;
        font-size: 32rpx;
        font-weight: bold;
        // box-shadow: 0px 4px 8px #999;
    }

    .operation-btn2 {
        width: 100%;
        background-color: rgba(255, 255, 255, 0);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .pay-time {
        margin-top: 20px;
        font-size: 24rpx;
        color: $uni-color-primary;
        height: 40rpx;
        line-height: 40rpx;

        .time-box {
            display: flex;
            justify-content: flex-end;
            flex: 1;
        }
    }

    .van-count-down {
        font-size: 24rpx;
        color: $uni-color-primary;
    }

    .logo-box {
        margin-top: 10px;
        margin-bottom: 20px;

        image {
            height: 32px;
            width: 260px;
        }
    }


    // 江氏银行卡支付
    .host_view {
        background: #ffffff;
        border-radius: 20rpx;
        box-sizing: border-box;
        // padding: 0 30rpx;
        padding: 0 16rpx;
        margin-top: 20rpx;
        width: 100%;
    }

    .row_view {
        padding: 20rpx 0;
        line-height: 50rpx;
        border-bottom: 0.5px solid var(--border-color);
        color: #333;

        .label {
            font-size: 14px;
        }
    }

    .row_view:last-of-type {
        border: none;
    }

    .title_Box {
        font-size: 32rpx;
        font-weight: bold;
        padding: 32rpx 0;
        border-bottom: 0.5px solid var(--border-color);
    }

    .weui-input {
        vertical-align: middle;
        padding-top: 4rpx;
        font-size: 16px;
    }

    .get-code-btn {
        text-align: right;
    }

    .weui-select {
        width: 100%;
        padding: 0;

        ::v-deep.uni-select__input-text {
            width: 340rpx;
        }
    }

    .btn-box {
        // position: absolute;
        // bottom: 160rpx;
        // left: 6%;
        width: 88%;
        height: 90rpx;
        border-radius: 10rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>