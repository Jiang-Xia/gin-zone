<template>
 <pageConfig title="发动态">
    <view class="container">
        <div class="main-content">
            <section class="main-wrap">
                <textarea v-model="info.content" rows="4" :border="false" autosize type="textarea" maxlength="500"
                    placeholder="说说这一刻的想法…" />
                <!-- show-word-limit -->
                <div class="uploader-wrap">
                    <!-- 统一上传组件：输出后端可访问 URL -->
                    <!-- 动态发布页上传图标沿用历史视觉资源 -->
                    <caUpload v-model:value="imageUrl" type="moment" output="url" />
                </div>

                <div class="footer-bar" @click="chooseLocation">
                    <text class="adress-text">
                        <uni-icons type="location" color="#999"></uni-icons> 地点
                    </text>
                    <text class="uni-ellipsis">
                        {{ info.address }}
                    </text>
                    <uni-icons type="right" color="#999"></uni-icons>
                </div>
                <div class="switch-row">
                    <text>允许评论</text>
                    <t-switch v-model:value="info.allowComment" />
                </div>
                <div class="switch-row">
                    <text>允许回复</text>
                    <t-switch v-model:value="info.allowReply" :disabled="!info.allowComment" />
                </div>
                <view class="btn-submit">
                    <t-button theme="primary" variant="base" block @click="addMoment">提交</t-button>
                </view>
            </section>
        </div>
    </view>
</pageConfig>
</template>

<script>
    import { useUserStore } from '@/stores/user.js'

    export default {
        data() {
            return {
                info: {
                    content: '',
                    address: '选择位置',
                    latitude: 0,
                    longitude: 0,
                    // 动态交互开关：默认允许评论和回复
                    allowComment: true,
                    allowReply: true
                },
                // 发布动态图片地址（caUpload 返回上传后的可访问 URL）
                imageUrl: '',
                locationInfo:{
                    latitude: 0,
                    longitude: 0
                }
            }
        },
        onLoad(option) {
            this.getLocation()
        },
        onPullDownRefresh() {},
        computed: {},
        methods: {
            // 获取定位信息
            getLocation() {
                this.$_getCurrentAddressByLocation().then(res => {
                    this.info.address = res.formattedAddress
                    if (res.locationInfo.address) {
                        const {
                            province,
                            city,
                            district,
                            street
                        } = res.locationInfo.address
                        this.locationInfo = res.locationInfo
                        this.info.address = province + city + district + street
                        console.log('success', this.info.address);
                    }
                })
            },
            // 选择位置
            chooseLocation() {
                uni.chooseLocation({
                    useSecureNetwork: true,
                    latitude: this.locationInfo.latitude,
                    longitude: this.locationInfo.longitude,
                    success: (res) => {
                        const {
                            latitude,
                            longitude,
                            name,
                            address
                        } = res
                        this.info.latitude = latitude;
                        this.info.longitude = longitude;
                        this.info.address = name || address
                    }
                });
            },
            // 打开地图
            openMap() {},
            async addMoment() {
                try {
                    const userStore = useUserStore()
                    if (!userStore?.token) {
                        // 注释：发布动态需要登录（与后端鉴权保持一致）
                        this.$common && this.$common.showLoginModal && this.$common.showLoginModal()
                        return
                    }
                    const params = {
                        content: this.info.content,
                        location: this.info.address,
                        urls: this.imageUrl,
                        // 发布时把互动开关同步到后端，便于客户端和管理台统一治理
                        allowComment: this.info.allowComment,
                        allowReply: this.info.allowComment ? this.info.allowReply : false,
                    }
                    if (!this.info.content) {
                        this.$toast("请填写动态内容")
                        return
                    }
                    if (!this.imageUrl) {
                        this.$toast("请上传图片")
                        return
                    }
                    // 发布动态：通过接口层创建
                    await this.$apis.moment.create(params)
                    uni.showToast({
                        title: "发表成功",
                        icon: "none"
                    })
                    uni.switchTab({
                        url: "/pages/moment/index"
                    })
                } catch (e) {
                    uni.showToast({
                        title: (e && e.msg) ? e.msg : '发表失败，请稍后重试',
                        icon: "none"
                    })
                }

            }
        }

    }
</script>

<style lang="scss">
    .container {
        .main-content {
            margin-top: 16rpx;
            background-color: $uni-white;
            padding: 28rpx 32rpx;

            .van-field {
                padding: 18px 0;
            }

            .van-field__word-limit {
                color: #999999;
            }

            .footer-bar {
                margin-top: 16px;
                padding: 14px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #333;
                font-size: 15px;
                border-bottom: 1px solid #eee;
                border-top: 1px solid #eee;

                .uni-ellipsis {
                    flex: 1;
                    text-align: right;
                }

                .adress-text {
                    padding-right: 18rpx;
                }

                .van-icon-arrow {
                    color: #999;
                }
            }

            .uploader-wrap {
                margin-top: 24rpx;
            }

            .switch-row {
                margin-top: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: #333;
            }
        }

        .btn-submit {
            margin-top: 56rpx;
        }
    }
</style>