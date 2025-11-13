<template>
    <view class="webview-container">
        <image class="image" :src="bgUrl"></image>
        <web-view v-if="showWebView" :src="link" @message="message"></web-view>

        <uni-popup borderRadius="16px 16px 0 0" ref="popup" type="bottom" background-color="#fff" mask-background-color="rgba(0,0,0,0)"
            :is-mask-click="false">
            <view class="popupContent">
                <view class="listContent">
                    <button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" class="confirmBtn"
                        type="primary" size="default" block style="width: 100%; border-radius: 23px;"
                        :disabled="!checked">
                        登录
                    </button>

                    <view class="radioContent">
                        <checkbox-group @change="changeCheck">
                            <checkbox style="transform:scale(0.7);display: flex; align-items: center;" value="1">
                                <text class="label">我已阅读并同意</text>
                                <view class="agreementContent color-black-3 ">
                                    <text class="agreement color-base" @click.stop.prevent="openpdf(1)">《用户协议》</text>
                                    <text class="label">和</text>
                                    <text class="agreement color-base" @click.stop.prevent="openpdf(2)">《隐私政策》</text>
                                </view>
                            </checkbox>
                        </checkbox-group>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
    const fileUrl = 'https://admin.jiang-xia.top/test-front/files/'
    const webviewBaseUrl = 'https://jiang-xia.top'
    export default {
        components: {},
        data() {
            return {
                link: "",
                showWebView: false,
                loginVisible: false,
                locationData: {},
                checked: false,
                // bgUrl: fileUrl + '/images/bg3.png'
                bgUrl: fileUrl + '/images/bg2.jpeg'
            }
        },
        onLoad(options) {
            console.log('bgUrl', this.bgUrl)
        },
        onShow() {
            console.log('onShow', 'webview')
            this.init()
        },
        methods: {
            init() {
                uni.showLoading({
                    title: '加载中 ...',
                    mask: true
                })

                const phone = uni.getStorageSync('userPhone')
                if (!phone) {
                    // this.loginVisible = true
                    this.$nextTick(() => {
                        this.$refs.popup.open()
                    })
                }

                uni.getLocation({
                    geocode: false,
                    accuracy: false,
                    isHighAccuracy: false,
                    type: 'gcj02', // 返回可以用于uni.openLocation的经纬度
                    success: (res) => {
                        uni.hideLoading()
                        // 获取当前定位域值
                        let locationData = {
                            latitude: res.latitude,
                            longitude: res.longitude,
                        }
                        this.locationData = locationData
                        if (phone) {
                            this.setLink(phone)
                        }
                        console.log('locationData=====>', locationData)
                    },
                    fail: (err) => {
                        uni.hideLoading()
                        uni.showModal({
                            title: '提示',
                            content: '获取当前定位失败，请打开位置权限',
                            success() {
                                uni.openSetting()
                            }
                        })
                        console.error(err)
                    }
                })
            },

            changeCheck(e) {
                // console.log('e.detail.value', e.detail.value)
                this.checked = e.detail.value[0]
            },

            async getPhoneNumber(e) {
                console.log('手机号快捷登录')
                this.reqGb('code')
                if (e.detail.errMsg == 'getPhoneNumber:ok') {
                    // 用户点击了授权
                    const {
                        code
                    } = e.detail
                    this.reqGb(code)
                } else {
                    // 用户点击了拒绝授权
                    console.error('用户拒绝授权')
                }
            },

            login() {
                uni.login({
                    success: async (res) => {
                        if (res.code) {
                            const res1 = await this.$api.post('/WC0001', {
                                code: res.code
                            })
                        }
                    }
                })
            },

            async reqGb(code) {
                try {
                    this.loginDisabled = true
                    uni.showLoading({
                        title: '登录中 ...',
                        mask: true
                    })

                    const res2 = await this.$api.post('/WC0002', {
                        code
                    })

                    uni.setStorageSync('userPhone', res2.phone)
                    uni.setStorageSync('userPhoneSign', res2.sign)
                    this.setLink()
                    // this.loginVisible = false
                    this.$refs.popup.close()
                    uni.hideLoading()
                } catch (error) {
                    console.error(error)
                    uni.hideLoading()
                    this.loginDisabled = false
                }
            },

            setLink() {
                const userPhone = uni.getStorageSync('userPhone')
                const userPhoneSign = uni.getStorageSync('userPhoneSign')
                this.link =
                    `${webviewBaseUrl}?phone=${userPhone}&sign=${userPhoneSign}&lat=${this.locationData.latitude}&long=${this.locationData.longitude}`
                console.log('webviewAllUrl', this.link)
                this.showWebView = true
            },

            // 打开协议
            openpdf(type) {
                let url = fileUrl
                if (type === 1) {
                    url += 'user_service_agreement.pdf'
                } else if (type === 2) {
                    url += 'privacy_policy_user_agreement.pdf'
                }
                this.$common.openPdf(url)
            }
        }
    }
</script>
<style lang="scss">
    .webview-container {
        height: 100vh;

        .image {
            height: 100vh;
            width: 100%;
        }

        background-color: $uni-white;

        .popupContent {
            height: 25vh;

            .listContent {
                height: 100%;
                width: 100%;
                flex-direction: column;
                display: flex;
                align-items: center;
                padding: 62rpx 32rpx 60rpx;
                box-sizing: border-box;
            }

            .radioContent {
                margin-top: 28rpx;
                .agreementContent {
                    display: inline-block;
                }
                .label{
                    // color: $uni-white;
                }
                .agreement {
                    // color: red;
                }
            }
        }
    }
</style>