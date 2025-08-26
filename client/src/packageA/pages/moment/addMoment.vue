<template>
 <pageConfig title="发动态">
    <view class="container">
        <div class="main-content">
            <section class="main-wrap">
                <textarea v-model="info.content" rows="4" :border="false" autosize type="textarea" maxlength="500"
                    placeholder="说说这一刻的想法…" />
                <!-- show-word-limit -->
                <div class="uploader-wrap">
                    <uni-file-picker v-model="fileLists" limit="9" title="" :imageStyles="imageStyles"
                        @delete="deleteHandle" @select="select" ref="files">
                        <div class="zc-uploader-setting"></div>
                    </uni-file-picker>
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
                <view class="btn-submit">
                    <button size="default" type="primary" style="width: 100%;" @click="addMoment">提交</button>
                </view>
            </section>
        </div>
    </view>
</pageConfig>
</template>

<script>
    export default {
        data() {
            return {
                info: {
                    content: '',
                    address: '选择位置',
                    latitude: 0,
                    longitude: 0
                },
                imageStyles: {
                    border: {
                        color: 'transparent',
                        width: 1,
                        style: 'dashed',
                        radius: 2
                    }
                },
                fileLists: [],
                uploadList: []
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
                        this.info.address = province + city + district + street
                        console.log('success', this.info.address);
                    }
                })
            },
            // 选择位置
            chooseLocation() {
                uni.chooseLocation({
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
            select(imageRes) {
                imageRes.tempFilePaths.forEach((path, index) => {
                    this.uploadFile(path)
                })
            },
            deleteHandle(opt) {
                this.uploadList.splice(this.uploadList.findIndex(v => v.path === opt.tempFilePath), 1)
                // console.log(opt,this.uploadList)
            },
            async uploadFile(file) {
                const res = await this.$api.upload(file)
                this.uploadList.push({
                    path: file,
                    ...res.data
                })
                // console.log(this.uploadList)
                return res
            },
            async addMoment() {
                try {
                    const userId = getApp().globalData.userInfo.userId
                    const params = {
                        content: this.info.content,
                        location: this.info.address,
                        urls: this.uploadList.map(v => v.url).join(),
                        userId: userId,
                    }
                    if (!this.info.content || !this.fileLists.length) {
                        uni.showToast({
                            title: "请填写完整数据",
                            icon: "none"
                        })
                    }
                    const res = await this.$api.post('/mobile/moments', params)
                    uni.showToast({
                        title: "发表成功",
                        icon: "none"
                    })
                    uni.switchTab({
                        url: "/pages/moment/index"
                    })
                } catch (e) {

                }

            }
        }

    }
</script>

<style lang="scss">
    .container {
        .main-content {
            background-color: #fff;
            padding: 18px;

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

            .uni-file-picker__header {
                .file-title {
                    font-size: 24rpx;
                    color: #666;
                }
            }

            .file-picker__box-content {
                border: none !important;
            }

            .zc-uploader-setting {
                height: 100%;
                width: 100%;
                background-image: url(@/packageA/static/images/moment/ico_sc_tpsp@2x.png);
                background-size: contain;
            }
        }

        .btn-submit {
            margin-top: 56rpx;
        }
    }
</style>