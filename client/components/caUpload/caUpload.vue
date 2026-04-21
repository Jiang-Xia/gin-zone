<template>
    <view class="ca-upload-wrapper">
        <uni-file-picker
            limit="1"
            title=""
            v-model="fileList"
            :del-icon="allowDelete"
            @delete="deletePic"
            :image-styles="pickerImageStyles"
            :disable-preview="true"
            @select="selectHandle"
            :auto-upload="false"
            file-mediatype="image"
            :disabled="disabled"
        >
            <view class="upload-img" :style="uploadBoxStyle">
                <view class="btn-content" v-if="!value">
                    <view class="placeholder" :style="placeholderStyle">
                        <!-- rect：按证件类型展示对应占位图标 -->
                        <image
                            v-if="scene === 'rect' && rectIconSrc"
                            class="rect-icon"
                            :src="rectIconSrc"
                            mode="aspectFit"
                        />
                        <!-- avatar：仅保留 + 号；rect 没找到 icon 时回退为 + 号 + 文案 -->
                        <t-icon v-else name="add" size="28" />
                        <text v-if="scene === 'rect' && !rectIconSrc" class="placeholder-text">{{ placeholderText }}</text>
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
                default: '302px',
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
            output: {
                // 输出类型：base64（默认，兼容旧逻辑）/ url（上传到服务器后返回可访问 URL）
                type: String,
                default: 'base64',
            },
            scene: {
                // 场景预设：rect（默认）/ avatar（圆形头像）
                type: String,
                default: 'rect',
            },
        },
        data() {
            return {
                fileList: [],
                merchantId: '',
                customerId: '',
            };
        },
        computed: {
            allowDelete() {
                // 中文注释：头像场景不提供“清除”入口，避免原型观感太重
                return this.scene !== 'avatar'
            },
            // 上传框尺寸（px）：JS 侧不再使用 rpx，避免多端换算差异
            boxPx() {
                return this.scene === 'avatar' ? 78 : 192
            },
            uploadBoxStyle() {
                return {
                    width: `${this.boxPx}px`,
                    height: this.scene === 'avatar' ? `${this.boxPx}px` : '110px',
                    borderRadius: '4px',
                }
            },
            // uni-file-picker 的图片样式配置（边框/圆角/尺寸必须走这里才能稳定生效）
            pickerImageStyles() {
                // 中文注释：avatar 场景不需要边框；rect 场景使用虚线边框
                let style = {
                    width: `${this.boxPx}px`,
                    height: `${this.boxPx}px`,
                }
                if(this.scene === 'avatar'){
                    style.border = false
                }else{
                    style.border = {
                        width: 1,
                        style: 'dashed',
                        color: '#bdbdbd',
                        radius: 4,
                    }
                    style.height = `110px`
                }
                return style
            },
            // 占位块样式（slot 内容可控，避免写 uni-file-picker 内部类名不生效）
            placeholderStyle() {
                if (this.scene === 'avatar') {
                    return {
                        ...this.uploadBoxStyle,
                        background: '#F2F3F5',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        color: 'rgba(0, 0, 0, 0.6)',
                    }
                }
                return {
                    with:'100%',
                    height:'100%',
                    background: '#F5F5F5',
                    // 中文注释：rect 场景边框统一交给 uni-file-picker 的 imageStyles.border 渲染，避免双边框/不一致
                    border: 'none',
                    color: 'rgba(0, 0, 0, 0.6)',
                }
            },
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
            },
            rectIconSrc() {
                if (this.scene !== 'rect') return ''
                // 中文注释：rect 场景适配各类证件/文件上传占位图标
                const map = {
                    face: '/packageA/static/images/components/upload/face.png',
                    nation: '/packageA/static/images/components/upload/nation.png',
                    photo: '/packageA/static/images/components/upload/photo.png',
                    file: '/packageA/static/images/components/upload/file.png',
                    yyzz: '/packageA/static/images/components/upload/yyzz.jpg',
                    dnz: '/packageA/static/images/components/upload/dnz.jpg',
                    mtz: '/packageA/static/images/components/upload/mtz.jpg',
                }
                const rel = map[this.type]
                if (!rel) return ''
                return this.$getImg(rel)
            }
        },
        created() {
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
            // 兼容 uni-file-picker 在 H5/APP/小程序的回调结构，拿到“可上传源”（File 或临时路径）
            getUploadSourceFromPickerEvent(e) {
                // 中文注释：本项目上传底层走 uni.uploadFile(filePath)，H5 传 File 会导致内部 indexOf 报错
                // 因此这里统一返回 string 类型的临时路径（H5 通常是 blob/http 临时地址）
                const filePath = e?.tempFilePaths?.[0]
                return typeof filePath === 'string' ? filePath : ''
            },
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
                // 头像/图片上传：支持输出 base64 或上传后 URL
                const tempFilePath = e?.tempFilePaths?.[0] || ''

                // output=url：上传到后端，输出可访问地址（适用于头像、群头像）
                if (this.output === 'url') {
                    // 中文注释：H5 用 File，其它端用临时路径，避免 H5 上传失败
                    const uploadSource = this.getUploadSourceFromPickerEvent(e)
                    if (!uploadSource) return
                    const res = await this.$api.upload(uploadSource)
                    const finalUrl = this.$fileUrl + res.data.url
                    this.fileList = [{ url: finalUrl }]
                    this.innerValue = finalUrl
                    return
                }

                // output=base64：走压缩 + base64（适用于 OCR、提交表单前端直传等）
                if (!tempFilePath) return
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
                this.fileList = [{ url: tempFilePath }]
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
                if (!this.allowDelete) return
                this.fileList = []
                this.innerValue = ''
            },
        }
    }
</script>

<style lang="scss">
    .ca-upload-wrapper {
        width: 100%;
        height: 100%;
        .upload-img {
            position: relative;
            .btn-content{
                width: 100%;
                height: 100%;
            }
        }

        .rect-icon {
            width: 100%;
            height: 100%;
        }

        .placeholder-text{
            font-size: 24rpx;
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
    }
</style>

