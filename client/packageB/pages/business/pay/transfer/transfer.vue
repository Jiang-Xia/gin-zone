<template>
    <view>
        <!-- 中转页 -->
    </view>
</template>

<script>
    export default {
        data() {
            return {
                wx_appid: '', //测试环境公众号
                ali_appid: '', //测试环境公众号
                pageUrl: '/packageB/pages/transfer/transfer ',
                baseUrl: 'https://jiang-xia.top/zone/',
                // 前端
            };
        },
        onLoad(options) {
            this.wx_appid = uni.getStorageSync('wx_appid')
            this.ali_appid = uni.getStorageSync('ali_appid')
            console.log('options', options)
            uni.showLoading({
                title: "加载中",
                mask: true
            })
            const payType = this.$tool.isWxOrAli()
            if (options.code) {
                this.$uni.post({
                    url: this.$url.rsa + 'GetOpenid',
                    data: {
                        payType,
                        code: options.code,
                    },
                }).then(res => {
                    uni.setStorageSync('user_openid', res.openid);
                    uni.redirectTo({
                        url: '/pages/manual/index'
                    })
                    uni.hideLoading()
                }).catch(() => {
                    uni.hideLoading()
                })
            } else {
                const timeStamp = options.timeStamp /* || '1751704174159' */
                if(timeStamp && Date.now() > Number(timeStamp)){
                    uni.showModal({
                        title: '提示',
                        content: '二维码已过期',
                        showCancel: false,
                        success: function(res) {}
                    });
                    return
                }
                this.initPage()
            }
        },
        methods: {
            initPage() {
                const url = this.baseUrl + this.pageUrl
                const payType = this.$tool.isWxOrAli()
                if (payType == 'WXPAY') {
                    window.location.replace(
                        'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
                        this.wx_appid +
                        '&redirect_uri=' +
                        url +
                        '&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
                    );
                } else if (payType == 'ALIPAY') {
                    window.location.replace(
                        'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=' +
                        this.ali_appid +
                        '&scope=auth_base&redirect_uri=' +
                        url
                    );
                } else {
                    uni.showModal({
                        title: '提示',
                        content: '请使用合作平台客户端扫码',
                        showCancel: false,
                        success: function(res) {}
                    });
                    uni.hideLoading();
                }

            },
            // 微信内置浏览器或者支付宝内置浏览器调起支付控件
            payH5(payInfo) {
                const type = this.$tool.isWxOrAli()
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
                                    uni.redirectTo({
                                        url: '/pages/pay-result/index'
                                    });
                                    // window.location.href = "result.html";
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
                                    uni.redirectTo({
                                        url: '/pages/pay-result/index'
                                    });
                                    // window.location.href = "result.html";
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
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>