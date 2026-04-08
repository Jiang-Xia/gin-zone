<template>
    <view class="ca-upload-wrapper">
        <uni-file-picker
            limit="1"
            title=""
            @delete="deletePic"
            :image-styles="imageStyles"
            @select="selectHandle"
            :auto-upload="false"
            file-mediatype="image"
            :disabled="disabled"
        >
            <view class="upload-img">
                <view class="btn-content" v-if="!value">
                    <view class="placeholder">
                        <t-icon name="add" size="28" />
                        <text class="placeholder-text">{{ placeholderText }}</text>
                    </view>
                </view>
                <view v-if="disabled" class="disabled-mask" @tap.stop="onDisabledTap"></view>
            </view>
        </uni-file-picker>
    </view>
</template>

<script>
    import { pathToBase64 } from 'image-tools'
    export default {
        name: "caUpload",
        props: {
            value: {
                type: [String, Array],
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            disabledToast: {
                type: String,
                default: '',
            },
            type: {
                default: 'photo',
                type: String
            },
            multiple: {
                default: false,
                type: Boolean
            },
            maxCount: {
                default: 1,
                type: Number
            },
            widthStyle: {
                default: '302rpx',
                type: String
            },
            listIndex: {
                default: 0,
                type: Number
            },
            filePrivacyType: {
                default: '2',
                type: String
            },
            fileType: {
                default: '',
                type: String
            },
        },
        data() {
            return {
                imageStyles:{
                    // 和外层 .upload-img 的 384rpx × 236rpx 对齐，避免选中图片后布局跳变
                    width: 210,
                    height: 136,
                    border:{}
                },
                fileList: [],
                merchantId: '',
                customerId: '',
            };
        },
        computed: {
            innerValue: {
                get() {
                    // 上传成功
                    return this.value
                },
                set(value) {
                    this.$emit('update:value', value)
                    if (value) {
                        this.$emit('success', value)
                    }
                }
            }
            ,
            placeholderText() {
                const map = {
                    face: '上传身份证人像面',
                    nation: '上传身份证国徽面',
                    photo: '上传照片',
                    yyzz: '上传营业执照',
                    dnz: '上传许可/证明',
                    mtz: '上传门头照',
                    file: '上传文件',
                }
                return map[this.type] || '上传'
            }
        },
        created() {
            // 让 uni-file-picker 的缩略图尺寸与外层容器保持一致，避免上传完成后“抖动/跳变”
            try {
                if (typeof uni !== 'undefined' && typeof uni.upx2px === 'function') {
                    this.imageStyles = {
                        ...this.imageStyles,
                        width: uni.upx2px(384),
                        height: uni.upx2px(236),
                    }
                }
            } catch (e) {}

            if (this.value instanceof Array && this.value.length) {
                this.fileList = this.value.map(v => ({
                    url: v
                }))
            } else if (this.value) {
                this.fileList = [{
                    url: this.value
                }]
            }
        },
        methods: {
            onDisabledTap() {
                if (typeof this?.$toast === 'function') {
                    this.$toast(this.disabledToast || '当前不可上传')
                    return
                }
                if (this.$utils && typeof this.$utils.toast === 'function') {
                    this.$utils.toast(this.disabledToast || '当前不可上传')
                    return
                }
                uni.showToast({ title: this.disabledToast || '当前不可上传', icon: 'none' })
            },
            async selectHandle(e){
                if (this.disabled) {
                    this.onDisabledTap()
                    return
                }
                const tempFilePath = e.tempFilePaths[0]
                // 根据证件类型设置压缩参数，优化 OCR 识别效果
                const compressConfig = this.getCompressConfig(this.type)
                // 先压缩图片，再转换为 base64
                const compressResult = await new Promise((resolve, reject) => {
                    uni.compressImage({
                        src: tempFilePath,
                        ...compressConfig,
                        success: resolve,
                        fail: reject
                    })
                })
                const base64 = await pathToBase64(compressResult.tempFilePath)
                this.innerValue = base64
            },
            // 根据证件类型获取压缩配置
            getCompressConfig(type) {
                const configMap = {
                    face: { width: 600, quality: 60 },      // 身份证人像面
                    nation: { width: 600, quality: 60 },    // 身份证国徽面
                    photo: { width: 600, quality: 60 },     // 证件照
                    yyzz: { width: 800, quality: 60 },      // 营业执照
                    dnz: { width: 600, quality: 60 },       // 开户许可证
                    mtz: { width: 600, quality: 60 },       // 门头照
                    file: { width: 800, quality: 60 },      // 通用文件
                }
                return configMap[type] || { width: 600, quality: 60 }
            },
            // 删除图片
            deletePic() {
                this.innerValue = ''
            },
        }
    }
</script>

<style lang="scss">
    .ca-upload-wrapper {
        width: 100%;
        height: 100%;

        ::v-deep .upload-img {
            width: 384rpx;
            height:236rpx;
            position: relative;
            .btn-content, .image-content{
                width: 100%;
                height: 100%;
            }
            .placeholder{
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 12rpx;
                border-radius: 8px;
                background: #F5F5F5;
                border: 2rpx dashed var(--td-brand-color);
                color: rgba(0, 0, 0, 0.6);
            }
            .placeholder-text{
                font-size: 24rpx;
            }
            .image-content{
                image{
                    width: 100%;
                    height: 100%;
                }
            }
            .sampleText {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .addStyleContent {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                background: #F5F5F5;
                border: 2rpx dashed var(--td-brand-color);
            }

            .disabled-mask {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                background: transparent;
                z-index: 2;
            }

            image {
                width: 100%;
                height: 100%;
            }
        }
    }
</style>

