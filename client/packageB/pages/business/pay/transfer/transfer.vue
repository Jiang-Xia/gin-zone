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
                pageUrl: '/packageB/pages/business/pay/transfer/transfer',
                baseUrl: 'https://jiang-xia.top/zone/',
                // 前端
            };
        },
        onLoad(options) {
            this.wx_appid = uni.getStorageSync('wx_appid')||options.wx_appid
            this.ali_appid = uni.getStorageSync('ali_appid')||options.ali_appid
            // console.log('options', options)
            uni.showLoading({
                title: "加载中",
                mask: true
            })
            let code = this.$tool.getQueryVariable('code') || options.auth_code;
            if (code) {
                console.log('授权码', code)
                uni.setStorageSync('userAuthCode', code);
                uni.reLaunch({
                    url: '/packageB/pages/business/pay/cashier/cashier'
                })
            } else {
                const timeStamp = options.timeStamp /* || '1751704174159' */
                if (timeStamp && Date.now() > Number(timeStamp)) {
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

            }
        }
    }
</script>

<style lang="scss" scoped>

</style>