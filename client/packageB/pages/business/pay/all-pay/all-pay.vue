<template>
    <view class="installmen-pay">
        <view class="content-page">
            <view class="flex-direction">
                <view class="logo-box">
                    <image src="/static/business/images/all-pay/logo.png"></image>
                </view>
                <view class="" style="font-size: 36rpx;font-weight: bold;margin-bottom: 6px">
                    {{ qrCodeInfo.storeBrief }}
                </view>
                <view class="flex-center" style="align-items: center; margin-top: 20rpx;line-height: 1;">
                    <view style="font-size: 40px; font-weight: 400; margin-bottom: 0px;color:#f6585d;">¥
                    </view>
                    <view class="amount" style="font-size: 40px;color:#f6585d;" v-if="randomcutFlag">
                        {{ moneyFormatter(pageInfo.amount) }}</view>
                    <view class="amount" style="font-size: 40px;color:#f6585d;"
                        v-else-if="pageInfo.payScene='WEB'&&pageInfo.batchNo&&pageInfo.batchNo.length!==6">
                        {{ moneyFormatter(pageInfo.realAmount) }}</view>
                    <view class="amount" style="font-size: 40px;color:#f6585d;" v-else>
                        {{ moneyFormatter(realAmt ? realAmt : pageInfo.amount) }}</view>

                </view>
                <view v-if="pageInfo.remark" style="font-size: 28rpx;margin-top: 6px;color: #999;">
                    {{ pageInfo.remark }}
                </view>



                <view class="flex-center title2 pay-time">
                    <view>支付剩余时间：</view>
                    <view class="time-box">
                        <text style="color: #333;font-size: 14px;" v-if="day">{{day}}天</text>
                        <uni-countdown :show-day="false" :hour="hour" :minute="minute" :second="second" />
                    </view>
                </view>

                <!-- 活动金额 中划线显示的是原金额 -->
                <view class="amount title3 original-amt" v-if="activity.activityName && !randomcutFlag"><text
                        class="value">{{ moneyFormatter(pageInfo.amount) }}</text></view>
                <view class="amount title3 original-amt" v-if="randomcutFlag"></view>
                <view class="title3" style="text-align: center;" v-if="activity.activityName"><text
                        class="value">{{ activity.activityName }}</text></view>
            </view>




            <radio-group @change="radioChange">
                <view class="pay-wrap">
                    <view class="pay-method" v-for="(item, index) in payTypeList" :key="item.value">
                        <view class="flex-between pay-cell">
                            <image style="width: 40rpx; height: auto" :src="item.iconImg" mode="widthFix"></image>
                            <view class="flex-between cell-right">
                                <view class="pay-title">{{ item.title }}</view>
                                <radio class="check-radio" :value="item.value"
                                    :checked="currentPayMethod === item.value" />
                            </view>
                        </view>
                        <view class="fen-qi"
                            v-if="item.value ===currentPayMethod&&['hb','xyk', 'jdbt'].includes(item.value)">
                            <fq-pay v-model="currentFQ" :amount="pageInfo.amount"></fq-pay>
                        </view>
                    </view>
                </view>
            </radio-group>
        </view>
        <view class="operation-btn2 operation-btn-top">
            <view style="width: 100%">
                <view class="flex-center sure-btn" @tap="sureTap">确认支付（¥
                    {{ moneyFormatter(realAmt ? realAmt : pageInfo.amount) }}）</view>
            </view>
        </view>
    </view>
</template>
<script>
    import fqPay from '../components/fq-pay/fq-pay.vue';
    export default {
        components:{
            fqPay,
        },
        data() {
            return {
                payType: '',
                payInfo: null,
                ip: '',
                params: {},
                currentPayMethod: 'zfb',
                currentFQ: 3,
                pageInfo: {
                    amount: 0,
                    remark: ''
                },
                orderInfo: {

                },

                // 活动
                realAmt: 0,
                activity: {
                    activityName: '',
                    activityNo: ''
                },
                randomcutFlag: false,

                // 支付剩余时间
                hour: 0,
                minute: 2,
                second: 59,
                day: 0,
                time: 3 * 60 * 1000,

                // 二维码信息
                qrCodeInfo: {
                    storeBrief: '糖果店'
                },
                userAuthCode: '',
                
            };
        },
        onLoad(options) {
            this.getIp()
            const payType = this.$tool.isWxOrAli() || 'ALIPAY'
            this.payType = payType
            this.pageInfo = {
                amount: Number(options.amount),
                remark: options.remark || '备注',
            }
            const qrcode = uni.getStorageSync('qrcode_no')
            this.getQrcodeInfo(qrcode)
            console.log('this.pageInfo', this.pageInfo)
            // 获取授权码
            this.userAuthCode = this.$tool.getQueryVariable('code') || options.auth_code || uni.getStorageSync('userAuthCode');
            // this.userAuthCode = '1111'
            // big-pay进来也换缓存
            uni.setStorageSync('userAuthCode', this.userAuthCode)
        },
        computed: {
            isAli() {
                return this.payType === 'ALIPAY'
            },
            isWx() {
                return this.payType === 'WXPAY'
            },
            payTypeList() {
                let list = [{
                        iconImg: '/static/business/images/all-pay/alipay.png',
                        title: '支付宝支付',
                        value: 'zfb',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/all-pay/huabeifenqi.png',
                        title: '花呗分期',
                        value: 'hb',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/all-pay/xinyongkafenqi.png',
                        title: '信用卡分期',
                        value: 'xyk',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/all-pay/jindong.png',
                        title: '京东白条',
                        value: 'jdbt',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/all-pay/weixin.png',
                        title: '微信支付',
                        value: 'wx',
                        desc: ''
                    },
                    {
                        iconImg: '/static/logo/person/jiang.png',
                        title: '江氏银行卡支付',
                        value: 'hostpay',
                        desc: ''
                    }
                ]
                const am = this.pageInfo.amount
                if (this.isAli) {
                    if (am >= 100 && am <= 4999.99) {
                        const sortNum = ['hb', 'xyk', 'zfb', 'hostpay']
                        list = this.sortPayType(sortNum, list)
                        this.currentPayMethod = 'hb'
                    } else if (am >= 5000) {
                        const sortNum = ['xyk', 'hb', 'zfb', 'hostpay']
                        list = this.sortPayType(sortNum, list)
                        this.currentPayMethod = 'xyk'
                    } else {
                        const sortNum = ['zfb', 'hostpay']
                        list = list = this.sortPayType(sortNum, list)
                        this.currentPayMethod = 'zfb'
                    }
                } else if (this.isWx) {
                    if (am >= 100) {
                        // 京东白条先隐藏
                        // const sortNum = ['jdbt', 'wx', 'hostpay']
                        // list = this.sortPayType(sortNum, list)
                        // this.currentPayMethod = 'jdbt'
                        const sortNum = ['wx', 'hostpay']
                        list = this.sortPayType(sortNum, list)
                        this.currentPayMethod = 'wx'
                    } else {
                        const sortNum = ['wx', 'hostpay']
                        list = list = this.sortPayType(sortNum, list)
                        this.currentPayMethod = 'wx'
                    }
                }
                console.log('payTypeList', list.map(v => v.title))
                return list
            }
        },
        methods: {
            // 排列支付方式
            sortPayType(sortNum, payList) {
                let list = sortNum.map(v => {
                    const item = payList.find(v2 => v2.value === v && sortNum.includes(v2.value))
                    return item
                })
                return list
            },
            moneyFormatter(arg) {
                return this.$tool.moneyFormatter2(arg)
            },
            sureTap() {
                // 本行卡支付
                if (this.currentPayMethod === 'hostpay') {
                    const params = {
                        ...this.qrCodeInfo,
                        userAuthCode: this.userAuthCode,
                        userAmount: this.realAmt || this.pageInfo.amount,
                        userIp: this.ip,
                        userRemark: this.pageInfo.remark
                    }
                    uni.navigateTo({
                        url: '/pages/host-pay/host-pay?qrCodeInfo='+JSON.stringify(pageInfo)
                    });
                    uni.redirectTo({
                        url: '/packageB/pages/business/pay/host-pay/host-pay?qrCodeInfo='+JSON.stringify(params)
                    });
                    return
                }
                this.applyOrder()
            },
            radioChange(e) {
                this.currentPayMethod = e.detail.value
                console.log('this.currentPayMethod ---->', this.currentPayMethod)
            },
            clickFenQi(value) {
                this.currentFQ = value
            },
            getQrcodeInfo(qrNo) {
                this.$tool.Post('admin.qrcode.GetQrcodeInfo', {
                    qrNo
                }, false, (data) => {
                    console.log(data, "二维码信息")
                    if (!data.action.qrInfo && !data.action.qrCodeInfoModel) {
                        uni.showModal({
                            title: '提示',
                            content: '二维码信息有误，请联系商家谨慎操作',
                            showCancel: false
                        });
                        return;
                    }
                    if (data.action.qrInfo) {
                        this.qrCodeInfo = data.action.qrInfo
                    }
                    this.ListMchtJoinActivity()
                });
            },


            /* 下单支付相关接口 开始*/
            applyOrder() {
                const amount = this.pageInfo.amount
                const mchtNo = this.qrCodeInfo.mchtNo
                const storeNo = this.qrCodeInfo.storeNo
                let params = {
                    version: '1.0',
                    mchtNo,
                    storeNo,
                    qrCodeNo: this.qrCodeInfo.qrcodeNo,
                    payScene: 'WEB',
                    payType: this.payType,
                    tradeNo: this.$tool.getYesterday('', 0) + this.$tool.guid(3),
                    currency: 'CNY',
                    amount,
                    remark: this.pageInfo.remark,
                    orderType: 'COMMON',
                    orderSubs: [{
                        subMchtNo: this.qrCodeInfo.mchtNo,
                        subOrderNo: 'S' + this.$tool.getYesterday('', 0) + this.$tool.guid(3),
                        goods: '商品',
                        storeNo: this.qrCodeInfo.storeNo,
                        amount
                    }]
                };
                this.$tool.Post('ApplyOrder', params, false, (data) => {
                    this.orderInfo.orderNo = data.orderNo
                    this.QueryOrder(mchtNo, data.orderNo)
                })
            },
            QueryOrder(mchtNo, orderNo) {
                let param = {
                    orderNo,
                    mchtNo
                };
                this.$tool.Post('QueryOrder', param, true, (data) => {
                    this.orderInfo.orderSubs = data.orderInfo.orderSubs
                    this.payOrder(mchtNo)
                })
            },
            payOrder(mchtNo) {
                const payType = this.payType
                const params = {
                    orderNo: this.orderInfo.orderNo,
                    storeNo: this.qrCodeInfo.storeNo,
                    orderSubs: this.orderInfo.orderSubs,
                    mchtNo,
                    payType,
                    bizType: 'JSAPI',
                }
                let tradeInfo = {
                    createIp: this.ip || '127.0.0.1',
                    code: this.userAuthCode
                }
                // 分期
                if(this.currentPayMethod === 'hb'){
                    params.tradeFqInfo = {fqChannels: "alipayfq", fqNum: this.currentFQ, fqSellerPercent: 0}
                }else if(this.currentPayMethod === 'xyk'){
                    params.tradeFqInfo = {fqChannels: "alipayfq_cc", fqNum : this.currentFQ , fqSellerPercent : 0,}
                }
                params.tradeInfo = tradeInfo
                this.$tool.Post('PayOrder', params, false, (res) => {
                    if (res.payInfo) {
                        this.payInfo = JSON.parse(res.payInfo);
                        this.payH5(this.payInfo)
                    }
                })
            },
            payH5(payInfo) {
                const goTo = () => {
                    // 跳转逻辑
                    uni.redirectTo({
                        url: '/pages/paystatus/index'
                    });
                }
                const type = this.payType
                console.log('type, payInfo', type, payInfo)
                switch (type) {
                    case 'WXPAY': //微信h5支付
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest', {
                                appId: payInfo.appId,
                                timeStamp: payInfo.timeStamp,
                                nonceStr: payInfo.nonceStr,
                                package: payInfo.package,
                                signType: payInfo.signType,
                                paySign: payInfo.paySign
                            },
                            function(res) {
                                if (res.err_msg == 'get_brand_wcpay_request:ok') {
                                    goTo()
                                } // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                if (res.err_msg == 'get_brand_wcpay_request:cancel') {
                                    uni.showModal({
                                        title: '提示',
                                        content: '支付失败：用户取消支付',
                                        showCancel: false,
                                        success: function(res) {
                                            if (res.confirm) {
                                                WeixinJSBridge.call('closeWindow');
                                            }
                                        }
                                    });
                                }
                            }
                        );
                        break;

                    case 'ALIPAY':

                        AlipayJSBridge.call(
                            'tradePay', {
                                tradeNO: payInfo.tradeNO
                            },
                            function(data) {
                                if ('9000' == data.resultCode) {
                                    goTo()
                                } else if (data.resultCode == '6001') {
                                    uni.showModal({
                                        title: '提示',
                                        content: '支付失败：用户取消支付',
                                        showCancel: false,
                                        success: function(res) {
                                            if (res.confirm) {
                                                //支付取消
                                                AlipayJSBridge.call('closeWebview');
                                            }
                                        }
                                    });

                                }
                            }
                        );
                        break;
                    default:
                        return false;
                }
            },
            getIp() {
                uni.request({
                    url: 'https://myip.ipip.net',
                    method: 'GET',
                }).then(res => {
                    // console.log('getIp', res)
                    res.data = res.data
                    this.ip = res.data.substring(res.data.indexOf("：") + 1, res.data.indexOf("来自于")).replace(
                        /\s/g, "");
                    console.log(this.ip)
                }).catch(err => {
                    console.log(err)
                })
            },
            /* 下单支付相关接口 结束*/

            /* 计算营销活动金额 开始 */
            //查询活动
            ListMchtJoinActivity() {
                let param = {
                    limit: 100,
                    offset: 0,
                    sign: true, //是否参与
                    activityStatus: 'PROCESSING',
                    status: 'ACTIVE',
                    mchtNo: this.qrCodeInfo.mchtNo,
                    storeNo: this.qrCodeInfo.storeNo,
                };
                this.$tool.Post('pub.checkActivity.queryCActivityByMcht', param, false, (res) => {
                    let list = res.action.list.data;
                    if (res.action.list.data.length > 0) {
                        this.ACalculateActivity(list[0]);
                    }
                });
            },
            //计算活动
            ACalculateActivity(activity) {
                let param = {
                    activityNo: activity.activityNo,
                    oriAmt: this.pageInfo.amount,
                    payScene: uni.getStorageSync('payScene') || 'WEB',
                    bizType: 'JSAPI',
                    payType: this.payType,
                    mchtNo: this.qrCodeInfo.mchtNo,
                    storeNo: this.qrCodeInfo.storeNo,
                };
                this.$tool.Post('ACalculateActivity', param, false, (res) => {
                    if (res.disAmt > 0) {
                        this.realAmt = res.amount;
                        this.activity = activity;
                        if (activity.publishParty == 'MCHT') {
                            uni.setStorageSync('mchtActivityNo', activity.activityNo);
                        } else if (activity.publishParty == 'BANK') {
                            uni.setStorageSync('bankActivityNo', activity.activityNo);
                        }
                        //判断是否是随机立减活动
                        this.randomcutFlag = false;
                        for (var i = 0; i < res.rules.length; i++) {
                            var activityType = res.rules[i].type;
                            if (activityType === 'RANDOMCUT') {
                                //随机立减
                                this.randomcutFlag = true;
                            }
                        }
                    }
                });
            },
            /* 计算营销活动金额 介绍 */

        }
    }
</script>

<style lang="scss">
    .installmen-pay {
        .logo-img {
            width: 160rpx;
            margin-left: 40rpx;
        }

        .content-page {
            margin: 30rpx;
            margin-top: 30rpx;
            margin-bottom: 100px;
            background: #fff;
            padding: 6px;
            border-radius: 8px;
            min-height: 600rpx;
            // min-height: 720rpx;
        }

        .pay-wrap {
            // margin-top: 20rpx;
            background-color: white;
            border-radius: 16rpx;
            padding: 30rpx 40rpx;
            // padding: 30rpx;
        }

        .pay-cell {
            // height: 120rpx;
        }

        .cell-right {
            flex: 1;
            height: 100rpx;
            border-bottom: 1rpx solid $uni-border-color2;
            margin-left: 20rpx;
        }

        .pay-title {
            font-size: 30rpx;
        }

        .check-radio {
            margin-right: 30rpx;
            transform: scale(0.82)
        }

        .sure-btn {
            margin: -30rpx 30rpx 0rpx 30rpx;
            background-color: $uni-color-primary;
            height: 110rpx;
            line-height: 110rpx;
            text-align: center;
            border-radius: 8px;
            color: white;
            font-size: 32rpx;
            font-weight: bold;
        }

        .operation-btn2 {
            width: 100%;
            background-color: rgba(255, 255, 255, 0);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .operation-btn-top {
            // padding-top: 200rpx;
        }

        .pay-time {
            margin-top: 20rpx;
            font-size: 24rpx;
            color: $uni-text-color;
            height: 40rpx;
            line-height: 40rpx;
            // margin-bottom: 50px;
        }

        .van-count-down {
            font-size: 24rpx;
            color: $uni-text-color;
        }

        .time-box {
            display: flex;
            justify-content: flex-end;
            // flex: 1;
        }

        .logo-box {
            margin-top: 10px;
            margin-bottom: 20px;

            image {
                height: 32px;
                width: 260px;
            }
        }

        // 营销金额
        .original-amt {
            font-size: 30rpx;
            margin: 20rpx 0rpx 10rpx 0rpx;
            color: rgb(147, 18, 30);
            line-height: 0rpx;
            border-bottom: 4rpx solid rgb(147, 18, 30);
            margin-left: -16rpx;
        }
    }
</style>