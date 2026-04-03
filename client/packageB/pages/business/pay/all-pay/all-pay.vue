<template>
    <view class="installmen-pay">
        <view class="content-page">
            <view class="flex-direction">
                <view class="logo-box">
                    <image src="/static/business/images/pay/bank-logo.png"></image>
                </view>
                <view class="" style="font-size: 36rpx;font-weight: bold;margin-bottom: 6px">
                    {{ qrCodeInfo.storeBrief }}
                </view>
                <view class="flex-center" style="align-items: center; margin-top: 20rpx;line-height: 1;">
                    <view style="font-size: 40px; font-weight: 400; margin-bottom: 0px;color:#f6585d;">¥
                    </view>
                    <view class="amount" style="font-size: 40px;color:#f6585d;" v-if="randomcutFlag">
                        {{ moneyFormatter(pageInfo.amount) }}
                    </view>
                    <view class="amount" style="font-size: 40px;color:#f6585d;"
                        v-else-if="pageInfo.payScene='WEB'&&pageInfo.batchNo&&pageInfo.batchNo.length!==6">
                        {{ moneyFormatter(pageInfo.realAmount) }}
                    </view>
                    <view class="amount" style="font-size: 40px;color:#f6585d;" v-else>
                        {{ moneyFormatter(realAmt ? realAmt : pageInfo.amount) }}
                    </view>

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
                    {{ moneyFormatter(realAmt ? realAmt : pageInfo.amount) }}）
                </view>
            </view>
        </view>
    </view>
</template>
<script>
    import fqPay from '../components/fq-pay/fq-pay.vue';
    import {
        savePayOrderParams,
        applyOrder as applyOrderService,
        queryOrder as queryOrderService,
        payOrder as payOrderService,
        getQrcodeInfo as getQrcodeInfoService,
        listMchtJoinActivity as listMchtJoinActivityService,
        calculateActivity as calculateActivityService
    } from '@/packageB/services/payService.js';
    export default {
        components: {
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
                    storeBrief: ''
                },
                userAuthCode: '',
                // options: ''
            };
        },
        onLoad(options) {
            this.getIp()
            const payType = this.$tool.isWxOrAli() /* || 'ALIPAY' */
            this.payType = payType
            // this.options = options
            this.pageInfo = {
                amount: Number(options.amount),
                remark: options.remark || '备注',
            }
            const qrcode = uni.getStorageSync('qrcode_no')
            this.getQrcodeInfo(qrcode || 'SE00001602')
            console.log('this.pageInfo', this.pageInfo)
            // #ifdef H5
            // 获取授权码
            this.userAuthCode = this.$tool.getQueryVariable('code') || options.auth_code || uni.getStorageSync(
                'userAuthCode');
            // big-pay进来也换缓存
            uni.setStorageSync('userAuthCode', this.userAuthCode)
            // #endif
        },
        onshow(){
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
                        iconImg: '/static/business/images/pay/alipay.png',
                        title: '支付宝支付',
                        value: 'zfb',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/pay/huabeifenqi.png',
                        title: '花呗分期',
                        value: 'hb',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/pay/xinyongkafenqi.png',
                        title: '信用卡分期',
                        value: 'xyk',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/pay/jindong.png',
                        title: '京东白条',
                        value: 'jdbt',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/pay/weixin.png',
                        title: '微信支付',
                        value: 'wx',
                        desc: ''
                    },
                    {
                        iconImg: '/static/business/images/pay/js-pay.png',
                        title: '江氏银行卡支付',
                        value: 'hostpay',
                        desc: ''
                    }
                ]
                if (this.isAli) {
                    list = this.dealPay(list)
                } else if (this.isWx) {
                    const sortNum = ['wx', /* 'zfb', */ 'hostpay']
                    list = list = this.sortPayType(sortNum, list)
                    this.currentPayMethod = 'wx'
                } else if (!this.isAli && !this.isWx) { // 非支付宝和微信中(浏览器或者其他app环境中)
                    list = this.dealPay(list, ['wx'])
                }
                console.log('payTypeList', list.map(v => v.title))
                return list
            }
        },
        methods: {
            // 支付方式列表， wxpay 非支付宝和微信中传
            dealPay(list, wxpay = []) {
                const am = this.pageInfo.amount
                if (am >= 100 && am <= 4999.99) {
                    const sortNum = ['hb', 'xyk', 'zfb', ...wxpay, 'hostpay']
                    list = this.sortPayType(sortNum, list)
                    this.currentPayMethod = 'hb'
                } else if (am >= 5000) {
                    const sortNum = ['xyk', 'hb', 'zfb', ...wxpay, 'hostpay']
                    list = this.sortPayType(sortNum, list)
                    this.currentPayMethod = 'xyk'
                } else {
                    const sortNum = ['zfb', ...wxpay, 'hostpay']
                    list = list = this.sortPayType(sortNum, list)
                    this.currentPayMethod = 'zfb'
                }
                return list
            },
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
                // 非支付宝里都跳
                if ((!this.isAli && !this.isWx)/* ||this.isWx */) {
                    let type = 'WXPAY'
                    if(['xyk', 'hb', 'zfb',].includes(this.currentPayMethod)){
                        type = 'ALIPAY'
                        this.h5OpenMini(type)
                        return
                    }
                }
                // 本行卡支付
                if (this.currentPayMethod === 'hostpay') {
                    const params = {
                        ...this.qrCodeInfo,
                        userAuthCode: this.userAuthCode,
                        userAmount: this.realAmt || this.pageInfo.amount,
                        userIp: this.ip,
                        userRemark: this.pageInfo.remark
                    }
                    uni.redirectTo({
                        url: '/packageB/pages/business/pay/host-pay/host-pay?qrCodeInfo=' + JSON.stringify(
                            params)
                    });
                }else{
                    this.applyOrder()
                }
            },
            radioChange(e) {
                this.currentPayMethod = e.detail.value
                console.log('this.currentPayMethod ---->', this.currentPayMethod)
            },
            clickFenQi(value) {
                this.currentFQ = value
            },
            getQrcodeInfo(qrNo) {
                // 二维码信息入口：填充 qrCodeInfo，并驱动营销活动计算
                this.getQrcodeInfoAsync(qrNo)
            },
            async getQrcodeInfoAsync(qrNo) {
                // 获取二维码模型：后续需要 mchtNo/storeNo/qrcodeNo 用于串联下单
                const data = await getQrcodeInfoService(this.$tool, {
                    qrNo,
                    qrType: 'STATIC'
                })
                console.log(data, '二维码信息')

                if (!data?.action?.qrInfo && !data?.action?.qrCodeInfoModel) {
                    uni.showModal({
                        title: '提示',
                        content: '二维码信息有误，请联系商家谨慎操作',
                        showCancel: false
                    })
                    return
                }

                if (data?.action?.qrInfo) {
                    this.qrCodeInfo = data.action.qrInfo
                }

                await this.ListMchtJoinActivity()
            },


            /* 下单支付相关接口 开始*/
            async applyOrder() {
                uni.showLoading({
                    title:'支付中'
                })
                const mchtNo = this.qrCodeInfo.mchtNo
                const amount = this.pageInfo.amount

                const applyRes = await applyOrderService(this.$tool, {
                    amount,
                    qrCodeInfo: this.qrCodeInfo,
                    payType: this.payType,
                    remark: this.pageInfo.remark
                })

                this.orderInfo.orderNo = applyRes.orderNo
                await this.QueryOrder(mchtNo, applyRes.orderNo)
            },
            async QueryOrder(mchtNo, orderNo) {
                const data = await queryOrderService(this.$tool, {
                    mchtNo,
                    orderNo
                })
                this.orderInfo.orderSubs = data.orderInfo.orderSubs
                await this.payOrder(mchtNo)
            },
            async payOrder(mchtNo) {
                const res = await payOrderService(this.$tool, {
                    mchtNo,
                    storeNo: this.qrCodeInfo.storeNo,
                    orderNo: this.orderInfo.orderNo,
                    orderSubs: this.orderInfo.orderSubs,
                    payType: this.payType,
                    currentPayMethod: this.currentPayMethod,
                    currentFQ: this.currentFQ,
                    ip: this.ip,
                    userAuthCode: this.userAuthCode
                })

                if (res.payInfo) {
                    // this.payInfo = JSON.parse(res.payInfo);
                    this.payInfo = res.payInfo;
                    // #ifdef MP-ALIPAY || MP-WEIXIN
                    this.payMini(this.payInfo);
                    return
                    // #endif
                    this.payH5(this.payInfo);
                }
            },
            goto(status = 'PROCESSING') {
                // 跳转逻辑
                try {
                    savePayOrderParams({
                        status,
                        orderNo: this.orderInfo.orderNo,
                        mchtNo: this.qrCodeInfo.mchtNo,
                        amount: this.realAmt ? this.realAmt : this.pageInfo.amount,
                        storeName: this.qrCodeInfo.storeBrief || this.qrCodeInfo.storeName || ''
                    })
                } catch (e) {}
                uni.redirectTo({
                    url: '/packageB/pages/business/pay/status/status'
                });
            },
            payH5(payInfo) {
                const goTo = this.goto
                const type = this.payType
                console.log('type, payInfo', type, payInfo)
                // uni.showModal({
                //     title: '提示',
                //     content: '支付成功',
                //     showCancel: false,
                // });
                uni.hideLoading()
                return goTo()
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
            // 小程序内支付
            async payMini(type) {
                uni.showLoading({title: '加载中'})
                if (this.isAli) {
                    const params = {
                        out_trade_no: this.$tool.getYesterday('', 0) + this.$tool.guid(3),
                        subject: '商品',
                        buyer_open_id: uni.getStorageSync('userOpenId'),
                        total_amount: String(this.pageInfo.amount)
                    }
                    const res = await this.$apis.pay.tradeCreate(params)
                    uni.setStorageSync('payOutTradeNo', params.out_trade_no)
                    uni.requestPayment({
                        tradeNO: res.data.tradeNo,
                        success: (res) => {
                            if(res.resultCode === '9000'){
                                this.goto('SUCCESS')
                            }else{
                                this.goto('PROCESSING')   
                            }
                        },
                        complete: (res) => {
                            uni.hideLoading()
                        },
                    });
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
            async ListMchtJoinActivity() {
                // 查询商户侧活动列表：只取第一条参与计算（mock 数据结构约定）
                // 查找“商户侧”正在生效的营销活动，取第一条参与计算
                let param = {
                    limit: 100,
                    offset: 0,
                    sign: true, //是否参与
                    activityStatus: 'PROCESSING',
                    status: 'ACTIVE',
                    mchtNo: this.qrCodeInfo.mchtNo,
                    storeNo: this.qrCodeInfo.storeNo,
                };
                const res = await listMchtJoinActivityService(this.$tool, param)
                const list = res?.action?.list?.data || []
                if (list.length > 0) {
                    await this.ACalculateActivity(list[0])
                }
            },
            //计算活动
            async ACalculateActivity(activity) {
                // 计算活动后的实际支付金额 realAmt，并设置 randomcutFlag 决定展示方式
                let param = {
                    activityNo: activity.activityNo,
                    oriAmt: this.pageInfo.amount,
                    payScene: uni.getStorageSync('payScene') || 'WEB',
                    bizType: 'JSAPI',
                    payType: this.payType,
                    mchtNo: this.qrCodeInfo.mchtNo,
                    storeNo: this.qrCodeInfo.storeNo,
                };
                const res = await calculateActivityService(this.$tool, param)
                if (res?.disAmt > 0) {
                    this.realAmt = res.amount
                    this.activity = activity
                    if (activity.publishParty == 'MCHT') {
                        uni.setStorageSync('mchtActivityNo', activity.activityNo)
                    } else if (activity.publishParty == 'BANK') {
                        uni.setStorageSync('bankActivityNo', activity.activityNo)
                    }
                    // 判断规则里是否包含 RANDOMCUT：如果包含则使用随机立减金额展示
                    this.randomcutFlag = false
                    for (var i = 0; i < (res?.rules || []).length; i++) {
                        var activityType = res.rules[i].type
                        if (activityType === 'RANDOMCUT') {
                            this.randomcutFlag = true
                        }
                    }
                }
            },
            /* 计算营销活动金额 结束 */
            /* 唤起小程序 开始*/
            async h5OpenMini (type){
                try {
                    uni.showLoading({title: '加载中'})
                    const params = {
                        page: '/packageB/pages/business/pay/all-pay/all-pay',
                        query: {amount:this.pageInfo.amount,remark: this.pageInfo.remark}
                    }
                    const res = await this.$apis.pay.h5OpenMini(params)
                    uni.hideLoading()
                    // console.log(res, '------->')
                    // location.href = res.data.universalLink;
                    const schemeUrl = res.data.scheme
                      // #ifdef APP
                      plus.runtime.openURL(schemeUrl, (error) => {
                        if (error) {
                          console.error('唤起失败:', error);
                          uni.showToast({
                            title: '唤起失败或未安装支付宝',
                            icon: 'none'
                          });
                        }
                      });
                      // #endif
                      
                      // #ifndef APP
                      location.href = schemeUrl;
                      // #endif
                } catch (error) {
                    uni.hideLoading()
                }
            }
            /* 唤起小程序 结束*/
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
            background: $uni-white;
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
            border-bottom: 1rpx solid $uni-border-2;
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
            background-color: $uni-primary;
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
            color: $uni-main-color;
            height: 40rpx;
            line-height: 40rpx;
            // margin-bottom: 50px;
        }

        .van-count-down {
            font-size: 24rpx;
            color: $uni-main-color;
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