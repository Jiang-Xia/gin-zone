<template>
    <view class="main">
        <view class="tapin-container">
            <view class="flex-center"><img class="logo-img" src="/static/business/images/all-pay/bank-logo.png" />
            </view>
            <view class="flex-center title-name">{{ storeBrief }}</view>
            <view class="top-content">
                <view style="font-size: 30rpx;">付款金额(元)</view>
                <view class="flex-start item">
                    <view style="font-size: 60rpx;">¥</view>
                    <view id="input-amt">{{ inputamt }}</view>
                    <view class='cursor' v-if="!amount"></view>

                </view>
                <view style="font-size: 28rpx;color: rgb(100, 100, 100);margin-top: 10rpx;">添加备注(60字以内)</view>

                <view class="flex-start item">
                    <input class="cell-input" maxlength="60" id="mark" @input="onCommonBlur" :value="mark"
                        placeholder-style="color:#ddd" placeholder="请输入" />
                </view>
            </view>

            <view style="margin: auto;color: #aaa;font-size: 24rpx;text-align: center;font-weight: bold;">向商户付款</view>
            <view class="flex-center sure-btn" @tap="sureTap">立即支付</view>
        </view>

        <view class="keyboard">

            <table>
                <tr>
                    <td class="number" data-value="1" @tap="nubTap" value="1">1</td>
                    <td class="number" data-value="2" @tap="nubTap" value="2">2</td>
                    <td class="number" data-value="3" @tap="nubTap" value="3">3</td>
                    <td class="back-td" @tap="backTap">
                        <uni-icons class="back-btn" type="closeempty" size="30"></uni-icons>
                    </td>
                </tr>
                <tr>
                    <td class="number" data-value="4" @tap="nubTap" value="4">4</td>
                    <td class="number" data-value="5" @tap="nubTap" value="5">5</td>
                    <td class="number" data-value="6" @tap="nubTap" value="6">6</td>
                    <td rowspan="3" id="sure-btn" @tap="sureTap">支付</td>
                </tr>
                <tr>
                    <td class="number" data-value="7" @tap="nubTap" value="7">7</td>
                    <td class="number" data-value="8" @tap="nubTap" value="8">8</td>
                    <td class="number" data-value="9" @tap="nubTap" value="9">9</td>
                </tr>
                <tr>
                    <td class="number" data-value="0" @tap="nubTap" value="0">0</td>
                    <td class="number" data-value="." @tap="nubTap" value=".">·</td>
                    <td class="clear-btn" @tap="clearTap">清除</td>
                </tr>
            </table>
        </view>
    </view>
</template>

<script>
    let that = null
    let amt = ''
    export default {
        data() {
            return {
                inputamt: '',
                amount: '',
                mark: '',
                storeBrief: '',
                height: '',
                orderInfo: {},
                options: {},
                ip: '',
            };
        },
        onShow: function() {},
        onLoad: async function(options) {
            const userAuthCode = uni.getStorageSync('userAuthCode')
            console.log('-cashier-userAuthCode', userAuthCode)
            that = this
        },
        methods: {
            /*键盘点击事件**/
            backTap(e) {
                if (that.amount) {
                    return;
                }
                amt = amt.substr(0, amt.length - 1);
                if (amt == '') amt = '';
                that.inputamt = amt;
            },
            nubTap(e) {
                if (that.amount) {
                    return;
                }
                var value = e.currentTarget.dataset.value;
                if (amt == 0 && amt.indexOf('.') == -1) {
                    amt = that.inputamt == '00' ? '0' : value;
                } else {
                    amt = that.inputamt + value;
                }

                if (!isNaN(amt)) {
                    if (amt.indexOf('.') != -1) {
                        if (amt.split('.')[1].length > 2) {
                            amt = amt.substr(0, amt.length - value.length);
                            return;
                        }
                    }
                    if (parseFloat(amt).toFixed(2) > 999999) {
                        amt = amt.substr(0, amt.length - value.length);
                        return;
                    }
                    that.inputamt = amt;
                } else if (amt == '.') {
                    amt = '0.';
                    that.inputamt = amt;
                }
            },
            sureTap(e) {
                if (!amt || parseFloat(amt) <= 0) {
                    uni.showModal({
                        title: '提示',
                        content: '支付金额必须大于0，请核对金额后继续操作',
                        showCancel: false
                    });
                    return;
                }
                uni.navigateTo({
                    url: '/packageB/pages/business/pay/all-pay/all-pay?amount=' + this.inputamt + '&remark=' + this.mark
                })
            },
            onCommonBlur: function(e) {
                var key = e.target.id;
                that[key] = e.detail.value;
            },
        }
    };
</script>

<style lang="scss">
    page {
        height: 100%;
    }

    .main {
        position: relative;
        height: 100%;
    }

    .logo-img {
        height: 32px;
        width: 260px;
        margin-bottom: 10px;
    }

    .top-content {
        margin: 40rpx 0;
        border: 1px solid #eee;
        border-radius: 12rpx;
        padding: 30rpx;

    }

    .item {
        height: 100rpx;
        border-bottom: 1px solid #eee;
    }

    .cell-input {
        font-size: 30rpx;
        font-weight: bold;
        width: 100%;
    }

    #input-amt {
        color: $uni-color-primary;
        font-size: 70rpx;
        /* width: 150px; */
        margin-left: 20rpx;
        line-height: 100rpx;
        font-weight: 400;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .title-name {
        margin-top: 15rpx;

        font-size: 30rpx;
        font-weight: bold;
    }

    .back-amt {
        box-shadow: 0px 2px 2px #ddd;
        width: 100%;
        height: 110rpx;
        margin: 0px 0px 0px 0px;
        background-color: #ffffff;
    }

    .label-amt {
        color: #aaa;
        width: 120px;
        height: 100%;
        float: left;
        margin-left: 30rpx;
        line-height: 110rpx;
    }

    .logo {
        width: 100%;
        height: 50px;
        margin-top: 70px;
        text-align: center;
    }

    .logo img {
        width: 80px;
        height: 70px;
    }

    .keyboard {
        background-color: #ffffff;
        position: absolute;
        bottom: 0;
        width: 100%;
        box-shadow: 2px 0px 4px #aaa;
    }

    .keyboard .head {
        height: 45px;
        border-bottom: 1px solid #eee;
        color: #aaa;
    }

    .keyboard .head img {
        width: 15px;
        height: 15px;
        margin: 15px 10px 0px 15px;
        float: left;
    }

    .keyboard .head .head-text {
        height: 100%;
        line-height: 90rpx;
    }

    table {
        width: 100%;
        height: 80%;
        border-collapse: collapse;
    }

    tr {
        width: 100%;
        /* height: 140rpx; */
        height: 9vh;
        border-bottom: 1px solid #eee;
    }

    td {
        width: 25%;
        text-align: center;
        vertical-align: middle;
        font-family: 'microsoft yahei';
        font-size: 40rpx;
        font-weight: bold;
        border-right: 1px solid #eee;
    }

    #sure-btn {
        font-size: 38rpx;
        background: $uni-color-primary;
        color: #ffffff;
    }

    .sure-btn {
        margin: 10rpx 0rpx 0rpx 0rpx;
        height: 100rpx;
        color: white;
        border-radius: 16rpx;
        font-size: 32rpx;
        background: $uni-color-primary;
    }

    .back-btn {
        margin-top: 20rpx;
        width: 60rpx;
        height: 60rpx;
    }

    .clear-btn {
        font-size: 32rpx;
    }

    .cursor {
        width: 4rpx;
        height: 60rpx;
        background: #aaa;
        border-radius: 6rpx;
        opacity: 1;
        animation-name: donghua;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-duration: 0.5s;
        animation-direction: alternate;

    }

    @keyframes donghua {
        0% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }

    .tapin-container {
        margin: 15px;
        margin-top: 15px;
        margin-bottom: 100px;
        background: #fff;
        padding: 32rpx;
        border-radius: 8px;
        min-height: 312px;
    }
</style>